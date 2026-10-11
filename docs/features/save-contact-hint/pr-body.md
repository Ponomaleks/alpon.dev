Draft until the visual baselines (T7) are committed. The Owner check (AC-11) is done.

Spec: `docs/features/save-contact-hint/spec.md`. Replaces backlog B-58 (pull request 9, closed).

## What changed

- The contact card action reads "Add to contacts". The Contact block and the home closing band show ".vcf" as mono, muted meta text; the Sticky action bar shows the label alone (D-01). Its name for assistive technology is "Add to contacts (vCard file)" everywhere.
- On touch devices (`(hover: none) and (pointer: coarse)`) a note stands under the action in the Contact block: "Downloads a contact card. Open it from Downloads to add." CSS only, no script.
- On touch devices, with scripts on, a tap on any of the three actions of the home page starts the download as before and opens a bottom sheet, a native modal `<dialog>`: "Add the contact card" with the file name under it, "It goes to your Downloads.", three steps, "Got it", "Or scan the QR code on this page.". Escape, a tap outside and "Got it" close it; focus returns to the action. One set of copy for every device, nothing stored.
- Desktop, scripts off and the Not-found page: the file downloads and no sheet opens.
- After user testing (2026-10-12): the contact card holds the phone number without spaces; the phone row of the Contact block has a "Copy" button that copies the number without spaces; a selection of the number is copied without spaces too. A long press on the link still shows the browser's own menu, which a page cannot change.
- The QR tile is shown at every width, not from 1024 only (Owner decision 2026-10-12; home AC-17 changed). Below 768 it is as wide as the contact list and has no hint; from 768 it keeps the design's 132 px with the hint beside it.
- The Styleguide shows the Button with meta, the note and the sheet as a static sample (new section "Save contact sheet").

## Owner check before the baselines (AC-11)

- [x] iPhone, LinkedIn in-app browser, preview address of this branch: activate "Add to contacts".

Result (Owner, 2026-10-12): the in-app browser behaves as the other browsers do. The file downloads, the sheet opens and can be closed.

## Tests

- Unit (`npm run test:unit`): 1343 passed, 72 files.
- Lint (`npm run lint`): exit 0.
- Build, `check:budgets`, `check:contact:built`: within limits.
- Playwright, full local run with `--workers=4` on the final state: 1971 passed, 195 skipped, 0 failed. An earlier full run found two things, both fixed before this one: a selection made over the whole number was not copied without spaces (it is anchored on the element, not on its text), and the scripts-off test expected one script-only control in the Contact block where there are now two.
- Axe: the open sheet in Dag and Natt at 390 and 834, zero violations.
- Visual: the baselines are written by the `visual-baselines` label workflow and are not committed yet, so the visual job in CI fails until they are.
- Lighthouse CI: not run locally.

## Differences from the canvas "Save contact hint"

The canvas is a reference; the site's tokens and components win (spec §1.3).

- Label "Add to contacts" (the canvas has "Save to contacts"); no ".vcf" in the bar: with it the label overflows the screen at 360 by 18 px (measured).
- Step numbers are mono "01" to "03" in the accent colour, not filled circles. No drag handle.
- The header icon is `user-plus`, not a check mark: the title no longer says the file was downloaded.
- "Got it" is the Button's large size (52 px), not 48 px.
- The wide form starts at 768, not 600. Scrim, shadow and colours are the site's tokens; Natt is built from the tokens (the canvas has no Natt board).
- The file name under the title is "Alexander Ponomarenko.vcf", the name the browser saves the file under (`public/_headers`), not "alexander-ponomarenko.vcf" from the address as on the canvas. No platform-specific steps (Owner decision after the device tests).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
