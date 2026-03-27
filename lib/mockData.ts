import type { ChannelData } from '@/types';
import {
  calcEngagementRate,
  calcPerformanceScore,
  calcTrend,
  daysSince,
  parseDuration,
} from './helpers';

const RAW_VIDEOS = [
  {
    id: 'v1',
    title: 'Galaxy S25 Ultra: The Best Android Phone Ever Made',
    thumbnail: 'https://picsum.photos/seed/v1/320/180',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    views: 8_200_000,
    likes: 410_000,
    comments: 18_200,
    duration: 'PT18M42S',
  },
  {
    id: 'v2',
    title: 'I Switched to iPhone 16 Pro for 30 Days. Here\'s What Happened.',
    thumbnail: 'https://picsum.photos/seed/v2/320/180',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    views: 5_100_000,
    likes: 220_000,
    comments: 31_400,
    duration: 'PT22M15S',
  },
  {
    id: 'v3',
    title: 'Best MacBook Ever? M4 Pro Review',
    thumbnail: 'https://picsum.photos/seed/v3/320/180',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    views: 3_100_000,
    likes: 148_000,
    comments: 9_800,
    duration: 'PT15M30S',
  },
  {
    id: 'v4',
    title: 'The $200 Phone That Beats Flagships',
    thumbnail: 'https://picsum.photos/seed/v4/320/180',
    publishedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    views: 4_700_000,
    likes: 310_000,
    comments: 22_100,
    duration: 'PT12M08S',
  },
  {
    id: 'v5',
    title: 'AirPods Max 2 — Worth $549?',
    thumbnail: 'https://picsum.photos/seed/v5/320/180',
    publishedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    views: 2_400_000,
    likes: 98_000,
    comments: 14_200,
    duration: 'PT10M55S',
  },
  {
    id: 'v6',
    title: 'Every Phone Camera Tested: 2025 Edition',
    thumbnail: 'https://picsum.photos/seed/v6/320/180',
    publishedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    views: 6_800_000,
    likes: 390_000,
    comments: 27_500,
    duration: 'PT28M12S',
  },
  {
    id: 'v7',
    title: 'Galaxy S25 in 60 Seconds #shorts',
    thumbnail: 'https://picsum.photos/seed/v7/320/180',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    views: 12_000_000,
    likes: 820_000,
    comments: 11_200,
    duration: 'PT0M55S',
  },
  {
    id: 'v8',
    title: 'Most Satisfying Unboxing of 2025 #shorts',
    thumbnail: 'https://picsum.photos/seed/v8/320/180',
    publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    views: 3_200_000,
    likes: 198_000,
    comments: 4_400,
    duration: 'PT0M48S',
  },
  {
    id: 'v9',
    title: 'Why I Returned the Vision Pro',
    thumbnail: 'https://picsum.photos/seed/v9/320/180',
    publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    views: 1_400_000,
    likes: 72_000,
    comments: 19_800,
    duration: 'PT14M22S',
  },
  {
    id: 'v10',
    title: 'Tech I\'m Buying in 2025',
    thumbnail: 'https://picsum.photos/seed/v10/320/180',
    publishedAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    views: 1_800_000,
    likes: 86_000,
    comments: 12_100,
    duration: 'PT11M40S',
  },
  {
    id: 'v11',
    title: 'The Smartwatch Nobody Talked About',
    thumbnail: 'https://picsum.photos/seed/v11/320/180',
    publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    views: 980_000,
    likes: 41_000,
    comments: 6_200,
    duration: 'PT9M18S',
  },
  {
    id: 'v12',
    title: 'One UI 7 — Everything New in 90 Seconds #shorts',
    thumbnail: 'https://picsum.photos/seed/v12/320/180',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    views: 5_500_000,
    likes: 310_000,
    comments: 8_900,
    duration: 'PT1M28S',
  },
];

const AVG_VIEWS = Math.round(
  RAW_VIDEOS.reduce((s, v) => s + v.views, 0) / RAW_VIDEOS.length
);

function buildVideo(raw: typeof RAW_VIDEOS[0]) {
  const durationSeconds = parseDuration(raw.duration);
  const isShort = durationSeconds <= 60;
  const eng = calcEngagementRate(raw.likes, raw.comments, raw.views);
  const days = daysSince(raw.publishedAt);
  const score = calcPerformanceScore(raw.views, eng, days, AVG_VIEWS);
  const trend = calcTrend(raw.views, AVG_VIEWS);

  return {
    ...raw,
    durationSeconds,
    isShort,
    engagementRate: eng,
    performanceScore: score,
    trend,
    daysSincePublish: days,
  };
}

export function getMockData(): ChannelData {
  const videos = RAW_VIDEOS.map(buildVideo);
  const totalViews = videos.reduce((s, v) => s + v.views, 0);

  return {
    channel: {
      id: 'UCBcRF18a7Qf58cCRy5xuWwQ',
      name: 'Marques Brownlee',
      handle: '@MKBHD',
      description:
        'Quality tech videos for the high-quality geek. Respect the tech.',
      subscriberCount: 18_900_000,
      videoCount: 1_642,
      totalViews: 4_800_000_000,
      thumbnail: 'https://picsum.photos/seed/mkbhd/80/80',
      avgViewsLast30Days: AVG_VIEWS,
      uploadFrequency: 3,
    },
    videos,
    isMockData: true,
    fetchedAt: new Date().toISOString(),
  };
}

// Category benchmarks for badge comparisons
export const BENCHMARKS = {
  avgEngagementRate: 0.028,
  avgViewsPerUpload: 850_000,
  avgUploadFrequency: 2,
};
