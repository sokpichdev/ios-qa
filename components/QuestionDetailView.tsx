'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Question, SelfRating } from '@/lib/types';
import Icon from '@/components/Icon';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReferenceList from '@/components/ReferenceList';
import { TopicBadge, DifficultyBadge, TypeBadge } from '@/components/Badges';
import QuestionCard from '@/components/QuestionCard';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';

const RATINGS: { value: SelfRating; label: string; color: string; icon: 'check' | 'circle-dot' | 'x' }[] = [
  { value: 'got-it', label: 'Got it', color: '#34d399', icon: 'check' },
  { value: 'almost', label: 'Almost', color: '#fbbf24', icon: 'circle-dot' },
  { value: 'missed', label: 'Missed it', color: '#f87171', icon: 'x' },
];

export default function QuestionDetailView({
  question,
  relatedQuestions = [],
  prevQuestion,
  nextQuestion,
}: {
  question: Question;
  relatedQuestions?: Question[];
  prevQuestion?: Question;
  nextQuestion?: Question;
}) {
  const { progress, recordMcq, recordOpen } = useProgress();
  const { isBookmarked, toggle } = useBookmarks();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const entry = progress[question.id];
  const bookmarked = isBookmarked(question.id);

  const copyLink = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ios.sokpich.dev';
    const url = `${origin}/questions/${question.id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleMcqSelect = (opt: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    recordMcq(question.id, opt === question.correct);
  };

  const handleRate = (rating: SelfRating) => {
    recordOpen(question.id, rating);
  };

  return (
    <div className="py-6 sm:py-10 space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted flex-wrap">
        <Link href="/" className="hover:text-[var(--text)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-[var(--text)] transition-colors">
          Browse
        </Link>
        <span>/</span>
        <Link
          href={`/browse?topic=${encodeURIComponent(question.topic)}`}
          className="hover:text-[var(--text)] transition-colors font-medium"
        >
          {question.topic}
        </Link>
      </nav>

      {/* Main Question Card */}
      <article className="glass rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Top Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <TopicBadge topic={question.topic} />
            <DifficultyBadge difficulty={question.difficulty} />
            <TypeBadge type={question.type} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] px-3 py-1.5 text-xs text-muted hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors"
              title="Copy shareable link"
            >
              <Icon name={copied ? 'check' : 'link'} size={14} className={copied ? 'text-[var(--accent)]' : ''} />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => toggle(question.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] px-3 py-1.5 text-xs transition-colors"
              style={{ color: bookmarked ? '#f59e0b' : 'var(--text-muted)' }}
              title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Icon name="bookmark" size={14} filled={bookmarked} />
              <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <Link
              href={`/browse?topic=${encodeURIComponent(question.topic)}&question=${question.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] px-3 py-1.5 text-xs text-muted hover:text-[var(--text)] transition-colors"
              title="View in full browse list"
            >
              <Icon name="list" size={14} />
              <span className="hidden sm:inline">Browse</span>
            </Link>
          </div>
        </div>

        {/* Question Title */}
        <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-[var(--text)]">
          {question.question}
        </h1>

        {/* Interactive MCQ Choice or Practice Area */}
        {question.type === 'mcq' && question.options && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted font-semibold">Test your knowledge:</p>
            <div className="space-y-2">
              {question.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === question.correct;
                const locked = selectedOption !== null;

                let btnStyle: React.CSSProperties = { border: '1px solid var(--border)' };
                if (locked) {
                  if (isCorrect) {
                    btnStyle = {
                      border: '1px solid rgba(52,211,153,0.5)',
                      background: 'rgba(52,211,153,0.12)',
                      color: '#6ee7b7',
                    };
                  } else if (isSelected) {
                    btnStyle = {
                      border: '1px solid rgba(248,113,113,0.5)',
                      background: 'rgba(248,113,113,0.1)',
                      color: '#fca5a5',
                    };
                  } else {
                    btnStyle = { border: '1px solid var(--border)', opacity: 0.5 };
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleMcqSelect(opt)}
                    disabled={locked}
                    className="flex w-full items-start gap-3 rounded-xl p-3.5 text-left text-sm transition-all hover:border-[var(--border-strong)]"
                    style={btnStyle}
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current text-[11px] font-semibold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {locked && isCorrect && <Icon name="check" size={16} className="mt-0.5 shrink-0" />}
                    {locked && isSelected && !isCorrect && <Icon name="x" size={16} className="mt-0.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Explanation / Answer */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
            <Icon name="sparkles" size={16} /> Explanation & Code
          </h2>
          <div className="rounded-xl border border-app bg-[var(--surface-solid)]/40 p-5 sm:p-6 overflow-hidden">
            <MarkdownRenderer content={question.answer} />
            <ReferenceList references={question.references} />
          </div>
        </div>

        {/* Self Assessment Rating */}
        <div className="border-t border-app pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Rate your understanding:</p>
            {entry?.selfRating && (
              <span className="text-xs text-[var(--accent)] capitalize">
                Recorded: {entry.selfRating.replace('-', ' ')}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {RATINGS.map((r) => {
              const isRated = entry?.selfRating === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => handleRate(r.value)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-3 px-2 text-xs sm:text-sm font-medium transition-all ${
                    isRated ? 'ring-2' : 'hover:-translate-y-0.5'
                  }`}
                  style={{
                    color: r.color,
                    background: isRated ? `${r.color}25` : `${r.color}12`,
                    border: `1px solid ${r.color}40`,
                    ...(isRated ? { borderColor: r.color } : {}),
                  }}
                >
                  <Icon name={r.icon} size={16} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-app">
            <span className="text-xs text-muted">Tags:</span>
            {question.tags.map((t) => (
              <Link
                key={t}
                href={`/browse?tag=${encodeURIComponent(t)}`}
                className="rounded-md border border-[var(--border)] bg-[var(--surface-solid)] px-2.5 py-1 text-xs text-muted hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </article>

      {/* Prev / Next Question Navigation */}
      <div className="flex items-center justify-between gap-4">
        {prevQuestion ? (
          <Link
            href={`/questions/${prevQuestion.id}`}
            className="glass glass-hover rounded-xl p-3 sm:p-4 flex items-center gap-3 text-left flex-1 min-w-0"
          >
            <Icon name="arrow-left" size={18} className="shrink-0 text-muted" />
            <div className="min-w-0 overflow-hidden">
              <span className="text-[11px] text-muted block uppercase tracking-wider">Previous</span>
              <p className="text-xs sm:text-sm font-medium truncate">{prevQuestion.question}</p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextQuestion ? (
          <Link
            href={`/questions/${nextQuestion.id}`}
            className="glass glass-hover rounded-xl p-3 sm:p-4 flex items-center justify-end text-right gap-3 flex-1 min-w-0"
          >
            <div className="min-w-0 overflow-hidden">
              <span className="text-[11px] text-muted block uppercase tracking-wider">Next</span>
              <p className="text-xs sm:text-sm font-medium truncate">{nextQuestion.question}</p>
            </div>
            <Icon name="arrow-right" size={18} className="shrink-0 text-muted" />
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Related Questions Section */}
      {relatedQuestions.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text)]">Related Questions</h2>
            <Link
              href={`/browse?topic=${encodeURIComponent(question.topic)}`}
              className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              Browse all {question.topic} questions <Icon name="arrow-right" size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {relatedQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                entry={progress[q.id]}
                bookmarked={isBookmarked(q.id)}
                onToggleBookmark={toggle}
                showType={false}
                showOptions={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Topic CTA Banner */}
      <div className="glass rounded-2xl p-6 sm:p-8 text-center space-y-4 bg-gradient-to-b from-transparent to-[var(--surface-solid)]/30">
        <h3 className="text-lg font-bold">Ready to practice more {question.topic}?</h3>
        <p className="text-sm text-muted max-w-md mx-auto">
          Test yourself with our interactive quiz mode or browse all curated questions for this topic.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href={`/quiz?topic=${encodeURIComponent(question.topic)}`} className="btn-primary">
            <Icon name="play" size={16} /> Take {question.topic} Quiz
          </Link>
          <Link href={`/browse?topic=${encodeURIComponent(question.topic)}`} className="btn-ghost">
            View All in Browse
          </Link>
        </div>
      </div>
    </div>
  );
}
