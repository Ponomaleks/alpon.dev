---
id: R2
title: "Let the mobile menu scroll when the viewport is shorter than its content"
layer: "ui"
deps: ["R1"]
acs: ["AC-04", "AC-25"]
files_hint: ["src/components/layout/MobileMenu.astro", "tests/e2e/menu.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R2 — Let the mobile menu scroll when the viewport is shorter than its content

## Why

Review round 1 ([review-2026-10-04](../_review/review-2026-10-04.md)), S2-02. `dialog.menu` is fixed, full height and `overflow: hidden`, and the page behind is scroll-locked. On a short viewport (landscape phone, 400% zoom) the theme switch and "Get in touch" are cut off with no way to reach them (WCAG 1.4.10). Read from the code in review; this task verifies it in a browser.

## Definition of Done

- [ ] The dialog has `overflow-y: auto` and `overscroll-behavior: contain`; horizontal overflow stays hidden.
- [ ] The panel content has a minimum height of the full dialog height, so the contacts, theme switch and "Get in touch" stay at the bottom when there is room and scroll when there is not.
- [ ] e2e at 667x375: "Get in touch" is scrolled into view and activated.
- [ ] e2e at 390x844: the bottom block is still at the bottom of the panel.
- [ ] Both e2e tests were run in a real browser (`npm run test`), not only reasoned from the code.
- [ ] `npm run lint` and `npm run test:unit` green
