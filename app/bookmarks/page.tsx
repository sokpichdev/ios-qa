'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';
import QuestionCard from '@/components/QuestionCard';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { getById } from '@/lib/questions';

export default function BookmarksPage() {
  const { bookmarks, hydrated, isBookmarked, toggle } = useBookmarks();
  const { progress } = useProgress();

  const questions = bookmarks.map(getById).filter((q): q is NonNullable<typeof q> => Boolean(q));

  if (!hydrated) {
    return <div className="py-20 text-center text-muted">Loading bookmarks…</div>;
  }

  return (
    <div className="py-8">
      <h1 className="mb-1 text-2xl font-bold">Bookmarks</h1>
      <p className="text-muted mb-6 text-sm">Questions you saved for later review.</p>

      {questions.length === 0 ? (
        <div className="py-20 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <Icon name="bookmark" size={26} />
          </span>
          <h2 className="mt-4 text-xl font-bold">No bookmarks yet</h2>
          <p className="text-muted mt-2">Tap the bookmark icon on any question to save it here.</p>
          <Link href="/browse" className="btn-primary mt-6 inline-flex">Browse Questions <Icon name="arrow-right" size={16} /></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} entry={progress[q.id]} bookmarked={isBookmarked(q.id)} onToggleBookmark={toggle} />
          ))}
        </div>
      )}
    </div>
  );
}
