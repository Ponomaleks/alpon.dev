---
id: T4
title: "Build Icon, Button, Link and IconButton with all interactive states"
layer: "ui"
deps: ["T2"]
acs: ["AC-25"]
files_hint: ["src/components/ui/Icon.astro", "src/components/ui/Button.astro", "src/components/ui/Link.astro", "src/components/ui/IconButton.astro", "src/components/ui/actions.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T4 — Build Icon, Button, Link and IconButton with all interactive states

## Why

AC-25 ([spec §5](../spec.md)); [screens.md §Shell states "interactive states" and SCR-04 rows Button, Link, IconButton, Icon](../screens.md); [sad §8 Icons, Styleguide states](../sad.md).

## What

- Reuse: tokens from `src/styles/tokens.css`, element base and focus ring from `src/styles/base.css`. Secondary reference: the site copy components `actions/*.css`.
- `Icon`: inline SVG from a typed name-to-path map (at least `arrow-right`, `menu`, `x`, `file-text`, `map-pin`), 1.5 px stroke, `currentColor`, `aria-hidden`.
- `Button`: renders `<a>` or `<button>`; primary and secondary; default and large; arrow, leading icon, block; disabled. `Link` (TextLink): default and external. `IconButton`: 44 × 44 box, required accessible label.
- States: hover and pressed change colour only; `:focus-visible` shows the Fjord ring; every state selector is paired with `[data-demo-state="hover|focus|active"]`.

## Definition of Done

- [ ] `src/components/ui/actions.test.ts` (Vitest, rendered output; use the fixture-build pattern of `src/layouts/BaseLayout.test.ts` or the Astro container API after checking the Astro Docs MCP): every variant above renders the expected element, classes and attributes
- [ ] Same test: the built CSS contains a `data-demo-state` selector for each of hover, focus and active per interactive component; no `transform` in a hover or active rule
- [ ] Same test: external `Link` carries `rel="noopener noreferrer"`; `IconButton` without a label fails type check or the test
- [ ] Stylelint 0 findings; no `style=` in the output
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- The 44 px measurement itself is taken in a real browser by T18. Here the size comes from tokens.
- Hook H-4 (`data-demo-state`) in `_epic.md`.
