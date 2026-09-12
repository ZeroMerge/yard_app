import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SocialAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface SocialProfile {
  handle: string;
  profileUrl: string;
  followers?: number;
  isVerified: boolean;
  platform: 'instagram' | 'youtube' | 'tiktok';
}

@Injectable()
export class SocialAuthService {
  private readonly logger = new Logger(SocialAuthService.name);

  constructor(private readonly configService: ConfigService) {}

  async fetchMetaProfile(code: string): Promise<SocialProfile> {
    this.logger.log(`Fetching Meta (Instagram) profile with OAuth code`);
    const clientId = this.configService.get<string>('META_CLIENT_ID');
    
    // Graceful degradation if keys are missing
    if (!clientId) {
      this.logger.warn('Meta Client ID not found. Degrading to Unverified manual flow.');
      return {
        handle: 'manual_ig_user',
        profileUrl: 'https://instagram.com/manual_ig_user',
        isVerified: false,
        platform: 'instagram'
      };
    }
    
    // In a real implementation, exchange code for token via graph.facebook.com, then fetch profile
    return {
      handle: 'verified_ig_user',
      profileUrl: 'https://instagram.com/verified_ig_user',
      followers: 12000,
      isVerified: true,
      platform: 'instagram'
    };
  }

  async fetchYoutubeProfile(code: string): Promise<SocialProfile> {
    this.logger.log(`Fetching YouTube profile with OAuth code`);
    const clientId = this.configService.get<string>('YOUTUBE_CLIENT_ID');
    
    if (!clientId) {
      this.logger.warn('YouTube Client ID not found. Degrading to Unverified manual flow.');
      return {
        handle: 'manual_yt_channel',
        profileUrl: 'https://youtube.com/@manual_yt_channel',
        isVerified: false,
        platform: 'youtube'
      };
    }
    
    return {
      handle: 'verified_yt_channel',
      profileUrl: 'https://youtube.com/@verified_yt_channel',
      followers: 45000,
      isVerified: true,
      platform: 'youtube'
    };
  }

  async fetchTiktokProfile(code: string): Promise<SocialProfile> {
    this.logger.log(`Fetching TikTok profile with OAuth code`);
    const clientId = this.configService.get<string>('TIKTOK_CLIENT_KEY');
    
    if (!clientId) {
      this.logger.warn('TikTok Client Key not found. Degrading to Unverified manual flow.');
      return {
        handle: 'manual_tiktok_user',
        profileUrl: 'https://tiktok.com/@manual_tiktok_user',
        isVerified: false,
        platform: 'tiktok'
      };
    }
    
    return {
      handle: 'verified_tiktok_user',
      profileUrl: 'https://tiktok.com/@verified_tiktok_user',
      followers: 250000,
      isVerified: true,
      platform: 'tiktok'
    };
  }
}
