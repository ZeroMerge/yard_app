import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { EvolutionApiProvider } from '../../providers/notifications/EvolutionApiProvider';
import { ApifyProvider } from '../../providers/analytics/ApifyProvider';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly evolutionApiProvider: EvolutionApiProvider,
    private readonly apifyProvider: ApifyProvider,
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

          // Fetch organization members to send WhatsApp warnings to the brand owners
          const members = await this.prisma.organizationMember.findMany({
            where: { organizationId: camp.organizationId },
            include: { user: true },
          });

          for (const member of members) {
            this.evolutionApiProvider.sendTextMessage({
              number: '2348000000000', // Mock number
              text: `⚠️ Alert: The campaign '${camp.name}' has missed its delivery deadline. Please check the dashboard.`,
            }).catch(err => this.logger.error('WhatsApp overdue alert failed', err));
          }
        }
      }
    } catch (err) {
      this.logger.error(`[JobsService] Failed to check delivery deadlines: ${err.message}`);
    }
  }

  // Set to run weekly (e.g. Sunday at midnight)
  @Cron(CronExpression.EVERY_WEEK)
  async pollApifyStats() {
    this.logger.log(`[JobsService] Running weekly Apify polling for unverified creators`);
    try {
      const creatorsToUpdate = await this.prisma.creatorSocialAccount.findMany({
        where: { creator: { verified: false } },
        take: 50, // Process in batches
      });

      for (const account of creatorsToUpdate) {
        if (account.platform === 'instagram') {
          const stats = await this.apifyProvider.fetchProfile(account.handle, account.platform);
          if (stats) {
            await this.prisma.socialMetricSnapshot.create({
              data: {
                creatorId: account.creatorId,
                platform: account.platform,
                followers: stats.followers,
                source: 'apify',
                capturedAt: new Date(),
              },
            });
          }
        }
      }
    } catch (err) {
      this.logger.error(`[JobsService] Failed Apify polling: ${err.message}`);
    }
  }
}
