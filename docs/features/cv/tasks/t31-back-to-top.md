---
id: T31
title: "Add BackToTop to the Shell with its reserve"
layer: "ui"
deps: ["T28"]
acs: ["AC-21", "AC-22", "AC-29"]
files_hint: ["src/components/layout/BackToTop.astro", "src/components/layout/static-parts.test.ts", "src/layouts/BaseLayout.astro", "src/layouts/BaseLayout.test.ts", "src/styles/base.css", "scripts/lint/", "docs/features/base-components/adr/", "scripts/contrast-pairs.ts", "tests/e2e/back-to-top.spec.ts", "src/pages/styleguide.astro", "src/pages/_styleguide.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "L"
status: "todo"
---

# T31 — Add BackToTop to the Shell with its reserve

## Why

AC-21, AC-22, AC-29 ([spec §5](../spec.md)); [sad §8 BackToTop](../sad.md); [sad §5 Page options, `backToTop`](../sad.md); screens §Shell state changes, every `back-to-top …` row; wireframe W-6; [screens C-6](../screens.md); spec §1.3 D-07.

## What

- Reuses: the look of a secondary `ui/IconButton`, `ui/Icon` (`arrow-up`, T7), the reserve pattern `base.css` uses for the Sticky action bar.
- NEW `layout/BackToTop` (the inventory has no fixed Shell link): a link to `#top`, fixed, from 768 only; appearance by `animation-timeline: scroll()` under `@supports`, always visible without support, no movement with reduced motion.
- `BaseLayout`: option `backToTop` (default `true`); the Styleguide passes `false`. `base.css`: `scroll-padding-bottom` and the block at the end of the page.
- `styleguide.astro`: the section BackToTop in the flow, default, hover and focus.

## Definition of Done

- [ ] `src/layouts/BaseLayout.test.ts`: BackToTop is rendered by default, marked English on a Norwegian page, and absent with `backToTop: false`
- [ ] `static-parts.test.ts`: a link with the name "Back to top", `href="#top"`, no element has that id
- [ ] `tests/e2e/back-to-top.spec.ts`: not displayed at 390 and 767; at 768 / 834 / 1024 / 1440 on four pages: hidden and not focusable at the top where scroll-driven animation is supported, shown after scrolling, activating it gives scroll position 0 and the next Tab reaches the skip link, with JavaScript disabled too
- [ ] Same file: 0 px overlap with the last line and with the focused last footer link; ≥ 44 × 44; visible focus ring; with reduced motion no transform is animated
- [ ] The stylelint allow list has its recorded row and a rejecting fixture for `animation-timeline`, if it is not allowed yet
- [ ] `src/pages/_styleguide.test.ts`: the Styleguide has no fixed BackToTop and shows the sample section
- [ ] `npm run check:contrast` green with the control's pairs
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green
- [ ] `npm run test` green

## Notes

- Phase 5b. AC-21 and AC-22 are open until this task.
- No script (spec §1 notes for the design stage).
- A function or at-rule outside the stylelint allow lists enters only with a recorded row in base-components ADR-0004 and a rejecting fixture; check before writing the style.
- From this task the visual baselines of every page are stale at 834 and 1440 until T33.
- Lanes: `BaseLayout.astro` with T14 and T15; `styleguide.astro`; `static-parts.test.ts` with T14.
