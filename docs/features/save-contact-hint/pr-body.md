Spec: `docs/features/save-contact-hint/spec.md` (AC-01 to AC-15, T1 to T10). Changelog: `docs/features/save-contact-hint/changelog.md`. Review: `docs/features/save-contact-hint/_review/review-2026-10-12.md` (round 1, PASS). Replaces backlog B-58 (pull request 9, closed).

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

## Screenshots

The committed baselines under `tests/visual/__screenshots__/linux/home.spec.ts/`: `home-contact-sheet-{dag,natt}-{390,834}.png`, `home-contact-{dag,natt}-{390,834,1440}.png`, `home-closing-band-{dag,natt}-{390,834,1440}.png`.

## Tests

- Unit (`npm run test:unit`): 1343 passed, 72 files.
- Lint (`npm run lint`): exit 0.
- Build, `check:budgets`, `check:contact:built`: within limits.
- Playwright, full local run with `--workers=4` on the final state: 1971 passed, 195 skipped, 0 failed. An earlier full run found two things, both fixed before this one: a selection made over the whole number was not copied without spaces (it is anchored on the element, not on its text), and the scripts-off test expected one script-only control in the Contact block where there are now two.
- Axe: the open sheet in Dag and Natt at 390 and 834, zero violations.
- Visual: the baselines of run 38185366743 (commit 171fbce) were reviewed by the Owner and are committed: 10 new (the open sheet at 390 and 834 in Dag and Natt, the Styleguide section "Save contact sheet") and 116 changed. Of the changed ones, the home contact section, the closing band, the bar and the Styleguide contact list show the new parts; about 70 Styleguide sections below "Contact list" only moved by a fraction of a pixel, because the page above them grew, and show the same content.
- Known limit of one baseline: at 390 the home contact section is now taller than the 900 px test window, so `home-contact-{dag,natt}-390.png` also show the header, the skip link and the Sticky action bar over the section (Owner decision 2026-10-12: kept as it is).
- Lighthouse CI (`npm run lhci`, 2026-10-12, on `/`, `/404`, `/cv/en`, `/cv/no`, 3 runs each): all assertions passed.

## Ship verification (2026-10-12)

The gate was run again on the final state in one chain: unit 1343 passed; lint exit 0; build; `check:budgets` within limits; `check:contact:built` passed; Playwright with `--workers=4`: 1971 passed, 195 skipped, 0 failed.

Then the built site was served by `wrangler dev` and driven by hand with a script outside the test suite (Chromium; Pixel 7 as the touch device, Desktop Chrome as the other). Observed:

- AC-02: on the touch device the line "Downloads a contact card. Open it from Downloads to add." is visible under the action; on desktop it is not.
- AC-03: a tap on "Add to contacts" in the Contact block downloads "Alexander Ponomarenko.vcf" and opens the sheet as a modal dialog with the title, the file name, the lead, the steps 01 to 03, "Got it" and "Or scan the QR code on this page.".
- AC-04: Escape closes the sheet and focus is on the action again. A second tap opens it again and "Got it" closes it, focus on the action; local storage stays empty.
- AC-05: on desktop the file downloads and the dialog stays closed. On the Not-found page on the touch device the file downloads and the page has no sheet.
- AC-12: the served contact card has `TEL;TYPE=CELL,VOICE:+4740594584`.
- AC-13: the page shows "+47 405 94 584"; after "Copy" the clipboard holds "+4740594584", the button says "Copied" and the Toast says "Copied +4740594584".
- AC-15: at 360 the QR tile is visible from x 16 to 344, as wide as the contact list (328 px), with "Skann meg"; the page does not scroll sideways.

Not verified here: a real phone (the Owner's check of AC-11 covers the iPhone), Safari and Firefox, and the reduced-motion rule of AC-07 in a browser (B-88).

## Operational notes

- No migration, no feature flag, no new dependency. `public/_headers` and `public/_redirects` are unchanged; the contact card file changed (phone number without spaces).
- Merges into `v2` only; production (`main`) is not affected. Rollback: revert the merge commit.

## Differences from the canvas "Save contact hint"

The canvas is a reference; the site's tokens and components win (spec §1.3).

- Label "Add to contacts" (the canvas has "Save to contacts"); no ".vcf" in the bar: with it the label overflows the screen at 360 by 18 px (measured).
- Step numbers are mono "01" to "03" in the accent colour, not filled circles. No drag handle.
- The header icon is `user-plus`, not a check mark: the title no longer says the file was downloaded.
- "Got it" is the Button's large size (52 px), not 48 px.
- The wide form starts at 768, not 600. Scrim, shadow and colours are the site's tokens; Natt is built from the tokens (the canvas has no Natt board).
- The file name under the title is "Alexander Ponomarenko.vcf", the name the browser saves the file under (`public/_headers`), not "alexander-ponomarenko.vcf" from the address as on the canvas. No platform-specific steps (Owner decision after the device tests).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
