'use client';

import Link from 'next/link';
import QuestionCard from './QuestionCard';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useProgress } from '@/hooks/useProgress';
import type { Question } from '@/lib/types';

export default function QuestionDetail({ question }: { question: Question }) {
  const { progress } = useProgress();
  const { isBookmarked, toggle } = useBookmarks();

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-8 sm:py-10">
      <Link href="/browse" className="inline-flex items-center text-sm text-muted hover:text-[var(--accent)]">
        Browse Questions
      </Link>
      <QuestionCard
        question={question}
        entry={progress[question.id]}
        bookmarked={isBookmarked(question.id)}
        onToggleBookmark={toggle}
        showType
        showOptions
        defaultOpen
      />
    </div>
  );
}
