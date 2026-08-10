import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyticsProvider, RawProfileData, RawPostData } from './AnalyticsProvider';

@Injectable()
export class ApifyProvider implements AnalyticsProvider {
  public readonly name = 'apify';
  private readonly logger = new Logger(ApifyProvider.name);
  private readonly apiToken: string;

  constructor(private readonly configService: ConfigService) {
    this.apiToken = this.configService.get<string>('APIFY_API_TOKEN', 'mock-apify-token');
  }

  async fetchProfile(handle: string, platform: string): Promise<RawProfileData> {
    this.logger.log(`[ApifyProvider] Fetching ${platform} profile for handle '@${handle}'`);
    return {
      platform,
      handle,
      displayName: `@${handle}`,
      bio: `Creator profile for ${handle} imported via Apify`,
      followers: 25400,
      following: 890,
      posts: 320,
      engagementRate: 4.85,
    };
  }

  async fetchRecentPosts(handle: string, platform: string, limit: number = 10): Promise<RawPostData[]> {
    this.logger.log(`[ApifyProvider] Fetching ${limit} recent ${platform} posts for handle '@${handle}'`);
    return Array.from({ length: limit }).map((_, i) => ({
      id: `post_${handle}_${i + 1}`,
      platform,
      caption: `Post caption #${i + 1} for campaign deliverable check`,
      likes: 1200 + i * 45,
      comments: 85 + i * 3,
      views: 18500 + i * 600,
      postedAt: new Date(Date.now() - i * 86400000),
    }));
  }
}
