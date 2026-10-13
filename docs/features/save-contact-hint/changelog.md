# Changelog — save-contact-hint

## save-contact-hint — "Add to contacts" says what it does on a phone, and the phone number can be copied

**What:** the contact card action of the home page and the Not-found page reads "Add to contacts" (it was "Save contact (.vcf)"); the file type stands beside the label as small meta text in the Contact block and the closing band. On a touch device a line under the action in the Contact block says that a contact card is downloaded and is opened from Downloads. On a touch device with scripts on, a tap on any of the three actions of the home page starts the download as before and opens a bottom sheet with the name of the saved file and three steps; Escape, a tap outside or "Got it" closes it and focus returns to the action. A desktop Visitor sees the new label and nothing else.

Added after user testing on 2026-10-12: the contact card holds the phone number without spaces, the phone row of the Contact block has a "Copy" button like the email row, and a selection of the number is copied without spaces. The QR tile is shown at every width; below 768 it is as wide as the contact list and has no hint.

The feature goes into `v2` in one pull request ([Ponomaleks/alpon.dev#10](https://github.com/Ponomaleks/alpon.dev/pull/10), T1 to T10), after one review round ([round 1](./_review/review-2026-10-12.md)).

**Why:** on a phone the contact card is saved as a file and nothing opens; the Visitor has to find it in Downloads and tap it ([spec](./spec.md) §1, Owner test on an iPhone and on Android, 2026-10-11). Opening the card without a download is not possible (backlog B-58, pull request 9, closed without merging), so the page tells the Visitor where the file goes. Key decisions, all in the spec (the feature is size S and has no ADR of its own):

- D-01: the label is "Add to contacts"; ".vcf" is separate meta text, and the Sticky action bar shows the label only, because with it the label overflows the screen at 360.
- D-02: one set of copy for every touch device, no platform or browser detection.
- D-03: the sheet belongs to the home page; the Not-found page gets the label and no sheet.
- D-04, D-07: the sheet does not say the file was downloaded (the browser may ask first), and it names the file as the browser saves it.
- The sheet is a native modal `<dialog>`, the pattern of base-components ADR-0002.
- Spec §1.4: the additions after user testing, and the Owner decision that changes home AC-17 (the QR tile at every width).

**How to use:**

- The label, the meta text and the name for assistive technology of the action: `src/data/shell-actions.ts`. The Contact block, the closing band and the Sticky action bar read it from there.
- Meta text on any Button: the `meta` and `metaName` properties of `src/components/ui/Button.astro`. `metaName` is what assistive technology reads in the place of the meta text.
- The copy of the sheet: `src/components/home/SaveContactSheet.astro`. The file name it shows has to match the name `public/_headers` gives the contact card.
- The phone number: `src/data/contact.ts` keeps it with spaces, as the page shows it. The contact card holds it without spaces, and `npm run check:contact` (part of `npm run lint`) fails and names the field when the two differ.
- `/styleguide` shows the Button with meta, the inline note and the sheet as a static sample (section "Save contact sheet").

**Operational notes:**

- Migration: <!-- none --> no datastore.
- Feature flag / config: <!-- none -->
- Response headers and routing: `public/_headers` and `public/_redirects` are unchanged. The security policy has no new hash (AC-09).
- Static files: `public/alexander-ponomarenko.vcf` changed (the phone number without spaces). The QR files are unchanged.
- Browser storage: none. The sheet opens on every activation.
- No new npm dependency.
- Visual baselines: 10 new and 116 changed, reviewed by the Owner; most of the changed Styleguide ones only moved by a fraction of a pixel because the page above them grew.
- Deploy: merges into `v2` only. Production (`main`, the stub) is not affected.
- Rollback: revert the merge commit on `v2`; nothing outside the repo changes.

**Open items carried forward:**

- The ".vcf" meta text on the hovered or pressed secondary Button in Dag has a contrast of 4.43:1; the Owner treats the mark as decorative (review R1-1, "Not an issue").
- AC-07 (the slide-up and reduced motion) is asserted against the component source only (B-88).
- Not covered (spec §7): in-app browsers that do not download at all, and a Visitor who refuses the browser's download question while the sheet is open.
- At 390 the baseline of the home contact section is taller than the test window and also shows the header and the Sticky action bar (Owner decision 2026-10-12).
- The contact list of the CV pages keeps "Copy" on the email row only (spec §1.4, out of scope).
- Non-blocking findings of the review round, B-87 to B-90, are in [`docs/backlog.md`](../../backlog.md).

**Acceptance criteria delivered:** AC-01 to AC-15: the new label, its meta text and its name for assistive technology (AC-01); the inline note on touch devices (AC-02); the sheet and its copy (AC-03); closing it and the return of focus (AC-04); no sheet on desktop, with scripts off or on the Not-found page (AC-05); the two forms of the sheet in both themes (AC-06); motion and reduced motion (AC-07); the accessibility of the sheet (AC-08); budgets and the unchanged security policy (AC-09); the Styleguide samples (AC-10); the Owner check in the LinkedIn in-app browser (AC-11); the phone number without spaces in the contact card and its check (AC-12); "Copy" in the phone row (AC-13); copying a selection of the number (AC-14); the QR tile at every width (AC-15).
