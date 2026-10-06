---
id: T22
title: "Verify the 18 header states and the primary-button count on every Visitor page"
layer: "tests"
deps: ["T15"]
acs: ["AC-33", "AC-34", "AC-40"]
files_hint: ["tests/e2e/header-states.spec.ts", "tests/e2e/primary-count.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T22 — Verify the 18 header states and the primary-button count on every Visitor page

## Why

AC-33, AC-34, AC-40 ([spec §5](../spec.md)); spec §6 "Header states", "Primary buttons"; [ADR-0001](../adr/0001-mark-the-header-over-the-hero-with-a-server-rendered-state-attribute.md); [sad §8 One primary](../sad.md).

## What

- `tests/e2e/header-states.spec.ts`: computed styles of the header at 390, 834 and 1440, in Dag and Natt, at the top of the page, scrolled over the hero and after it; the back-button return at a scrolled position; scripts off.
- `tests/e2e/primary-count.spec.ts`: the home page at the top, over the contact section and at the end; the Not-found page; the bar and the home band hold none.

## Definition of Done

- [ ] `tests/e2e/header-states.spec.ts`: 3 widths × 2 themes × 3 positions, border included (AC-33)
- [ ] Same spec: back button at a scrolled position; scripts off
- [ ] `tests/e2e/primary-count.spec.ts`: the counts above (AC-34); the home band offers "Save contact (.vcf)" and "Download CV" and no "Get in touch" (AC-40)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- States are asserted at fixed scroll positions, not by timing (sad §8).
- Lane: `primary-count.spec.ts` (T5, T7).
