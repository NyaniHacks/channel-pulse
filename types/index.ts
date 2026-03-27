export interface ChannelStats {
  id: string;
  name: string;
  handle: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  thumbnail: string;
  avgViewsLast30Days: number;
  uploadFrequency: number; // uploads per week
}

export interface VideoStats {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string; // ISO string
  views: number;
  likes: number;
  comments: number;
  duration: string; // ISO 8601 duration e.g. PT8M30S
  durationSeconds: number;
  // Calculated fields
  engagementRate: number;
  performanceScore: number;
  trend: 'rising' | 'stable' | 'cooling';
  isShort: boolean;
  daysSincePublish: number;
}

export interface ChannelData {
  channel: ChannelStats;
  videos: VideoStats[];
  isMockData: boolean;
  fetchedAt: string;
}

export type SortKey = 'views' | 'engagement' | 'date' | 'score';
export type FilterKey = 'all' | 'shorts' | 'longform';

export interface InsightData {
  topFormat: string;
  topFormatMultiplier: number;
  bestDay: string;
  bestDayLift: number;
  engagementRank: string;
  topVideo: VideoStats | null;
  topVideoShare: number;
  cadenceAlert: boolean;
  underperformCount: number;
}

export interface SavedChannel {
  url: string;
  name: string;
  handle: string;
  thumbnail: string;
  savedAt: string;
}
