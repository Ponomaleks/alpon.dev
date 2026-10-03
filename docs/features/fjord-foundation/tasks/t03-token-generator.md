---
id: T3
title: "Generate tokens.css from the design sources with Dag, Natt and the no-JS Natt block"
layer: "wiring"
deps: ["T1"]
acs: ["AC-01", "AC-02", "AC-04"]
files_hint: ["scripts/tokens/", "src/styles/tokens.css"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T3 — Generate tokens.css from the design sources with Dag, Natt and the no-JS Natt block

## Why

[ADR-0001](../adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks.md) (generator section); [sad §8 Fjord tokens / Theme](../sad.md). Theme correctness with and without scripts (AC-01, AC-02, AC-04) rests on these blocks.

## What

- `scripts/tokens/build.ts` (+ small parse helpers in `scripts/tokens/`): read `design/handoff/design-system/project/tokens/{colors,spacing,typography,motion}.css` and `design/brand/tokens.json`.
- Emit `src/styles/tokens.css`: "generated — do not edit" header; `:root` (palette from `tokens.json`, Dag semantics, non-color tokens, `color-scheme: light`); `[data-theme="dag"]`; `[data-theme="natt"]` (`color-scheme: dark`); `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }` with the same Natt list; `.fjord-on-spruce`; the responsive overrides.
- `scripts/tokens/build.test.ts`.

## Definition of Done

- [ ] Running the generator produces a committed `tokens.css` with the six parts above, in that order
- [ ] Vitest: a handoff palette value differing from `tokens.json` fails and names token, brand value and handoff value
- [ ] Vitest: the `[data-theme="natt"]` and no-JS Natt declaration lists are identical (including `--fjord-shadow-float` from `spacing.css`)
- [ ] Vitest: a Natt-only declaration added to a fixture handoff file appears in both Natt blocks
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- `design/` is read-only: the generator only reads it.
- Node 24 runs `.ts` directly (type stripping); check the current flag behaviour before relying on it, else run through a dev runner and say why in the PR.
- Same files as T4 (serialized). Runs parallel to T2.
