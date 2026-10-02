---
id: R10
title: "Run Lighthouse CI against wrangler dev so the delivered headers apply"
layer: "wiring"
deps: ["R9"]
acs: []
files_hint: ["lighthouserc.cjs", ".github/workflows/ci.yml"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R10 — Run Lighthouse CI against wrangler dev so the delivered headers apply

## Why

Review follow-up F-19 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] lighthouserc.cjs starts wrangler dev on dist/ and audits / and a missing path; CSP, HSTS and the 404 handling are in effect during scoring; CI uses it.
- [ ] `npm run lint` and `npm run test:unit` green
