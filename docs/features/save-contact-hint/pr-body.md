Draft until the Owner check (AC-11) and the visual baselines (T7) are done.

Spec: `docs/features/save-contact-hint/spec.md`. Replaces backlog B-58 (pull request 9, closed).

## What changed

- The contact card action reads "Add to contacts". The Contact block and the home closing band show ".vcf" as mono, muted meta text; the Sticky action bar shows the label alone (D-01). Its name for assistive technology is "Add to contacts (vCard file)" everywhere.
- On touch devices (`(hover: none) and (pointer: coarse)`) a note stands under the action in the Contact block: "Downloads a contact card. Open it from Downloads to add." CSS only, no script.
- On touch devices, with scripts on, a tap on any of the three actions of the home page starts the download as before and opens a bottom sheet, a native modal `<dialog>`: "Add the contact card" with the file name under it, "It goes to your Downloads.", three steps, "Got it", "Or scan the QR code on a computer.". Escape, a tap outside and "Got it" close it; focus returns to the action. One set of copy for every device, nothing stored.
- Desktop, scripts off and the Not-found page: the file downloads and no sheet opens.
- The Styleguide shows the Button with meta, the note and the sheet as a static sample (new section "Save contact sheet").

## Owner check before the baselines (AC-11)

- [ ] iPhone, LinkedIn in-app browser, preview address of this branch: activate "Add to contacts" and record what happens (does the file download, does the sheet open, can it be closed).

Result: not done yet.

## Tests

- Unit (`npm run test:unit`): 1330 passed, 71 files.
- Lint (`npm run lint`): exit 0.
- Build, `check:budgets`, `check:contact:built`: within limits.
- Playwright, full local run with `--workers=4` at 1f9d294: 1951 passed, 187 skipped, 0 failed. After the Owner review changes (meta on the label baseline, the file name in the sheet, the centred last line) the specs that touch the action and the sheet and the axe specs were run again: 704 passed, 18 skipped, 0 failed. The full suite was not run a second time.
- Axe: the open sheet in Dag and Natt at 390 and 834, zero violations.
- Visual: not done. The label change alters the existing baselines of the home page, the Not-found page and the Styleguide, and the sheet has none yet, so the visual job in CI is expected to fail until T7.
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
