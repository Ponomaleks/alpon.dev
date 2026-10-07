---
id: T29
title: "Show Testimonial and the Dormant Selected projects on the Styleguide with marked sample data"
layer: "ui"
deps: ["T27", "T28"]
acs: ["AC-12", "AC-28"]
files_hint: ["src/pages/styleguide.astro", "src/pages/_styleguide.test.ts", "scripts/check-placeholders.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T29 — Show Testimonial and the Dormant Selected projects on the Styleguide with marked sample data

## Why

AC-12, AC-28 ([spec §5](../spec.md)); [screens.md SCR-04 sample data marked, New sections Testimonial and Selected projects](../screens.md).

## What

- Builds SCR-04 sections: Testimonial (two cards with marked sample quotes) and Selected projects (Dormant) as the page design draws it, with a visible "Sample data" label and the sample marker of T18.

## Definition of Done

- [ ] `src/pages/_styleguide.test.ts`: both sections and the "Sample data" label
- [ ] `scripts/check-placeholders.test.ts`: the marked block is exempt, anything outside it is not
- [ ] `npm run build && npm run check:placeholders` pass
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4b.
- Sample quotes are marked as sample and name no real person.
