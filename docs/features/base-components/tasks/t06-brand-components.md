---
id: T6
title: "Build Contours, the Terrain map panel and Wordmark"
layer: "ui"
deps: ["T2", "T4"]
acs: ["AC-17", "AC-19"]
files_hint: ["src/components/brand/Contours.astro", "src/components/brand/TerrainMap.astro", "src/components/brand/Wordmark.astro", "src/components/brand/brand.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T6 — Build Contours, the Terrain map panel and Wordmark

## Why

AC-17, AC-19 ([spec §5](../spec.md)); [screens.md SCR-02 "Content", map panel, and SCR-04 rows Contours, Terrain map, Wordmark](../screens.md); page design `design/handoff/site/project/site/Misc.jsx` (`Lost`).

## What

- Reuse: `Icon` (`map-pin`) from T4; the contour and terrain line tokens that T1 emits. Secondary reference: the site copy components `brand/*`.
- `Contours`: static ridge and corner variants (drift and parallax are step 4). `TerrainMap`: framed terrain at 4:3, grid, dashed route leaving the frame, pin and label outside the frame, coordinates label "59.91° N · 10.75° E" (decoration, spec §1.3 note). `Wordmark`: default and on spruce.
- All SVG inline, colours through classes; nothing in the panel is announced.

## Definition of Done

- [ ] `src/components/brand/brand.test.ts`: `aria-hidden="true"` and `focusable="false"` on every decorative SVG; the panel root hides its text from assistive technology
- [ ] Same test: no `style=` and no `<style>` inside the SVG; stroke colours come from classes
- [ ] Same test: `Wordmark` renders a link to `/` with an accessible name, in both variants
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- The panel is inline; if T22 measures the Not-found HTML above its limit, the path is fixed by spec §6 (separate cached SVG or a proposed new limit), not a simpler map.
