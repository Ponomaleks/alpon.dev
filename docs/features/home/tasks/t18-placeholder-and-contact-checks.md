---
id: T18
title: "Add the placeholder check and the built half of the contact check, and run both after the build"
layer: "wiring"
deps: ["T15"]
acs: ["AC-27", "AC-28"]
files_hint: ["scripts/check-placeholders.ts", "scripts/check-placeholders.test.ts", "scripts/check-contact.ts", "scripts/check-contact.test.ts", "package.json", ".github/workflows/ci.yml"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T18 — Add the placeholder check and the built half of the contact check, and run both after the build

## Why

AC-27, AC-28 ([spec §5](../spec.md)); [sad §8 Contact data, Placeholders, Error handling](../sad.md).

## What

- `scripts/check-placeholders.ts`: reads the text of every page in `dist/`, fails with the page and the text on square brackets that stand for a missing value; the Styleguide blocks marked as sample data are the only exemption.
- Built half of `scripts/check-contact.ts`: reads `dist/index.html` and fails, naming the field, if the ld+json Person data, the address of the mail-link sentence or the hero coordinates differ from `contact.ts`.
- `package.json`: `check:placeholders` and a built mode of `check:contact`; `ci.yml` runs both after the build, next to `check:budgets`.

## Definition of Done

- [ ] `scripts/check-placeholders.test.ts`: fail on a Visitor page, pass inside marked sample data, no false positive on JSON or attribute values
- [ ] `scripts/check-contact.test.ts`: a passing and a failing fixture per field, the failure names the field
- [ ] `npm run build && npm run check:placeholders && npm run check:contact -- --built` pass on the repo
- [ ] `.github/workflows/ci.yml` runs both after the build
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Checks fail closed and name the page, field or file (sad §8 Error handling).
- The sample-data exemption is used by T29; define the marker attribute here.
