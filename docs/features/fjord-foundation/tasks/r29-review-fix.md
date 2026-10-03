---
id: R29
title: "Correct the R20 definition of done from rem to em"
layer: "docs"
deps: []
acs: ["AC-05"]
files_hint: ["docs/features/fjord-foundation/tasks.json", "docs/features/fjord-foundation/tasks/r20-review-fix.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R29 — Correct the R20 definition of done from rem to em

## Why

Review round 4, S1-09. The R20 definition of done (`tasks.json:624`, `tasks/r20-review-fix.md:21`) is ticked with the wording "in rem", but the code emits `em` (`src/styles/tokens.css:109-110`). `em` is the right unit: the paragraph uses the fluid `--fjord-text-lead`, so no single `rem` value reproduces `48ch`. The deviation is explained only in the task notes.

## Definition of Done

- [x] The R20 definition of done in tasks.json and tasks/r20-review-fix.md says the measures are emitted in em, matching src/styles/tokens.css.
- [x] `npm run lint` and `npm run test:unit` green
