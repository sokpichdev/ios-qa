'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReferenceList from '@/components/ReferenceList';
import type { Question } from '@/lib/types';

export default function MCQQuestion({
  question,
  onAnswer,
  onNext,
  isLast,
}: {
  question: Question;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const locked = selected !== null;

  const choose = (opt: string) => {
    if (locked) return;
    setSelected(opt);
    onAnswer(opt === question.correct);
  };

  const optionStyle = (opt: string): React.CSSProperties => {
    if (!locked) return { border: '1px solid var(--border)' };
    if (opt === question.correct) return { border: '1px solid rgba(52,211,153,0.5)', background: 'rgba(52,211,153,0.12)', color: '#6ee7b7' };
    if (opt === selected) return { border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)', color: '#fca5a5' };
    return { border: '1px solid var(--border)', opacity: 0.5 };
  };

  return (
    <div>
      <div className="space-y-2">
        {question.options?.map((opt, i) => (
          <button
            key={opt}
            onClick={() => choose(opt)}
            disabled={locked}
            className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors"
            style={optionStyle(opt)}
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current text-[11px] font-semibold">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1">{opt}</span>
            {locked && opt === question.correct && <Icon name="check" size={16} className="mt-0.5 shrink-0" />}
            {locked && opt === selected && opt !== question.correct && <Icon name="x" size={16} className="mt-0.5 shrink-0" />}
          </button>
        ))}
      </div>

      {locked && (
        <div className="mt-5 animate-fade-up">
          <div
            className="rounded-xl p-4"
            style={
              selected === question.correct
                ? { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }
                : { background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.25)' }
            }
          >
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold" style={{ color: selected === question.correct ? '#6ee7b7' : '#fca5a5' }}>
              <Icon name={selected === question.correct ? 'check' : 'x'} size={16} />
              {selected === question.correct ? 'Correct!' : 'Not quite'}
            </div>
            <button onClick={() => setShowAnswer((s) => !s)} className="text-muted text-xs underline">
              {showAnswer ? 'Hide' : 'Show'} full explanation
            </button>
            {showAnswer && (
              <div className="mt-3 border-t border-app pt-3">
                <MarkdownRenderer content={question.answer} />
                <ReferenceList references={question.references} />
              </div>
            )}
          </div>

          <button onClick={onNext} className="btn-primary mt-4 w-full">
            {isLast ? 'See Results' : 'Next Question'} <Icon name="arrow-right" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
