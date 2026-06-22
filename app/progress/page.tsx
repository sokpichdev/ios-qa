'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import QuestionCard from '@/components/QuestionCard';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { topicProgress, overallStats, weakQuestions } from '@/lib/progress-utils';

export default function ProgressPage() {
  const { progress, hydrated, reset } = useProgress();
  const { isBookmarked, toggle } = useBookmarks();
  const [confirmReset, setConfirmReset] = useState(false);

  const topics = topicProgress(progress);
  const overall = overallStats(progress);
  const weak = weakQuestions(progress);

  const stats = [
    { value: overall.answered, label: 'Answered', color: '#ff014f' },
    { value: overall.correct, label: 'Correct', color: '#34d399' },
    { value: overall.missed, label: 'Missed', color: '#f87171' },
    { value: `${overall.percent}%`, label: 'Complete', color: '#fb923c' },
  ];

  if (!hydrated) {
    return <div className="py-20 text-center text-muted">Loading your progress…</div>;
  }

  if (overall.answered === 0) {
    return (
      <div className="py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Icon name="bar-chart" size={28} />
        </span>
        <h1 className="mt-4 text-2xl font-bold">No progress yet</h1>
        <p className="text-muted mt-2">Answer some questions to start tracking your progress.</p>
        <Link href="/quiz" className="btn-primary mt-6 inline-flex">Start a Quiz <Icon name="arrow-right" size={16} /></Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Your Progress</h1>

      {/* Overall */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="label-caps mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* By topic */}
      <h2 className="mb-3 mt-10 text-lg font-bold">By Topic</h2>
      <div className="space-y-2.5">
        {topics.map((t) => (
          <Link key={t.slug} href={`/browse?topic=${encodeURIComponent(t.name)}`} className="glass glass-hover block rounded-xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                {t.name}
                <span className="text-faint text-xs">{t.answered} / {t.total}</span>
              </span>
              <span className="text-sm font-semibold" style={{ color: t.color }}>{t.percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${t.percent}%`, background: t.color }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Weak areas */}
      {weak.length > 0 && (
        <>
          <h2 className="mb-1 mt-10 text-lg font-bold">Weak Areas</h2>
          <p className="text-muted mb-3 text-sm">Questions you missed or rated &ldquo;Almost&rdquo; — expand to review.</p>
          <div className="space-y-3">
            {weak.map((q) => (
              <QuestionCard key={q.id} question={q} entry={progress[q.id]} bookmarked={isBookmarked(q.id)} onToggleBookmark={toggle} />
            ))}
          </div>
        </>
      )}

      {/* Reset */}
      <div className="mt-12 text-right">
        {confirmReset ? (
          <span className="inline-flex items-center gap-3 text-sm">
            <span className="text-muted">Reset all progress?</span>
            <button onClick={() => { reset(); setConfirmReset(false); }} className="font-medium text-red-400">Yes, reset</button>
            <button onClick={() => setConfirmReset(false)} className="text-muted">Cancel</button>
          </span>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="text-faint hover:text-red-400 text-sm">Reset all progress</button>
        )}
      </div>
    </div>
  );
}
