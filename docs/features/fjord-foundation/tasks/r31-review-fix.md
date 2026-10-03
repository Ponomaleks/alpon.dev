---
id: R31
title: "Point the stale Not-found design statements to OQ-02 and rank the page design first in screens.md"
layer: "docs"
deps: ["R30"]
acs: ["AC-07"]
files_hint: ["docs/features/fjord-foundation/spec.md", "docs/features/fjord-foundation/sad.md", "docs/features/fjord-foundation/screens.md", "docs/roadmap.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R31 — Point the stale Not-found design statements to OQ-02 and rank the page design first in screens.md

## Why

Review round 5, S1-12. Some statements about "the design" were written from the component demo and now contradict OQ-02 and the precedence rule (page designs win over component demos):

- `spec.md:27` and `screens.md:79` say the design's code line is "404 · <requested path>". The page design reads "404 / Ikke funnet" with the path in the body (`spec.md:222`).
- `sad.md:452` quotes the Design-match difference list without the OQ-02 items.
- `screens.md:20` lists `Misc.jsx` and the standalone HTML under "Component references (secondary)", while `:19` names them as the primary reference.
- `docs/roadmap.md:24` (step 3) does not say that AC-07 and P-41 (`docs/stub-parity.md:73`, `tests/e2e/parity.spec.ts:123`) change with the code line.

Owner's decision (2026-10-03): fix now; keep the page-design files in `screens.md` as primary sources instead of dropping them.

## Definition of Done

- [x] `spec.md:27` and `sad.md:452` each carry a one-line pointer: "interim 404, see §8 OQ-02; rebuilt in step 3 per Misc.jsx".
- [x] `screens.md`: `design/handoff/site` (`Misc.jsx` for Not-found) is listed only under the primary sources; the component demos are the secondary ones. The stale lines (`:20`, `:79`) point to OQ-02.
- [x] `docs/roadmap.md` step 3 row says "update AC-07 / P-41 wording to the page design".
- [x] Docs only. Committed together with R30.
- [ ] `npm run lint` and `npm run test:unit` green
