---
id: T11
title: "Build the mobile menu panel as a native modal dialog (SCR-03)"
layer: "ui"
deps: ["T3", "T10"]
acs: ["AC-04", "AC-05", "AC-02", "AC-28"]
files_hint: ["src/components/layout/MobileMenu.astro", "src/scripts/shell/menu.ts", "src/scripts/shell/menu.test.ts", "src/components/layout/menu.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T11 — Build the mobile menu panel as a native modal dialog (SCR-03)

## Why

AC-04, AC-05, AC-02, AC-28 ([spec §5](../spec.md)); [screens.md SCR-03, G-1, G-2, G-3, G-6](../screens.md); [ADR-0002](../adr/0002-open-the-mobile-menu-as-a-native-modal-dialog.md); [sad §6 Mobile menu](../sad.md); spec §1.3 D-07, D-12.

## What

- Reuse: `Wordmark`, `IconButton` (`x`, "Close menu"), `Link`, `Button`, `ThemeToggle`, `Contours`, `src/data/contact.ts`. Secondary reference: `.fj-sheet` in the site copy.
- `MobileMenu.astro`: `<dialog>` with the numbered links "01 CV", "02 Contact", email and phone as links, Work region "Oslo, Norge" with `lang="no"`, the theme switch, and a primary large block "Get in touch". `current` marks the link. A `sample` prop renders the same markup as a static block, not a dialog (SCR-04).
- `menu.ts`: open from the header button, mirror `aria-expanded`, close on link, close at 768 and wider. Focus on the first link; Escape and focus return are platform behaviour.
- Styles: full-screen panel on the top layer; open and close motion against `[open]` with motion tokens; `html:has(dialog[open]) { overflow: hidden }` (G-3).

## Definition of Done

- [ ] `src/scripts/shell/menu.test.ts`: the cases in the DoD sentence above; `aria-expanded` follows the `open` state; a missing `showModal` does not throw
- [ ] `src/components/layout/menu.test.ts`: content and order of SCR-03 "open"; values equal `contact.ts`; the sample variant renders no `<dialog>`
- [ ] Same test: the built CSS has the scroll-lock rule and no slide distance outside a motion token
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Focus behaviour in a real browser, Natt readability and axe with the panel open are T19 and T21.
