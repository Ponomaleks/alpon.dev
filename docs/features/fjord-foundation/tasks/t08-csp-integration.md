---
id: T8
title: "Generate the bootstrap hash into a single /* CSP rule with a fail-closed build integration"
layer: "wiring"
deps: ["T1", "T7"]
acs: ["AC-09", "AC-12"]
files_hint: ["src/integrations/", "public/_headers", "astro.config.mjs"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T8 — Generate the bootstrap hash into a single /* CSP rule with a fail-closed build integration

## Why

[ADR-0002](../adr/0002-generate-the-bootstrap-hash-into-a-single-csp-rule-at-build.md); AC-09, AC-12 ([spec §5](../spec.md)); [spec §6.1](../spec.md) abuse cases.

## What

- `public/_headers`: move the CSP from `/` to `/*` as the ADR-0002 template with `{{THEME_BOOTSTRAP_HASH}}`; keep every other header; framing stays forbidden.
- `src/integrations/csp.ts` on `astro:build:done`: the four fail rules of ADR-0002, then substitute `'sha256-…'`.
- `astro.config.mjs`: register the integration; `build.inlineStylesheets: 'never'`; `vite.build.assetsInlineLimit: 0`.
- `src/integrations/csp.test.ts` with fixtures.

## Definition of Done

- [ ] Vitest: bootstrap + `application/ld+json` passes (also `Application/LD+JSON`); the same block with no `type` or `text/javascript` fails naming the page; a second bootstrap copy fails; `<style>`, `style=` and `onclick=` each fail; a leftover placeholder fails; two CSP lines fail
- [ ] `dist/_headers` after build: exactly one `Content-Security-Policy` line, under `/*`, containing the bootstrap hash and no `'unsafe-inline'`; the `/` rule keeps only `Cache-Control`
- [ ] Changing one character in the bootstrap and rebuilding changes the hash in `dist/_headers` with no other edit
- [ ] Check the Astro integration hook API in the Astro Docs MCP before coding (CLAUDE.md)
- [ ] `npm run build`, `npm run lint`, `npm run test:unit` green

## Notes

- Security review (lightweight, [spec §6.1](../spec.md)) reads the delivered header on the `v2` preview URL before merge.
- Release 1 / step 7 extend this same template line, never a second rule.
