---
id: R27
title: "Validate the \"0\" advance in the token generator and pin it in the test"
layer: "wiring"
deps: []
acs: ["AC-05"]
files_hint: ["scripts/tokens/sources.ts", "scripts/tokens/generate.ts", "scripts/tokens/build.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R27 — Validate the "0" advance in the token generator and pin it in the test

## Why

Review round 4, S2-11. `zeroAdvance` (`scripts/tokens/sources.ts:30-34`) does not check the glyph: an unmapped code point returns `.notdef` (advance 1024, 0.5 em), which would silently give a wrong measure. `chToEm` (`scripts/tokens/generate.ts:39-43`) returns `NaNem`, `Infinityem`, `0em` and `-48em` for bad advances. The test at `scripts/tokens/build.test.ts:284` compares the value with the same expression copied into the test, so it cannot catch either.

## Definition of Done

- [x] Reading the "0" advance throws when the glyph id is 0 (.notdef) and when the ratio is not finite or not in (0, 1]; chToEm rejects such an advance too. The unit test pins the literal 1252 / 2048 instead of repeating the implementation, and a failure-path case covers a font without "0" and a bad advance. tokens:check stays in sync and tokens.css is unchanged.
- [x] `npm run lint` and `npm run test:unit` green
