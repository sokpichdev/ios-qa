// src/components/Quiz.tsx
import { useState } from 'react';
import type { Question } from '../lib/questions';
import { CATEGORIES, CATEGORY_META } from '../lib/questions';
import { renderMarkdown } from '../lib/renderMarkdown';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

interface Props {
  questions: Question[];
}

type QuizStatus = 'idle' | 'running' | 'done';
type Score = 'got-it' | 'almost' | 'nope';

export default function Quiz({ questions }: Props) {
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<Record<string, Score>>({});

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
    if (index + 1 >= queue.length) {
      setStatus('done');
    } else {
      setIndex(i => i + 1);
      setRevealed(false);
    }
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button style={inputStyle} className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>All</button>
          {CATEGORIES.map(cat => (
            <button key={cat} style={inputStyle} className={`chip ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
              {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>DIFFICULTY</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
        <h2 style={{ marginBottom: 24, fontSize: 24 }}>Quiz Complete!</h2>
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

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
        <span>{meta.emoji} {meta.label} · {q.difficulty}</span>
        <span>{index + 1} / {queue.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 4, marginBottom: 24 }}>
        <div style={{ background: 'var(--accent)', height: '100%', width: `${progress}%`, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, lineHeight: 1.5, fontWeight: 600 }}>{q.title}</h2>
      </div>

      {!revealed ? (
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => setRevealed(true)}>Show Answer</button>
        </div>
      ) : (
        <>
          <div
            className="card answer-body"
            style={{ marginBottom: 20, lineHeight: 1.7, fontSize: 15 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(q.body) }}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" style={{ borderColor: '#10b981', color: '#10b981' }} onClick={() => answer('got-it')}>✅ Got it</button>
            <button className="btn btn-ghost" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => answer('almost')}>🤔 Almost</button>
            <button className="btn btn-ghost" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => answer('nope')}>❌ Nope</button>
          </div>
        </>
      )}
    </div>
  );
}
