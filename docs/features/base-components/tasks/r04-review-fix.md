---
id: R4
title: "Show hover and focus demo states for theme-switch segments and header links on the Styleguide"
layer: "ui"
deps: ["R1"]
acs: ["AC-21"]
files_hint: ["src/components/layout/ThemeToggle.astro", "src/components/layout/Header.astro", "src/pages/styleguide.astro", "src/pages/_styleguide.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R4 — Show hover and focus demo states for theme-switch segments and header links on the Styleguide

## Why

Review round 1 ([review-2026-10-04](../_review/review-2026-10-04.md)), S1-01. screens.md SCR-04 declares `data-demo-state` hover / focus for "ThemeToggle segments, header links" and "segment hover / focus" in the Theme switch row. Only Button, IconButton and Link have the hook, so these states have no sample and no visual baseline.

## Definition of Done

- [ ] `ThemeToggle.astro` and `Header.astro` carry `[data-demo-state]` selectors beside their `:hover` and `:focus-visible` rules.
- [ ] The Styleguide Theme switch section shows a hover and a focus segment sample; the Header variants section shows a hover and a focus header-link sample.
- [ ] `src/pages/_styleguide.test.ts` asserts the new samples.
- [ ] The `styleguide-theme-switch-*` and `styleguide-header-variants-*` baselines are regenerated through the `visual-baselines` PR label.
- [ ] `npm run lint` and `npm run test:unit` green
