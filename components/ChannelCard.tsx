'use client';

import type { ChannelStats } from '@/types';
import { formatCount } from '@/lib/helpers';
import { BENCHMARKS } from '@/lib/mockData';

interface Props {
  channel: ChannelStats;
  isMockData: boolean;
}

function StatCard({
  label,
  value,
  badge,
  badgeType = 'neutral',
}: {
  label: string;
  value: string;
  badge?: string;
  badgeType?: 'green' | 'neutral' | 'amber';
}) {
  const badgeColors = {
    green: { bg: 'var(--green-soft)', color: 'var(--green)' },
    neutral: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' },
    amber: { bg: 'var(--amber-soft)', color: 'var(--amber)' },
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px 18px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {value}
      </div>
      {badge && (
        <div style={{
          marginTop: '6px',
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: '99px',
          background: badgeColors[badgeType].bg,
          color: badgeColors[badgeType].color,
        }}>
          {badge}
        </div>
      )}
    </div>
  );
}

export default function ChannelCard({ channel, isMockData }: Props) {
  const viewsBeat = channel.avgViewsLast30Days > BENCHMARKS.avgViewsPerUpload;
  const viewsDelta = Math.round(
    ((channel.avgViewsLast30Days - BENCHMARKS.avgViewsPerUpload) / BENCHMARKS.avgViewsPerUpload) * 100
  );

  return (
    <div className="fade-up" style={{ animationDelay: '0.05s' }}>
      {/* Channel identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <img
          src={channel.thumbnail}
          alt={channel.name}
          style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-focus)', flexShrink: 0 }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {channel.name}
            </h2>
            {isMockData && (
              <span style={{
                fontSize: '10px',
                fontWeight: 500,
                padding: '2px 7px',
                borderRadius: '99px',
                background: 'var(--amber-soft)',
                color: 'var(--amber)',
                border: '1px solid rgba(251,191,36,0.2)',
              }}>
                Demo data
              </span>
            )}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {channel.handle}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '10px',
      }}>
        <StatCard
          label="Subscribers"
          value={formatCount(channel.subscriberCount)}
          badge="Verified channel"
          badgeType="neutral"
        />
        <StatCard
          label="Avg. views / upload"
          value={formatCount(channel.avgViewsLast30Days)}
          badge={viewsBeat ? `+${viewsDelta}% vs benchmark` : `${viewsDelta}% vs benchmark`}
          badgeType={viewsBeat ? 'green' : 'amber'}
        />
        <StatCard
          label="Total videos"
          value={formatCount(channel.videoCount)}
          badge={`${channel.uploadFrequency}× per week`}
          badgeType="neutral"
        />
        <StatCard
          label="Channel views"
          value={formatCount(channel.totalViews)}
        />
      </div>
    </div>
  );
}
