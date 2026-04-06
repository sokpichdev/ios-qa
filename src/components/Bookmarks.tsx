// src/components/Bookmarks.tsx
import { useState, useEffect } from 'react';
import type { Question } from '../lib/questions';
import { CATEGORY_META } from '../lib/questions';
import { renderMarkdown } from '../lib/renderMarkdown';

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

  if (!loaded) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading bookmarks...</p>;
  }

  const bookmarked = questions.filter(q => bookmarkIds.includes(q.id));

  if (bookmarked.length === 0) return (
    <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: 40, marginBottom: 16 }}>🔖</p>
      <p style={{ fontSize: 16, marginBottom: 24 }}>No bookmarks yet.</p>
      <p style={{ fontSize: 14, marginBottom: 24 }}>Star questions in Browse to save them here.</p>
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
            <div key={q.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
                  }}
                >
                  <span style={{
                    fontSize: 11, background: meta.color + '22', color: meta.color,
                    padding: '2px 8px', borderRadius: 12, flexShrink: 0,
                  }}>{meta.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 500, fontSize: 15, lineHeight: 1.4 }}>{q.title}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                </button>

                <button
                  onClick={() => remove(q.id)}
                  title="Remove bookmark"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 16, padding: '14px 12px',
                    flexShrink: 0,
                  }}
                  aria-label={`Remove bookmark: ${q.title}`}
                >
                  ✕
                </button>
              </div>

              {isOpen && (
                <div style={{
                  padding: '0 16px 16px',
                  borderTop: '1px solid var(--border)',
                }}>
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
          );
        })}
      </div>
    </div>
  );
}
