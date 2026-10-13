---
id: R25
title: "Audit every script with a body as inline in the CSP audit, whatever its src or href"
layer: "wiring"
deps: []
acs: ["AC-09", "AC-12"]
files_hint: ["src/integrations/csp.ts", "src/integrations/csp.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R25 — Audit every script with a body as inline in the CSP audit, whatever its src or href

## Why

Review round 4, S2-09. `isExternal` (`src/integrations/csp.ts:60-63`) treats `src` as external in every namespace, but SVG scripts honour only `href` / `xlink:href`, so browsers run the body of `<svg><script src="x.js">alert(1)</script></svg>` while the audit passes it. The runtime hash still blocks it; only the build-time guarantee of ADR-0002 rule 1 is missed.

The Owner chose a namespace-independent rule over per-namespace attribute logic: a script with a body is inline, full stop.

## Definition of Done

- [x] The CSP audit treats any <script> element (HTML or SVG namespace) with non-whitespace text content as inline, whether or not it has src, href or xlink:href: only the theme bootstrap and ld+json pass, everything else with a body fails the build. A script counts as external only when it has src / href and an empty body. The F-06 it.each gains the probes <svg><script src="x.js">alert(1)</script></svg> and <script src=x.js>alert(1)</script>, both failing the audit in both parse trees.
- [x] `npm run lint` and `npm run test:unit` green
