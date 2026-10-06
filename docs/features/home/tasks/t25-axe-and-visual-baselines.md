---
id: T25
title: "Add the home axe checks and the visual baselines for the home page, the Styleguide and the Not-found page"
layer: "tests"
deps: ["T15", "T17"]
acs: ["AC-32", "AC-38"]
files_hint: ["tests/a11y/home.spec.ts", "tests/visual/home.spec.ts", "tests/visual/styleguide.spec.ts", "tests/visual/not-found.spec.ts", "tests/visual/__screenshots__/"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "review"
---

# T25 — Add the home axe checks and the visual baselines for the home page, the Styleguide and the Not-found page

## Why

Spec §6 "Accessibility", "Visual regression", "Design match"; AC-32, AC-38 ([spec §5](../spec.md)); [screens.md SCR-01, SCR-02, SCR-04](../screens.md).

## What

- `tests/a11y/home.spec.ts`: axe on `/` in Dag and Natt, scripts on and off, and with a second experience entry open.
- `tests/visual/home.spec.ts`: one capture per section (hero, key facts, About, experience, contact, closing band) at 390 / 834 / 1440 × Dag / Natt with motion off and the copyright year masked.
- New and changed Styleguide sections are captured by the existing per-`data-section` spec; the Not-found page is re-baselined at 390.
- Baselines are written on Linux by the `visual-baselines` workflow and reviewed by the Owner against `design/screenshots/{dag,natt}_home.png` and the standalone design at 390 and 834.

## Definition of Done

- [ ] `tests/a11y/home.spec.ts`: 0 violations in the five cases
- [ ] `tests/visual/home.spec.ts`: 6 sections × 3 widths × 2 themes
- [ ] Styleguide: every new and changed section has a baseline; Not-found at 390 re-baselined in Dag and Natt
- [ ] The Owner has reviewed the Linux baselines; the design-difference list for the PR names only IS-01 to IS-03 and D-01 to D-14
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Never commit Windows snapshots and never update baselines locally.
- Push once here (the visual check is expected red), stop, and ask the Owner to add the `visual-baselines` label: see `_epic.md` hard rule on pushes.
- Where a Natt page-design screenshot is missing, the standalone site is the reference.
