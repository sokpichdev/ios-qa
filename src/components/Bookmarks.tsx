// src/components/Bookmarks.tsx
import { useState, useEffect } from 'react';
import type { Question } from '../lib/questions';
import { CATEGORY_META } from '../lib/questions';
import { renderMarkdown } from '../lib/renderMarkdown';
import Icon from './Icon';

interface Props {
  questions: Question[];
  base: string;
}

function getStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

function setStorage(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function Bookmarks({ questions, base }: Props) {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [everOpened, setEverOpened] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBookmarkIds(getStorage<string[]>('ios-qa-bookmarks', []));
    setLoaded(true);
  }, []);

  function remove(id: string) {
    const next = bookmarkIds.filter(b => b !== id);
    setBookmarkIds(next);
    setStorage('ios-qa-bookmarks', next);
  }

  function toggleExpanded(id: string, isOpen: boolean) {
    setExpanded(isOpen ? null : id);
    if (!isOpen) setEverOpened(prev => new Set(prev).add(id));
  }

  if (!loaded) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading bookmarks...</p>;
  }

  const bookmarked = questions.filter(q => bookmarkIds.includes(q.id));

  if (bookmarked.length === 0) return (
    <div className="empty-state">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
      <p style={{ fontSize: 16 }}>No bookmarks yet.</p>
      <p style={{ fontSize: 14 }}>Star questions in Browse to save them here.</p>
      <a href={`${base}/browse`} className="btn btn-ghost" style={{ display: 'inline-flex' }}>
        Browse Questions
      </a>
    </div>
  );

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        {bookmarked.length} saved question{bookmarked.length !== 1 ? 's' : ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bookmarked.map(q => {
          const meta = CATEGORY_META[q.category];
          const isOpen = expanded === q.id;

          return (
            <div key={q.id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${meta.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => toggleExpanded(q.id, isOpen)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
                    minHeight: 44,
                  }}
                >
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: meta.color + '22', color: meta.color,
                    padding: '4px 8px', borderRadius: 12, flexShrink: 0,
                  }}><Icon name={meta.icon} size={13} /></span>
                  <span style={{ flex: 1, fontWeight: 500, fontSize: 15, lineHeight: 1.4 }}>{q.title}</span>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'inline-flex' }}>
                    <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} />
                  </span>
                </button>

                <button
                  onClick={() => remove(q.id)}
                  title="Remove bookmark"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 16, padding: '14px 12px',
                    flexShrink: 0, minHeight: 44,
                  }}
                  aria-label={`Remove bookmark: ${q.title}`}
                >
                  <Icon name="x" size={15} />
                </button>
              </div>

              <div className="collapse" data-open={isOpen}>
                <div className="collapse-inner">
                  {(isOpen || everOpened.has(q.id)) && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                      <div
                        className="answer-body"
                        style={{ marginTop: 16, lineHeight: 1.7, fontSize: 15 }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(q.body) }}
                      />
                      <div style={{ marginTop: 12 }}>
                        <a href={`${base}/questions/${q.id}`} className="btn btn-ghost" style={{ fontSize: 13 }}>
                          Full page →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
