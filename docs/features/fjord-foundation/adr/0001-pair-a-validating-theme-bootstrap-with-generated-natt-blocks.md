---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-02"
feature_size: "S"
ticket: "roadmap step 2 — fjord-foundation"
---

# 0001 — Pair a validating theme bootstrap with generated Natt blocks for the no-JS case

- **Status:** Accepted
- **Date:** 2026-10-02
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design walk

## Context

Every v2 page must show the right theme from the first frame: the stored Theme choice when it is `dag` or `natt`, otherwise the device preference, and still the device preference when scripts are off or site storage is blocked (spec AC-01..AC-04). The design handoff (`design/handoff/design-system/project/readme.md` › Themes, `tokens/colors.css`) uses a one-line head script that copies any stored value into `data-theme` and has no media-query token block ("Natt follows the OS via a one-line head script"). Copied verbatim it fails AC-03 (an unknown value such as `foo` lands in `data-theme`, so neither theme block matches the device) and AC-04 (no script → always Dag). Natt values also live in more than one handoff file (`colors.css`, and `--fjord-shadow-float` in `spacing.css`).

## Decision drivers

- Spec §6 NFR: 0 wrong-theme frames across the 6 combinations (stored Dag / Natt / none × device light / dark); AC-04 scripts-off rendering.
- `CLAUDE.md` design rules: theme = `data-theme="dag|natt"` on `<html>`, default from `prefers-color-scheme`, no flash of wrong theme; step 3's ThemeToggle and the Dag/Natt QR swap read that one attribute.
- Repo ADR-0002: zero client JS by default; the bootstrap is the only inline script and must stay ≤ 1 KB unminified (spec §6).
- Recruiters often use phones, including older iPhones; the theme must work in every browser the site targets.
- Fjord tokens are the only source of visual values (`CONTEXT.md` invariant); the Natt values must not be maintained in two places by hand.

## Considered options

1. **Two theme blocks plus a hand-maintained no-JS Natt copy** — `:root` = Dag, `[data-theme="natt"]` = Natt, and a second hand-written Natt block under `@media (prefers-color-scheme: dark) { :root:not([data-theme]) }`, guarded by an identity check in the contrast script.
2. **Two theme blocks plus a generated no-JS Natt copy** — the same CSS shape, but `src/styles/tokens.css` is written by a small generator from the design sources, which emits both Natt blocks from one list of values.
3. **`light-dark()` tokens** — each semantic color declared once as `light-dark(<dag>, <natt>)`, `:root { color-scheme: light dark }` follows the device and `[data-theme]` pins `color-scheme`.

## Decision outcome

**Chosen:** Option 2. It keeps the handoff's CSS shape and the `data-theme` contract, works in every browser, and removes the hand-maintained duplicate that option 1 would carry. Option 3 was rejected because `light-dark()` is only Baseline since May 2024 (Safari 17.5): on older iPhones every color token would become invalid unless an `@supports` Dag fallback brought the duplication back, and it covers colors only (`--fjord-photo-filter`, `--fjord-shadow-float` still need selectors).

The shape:

- **Bootstrap** — `src/scripts/theme-bootstrap.js`, inlined first in `<head>` by `BaseLayout`, before any stylesheet:
  ```js
  try{var t=localStorage.getItem('fjord-theme');if(t!=='dag'&&t!=='natt')t=matchMedia('(prefers-color-scheme: dark)').matches?'natt':'dag';document.documentElement.dataset.theme=t}catch(e){}
  ```
  Only `dag` and `natt` are accepted (AC-03). If storage access throws, nothing is set and the CSS fallback below decides, so the Visitor sees no error.
- **Generator** — `scripts/tokens/build.ts` (Node 24 runs it directly) reads `design/handoff/design-system/project/tokens/{colors,spacing,typography,motion}.css` and `design/brand/tokens.json`. The core palette comes from `tokens.json`; if a handoff palette value differs, the generator fails and names the conflict (BRAND.md wins, the conflict goes in the PR). It collects every `[data-theme="natt"]` declaration across the handoff files and writes `src/styles/tokens.css` with: `:root` (palette, Dag semantics, non-color tokens, `color-scheme: light`), `[data-theme="dag"]` (reset), `[data-theme="natt"]` (Natt, `color-scheme: dark`), `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { …the same Natt list… } }`, `.fjord-on-spruce`, the responsive and reduced-motion overrides, and the font stacks with the metric-matched fallback faces (SAD §8).
- **Guards** — the file starts with a "generated — do not edit" header; `npm run lint` runs the generator with `--check` and fails if the committed file is stale; the contrast script additionally asserts the two Natt blocks are identical.

## Consequences

**Positive**
- Correct theme from the first frame with scripts on, scripts off, and storage blocked; native controls and scrollbars follow through `color-scheme` in each block.
- Natt values have one source; adding a Natt-only token in any handoff file reaches both blocks automatically.
- Components in steps 3–7 only ever see `--fjord-*` names; the encoding can change later without touching them.

**Negative**
- Token changes flow through the design sources (`design/` is read-only in this repo): a change means a new handoff export or brand update, then regenerating. There is no in-repo override layer.
- About 100–150 lines of generator code plus its unit tests to maintain.

**Neutral**
- The intentional differences from the handoff snippet (strict `dag`/`natt` validation, the no-JS media block) are listed in the PR as design deviations.
- Moving to `light-dark()` later is a generator change only.

## Links

- Spec: [[../spec.md]] US-01, US-02, AC-01..AC-04, §6 "Wrong-theme frames"
- SAD: [[../sad.md]] §4 (pillar 2), §6 flow 1, §8 Theme
- Related ADR: [[0002-generate-the-bootstrap-hash-into-a-single-csp-rule-at-build]] (the bootstrap is the one inline script that policy allows)
