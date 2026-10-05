---
id: T9
title: "Build Portrait, the Motion control and the Ambient motion of the hero under data-motion"
layer: "ui"
deps: ["T3"]
acs: ["AC-02", "AC-30", "AC-31"]
files_hint: ["src/components/home/Portrait.astro", "src/components/home/MotionControl.astro", "src/components/home/motion.test.ts", "src/components/brand/Contours.astro", "src/components/brand/brand.test.ts", "src/scripts/home/motion.ts", "src/scripts/home/motion.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T9 — Build Portrait, the Motion control and the Ambient motion of the hero under data-motion

## Why

AC-02, AC-30, AC-31 ([spec §5](../spec.md)); spec §1.3 D-01, D-02; [ADR-0003](../adr/0003-run-ambient-motion-only-under-a-state-attribute-the-page-script-sets.md); [sad §6 Critical flow 2, §8 Ambient motion, Motion control, Portrait](../sad.md); [screens.md SCR-01 portrait, motion states, T-5](../screens.md).

## What

- Reuses: `ui/IconButton`, `ui/Icon` (`play`, `pause`), `brand/Contours`, the motion tokens `--fjord-duration-drift` and `--fjord-duration-float`.
- `home/Portrait.astro`: `<picture>` with AVIF and WebP sources from `public/img/portrait-v1-{340,680}.*`, `srcset`, `sizes` (200 / 260 / 340), `width` and `height` by hand, round frame, alt "Alexander Ponomarenko", not lazy-loaded.
- `home/MotionControl.astro`: an IconButton with both icons, "Pause animation" / "Play animation", `aria-pressed`, displayed only when `data-motion` exists on the hero; its place is reserved.
- `brand/Contours.astro`: the corner shape of the hero, a drift animation and a separate layer for the parallax. Drift and the portrait float are paused by default and run only under `[data-motion="running"]`.
- `src/scripts/home/motion.ts`: exported `initMotion()`; reads `fjord-motion` from `sessionStorage` inside try and catch, sets `data-motion`, toggles it on click, sets nothing under reduced motion and removes the attribute if the device setting changes.

## Definition of Done

- [ ] `src/scripts/home/motion.test.ts`: the six cases above
- [ ] `src/components/home/motion.test.ts`: Portrait markup; Motion control hidden without `data-motion`; names and `aria-pressed` per state
- [ ] `src/components/brand/brand.test.ts`: the corner shape and the parallax layer are `aria-hidden` and carry no `style` attribute
- [ ] Stylelint 0 findings: durations only from motion tokens
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- The four portrait files are already in `public/img/` (commit 6b331c4); they are not re-exported here.
- `loading` and `fetchpriority` are decided from the Lighthouse LCP element in T19, not by default.
- The script sets an attribute only: no class, no inline style.
