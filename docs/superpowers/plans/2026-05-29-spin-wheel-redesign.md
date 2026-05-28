# Spin Wheel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the spin wheel with a flat-minimal look, top pointer, click-to-spin, DPR-sharp rendering, and an animated category-accented result card, keeping the existing category→random-question mechanics.

**Architecture:** Extract the bug-prone winner-index math into a pure helper (`src/lib/wheel.ts`) covered by a Vitest unit test. Refactor `SpinWheel.tsx` to use it, add DPR-aware canvas sizing, a flat-minimal draw routine with a top pointer, click-to-spin, and a fade/slide-in result card. The page (`spin.astro`) is unchanged.

**Tech Stack:** Astro 5, React 18 (canvas 2D), TypeScript, Vitest (new dev dependency for the unit test).

---

### Task 1: Pure winner-index helper + test

The wheel draws segment `i` starting at angle `rot + i*segAngle`, where the draw
rotation offset places the first segment so labels read correctly. The pointer
now sits at the **top** (`-π/2`). Given the final rotation, we need the index of
the segment currently under the top pointer.

Convention for this plan (must match the draw code in Task 3):
- Segments are drawn starting at base offset `START = -Math.PI/2 - segAngle/2`,
  so segment 0 is centered under the top pointer at rotation 0.
- Therefore at final rotation `rot`, the index under the top pointer is:
  `winningIndex(rot, n)` = `((-Math.round? no)` — computed as below.

**Files:**
- Create: `src/lib/wheel.ts`
- Create: `src/lib/wheel.test.ts`
- Modify: `package.json` (add vitest + test script)

- [ ] **Step 1: Add Vitest dev dependency and test script**

Run:
```bash
npm install -D vitest@^2.0.0
```

Then edit `package.json` `scripts` to add:
```json
"test": "vitest run"
```
(Keep existing `dev`, `build`, `preview` scripts.)

- [ ] **Step 2: Write the failing test**

Create `src/lib/wheel.test.ts`:
```ts
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
    // Wheel rotates clockwise(+); the segment under a fixed top pointer changes by -1 per +seg.
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
    expect(SEG_START).toBeCloseTo(-Math.PI / 2 - seg / 2 + seg / 2 - seg / 2);
  });
});
```

Note: the last assertion just documents that `SEG_START` is defined; its exact
value is set in Step 4. Adjust the expected value there to match.

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find module `./wheel` / `winningIndex is not defined`.

- [ ] **Step 4: Write minimal implementation**

Create `src/lib/wheel.ts`:
```ts
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
 * The wheel rotates by `rot` radians (clockwise positive). Segment i occupies
 * [segStart + i*seg, segStart + (i+1)*seg) before rotation. The top pointer is
 * fixed at -PI/2. We find which segment maps under it after rotation.
 */
export function winningIndex(rot: number, n: number): number {
  const seg = TAU / n;
  // Pointer angle relative to the (rotated) segment 0 start.
  // Angle from segStart to pointer, undoing the rotation:
  let a = (-Math.PI / 2) - (segStart(n) + rot);
  a = ((a % TAU) + TAU) % TAU; // normalize to [0, TAU)
  return Math.floor(a / seg) % n;
}
```

After writing, update the `SEG_START` assertion in Step 2's test if its
expected value doesn't match `-Math.PI/2 - Math.PI/9` — they should be equal,
so the `toBeCloseTo` expression simplifies to `-Math.PI/2 - seg/2`. Replace that
test's expected expression with: `expect(SEG_START).toBeCloseTo(-Math.PI/2 - seg/2);`

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS (5 tests). If the "one segment forward" direction assertion
fails, the sign of the rotation term in `winningIndex` is inverted — flip
`(segStart(n) + rot)` handling accordingly and re-run until the directional
tests pass. The drawing code in Task 3 MUST use the same `segStart`/rotation
convention.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/wheel.ts src/lib/wheel.test.ts
git commit -m "feat: pure winningIndex helper with tests for top-pointer wheel"
```

---

### Task 2: Flat-minimal draw routine + DPR sizing + top pointer

Refactor the canvas rendering in `SpinWheel.tsx` to a flat-minimal style, sharp
on retina, with the pointer at the top. This task is verified by `npm run build`
and manual inspection (no unit test — it's pure drawing).

**Files:**
- Modify: `src/components/SpinWheel.tsx`

- [ ] **Step 1: Import the helper and define drawing constants**

At the top of `src/components/SpinWheel.tsx`, add:
```tsx
import { winningIndex, segStart } from '../lib/wheel';
```

- [ ] **Step 2: Replace `drawWheel` with flat-minimal + DPR-aware version**

Replace the existing `drawWheel` function and the `useEffect` init with:
```tsx
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

    // Flat solid segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = meta.color;
    ctx.fill();
    ctx.strokeStyle = '#0d0f14';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + segAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 12px Sora, sans-serif';
    ctx.fillText(`${meta.emoji} ${meta.label}`, r - 14, 4);
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
  ctx.moveTo(cx, 16);
  ctx.lineTo(cx - 12, -2);
  ctx.lineTo(cx + 12, -2);
  ctx.closePath();
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
}

useEffect(() => {
  drawWheel(rotationRef.current);
}, []);
```

- [ ] **Step 3: Update the canvas element to use fixed CSS size**

Replace the `<canvas .../>` element with:
```tsx
<canvas
  ref={canvasRef}
  onClick={spin}
  style={{ display: 'block', maxWidth: '100%', cursor: spinning ? 'default' : 'pointer' }}
/>
```
(Width/height attributes are now managed in `drawWheel` for DPR; the `onClick`
adds click-to-spin — `spin()` already guards against re-entry when `spinning`.)

- [ ] **Step 4: Build to verify**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/SpinWheel.tsx
git commit -m "feat: flat-minimal wheel, DPR-sharp rendering, top pointer, click-to-spin"
```

---

### Task 3: Use winningIndex in spin() + animated result card

Wire the spin completion to the new helper and polish the result card.

**Files:**
- Modify: `src/components/SpinWheel.tsx`
- Modify: `src/styles/global.css` (add a small keyframe animation)

- [ ] **Step 1: Replace winner calculation in `spin()`**

In the `frame` function's completion branch (`else` of `t < 1`), replace the
winner-angle block:
```tsx
// OLD:
// const normalized = ((targetRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
// const winAngle = (2 * Math.PI - normalized) % (2 * Math.PI);
// const winIndex = Math.floor(winAngle / segAngle) % segments.length;
```
with:
```tsx
const winIndex = winningIndex(targetRot, segments.length);
```
Keep the surrounding lines (`rotationRef.current = targetRot % (2*Math.PI)`,
`setSpinning(false)`, building `winCategory`/`pool`/`pick`, `setResult(pick)`).

- [ ] **Step 2: Add the reveal keyframe to global.css**

Append to `src/styles/global.css`:
```css
@keyframes wheelResultIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.wheel-result { animation: wheelResultIn 0.35s ease-out; }
```

- [ ] **Step 3: Apply class + category accent to the result card**

Replace the result card `<div className="card" ...>` opening tag with:
```tsx
<div
  className="card wheel-result"
  style={{
    maxWidth: 520,
    width: '100%',
    borderLeft: `4px solid ${meta.color}`,
  }}
>
```
(Keep the inner contents — category line, title, "See Answer →" link — unchanged.)

- [ ] **Step 4: Build to verify**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open the Spin page, and:
- Spin several times; confirm the category in the result card matches the
  segment under the **top** pointer when the wheel stops.
- Confirm clicking the wheel and clicking the button both spin, and both are
  inert mid-spin.
- Confirm the result card fades/slides in with a colored left border.
- Confirm the wheel renders sharply (no blur) on a retina display.

- [ ] **Step 6: Commit**

```bash
git add src/components/SpinWheel.tsx src/styles/global.css
git commit -m "feat: use winningIndex for top pointer, animated category-accented result card"
```

---

## Self-Review Notes

- **Spec coverage:** §1 flat style + DPR → Task 2; §2 top pointer + click-to-spin + button → Tasks 2/3 (button label/disabled already exist in component, unchanged); §3 animation + winner math → Tasks 1 & 3; §4 result reveal → Task 3; §5 code quality (extract helper, fix winner math) → Tasks 1–3; §6 build + manual → Task 3 Step 5.
- **Type consistency:** `winningIndex(rot, n)` and `segStart(n)` signatures are used identically in `wheel.ts`, `wheel.test.ts`, and `SpinWheel.tsx`. The draw code (Task 2) and winner code (Task 3) both anchor on `segStart(segments.length)`.
- **Direction caveat:** Task 1 Step 5 explicitly instructs verifying/flipping the rotation sign so the directional tests pass, since clockwise-vs-counterclockwise is the easiest thing to get backwards; the manual check in Task 3 Step 5 is the final guard.
```
