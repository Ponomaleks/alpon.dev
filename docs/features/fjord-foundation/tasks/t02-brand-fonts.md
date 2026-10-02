---
id: T2
title: "Ship the seven brand faces and their metric-matched fallback faces"
layer: "wiring"
deps: ["T1"]
acs: ["AC-05", "AC-15"]
files_hint: ["tools/fonts/", "public/fonts/", "src/styles/fonts.css"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T2 — Ship the seven brand faces and their metric-matched fallback faces

## Why

AC-05 and AC-15 ([spec §5](../spec.md)); [sad §4 pillar 5 and §8 Fonts](../sad.md); NFR row "Critical font weight" ([spec §6](../spec.md)). The three 700 weights are missing today ([sad §2](../sad.md)).

## What

- `tools/fonts/`: a subsetting script (Latin + æ ø å Æ Ø Å + – —) run over `design/brand/fonts/*.ttf`, producing `schibsted-grotesk-700.woff2` and `jetbrains-mono-700.woff2`, and re-subsetting the existing five files only if they miss a required glyph.
- `tools/fonts/`: a fallback-metric script that derives `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` for Arial and Roboto from the brand TTF metrics, written to a committed JSON.
- `src/styles/fonts.css`: 7 brand `@font-face` rules (`font-display: swap`, `/fonts/...woff2`) plus the fallback faces named per [sad §8 Fonts](../sad.md) (`"<family> Fallback Arial"`, `"<family> Fallback Roboto"`, `src: local(...)`).

## Definition of Done

- [ ] All 7 files exist in `public/fonts/`, each ≤ 30 KB
- [ ] Vitest: each woff2 cmap contains æ ø å Æ Ø Å – —
- [ ] Vitest: the metric script's output for Arial and Roboto matches the values recomputed from the TTF `hhea`/`OS/2` tables
- [ ] `fonts.css` has only `@font-face` rules (ADR-0003 exclusion contract); every brand weight 400/500/600/700 and mono 400/500/700 is declared
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Subsetting may use Python fontTools like the existing `tools/*.py` (tools are not deployed); the metric script is TypeScript so Vitest covers it. Any new devDependency (e.g. a TTF parser) is explained in the PR.
- [sad §8](../sad.md) names Arial/Roboto fallbacks for both families; JetBrains Mono gets the same pair. Flag in the PR if a monospace local font measures closer.
- Font stack *names* are a contract with T4 (the generator writes them into `--fjord-font-*`). Runs parallel to T3.
