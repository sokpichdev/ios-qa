'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import { TOPICS } from '@/lib/topics';
import { topicCounts } from '@/lib/questions';

export default function SpinWheel() {
  const topics = useMemo(() => {
    const counts = topicCounts();
    return TOPICS.filter((t) => counts.some((c) => c.name === t.name && c.total > 0));
  }, []);

  const n = topics.length;
  const seg = 360 / n;
  const rotationRef = useRef(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(typeof topics)[number] | null>(null);

  // Conic gradient bands, one per topic.
  const gradient = useMemo(() => {
    const stops = topics
      .map((t, i) => `${t.color} ${i * seg}deg ${(i + 1) * seg}deg`)
      .join(', ');
    return `conic-gradient(from -${seg / 2}deg, ${stops})`;
  }, [topics, seg]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const chosen = Math.floor(Math.random() * n);
    const base = rotationRef.current - (rotationRef.current % 360);
    const target = base + 360 * 5 + (360 - (chosen * seg + seg / 2));
    rotationRef.current = target;
    setRotation(target);
    window.setTimeout(() => {
      setResult(topics[chosen]);
      setSpinning(false);
    }, 4200);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 320, height: 320 }}>
        {/* Pointer */}
        <div
          className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2"
          style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid #e8eaf2' }}
        />
        {/* Wheel */}
        <div
          className="relative h-full w-full rounded-full"
          style={{
            background: gradient,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: '0 0 0 4px var(--border-strong), 0 12px 40px rgba(0,0,0,0.4)',
          }}
        >
          {topics.map((t, i) => (
            <div
              key={t.slug}
              className="absolute left-1/2 top-1/2 origin-left text-xs font-semibold text-white"
              style={{
                transform: `rotate(${i * seg + seg / 2}deg) translateX(40px)`,
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                whiteSpace: 'nowrap',
              }}
            >
              {t.name}
            </div>
          ))}
        </div>
        {/* Hub */}
        <div className="glass absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full">
          <Icon name="shuffle" size={22} />
        </div>
      </div>

      <button onClick={spin} disabled={spinning} className="btn-primary mt-8 disabled:opacity-50">
        {spinning ? 'Spinning…' : 'Spin the Wheel'}
      </button>

      <div className="mt-6 h-20">
        {result && (
          <div className="glass animate-fade-up flex flex-col items-center gap-3 rounded-xl px-6 py-4 text-center">
            <span className="text-muted text-sm">You landed on</span>
            <span className="flex items-center gap-2 text-lg font-bold" style={{ color: result.color }}>
              <Icon name={result.icon} size={20} /> {result.name}
            </span>
            <Link href={`/quiz?topic=${encodeURIComponent(result.name)}`} className="btn-ghost">
              Quiz this topic <Icon name="arrow-right" size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
