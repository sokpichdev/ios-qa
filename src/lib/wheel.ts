// Base angle at which segment 0 begins when rotation = 0.
// Chosen so segment 0 is centered under the top pointer (-PI/2).
export function segStart(n: number): number {
  return -Math.PI / 2 - Math.PI / n; // = -PI/2 - segAngle/2
}

// Backwards-compat constant for n=9 (the current category count) used in tests.
export const SEG_START = segStart(9);

const TAU = 2 * Math.PI;

/**
 * Index of the segment under the TOP pointer given the wheel's final rotation.
 */
export function winningIndex(rot: number, n: number): number {
  const seg = TAU / n;
  let a = (-Math.PI / 2) - (segStart(n) + rot);
  a = ((a % TAU) + TAU) % TAU; // normalize to [0, TAU)
  return Math.floor(a / seg) % n;
}
