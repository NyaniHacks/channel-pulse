'use client';

import { useState, useEffect, useRef } from 'react';
import type { SavedChannel } from '@/types';
import { extractChannelIdentifier } from '@/lib/youtube';

interface Props {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const DEMO_URL = 'https://www.youtube.com/@MKBHD';

export default function ChannelInput({ onAnalyze, isLoading }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<SavedChannel[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cp_saved_channels');
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRecent(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function validate(url: string): boolean {
    if (!url.trim()) {
      setError('Enter a YouTube channel URL to get started.');
      return false;
    }
    const id = extractChannelIdentifier(url);
    if (!id) {
      setError('Paste a valid YouTube channel URL — e.g. youtube.com/@channelname');
      return false;
    }
    setError('');
    return true;
  }

  function handleSubmit() {
    if (!validate(value)) return;
    onAnalyze(value.trim());
  }

  function handleDemo() {
    setValue(DEMO_URL);
    setError('');
    onAnalyze(DEMO_URL);
  }

  function handleRecent(ch: SavedChannel) {
    setValue(ch.url);
    setShowRecent(false);
    onAnalyze(ch.url);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input row */}
      <div className="relative flex gap-2">
        {/* Saved channels dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          {saved.length > 0 && (
            <>
              <button
                onClick={() => setShowRecent(v => !v)}
                title="Recent channels"
                style={{
                  height: '48px',
                  width: '44px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                ⌚
              </button>

              {showRecent && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '260px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-focus)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  zIndex: 50,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ padding: '8px 12px 6px', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Recent
                  </div>
                  {saved.map(ch => (
                    <button
                      key={ch.url}
                      onClick={() => handleRecent(ch)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <img src={ch.thumbnail} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{ch.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{ch.handle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); if (error) setError(''); }}
          onKeyDown={handleKey}
          placeholder="youtube.com/@channelname"
          spellCheck={false}
          style={{
            flex: 1,
            height: '48px',
            padding: '0 16px',
            background: 'var(--bg-input)',
            border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: '10px',
            color: 'var(--text-primary)',
            fontSize: '15px',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = error ? 'var(--red)' : 'var(--border-focus)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = error ? 'var(--red)' : 'var(--border)'; }}
        />

        {/* Run Analysis button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            height: '48px',
            padding: '0 20px',
            background: isLoading ? 'var(--accent-soft)' : 'var(--accent)',
            border: 'none',
            borderRadius: '10px',
            color: isLoading ? 'var(--accent)' : '#fff',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isLoading ? (
            <>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Pulling data…
            </>
          ) : 'Run Analysis'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--red)', paddingLeft: '2px' }}>
          {error}
        </p>
      )}

      {/* Demo link */}
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Not sure? </span>
        <button
          onClick={handleDemo}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'var(--font-sans)',
          }}
        >
          See a live example →
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
