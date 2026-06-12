// src/components/SpinWheel.tsx
import { useRef, useState, useEffect } from 'react';
import type { Question } from '../lib/questions';
import { CATEGORIES, CATEGORY_META } from '../lib/questions';
import { winningIndex, segStart } from '../lib/wheel';
import Icon from './Icon';

interface Props {
  questions: Question[];
  base: string;
}

export default function SpinWheel({ questions, base }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Question | null>(null);
  const rotationRef = useRef(0);

  const segments = CATEGORIES.filter(cat => questions.some(q => q.category === cat));

  if (segments.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '64px 0' }}>
        <p>No questions available to spin.</p>
      </div>
    );
  }

  const segAngle = (2 * Math.PI) / segments.length;

  const SIZE = 340; // CSS px

  function drawWheel(rot: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== SIZE * dpr) {
      canvas.width = SIZE * dpr;
      canvas.height = SIZE * dpr;
      canvas.style.width = SIZE + 'px';
      canvas.style.height = SIZE + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const r = cx - 14;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const start0 = segStart(segments.length);

    segments.forEach((cat, i) => {
      const start = rot + start0 + i * segAngle;
      const end = start + segAngle;
      const meta = CATEGORY_META[cat];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = meta.color;
      ctx.fill();
      ctx.strokeStyle = '#0d0f14';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 12px Sora, sans-serif';
      ctx.fillText(meta.label, r - 14, 4);
      ctx.restore();
    });

    // Clean hub
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#0d0f14';
    ctx.fill();
    ctx.strokeStyle = '#2a2d3e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top pointer (triangle pointing down into the wheel)
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx - 12, 2);
    ctx.lineTo(cx + 12, 2);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
  }

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, []);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const extraSpins = reduced ? 0.5 : 5 + Math.random() * 5;
    const targetRot = rotationRef.current + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = reduced ? 400 : 3500;
    const startTime = performance.now();
    const fromRot = rotationRef.current;

    function ease(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const currentRot = fromRot + (targetRot - fromRot) * ease(t);
      drawWheel(currentRot);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        rotationRef.current = targetRot % (2 * Math.PI);
        setSpinning(false);

        const winIndex = winningIndex(targetRot, segments.length);
        const winCategory = segments[winIndex];
        const pool = questions.filter(q => q.category === winCategory);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick) setResult(pick);
      }
    }

    requestAnimationFrame(frame);
  }

  const meta = result ? CATEGORY_META[result.category] : null;

  // Particle burst dots fan out from the wheel center on spin completion
  const burstDots = result ? Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 2 * Math.PI;
    return {
      bx: `${Math.cos(angle) * 190}px`,
      by: `${Math.sin(angle) * 190}px`,
      color: meta?.color ?? 'var(--accent)',
    };
  }) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div className={`wheel-wrap burst ${spinning ? 'spinning' : ''}`}>
        <canvas
          ref={canvasRef}
          onClick={spin}
          style={{ display: 'block', maxWidth: '100%', cursor: spinning ? 'default' : 'pointer' }}
        />
        {burstDots.map((d, i) => (
          <span
            key={`${result!.id}-${i}`}
            className="burst-dot"
            style={{ '--bx': d.bx, '--by': d.by, background: d.color } as React.CSSProperties}
          />
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={spin}
        disabled={spinning}
        style={{ minWidth: 140, justifyContent: 'center', fontSize: 16 }}
      >
        <Icon name="disc" size={16} />
        {spinning ? 'Spinning...' : 'Spin!'}
      </button>

      {result && meta && (
        <div
          className="card wheel-result"
          style={{
            maxWidth: 520,
            width: '100%',
            borderLeft: `4px solid ${meta.color}`,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: meta.color, display: 'inline-flex' }}><Icon name={meta.icon} size={14} /></span>
            {meta.label} · {result.difficulty}
          </div>
          <p style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.4, marginBottom: 16 }}>
            {result.title}
          </p>
          <a href={`${base}/questions/${result.id}`} className="btn btn-ghost" style={{ fontSize: 14 }}>
            See Answer →
          </a>
        </div>
      )}
    </div>
  );
}
