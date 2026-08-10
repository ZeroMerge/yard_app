import { Controller, Post, Body, Headers, HttpException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface IngestionWebhookPayload {
  job_id: string;
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL' | 'INVALID_TARGET';
  target: string;
  platform: string;
  observation?: {
    followers?: number;
    following?: number;
    posts?: number;
    engagement_rate?: number;
    bio?: string;
    display_name?: string;
    profile_image_url?: string;
  };
  quality_status?: string;
  quality_score?: number;
  error?: string;
  captured_at?: string;
}

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Post('ingestion')
  async handleIngestionWebhook(
    @Body() payload: IngestionWebhookPayload,
    @Headers('x-yard-signature') signature: string,
    @Headers('x-yard-timestamp') timestamp: string,
  ) {
    // 1. Verify HMAC signature — reject any payload that isn't from our Python Engine
    const webhookSecret = this.config.get<string>('INGESTION_WEBHOOK_SECRET', 'mock-ingestion-secret');

    if (!signature || !timestamp) {
      this.logger.warn('[Webhook] Missing signature or timestamp headers — rejecting request');
      throw new HttpException('Missing security headers', 401);
    }

    // Replay attack guard: reject webhooks older than 5 minutes
    const webhookAge = Date.now() - parseInt(timestamp, 10) * 1000;
    if (webhookAge > 5 * 60 * 1000) {
      this.logger.warn(`[Webhook] Stale webhook rejected. Age: ${Math.round(webhookAge / 1000)}s`);
      throw new HttpException('Webhook timestamp is too old (replay attack guard)', 401);
    }

    // Verify HMAC-SHA256 signature
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${JSON.stringify(payload)}`)
      .digest('hex');

    if (signature !== `sha256=${expectedSig}`) {
      this.logger.warn('[Webhook] HMAC signature mismatch — rejecting request');
      throw new HttpException('Invalid webhook signature', 401);
    }

    this.logger.log(`[Webhook] Received verified ingestion result for target="${payload.target}" platform="${payload.platform}" status="${payload.status}"`);

    // 2. Find the creator by their social handle + platform
    if (payload.status === 'COMPLETED' && payload.observation) {
      const socialAccount = await this.prisma.creatorSocialAccount.findFirst({
        where: {
          handle: { equals: payload.target, mode: 'insensitive' },
          platform: payload.platform,
        },
        include: { creator: true },
      });

      if (!socialAccount) {
        this.logger.warn(`[Webhook] No creator found with handle "${payload.target}" on "${payload.platform}". Skipping DB write.`);
        return { received: true, stored: false };
      }

      // 3. Write the new social metric snapshot (append-only — NEVER update, only insert)
      const obs = payload.observation;
      await this.prisma.socialMetricSnapshot.create({
        data: {
          creatorId: socialAccount.creatorId,
          platform: payload.platform,
          followers: obs.followers ?? null,
          following: obs.following ?? null,
          posts: obs.posts ?? null,
          engagementRate: obs.engagement_rate ?? null,
          capturedAt: payload.captured_at ? new Date(payload.captured_at) : new Date(),
          source: 'apify',
        },
      });

      // 4. Update the scrape job status in our own DB
      await this.prisma.scrapeJob.updateMany({
        where: {
          creatorId: socialAccount.creatorId,
          platform: payload.platform,
          status: 'queued',
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      this.logger.log(`[Webhook] ✅ Metrics stored for creator "${socialAccount.creator.displayName}" (${socialAccount.creatorId})`);
      return { received: true, stored: true };
    }

    // Handle failed jobs
    if (payload.status === 'FAILED') {
      this.logger.error(`[Webhook] Ingestion job FAILED for target="${payload.target}": ${payload.error}`);
      return { received: true, stored: false, error: payload.error };
    }

    return { received: true, stored: false };
  }
}
