---
id: R14
title: "Run the handler and style checks on every element in the CSP audit"
layer: "wiring"
deps: []
acs: ["AC-09", "AC-12"]
files_hint: ["src/integrations/csp.ts", "src/integrations/csp.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R14 — Run the handler and style checks on every element in the CSP audit

## Why

Review follow-up S2-02 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [ ] The script branch of auditPage no longer uses continue; the on*= and style= checks run for every element, including ld+json scripts and the bootstrap copy. The F-06 it.each in csp.test.ts gains: ld+json with onload, the bootstrap with onerror, ld+json with style; each is reported.
- [ ] `npm run lint` and `npm run test:unit` green
