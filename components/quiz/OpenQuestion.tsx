'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReferenceList from '@/components/ReferenceList';
import type { Question, SelfRating } from '@/lib/types';

const RATINGS: { value: SelfRating; label: string; color: string; icon: 'check' | 'circle-dot' | 'x' }[] = [
  { value: 'got-it', label: 'Got it', color: '#34d399', icon: 'check' },
  { value: 'almost', label: 'Almost', color: '#fbbf24', icon: 'circle-dot' },
  { value: 'missed', label: 'Missed it', color: '#f87171', icon: 'x' },
];

export default function OpenQuestion({
  question,
  onRate,
  isLast,
}: {
  question: Question;
  onRate: (rating: SelfRating) => void;
  isLast: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      {!revealed ? (
        <div className="glass rounded-xl p-5 text-center">
          <p className="label-caps mb-2">Think through your answer</p>
          <p className="text-muted text-sm">Form your answer out loud or on paper, then reveal to self-assess.</p>
          <button onClick={() => setRevealed(true)} className="btn-ghost mt-4">
            <Icon name="sparkles" size={15} /> Reveal Answer
          </button>
        </div>
      ) : (
        <div className="animate-fade-up">
          <div className="glass rounded-xl p-5">
            <MarkdownRenderer content={question.answer} />
            <ReferenceList references={question.references} />
          </div>

          <p className="label-caps mb-2 mt-5">How did you do?</p>
          <div className="grid grid-cols-3 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => onRate(r.value)}
                className="flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
                style={{ color: r.color, background: `${r.color}14`, border: `1px solid ${r.color}40` }}
              >
                <Icon name={r.icon} size={18} />
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-faint mt-3 text-center text-xs">
            {isLast ? 'Rating finishes the quiz' : 'Rating advances to the next question'}
          </p>
        </div>
      )}
    </div>
  );
}
