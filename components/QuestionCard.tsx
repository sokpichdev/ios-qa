'use client';

import { useState } from 'react';
import type { Question, ProgressEntry } from '@/lib/types';
import Icon from './Icon';
import MarkdownRenderer from './MarkdownRenderer';
import ReferenceList from './ReferenceList';
import { TopicBadge, DifficultyBadge, TypeBadge } from './Badges';

function statusColor(entry?: ProgressEntry): string | null {
  if (!entry?.answered) return null;
  if (entry.selfRating) {
    return entry.selfRating === 'got-it' ? '#34d399' : entry.selfRating === 'almost' ? '#fbbf24' : '#f87171';
  }
  if (typeof entry.correct === 'boolean') return entry.correct ? '#34d399' : '#f87171';
  return '#94a3b8';
}

export default function QuestionCard({
  question,
  entry,
  bookmarked,
  onToggleBookmark,
  onSelectTag,
  showType = true,
  showOptions = true,
}: {
  question: Question;
  entry?: ProgressEntry;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelectTag?: (tag: string) => void;
  showType?: boolean;
  showOptions?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dot = statusColor(entry);

  return (
    <div className="glass glass-hover rounded-xl p-4" style={dot ? { borderColor: `${dot}55` } : undefined}>
      <div className="flex items-start gap-3">
        <button onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <TopicBadge topic={question.topic} />
            <DifficultyBadge difficulty={question.difficulty} />
            {showType && <TypeBadge type={question.type} />}
          </div>
          <p className="break-words pr-2 text-sm font-medium leading-snug">{question.question}</p>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} title="Answered" />}
          <button
            onClick={() => onToggleBookmark(question.id)}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            className="transition-colors"
            style={{ color: bookmarked ? '#f59e0b' : 'var(--text-faint)' }}
          >
            <Icon name="bookmark" size={17} filled={bookmarked} />
          </button>
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle answer" className="text-faint">
            <Icon name="chevron-down" size={18} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 min-w-0 overflow-hidden border-t border-app pt-4">
          {showOptions && question.type === 'mcq' && question.options && (
            <ul className="mb-4 space-y-1.5">
              {question.options.map((opt) => {
                const isCorrect = opt === question.correct;
                return (
                  <li
                    key={opt}
                    className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
                    style={
                      isCorrect
                        ? { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.4)', color: '#6ee7b7' }
                        : { border: '1px solid var(--border)', color: 'var(--text-muted)' }
                    }
                  >
                    {isCorrect && <Icon name="check" size={14} className="mt-0.5 shrink-0" />}
                    <span>{opt}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <MarkdownRenderer content={question.answer} />
          <ReferenceList references={question.references} />
          {question.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {question.tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onSelectTag?.(t)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface-solid)] px-2 py-0.5 text-[11px] text-muted hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
