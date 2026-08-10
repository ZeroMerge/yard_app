import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processProviderEvents() {
    // Retries & Dead-Letter Handling:
    // Process unprocessed events where retryCount < maxRetries and deadLetter = false
    const unprocessed = await this.prisma.providerEvent.findMany({
      where: {
        processed: false,
        deadLetter: false,
        retryCount: { lt: 3 },
      },
      take: 10,
    });

    if (unprocessed.length === 0) {
      return;
    }

    this.logger.log(`[JobsService] Ingesting & processing ${unprocessed.length} pending provider events`);

    for (const event of unprocessed) {
      try {
        await this.paymentsService.processEvent(event.id);
      } catch (err) {
        const nextRetry = event.retryCount + 1;
        const isDeadLetter = nextRetry >= event.maxRetries;

        this.logger.error(
          `[JobsService] Error processing provider event ${event.id} (Attempt ${nextRetry}/${event.maxRetries}): ${err.message}`,
        );

        await this.prisma.providerEvent.update({
          where: { id: event.id },
          data: {
            retryCount: nextRetry,
            deadLetter: isDeadLetter,
            errorLog: `Error: ${err.message} at ${new Date().toISOString()}`,
          },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async reconcilePayments() {
    try {
      await this.paymentsService.reconcilePendingPayments();
    } catch (err) {
      this.logger.error(`[JobsService] Failed to execute payment reconciliation cron: ${err.message}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkDeliveryDeadlines() {
    try {
      const now = new Date();
      const overdueCampaigns = await this.prisma.campaign.findMany({
        where: {
          deliveryDeadline: { lt: now },
          status: 'in_progress',
        },
      });

      if (overdueCampaigns.length > 0) {
        this.logger.log(`[JobsService] Detected ${overdueCampaigns.length} campaigns past delivery deadline`);
        for (const camp of overdueCampaigns) {
          await this.prisma.campaignActivity.create({
            data: {
              campaignId: camp.id,
              eventType: 'deadline_warning',
              body: `Campaign '${camp.name}' passed scheduled delivery deadline of ${camp.deliveryDeadline?.toISOString()}.`,
            },
          });
        }
      }
    } catch (err) {
      this.logger.error(`[JobsService] Failed to check delivery deadlines: ${err.message}`);
    }
  }
}
