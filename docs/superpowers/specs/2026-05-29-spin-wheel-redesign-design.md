# Spin Wheel Redesign — Design

**Date:** 2026-05-29
**Branch:** `feat/spin-wheel-redesign`
**Component:** `src/components/SpinWheel.tsx` (used by `src/pages/spin.astro`)

## Goal

Refresh the spin wheel with a clean *Flat Minimal* look, a more polished result
reveal, and tidier code — while keeping the existing mechanics: the wheel lands
on a **category**, then reveals a **random question** from that category. Pure
random, no repeat-avoidance.

## Non-Goals

- No change to spin mechanics (segments stay categories, not individual questions).
- No difficulty pre-filter, no seen-question tracking / localStorage.
- No modal/overlay reveal.
- No changes to other pages or shared components beyond what this component needs.

## 1. Visual Style — Flat Minimal

- Solid flat category-color fills (no alpha, no gradients), using the existing
  `CATEGORY_META[cat].color` values.
- Crisp dividers between segments in `--bg` (`#0d0f14`), ~3px wide.
- Clean dark central hub (`--bg` fill) ringed with `--border` (`#2a2d3e`), ~18px radius.
- Segment labels: `600 11px Sora, sans-serif`, white, right-aligned along each
  segment radius (as today).
- **DPR-aware rendering:** size the canvas backing store to
  `cssSize * devicePixelRatio` and scale the context, so the wheel is sharp on
  retina displays (fixes current blur). CSS display size stays responsive
  (`maxWidth: 100%`).

## 2. Layout & Controls

- Centered vertical column: wheel → Spin button → result card. Same structure as today.
- Pointer relocated to the **top** of the wheel: small downward-pointing triangle
  in `--text` color.
- Spin button (`btn btn-primary`) sits below the wheel.
- **Click-to-spin:** clicking the wheel canvas also triggers a spin. The button
  remains for clarity and keyboard accessibility (the canvas click is an
  enhancement, not the only path).
- During spin: button disabled, label "Spinning…"; wheel click ignored while spinning.

## 3. Spin Animation

- Keep ease-out cubic easing, ~3.5s duration, 5–10 full rotations plus a random offset.
- **Winner calculation updated for the top pointer.** The pointer now sits at
  angle `-π/2` (12 o'clock) instead of `0` (right edge). The winning-segment
  index math must account for this new pointer angle and the segment start
  offset used when drawing.

## 4. Result Reveal

- Keep the result card **below** the wheel (no modal).
- Add a **fade + slide-in** animation when the result appears.
- Add a **category-colored left accent border** on the card
  (`borderLeft: 4px solid <category color>`).
- Card contents (unchanged): category chip (emoji + label) · difficulty, question
  title, "See Answer →" link to `${base}/questions/${result.id}`.

## 5. Code Quality

- Extract wheel drawing into a focused pure-ish helper (takes ctx, segments,
  rotation, sizing) to keep `spin()` and the component body readable.
- Add DPR-aware sizing in the draw/init path.
- Fix the winner-index calculation for the top pointer position.
- Preserve the existing empty-state guard (no categories → friendly message).

## 6. Testing / Verification

- `npm run build` passes with no errors.
- Manual verification: after a spin, the segment under the **top** pointer matches
  the category shown in the result card. Spin several times to confirm alignment.
- Verify click-to-spin and the button both work, and both are disabled mid-spin.
- Verify the wheel renders sharply on a retina display.
