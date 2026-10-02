---
id: T9
title: "Build the Fjord Not-found page (SCR-02) with the page-local home-link and ridge contours"
layer: "ui"
deps: ["T7"]
acs: ["AC-07", "AC-08"]
files_hint: ["src/pages/404.astro", "docs/design-system.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T9 — Build the Fjord Not-found page (SCR-02) with the page-local home-link and ridge contours

## Why

AC-07, AC-08 ([spec §5](../spec.md)); [screens.md SCR-02](../screens.md) (states, content, layout, ridge and home-link constraints); [sad §6 flow 2](../sad.md).

## What

- `404.astro` on `BaseLayout` with `noindex`; page-local `<style>` (bundled to an external file).
- **Token decision for design values with no token** (the open item `screens.md` handed to `tasks`): map to tokens, never literals. `min-height: 420px` → `calc(var(--fjord-space-1) * 105)` (exact, on the 4px grid); gap `16px` → `--fjord-space-4`; padding `48px 0` → `--fjord-space-12`; button gap `10px` → `--fjord-space-2` (10 px is off the 4px grid); button padding `18px` → `--fjord-space-4`; button font `15px` → `--fjord-text-body-sm`; title `line-height: 1` → `--fjord-leading-display`; body `line-height: 1.5` → `--fjord-leading-mono` or `--fjord-leading-snug` (pick the closer match visually); title tracking → `--fjord-tracking-display`. Every mapping that changes a pixel value goes in the PR design-deviation list.
- Ridge: build-time inline `<svg>` (`aria-hidden`, `focusable="false"`, fixed size), stroke from a class rule `stroke: var(--fjord-color-contour-line)`; no `<style>`/`style=` inside.
- Home-link: `<a href="/">` styled like `.fj-btn--primary` with the same token names; arrow as inline 1.5px `currentColor` SVG; hover/focus change color only.
- Update `docs/design-system.md` pending rows with the real `file:line`.

## Definition of Done

- [ ] Built `dist/404.html` contains `404 · Ikke funnet` ("Ikke funnet" in `lang="no"`), `h1` "Page not found", the body copy, exactly one link (`/`), `<meta name="robots" content="noindex">`, no "See projects"
- [ ] No `style=` attribute, `<style>` element or `on*=` attribute in the built page
- [ ] Stylelint zero findings on `404.astro`
- [ ] Home-link: 44 px target, hover/focus-visible color-only, no transform
- [ ] `docs/design-system.md` rows for home-link and ridge-contours point to the built file
- [ ] `npm run build` and `npm run lint` green

## Notes

- Can run parallel to T8; if T8 has landed, its audit must pass on this page.
- Step 3 swaps in `components/ui/Button` and `components/brand/Contours` with the same token names and markup so the baselines from T15 stay valid.
