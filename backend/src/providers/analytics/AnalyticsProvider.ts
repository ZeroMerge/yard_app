export interface RawProfileData {
  platform: string;
  handle: string;
  displayName?: string;
  bio?: string;
  followers?: number;
  following?: number;
  posts?: number;
  engagementRate?: number;
  profileImageUrl?: string;
}

export interface RawPostData {
  id: string;
  platform: string;
  caption?: string;
  likes?: number;
  comments?: number;
  views?: number;
  postedAt?: Date;
}

export interface AnalyticsProvider {
  name: string;
  fetchProfile(handle: string, platform: string): Promise<RawProfileData>;
  fetchRecentPosts(handle: string, platform: string, limit?: number): Promise<RawPostData[]>;
}
