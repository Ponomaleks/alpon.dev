---
id: T10
title: "Add the budget check for bootstrap, JS and font sizes"
layer: "tests"
deps: ["T2", "T7"]
acs: ["AC-06"]
files_hint: ["scripts/check-budgets.ts", "package.json", ".github/workflows/ci.yml"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# T10 — Add the budget check for bootstrap, JS and font sizes

## Why

NFR rows "Initial JS per page" and "Critical font weight" ([spec §6](../spec.md)); [sad §5, QG-2](../sad.md).

## What

- `scripts/check-budgets.ts`: read `src/scripts/theme-bootstrap.js`, every `dist/**/*.html` (sum of referenced JS gzip, preload links), `public/fonts/*.woff2`.
- `package.json`: `check:budgets`; `ci.yml`: a step after Build printing the sizes.
- `scripts/check-budgets.test.ts` with fixture dirs.

## Definition of Done

- [ ] Vitest: each of the four budget breaches fails with file and measured size
- [ ] On the real build it passes and prints the measured sizes in the CI log
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- None.
