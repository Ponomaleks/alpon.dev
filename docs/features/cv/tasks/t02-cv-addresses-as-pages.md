---
id: T2
title: "Serve the three CV addresses as pages and rewrite P-01 to P-03"
layer: "wiring"
deps: []
acs: ["AC-15", "AC-28"]
files_hint: ["src/pages/cv.astro", "src/pages/cv/en.astro", "src/pages/cv/no.astro", "public/_redirects", "tests/e2e/parity.spec.ts", "docs/stub-parity.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T2 — Serve the three CV addresses as pages and rewrite P-01 to P-03

## Why

AC-15, AC-28 ([spec §5](../spec.md)); [sad §4 item 2](../sad.md); [sad §11, first risk](../sad.md); spec §1.4 P-01 to P-03.

## What

- Add `src/pages/cv.astro`, `src/pages/cv/en.astro` and `src/pages/cv/no.astro` as page skeletons on `BaseLayout` (a main heading, `current="cv"`, `noindex` until T17 gives them their head).
- Remove the three CV rules from `public/_redirects`; `/linkedin` and `/github` stay.
- Rewrite P-01, P-02 and P-03 in `tests/e2e/parity.spec.ts` and their wording in `docs/stub-parity.md`: the address answers with the page itself, with no redirect.

## Definition of Done

- [ ] `tests/e2e/parity.spec.ts`: P-01 to P-03 pass against `wrangler dev`: status 200, HTML, the final address equals the asked one
- [ ] Same file: both CV PDF addresses answer 200 with `application/pdf`; `/linkedin` and `/github` still redirect
- [ ] The number of parity ids in `tests/e2e/parity.spec.ts` and in `docs/stub-parity.md` is the same as before
- [ ] `npm run build` writes `dist/cv.html`, `dist/cv/en.html` and `dist/cv/no.html`
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. This task is the check of the first risk in sad §11: `dist/cv.html` beside the folder `dist/cv/`. If `/cv` does not resolve on `wrangler dev`, stop and tell the Owner; the fallback is `src/pages/cv/index.astro` and the "no redirect" wording is checked again with them.
- Check the Cloudflare Docs MCP for `html_handling` and `_redirects` before changing anything (`CLAUDE.md` Workflow).
- Lane with T27 (`tests/e2e/parity.spec.ts`, `docs/stub-parity.md`) and T17 (the three page files).
