---
id: T4
title: "Extend the generator with reduced-motion tokens, fallback font stacks and --check mode"
layer: "wiring"
deps: ["T3"]
acs: ["AC-05", "AC-14"]
files_hint: ["scripts/tokens/", "src/styles/tokens.css", "package.json"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T4 — Extend the generator with reduced-motion tokens, fallback font stacks and --check mode

## Why

[sad §8 Motion and Fonts](../sad.md); [ADR-0001 Guards](../adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks.md); AC-14 (fades only) and AC-05 (no shift on swap).

## What

- Reduced motion: under `@media (prefers-reduced-motion: reduce)` set rise, slide, parallax and scale distance tokens and the count-up duration to 0; add `--fjord-duration-fade` (200 ms) in both modes; leave durations otherwise intact; a comment marks the deliberate deviation from the handoff `motion.css`.
- Font stacks: `--fjord-font-sans` / `--fjord-font-mono` list the brand family, then `"… Fallback Arial"`, `"… Fallback Roboto"`, then the generic family.
- `--check`: regenerate in memory, compare with the committed file, exit non-zero naming `src/styles/tokens.css` if different.
- `package.json`: `tokens:build` and `tokens:check`; `lint` runs `tokens:check`.

## Definition of Done

- [ ] `tokens.css` contains the reduced-motion block and `--fjord-duration-fade`; the PR design-deviation list mentions it
- [ ] Font stack names match the face names in `src/styles/fonts.css` (T2) exactly
- [ ] Vitest: `--check` exits 0 on a fresh file and non-zero, naming the file, on a stale one
- [ ] `npm run lint` runs the check and is green

## Notes

- Font face names are the contract shared with T2; if T2 has not landed, use the names from [sad §8 Fonts](../sad.md).
