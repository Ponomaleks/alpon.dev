---
id: T8
title: "Build Toast, its polite live region and the fjord:toast script"
layer: "ui"
deps: ["T4"]
acs: ["AC-30", "AC-28"]
files_hint: ["src/components/ui/Toast.astro", "src/scripts/shell/toast.ts", "src/scripts/shell/toast.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T8 — Build Toast, its polite live region and the fjord:toast script

## Why

AC-30, AC-28 ([spec §5](../spec.md)); [sad §8 Toast](../sad.md); [screens.md §Shell states toast-shown, wireframe S-6](../screens.md).

## What

- Reuse: `Icon` (T4), layer and duration tokens (T1). Secondary reference: the site copy components `feedback/*`.
- `Toast.astro`: the region variant (one polite live region, rendered by `BaseLayout` in T13) and a static sample variant for the Styleguide that is not a live region.
- `toast.ts`: listens for `fjord:toast` on `document` with `{ message, meta?, lang? }`; auto-dismiss by the duration token.
- Offset above the bar through hook H-2; entry motion from tokens so it collapses under reduced motion.

## Definition of Done

- [ ] `src/scripts/shell/toast.test.ts`: event to region text, `lang` applied, `document.activeElement` unchanged, removal after the duration (fake timers), replacement on a second event
- [ ] Rendered output: region has `role="status"`; the sample variant has no live-region role
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- The geometric check (above the bar, never over it) is T20, on the home placeholder at 390.
