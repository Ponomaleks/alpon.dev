---
id: R19
title: "Record that SEO is not asserted on the noindex Not-found page"
layer: "docs"
deps: []
acs: []
files_hint: ["docs/features/fjord-foundation/spec.md", "lighthouserc.cjs"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R19 — Record that SEO is not asserted on the noindex Not-found page

## Why

Review follow-up S2-06 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [ ] spec §6 (Lighthouse categories) and §7 (Lighthouse KPI) state that SEO is not asserted on the noindex Not-found page because the crawlability audit fails a noindex page by design; lighthouserc.cjs keeps it off. The PR lists it among the deviations.
- [ ] `npm run lint` and `npm run test:unit` green
