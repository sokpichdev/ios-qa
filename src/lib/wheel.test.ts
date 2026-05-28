import { describe, it, expect } from 'vitest';
import { winningIndex, SEG_START } from './wheel';

describe('winningIndex', () => {
  const n = 9;

  it('returns segment 0 at rotation 0 (segment 0 centered under top pointer)', () => {
    expect(winningIndex(0, n)).toBe(0);
  });

  it('is invariant to full rotations', () => {
    expect(winningIndex(2 * Math.PI, n)).toBe(0);
    expect(winningIndex(-2 * Math.PI, n)).toBe(0);
  });

  it('rotating forward by one segment lands on the previous index', () => {
    const seg = (2 * Math.PI) / n;
    expect(winningIndex(seg, n)).toBe(n - 1);
    expect(winningIndex(2 * seg, n)).toBe(n - 2);
  });

  it('always returns an index in [0, n)', () => {
    for (let k = 0; k < 50; k++) {
      const idx = winningIndex(Math.random() * 100 - 50, n);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(n);
    }
  });

  it('exposes the segment start offset used by the drawing code', () => {
    const seg = (2 * Math.PI) / n;
    expect(SEG_START).toBeCloseTo(-Math.PI / 2 - seg / 2);
  });
});
