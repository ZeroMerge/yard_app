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
  oauthToken?: string; // Optional: passed when the creator has a connected OAuth account
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
    const { creatorId, handle, platform, jobType = 'PROFILE_SNAPSHOT', priority = 'LOW', oauthToken } = options;

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

    // 2. Look up the OAuth token for this specific platform account (if connected)
    //    This enables the Golden Path: official API instead of scraping.
    let resolvedToken: string | undefined = oauthToken;

    if (!resolvedToken) {
      const socialAccount = await this.prisma.creatorSocialAccount.findFirst({
        where: { creatorId, platform },
      });

      if (socialAccount?.oauthToken) {
        // Check if the token is still valid (not expired)
        const isExpired = socialAccount.tokenExpiresAt && socialAccount.tokenExpiresAt < new Date();
        if (!isExpired) {
          resolvedToken = socialAccount.oauthToken;
          this.logger.log(`[IngestionService] Found valid OAuth token for ${platform} — routing via Official API.`);
        } else {
          this.logger.warn(`[IngestionService] OAuth token for ${platform} is expired — falling back to scraper.`);
        }
      }
    }

    // 3. Build the request payload
    const engineUrl = this.config.get<string>('INGESTION_ENGINE_URL', 'http://localhost:8000');
    const bearerToken = this.config.get<string>('INGESTION_API_BEARER_TOKEN');
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:3000');

    if (!bearerToken) {
      throw new HttpException('INGESTION_API_BEARER_TOKEN is not configured in the backend.', 500);
    }

    const payload: Record<string, any> = {
      target: handle,
      platform,
      job_type: jobType,
      priority,
      callback_url: `${backendUrl}/webhooks/ingestion`,
    };

    // Only include oauth_token if we have one — never send null/undefined to the engine
    if (resolvedToken) {
      payload.oauth_token = resolvedToken;
    }

    this.logger.log(`[IngestionService] Dispatching ${jobType} scrape for creator "${handle}" on ${platform} (official_api=${!!resolvedToken})`);

    // 4. Fire the secure POST request to the Python engine with the Bearer Token
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

    // 5. Record the scrape job in our own Prisma DB for tracking
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

  /**
   * Fetches all connected social accounts for a creator and dispatches
   * a scrape job for each one simultaneously.
   */
  async dispatchRefreshAllJobs(creatorId: string): Promise<{ dispatchedJobs: string[], errors: string[] }> {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
      include: {
        socialAccounts: true
      }
    });

    if (!creator) {
      throw new HttpException(`Creator ${creatorId} not found`, 404);
    }

    if (!creator.verified) {
      throw new HttpException(`Creator ${creatorId} is not verified. Cannot dispatch scrape jobs.`, 403);
    }

    const accounts = creator.socialAccounts || [];
    
    if (accounts.length === 0) {
      return { dispatchedJobs: [], errors: ["Creator has no connected social accounts"] };
    }

    const dispatchedJobs: string[] = [];
    const errors: string[] = [];

    // Dispatch all jobs in parallel
    const promises = accounts.map(async (account) => {
      try {
        const target = account.handle || account.profileUrl;
        
        if (!target) {
          errors.push(`Failed to dispatch ${account.platform}: Missing both handle and profileUrl`);
          return;
        }
        
        const result = await this.dispatchScrapeJob({
          creatorId,
          handle: target,
          platform: account.platform,
          priority: 'LOW',
        });
        dispatchedJobs.push(result.jobId);
      } catch (e: any) {
        errors.push(`Failed to dispatch ${account.platform}: ${e.message}`);
      }
    });

    await Promise.all(promises);

    return { dispatchedJobs, errors };
  }
}
