---
id: T23
title: "Verify the Shell contact links and focus at the contact place in three browsers and turn on P-50"
layer: "tests"
deps: ["T21"]
acs: ["AC-18", "AC-35"]
files_hint: ["tests/e2e/contact-place.spec.ts", "playwright.config.ts", ".github/workflows/ci.yml", "tests/e2e/parity.spec.ts", "docs/stub-parity.md", "src/scripts/shell/menu.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T23 — Verify the Shell contact links and focus at the contact place in three browsers and turn on P-50

## Why

AC-18, AC-35 ([spec §5](../spec.md)); spec §1 Traceability "Parity: P-50 is reworded"; [sad §8 Contact place, §11 focus risk](../sad.md); [screens.md SCR-01 contact arrived by link, SCR-03](../screens.md).

## What

- `tests/e2e/contact-place.spec.ts`: "Contact" and "Get in touch" in the header and in the menu panel, from the home page and from the Not-found page.
- `playwright.config.ts`: Firefox and WebKit projects that run this spec only; `ci.yml` installs the two browsers.
- `docs/stub-parity.md`: P-50 reworded to the header and the mobile menu, the band's "Get in touch" moved to P-51 (step 5). `parity.spec.ts`: P-50 becomes a real test.
- Only if a browser does not move focus natively: the smallest script that does, named in sad §8 Contact place.

## Definition of Done

- [ ] `tests/e2e/contact-place.spec.ts` in three browsers: heading below the header, menu closed, focus at the section (AC-18)
- [ ] `tests/e2e/parity.spec.ts`: P-50 is `test`; the open `fixme` count is 6 (spec §7 KPI)
- [ ] `docs/stub-parity.md`: P-50 and P-51 reworded
- [ ] The rest of the suite still runs on Chromium only
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Playwright WebKit is not Safari: one manual check on a real iPhone goes into the PR (sad §11).
- The cost of two more browser downloads in CI is accepted in sad §11.
