---
id: T6
title: "Port the handoff base.css as token-only element styles"
layer: "ui"
deps: ["T4"]
acs: ["AC-04", "AC-14"]
files_hint: ["src/styles/base.css"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T6 — Port the handoff base.css as token-only element styles

## Why

[sad §5](../sad.md) (`base.css`, ported from the handoff); [sad §11](../sad.md) risk "handoff base.css uses literal values"; readable contrast with scripts off (AC-04) and no motion (AC-14).

## What

- Port `design/handoff/design-system/project/tokens/base.css` to `src/styles/base.css`: every literal (`1px`, `2px`, `0.2em`, unitless weights and line-heights) becomes a token (`--fjord-border-width`, `--fjord-focus-width`, `--fjord-weight-*`, `--fjord-leading-*`, …).
- `:focus-visible` ring from `--fjord-focus-width` / `--fjord-focus-offset` / `--fjord-color-focus-ring`.
- Body: `--fjord-color-bg`, `--fjord-color-text`, `--fjord-font-sans`, `--fjord-text-body`, `--fjord-leading-body`.

## Definition of Done

- [ ] Stylelint: zero findings on `base.css`
- [ ] No `@keyframes`, `animation` or non-token `transition` in the file
- [ ] Any handoff literal with no matching token is listed in the PR design-deviation list with the token it maps to
- [ ] `npm run lint` green

## Notes

- Pages import nothing themselves: `BaseLayout` (T7) links tokens → fonts → base.
