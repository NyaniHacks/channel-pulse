'use client';

import type { VideoStats } from '@/types';
import { formatCount, formatEngagement } from '@/lib/helpers';

interface Props {
  video: VideoStats;
  rank: number;
}

const TREND_CONFIG = {
  rising:  { label: '↑ Rising',  color: 'var(--green)',   bg: 'var(--green-soft)' },
  stable:  { label: '– Stable',  color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)' },
  cooling: { label: '↓ Cooling', color: 'var(--red)',    bg: 'var(--red-soft)' },
};

function ScorePill({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)';
  const bg = score >= 70 ? 'var(--green-soft)' : score >= 45 ? 'var(--amber-soft)' : 'var(--red-soft)';
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '12px',
      fontWeight: 500,
      padding: '3px 9px',
      borderRadius: '99px',
      background: bg,
      color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: '10px', opacity: 0.7 }}>Score</span>
      {score}
    </div>
  );
}

function EngagementBar({ rate }: { rate: number }) {
  // Visual bar: 10% engagement = full bar
  const pct = Math.min(rate / 0.10, 1) * 100;
  const color = rate >= 0.05 ? 'var(--green)' : rate >= 0.025 ? 'var(--amber)' : 'var(--red)';
  return (
    <div title={`Engagement rate — (likes + comments) ÷ views. Industry avg: 2–3%`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '48px', height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.3s ease' }} />
      </div>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {formatEngagement(rate)}
      </span>
    </div>
  );
}

export default function VideoCard({ video, rank }: Props) {
  const trend = TREND_CONFIG[video.trend];
  const isTop = rank === 0;
  const daysText = video.daysSincePublish === 0
    ? 'Today'
    : video.daysSincePublish === 1
    ? 'Yesterday'
    : `${video.daysSincePublish}d ago`;

  return (
    <div
      className="fade-up"
      style={{
        animationDelay: `${0.05 + rank * 0.04}s`,
        display: 'grid',
        gridTemplateColumns: 'auto 160px 1fr auto',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 16px',
        background: isTop ? 'rgba(124,106,247,0.04)' : 'var(--bg-card)',
        border: `1px solid ${isTop ? 'rgba(124,106,247,0.22)' : 'var(--border)'}`,
        borderLeft: isTop ? '3px solid var(--accent)' : `1px solid var(--border)`,
        borderRadius: '12px',
        transition: 'border-color 0.15s, background 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        if (!isTop) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)';
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)';
        }
      }}
      onMouseLeave={e => {
        if (!isTop) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
        }
      }}
    >
      {/* Rank */}
      <div style={{
        width: '28px',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        {isTop ? (
          <span style={{
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'block',
          }}>Top</span>
        ) : (
          <span style={{
            fontSize: '13px',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}>{rank + 1}</span>
        )}
      </div>

      {/* Thumbnail */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{ width: '160px', height: '90px', objectFit: 'cover', borderRadius: '8px', display: 'block', background: 'var(--bg)' }}
          loading="lazy"
        />
        {video.isShort && (
          <span style={{
            position: 'absolute', top: '5px', left: '5px',
            fontSize: '9px', fontWeight: 600, padding: '2px 5px',
            borderRadius: '4px', background: 'var(--red)', color: '#fff',
            letterSpacing: '0.04em',
          }}>
            SHORT
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
          marginBottom: '8px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {video.title}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {formatCount(video.views)} views
          </span>
          <EngagementBar rate={video.engagementRate} />
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {formatCount(video.likes)} likes
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {daysText}
          </span>
        </div>
      </div>

      {/* Score + trend */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        <ScorePill score={video.performanceScore} />
        <span style={{
          fontSize: '11px',
          fontWeight: 500,
          padding: '2px 7px',
          borderRadius: '99px',
          background: trend.bg,
          color: trend.color,
        }}>
          {trend.label}
        </span>
      </div>
    </div>
  );
}
