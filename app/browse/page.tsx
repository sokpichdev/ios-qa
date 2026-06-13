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
  const [filter, setFilter] = useState<BrowseFilter>({
    topic: initialTopic,
    difficulty: null,
    type: null,
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
        types: filter.type ? [filter.type] : undefined,
        search: filter.search,
      }),
    [filter]
  );

  const visible = results.slice(0, limit);

  const onChange = (f: BrowseFilter) => {
    setFilter(f);
    setLimit(PAGE_SIZE);
  };

  return (
    <div className="py-8">
      <h1 className="mb-1 text-2xl font-bold">Browse Questions</h1>
      <p className="text-muted mb-6 text-sm">Filter and expand any question to reveal the answer.</p>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setShowFilters((s) => !s)}
        className="btn-ghost mb-4 w-full md:hidden"
      >
        <Icon name="list" size={16} /> {showFilters ? 'Hide' : 'Show'} filters
      </button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:sticky md:top-20 md:h-fit`}>
          <FilterBar filter={filter} onChange={onChange} />
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-muted">
              Showing <span className="font-semibold text-[var(--text)]">{results.length}</span> question{results.length !== 1 ? 's' : ''}
            </span>
            {(filter.topic || filter.difficulty || filter.type || filter.search) && (
              <button
                onClick={() => onChange({ topic: null, difficulty: null, type: null, search: '' })}
                className="text-muted hover:text-[var(--text)]"
              >
                Clear filters
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center text-muted">
              No questions match these filters.
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
                  showType={false}
                  showOptions={false}
                />
              ))}
            </div>
          )}

          {limit < results.length && (
            <div className="mt-6 text-center">
              <button onClick={() => setLimit((l) => l + PAGE_SIZE)} className="btn-ghost">
                Load more ({results.length - limit} left)
              </button>
            </div>
          )}
        </div>
      </div>
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
