---
id: T10
title: "Build Header with its variants, the scroll border script and the one-primary rule"
layer: "ui"
deps: ["T4", "T6", "T7"]
acs: ["AC-01", "AC-02", "AC-03", "AC-23"]
files_hint: ["src/components/layout/Header.astro", "src/scripts/shell/header.ts", "src/scripts/shell/header.test.ts", "src/components/layout/header.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T10 — Build Header with its variants, the scroll border script and the one-primary rule

## Why

AC-01, AC-02, AC-03, AC-23 ([spec §5](../spec.md)); [screens.md §Shell states header-*; wireframes S-1, S-2](../screens.md); [sad §5 page options, §8 One primary](../sad.md); [ADR-0003](../adr/0003-keep-shell-state-in-dom-attributes-and-let-css-derive-the-rest.md); spec §1.3 D-01, D-02, D-06, D-08, D-13.

## What

- Reuse: `Wordmark` (T6), `Button`, `IconButton` (T4), `ThemeToggle` (T7).
- `Header.astro` props: `current`, `variant`, `cta` (`auto` | `secondary`), `sample`. Sticky, compact height below 768; links "CV" and "Contact" and the theme switch from 768; "Get in touch" with an arrow from 768, without below.
- One primary: the call to action is styled by CSS only. Below 768 it is secondary while the page has a bar that is not `inert` (hook H-2, `:has()`), primary otherwise; `cta="secondary"` forces secondary at any width.
- Menu button: `IconButton` (`menu`) with `data-needs-script` (hook H-1), `aria-controls` and `aria-expanded` for the dialog that T11 adds.
- `header.ts`: an `IntersectionObserver` on a top sentinel sets `data-scrolled`; the border is styled from it. A sample header (`data-sample`) is in the flow, not sticky, and is not observed.

## Definition of Done

- [ ] `src/components/layout/header.test.ts`: both width layouts hold the listed parts; "Projects" and a search trigger are absent
- [ ] Same test: `current="cv"` gives `aria-current="page"` on that link only; `variant="on-spruce"` and `cta="secondary"` change the root attributes the styles read
- [ ] Same test: the built CSS has the `:has()` rule keyed on the bar hook and `:not([inert])`
- [ ] `src/scripts/shell/header.test.ts`: observer callback sets and removes `data-scrolled`; no class or inline style is written
- [ ] Stylelint 0 findings; `view-transition-name` is left to T14
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- The bar does not exist yet; the rule is written against hook H-2 and verified in a browser by T20.
- Parallel to T9 and T12.
