---
id: T22
title: "Extend the budget and contrast checks and prove the security policy is unchanged"
layer: "tests"
deps: ["T15", "T17"]
acs: ["AC-27", "AC-17"]
files_hint: ["scripts/check-budgets.ts", "scripts/check-budgets.test.ts", "scripts/contrast-pairs.ts", "scripts/check-contrast.test.ts", "tests/e2e/headers.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T22 — Extend the budget and contrast checks and prove the security policy is unchanged

## Why

AC-27, AC-17 ([spec §5](../spec.md)); [spec §6 Initial JS, Not-found page weight, Contrast, Lighthouse; §6.1 Security review](../spec.md); [sad §10 QG-1, QG-3; §11 request-count and page-weight risks](../sad.md).

## What

- `check-budgets.ts`: two new budgets next to the existing ones. If the Shell scripts measure above 5 KB, report the number to the Owner and change nothing (spec §6). If `404.html` measures above 20 KB, follow the spec §6 path; do not simplify the map.
- `contrast-pairs.ts`: text, border and focus-ring pairs of Button, Link, Badge, Tag, header (default and on spruce), menu panel, bar, band, footer, Toast.
- `headers.spec.ts`: the injection cases on `/` with the Shell; the contract file is read, not edited.
- Run `npm run lhci` after a build and record the scores for `/` and the Not-found page in the task result.

## Definition of Done

- [ ] `scripts/check-budgets.test.ts`: over-budget fixtures fail with file and size; the real `dist/` passes
- [ ] `scripts/check-contrast.test.ts`: the new pairs are computed; body ≥ 4.5:1, large text, borders and focus ring ≥ 3:1
- [ ] `tests/e2e/headers.spec.ts` passes; `git diff` of the feature range shows no change in `tests/contracts/csp.contract.json`
- [ ] `npm run lhci`: the four categories ≥ 95 (SEO off on the Not-found page), LCP ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 100 ms
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- If Lighthouse moves because of the extra script requests, the fix is the single entry module of sad §11, in a follow-up commit of this task.
- Parallel to T20 and T21.
