---
id: T1
title: "Point the token generator at the site copy of the design system and emit the new tokens"
layer: "wiring"
deps: []
acs: ["AC-26"]
files_hint: ["scripts/tokens/", "src/styles/tokens.css", "docs/features/fjord-foundation/adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T1 — Point the token generator at the site copy of the design system and emit the new tokens

## Why

AC-26 ([spec §5](../spec.md)); [ADR-0001](../adr/0001-read-fjord-tokens-from-the-site-copy-of-the-design-system.md); [sad §4 pillar 2 and §11 first risk](../sad.md).

## What

- `scripts/tokens/sources.ts` reads the token and usage files under `design/handoff/site/project/_ds/`; `parse.ts` / `generate.ts` handle the restructured `colors.css` (shared `:root, [data-theme="dag"]` block, contour and terrain line tokens referenced through `var()`, the on-spruce block under Natt).
- Regenerate `src/styles/tokens.css` with `npm run tokens:build`; never edit it by hand.
- Add the one-line source-path pointer to fjord-foundation ADR-0001, as ADR-0001 of this feature requires.

## Definition of Done

- [ ] `scripts/tokens/build.test.ts`: the source paths point at the site copy; a snapshot of the previous `tokens.css` declarations shows no changed value (added declarations only)
- [ ] Same test: `--fjord-z-*`, `--fjord-space-5`, `--fjord-space-404`, the UI text sizes, `--fjord-header-height-compact` and the Toast duration are emitted; both Natt blocks stay identical
- [ ] `npm run tokens:check` and `npm run check:contrast` pass on the regenerated file
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- First task of the feature (ADR-0001). If an existing value would change, stop and report it to the Owner; do not accept the change silently.
- `design/` is read-only.
