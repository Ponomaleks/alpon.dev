---
id: T6
title: "Make the Sticky action bar collapsible with a native details tab and move the clearance to the tab"
layer: "ui"
deps: ["T5"]
acs: ["AC-39"]
files_hint: ["src/components/layout/MobileBar.astro", "src/components/layout/bar.test.ts", "src/scripts/shell/action-bar.ts", "src/scripts/shell/action-bar.test.ts", "src/styles/base.css", "src/components/ui/Toast.astro", "tests/e2e/action-bar.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T6 — Make the Sticky action bar collapsible with a native details tab and move the clearance to the tab

## Why

AC-39 ([spec §5](../spec.md)); spec §1.3 D-11; [screens.md Shell state changes, wireframe S-7, T-1, T-4](../screens.md); [sad §8 Sticky action bar collapse, Bar clearance and Toast offset](../sad.md).

## What

- Reuses: `layout/MobileBar`, `ui/Icon` (`chevron-down`, `chevron-up`), `shell/action-bar.ts`.
- The bar becomes a native `<details open>`; its `<summary>` is the 44 × 44 tab on the top edge at the right, with the fixed accessible name "Quick actions" (T-4). Collapsed, only the tab stays in the bottom right corner.
- `action-bar.ts`: does nothing while the bar is collapsed; a bar brought back with the tab scrolls as before.
- `base.css` and `Toast.astro`: end-of-page space, `scroll-padding-bottom` and the Toast offset follow the bar state through `:has()` and count from the top of the tab; the bar and the tab sit above `env(safe-area-inset-bottom)`.

## Definition of Done

- [ ] `src/scripts/shell/action-bar.test.ts`: no `inert` change while collapsed; normal behaviour after the bar is restored
- [ ] `src/components/layout/bar.test.ts`: `<details open>` with a `<summary>` named "Quick actions"; both actions inside it
- [ ] `tests/e2e/action-bar.spec.ts`: tab size, collapse and restore by pointer and keyboard, scripts on and off, expanded state exposed
- [ ] Same spec: collapsed bar survives scrolling up and down; 0 px overlap at the end of the page and with focus on the last footer link, in both bar states
- [ ] Same spec: the Toast sits above the tab in both states; with reduced motion the change is instant
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- No storage: the collapse holds for the page view only (sad §6 "Flagged by the flows" item 2).
- If `env()` or a `:has()` form is not in the token-only allow lists, add it to the lists of base-components ADR-0004 with a rejecting fixture and name it in the PR.
