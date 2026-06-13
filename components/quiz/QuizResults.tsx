'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';

export interface QuizSummary {
  total: number;
  correct: number;
  almost: number;
  missed: number;
  topic: string;
  difficulty: string;
  hasMissed: boolean;
}

export default function QuizResults({
  summary,
  onRetryMissed,
  onNewQuiz,
}: {
  summary: QuizSummary;
  onRetryMissed: () => void;
  onNewQuiz: () => void;
}) {
  const pct = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;
  const stats = [
    { value: summary.correct, label: 'Correct', color: '#34d399' },
    { value: summary.almost, label: 'Almost', color: '#fbbf24' },
    { value: summary.missed, label: 'Missed', color: '#f87171' },
  ];

  return (
    <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center animate-fade-up">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={{ background: 'rgba(124,58,237,0.18)', color: '#a78bfa' }}>
        <Icon name="trophy" size={30} />
      </span>
      <h1 className="mt-4 text-2xl font-bold">Quiz Complete</h1>
      <p className="text-muted mt-1 text-sm">
        {summary.total} questions · {summary.topic} · {summary.difficulty}
      </p>

      <div className="my-6 text-4xl font-extrabold heading-gradient">{pct}%</div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="surface-2 rounded-xl py-4">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="label-caps mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-2">
        {summary.hasMissed && (
          <button onClick={onRetryMissed} className="btn-primary w-full">
            <Icon name="refresh" size={16} /> Retry Missed
          </button>
        )}
        <div className="flex gap-2">
          <button onClick={onNewQuiz} className="btn-ghost flex-1">New Quiz</button>
          <Link href="/progress" className="btn-ghost flex-1">View Progress</Link>
        </div>
      </div>
    </div>
  );
}
