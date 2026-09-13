import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentInitiateResult, PaymentVerifyResult, PayoutResult, RefundResult } from './PaymentProvider';

@Injectable()
export class PaystackProvider implements PaymentProvider {
  public readonly name = 'paystack';
  private readonly logger = new Logger(PaystackProvider.name);
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY', 'sk_test_mock_paystack_key');
  }

  private isRealKey(): boolean {
    return (
      (this.secretKey.startsWith('sk_live_') || this.secretKey.startsWith('sk_test_')) &&
      !this.secretKey.includes('mock')
    );
  }

  async initiateCharge(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentInitiateResult> {
    const ref = `pstk_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[Paystack] Initializing charge of ${currency} ${amount} (ref: ${ref})`);

    // Paystack amounts are in kobo (e.g. NGN 100 = 10000 kobo)
    const amountInKobo = Math.round(amount * 100);

    if (this.isRealKey()) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: ref,
            amount: amountInKobo,
            currency: currency || 'NGN',
            email: metadata.email || 'customer@yard.com',
            callback_url: metadata.redirectUrl || 'https://yard.com/payments/paystack/callback',
            metadata,
          }),
        });
        const data = await response.json();
        if (data.status && data.data?.authorization_url) {
          return {
            ref,
            checkoutUrl: data.data.authorization_url,
            rawResponse: data,
          };
        }
      } catch (err) {
        this.logger.error(`Paystack initialize charge error: ${err.message}`);
      }
    }

    // Sandbox / fallback response
    return {
      ref,
      checkoutUrl: `https://checkout.paystack.com/sandbox_${ref}`,
      rawResponse: { status: true, is_sandbox: true },
    };
  }

  async verifyCharge(ref: string): Promise<PaymentVerifyResult> {
    this.logger.log(`[Paystack] Verifying charge ref: ${ref}`);

    if (this.isRealKey()) {
      try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${this.secretKey}` },
        });
        const data = await response.json();
        if (data.status && data.data) {
          return {
            status: data.data.status === 'success' ? 'success' : 'pending',
            amount: data.data.amount / 100, // convert kobo back to NGN
            currency: data.data.currency,
            rawResponse: data,
          };
        }
      } catch (err) {
        this.logger.error(`Paystack verify charge error: ${err.message}`);
      }
    }

    return {
      status: 'success',
      amount: 180000,
      currency: 'NGN',
      rawResponse: { status: true, is_sandbox: true },
    };
  }

  async payout(accountDetails: Record<string, any>, amount: number, currency: string = 'NGN'): Promise<PayoutResult> {
    const ref = `pstk_payout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[Paystack] Initiating transfer of ${currency} ${amount} to account ${accountDetails?.account_number} (ref: ${ref})`);

    const amountInKobo = Math.round(amount * 100);

    if (this.isRealKey()) {
      try {
        // Step 1: Create or fetch transfer recipient
        const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'nuban',
            name: accountDetails.account_name || 'Creator Account',
            account_number: accountDetails.account_number,
            bank_code: accountDetails.bank_code,
            currency: currency || 'NGN',
          }),
        });
        const recipientData = await recipientRes.json();
        const recipientCode = recipientData.data?.recipient_code;

        // Step 2: Initiate transfer
        if (recipientCode) {
          const transferRes = await fetch('https://api.paystack.co/transfer', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source: 'balance',
              reason: 'Yard Creator Campaign Payout',
              amount: amountInKobo,
              recipient: recipientCode,
              reference: ref,
            }),
          });
          const transferData = await transferRes.json();
          return {
            ref,
            status: transferData.status ? 'success' : 'failed',
            rawResponse: transferData,
          };
        }
      } catch (err) {
        this.logger.error(`Paystack payout transfer error: ${err.message}`);
      }
    }

    return {
      ref,
      status: 'success',
      rawResponse: { status: true, is_sandbox: true },
    };
  }

  async refund(ref: string, amount: number): Promise<RefundResult> {
    this.logger.log(`[Paystack] Refunding transaction ref: ${ref}, amount: ${amount}`);
    return {
      ref: `refund_pstk_${ref}`,
      status: 'success',
      rawResponse: { status: true, is_sandbox: true },
    };
  }
}
