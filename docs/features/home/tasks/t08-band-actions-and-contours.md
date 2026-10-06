---
id: T8
title: "Give the closing band its actions from a page option, its top margin and scroll-tied contours"
layer: "ui"
deps: ["T5"]
acs: ["AC-40", "AC-41"]
files_hint: ["src/data/shell-actions.ts", "src/components/layout/CtaBand.astro", "src/components/layout/static-parts.test.ts", "src/layouts/BaseLayout.astro", "src/layouts/BaseLayout.test.ts", "stylelint.config.js", "scripts/lint/"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T8 — Give the closing band its actions from a page option, its top margin and scroll-tied contours

## Why

AC-40, AC-41 ([spec §5](../spec.md)); spec §1.3 D-12, D-13; [ADR-0002](../adr/0002-pass-shell-actions-as-typed-descriptors-through-page-options.md); backlog B-18 (the band half); [sad §8 Closing band contours](../sad.md); [screens.md cta-band](../screens.md).

## What

- Reuses: `layout/CtaBand`, `brand/Contours`, `ui/Button`.
- `shell-actions.ts`: the `BandAction` type (with a variant), the default pair ("Get in touch" primary, "Download CV") and the home pair ("Save contact (.vcf)" and "Download CV", both secondary). `BaseLayout` gains `ctaBandActions`; "Download CV" keeps following `cvLang`.
- `CtaBand.astro`: the design top margin; the contours shift through a CSS scroll-driven animation (`animation-timeline: view()`) under `@supports` and `prefers-reduced-motion: no-preference`. No script.

## Definition of Done

- [ ] `src/components/layout/static-parts.test.ts`: default pair, home pair, `download` attributes, `cvLang`
- [ ] Same test: the band style has the top margin token and no time-based animation
- [ ] `src/layouts/BaseLayout.test.ts`: `ctaBandActions` reaches the band
- [ ] `scripts/lint/stylelint.test.ts`: one passing and one rejected fixture per new allow-list entry (if any), recorded in base-components ADR-0004
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- The band moving only with scrolling, and standing still otherwise, is measured in a browser in T24.
- Lane: `shell-actions.ts` (T5) and `BaseLayout.astro` (T4, T5, T7).
