'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { TOPICS, DIFFICULTIES } from '@/lib/topics';
import type { Difficulty } from '@/lib/types';
import { topicCounts, tagCounts } from '@/lib/questions';

export interface BrowseFilter {
  topic: string | null;
  difficulty: Difficulty | null;
  tag: string | null;
  search: string;
}

const counts = topicCounts();
const countFor = (name: string) => counts.find((c) => c.name === name)?.total ?? 0;
const totalCount = counts.reduce((acc, c) => acc + c.total, 0);

export default function FilterBar({
  filter,
  onChange,
}: {
  filter: BrowseFilter;
  onChange: (f: BrowseFilter) => void;
}) {
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const tagModalRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<BrowseFilter>) => onChange({ ...filter, ...patch });
  const availableTags = tagCounts(filter.topic);

  // Close tag modal on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagModalRef.current && !tagModalRef.current.contains(e.target as Node)) {
        setShowTagModal(false);
      }
    }
    if (showTagModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTagModal]);

  const filteredModalTags = tagSearch.trim()
    ? availableTags.filter((t) => t.tag.toLowerCase().includes(tagSearch.toLowerCase().trim()))
    : availableTags;

  // Contextual popular tags for the quick-strip (first 8)
  const topTags = availableTags.slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Search & Difficulty Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="glass relative flex flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5">
          <Icon name="search" size={16} className="shrink-0 text-faint" />
          <input
            value={filter.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Search questions, answers, or tags…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-faint)]"
          />
          {filter.search && (
            <button
              onClick={() => set({ search: '' })}
              aria-label="Clear search"
              className="text-faint hover:text-[var(--text)] transition-colors"
            >
              <Icon name="x" size={15} />
            </button>
          )}
        </div>

        {/* Difficulty Segmented Control */}
        <div className="glass flex shrink-0 items-center rounded-xl p-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => set({ difficulty: null })}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter.difficulty === null
                ? 'chip-active'
                : 'text-muted hover:text-[var(--text)]'
            }`}
          >
            All Levels
          </button>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => set({ difficulty: filter.difficulty === d.value ? null : d.value })}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter.difficulty === d.value
                  ? 'chip-active'
                  : 'text-muted hover:text-[var(--text)]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Topic Carousel */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {/* All Topics */}
          <button
            onClick={() => set({ topic: null })}
            className={`chip shrink-0 cursor-pointer text-xs ${
              filter.topic === null ? 'chip-active' : ''
            }`}
          >
            <Icon name="list" size={14} />
            <span>All Topics</span>
            <span className="text-[10px] opacity-70">({totalCount})</span>
          </button>

          {/* Topic Pills */}
          {TOPICS.filter((t) => countFor(t.name) > 0).map((t) => {
            const active = filter.topic === t.name;
            return (
              <button
                key={t.slug}
                onClick={() => set({ topic: active ? null : t.name })}
                className={`chip shrink-0 cursor-pointer text-xs ${active ? 'chip-active' : ''}`}
                style={!active ? { color: 'var(--text-muted)' } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: t.color }}
                />
                <Icon name={t.icon} size={14} />
                <span>{t.name}</span>
                <span className="text-[10px] opacity-70">({countFor(t.name)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Tags Strip */}
      {availableTags.length > 0 && (
        <div className="relative flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-faint uppercase tracking-wider mr-1">
            Tags:
          </span>

          {topTags.map((t) => {
            const active = filter.tag?.toLowerCase() === t.tag.toLowerCase();
            return (
              <button
                key={t.tag}
                onClick={() => set({ tag: active ? null : t.tag })}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-all ${
                  active
                    ? 'chip-active font-medium'
                    : 'border border-[var(--border)] bg-[var(--surface-solid)] text-muted hover:border-[var(--border-strong)] hover:text-[var(--text)]'
                }`}
              >
                <span>#{t.tag}</span>
                <span className="text-[10px] opacity-70">({t.total})</span>
              </button>
            );
          })}

          {/* Tag Modal / Popover Button */}
          {availableTags.length > 8 && (
            <div className="relative" ref={tagModalRef}>
              <button
                onClick={() => setShowTagModal((s) => !s)}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-solid)] px-2.5 py-1 text-[11px] text-muted hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-all"
              >
                <span>+{availableTags.length - 8} more tags</span>
                <Icon name="chevron-down" size={12} className={showTagModal ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {/* Tag Search Popover */}
              {showTagModal && (
                <div className="glass absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-50 w-72 max-w-[90vw] rounded-2xl p-3 shadow-2xl border border-[var(--border-strong)]">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="label-caps">All Available Tags</span>
                    <button
                      onClick={() => setShowTagModal(false)}
                      className="text-faint hover:text-[var(--text)]"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search tags…"
                    autoFocus
                    className="mb-2.5 w-full rounded-lg border border-[var(--border)] bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]"
                  />
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {filteredModalTags.length === 0 ? (
                      <p className="py-2 text-center text-xs text-muted">No tags found</p>
                    ) : (
                      filteredModalTags.map((t) => {
                        const active = filter.tag?.toLowerCase() === t.tag.toLowerCase();
                        return (
                          <button
                            key={t.tag}
                            onClick={() => {
                              set({ tag: active ? null : t.tag });
                              setShowTagModal(false);
                            }}
                            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                              active ? 'chip-active' : 'text-muted hover:bg-[var(--border)] hover:text-[var(--text)]'
                            }`}
                          >
                            <span>#{t.tag}</span>
                            <span className="text-[10px] text-faint">({t.total})</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
