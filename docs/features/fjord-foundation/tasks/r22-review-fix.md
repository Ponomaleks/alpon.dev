---
id: R22
title: "Audit both the scripting-off and scripting-on parse trees in the CSP audit"
layer: "wiring"
deps: []
acs: ["AC-09", "AC-12"]
files_hint: ["src/integrations/csp.ts", "src/integrations/csp.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R22 — Audit both the scripting-off and scripting-on parse trees in the CSP audit

## Why

Review follow-up S2-07 ([review-2026-10-02-3](../_review/review-2026-10-02-3.md)).

## Definition of Done

- [ ] applyCsp audits each page parsed with scriptingEnabled false and true, merges the problems without duplicates and counts the bootstrap copies per tree; the <noscript><title></noscript><script>…</script></title></noscript> probe (and a <textarea> variant) is added to the F-06 it.each and fails.
- [ ] `npm run lint` and `npm run test:unit` green
