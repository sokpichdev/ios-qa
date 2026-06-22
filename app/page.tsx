'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';
import { STATS } from '@/lib/questions';
import { TOPICS, DIFFICULTIES } from '@/lib/topics';
import { useProgress } from '@/hooks/useProgress';
import { topicProgress, overallStats } from '@/lib/progress-utils';

export default function HomePage() {
  const { progress, hydrated } = useProgress();
  const topics = topicProgress(progress);
  const overall = overallStats(progress);
  const topicByName = (name: string) => topics.find((t) => t.name === name);

  const heroStats = [
    { value: `${STATS.total}`, label: 'Questions', color: '#ff014f' },
    { value: `${STATS.topics}`, label: 'Topics', color: '#34d399' },
    { value: `${DIFFICULTIES.length}`, label: 'Levels', color: '#f472b6' },
    { value: hydrated ? `${overall.percent}%` : '—', label: 'Your Progress', color: '#fb923c' },
  ];

  return (
    <div className="py-10 sm:py-14">
      {/* Hero */}
      <section className="text-center">
        <span className="chip mx-auto mb-5 inline-flex">
          <Icon name="sparkles" size={13} />
          iOS Developer Interview Prep
        </span>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          <span className="heading-gradient">Ace your next iOS interview</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
          {STATS.total} curated questions across Swift, SwiftUI, Concurrency, Architecture and more.
          Quiz yourself, track progress, master the fundamentals.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/quiz" className="btn-primary">
            Start Quizzing <Icon name="arrow-right" size={16} />
          </Link>
          <Link href="/browse" className="btn-ghost">Browse Questions</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="glass mx-auto mt-12 grid max-w-3xl grid-cols-2 rounded-2xl sm:grid-cols-4">
        {heroStats.map((s, i) => (
          <div
            key={s.label}
            className={`px-4 py-5 text-center ${i < heroStats.length - 1 ? 'sm:border-r sm:border-app' : ''} ${i < 2 ? 'border-b border-app sm:border-b-0' : ''}`}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="label-caps mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Topics */}
      <section className="mt-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-bold">Topics</h2>
          <Link href="/browse" className="text-sm text-muted hover:text-[var(--text)]">View all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => {
            const tp = topicByName(t.name);
            if (!tp) return null;
            return (
              <Link
                key={t.slug}
                href={`/browse?topic=${encodeURIComponent(t.name)}`}
                className="glass glass-hover group rounded-xl p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-lg"
                    style={{ background: `${t.color}22`, color: t.color }}
                  >
                    <Icon name={t.icon} size={20} />
                  </span>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-faint text-xs">{tp.total} questions</div>
                  </div>
                  <span className="ml-auto text-sm font-semibold" style={{ color: t.color }}>
                    {hydrated ? `${tp.percent}%` : ''}
                  </span>
                </div>
                <p className="text-muted mb-3 text-xs leading-relaxed">{t.blurb}</p>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${hydrated ? tp.percent : 0}%`, background: t.color }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Spin teaser */}
      <section className="mt-10">
        <Link
          href="/spin"
          className="glass glass-hover flex items-center justify-between rounded-xl border-dashed p-5"
          style={{ borderStyle: 'dashed' }}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <Icon name="shuffle" size={20} />
            </span>
            <div>
              <div className="font-semibold">Feeling lucky?</div>
              <div className="text-muted text-xs">Spin the wheel for a random topic to drill</div>
            </div>
          </div>
          <span className="chip">Try it <Icon name="arrow-right" size={14} /></span>
        </Link>
      </section>
    </div>
  );
}
