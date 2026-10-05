---
id: T5
title: "Build Badge, Tag, Stat and SectionHeader with Eyebrow"
layer: "ui"
deps: ["T2"]
acs: ["AC-25", "AC-21"]
files_hint: ["src/components/ui/Badge.astro", "src/components/ui/Tag.astro", "src/components/ui/Stat.astro", "src/components/ui/SectionHeader.astro", "src/components/ui/content.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T5 — Build Badge, Tag, Stat and SectionHeader with Eyebrow

## Why

AC-25 (Stat), AC-21 ([spec §5](../spec.md)); [screens.md SCR-04 rows Badge, Tag, Stat, SectionHeader](../screens.md); spec §1.2 IS-05.

## What

- Reuse: tokens and base styles. Secondary reference: the site copy components `content/*.css`.
- `Badge`: availability (open / talking / employed) and status (live / progress / archived) as two variants of one component. `Tag` plus a wrapping list. `Stat` and a row of Stats: final number and label, no count-up. `SectionHeader` with optional Eyebrow and lead, sizes as in the design system.

## Definition of Done

- [ ] `src/components/ui/content.test.ts`: each variant listed in screens.md renders; `Stat` output holds the final number as text and the component has no `<script>`
- [ ] Same test: `SectionHeader` renders the heading level it is given, with and without eyebrow and lead
- [ ] Stylelint 0 findings; no dot-only status meaning (the label text is always present)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- No page uses these yet (IS-05); the Styleguide (T16) is their only surface. Parallel to T4 and T7.
