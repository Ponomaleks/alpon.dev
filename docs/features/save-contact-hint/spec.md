---
status: Draft
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead"]
updated_at: "2026-10-11"
feature_size: "S"
---

# Spec — save-contact-hint

> **Glossary:** [CONTEXT](../../../CONTEXT.md) (repo root; this feature has no feature-level CONTEXT)

## 1. Context

On a phone the contact card (`/alexander-ponomarenko.vcf`) is saved as a file and nothing opens. The Owner tested this on a real iPhone (Safari) and on Android (an in-app browser) on 2026-10-11:

1. The browser may ask to download the file (iOS always asks; on Android the question can be turned off).
2. Nothing opens after the download; the file lands in Downloads.
3. The Visitor opens Downloads in the Files app, taps the file, and the system Contacts app offers to save it.

Serving the file without `Content-Disposition` and without the `download` attribute did not change this (backlog B-58, pull request 9, closed without merging). So the page tells the Visitor where the file goes and what to do with it.

Design reference: Claude Design canvas "Save contact hint", boards 1 to 4. It is a reference, not a page design: the site's tokens, components and brand rules win, and the rest of the page is not rebuilt. The canvas has no Natt board; Natt is built from the tokens.

This feature is small (S): the screens and the test plan are in this file, and there is no `sad.md`. The modal `<dialog>` opened with `showModal()` is the pattern of base-components ADR-0002.

### 1.1 New or extended

| Part | Kind | Notes |
|---|---|---|
| Button | extended | optional meta text after the label, and a name for assistive technology that differs from the visible text |
| Contact block | extended | new label, the inline note |
| Closing band (home), Sticky action bar (home, Not-found) | extended | new label through the shell-action descriptors |
| SaveContactSheet | new | the bottom sheet, a native modal `<dialog>` |
| Home page script | extended | opens and closes the sheet |
| Styleguide | extended | the Button with meta, the inline note, the sheet as a static sample |

### 1.2 Changes to earlier documents

- The label "Save contact (.vcf)" becomes "Add to contacts" in home AC-16, AC-38, AC-40, D-10 and D-12 and wherever the live home documents and `CLAUDE.md` name it. What the action does (downloads the contact card) does not change.
- Backlog B-58 is marked as not built.

### 1.3 Decisions

| # | Decision | Reason |
|---|---|---|
| D-01 | The label is "Add to contacts". The file type ".vcf" is separate meta text in the Contact block and the closing band. The Sticky action bar shows the label only | measured at 360 in the bar: "Add to contacts" with ".vcf" overflows the screen by 18 px; the label alone is narrower than "Save contact (.vcf)" was |
| D-02 | One set of copy for every touch device, no platform or browser detection | the flow is the same on iOS and Android (Owner test); names of system controls are localised, so the steps do not describe them |
| D-03 | The sheet opens from the three actions of the home page only. The Not-found page's bar gets the new label and no sheet | the sheet's script stays a page script of home; a Shell script has a 5 KB budget |
| D-04 | The sheet's title is neutral ("Add the contact card") and does not say the file was downloaded. Under the title the sheet names the file as the browser saves it, "Alexander Ponomarenko.vcf" (the name `public/_headers` gives it, not the name in the address) | the browser may ask first and the Visitor may refuse; the Visitor has to know which file to look for in Downloads (Owner decision 2026-10-11) |
| D-05 | "Got it" is a primary button. The one-primary rule is counted inside the open sheet, because the page under a modal dialog is inert | Owner decision 2026-10-11 |
| D-06 | Step numbers are mono "01", "02", "03" in the accent colour, not filled circles; no drag handle; the wide form starts at 768, not 600; icons are the site's 1.5 px line icons; the Button keeps its size and weight | brand rules and the site's breakpoints (Owner decision 2026-10-11) |
| D-07 | The header icon of the sheet is `user-plus`, the icon of the action, not a check mark | a check mark would say the contact was saved (D-04) |

### 1.4 Added after user testing (2026-10-12)

A tester on a phone tried to select the phone number to copy it and got the link with it. Two additions, both about the phone number as something to paste into a dialler or a contact (AC-12 to AC-14):

- The contact card holds the number without spaces. The page still shows it with spaces. The QR files are not changed (`CLAUDE.md`, Architecture decisions).
- The phone row of the Contact block gets a "Copy" button like the email row, and a selection of the number is copied without spaces. The menu a browser shows on a long press on a link ("copy link") is the browser's own: it fires no copy event and a page cannot change what it copies. The "Copy" button is the way that always works.

On the same day the Owner decided that the QR tile is shown at every width, not from 1024 only (AC-15; it changes home AC-17). On a phone it is there to be scanned by someone else's phone; its hint and the line "Or scan the QR code on a computer." in the sheet keep their wording.

Out of scope: the contact list in the side column of the CV pages keeps "Copy" on the email row only.

## 2. Goals

- A Visitor on a phone or tablet who taps the contact card action knows that a file is downloaded, where it goes and how to turn it into a contact.

## 3. Non-goals

- Opening the contact card without a download (B-58, not possible).
- Platform or browser detection, descriptions of system controls, storage, analytics.
- A hint on desktop: the QR tile is enough there.
- A sheet on the Not-found page (D-03).

## 4. User stories

### US-01: Know what the button does

**As a** Visitor on a phone
**I want** the contact card action to say what it does and where the file goes
**So that** I can add Alexander to my contacts without guessing

## 5. Acceptance criteria

### AC-01 (US-01) — happy

**Given** a Visitor on the home page or the Not-found page
**When** they look at a contact card action (Contact block, closing band, Sticky action bar)
**Then** it reads "Add to contacts" in the secondary style it had; in the Contact block and the closing band the file type ".vcf" follows the label as separate text in the mono font and the muted colour, and the bar shows the label only (D-01). Its name for assistive technology is "Add to contacts (vCard file)" in all three places. The address and the `download` attribute do not change

### AC-02 (US-01) — happy

**Given** a Visitor in the Contact block on a device that matches `(hover: none) and (pointer: coarse)`
**When** they look under "Add to contacts"
**Then** they see one line with a small download icon, "Downloads a contact card. Open it from Downloads to add.", in the 13 px interface size and the muted colour. On other devices the line is not shown. It needs no script

### AC-03 (US-01) — happy

**Given** a Visitor on the home page with scripts on, on a device that matches `(hover: none) and (pointer: coarse)`
**When** they activate "Add to contacts" in the Contact block, the closing band or the Sticky action bar
**Then** the download starts as before (the click is not prevented) and the sheet opens as a modal dialog above everything else, with the title "Add the contact card", under it the file name "Alexander Ponomarenko.vcf", the lead "It goes to your Downloads.", the steps 01 "If your browser asks, tap Download.", 02 "Open Downloads in your Files app.", 03 "Tap the file and save it as a contact.", the button "Got it" and the line "Or scan the QR code on a computer.". The copy is the same on every device, and the sheet opens on every activation; nothing is stored

### AC-04 (US-01) — happy

**Given** the open sheet
**When** the Visitor presses Escape, taps outside the sheet or activates "Got it"
**Then** the sheet closes and focus returns to the action that opened it

### AC-05 (US-01) — domain invariant

**Given** a device that does not match `(hover: none) and (pointer: coarse)`, or scripts off, or the Not-found page
**When** the Visitor activates "Add to contacts"
**Then** the file downloads and no sheet opens

### AC-06 (US-01) — happy

**Given** the open sheet in Dag or in Natt
**When** the Visitor looks at it
**Then** below 768 it spans the screen at the bottom with 16 px top corners and 20 px side padding; from 768 it is at most 480 px wide, centred, 16 px above the bottom, with all corners 16 px. The header has a 40 px soft-accent circle with the `user-plus` icon and, beside it, the title with the file name under it in the mono font and the muted colour; the steps have mono numbers in the accent colour; "Got it" is the Button in its large size (52 px), full width; the last line is centred under it. Every colour, size, radius and shadow comes from `--fjord-*` tokens, there is no drag handle, and the text meets WCAG 2.2 AA contrast in both themes

### AC-07 (US-01) — domain invariant

**Given** the sheet opening
**When** the Visitor has not asked for reduced motion
**Then** it slides up in 200 ms; with `prefers-reduced-motion: reduce` it appears with no animation

### AC-08 (US-01) — domain invariant

**Given** the open sheet
**When** it is checked for accessibility in both themes
**Then** it is a dialog named by its title (a level 2 heading), axe reports zero violations, every target is at least 44 px, and "Got it" is its one primary button (D-05)

### AC-09 (US-01) — domain invariant

**Given** the built home page
**When** the budgets and the security policy are checked
**Then** the sheet adds no inline style, no inline script and no new hash to the policy, and the home page's own scripts stay within their budget

### AC-10 (US-01) — happy

**Given** the Styleguide
**When** a reader opens it
**Then** it shows the Button with meta text, the inline note and the sheet as a static sample

### AC-11 (US-01) — cross-context

**Given** the feature on a preview address
**When** the Owner opens the home page in the LinkedIn in-app browser on an iPhone and activates "Add to contacts"
**Then** the Owner records what happens, and the pull request states it. Visual baselines are taken only after this check

### AC-12 (US-01) — domain invariant

**Given** the contact card file
**When** it is read
**Then** its phone number has no spaces ("+4740594584"), and the contact check fails, naming the field, if the number differs from the one in the contact source with its spaces removed

### AC-13 (US-01) — happy

**Given** a Visitor in the Contact block with scripts on
**When** they activate "Copy" in the phone row
**Then** the number without spaces is on the clipboard, the button shows "Copied" for a short time and a Toast confirms with "Copied" and the number, as for the email. Where copying is refused they are told to select the number, and no confirmation is shown. With scripts off the button is not offered

### AC-14 (US-01) — happy

**Given** a Visitor who selects the phone number, or a part of it, in the Contact block
**When** they copy the selection
**Then** the clipboard holds the selected digits without spaces. A selection that reaches outside the number is copied as it is

### AC-15 (US-01) — happy

**Given** a Visitor in the Contact block at any width, in Dag or Natt
**When** they look under "Add to contacts"
**Then** they see the QR tile for the theme with the caption "Skann meg" and the hint beside it, inside the screen down to 360; below 1024 it stands between the action and the mail-link sentence

## 6. Non-functional requirements

The quality bar of `CLAUDE.md` applies unchanged: WCAG 2.2 AA, the performance budget, tokens only, strict CSP.

## 7. Screens and tests

| Screen | State | Reference | Tests |
|---|---|---|---|
| Contact block | label with meta; inline note on touch devices | canvas board 1 (label A; the label text is D-01) | unit on the markup; e2e: mobile sees the note, desktop does not |
| Closing band, Sticky action bar | new label | — | unit; the existing e2e on the label |
| Sheet, below 768 | open, Dag and Natt | canvas boards 2 and 3 (copy and details per §1.3) | e2e mobile: download event and dialog with the copy; Escape, outside tap and "Got it" close it and focus returns; axe in both themes; visual at 390 |
| Sheet, from 768 | open, Dag and Natt | canvas board 4 | visual at 834 |
| Contact block, phone row | "Copy" at the end of the row, as in the email row | — | unit on the markup and the script; e2e: clipboard after "Copy" and after copying a selection; the row at 360 |
| Desktop | no note, no sheet | — | e2e desktop: download event, no dialog, no note |

Visual baselines go through the `visual-baselines` label workflow, after AC-11. The label change also changes the existing baselines of the home page, the Not-found page and the Styleguide.

Not covered: in-app browsers that do not download at all (AC-11 records one of them); a Visitor who refuses the browser's download question while the sheet is open.

A laptop with a touch screen does not match the media query and gets neither the note nor the sheet. That is intended: it has the QR tile.

## 8. Open questions

None.
