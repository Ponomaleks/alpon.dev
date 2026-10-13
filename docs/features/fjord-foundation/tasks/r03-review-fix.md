---
id: R3
title: "Bootstrap without globals, one Norwegian language code, no viewport-fit, Norwegian 'Oslo, Norge'"
layer: "ui"
deps: ["R1"]
acs: ["AC-01", "AC-02", "AC-03", "AC-13"]
files_hint: ["src/scripts/theme-bootstrap.js", "src/scripts/theme-bootstrap.test.ts", "docs/features/fjord-foundation/adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks.md", "src/layouts/BaseLayout.astro", "src/layouts/BaseLayout.test.ts", "src/pages/index.astro"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R3 — Bootstrap without globals, one Norwegian language code, no viewport-fit, Norwegian 'Oslo, Norge'

## Why

Review follow-up F-11, F-12, F-13, F-18 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] The bootstrap creates no global (window.t undefined after it runs) and the ADR-0001 snippet matches it; BaseLayout's lang prop uses 'no' (not 'nb'); the viewport meta has no viewport-fit=cover; home renders 'Oslo, Norge' inside an element with lang="no"; unit tests cover each; build, lint, unit green.
- [ ] `npm run lint` and `npm run test:unit` green
