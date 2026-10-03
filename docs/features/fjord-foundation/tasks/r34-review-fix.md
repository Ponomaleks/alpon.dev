---
id: R34
title: "Test the .notdef guard through the real font lookup"
layer: "tests"
deps: []
acs: ["AC-05"]
files_hint: ["scripts/tokens/sources.ts", "scripts/tokens/build.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R34 — Test the .notdef guard through the real font lookup

## Why

Review round 5, S2-16. The failure-path test (`scripts/tokens/build.test.ts:296-298`) calls `zeroAdvanceEm(0, 1024, 2048)` with a hand-made glyph id. `zeroAdvance(path)` (`scripts/tokens/sources.ts:41-46`) is private and fixed to U+0030, so no test would fail if `glyph.id` were replaced by a constant or if fontkitten changed what it returns for an unmapped code point. The reviewer's probe showed that fontkitten returns id 0, advance 1024 for U+4E00 in this TTF, so the guard works today.

Owner's decision (2026-10-03): fix now.

## Definition of Done

- [x] The lookup takes a code-point parameter with a default that keeps today's behaviour (U+0030).
- [x] One test loads the real font file the script reads, asks for U+4E00 and expects the `.notdef` error.
- [x] `npm run tokens:check` output is unchanged; `src/styles/tokens.css` is not modified.
- [x] `npm run lint` and `npm run test:unit` green
