'use client';

import type { VideoStats } from '@/types';
import { formatCount } from '@/lib/helpers';

interface Props {
  videos: VideoStats[];
}

export default function TopChart({ videos }: Props) {
  const top5 = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);
  const maxViews = top5[0]?.views ?? 1;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '20px 20px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          View leaders
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>top 5 uploads</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {top5.map((video, i) => {
          const pct = (video.views / maxViews) * 100;
          const isTop = i === 0;
          return (
            <div key={video.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{
                  fontSize: '12px',
                  color: isTop ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isTop ? 500 : 400,
                  maxWidth: '75%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}>
                  {video.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {formatCount(video.views)}
                </div>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: '99px',
                  background: isTop
                    ? 'var(--accent)'
                    : `color-mix(in srgb, var(--accent) ${Math.round(40 + pct * 0.4)}%, transparent)`,
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
