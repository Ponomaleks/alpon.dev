---
id: T18
title: "Verify the Shell end to end, flip P-25 and open P-50 and P-51"
layer: "tests"
deps: ["T13"]
acs: ["AC-01", "AC-02", "AC-03", "AC-06", "AC-13", "AC-14", "AC-20", "AC-24", "AC-25", "AC-31"]
files_hint: ["tests/e2e/shell.spec.ts", "tests/e2e/parity.spec.ts", "docs/stub-parity.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T18 — Verify the Shell end to end, flip P-25 and open P-50 and P-51

## Why

The ACs in the frontmatter ([spec §5](../spec.md)); [spec §6 Touch targets](../spec.md); [sad §8 Bar left out, Links out, Testing; §10 QG-1](../sad.md); spec §1 Traceability (P-25, P-50, P-51).

## What

- `tests/e2e/shell.spec.ts` on `/` and the Not-found page: header content per width with no "Projects" and no search; `data-scrolled` after scroll and gone at the top, also under reduced motion; first Tab lands on "Skip to content", Enter moves focus to `#main`; footer facts with `lang` and `rel`; band links with `download`.
- Bounding boxes of every interactive Shell element at 390 (header, bar, footer, band).
- A `javaScriptEnabled: false` context at 390: the bar offers "View CV" and "Get in touch", the menu button and theme switch are not displayed and leave no gap.
- A check over the built Visitor pages: `mobileBar: false` requires a CV link inside `main` (Styleguide exempt).
- Parity: flip P-25; add P-50 (Shell contact links reach the contact place, owner step 4) and P-51 (Shell CV links reach the CV page, owner step 5) as `test.fixme` and as rows under "Not in the stub".

## Definition of Done

- [ ] `tests/e2e/shell.spec.ts` passes on the desktop and mobile projects
- [ ] `tests/e2e/parity.spec.ts`: P-25 passes; P-50 and P-51 are `fixme`; open `fixme` count is 12 (spec §7)
- [ ] `docs/stub-parity.md` matches the spec file item for item
- [ ] `npm run lint` green

## Notes

- Runs with reduced motion emulated by default (spec §1). One lane with T15 through the parity files.
- AC-24 options themselves are proven at build level by T13; here their visible result is checked on the real pages.
