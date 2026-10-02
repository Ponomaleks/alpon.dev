---
id: R5
title: "Not-found: unclipped focus ring, arrow icon from tokens, measured 44px target"
layer: "ui"
deps: ["R3", "R4"]
acs: ["AC-07"]
files_hint: ["src/pages/404.astro", "src/pages/_404.test.ts", "tests/e2e/not-found.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R5 — Not-found: unclipped focus ring, arrow icon from tokens, measured 44px target

## Why

Review follow-up F-08, F-14, F-20 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] .not-found no longer clips its children (the ridge clips itself); an e2e check shows the focused 'Back to home' outline box lies inside the section and the link's rendered height is >= 44px at 390 and 1440; the arrow's size and stroke come from --fjord-icon-sm / --fjord-icon-stroke in CSS; build, lint, unit, e2e green.
- [ ] `npm run lint` and `npm run test:unit` green
