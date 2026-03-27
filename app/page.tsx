'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ChannelData, SortKey, FilterKey, SavedChannel } from '@/types';
import { fetchChannelData } from '@/lib/youtube';
import { deriveInsights, generateHighlightReel } from '@/lib/helpers';

import ChannelInput from '@/components/ChannelInput';
import ChannelCard from '@/components/ChannelCard';
import SortFilter from '@/components/SortFilter';
import VideoCard from '@/components/VideoCard';
import InsightPanel from '@/components/InsightPanel';
import TopChart from '@/components/TopChart';
import SkeletonLoader from '@/components/SkeletonLoader';
import HighlightReelModal from '@/components/HighlightReelModal';

export default function Home() {
  const [data, setData] = useState<ChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortKey>('views');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showReel, setShowReel] = useState(false);

  // Save channel to localStorage
  function saveChannel(d: ChannelData) {
    try {
      const raw = localStorage.getItem('cp_saved_channels');
      const existing: SavedChannel[] = raw ? JSON.parse(raw) : [];
      const entry: SavedChannel = {
        url: `https://www.youtube.com/${d.channel.handle}`,
        name: d.channel.name,
        handle: d.channel.handle,
        thumbnail: d.channel.thumbnail,
        savedAt: new Date().toISOString(),
      };
      // Deduplicate + keep last 5
      const updated = [entry, ...existing.filter(c => c.handle !== entry.handle)].slice(0, 5);
      localStorage.setItem('cp_saved_channels', JSON.stringify(updated));
    } catch {}
  }

  const handleAnalyze = useCallback(async (url: string) => {
    setIsLoading(true);
    setError('');
    setData(null);
    setSort('views');
    setFilter('all');

    try {
      const result = await fetchChannelData(url);
      setData(result);
      saveChannel(result);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sorted + filtered video list
  const displayVideos = useMemo(() => {
    if (!data) return [];
    let videos = [...data.videos];

    if (filter === 'shorts') videos = videos.filter(v => v.isShort);
    if (filter === 'longform') videos = videos.filter(v => !v.isShort);

    videos.sort((a, b) => {
      if (sort === 'views') return b.views - a.views;
      if (sort === 'engagement') return b.engagementRate - a.engagementRate;
      if (sort === 'score') return b.performanceScore - a.performanceScore;
      if (sort === 'date') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return 0;
    });

    return videos;
  }, [data, sort, filter]);

  const insights = useMemo(() => {
    if (!data) return null;
    return deriveInsights(data.videos);
  }, [data]);

  const avgEngagement = useMemo(() => {
    if (!data?.videos.length) return 0;
    return data.videos.reduce((s, v) => s + v.engagementRate, 0) / data.videos.length;
  }, [data]);

  const highlightReelText = useMemo(() => {
    if (!data || !insights) return '';
    return generateHighlightReel(
      data.channel.name,
      data.channel.handle,
      data.videos,
      insights,
      data.channel.avgViewsLast30Days,
      avgEngagement
    );
  }, [data, insights, avgEngagement]);

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      {/* Hero header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'var(--accent)',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}>
              ◈
            </div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Channel Pulse
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            30-day performance insights
          </span>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Hero */}
        {!data && !isLoading && (
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '99px',
              border: '1px solid var(--border-focus)',
              background: 'var(--accent-soft)',
              marginBottom: '20px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--accent)',
              letterSpacing: '0.02em',
            }}>
              <span style={{ fontSize: '8px' }}>●</span>
              Demo-ready · sample data always available
            </div>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}>
              See what's driving{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                competitor growth
              </span>
              {' '}on YouTube
            </h1>
            <p style={{
              fontSize: '17px',
              color: 'var(--text-secondary)',
              maxWidth: '500px',
              margin: '0 auto 36px',
              lineHeight: 1.65,
            }}>
              Paste any YouTube channel and instantly uncover top-performing videos, content patterns, and recent momentum — all in one clean view.
            </p>
            <ChannelInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        )}

        {/* Input when results shown */}
        {data && !isLoading && (
          <div style={{ marginBottom: '32px' }}>
            <ChannelInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        )}

        {/* Loading */}
        {isLoading && <SkeletonLoader />}

        {/* Error */}
        {error && (
          <div style={{
            padding: '18px 20px',
            background: 'var(--red-soft)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '12px',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--red)', marginBottom: '4px' }}>
              Couldn't analyze this channel live right now.
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              You can still explore the full experience using demo-ready sample data — click "See a live example →" below.
            </div>
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Channel overview */}
            <ChannelCard channel={data.channel} isMockData={data.isMockData} />

            {/* Snapshot label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-8px', marginBottom: '-8px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Snapshot · last 30 days · analyzed just now
              </span>
            </div>

            {/* Two column: insights + chart */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '16px',
              alignItems: 'start',
            }}>
              <InsightPanel
                insights={insights!}
                avgEngagement={avgEngagement}
                videos={data.videos}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <TopChart videos={data.videos} />

                {/* Generate Executive Summary */}
                <button
                  onClick={() => setShowReel(true)}
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: 'var(--accent)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.88';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                >
                  <span>◈</span>
                  Generate Executive Summary
                </button>

                {/* Export CSV */}
                <button
                  onClick={() => {
                    const headers = 'Title,Views,Likes,Comments,Engagement Rate,Performance Score,Trend,Published,Is Short\n';
                    const rows = data.videos.map(v =>
                      `"${v.title.replace(/"/g, '""')}",${v.views},${v.likes},${v.comments},${(v.engagementRate * 100).toFixed(2)}%,${v.performanceScore},${v.trend},${v.publishedAt},${v.isShort}`
                    ).join('\n');
                    const blob = new Blob([headers + rows], { type: 'text/csv' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${data.channel.handle}-channel-pulse.csv`;
                    a.click();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text-tertiary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                >
                  Download full data as CSV ↓
                </button>
              </div>
            </div>

            {/* Videos section */}
            <div className="fade-up" style={{ animationDelay: '0.25s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Content performance · last 30 days
                </h2>
              </div>

              <SortFilter
                sort={sort}
                filter={filter}
                onSort={setSort}
                onFilter={setFilter}
                total={data.videos.length}
                shown={displayVideos.length}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {displayVideos.length === 0 ? (
                  <div style={{
                    padding: '40px 32px',
                    textAlign: 'center',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      No uploads match this filter
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      Try switching to "All formats" to see the full picture
                    </div>
                  </div>
                ) : (
                  displayVideos.map((video, i) => (
                    <VideoCard key={video.id} video={video} rank={i} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showReel && (
        <HighlightReelModal
          text={highlightReelText}
          onClose={() => setShowReel(false)}
        />
      )}
    </main>
  );
}
