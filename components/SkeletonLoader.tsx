export default function SkeletonLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Channel card skeleton */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: 14, width: '25%' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg)', borderRadius: '12px', padding: '16px' }}>
              <div className="skeleton" style={{ height: 10, width: '60%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: 24, width: '50%' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Insights skeleton */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
        <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: '18px' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '4px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 13, width: '85%', marginBottom: '6px' }} />
              <div className="skeleton" style={{ height: 11, width: '55%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Videos skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div className="skeleton" style={{ height: 13, width: '180px' }} />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: 'auto 160px 1fr auto',
            gap: '14px',
            padding: '12px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            alignItems: 'center',
          }}>
            <div className="skeleton" style={{ width: 24, height: 18 }} />
            <div className="skeleton" style={{ width: 160, height: 90, borderRadius: '8px' }} />
            <div>
              <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: 12, width: '50%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <div className="skeleton" style={{ height: 22, width: 64, borderRadius: '99px' }} />
              <div className="skeleton" style={{ height: 18, width: 52, borderRadius: '99px' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '-4px' }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Analyzing channel performance…
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
          Pulling recent videos, engagement metrics, and content trends
        </p>
      </div>
    </div>
  );
}
