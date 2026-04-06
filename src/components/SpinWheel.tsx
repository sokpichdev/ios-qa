// src/components/SpinWheel.tsx
import { useRef, useState, useEffect } from 'react';
import type { Question } from '../lib/questions';
import { CATEGORIES, CATEGORY_META } from '../lib/questions';

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

  function drawWheel(rot: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    segments.forEach((cat, i) => {
      const start = rot + i * segAngle;
      const end = start + segAngle;
      const meta = CATEGORY_META[cat];

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = meta.color + 'cc';
      ctx.fill();
      ctx.strokeStyle = '#0d0f14';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Sora, sans-serif';
      ctx.fillText(`${meta.emoji} ${meta.label}`, r - 12, 5);
      ctx.restore();
    });

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#0d0f14';
    ctx.fill();

    // Pointer (triangle pointing left, at right edge)
    const px = cx + r + 6;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px + 28, cy - 16);
    ctx.lineTo(px + 28, cy + 16);
    ctx.closePath();
    ctx.fillStyle = '#f05a28';
    ctx.fill();
  }

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, []);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const extraSpins = 5 + Math.random() * 5;
    const targetRot = rotationRef.current + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = 3500;
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

        // Determine winning segment: pointer is at angle 0 (right side)
        const normalized = ((targetRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const winAngle = (2 * Math.PI - normalized) % (2 * Math.PI);
        const winIndex = Math.floor(winAngle / segAngle) % segments.length;
        const winCategory = segments[winIndex];
        const pool = questions.filter(q => q.category === winCategory);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick) setResult(pick);
      }
    }

    requestAnimationFrame(frame);
  }

  const meta = result ? CATEGORY_META[result.category] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        style={{ display: 'block', maxWidth: '100%' }}
      />

      <button
        className="btn btn-primary"
        onClick={spin}
        disabled={spinning}
        style={{ minWidth: 140, justifyContent: 'center', fontSize: 16 }}
      >
        {spinning ? '🎡 Spinning...' : '🎡 Spin!'}
      </button>

      {result && meta && (
        <div className="card" style={{ maxWidth: 520, width: '100%' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            {meta.emoji} {meta.label} · {result.difficulty}
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
