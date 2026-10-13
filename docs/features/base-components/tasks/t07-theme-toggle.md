---
id: T7
title: "Build ThemeToggle, the theme script and the scripts-off gate"
layer: "ui"
deps: ["T2"]
acs: ["AC-10", "AC-11", "AC-12", "AC-29"]
files_hint: ["src/scripts/shell/theme.ts", "src/scripts/shell/theme.test.ts", "src/components/layout/ThemeToggle.astro", "src/styles/base.css"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T7 — Build ThemeToggle, the theme script and the scripts-off gate

## Why

AC-10, AC-11, AC-12, AC-29 ([spec §5](../spec.md)); [sad §6 critical flow 1 and gap 6](../sad.md); [ADR-0003](../adr/0003-keep-shell-state-in-dom-attributes-and-let-css-derive-the-rest.md); [screens.md §Shell states theme-*, no-script; G-6](../screens.md).

## What

- Reuse: the theme bootstrap and its `fjord-theme` key (fjord-foundation ADR-0001); tokens; the site copy SegmentedControl as the look.
- `src/scripts/shell/theme.ts`: pure functions to validate, apply (`data-theme` on `<html>`), persist and sync (`aria-pressed` on every live switch). The component `<script>` only wires events.
- `ThemeToggle.astro`: a group of two buttons ("Light", "Dark") with a 44 px target (D-08); the selected segment is styled from `data-theme`, so it is right before any script runs. A `sample` prop renders a fixed selection and `data-sample` (hook H-3).
- `base.css`: the scripts-off gate, hook H-1.

## Definition of Done

- [ ] `src/scripts/shell/theme.test.ts`: `dag` / `natt` round trip; any other value is ignored; `setItem` throwing leaves the theme applied and throws nothing
- [ ] Same test: two live switches end with matching `aria-pressed`; a `[data-sample]` switch is left alone
- [ ] Same test: with `startViewTransition` present and motion allowed the change runs inside it; with reduced motion, without the API, or from inside `dialog[open]` it is applied directly
- [ ] `scripts/lint/base-css.test.ts` (or a new case in it): the gate rule exists and targets `[data-needs-script]`
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- The 6-combination browser check is T19. The bootstrap is not changed, so the CSP hash stays.
- Parallel to T4 and T5 (no shared file).
