---
id: T12
title: "Build the Sticky action bar and its scroll script"
layer: "ui"
deps: ["T4"]
acs: ["AC-07", "AC-08", "AC-09"]
files_hint: ["src/components/layout/MobileBar.astro", "src/scripts/shell/action-bar.ts", "src/scripts/shell/action-bar.test.ts", "src/components/layout/bar.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T12 — Build the Sticky action bar and its scroll script

## Why

AC-07, AC-08, AC-09 ([spec §5](../spec.md)); [sad §6 critical flow 2, gaps 4 and 5](../sad.md); [screens.md §Shell states bar-*; G-4, G-5](../screens.md); [ADR-0003](../adr/0003-keep-shell-state-in-dom-attributes-and-let-css-derive-the-rest.md); spec §1.3 D-11.

## What

- Reuse: `Button`, `Icon` (`file-text`) from T4; link targets from `contact.ts` are passed in as props by `BaseLayout` (T13), so this task does not wait for T3.
- `MobileBar.astro`: fixed to the bottom below 768, two equal columns, not displayed from 768; root carries the bar hook H-2. A `sample` prop positions it inside its frame for the Styleguide.
- `action-bar.ts`: a pure decision function (previous position, new position, focus inside, reduced motion) plus a passive scroll listener that toggles `inert`. The slide is CSS on `[inert]` with motion tokens.

## Definition of Done

- [ ] `src/scripts/shell/action-bar.test.ts`: the threshold table of G-5, the focus guard of G-4, and no state change under reduced motion
- [ ] `src/components/layout/bar.test.ts`: two actions, their styles and targets; the hook attribute; the sample variant is not fixed
- [ ] Stylelint 0 findings; the script writes only `inert`
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Page clearance and `scroll-padding-bottom` belong to T13 (`base.css`). The browser checks are T20.
- Parallel to T9, T10 and T11.
