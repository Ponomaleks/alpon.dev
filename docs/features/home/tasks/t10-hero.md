---
id: T10
title: "Build the Hero section with the Now line and the pointer parallax"
layer: "ui"
deps: ["T1", "T2", "T9"]
acs: ["AC-01", "AC-03", "AC-04", "AC-31"]
files_hint: ["src/components/home/Hero.astro", "src/components/home/hero.test.ts", "src/scripts/home/parallax.ts", "src/scripts/home/parallax.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T10 — Build the Hero section with the Now line and the pointer parallax

## Why

AC-01, AC-03, AC-04, AC-31 ([spec §5](../spec.md)); spec §1.3 D-05, D-06; [sad §1 Decision override, §8 Hero parallax](../sad.md); [screens.md SCR-01 hero states, wireframes H-1, H-2](../screens.md).

## What

- Builds SCR-01 states: hero below 768 / 768 to 1023 / 1024 and wider, hero Dag / Natt, now-line with and without project, hero actions without projects.
- Reuses: `ui/Badge` (availability), `ui/Button` (primary, large, `file-text`), `home/Portrait`, `home/MotionControl`, `brand/Contours`; data from `home.ts`, `contact.ts` (`workRegion`, `workRegionGeo`) and `site.ts`.
- `home/Hero.astro`: badge row with the Motion control at its end (T-5), eyebrow "Hei." / "Oslo, Norge" (`lang="no"`) with the coordinates, `h1`, both roles, the lead, one primary "View CV" to `/cv`, the Now line ("Nå:" with `lang="no"`). "See projects" is rendered only when `features.projects` is true.
- `src/scripts/home/parallax.ts`: exported `initParallax()`; sets `--fj-px` and `--fj-py` with `style.setProperty` on the contours layer, only under `(hover: hover) and (pointer: fine)` and without reduced motion.

## Definition of Done

- [ ] `src/components/home/hero.test.ts`: content, `lang` marks, coordinates from `contact.ts`, one primary button, both Now line states
- [ ] `src/scripts/home/parallax.test.ts`: fine pointer writes both properties within the limit; reduced motion and coarse pointer write nothing; no `setAttribute("style")` and no `cssText`
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Parallax is the one named exception to "scripts never write styles" (sad §1): two custom properties, one element, `setProperty` only.
- The 390 × 844 first-screen measurement needs the whole page and is T20.
