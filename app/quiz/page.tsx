'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import QuizSetup from '@/components/quiz/QuizSetup';
import MCQQuestion from '@/components/quiz/MCQQuestion';
import OpenQuestion from '@/components/quiz/OpenQuestion';
import QuizResults, { type QuizSummary } from '@/components/quiz/QuizResults';
import { TopicBadge, DifficultyBadge } from '@/components/Badges';
import { useProgress } from '@/hooks/useProgress';
import type { Question, SelfRating } from '@/lib/types';

type Outcome = 'correct' | 'wrong' | SelfRating;

function QuizInner() {
  const params = useSearchParams();
  const initialTopic = params.get('topic');
  const { recordMcq, recordOpen } = useProgress();

  const [queue, setQueue] = useState<Question[]>([]);
  const [meta, setMeta] = useState({ topic: 'All Topics', difficulty: 'All Levels' });
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});

  const phase = queue.length === 0 ? 'setup' : index >= queue.length ? 'results' : 'active';
  const current = queue[index];

  const start = (q: Question[], m: { topic: string; difficulty: string }) => {
    setQueue(q);
    setMeta(m);
    setIndex(0);
    setOutcomes({});
  };

  const handleMcq = (correct: boolean) => {
    recordMcq(current.id, correct);
    setOutcomes((o) => ({ ...o, [current.id]: correct ? 'correct' : 'wrong' }));
  };

  const handleRate = (rating: SelfRating) => {
    recordOpen(current.id, rating);
    setOutcomes((o) => ({ ...o, [current.id]: rating }));
    next();
  };

  const next = () => setIndex((i) => i + 1);

  const summary: QuizSummary = (() => {
    const vals = Object.values(outcomes);
    const correct = vals.filter((v) => v === 'correct' || v === 'got-it').length;
    const almost = vals.filter((v) => v === 'almost').length;
    const missed = vals.filter((v) => v === 'wrong' || v === 'missed').length;
    return { total: queue.length, correct, almost, missed, topic: meta.topic, difficulty: meta.difficulty, hasMissed: missed + almost > 0 };
  })();

  const retryMissed = () => {
    const ids = new Set(
      Object.entries(outcomes)
        .filter(([, v]) => v === 'wrong' || v === 'missed' || v === 'almost')
        .map(([id]) => id)
    );
    const retry = queue.filter((q) => ids.has(q.id));
    setQueue(retry);
    setIndex(0);
    setOutcomes({});
  };

  const newQuiz = () => {
    setQueue([]);
    setIndex(0);
    setOutcomes({});
  };

  if (phase === 'setup') {
    return (
      <div className="py-10">
        <QuizSetup initialTopic={initialTopic} onStart={start} />
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="py-10">
        <QuizResults summary={summary} onRetryMissed={retryMissed} onNewQuiz={newQuiz} />
      </div>
    );
  }

  const progressPct = Math.round((index / queue.length) * 100);

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Progress header */}
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted">Question {index + 1} / {queue.length}</span>
        <button onClick={newQuiz} className="text-faint hover:text-[var(--text)] text-xs">Exit</button>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <TopicBadge topic={current.topic} />
        <DifficultyBadge difficulty={current.difficulty} />
      </div>
      <h2 className="mb-5 text-lg font-semibold leading-snug">{current.question}</h2>

      {current.type === 'mcq' ? (
        <MCQQuestion key={current.id} question={current} onAnswer={handleMcq} onNext={next} isLast={index === queue.length - 1} />
      ) : (
        <OpenQuestion key={current.id} question={current} onRate={handleRate} isLast={index === queue.length - 1} />
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading…</div>}>
      <QuizInner />
    </Suspense>
  );
}
