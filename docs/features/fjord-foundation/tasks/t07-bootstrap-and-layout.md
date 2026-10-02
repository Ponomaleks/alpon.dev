---
id: T7
title: "Add the theme bootstrap and the BaseLayout head contract, with the home placeholder on it (SCR-01)"
layer: "ui"
deps: ["T2", "T4", "T6"]
acs: ["AC-01", "AC-02", "AC-03", "AC-06", "AC-13"]
files_hint: ["src/scripts/theme-bootstrap.js", "src/layouts/BaseLayout.astro", "src/pages/index.astro"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T7 — Add the theme bootstrap and the BaseLayout head contract, with the home placeholder on it (SCR-01)

## Why

[ADR-0001](../adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks.md) bootstrap; [sad §8 Shared layout (head contract)](../sad.md); [screens.md SCR-01](../screens.md) and §Cross-screen states.

## What

- `src/scripts/theme-bootstrap.js`: the ADR-0001 snippet verbatim (key `fjord-theme`, accepts only `dag`/`natt`, never writes storage).
- `BaseLayout.astro`: inline the bootstrap with `is:inline` (`?raw` import + `set:html`); head order charset → viewport → bootstrap → preload `schibsted-grotesk-400.woff2` and `-600.woff2` (`as="font" type="font/woff2" crossorigin`) → stylesheets tokens → fonts → base → title, description, robots, icons.
- `index.astro`: SCR-01 default state (name `h1`, role line with "Oslo, Norge"), only `title` + `description` props.

## Definition of Done

- [ ] `theme-bootstrap.js` ≤ 1 KB unminified and identical to the ADR-0001 snippet
- [ ] Built `dist/index.html` and `dist/404.html` show the head order above, the bootstrap as the first script, exactly two `rel="preload"` font links
- [ ] SCR-01 states: theme-dag, theme-natt, theme-fallback, no-script, font-fallback, reduced-motion render the same structure (checked in T11/T13; here by a manual look in both themes)
- [ ] `npm run build`, `npm run lint` and `npm run test` (existing smoke + a11y) green

## Notes

- Hub task: T8–T11 and T13 start after it.
- No inline `style` or `<style>` may be emitted (T8 audits this); `astro.config` inlining is switched off in T8.
