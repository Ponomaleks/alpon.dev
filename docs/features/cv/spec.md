---
status: Draft
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead"]
updated_at: "2026-10-09"
feature_size: "S"
---

# Spec — cv

> **Glossary:** [CONTEXT](../../../CONTEXT.md) (repo root; this feature has no feature-level CONTEXT)
> **Reference module / docs / channels used:** `CLAUDE.md`; `docs/roadmap.md` step 5, "Decisions so far" and the lane rules; `docs/stub-parity.md` P-01 to P-03, P-10, P-15, P-30 to P-34, P-51; `docs/backlog.md` B-05, B-35; `docs/architecture-map.md` ("`/cv` collision ahead"); `docs/features/home/spec.md` §1 (step 5 hand-off), IS-01, IS-02, D-10, D-12, D-14, AC-18, AC-34, AC-39 and `adr/0002`; `docs/features/base-components/spec.md` §3 (BackToTop note), AC-24, AC-31; `docs/features/fjord-foundation/adr/0002` (policy on the PDFs); `public/_headers`, `public/_redirects`, `public/sitemap.xml`, `public/cv/`; `src/layouts/BaseLayout.astro`, `src/data/contact.ts`, `src/data/shell-actions.ts`; page design `design/handoff/site/project/site/Cv.jsx`, `App.jsx` (BackToTop, closing band), `data.js` (`cv`), `site.css`; screenshots `design/screenshots/{dag,natt}_cv.png`.

## 1. Context

After home, v2 has a full home page, but "View CV", "Full CV" and the Shell's "CV" link still answer with the English CV PDF (home IS-01). A Recruiter on a phone gets a two-page A4 file to pinch and zoom, with no way to the Norwegian version, no contact action beside it and nothing a search engine can read as a page. The stub on `main` shows the CV inside the home page with a language switch; v2 has nothing in its place, and old links to that section do nothing (home IS-02).

Why now: this is the second step of roadmap wave 3 and the last one before Release 1. Nine stub-parity items belong to it: P-01 to P-03, P-30 to P-34 and P-51. Until they pass, the stub stays on `main` during an active job search.

Committed approach: build one CV page per CV language from the page design, and keep the CV PDF as the source of truth for what the page says. Four rules shape it. (1) The page is the readable form and the file is the form that gets forwarded: "Download PDF" is the one primary action of the page content, and the Original PDF preview shows the file as it is. (2) The page cannot go stale in silence: the repository records a checksum of the CV PDF each page was checked against, and the gate fails when the file changes without it. (3) Everything on the page reads and works with scripts off; scripts only add the Print button, keeping the section across a language switch, and the copy-email action. (4) The addresses people already have keep working: the short CV addresses answer with the page, the PDF addresses do not change, and the Legacy CV addresses hand over. The research pass found that every reviewed résumé page treats the printed page as the PDF, so none has a fixed, designed file beside the page; and that the file, not the link, is what a recruiter forwards. The failure-mode pass ranked two silent failures highest: a CV printed from Natt, and a page that differs from its file after the next CV update; AC-12 and AC-25 answer them. The success criterion from the idea brief stays the measure: a Recruiter understands and acts within 60 seconds on a phone.

Traceability:
- Baseline (roadmap step 5, verbatim): "CV pages EN/NO: `/cv`, `/cv/en`, `/cv/no` as HTML, language switch, page-image preview, Download PDF, legacy `#cv`/`#cv-no` hand-off from home". The Owner added every item that earlier documents assign to step 5; §1.4 lists them with their source.
- One phase, one pull request into `v2` (Owner, 2026-10-08). If the task breakdown goes above about 20 tasks, `tasks` proposes a split before writing tasks: first the CV pages with the parity items, then Print, BackToTop and the menu marker.
- Content source (Owner, 2026-10-08): the two files in `public/cv/` are the source of truth. Confirmed on 2026-10-08: `public/cv/alexander-ponomarenko-cv-en.pdf` equals the design's English upload; `public/cv/alexander-ponomarenko-cv-no.pdf` is the current Norwegian CV and differs from the design's upload `Alexander_Ponomarenko_CV_no_2.pdf`, which the design's Norwegian copy was written from (D-06). The text is taken from `design/handoff/site/project/site/data.js`; the first task compares it with the two CV PDFs line by line and brings the Owner the differences as a list before any page is built from it. English and Norwegian stay different where the files differ.
- The Owner supplies or confirms during implement: the CV date (today 2026-09-30, the date of the two files) and the title and description of each CV page, which are proposed in the pull request; all three go through the Claims list (AC-26).
- The home page keeps its own data (`src/data/home.ts`, confirmed in the home Claims list). It is not derived from the CV data and is not changed to match it. The same first task reports facts that the home page and a CV page state differently, with both wordings and sources, for the Owner to decide; nothing is edited automatically.
- Non-disclosure (Owner, 2026-10-08): the text of the CV PDFs is already cleared for publication, so the CV pages repeat it word for word, product names included. The rule of `CLAUDE.md` stays as it is: the client and its events are not named.
- Postal code (Owner, 2026-10-08): the CV page shows "1482 Nittedal, Norway" as the page design and the CV PDF do. No street address is shown anywhere.
- Shared files (roadmap lane rule): step 4 is merged, so no other worktree is open and the changes below stay in this pull request. Shell and shared files that change: `src/layouts/BaseLayout.astro` (canonical, language alternates, BackToTop), `src/components/layout/MobileBar.astro` and `src/data/shell-actions.ts` (the language switch in the bar, home ADR-0002), `src/components/layout/MobileMenu.astro` (B-05), `src/data/contact.ts` (the CV page addresses, if the design stage needs them there), `public/_headers`, `public/_redirects`, `public/sitemap.xml`, `tests/e2e/parity.spec.ts`, `docs/stub-parity.md`, `scripts/check-contact.ts`, `scripts/check-budgets.ts`, `tests/e2e/primary-count.spec.ts` (B-35), `src/pages/styleguide.astro`. The home page gets one new script (AC-13) and no other change.
- Bar actions: taken from home D-10 and not decided again. The extension of the bar's action type by a language switch is the one planned in home ADR-0002: it stays two links with no style field. The bar itself gets no script; the CV page's own script only changes where the two links of a language switch lead, in the CV head and in the bar alike (AC-08). On the Norwegian CV page the labels the page sets in the bar follow the CV language (AC-19).
- Links to the CV PDF: the page images of the Original PDF preview open the file in a new tab (Owner, 2026-10-08, as the page design). This is the one exception to home D-09's rule that links inside the site stay in the same tab; the links are announced as opening a new tab. "Download PDF" saves the file and opens nothing.
- The inline PDF viewer of the stub is not rebuilt (roadmap "Decisions so far"), so the risk recorded in fjord-foundation ADR-0002 and sad §11 (the viewer under the security policy) closes without a check.
- Backlog items that close here: B-05 (AC-20) and B-35 (AC-16).
- Notes for the design stage, from the Owner and from the two analysis passes:
  - Language switch: two links; a small script reads the section in view and opens the other language at the same section id; focus and the header offset as for the contact place (home AC-18).
  - Original PDF preview: native disclosure, so it opens with scripts off; the page images are not requested while it is closed.
  - BackToTop: a link to the top of the page with no script; its appearance after scroll comes from a scroll-driven animation under a support check, and without support it is always visible (base-components §3).
  - Legacy hand-off: an external script, so the security policy keeps exactly one hash (P-16); it replaces the history entry.
  - Print: a print stylesheet only; no generated file.
  - Canonical and alternates are page options of `BaseLayout`; today the canonical is computed from the path and cannot be set.
  - The CV PDF checksum is a value in the CV data; its check runs in `npm run lint`, extracts no text and adds no dependency (Owner, 2026-10-08).
  - `public/_headers`: the `/cv/*` rule matches the two language pages but not the short address; AC-18 states the result that must hold, the rule set is a design decision.

### 1.1 New or extended

| Item | Status | Note |
|---|---|---|
| CV page, English and Norwegian, and the short CV address | new | from the page design; uses the Shell through page options |
| CV data: typed content per CV language, the CV date, the checksum of each CV PDF | new | next to `contact.ts`; contact facts stay in `contact.ts` |
| CV head: breadcrumbs, name, role line, location line, language switch, actions, meta line | new | Breadcrumbs and the segmented language switch are new components |
| Original PDF preview | new | page images from `public/cv/` |
| Sections: Profile, Skills (SkillGroup), Languages (LanguageList), Work experience (CV job with client projects), Personal projects, Education, Courses, Community | new | section set per CV language as the CV PDF has it |
| Side column: "On this page", contact list, second "Download PDF" | new | the contact list reads `contact.ts`; the copy-email action and the Toast exist |
| Print stylesheet and Print button | new | AC-11, AC-12 |
| Script on the CV page: Print, section kept across the language switch | new | page-own script |
| Script on the home page: Legacy CV address hand-off | new | home change; its size is recorded in the budget check |
| BackToTop (Shell) | new | every page, from 768; on the Styleguide |
| Sticky action bar (Shell) | extend | language-switch action kind (home ADR-0002) |
| Mobile menu (Shell) | extend | marker of the current page (B-05) |
| `BaseLayout` | extend | canonical and language alternates as page options; BackToTop |
| `public/_redirects`, `public/_headers`, `public/sitemap.xml` | extend | AC-15, AC-17, AC-18 |
| Build checks: CV PDF checksum check; contact check covers the CV pages; budget check knows the new scripts | new, extend | AC-25, AC-27, AC-23 |
| `/styleguide` | extend | sections for every new component and for BackToTop, with marked sample data |
| `tests/e2e/parity.spec.ts`, `docs/stub-parity.md` | extend | §1.4 |
| `CLAUDE.md`, `README.md` | extend | the rule for replacing a CV PDF (AC-25), with the note that the CV exists twice, as a CV PDF and as a CV page, so a CV update changes both; the README's route table lists the CV pages |
| `docs/roadmap.md` | extend | step 5 row, its execution-path zone (the shared files of §1), the two "Decisions so far" lines on the CV |
| `CONTEXT.md` | extend | six terms (CV page, CV PDF, CV language, CV date, Original PDF preview, Legacy CV address); BackToTop joins the Shell |

### 1.2 Interim surfaces

None. The header shows no "Projects" link and no "Search" control; they belong to the Shell as steps 7 and 8 build it and are not part of this feature.

### 1.3 Confirmed differences from the page design

Decided by the Owner; they go to the PR's design-difference list as they are.

| Id | Page design | This feature | Reason |
|---|---|---|---|
| D-01 | "Download PDF" is a primary button in the CV head and in the side column | primary in the CV head; secondary in the side column | brand rule: at most one primary button from page content per visible screen; both are in view on wide screens (Owner, 2026-10-08) |
| D-02 | Switching the language re-renders the page in place and keeps the scroll position | two real pages: the switch opens the other CV page; where scripts run it opens at the section that was in view, with focus there; with scripts off it opens at the top | same section, not same pixel: the two languages differ in length, so the same pixel would land on other content (Owner, 2026-10-08) |
| D-03 | "View original PDF" is opened by a script; a missing page image is replaced by an embedded PDF | it opens with scripts off; no embedded PDF is built; each page image is a link with its own name | content never depends on a script; roadmap decision not to rebuild the viewer; Owner, 2026-10-08 |
| D-04 | "Print" is always shown; the print styles hide the whole side column, so the printed CV has no contact details | "Print" is shown only where scripts run; printing gives a compact page in the light colours, without the Shell and the controls, in either theme; a line with email, phone, LinkedIn and GitHub is printed under the location line and is not shown on screen | a button that does nothing with scripts off must not be shown; a CV printed from Natt must stay readable; a printed CV must say how to reach him, as the CV PDF does (Owner, 2026-10-08) |
| D-05 | The sticky bar's "Download PDF" is primary | secondary | home D-10: the bar holds no primary button |
| D-06 | The Norwegian copy follows an older Norwegian CV: no paragraph on the eleven years in insurance, two personal projects, no community section | the Norwegian CV page follows the current Norwegian CV PDF | the CV PDF is the source of truth (Owner, 2026-10-08) |
| D-07 | BackToTop is shown at every width and placed by a script | a link with no script, from 768 only | below 768 the corner belongs to the Sticky action bar (Owner, 2026-10-08); base-components §3 |
| D-08 | "Last updated" in the CV head shows the same date as the footer | the CV date, a value of its own | the footer date is the date of the contact facts; a Recruiter reads the CV line as the age of the CV (Owner, 2026-10-08) |
| D-09 | No separate address for the CV without a language; one page for both languages | the short CV address shows the English CV page and names the English address as its canonical one | roadmap decision: the short addresses serve the pages with no redirect |
| D-10 | "Get in touch" in the CV head is English on the Norwegian CV page, marked as English | "Ta kontakt" on the Norwegian CV page, in Norwegian like the other controls of the page; the header and the closing band keep "Get in touch" | the button belongs to the CV page, not to the Shell; "Ta kontakt" is in the Norwegian list of `CLAUDE.md` (Owner, 2026-10-09) |

Not a difference: the side column's contact list shows "Nittedal, Norge", the Residence. The CV is where the Residence belongs (`CLAUDE.md` Content rules); the Work region stays on the home page.

### 1.4 Items assigned to this step by earlier documents

| Item | What it asks | Source | Answered by |
|---|---|---|---|
| P-01, P-02, P-03 | the three short CV addresses answer with the CV page directly; the three CV rules leave `public/_redirects`; the tests are rewritten, not removed | `roadmap.md` "Decisions so far"; `stub-parity.md` note; `architecture-map.md` | AC-15 |
| P-30 | EN / NO switch, English by default; reworded from tabs to two links | `stub-parity.md` | AC-07 |
| P-31 | reworded: the Legacy CV addresses hand over to the CV pages; the `replaceState` clause is dropped | `stub-parity.md`; home spec §1; home IS-02 | AC-13, AC-14 |
| P-32 | reworded: the CV page replaces the inline PDF viewer | `roadmap.md` "Decisions so far" | AC-01, AC-02 |
| P-33 | reworded: "View original PDF" shows the page images at every width | `stub-parity.md` | AC-09 |
| P-34 | reworded: "Download PDF" in the selected CV language with the file names of P-10; the page images of the Original PDF preview open that CV PDF in a new tab; the meta line | `stub-parity.md`; Owner, 2026-10-08 | AC-05, AC-09 |
| P-51 | the Shell's CV links reach the CV page; the closing band's "Get in touch" | `stub-parity.md`; base-components AC-31; home spec §1 | AC-16 |
| P-10, P-15 | stay active; P-15 is extended to the CV pages and the page images | `stub-parity.md`; Owner, 2026-10-08 | AC-18 |
| IS-01, IS-02 | the two home Interim surfaces end | home spec §1.2 | AC-16, AC-13 |
| B-05 | computed-style test of the header's current marker; a marker in the mobile menu | `backlog.md` | AC-20 |
| B-35 | the "band keeps Get in touch" test points at the CV page | `backlog.md` | AC-16 |
| BackToTop | a link with no script, shown after scroll | base-components spec §3 | AC-21, AC-22 |
| D-10, home ADR-0002 | bar on the CV page: language switch and "Download PDF", both secondary | home spec §1.3 | AC-19 |
| D-12, D-14 | band: "Get in touch" and "Download CV"; header "Get in touch" always primary | home spec §1.3 | AC-06, AC-16 |
| CV visits KPI | home visits that continue to the CV pages become countable | home spec §7 | §7 |

`docs/stub-parity.md` holds the wording of each parity item; this feature rewrites the items above there and flips P-30 to P-34 and P-51 from `fixme` to `test`.

## 2. Goals

- A Recruiter reads the whole CV as a page, in English or Norwegian, on a phone or a laptop, and takes the CV PDF in that language with one action.
- The CV page and the CV PDF say the same thing, and a CV update cannot reach `v2` with only one of the two changed.
- Every address that led to the CV keeps leading to it: the short addresses, the Shell's links and the Legacy CV addresses.
- A Tech lead finds the page as careful as the home page: complete without scripts, one primary action, a readable print, both themes.
- v2 reaches stub parity for the CV: the nine parity items of this step pass.

## 3. Non-goals

- Generating the CV PDF from the page, or the page from the file: the CV PDF is made by the Owner outside the repository. Text is not extracted from it in the build; the content check is the Owner's.
- An embedded PDF viewer: the roadmap decided not to rebuild the stub's viewer; the Original PDF preview and the file itself replace it.
- A separate "Open PDF" button: the page images of the Original PDF preview are the route to the file and to printing the original (Owner, 2026-10-08).
- Aligning the English and Norwegian CV, or changing the home page to match the CV: each follows its own confirmed source; differences are only reported.
- The "Projects" navigation link (step 7), "Search" (step 8), analytics (step 6) and the Message form (step 12).
- BackToTop below 768: the Sticky action bar owns that corner.

## 4. User stories

### US-01: Read the CV as a page

**As a** Recruiter
**I want** the CV as a page in English or Norwegian, readable on my phone without opening a file
**So that** I can judge the profile, skills and work history in a minute

### US-02: Take the file

**As a** Recruiter
**I want** to download the CV PDF in the language I am reading
**So that** I can forward it or attach it to a candidate record

### US-03: Switch the language and keep my place

**As a** Recruiter
**I want** to switch between English and Norwegian where I am reading
**So that** I can compare a section without scrolling to it again

### US-04: See the original file

**As a** Visitor
**I want** to see the pages of the CV PDF and open the file
**So that** I know what the document I would download or print looks like

### US-05: Print the page

**As a** Visitor
**I want** to print the CV page as a compact, readable document
**So that** I can bring it to a meeting

### US-06: Arrive from an old link

**As a** Visitor
**I want** an old link to the CV section of the home page to take me to the CV
**So that** a link in an old email or profile still works

### US-07: Find the CV from anywhere

**As a** Visitor
**I want** every CV link on the site, the short addresses and a search result to lead to the right CV page
**So that** I never land on the wrong language or on a dead address

### US-08: A page that holds up

**As a** Tech lead
**I want** the CV page to be complete without scripts, accessible, and clear about its one main action
**So that** I can see the same care in it as in the home page

### US-09: A CV that stays true

**As an** Owner
**I want** the CV page tied to the CV PDF it was checked against, and every number confirmed
**So that** a page never contradicts the file I send

### US-10: Get back to the top

**As a** Visitor
**I want** a way back to the top of a long page on a wide screen
**So that** I can reach the navigation and the actions again

### US-11: Actions at my thumb

**As a** Recruiter
**I want** the language switch and the download within reach on a phone while I read
**So that** I do not have to scroll back to the head of the page

### US-12: Know where I am

**As a** Visitor
**I want** the navigation to mark the CV as the page I am on
**So that** I can orient myself in the header and in the mobile menu

## 5. Acceptance criteria

### AC-01 (US-01) — happy

**Given** a Recruiter opens the English CV page at any width from 360
**When** the page has loaded
**Then** they see, in this order: breadcrumbs from the site name to "CV"; the name "Alexander Ponomarenko" as the main heading of the page; the role line of the English CV PDF; the line "1482 Nittedal, Norway" with "Norwegian work permit"; and the numbered sections Profile, Skills, Languages, Work experience, Personal projects, Education, Courses, and Community & volunteering, each with a heading and the content the English CV PDF has for it: the profile paragraph; the skill groups as plain lists; three languages with their levels; each job with role, organisation, period and, where the file has them, its client projects with their technologies, its internal projects or its paragraphs; each personal project with its stack, text and a link to its code; education and courses as dated rows; the community list

### AC-02 (US-01) — happy

**Given** a Recruiter opens the Norwegian CV page
**When** the page has loaded
**Then** the CV content and the labels of the CV page are in Norwegian as the Norwegian CV PDF and the page design have them ("Last ned PDF", "Ta kontakt", "Skriv ut", "På denne siden", "Se original-PDF"), the page is marked as Norwegian for assistive technology and search engines, and the sections are the ones the Norwegian CV PDF has, numbered in the order shown; the Shell around it stays English and is marked as English, except the two actions this page sets in the Sticky action bar, which follow the CV language (AC-19). The contact button in the CV head is one of the CV page's own controls, so it follows the CV language: "Ta kontakt" on the Norwegian page, "Get in touch" on the English one; the header's "Get in touch" and the closing band's "Get in touch" are Shell and stay English on both pages

### AC-03 (US-01) — domain invariant

**Given** either CV page
**When** a Visitor reads it
**Then** language levels are plain words with no level codes (English "Upper-intermediate", "Intermediate", "Native"; Norwegian "Øvre mellomnivå", "Mellomnivå", "Morsmål"); skills are text with no logos, bars or percentages; the client of the consulting employer and its events are described only as the CV PDF describes them and are never named; and no text in square brackets that stands for a missing value is on the page

### AC-04 (US-01) — happy

**Given** a Visitor reads a CV page
**When** the width is 1024 or more
**Then** a side column beside the content shows "On this page" with a numbered link to every section, which moves the page to that section with its heading clear of the header; a contact list with email, phone, LinkedIn, GitHub and the Residence "Nittedal, Norge", taken from the site's single contact source, with the copy-email action that confirms with "Copied"; and "Download PDF". Below 1024 the same column follows the content. The contact list offers no contact card

### AC-05 (US-02) — happy

**Given** a Recruiter is on a CV page
**When** they activate "Download PDF" in the CV head or in the side column
**Then** the CV PDF in the CV language of that page is saved under the name "Alexander_Ponomarenko_CV_EN.pdf" or "Alexander_Ponomarenko_CV_NO.pdf"; next to the actions a line shows the CV date and "PDF · 2 pages · A4" ("Sist oppdatert" and "PDF · 2 sider · A4" on the Norwegian page); the CV date is the same on both CV pages and is not the date in the footer

### AC-06 (US-02, US-08) — domain invariant

**Given** a CV page at 390, 834 or 1440, at the top, in the middle and at the end
**When** the primary buttons on the visible screen are counted
**Then** there are never more than two, and never more than one from the page content: "Download PDF" in the CV head is the only primary button of the page content; "Download PDF" in the side column, "Get in touch" ("Ta kontakt" on the Norwegian page) and "Print" in the CV head and both actions of the Sticky action bar are not primary; the header's "Get in touch" is always primary and the closing band's "Get in touch" is the same Shell action, both English on both CV pages

### AC-07 (US-03) — happy

**Given** a Visitor is on a CV page with scripts off
**When** they look at the language switch in the CV head and activate the other language
**Then** the switch is two links, "EN" and "NO", with the CV language of the page marked as the current one and "NO" marked as Norwegian; the other CV page opens at its top. A Visitor who opens the short CV address gets the English CV page with "EN" marked

### AC-08 (US-03) — happy

**Given** a Visitor has scrolled a CV page so that a section is in view, with scripts on
**When** they activate the other language in the CV head or in the Sticky action bar
**Then** the other CV page opens at the same section, with its heading clear of the header and keyboard focus at that section; one press of Back returns to the page they left. If the other CV page has no such section, or the Visitor was above the first section, it opens at the top

### AC-09 (US-04) — happy

**Given** a Visitor is on a CV page, with scripts on or off
**When** they activate "View original PDF"
**Then** the Original PDF preview opens and its state is announced; it shows one image for each page of the CV PDF in the CV language of the page, side by side at every width as the page design draws them, and the meta line of AC-05 in the CV language of the page; each image is a link that opens that CV PDF in a new tab, and each has its own name, in the CV language of the page, that says the page, the language, that it is a PDF and that it opens in a new tab (on the English page "CV page 1 of 2, English, PDF, opens in a new tab" and "CV page 2 of 2, English, PDF, opens in a new tab"); activating the control again closes it. On arrival the preview is closed and no page image has been requested

### AC-10 (US-04) — error

**Given** the Original PDF preview is open
**When** a page image cannot be loaded
**Then** its link is still there with its name and still opens the CV PDF, the reserved space keeps the layout from shifting, and no embedded PDF takes its place

### AC-11 (US-05) — happy

**Given** a Visitor is on a CV page
**When** they activate "Print" where scripts run, or print from the browser's own menu with scripts on or off
**Then** the printed document holds the name, the role line, the location line, one line with the email, phone, LinkedIn and GitHub from the site's single contact source, and every section, and none of: the header, the mobile menu, the breadcrumbs, the language switch, the actions, the Original PDF preview, the side column with its contents list and download, the Sticky action bar, BackToTop, the closing band, the footer; no job, project, education or course entry is split across two sheets, and no section heading is left alone at the foot of a sheet; links to other sites show their address as text. The contact line is part of the printed document only and is not shown on screen. With scripts off the "Print" button is not shown

### AC-12 (US-05) — domain invariant

**Given** a Visitor has the Natt theme
**When** they print a CV page
**Then** the printed document uses the light colours, dark text on a white sheet with no dark fills, exactly as from Dag; the theme on screen does not change

### AC-13 (US-06) — cross-context

**Given** a Visitor follows an old link to a Legacy CV address on the home page, with scripts on
**When** the home page starts to load
**Then** they arrive at the English CV page for the English Legacy CV address and at the Norwegian CV page for the Norwegian one, and one press of Back returns to where they came from, not to the home page. The script that does this is the home page's only change in this feature, it is loaded from the site itself, the security policy is unchanged by it, and its size is recorded with the home page's own scripts

### AC-14 (US-06) — error

**Given** a Visitor opens the home page with scripts off, or with any other fragment in the address
**When** the page has loaded
**Then** the home page is shown as before, "View CV" is visible on the first screen and leads to the CV page, and the contact place still opens for its own address

### AC-15 (US-07) — cross-context

**Given** a Visitor opens the short CV address, the English CV address or the Norwegian CV address
**When** the site answers
**Then** it answers with the CV page itself, without sending the Visitor to another address; the addresses of the two CV PDFs are unchanged and still answer with the files; the parity tests P-01 to P-03 are rewritten to check this and none is removed

### AC-16 (US-07) — cross-context

**Given** a Visitor is on any page for Visitors
**When** they activate a CV link of the Shell or of the home page: "CV" in the header or in the mobile menu, "View CV" in the Sticky action bar, the home hero's "View CV" or the experience section's "Full CV"
**Then** from every page other than a CV page they arrive at the English CV page. On a CV page, "CV" in the header and in the mobile menu is the link to the current page: it leads to the CV page in the CV language the Visitor is reading, the Norwegian CV page from the Norwegian one, and is marked as current (AC-20) (Owner, 2026-10-09). On a CV page the closing band offers "Get in touch", which leads to the contact place, and "Download CV", which saves the CV PDF in the CV language of that page. The test that the band keeps "Get in touch" on pages other than home runs against the CV page

### AC-17 (US-07) — happy

**Given** a search engine or a link preview reads a CV page
**When** it reads the head of the page
**Then** each CV page has its own title and description in its CV language, its own social-preview data with the site's preview image, and its own canonical address; the two pages name each other as the English and Norwegian versions and name the English page as the default for other languages (Owner, 2026-10-08); the short CV address names the English CV page as canonical; and the site's sitemap lists both CV pages

### AC-18 (US-07) — cross-context

**Given** a Visitor's browser requests a CV page, a CV PDF or a page image
**When** the site answers
**Then** the CV pages at all three addresses are served with the same freshness rule as the home page, so a corrected page is seen on the next visit; only the CV PDFs are served for viewing in the browser under their file names; the CV PDFs and the page images keep their one-hour rule; every answer carries the site's security headers

### AC-19 (US-11) — happy

**Given** a Recruiter is on a CV page below 768
**When** the Sticky action bar is on screen
**Then** it offers the language switch and "Download PDF" ("Last ned PDF" on the Norwegian page), both in the secondary style; the switch and the download behave as in the CV head (AC-05, AC-07, AC-08); the bar collapses to its tab and returns as on the home page

### AC-20 (US-12) — happy

**Given** a Visitor is on a CV page
**When** they look at the header, or open the mobile menu
**Then** "CV" is marked as the current page in both, announced as current to assistive technology; in the header the marker is the one the page design draws, checked on the rendered page and not only in the style source (B-05); in the mobile menu the current link differs from the other links by more than colour, in a form the design stage chooses within Fjord. On the home page and the Not-found page no link is marked

### AC-21 (US-10) — happy

**Given** a Visitor is on any page for Visitors at 768 or wider and has scrolled down
**When** they activate BackToTop
**Then** the page is at its top and keyboard focus is at the start of the page; BackToTop is a link that works with scripts off, has a name that says what it does, a visible focus ring and a target of at least 44 by 44; where the browser cannot tie its appearance to scrolling it is visible all the time; with reduced motion it appears without movement

### AC-22 (US-10) — domain invariant

**Given** any page for Visitors
**When** it is shown below 768, or at 768 or wider at the end of the page with focus on the last link of the footer
**Then** below 768 there is no BackToTop; at 768 or wider BackToTop covers no part of the last line of the page and no part of the focused element

### AC-23 (US-08) — authorization

**Given** a Visitor, who never signs in, opens a CV page with scripts off, or with a browser that refuses anything the security policy does not name
**When** the page has loaded
**Then** every section, the language switch, both downloads, the Original PDF preview, the contact list with its links and the Shell are readable and usable; only "Print", the copy-email action and keeping the section across the language switch are absent; the security policy is the same as before this feature, with no new source and no inline script or style; the CV page's own scripts stay inside the page-script budget of the site

### AC-24 (US-08) — happy

**Given** a Tech lead inspects a CV page in Dag and in Natt at 390, 834 and 1440
**When** they check structure and look
**Then** the page has one main heading and section headings in order with none skipped; every interactive element of the page content has a target of at least 44 by 44 and a visible focus ring; an automated accessibility check finds nothing with the Original PDF preview closed and open; and the page matches the page design except for the differences listed in §1.3

### AC-25 (US-09) — error

**Given** the Owner replaces a CV PDF in the repository
**When** the gate runs without the recorded checksum of that file being updated
**Then** the gate fails and names the file and the CV page that must be checked against it; it passes again only after the checksum is updated. The rule is written in the project instructions and in the README, with the note that the CV exists twice: when a CV PDF is replaced, the CV page in that CV language is updated in the same pull request, the page images of that file are made again, the CV date is set, the checksum is updated after that, and the CV rows of the Claims list are confirmed again. Comparing the text of the page with the file stays the Owner's check

### AC-26 (US-09) — happy

**Given** the feature is ready for merge
**When** the Owner reads the pull request
**Then** it holds the list of differences between the design's CV text and the two CV PDFs with the Owner's decision on each, the list of facts the home page and a CV page state differently, and a Claims list with every number and date shown on the CV pages, the page count of the meta line and the CV date included, each with the CV PDF and the page of it as its source, and with the title and description of each CV page; every row is ticked by the Owner before merge, and no CV page was built from text the Owner had not seen compared

### AC-27 (US-09) — cross-context

**Given** the contact facts live in the site's single contact source
**When** the gate runs
**Then** the contact check also covers both CV pages: the email, phone, LinkedIn and GitHub shown there, on screen and in the printed contact line, and the Residence in the side column equal the contact source, and the gate fails if a CV page states one of them differently. The location line of the CV head, with the postal code, is CV content: it follows the CV PDF, is confirmed in the Claims list, and the check only requires that it names the town of the Residence

### AC-28 (US-09) — happy

**Given** the parity suite before this feature
**When** the feature merges into `v2`
**Then** P-30, P-31, P-32, P-33, P-34 and P-51 are active tests of the reworded behaviour, P-01, P-02, P-03 and P-15 check the new behaviour, P-10 passes unchanged, and no parity item was deleted

### AC-29 (US-08) — happy

**Given** the Owner opens the Styleguide
**When** they look for the components this feature adds
**Then** Breadcrumbs, the language switch, SkillGroup, LanguageList, the CV job entry, the dated rows, the contents list, the Original PDF preview, the Sticky action bar with the language switch, the mobile menu with a current link and BackToTop are each shown in their states, in Dag and Natt, with sample data marked as such

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Lighthouse categories, mobile | Performance, Accessibility, Best Practices, SEO each ≥ 95 on both CV pages | Lighthouse CI (mobile) on the built site |
| LCP / CLS / TBT, mobile | ≤ 2.0 s / ≤ 0.02 / ≤ 100 ms on both CV pages | Lighthouse CI (mobile) |
| Page images | 0 requests for a page image before the Original PDF preview is opened; width and height reserved | e2e request log (AC-09); CLS above |
| Initial JS | ≤ 50 KB gzip in total on a CV page; the CV page's own scripts ≤ 10 KB gzip; the home page's own scripts, the hand-off included, stay ≤ 10 KB gzip; Shell scripts stay ≤ 5 KB gzip | build output size check in CI |
| Accessibility | 0 axe violations on both CV pages in Dag and Natt, with scripts on and off, with the Original PDF preview closed and open | axe in Playwright |
| Touch targets | every interactive element of the CV page content and BackToTop ≥ 44 × 44 px, counting its overlay | e2e box measurement |
| Primary buttons | CV pages at 390 / 834 / 1440, counted at the top, in the middle and at the end: visible screen ≤ 2, page content ≤ 1, Sticky action bar 0 | e2e count (AC-06) |
| Language switch | with scripts on, the other CV page opens at the section in view for each of the sections both pages have; the heading is 0 px under the header | e2e per section (AC-08) |
| BackToTop | 0 px overlap with the last line and with the focused element at 768, 834, 1024 and 1440 on every page for Visitors; absent below 768 | e2e box measurement (AC-22) |
| Print | in print media, started from Dag and from Natt: 0 Shell parts and controls rendered; the contact line rendered once; background of the sheet white; 0 entries split across sheets on A4 | e2e in print media and a printed-PDF check; manual print in two browsers recorded in the PR |
| Contrast | every text and background pair the new components render, in Dag, Natt and on spruce: body ≥ 4.5:1; large text, control boundaries and the focus ring ≥ 3:1 | contrast check script in CI |
| Visual regression | ≤ 0.1 % differing pixels per screenshot; both CV pages at 390 / 834 / 1440 in Dag and Natt, with the preview closed and open; new Styleguide sections; home and Not-found re-baselined at 834 and 1440 for BackToTop | Playwright visual tests in CI |
| Design match | 0 differences between the CV pages and `design/screenshots/{dag,natt}_cv.png` (and the standalone design at 390 and 834) other than those in §1.3 | manual review in the PR, screenshots side by side |
| Token-only styles | 0 findings over all page, component and print styles | Stylelint in CI |
| Placeholders | 0 bracketed placeholders on the CV pages | build check |
| CV PDF checksum | the gate fails on 2 of 2 replaced files in a test with a changed file; it adds 0 dependencies | unit test of the check; `package.json` diff |

## 6.1 Security / privacy

- **Data classification:** public. The CV pages show what the CV PDFs, already public at their addresses, show. The pages take no input from Visitors.
- **Personal data touched:** the Owner's own: the postal code and town of the Residence ("1482 Nittedal"), now on an indexable page as well as in the file (Owner decision, 2026-10-08); phone and email as on the home page. No street address. No third party's personal data. Nothing is stored in the Visitor's browser by this feature, and no cookie is set.
- **AuthZ/AuthN impact:** none. No accounts or sign-in; the site still receives no data from a Visitor. The security policy is unchanged (AC-23, AC-13).
- **Abuse cases:**
  - A script or style the security policy does not name appearing in a CV page: refused by the browser (AC-23).
  - A crafted fragment on the home page used to send a Visitor elsewhere: the hand-off knows exactly the two Legacy CV addresses and two fixed targets on the site; anything else is ignored (AC-14).
  - A section name carried across the language switch from a crafted address: only the section ids of the CV page are honoured; anything else opens the page at the top (AC-08).
  - A link to another site opening a tab that can reach back: every such link, the code links of the personal projects included, follows the site rule for links to other sites (home D-09).
  - A CV PDF replaced with a file that does not match the page: stopped by the gate (AC-25).
- **Security review:** N/A: the policy contract is unchanged, the pages take no input, and the two new scripts read only the address and the scroll position.

## 7. Metrics / KPIs

- **Open stub-parity items (`test.fixme` in the parity suite)** — baseline: 6, target: 0 when this feature merges into `v2`.
- **Differences from the page design not listed in §1.3** — baseline: the whole page (not built), target: 0 at the design-match review.
- **Claims list rows and CV text differences confirmed by the Owner** — baseline: 0, target: all of them before merge.
- **CV pages that differ from the CV PDF they were checked against** — baseline: not guarded, target: 0 merges into `v2` with a changed CV PDF and an unchanged checksum, from this feature on.
- **Home visits that continue to a CV page** — baseline: TBD; this is the measurable part of the home KPI. Step 6 turns the analytics on and confirms what it can count; measured over the first 30 days after Release 1, and the target is set from that baseline.
- **Review rounds** — baseline: 3 (home 4b), target: ≤ 2.

## 8. Open questions

None. The choices left open on purpose belong to the design stage and are bounded here: the marker of the current link in the mobile menu (AC-20), the rule set in `public/_headers` (AC-18), and where the CV page addresses live in the data (§1 Shared files).
