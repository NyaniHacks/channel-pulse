import type { ChannelData, VideoStats } from '@/types';
import {
  parseDuration,
  calcEngagementRate,
  calcPerformanceScore,
  calcTrend,
  daysSince,
} from './helpers';
import { getMockData } from './mockData';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE = 'https://www.googleapis.com/youtube/v3';

// Extract channel handle or ID from various URL formats:
// youtube.com/@handle, youtube.com/channel/UCxxx, youtube.com/c/name
export function extractChannelIdentifier(url: string): {
  type: 'handle' | 'id' | 'username';
  value: string;
} | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    const path = u.pathname;

    const handleMatch = path.match(/^\/@([^/]+)/);
    if (handleMatch) return { type: 'handle', value: `@${handleMatch[1]}` };

    const channelMatch = path.match(/^\/channel\/([^/]+)/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };

    const cMatch = path.match(/^\/c\/([^/]+)/);
    if (cMatch) return { type: 'username', value: cMatch[1] };

    const userMatch = path.match(/^\/user\/([^/]+)/);
    if (userMatch) return { type: 'username', value: userMatch[1] };

    // Bare handle typed without URL
    if (url.startsWith('@')) return { type: 'handle', value: url };
  } catch {
    // Not a valid URL — check if it's a bare @handle
    if (url.startsWith('@')) return { type: 'handle', value: url };
  }
  return null;
}

async function fetchChannelByHandle(handle: string) {
  const res = await fetch(
    `${BASE}/channels?part=snippet,statistics,contentDetails&forHandle=${handle.replace('@', '')}&key=${API_KEY}`
  );
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  if (!data.items?.length) throw new Error('Channel not found');
  return data.items[0];
}

async function fetchChannelById(id: string) {
  const res = await fetch(
    `${BASE}/channels?part=snippet,statistics,contentDetails&id=${id}&key=${API_KEY}`
  );
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  if (!data.items?.length) throw new Error('Channel not found');
  return data.items[0];
}

async function fetchChannelByUsername(username: string) {
  const res = await fetch(
    `${BASE}/channels?part=snippet,statistics,contentDetails&forUsername=${username}&key=${API_KEY}`
  );
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  if (!data.items?.length) throw new Error('Channel not found');
  return data.items[0];
}

// Fetch up to 50 video IDs from the uploads playlist
async function fetchUploadIds(playlistId: string, maxResults = 50): Promise<string[]> {
  const res = await fetch(
    `${BASE}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`
  );
  if (!res.ok) throw new Error(`Playlist fetch error: ${res.status}`);
  const data = await res.json();
  return (data.items ?? []).map((item: any) => item.contentDetails.videoId as string);
}

// Batch fetch video stats (max 50 IDs per request)
async function fetchVideoStats(ids: string[]): Promise<VideoStats[]> {
  const res = await fetch(
    `${BASE}/videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}&key=${API_KEY}`
  );
  if (!res.ok) throw new Error(`Video stats fetch error: ${res.status}`);
  const data = await res.json();

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentVideos = (data.items ?? []).filter(
    (item: any) => new Date(item.snippet.publishedAt).getTime() > thirtyDaysAgo
  );

  // We need avg views to compute scores — do a rough pass first
  const rawList = recentVideos.map((item: any) => ({
    views: parseInt(item.statistics.viewCount || '0'),
    likes: parseInt(item.statistics.likeCount || '0'),
    comments: parseInt(item.statistics.commentCount || '0'),
    publishedAt: item.snippet.publishedAt as string,
    duration: item.contentDetails.duration as string,
    id: item.id as string,
    title: item.snippet.title as string,
    thumbnail:
      item.snippet.thumbnails?.medium?.url ??
      item.snippet.thumbnails?.default?.url ?? '',
  }));

  const avgViews =
    rawList.length > 0
      ? rawList.reduce((s: number, v: any) => s + v.views, 0) / rawList.length
      : 0;

  return rawList.map((raw: any): VideoStats => {
    const durationSeconds = parseDuration(raw.duration);
    const isShort = durationSeconds > 0 && durationSeconds <= 60;
    const eng = calcEngagementRate(raw.likes, raw.comments, raw.views);
    const days = daysSince(raw.publishedAt);
    const score = calcPerformanceScore(raw.views, eng, days, avgViews);
    const trend = calcTrend(raw.views, avgViews);

    return {
      id: raw.id,
      title: raw.title,
      thumbnail: raw.thumbnail,
      publishedAt: raw.publishedAt,
      views: raw.views,
      likes: raw.likes,
      comments: raw.comments,
      duration: raw.duration,
      durationSeconds,
      isShort,
      engagementRate: eng,
      performanceScore: score,
      trend,
      daysSincePublish: days,
    };
  });
}

export async function fetchChannelData(url: string): Promise<ChannelData> {
  if (!API_KEY) {
    console.warn('No YouTube API key found — using mock data');
    return getMockData();
  }

  try {
    const identifier = extractChannelIdentifier(url);
    if (!identifier) throw new Error('Invalid channel URL');

    let channelRaw: any;
    if (identifier.type === 'handle') {
      channelRaw = await fetchChannelByHandle(identifier.value);
    } else if (identifier.type === 'id') {
      channelRaw = await fetchChannelById(identifier.value);
    } else {
      channelRaw = await fetchChannelByUsername(identifier.value);
    }

    const uploadsPlaylistId = channelRaw.contentDetails.relatedPlaylists.uploads;
    const videoIds = await fetchUploadIds(uploadsPlaylistId);
    const videos = await fetchVideoStats(videoIds);

    const avgViewsLast30Days =
      videos.length > 0
        ? Math.round(videos.reduce((s, v) => s + v.views, 0) / videos.length)
        : 0;

    return {
      channel: {
        id: channelRaw.id,
        name: channelRaw.snippet.title,
        handle: channelRaw.snippet.customUrl ?? identifier.value,
        description: channelRaw.snippet.description,
        subscriberCount: parseInt(channelRaw.statistics.subscriberCount || '0'),
        videoCount: parseInt(channelRaw.statistics.videoCount || '0'),
        totalViews: parseInt(channelRaw.statistics.viewCount || '0'),
        thumbnail:
          channelRaw.snippet.thumbnails?.medium?.url ??
          channelRaw.snippet.thumbnails?.default?.url ?? '',
        avgViewsLast30Days,
        uploadFrequency: Math.round((videos.length / 30) * 7 * 10) / 10,
      },
      videos,
      isMockData: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('YouTube API failed, falling back to mock data:', err);
    return getMockData();
  }
}
