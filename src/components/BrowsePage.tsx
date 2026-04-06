// src/components/BrowsePage.tsx
import { useState, useMemo, useEffect } from 'react';
import type { Question } from '../lib/questions';
import { CATEGORIES, CATEGORY_META } from '../lib/questions';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

const DIFF_COLORS: Record<string, string> = {
  Beginner: '#10b981',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch { return fallback; }
}

function setStorage(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

interface Props {
  questions: Question[];
  base: string;
  initialCategory?: string;
}

export default function BrowsePage({ questions, base, initialCategory = 'all' }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    setStatuses(getStorage<Record<string, string>>('ios-qa-statuses', {}));
    setBookmarks(new Set(getStorage<string[]>('ios-qa-bookmarks', [])));

    // Read ?category from URL on mount
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return questions.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (activeDifficulty !== 'all' && item.difficulty !== activeDifficulty) return false;
      if (q && !item.title.toLowerCase().includes(q) && !item.body.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [questions, search, activeCategory, activeDifficulty]);

  function setStatus(id: string, status: string | null) {
    const next = { ...statuses };
    if (status === null) delete next[id]; else next[id] = status;
    setStatuses(next);
    setStorage('ios-qa-statuses', next);
  }

  function toggleBookmark(id: string) {
    const next = new Set(bookmarks);
    if (next.has(id)) next.delete(id); else next.add(id);
    setBookmarks(next);
    setStorage('ios-qa-bookmarks', [...next]);
  }

  return (
    <div>
      {/* Search bar */}
      <input
        id="search"
        type="search"
        placeholder="Search questions and answers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 16px', marginBottom: 16,
          borderRadius: 8, background: 'var(--surface2)',
          border: '1px solid var(--border)', color: 'var(--text)',
          fontFamily: 'var(--font-sans)', fontSize: 15,
        }}
      />

      {/* Category chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <button className={`chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      {/* Difficulty chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`chip ${activeDifficulty === 'all' ? 'active' : ''}`} onClick={() => setActiveDifficulty('all')}>All Levels</button>
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            className={`chip ${activeDifficulty === d ? 'active' : ''}`}
            onClick={() => setActiveDifficulty(d)}
            style={activeDifficulty !== d ? { color: DIFF_COLORS[d] } : {}}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Count */}
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
        {filtered.length} question{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Question list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(q => {
          const isOpen = expanded === q.id;
          const status = statuses[q.id];
          const isBookmarked = bookmarks.has(q.id);
          const meta = CATEGORY_META[q.category];

          return (
            <div key={q.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : q.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 10, padding: '14px 16px', background: 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: 'var(--text)',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: status === 'got-it' ? '#10b981'
                    : status === 'almost' ? '#f59e0b'
                    : status === 'nope' ? '#ef4444'
                    : 'var(--border)',
                }} />
                <span style={{
                  fontSize: 11, background: meta.color + '22', color: meta.color,
                  padding: '2px 8px', borderRadius: 12, flexShrink: 0,
                }}>{meta.emoji}</span>
                <span style={{ flex: 1, fontWeight: 500, fontSize: 15, lineHeight: 1.4 }}>{q.title}</span>
                <span style={{ fontSize: 11, color: DIFF_COLORS[q.difficulty], flexShrink: 0 }}>{q.difficulty}</span>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: 12 }}>{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ marginTop: 16, lineHeight: 1.7, fontSize: 15, whiteSpace: 'pre-wrap' }}>
                    {q.body}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    {(['got-it', 'almost', 'nope'] as const).map(s => (
                      <button
                        key={s}
                        className="btn btn-ghost"
                        style={status === s ? {
                          borderColor: s === 'got-it' ? '#10b981' : s === 'almost' ? '#f59e0b' : '#ef4444',
                          color: s === 'got-it' ? '#10b981' : s === 'almost' ? '#f59e0b' : '#ef4444',
                        } : {}}
                        onClick={() => setStatus(q.id, status === s ? null : s)}
                      >
                        {s === 'got-it' ? '✅ Got it' : s === 'almost' ? '🤔 Almost' : '❌ Nope'}
                      </button>
                    ))}
                    <button className="btn btn-ghost" onClick={() => toggleBookmark(q.id)}>
                      {isBookmarked ? '⭐ Saved' : '☆ Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
          No questions match your filters.
        </div>
      )}
    </div>
  );
}
