import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { RawSignal } from './signal.types';
import { PAYMENT_COMPLETED_WINDOW_DAYS } from './signal.config';

/**
 * LAYER 1 — Payment Signals
 *
 * Emits:
 *   PAYMENT_PROCESSING  — payment status in (payment_initiated, creator_payout_pending)
 *   PAYMENT_COMPLETED   — payment status = 'paid', within recency window
 *
 * Payments are chained records (parent → child → terminal).
 * We only surface terminal or latest-state records to avoid duplicates.
 * Query is scoped to creatorId via application join.
 *
 * One query. No N+1.
 */
@Injectable()
export class PaymentSignalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaymentSignals(creatorId: string): Promise<RawSignal[]> {
    const completedCutoff = new Date(
      Date.now() - PAYMENT_COMPLETED_WINDOW_DAYS * 24 * 3600 * 1000,
    );

    // Fetch only leaf-node payments (no child payments) to avoid chain duplication
    const payments = await this.prisma.payment.findMany({
      where: {
        application: { creatorId },
        childPayments: { none: {} },
        OR: [
          { status: { in: ['payment_initiated', 'creator_payout_pending'] } },
          { status: 'paid', createdAt: { gte: completedCutoff } },
        ],
      },
      include: {
        application: {
          include: {
            campaign: {
              select: {
                id: true,
                name: true,
                organization: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const signals: RawSignal[] = [];

    for (const payment of payments) {
      const campaign = payment.application.campaign;

      if (
        payment.status === 'payment_initiated' ||
        payment.status === 'creator_payout_pending'
      ) {
        signals.push({
          id: `payment_processing_${payment.id}`,
          type: 'PAYMENT_PROCESSING',
          entity: { type: 'payment', id: payment.id },
          occurredAt: payment.createdAt,
          deadlineAt: null,
          actionUrl: `/creator/work`,
          summary: {
            campaignId: campaign.id,
            campaignName: campaign.name,
            brandName: campaign.organization.name,
            amount: Number(payment.amount),
            currency: payment.currency,
          },
        });
      } else if (payment.status === 'paid') {
        signals.push({
          id: `payment_completed_${payment.id}`,
          type: 'PAYMENT_COMPLETED',
          entity: { type: 'payment', id: payment.id },
          occurredAt: payment.createdAt,
          deadlineAt: null,
          actionUrl: `/creator/work`,
          summary: {
            campaignId: campaign.id,
            campaignName: campaign.name,
            brandName: campaign.organization.name,
            amount: Number(payment.amount),
            currency: payment.currency,
          },
        });
      }
    }

    return signals;
  }
}
