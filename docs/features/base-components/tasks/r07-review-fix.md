---
id: R7
title: "Record the built-CSS method as the accepted verification of AC-32"
layer: "docs"
deps: []
acs: ["AC-32"]
files_hint: ["docs/features/base-components/spec.md", "docs/features/base-components/sad.md", "docs/features/base-components/tasks/t14-view-transitions.md", "docs/features/base-components/tasks.json"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R7 — Record the built-CSS method as the accepted verification of AC-32

## Why

Review round 1 ([review-2026-10-04](../_review/review-2026-10-04.md)), S1-05. Spec §1, sad §8 and T14's definition of done require a motion-allowed browser test of the page transition. Commit a19226a replaced it with checks of the built CSS and the computed `view-transition-name`. That was the Owner's decision on 2026-10-04 (the browser test was a race in Chromium, and a flaky test must not sit in a required check), but it is not recorded.

## Definition of Done

- [ ] The spec §1 change log records the decision with its date and reason.
- [ ] The "own tests with motion allowed" sentence in spec §1 and the Testing row of sad §8 no longer claim a motion-allowed test for AC-32; AC-29 keeps its own test if it is stable.
- [ ] T14's definition of done (`tasks/t14-view-transitions.md` and `tasks.json`) names the built-CSS and computed `view-transition-name` checks.
- [ ] `npm run lint` and `npm run test:unit` green
