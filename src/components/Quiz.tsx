// src/components/Quiz.tsx
import { useState, useEffect, useRef } from 'react';
import type { Question } from '../lib/questions';
import { CATEGORIES, CATEGORY_META } from '../lib/questions';
import { renderMarkdown } from '../lib/renderMarkdown';
import Icon from './Icon';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

interface Props {
  questions: Question[];
}

type QuizStatus = 'idle' | 'running' | 'done';
type Score = 'got-it' | 'almost' | 'nope';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const CONFETTI_COLORS = ['#f05a28', '#ff7a50', '#fbbf24', '#10b981', '#7c3aed', '#0ea5e9'];

function burstConfetti() {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDuration = 1.5 + Math.random() + 's';
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
}

function ScoreRing({ percent }: { percent: number }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = filled ? C * (1 - percent / 100) : C;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`Score ${percent}%`}>
      <circle cx="70" cy="70" r={R} fill="none" stroke="var(--surface2)" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={R} fill="none"
        stroke="url(#ring-gradient)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f05a28" />
          <stop offset="100%" stopColor="#ff7a50" />
        </linearGradient>
      </defs>
      <text
        x="70" y="70" textAnchor="middle" dominantBaseline="central"
        fill="var(--text)" fontSize="26" fontWeight="700" fontFamily="var(--font-mono)"
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function Quiz({ questions }: Props) {
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [fling, setFling] = useState<'left' | 'right' | null>(null);
  const touchStartX = useRef<number | null>(null);

  const filtered = questions.filter(q => {
    if (category !== 'all' && q.category !== category) return false;
    if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
    return true;
  });

  function start() {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setIndex(0);
    setRevealed(false);
    setScores({});
    setStatus('running');
  }

  function answer(score: Score) {
    const q = queue[index];
    const nextScores = { ...scores, [q.id]: score };
    setScores(nextScores);
    setFling(null);
    if (index + 1 >= queue.length) {
      setStatus('done');
      const gotIt = Object.values(nextScores).filter(s => s === 'got-it').length;
      if (gotIt / queue.length >= 0.8) burstConfetti();
    } else {
      setIndex(i => i + 1);
      setRevealed(false);
    }
  }

  // Swipe on the revealed card: right = Got it, left = Nope
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || !revealed || fling) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 60) return;
    const dir = delta > 0 ? 'right' : 'left';
    if (prefersReducedMotion()) {
      answer(dir === 'right' ? 'got-it' : 'nope');
      return;
    }
    setFling(dir);
    setTimeout(() => answer(dir === 'right' ? 'got-it' : 'nope'), 250);
  }

  const inputStyle = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'inherit', fontFamily: 'inherit',
  };

  if (status === 'idle') return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24, fontSize: 20 }}>Configure Quiz</h2>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>CATEGORY</p>
        <div className="chip-row">
          <button style={inputStyle} className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>All</button>
          {CATEGORIES.map(cat => (
            <button key={cat} style={inputStyle} className={`chip ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
              <Icon name={CATEGORY_META[cat].icon} size={13} /> {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>DIFFICULTY</p>
        <div className="chip-row">
          <button style={inputStyle} className={`chip ${difficulty === 'all' ? 'active' : ''}`} onClick={() => setDifficulty('all')}>All Levels</button>
          {DIFFICULTIES.map(d => (
            <button key={d} style={inputStyle} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>
          ))}
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        {filtered.length} question{filtered.length !== 1 ? 's' : ''} available
      </p>
      <button className="btn btn-primary" onClick={start} disabled={filtered.length === 0}>
        Start Quiz →
      </button>
    </div>
  );

  if (status === 'done') {
    const gotIt = Object.values(scores).filter(s => s === 'got-it').length;
    const almost = Object.values(scores).filter(s => s === 'almost').length;
    const nope = Object.values(scores).filter(s => s === 'nope').length;
    const total = gotIt + almost + nope;
    const percent = total > 0 ? Math.round((gotIt / total) * 100) : 0;
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 20, fontSize: 24 }}>Quiz Complete!</h2>
        <div style={{ marginBottom: 24 }}>
          <ScoreRing percent={percent} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Got It', count: gotIt, color: '#10b981' },
            { label: 'Almost', count: almost, color: '#f59e0b' },
            { label: 'Need Work', count: nope, color: '#ef4444' },
          ].map(({ label, count, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{count}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={start}>Retry</button>
          <button className="btn btn-ghost" onClick={() => setStatus('idle')}>New Config</button>
        </div>
      </div>
    );
  }

  // Running
  const q = queue[index];
  const meta = CATEGORY_META[q.category];
  const progress = ((index + 1) / queue.length) * 100;

  const flingStyle: React.CSSProperties = fling ? {
    transform: `translateX(${fling === 'right' ? 120 : -120}%) rotate(${fling === 'right' ? 8 : -8}deg)`,
    opacity: 0,
    transition: 'transform 0.25s ease, opacity 0.25s ease',
  } : {};

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: meta.color }}>
          <Icon name={meta.icon} size={14} />
          <span style={{ color: 'var(--text-muted)' }}>{meta.label} · {q.difficulty}</span>
        </span>
        <span>{index + 1} / {queue.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 5, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          background: 'var(--gradient-accent)', height: '100%',
          width: `${progress}%`, borderRadius: 4,
          transition: 'width 0.4s ease',
          boxShadow: '0 0 8px rgba(240, 90, 40, 0.5)',
        }} />
      </div>

      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={flingStyle}>
        {/* Question */}
        <div className="card" style={{ marginBottom: 24, padding: '32px 28px', textAlign: 'center', boxShadow: '0 0 24px rgba(240, 90, 40, 0.08)' }}>
          <h2 style={{ fontSize: 24, lineHeight: 1.5, fontWeight: 600 }}>{q.title}</h2>
        </div>

        {!revealed ? (
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={() => setRevealed(true)}>Show Answer</button>
          </div>
        ) : (
          <>
            <div
              className="card answer-body reveal-in"
              style={{ marginBottom: 20, lineHeight: 1.7, fontSize: 15 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(q.body) }}
            />
            <div className="reveal-in" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.1s' }}>
              <button className="btn btn-ghost" style={{ borderColor: '#10b981', color: '#10b981' }} onClick={() => answer('got-it')}><Icon name="check" size={14} /> Got it</button>
              <button className="btn btn-ghost" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => answer('almost')}><Icon name="help-circle" size={14} /> Almost</button>
              <button className="btn btn-ghost" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => answer('nope')}><Icon name="x" size={14} /> Nope</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
