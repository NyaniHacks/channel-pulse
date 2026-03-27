import type { VideoStats, InsightData } from '@/types';

// Parse ISO 8601 duration to seconds
// e.g. PT8M30S -> 510
export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0');
  const m = parseInt(match[2] || '0');
  const s = parseInt(match[3] || '0');
  return h * 3600 + m * 60 + s;
}

// Engagement rate = (likes + comments) / views
export function calcEngagementRate(likes: number, comments: number, views: number): number {
  if (views === 0) return 0;
  return (likes + comments) / views;
}

// Performance score (0–100):
// - 40% normalized views (relative to channel average)
// - 40% engagement rate (capped at 10% = perfect score)
// - 20% recency bonus (1 - daysSince/30, clamped 0-1)
export function calcPerformanceScore(
  views: number,
  engagementRate: number,
  daysSincePublish: number,
  avgViews: number
): number {
  const normalizedViews = avgViews > 0 ? Math.min(views / avgViews, 3) / 3 : 0;
  const normalizedEngagement = Math.min(engagementRate / 0.10, 1);
  const recencyBonus = Math.max(0, 1 - daysSincePublish / 30);

  const score = normalizedViews * 0.4 + normalizedEngagement * 0.4 + recencyBonus * 0.2;
  return Math.round(score * 100);
}

// Trend: compare views to channel average
// Rising > 1.3x avg, Cooling < 0.6x avg, else Stable
export function calcTrend(views: number, avgViews: number): VideoStats['trend'] {
  if (avgViews === 0) return 'stable';
  const ratio = views / avgViews;
  if (ratio >= 1.3) return 'rising';
  if (ratio <= 0.6) return 'cooling';
  return 'stable';
}

export function daysSince(isoDate: string): number {
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Format large numbers: 1200000 -> 1.2M
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function formatEngagement(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

// Day of week from ISO date
function getDayName(isoDate: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(isoDate).getDay()];
}

// Derive insights from video list
export function deriveInsights(videos: VideoStats[]): InsightData {
  if (videos.length === 0) {
    return {
      topFormat: 'Unknown',
      topFormatMultiplier: 1,
      bestDay: 'Unknown',
      bestDayLift: 0,
      engagementRank: 'average',
      topVideo: null,
      topVideoShare: 0,
      cadenceAlert: false,
      underperformCount: 0,
    };
  }

  const shorts = videos.filter(v => v.isShort);
  const longform = videos.filter(v => !v.isShort);
  const avgShortViews = shorts.length ? shorts.reduce((s, v) => s + v.views, 0) / shorts.length : 0;
  const avgLongViews = longform.length ? longform.reduce((s, v) => s + v.views, 0) / longform.length : 0;

  let topFormat = 'Long-form';
  let topFormatMultiplier = 1;
  if (shorts.length > 0 && longform.length > 0) {
    if (avgShortViews > avgLongViews) {
      topFormat = 'Shorts';
      topFormatMultiplier = parseFloat((avgShortViews / Math.max(avgLongViews, 1)).toFixed(1));
    } else {
      topFormat = 'Long-form';
      topFormatMultiplier = parseFloat((avgLongViews / Math.max(avgShortViews, 1)).toFixed(1));
    }
  } else if (shorts.length === 0) {
    topFormat = 'Long-form';
  } else {
    topFormat = 'Shorts';
  }

  // Best posting day
  const dayMap: Record<string, number[]> = {};
  videos.forEach(v => {
    const day = getDayName(v.publishedAt);
    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push(v.views);
  });
  const overallAvg = videos.reduce((s, v) => s + v.views, 0) / videos.length;
  let bestDay = 'Tuesday';
  let bestDayLift = 0;
  Object.entries(dayMap).forEach(([day, viewsList]) => {
    const avg = viewsList.reduce((a, b) => a + b, 0) / viewsList.length;
    const lift = ((avg - overallAvg) / overallAvg) * 100;
    if (lift > bestDayLift) {
      bestDayLift = lift;
      bestDay = day;
    }
  });

  // Engagement rank bucket
  const avgEng = videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length;
  let engagementRank = 'average';
  if (avgEng > 0.06) engagementRank = 'top 5%';
  else if (avgEng > 0.04) engagementRank = 'top 15%';
  else if (avgEng > 0.025) engagementRank = 'top 30%';

  // Top video
  const sorted = [...videos].sort((a, b) => b.views - a.views);
  const topVideo = sorted[0] || null;
  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const topVideoShare = topVideo ? Math.round((topVideo.views / totalViews) * 100) : 0;

  // Cadence alert: last 3 videos underperforming
  const last3 = [...videos].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 3);
  const last3Avg = last3.reduce((s, v) => s + v.views, 0) / last3.length;
  const cadenceAlert = last3Avg < overallAvg * 0.7;
  const underperformCount = last3.filter(v => v.views < overallAvg * 0.7).length;

  return {
    topFormat,
    topFormatMultiplier,
    bestDay,
    bestDayLift: Math.round(bestDayLift),
    engagementRank,
    topVideo,
    topVideoShare,
    cadenceAlert,
    underperformCount,
  };
}

// Generate highlight reel copy
export function generateHighlightReel(
  channelName: string,
  handle: string,
  videos: VideoStats[],
  insights: InsightData,
  avgViewsLast30Days: number,
  avgEngagement: number
): string {
  const uploadCount = videos.length;
  const topTitle = insights.topVideo?.title ?? 'N/A';
  const topViews = insights.topVideo ? formatCount(insights.topVideo.views) : 'N/A';
  const topEng = insights.topVideo ? formatEngagement(insights.topVideo.engagementRate) : 'N/A';

  return `${handle} published ${uploadCount} videos in the last 30 days, averaging ${formatCount(avgViewsLast30Days)} views per upload. Engagement rate sits at ${formatEngagement(avgEngagement)} — placing them in the ${insights.engagementRank} of channels this size. Top performing format: ${insights.topFormat}. Best upload: "${topTitle}" (${topViews} views, ${topEng} engagement). Posting cadence is consistent at ${insights.topFormat === 'Shorts' ? 'high frequency' : 'regular'} output.`;
}
