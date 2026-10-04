---
id: R3
title: "Move focus to the link target after a same-page menu link (G-1)"
layer: "ui"
deps: ["R2"]
acs: ["AC-05"]
files_hint: ["src/scripts/shell/menu.ts", "src/scripts/shell/menu.test.ts", "src/components/layout/MobileMenu.astro", "tests/e2e/menu.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R3 — Move focus to the link target after a same-page menu link (G-1)

## Why

Review round 1 ([review-2026-10-04](../_review/review-2026-10-04.md)), S2-03. screens.md G-1 (Owner decision) says focus goes to the link target, not back to the menu button. `menu.ts` only calls `dialog.close()`, which returns focus to the opener; the unit test uses a fake `close()` and the e2e asserts no focus.

## Definition of Done

- [x] After `dialog.close()` for a same-page link, the script focuses the hash target and lets it scroll into view; it adds `tabindex="-1"` only when the target is not focusable. Links to other pages behave as before.
- [x] The fake-close unit test is replaced by one that checks the real order: close first, then focus the target.
- [x] e2e: after the same-page "Contact" link, `document.activeElement` is the link target itself.
- [x] The e2e was run in a real browser (`npm run test`).
- [x] `npm run lint` and `npm run test:unit` green

## Notes

- Result: commit 99481a4. `/#contact` had no target on the home placeholder, so `id="contact"` was added to the `.home` wrapper in `src/pages/index.astro` (outside the files hint). Step 4 moves it to the real contact section.
