'use client';

import type { InsightData, VideoStats } from '@/types';
import { formatCount, formatEngagement } from '@/lib/helpers';

interface Props {
  insights: InsightData;
  avgEngagement: number;
  videos: VideoStats[];
}

function InsightRow({
  icon,
  text,
  action,
  label,
  type = 'neutral',
}: {
  icon: string;
  text: React.ReactNode;
  action?: string;
  label?: string;
  type?: 'positive' | 'warning' | 'neutral';
}) {
  const iconColors = {
    positive: 'var(--green)',
    warning: 'var(--amber)',
    neutral: 'var(--accent)',
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '13px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: '15px', color: iconColors[type], flexShrink: 0, lineHeight: 1.5 }}>
        {icon}
      </div>
      <div>
        {label && (
          <div style={{ fontSize: '10px', fontWeight: 600, color: iconColors[type], textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px', opacity: 0.8 }}>
            {label}
          </div>
        )}
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
          {text}
        </div>
        {action && (
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightPanel({ insights, avgEngagement, videos }: Props) {
  const {
    topFormat,
    topFormatMultiplier,
    bestDay,
    bestDayLift,
    engagementRank,
    topVideo,
    topVideoShare,
    cadenceAlert,
    underperformCount,
  } = insights;

  const topVideoTitle = topVideo?.title ?? 'N/A';

  // Rules-based recommendation — highest signal insight surfaced as a single action
  const recommendation = (() => {
    if (topFormatMultiplier >= 1.5) {
      return {
        headline: `Double down on ${topFormat} this month.`,
        body: `${topFormat} videos are outperforming ${topFormat === 'Shorts' ? 'long-form' : 'Shorts'} by ${topFormatMultiplier}×, and ${bestDay} uploads show the strongest engagement lift.`,
      };
    }
    if (cadenceAlert) {
      return {
        headline: 'Recent momentum is slipping — act now.',
        body: `The last ${underperformCount} upload${underperformCount > 1 ? 's' : ''} underperformed the 30-day average. Prioritise thumbnail quality and consistency before the next drop.`,
      };
    }
    if (topVideoShare > 30) {
      return {
        headline: 'Replicate the format of your top breakout video.',
        body: `One upload is carrying ${topVideoShare}% of monthly views. Study its structure — length, hook, and format — and use it as a template for the next 3 uploads.`,
      };
    }
    return {
      headline: `Publish on ${bestDay}s to maximise reach.`,
      body: `${bestDay} uploads average ${bestDayLift}% higher views. Consistent scheduling on this day is the lowest-effort, highest-return change available right now.`,
    };
  })();

  return (
    <div
      className="fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animationDelay: '0.15s',
      }}
    >
      {/* Recommendation card — the wow moment */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,106,247,0.12) 0%, rgba(124,106,247,0.04) 100%)',
        border: '1px solid rgba(124,106,247,0.25)',
        borderRadius: '14px',
        padding: '18px 20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          marginBottom: '10px',
        }}>
          <div style={{
            width: '18px', height: '18px',
            background: 'var(--accent)',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            flexShrink: 0,
          }}>
            ◈
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Recommendation
          </span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.4 }}>
          {recommendation.headline}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {recommendation.body}
        </div>
      </div>

      {/* Insights panel */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '18px 20px 4px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '2px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Channel intelligence
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            {videos.length} uploads analyzed
          </div>
        </div>

      {/* Winning Format */}
      <InsightRow
        icon="↑"
        type="positive"
        label="Winning Format"
        text={
          <>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{topFormat}</strong>
            {' '}is driving {topFormatMultiplier}× more views per upload — your audience rewards{' '}
            {topFormat === 'Shorts' ? 'brevity' : 'depth'}.
          </>
        }
        action={`Opportunity: increase ${topFormat === 'Shorts' ? 'short-form cadence' : '10–20 min deep-dive output'}`}
      />

      {/* Best Publishing Window */}
      <InsightRow
        icon="◎"
        type="positive"
        label="Best Publishing Window"
        text={
          <>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{bestDay} uploads</strong>
            {' '}average {bestDayLift}% higher reach — audience skews{' '}
            {['Monday', 'Tuesday', 'Wednesday'].includes(bestDay)
              ? 'mid-week, likely professional viewers'
              : 'weekend, likely casual viewers'}.
          </>
        }
        action={`Optimal window: ${bestDay} morning, 9–11am primary audience timezone`}
      />

      {/* Audience Response */}
      <InsightRow
        icon="★"
        type="positive"
        label="Audience Response"
        text={
          <>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {formatEngagement(avgEngagement)} engagement rate
            </strong>
            {' '}places this channel in the{' '}
            <strong style={{ color: 'var(--green)', fontWeight: 500 }}>{engagementRank}</strong>
            {' '}of channels at this size.
          </>
        }
      />

      {/* Top Breakout Video */}
      {topVideo && (
        <InsightRow
          icon="◆"
          type={topVideoShare > 30 ? 'warning' : 'positive'}
          label="Top Breakout Video"
          text={
            <>
              "{topVideoTitle.length > 50 ? topVideoTitle.slice(0, 50) + '…' : topVideoTitle}
              {'" is driving '}
              <strong style={{ color: topVideoShare > 30 ? 'var(--amber)' : 'var(--text-primary)', fontWeight: 500 }}>
                {topVideoShare}% of monthly views
              </strong>
              {topVideoShare > 30 ? ' — dominant outlier worth replicating.' : ' — healthy distribution across the month.'}
            </>
          }
          action={`${formatCount(topVideo.views)} views · ${formatEngagement(topVideo.engagementRate)} engagement rate`}
        />
      )}

      {/* Content Momentum */}
      {cadenceAlert && (
        <InsightRow
          icon="⚠"
          type="warning"
          label="Content Momentum"
          text={
            <>
              The last{' '}
              <strong style={{ color: 'var(--amber)', fontWeight: 500 }}>
                {underperformCount} upload{underperformCount > 1 ? 's' : ''}
              </strong>
              {' '}underperformed the 30-day average by 30%+ — posting consistency or thumbnail quality may be the cause.
            </>
          }
          action="Suggested action: A/B test thumbnails and title hooks on the next 2 uploads"
        />
      )}

      <div style={{ height: '14px' }} />
    </div>
    </div>
  );
}
