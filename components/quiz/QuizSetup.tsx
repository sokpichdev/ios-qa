'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { TOPICS, DIFFICULTIES } from '@/lib/topics';
import { filterQuestions } from '@/lib/questions';
import { topicCounts } from '@/lib/questions';
import type { Difficulty, Question } from '@/lib/types';

const counts = topicCounts();
const has = (name: string) => counts.some((c) => c.name === name && c.total > 0);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizSetup({
  initialTopic,
  onStart,
}: {
  initialTopic?: string | null;
  onStart: (queue: Question[], meta: { topic: string; difficulty: string }) => void;
}) {
  const [topic, setTopic] = useState<string | null>(initialTopic ?? null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [count, setCount] = useState<number | 'all'>(10);

  const pool = useMemo(
    () =>
      filterQuestions({
        topics: topic ? [topic] : undefined,
        difficulties: difficulty ? [difficulty] : undefined,
      }),
    [topic, difficulty]
  );

  const start = () => {
    const shuffled = shuffle(pool);
    const queue = count === 'all' ? shuffled : shuffled.slice(0, count);
    onStart(queue, {
      topic: topic ?? 'All Topics',
      difficulty: difficulty ? DIFFICULTIES.find((d) => d.value === difficulty)!.label : 'All Levels',
    });
  };

  const Chip = ({ active, color, onClick, children }: { active: boolean; color?: string; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className={`chip ${active ? 'chip-active' : ''}`} style={!active && color ? { color } : undefined}>
      {children}
    </button>
  );

  return (
    <div className="glass mx-auto max-w-xl rounded-2xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold">Start a Quiz</h1>
      <p className="text-muted mt-1 text-sm">Pick your focus and test yourself.</p>

      <div className="mt-6">
        <p className="label-caps mb-2">Topic</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={topic === null} onClick={() => setTopic(null)}>All</Chip>
          {TOPICS.filter((t) => has(t.name)).map((t) => (
            <Chip key={t.slug} active={topic === t.name} onClick={() => setTopic(t.name)}>
              {t.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="label-caps mb-2">Difficulty</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={difficulty === null} onClick={() => setDifficulty(null)}>All</Chip>
          {DIFFICULTIES.map((d) => (
            <Chip key={d.value} active={difficulty === d.value} color={d.color} onClick={() => setDifficulty(d.value)}>
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="label-caps mb-2">Questions</p>
        <div className="flex flex-wrap gap-2">
          {[10, 20].map((n) => (
            <Chip key={n} active={count === n} onClick={() => setCount(n)}>{n}</Chip>
          ))}
          <Chip active={count === 'all'} onClick={() => setCount('all')}>All</Chip>
        </div>
      </div>

      <div className="text-muted mt-6 text-sm">
        {pool.length} question{pool.length !== 1 ? 's' : ''} available
        {count !== 'all' && pool.length > 0 && ` · quizzing ${Math.min(count, pool.length)}`}
      </div>

      <button onClick={start} disabled={pool.length === 0} className="btn-primary mt-5 w-full disabled:opacity-40">
        Start Quiz <Icon name="arrow-right" size={16} />
      </button>
    </div>
  );
}
