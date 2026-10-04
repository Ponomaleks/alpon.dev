---
id: T14
title: "Add cross-document page transitions with a still header"
layer: "ui"
deps: ["T13"]
acs: ["AC-32", "AC-28"]
files_hint: ["src/styles/base.css", "src/components/layout/Header.astro", "tests/e2e/transitions.spec.ts", "scripts/lint/"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T14 — Add cross-document page transitions with a still header

## Why

AC-32, AC-28 ([spec §5](../spec.md)); [sad §4 pillar 6, §11 View Transitions risk](../sad.md); `CLAUDE.md` Design rules (View Transitions).

## What

- `base.css`: `@view-transition { navigation: auto }` and `navigation: none` under `prefers-reduced-motion: reduce`; cross-fade timing from motion tokens.
- `Header.astro`: its own `view-transition-name` on the live header only (never on a sample).
- Check the Astro Docs MCP first; the client router is not used (sad §4).

## Definition of Done

- [ ] `tests/e2e/transitions.spec.ts` with `reducedMotion: "no-preference"` on Chromium: `pagereveal` carries a `viewTransition` after a link from `/`; with `reduce` it carries none; navigation works in both
- [ ] Same spec: the header has a `view-transition-name` and the name is unique on the page
- [ ] `scripts/lint/stylelint.test.ts`: `@view-transition` with `navigation` passes; if it needed an allow-list entry, the row and rejecting fixture exist (T2 rule)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Serialized with T13 through `base.css`. The theme cross-fade (AC-29) is T7 and T19.
