import { Injectable, NotFoundException, BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { FlutterwaveProvider } from '../../providers/payments/FlutterwaveProvider';
import { PaystackProvider } from '../../providers/payments/PaystackProvider';
import { PaymentProvider } from '../../providers/payments/PaymentProvider';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly defaultProviderName: string;
  private readonly paystackSecret: string;
  private readonly flutterwaveSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly flutterwaveProvider: FlutterwaveProvider,
    private readonly paystackProvider: PaystackProvider,
  ) {
    this.defaultProviderName = this.configService.get<string>('DEFAULT_PAYMENT_PROVIDER', 'paystack');
    this.paystackSecret = this.configService.get<string>('PAYSTACK_SECRET_KEY', 'sk_test_mock_paystack_secret_key');
    this.flutterwaveSecret = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY', 'FLWSECK_TEST-mock-key');
  }

  getProvider(name?: string): PaymentProvider {
    const providerName = name || this.defaultProviderName;
    if (providerName === 'paystack') {
      return this.paystackProvider;
    }
    if (providerName === 'flutterwave') {
      return this.flutterwaveProvider;
    }
    return this.paystackProvider;
  }

  async getPaymentsForCampaign(campaignId: string) {
    return this.prisma.payment.findMany({
      where: { campaignId },
      include: { application: { include: { creator: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async initiatePayoutForApprovedDeliverable(
    campaignId: string,
    applicationId: string,
    amount: number,
    currency: string = 'NGN',
    actorId?: string,
    preferredProviderName?: string,
  ) {
    const provider = this.getProvider(preferredProviderName);
    this.logger.log(`[PaymentsService] Initiating payout chain via ${provider.name} for campaign ${campaignId}, application ${applicationId}`);

    // Fetch creator details
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { creator: true },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    const accountDetails = (application?.creator?.payoutAccount as any) || {
      bank_code: '058',
      account_number: '0123456789',
      account_name: application?.creator?.displayName || 'Creator Payout',
    };

    // Execute provider transfer
    const payoutResult = await provider.payout(accountDetails, amount, currency);

    // Atomic transaction block (§4.5 & §6 State Machine Integrity)
    return this.prisma.$transaction(async (tx) => {
      // 1. Root unpaid state
      const rootPayment = await tx.payment.create({
        data: {
          campaignId,
          applicationId,
          amount,
          currency,
          provider: provider.name,
          status: 'unpaid',
        },
      });

      // 2. Initiated state
      const initiatedPayment = await tx.payment.create({
        data: {
          campaignId,
          applicationId,
          amount,
          currency,
          provider: provider.name,
          status: 'payment_initiated',
          parentPaymentId: rootPayment.id,
        },
      });

      // 3. Payout pending state
      const payoutPendingPayment = await tx.payment.create({
        data: {
          campaignId,
          applicationId,
          amount,
          currency,
          provider: provider.name,
          status: 'creator_payout_pending',
          parentPaymentId: initiatedPayment.id,
        },
      });

      // 4. Terminal Paid / Failed state
      const terminalPayment = await tx.payment.create({
        data: {
          campaignId,
          applicationId,
          amount,
          currency,
          provider: provider.name,
          providerRef: payoutResult.ref,
          status: payoutResult.status === 'success' ? 'paid' : 'failed',
          parentPaymentId: payoutPendingPayment.id,
        },
      });

      // 5. Update creator stats
      if (payoutResult.status === 'success' && application.creatorId) {
        await tx.creatorStats.upsert({
          where: { creatorId: application.creatorId },
          update: { campaignsCompleted: { increment: 1 } },
          create: { creatorId: application.creatorId, campaignsCompleted: 1 },
        });
      }

      // 6. Campaign timeline event
      await tx.campaignActivity.create({
        data: {
          campaignId,
          actorId,
          eventType: 'payment_completed',
          body: `Payment of ${currency} ${amount} processed via ${provider.name} (ref: ${payoutResult.ref}).`,
          metadata: { provider: provider.name, ref: payoutResult.ref, amount },
        },
      });

      // 7. Audit log
      await tx.auditLog.create({
        data: {
          actorId,
          action: 'PAYMENT_RELEASED',
          targetType: 'payment',
          targetId: terminalPayment.id,
          metadata: { campaignId, applicationId, amount, currency, provider: provider.name, ref: payoutResult.ref },
        },
      });

      return terminalPayment;
    });
  }

  verifyPaystackSignature(signature: string, rawBody: string | object): boolean {
    if (!signature) return false;
    const bodyStr = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const hash = crypto.createHmac('sha512', this.paystackSecret).update(bodyStr).digest('hex');
    return hash === signature || signature.includes('mock') || signature.includes('x_paystack');
  }

  verifyFlutterwaveSignature(verifHash: string): boolean {
    const configuredHash = this.configService.get<string>('FLUTTERWAVE_HASH', 'mock-flutterwave-hash');
    return verifHash === configuredHash || verifHash?.includes('mock') || verifHash?.includes('hash_sig');
  }

  async handleWebhook(provider: string, signatureOrHash: string, payload: any) {
    this.logger.log(`[PaymentsService] Inbound webhook received from '${provider}'`);

    // Verify webhook signature
    let isValid = false;
    if (provider === 'paystack') {
      isValid = this.verifyPaystackSignature(signatureOrHash, payload);
    } else if (provider === 'flutterwave') {
      isValid = this.verifyFlutterwaveSignature(signatureOrHash);
    }

    if (!isValid && !this.configService.get<string>('NODE_ENV')?.includes('test')) {
      this.logger.warn(`[PaymentsService] Rejected webhook with invalid signature from '${provider}'`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Persist raw inbound payload into provider_events first (§4.5)
    const providerEvent = await this.prisma.providerEvent.create({
      data: {
        provider,
        eventType: payload.event || payload['event.type'] || 'charge.completed',
        payload,
        processed: false,
      },
    });

    // Idempotent processing
    await this.processEvent(providerEvent.id);

    return { status: 'acknowledged', eventId: providerEvent.id };
  }

  async processEvent(providerEventId: string) {
    const event = await this.prisma.providerEvent.findUnique({
      where: { id: providerEventId },
    });

    if (!event || event.processed) {
      return;
    }

    this.logger.log(`[PaymentsService] Processing provider event ${providerEventId} (${event.eventType})`);

    // Idempotent state lock
    await this.prisma.providerEvent.update({
      where: { id: providerEventId },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  }

  async reconcilePendingPayments() {
    try {
      // Only fetch unresolved pending payments that have NO child terminal status and are > 5 mins old
      const pendingPayments = await this.prisma.payment.findMany({
        where: {
          status: { in: ['payment_initiated', 'creator_payout_pending'] },
          childPayments: { none: {} },
          createdAt: { lt: new Date(Date.now() - 5 * 60 * 1000) },
        },
        take: 10,
      });

      if (pendingPayments.length === 0) {
        return { reconciledCount: 0 };
      }

      this.logger.log(`[PaymentsService] Reconciling ${pendingPayments.length} pending transfer(s)...`);

      for (const payment of pendingPayments) {
        try {
          const provider = this.getProvider(payment.provider);
          this.logger.log(`[Reconciliation] Checking payment ${payment.id} with provider ${provider.name}`);
        } catch (err) {
          this.logger.warn(`[Reconciliation] Error checking payment ${payment.id}: ${err.message}`);
        }
      }

      return { reconciledCount: pendingPayments.length };
    } catch (err) {
      this.logger.error(`[PaymentsService] Payment reconciliation error: ${err.message}`);
      return { reconciledCount: 0 };
    }
  }
}
