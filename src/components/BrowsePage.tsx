// src/components/BrowsePage.tsx
import { useState, useMemo, useEffect } from 'react';
import type { Question } from '../lib/questions';
import { CATEGORIES, CATEGORY_META } from '../lib/questions';
import { renderMarkdown } from '../lib/renderMarkdown';
import Icon from './Icon';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

const DIFF_COLORS: Record<string, string> = {
  Beginner: '#10b981',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
};

const STATUS_COLORS: Record<string, string> = {
  'got-it': '#10b981',
  almost: '#f59e0b',
  nope: '#ef4444',
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
  const [everOpened, setEverOpened] = useState<Set<string>>(new Set());
  const [pulsingId, setPulsingId] = useState<string | null>(null);
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

  function toggleExpanded(id: string, isOpen: boolean) {
    setExpanded(isOpen ? null : id);
    if (!isOpen) setEverOpened(prev => new Set(prev).add(id));
  }

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
    setPulsingId(id);
  }

  function clearFilters() {
    setSearch('');
    setActiveCategory('all');
    setActiveDifficulty('all');
  }

  return (
    <div>
      {/* Search bar */}
      <input
        id="search"
        type="search"
        className="search-input"
        placeholder="Search questions and answers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {/* Category chips */}
      <div className="chip-row" style={{ marginBottom: 10 }}>
        <button className={`chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            <Icon name={CATEGORY_META[cat].icon} size={13} /> {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      {/* Difficulty chips */}
      <div className="chip-row" style={{ marginBottom: 20 }}>
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
            <div key={q.id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${meta.color}` }}>
              <button
                onClick={() => toggleExpanded(q.id, isOpen)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 10, padding: '14px 16px', background: 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: 'var(--text)', minHeight: 44,
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: STATUS_COLORS[status] ?? 'var(--border)',
                  boxShadow: STATUS_COLORS[status] ? `0 0 8px ${STATUS_COLORS[status]}66` : 'none',
                }} />
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: meta.color + '22', color: meta.color,
                  padding: '4px 8px', borderRadius: 12, flexShrink: 0,
                }}><Icon name={meta.icon} size={13} /></span>
                <span style={{ flex: 1, fontWeight: 500, fontSize: 15, lineHeight: 1.4 }}>{q.title}</span>
                <span style={{ fontSize: 11, color: DIFF_COLORS[q.difficulty], flexShrink: 0 }}>{q.difficulty}</span>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'inline-flex' }}>
                  <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} />
                </span>
              </button>

              <div className="collapse" data-open={isOpen}>
                <div className="collapse-inner">
                  {(isOpen || everOpened.has(q.id)) && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                      <div
                        className="answer-body"
                        style={{ marginTop: 16, lineHeight: 1.7, fontSize: 15 }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(q.body) }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        {(['got-it', 'almost', 'nope'] as const).map(s => (
                          <button
                            key={s}
                            className="btn btn-ghost"
                            style={status === s ? {
                              borderColor: STATUS_COLORS[s],
                              color: STATUS_COLORS[s],
                              boxShadow: `0 0 12px ${STATUS_COLORS[s]}40`,
                            } : {}}
                            onClick={() => setStatus(q.id, status === s ? null : s)}
                          >
                            <Icon name={s === 'got-it' ? 'check' : s === 'almost' ? 'help-circle' : 'x'} size={14} />
                            {s === 'got-it' ? 'Got it' : s === 'almost' ? 'Almost' : 'Nope'}
                          </button>
                        ))}
                        <button
                          className={`btn btn-ghost bookmark-btn ${pulsingId === q.id ? 'pulsing' : ''}`}
                          onClick={() => toggleBookmark(q.id)}
                          onAnimationEnd={() => setPulsingId(null)}
                          style={isBookmarked ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
                        >
                          <Icon name="star" size={14} filled={isBookmarked} />
                          {isBookmarked ? 'Saved' : 'Save'}
                        </button>
                        <a
                          href={`${base}/questions/${q.id}`}
                          className="btn btn-ghost"
                          style={{ marginLeft: 'auto', fontSize: 13 }}
                        >
                          View Full Page →
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

      {filtered.length === 0 && (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
            <line x1="8.5" y1="11" x2="13.5" y2="11" />
          </svg>
          <p>Nothing matches your filters — try widening the search.</p>
          <button className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
