'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterBar, { type BrowseFilter } from '@/components/FilterBar';
import QuestionCard from '@/components/QuestionCard';
import Icon from '@/components/Icon';
import { filterQuestions } from '@/lib/questions';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';

const PAGE_SIZE = 12;

function BrowseInner() {
  const params = useSearchParams();
  const initialTopic = params.get('topic');
  const initialTag = params.get('tag');

  const [filter, setFilter] = useState<BrowseFilter>({
    topic: initialTopic,
    difficulty: null,
    tag: initialTag,
    search: '',
  });
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  const { progress } = useProgress();
  const { isBookmarked, toggle } = useBookmarks();

  const results = useMemo(
    () =>
      filterQuestions({
        topics: filter.topic ? [filter.topic] : undefined,
        difficulties: filter.difficulty ? [filter.difficulty] : undefined,
        tag: filter.tag || undefined,
        search: filter.search,
      }),
    [filter]
  );

  const visible = results.slice(0, limit);

  const onChange = (f: BrowseFilter) => {
    setFilter(f);
    setLimit(PAGE_SIZE);
  };

  const hasActiveFilters = Boolean(filter.topic || filter.difficulty || filter.tag || filter.search);

  return (
    <div className="py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="mb-1 text-2xl sm:text-3xl font-bold">Browse Questions</h1>
        <p className="text-muted text-sm">
          Filter by topic, difficulty, or tags, and expand any question to reveal the answer.
        </p>
      </div>

      {/* Top Filter Bar (Search, Levels, Topics, Tags) */}
      <FilterBar filter={filter} onChange={onChange} />

      {/* Results Header & Active Filter Badges */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted">
            Showing <span className="font-semibold text-[var(--text)]">{results.length}</span> question{results.length !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => onChange({ topic: null, difficulty: null, tag: null, search: '' })}
              className="text-xs text-muted hover:text-[var(--accent)] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            {filter.topic && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)]">
                Topic: <strong className="font-semibold">{filter.topic}</strong>
                <button
                  onClick={() => onChange({ ...filter, topic: null })}
                  className="ml-1 text-muted hover:text-[var(--text)] text-sm leading-none"
                  aria-label="Remove topic filter"
                >
                  ×
                </button>
              </span>
            )}
            {filter.difficulty && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)]">
                Level: <strong className="font-semibold capitalize">{filter.difficulty}</strong>
                <button
                  onClick={() => onChange({ ...filter, difficulty: null })}
                  className="ml-1 text-muted hover:text-[var(--text)] text-sm leading-none"
                  aria-label="Remove difficulty filter"
                >
                  ×
                </button>
              </span>
            )}
            {filter.tag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)]">
                Tag: <strong className="font-semibold">#{filter.tag}</strong>
                <button
                  onClick={() => onChange({ ...filter, tag: null })}
                  className="ml-1 text-muted hover:text-[var(--text)] text-sm leading-none"
                  aria-label="Remove tag filter"
                >
                  ×
                </button>
              </span>
            )}
            {filter.search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)]">
                Search: <strong className="font-semibold">&ldquo;{filter.search}&rdquo;</strong>
                <button
                  onClick={() => onChange({ ...filter, search: '' })}
                  className="ml-1 text-muted hover:text-[var(--text)] text-sm leading-none"
                  aria-label="Clear search query"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Questions List */}
      {visible.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted space-y-2">
          <p className="text-base font-medium">No questions match your selected filters.</p>
          <p className="text-xs text-faint">Try adjusting your search query, topic, or tags.</p>
          {hasActiveFilters && (
            <button
              onClick={() => onChange({ topic: null, difficulty: null, tag: null, search: '' })}
              className="btn-ghost mt-2"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              entry={progress[q.id]}
              bookmarked={isBookmarked(q.id)}
              onToggleBookmark={toggle}
              onSelectTag={(t) => onChange({ ...filter, tag: t })}
              showType={false}
              showOptions={false}
            />
          ))}
        </div>
      )}

      {limit < results.length && (
        <div className="pt-4 text-center">
          <button onClick={() => setLimit((l) => l + PAGE_SIZE)} className="btn-ghost">
            Load more ({results.length - limit} left)
          </button>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading…</div>}>
      <BrowseInner />
    </Suspense>
  );
}
