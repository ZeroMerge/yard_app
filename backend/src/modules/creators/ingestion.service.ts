import { Injectable, Logger, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';

export type JobType = 'PROFILE_SNAPSHOT' | 'POST_DISCOVERY' | 'COMMENT_COLLECTION' | 'VERIFY_TARGET';
export type Priority = 'HIGH' | 'LOW';

export interface DispatchJobOptions {
  creatorId: string;
  handle: string;
  platform: string;
  jobType?: JobType;
  priority?: Priority;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Dispatches a scrape job to the Python Ingestion Engine.
   * The Main Backend is the ONLY caller — it acts as the Source of Truth
   * that validates creator eligibility before the Ingestion Engine ever
   * hears about it ("Payload Trust" architecture).
   */
  async dispatchScrapeJob(options: DispatchJobOptions): Promise<{ jobId: string }> {
    const { creatorId, handle, platform, jobType = 'PROFILE_SNAPSHOT', priority = 'LOW' } = options;

    // 1. Verify the creator exists and is verified in our own DB (source of truth)
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new HttpException(`Creator ${creatorId} not found`, 404);
    }

    if (!creator.verified) {
      throw new HttpException(`Creator ${creatorId} is not verified. Cannot dispatch scrape job.`, 403);
    }

    // 2. Build the request payload
    const engineUrl = this.config.get<string>('INGESTION_ENGINE_URL', 'http://localhost:8000');
    const bearerToken = this.config.get<string>('INGESTION_API_BEARER_TOKEN');
    const webhookSecret = this.config.get<string>('INGESTION_WEBHOOK_SECRET');
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:3000');

    if (!bearerToken) {
      throw new HttpException('INGESTION_API_BEARER_TOKEN is not configured in the backend.', 500);
    }

    const payload = {
      target: handle,
      platform,
      job_type: jobType,
      priority,
      callback_url: `${backendUrl}/webhooks/ingestion`,
    };

    this.logger.log(`[IngestionService] Dispatching ${jobType} scrape for creator "${handle}" on ${platform}`);

    // 3. Fire the secure POST request to the Python engine with the Bearer Token
    const response = await fetch(`${engineUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`[IngestionService] Ingestion Engine rejected the job: ${response.status} — ${errorText}`);
      throw new HttpException(`Ingestion Engine error: ${errorText}`, response.status);
    }

    const data = (await response.json()) as { id: string; status: string; message: string };

    // 4. Record the scrape job in our own Prisma DB for tracking
    await this.prisma.scrapeJob.create({
      data: {
        creatorId,
        platform,
        jobType: jobType.toLowerCase(),
        status: 'queued',
      },
    });

    this.logger.log(`[IngestionService] Job accepted by Engine. Engine Job ID: ${data.id}`);
    return { jobId: data.id };
  }
}
