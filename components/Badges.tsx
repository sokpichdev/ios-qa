import type { Difficulty, QuestionType } from '@/lib/types';
import { difficultyMeta, topicColor } from '@/lib/topics';

export function TopicBadge({ topic }: { topic: string }) {
  const color = topicColor(topic);
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold"
      style={{ color, background: `${color}22`, border: `1px solid ${color}40` }}
    >
      {topic}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const m = difficultyMeta(difficulty);
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium"
      style={{ color: m.color, background: `${m.color}18` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

export function TypeBadge({ type }: { type: QuestionType }) {
  return (
    <span className="surface-2 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium text-muted">
      {type === 'mcq' ? 'MCQ' : 'Open-ended'}
    </span>
  );
}
