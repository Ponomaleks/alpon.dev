---
id: T30
title: "Add the baselines and axe cases of phase 4b and complete the Claims list and the inventory"
layer: "tests"
deps: ["T29"]
acs: ["AC-09", "AC-12", "AC-29"]
files_hint: ["tests/visual/home.spec.ts", "tests/visual/__screenshots__/", "tests/a11y/home.spec.ts", "docs/design-system.md", "docs/features/home/pr-body.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# T30 — Add the baselines and axe cases of phase 4b and complete the Claims list and the inventory

## Why

AC-09, AC-12, AC-29 ([spec §5](../spec.md)); spec §6 "Visual regression", "Accessibility".

## What

- Visual: the two new Styleguide sections at 390 / 834 / 1440 × Dag / Natt; the Recommendations section of the home page when it is rendered (and the contact section again, since its number changes).
- Axe: the home page again when Recommendations is rendered.
- `docs/design-system.md`: Testimonial and ProjectCard moved to "Built in the repo". `pr-body.md`: one Claims row per Recommendation with the person's agreement, for the Owner to tick.

## Definition of Done

- [ ] Visual baselines for the two Styleguide sections, and for the home sections that changed, written by the `visual-baselines` workflow and reviewed by the Owner
- [ ] `tests/a11y/home.spec.ts`: 0 violations with the page as built
- [ ] `pr-body.md`: each Recommendation has a Claims row with the agreement, ticked by the Owner (AC-29)
- [ ] `docs/design-system.md`: Testimonial and ProjectCard registered
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4b.
- Same push rule as T25: push once, stop, ask the Owner for the `visual-baselines` label.
