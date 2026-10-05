---
id: T4
title: "Render head meta, the structured-data block and the main minimum height in BaseLayout"
layer: "wiring"
deps: []
acs: ["AC-26"]
files_hint: ["src/layouts/BaseLayout.astro", "src/layouts/BaseLayout.test.ts", "src/layouts/fixtures/", "src/styles/base.css"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T4 — Render head meta, the structured-data block and the main minimum height in BaseLayout

## Why

AC-26 ([spec §5](../spec.md)); [sad §5 page options, §8 Head meta, Structured data, Layout fixes](../sad.md); backlog B-18 (the `main` half); stub-parity P-24.

## What

- `BaseLayout.astro`: canonical (from `Astro.site` and the page address), `og:*` with `https://alpon.dev/og.png` at 1200 × 630 and `twitter:card=summary_large_image`, rendered only when `noindex` is false.
- New option `structuredData`: rendered as one `application/ld+json` data block in the head with `<` escaped.
- `base.css`: `main` gets `min-height: 60vh` through a token and no outline when focused.

## Definition of Done

- [ ] `src/layouts/BaseLayout.test.ts`: indexable fixture has canonical, `og:title`, `og:description`, `og:url`, `og:image` with its size, `twitter:card`
- [ ] Same test: the `noindex` fixture has no canonical, no `og:url` and no preview card
- [ ] Same test: `structuredData` round-trips through the ld+json block; a value with `</script>` cannot close the block
- [ ] The CSP integration accepts the build; `public/_headers` and `tests/contracts/csp.contract.json` are untouched
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Check the Astro Docs MCP for `Astro.site` and `Astro.url` with `build.format: "file"` and `trailingSlash: "never"` before writing the canonical.
- Lane: `BaseLayout.astro` is also touched by T5, T7 and T8; `base.css` by T6.
- Shared file with step 5 (`BaseLayout.astro`): lane rule of spec §1.
