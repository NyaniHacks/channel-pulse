'use client';

import type { SortKey, FilterKey } from '@/types';

interface Props {
  sort: SortKey;
  filter: FilterKey;
  onSort: (s: SortKey) => void;
  onFilter: (f: FilterKey) => void;
  total: number;
  shown: number;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'views', label: 'Views' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'score', label: 'Performance score' },
  { key: 'date', label: 'Publish date' },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All formats' },
  { key: 'longform', label: 'Long-form only' },
  { key: 'shorts', label: 'Shorts only' },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: active ? 500 : 400,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
        background: active ? 'var(--accent-soft)' : 'var(--bg-card)',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

export default function SortFilter({ sort, filter, onSort, onFilter, total, shown }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500, marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Sort
        </span>
        {SORTS.map(s => (
          <Chip key={s.key} active={sort === s.key} onClick={() => onSort(s.key)}>
            {s.label}
          </Chip>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500, marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Filter
        </span>
        {FILTERS.map(f => (
          <Chip key={f.key} active={filter === f.key} onClick={() => onFilter(f.key)}>
            {f.label}
          </Chip>
        ))}

        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>
          {shown} of {total}
        </span>
      </div>
    </div>
  );
}
