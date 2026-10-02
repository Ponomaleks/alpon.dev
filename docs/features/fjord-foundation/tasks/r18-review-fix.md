---
id: R18
title: "Classify scale tokens by handoff usage and reject movement tokens outside motion.css"
layer: "wiring"
deps: []
acs: ["AC-14"]
files_hint: ["scripts/tokens/generate.ts", "scripts/tokens/build.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R18 — Classify scale tokens by handoff usage and reject movement tokens outside motion.css

## Why

Review follow-up S2-05 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [ ] generate.ts classifies each *-scale token from the handoff CSS: scale(var(--x)) is a factor (reduced to 1), calc(1 + var(--x)) is a delta (reduced to 0); it throws when neither is found and when a rise/slide/parallax/scale token is declared outside motion.css. Unit tests cover factor, delta, unclassified and misplaced tokens; tokens:check passes.
- [ ] `npm run lint` and `npm run test:unit` green
