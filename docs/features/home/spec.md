---
status: Draft
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead"]
updated_at: "2026-10-05"
feature_size: "S"
---

# Spec — home

> **Glossary:** [CONTEXT](../../../CONTEXT.md) (repo root; this feature has no feature-level CONTEXT)
> **Reference module / docs / channels used:** `CLAUDE.md`; `docs/roadmap.md` step 4, lane rules and the Projects rule; `docs/idea-brief.md` §3 and §6; `docs/stub-parity.md` P-20 to P-24 and P-50; `docs/backlog.md` B-05, B-09, B-18, B-25; `docs/features/base-components/spec.md` §1.2, §1.3, §3, AC-23, AC-24, AC-27, AC-28; `src/pages/index.astro`, `src/data/contact.ts`, `public/alexander-ponomarenko.vcf`, `public/_headers`; page design `design/handoff/site/project/site/Home.jsx`, `App.jsx` (header over the hero, reveal), `data.js`, `site.css`; screenshots `design/screenshots/{dag,natt}_home.png`.

## 1. Context

After base-components, v2 has the Shell and the base components, but its home page is a placeholder with a name and one line. A Recruiter who opens it learns nothing about what Alexander builds and finds no contact block; "Contact" and "Get in touch" in the Shell lead to a place that does not exist yet (base-components IS-01, IS-03). The home page is where a Recruiter lands from a search, from LinkedIn or from the QR on a card, mostly on a phone, and it has to answer who, what role, where and how to reach him within a minute.

Why now: this is wave 3 of the roadmap, next to the CV pages (step 5), and Release 1 waits for it. Six stub-parity items belong to this step: P-20 to P-24 and P-50. Until they pass, the stub stays on `main` during an active job search.

Committed approach: build the whole home page from its page design, content first. Three rules shape it. (1) The first phone screen is the one the page design draws: badge, "Oslo, Norge", name, roles, lead, "View CV" and the Now line, with contact one tap away. (2) Every section is visible by default; reveal, count-up, drift and parallax only add motion and never hold content back, so the page reads fully with scripts off. (3) No bracketed placeholder reaches a page for Visitors. Email is the main contact route; the Message form of the page design is not built here (IS-03). The research pass found the same advice in every source: say who, what role, where and how to reach you on the first screen; none of the reviewed pages combines visible location and availability with a CV and with contact routes that need no form. The success criterion from the idea brief stays the measure: a Recruiter understands and acts within 60 seconds on a phone (AC-01).

Traceability:
- Scope: the Owner widened roadmap step 4 from "hero, contact block, meta" to the whole page design. The roadmap row and the execution-path zone of step 4 are updated when this spec is registered.
- Parity: P-20, P-21, P-22, P-23, P-24 and P-50 flip from `fixme` to `test` here (AC-35). P-21 keeps "Oslo, Norge" in the Contact block (D-03).
- Task order: the tasks that Release 1 needs (hero, Contact block, head meta, the parity items) come first and can merge on their own; Recommendations and the Dormant section follow. If the task breakdown goes above about 25 tasks, `tasks` proposes a split along the same line before writing tasks: 4a the Shell changes and the parity part with key facts, About, experience and motion; 4b Recommendations and Selected projects. With the Shell changes added on 2026-10-05 the feature is at the upper edge of size S, so a split is likely.
- Shared files (roadmap lane rule): besides the Shell changes decided by the Owner below (Header, MobileBar, CtaBand, the Not-found page), this feature changes files the Shell owns: `src/data/contact.ts` (Work region coordinates for the hero), `tests/e2e/parity.spec.ts`, `docs/stub-parity.md`, `scripts/check-contact.ts` (structured data and hero coordinates), `scripts/check-budgets.ts` (B-09), `src/components/ui/Toast.astro` (B-25), `src/layouts/BaseLayout.astro` and `src/components/layout/CtaBand.astro` (B-18). Step 5 has not started (no branch or spec on 2026-10-05), so today these changes stay in this feature's PR. The "small separate PR to `v2` first" rule applies only if step 5 starts while this feature is still open, and then only to the files step 5 also touches: `src/data/contact.ts`, `tests/e2e/parity.spec.ts`, `docs/stub-parity.md`, `src/layouts/BaseLayout.astro` and the Shell components (Header, MobileBar, CtaBand). Step 5 should start after the Shell changes of this feature are in `v2`.
- The contact card file is not changed: `public/alexander-ponomarenko.vcf` already holds every field AC-16 names, the LinkedIn and GitHub addresses included. The QR files do not change.
- The base-components KPI "edits to shared Shell or component files in the step 4 PR" will read above 0: B-09, B-18, B-25, the contact data change and the Shell decisions the Owner took on 2026-10-05. These are the edits listed here and nothing else.
- Backlog items that close here: B-09 (page-own scripts are measured apart from the Shell scripts), B-18 (band top margin, `main` minimum height), B-25 (Toast check icon, first used by the copy-email action). B-05 does not apply: the home page marks no navigation link as current.
- Decision (Owner, 2026-10-05): the Message form moves out of this feature into roadmap step 12, the last step. Email, phone, the contact card and LinkedIn are the contact routes until then. In its place the contact section shows a mail-link sentence, see IS-03. The security policy is not changed by this feature: `public/_headers` and `tests/contracts/csp.contract.json` stay as they are, and base-components §3 ("The contact form: not planned; it needs its own ADR") stands. The decisions already taken for the form at the design stage are recorded in the roadmap row of step 12. The ids that left with the form (US-03, US-13, AC-19 to AC-25, AC-37, D-07) are not reused.
- Projects: roadmap rule "Projects merges into `v2` only after Release 1" stays true for the Projects pages. This feature builds only the home section and the shape of a project entry, as a Dormant section (AC-11); step 7 owns the switch. The roadmap records this when the spec is registered.
- Step 5 owns the legacy `#cv` and `#cv-no` hand-off from the home page. It adds its own script and does not need a change in this feature; whichever of the two steps merges second rebases.
- Decision: the page design's Contact block shows "Nittedal, Norge"; `CLAUDE.md` and P-21 put the Work region there. The Work region wins (D-03).
- Decision (Owner, 2026-10-05): the Ambient motion loops of the hero stay as designed and get one Motion control, for WCAG 2.2 success criterion 2.2.2 Pause, Stop, Hide (D-01, AC-30). The closing band's contours follow scrolling instead of looping, so they need no control on any page (D-13, AC-41).
- Decision (Owner, 2026-10-05), Shell changes in this feature: the Sticky action bar's actions are set per page and the bar can be collapsed (D-10, D-11, AC-38, AC-39); the closing band's actions are set per page (D-12, AC-40); the header reproduces the page design and base-components D-06 is dropped (D-14, AC-33). What this replaces in base-components: AC-33 replaces AC-03 for the home page in Dag only (the border appears when the hero leaves, not on the first scroll; in Natt AC-03 stays as it is) and the "secondary while the bar is on screen" clause of AC-23, of the §6 "Primary buttons" row and of the header variant of AC-24, on every page. AC-34 states the primary rule once for every page for Visitors, per visible screen: at most two primary buttons, at most one of them from page content. It replaces the count of AC-23, which points here; nothing changes in practice on the other pages, which have one primary button in their content. Outside the home page, the Not-found page included, the header "Get in touch" is always primary. AC-38 replaces the action pair of AC-07. AC-39 adds the collapse and limits the return of AC-08 to a bar the Visitor has not collapsed. AC-40 replaces the action pair of AC-20 for the home page. Each of these gets a one-line pointer here and keeps no wording of its own on that point. The shared primary-count, header and action-bar e2e tests and the Shell's Styleguide samples and baselines change with them, at 390, 834 and 1440 in Dag and Natt.
- Parity: P-50 is reworded in `docs/stub-parity.md` to the header and the mobile menu, which is what AC-18 and AC-35 check here; the bar no longer holds a contact link. The closing band's "Get in touch" moves to P-51, which step 5 closes: the CV page is the first page for Visitors whose band shows it. This feature rewords both items.
- Steps 5 and 7 take their bar actions from D-10; their specs cite it and do not decide it again.
- Notes for the design stage, from the Owner:
  - Closing band contours: CSS scroll-driven animation (`animation-timeline: view()`) under `@supports`, no script.
  - Sticky action bar collapse: native `<details>` and `<summary>`, so it works without scripts; once collapsed, the scroll script does not expand it again during the page visit.
  - CtaBand and MobileBar take their actions as a page option; no page edits the component.
  - Motion control: an IconButton with play and pause icons in the hero; its accessible name says the action ("Pause animation", "Play animation"); `aria-pressed`; visible focus ring; 44 px target.
  - The choice is kept in `sessionStorage`, wrapped in try and catch; with blocked storage it holds for the current page only.
  - When the loops start and when the control is shown: decided at the design stage, see [ADR-0003](./adr/0003-run-ambient-motion-only-under-a-state-attribute-the-page-script-sets.md). It replaces the earlier wording of this note ("the same gate as the theme switch").
  - Selected projects reads from the projects content collection.
- Content source: the copy comes from `design/handoff/site/project/site/data.js` and `Home.jsx`. The Owner supplies during implement, when asked: the Now line's project, and two Recommendations with text, name and role. The Owner confirms every number and status through the Claims list (AC-29).

### 1.1 New or extended

| Item | Status | Note |
|---|---|---|
| Home page (`/`) | extend (rebuild) | replaces the placeholder; uses the Shell through page options, plus the Shell fixes listed in Traceability |
| Hero with portrait, availability badge, Now line and Motion control | new | Motion control is not in the page design (D-01) |
| Key facts panel with count-up | new | Stat exists; the count-up is this feature's own script |
| About with quick facts | new | |
| Experience list (four entries, first open) | new | |
| Recommendations | new | rendered only with real quotes (AC-09, AC-10) |
| Selected projects with project cards | new, Dormant section | Styleguide only until step 7 (AC-11) |
| Contact block: contact list, copy-email action, "Save contact", QR tile | new | reads `src/data/contact.ts` |
| Head meta and structured Person data | new | P-24 |
| Section reveal, hero parallax and contour drift, header over the hero | new | page-own scripts; the static variants shipped in base-components |
| Home content data (facts, intro, quick facts, experience, recommendations) | new | typed data next to `contact.ts`; contact facts stay in `contact.ts` |
| Shape of a project entry (projects content collection) | new | empty; step 7 fills and extends it |
| `/styleguide` | extend | sections for every new component, with marked sample data |
| Build checks: placeholder check; contact check covers structured data and hero coordinates; budget check (B-09) | new, extend | AC-27, AC-28 |
| `src/data/contact.ts`, Toast, BaseLayout, CtaBand | extend | shared files, see Traceability |
| Sticky action bar (Shell) | extend | actions set per page (D-10); collapse tab (D-11); both actions secondary |
| CtaBand (Shell) | extend | actions set per page (D-12); contours follow scrolling (D-13) |
| Header (Shell) | extend | follows the page design over the home hero (AC-33); the "secondary while the bar is on screen" rule is removed (D-14) |
| Not-found page | extend | bar actions per D-10; its e2e and visual baselines are updated |
| `CLAUDE.md` | extend | Design rules: the one-primary rule no longer names the bar as the contact action or the header's secondary style under it; the bar's actions per page; written together with this spec, so later stages read it first |
| `docs/features/base-components/spec.md` | extend | one-line pointers to this spec at D-06, AC-03, AC-07, AC-08, AC-20, AC-23, AC-24 and the §6 "Primary buttons" row |
| `tests/e2e/parity.spec.ts`, `docs/stub-parity.md` | extend | six items turned on |
| `docs/roadmap.md` | extend | step 4 row and zone |

### 1.2 Interim surfaces

Review does not check these against the design (`CLAUDE.md` Review policy).

| Id | Interim surface | Owning step |
|---|---|---|
| IS-01 | "View CV" in the hero and "Full CV" in the experience section lead to the CV address, which answers with the English PDF until the CV pages exist | 5 |
| IS-02 | The legacy `#cv` and `#cv-no` addresses on the home page do nothing yet | 5 |
| IS-03 | In the contact section, in the place of the page design's Message form, one sentence with a mail link to the email address from `src/data/contact.ts`. It is static HTML with no script | 12 |

### 1.3 Confirmed differences from the page design

Decided by the Owner; they go to the PR's design-difference list as they are.

| Id | Page design | This feature | Reason |
|---|---|---|---|
| D-01 | No way to stop the looping motion | one Motion control in the hero pauses and resumes the hero contour drift, the portrait float and the pulse of the availability badge dot (added by the Owner on 2026-10-07; the design has a still ring there); the choice lasts for the browser session on the home page | WCAG 2.2 AA, 2.2.2 Pause, Stop, Hide: motion that starts by itself and runs longer than five seconds needs a pause; Owner decision 2026-10-05 |
| D-02 | The loops run from the first frame | they start only where scripts run and reduced motion is not asked for; otherwise the hero is still and has no Motion control | a Visitor must never get motion they cannot stop |
| D-03 | Contact block "Based in: Nittedal, Norge" | "Oslo, Norge", the Work region | `CLAUDE.md` Content rules; P-21 |
| D-04 | Sections below the hero are invisible until a script reveals them | visible by default; where scripts run and motion is allowed they fade in once | content never depends on a script (AC-32) |
| D-05 | Hero has "See projects"; Selected projects is section 02; Contact is 05 | until step 7: no "See projects", no Selected projects; sections are numbered in the order shown: About 01, Experience 02, Recommendations 03, Contact 04 (Contact 03 without Recommendations) | no Published project and no Projects pages yet; the design itself renumbers Contact when a section is absent |
| D-06 | Now line "[current project] · MSc Computer Science at Woolf University" | the project the Owner supplies; without one, only the MSc part | no bracketed placeholder on a page (AC-28) |
| D-08 | The header over the hero is set by a script | reproduced exactly where scripts run (AC-33); with scripts off the header keeps its default look and a primary "Get in touch" | the state depends on scroll position; contrast holds in both |
| D-09 | "On LinkedIn" and profile links open a new tab | the same tab | base-components D-16 |
| D-10 | Sticky action bar: "View CV" and "Get in touch" on every page | the actions are set per page, all in the secondary style: home and Not-found "View CV" and "Save contact (.vcf)", also after step 7; CV (step 5) the language switch and "Download PDF"; project and case-study pages (step 7) "View CV" and "Next project" or "All projects" | Owner decision 2026-10-05: the header already carries "Get in touch" at 390 |
| D-11 | The Sticky action bar cannot be put away | a small arrow tab collapses it and brings it back; it works with scripts off, and a collapsed bar stays collapsed for the page visit (AC-39). The look of the tab was decided by the Owner on 2026-10-07: the tab is part of the panel (one outline, the same surface, rounded top corners, at the end side); collapsed, about 12 px of the panel stays visible under it. Earlier wording: the look of the tab is decided at the design stage within Fjord | Owner decision 2026-10-05 |
| D-12 | Closing band on the home page: "Get in touch" and "Download CV" | "Save contact (.vcf)" and "Download CV", both secondary; other pages keep the design's pair | the band sits right under the contact section, so it repeats no contact action (AC-34, AC-40) |
| D-13 | The closing band's contours drift in a time loop | they shift with the Visitor's scrolling, on every page with the band, with scripts on or off; still without browser support or with reduced motion | motion that follows scrolling needs no pause control (WCAG 2.2.2), so the band behaves the same on pages without a Motion control (AC-41) |
| D-14 | base-components D-06: below 768 the header "Get in touch" is secondary while the Sticky action bar is on screen | dropped; the header follows the page design: on the Not-found, CV, Projects and Thoughts pages it never changes style and "Get in touch" is always primary, only the bottom border appears after scroll; the home page is AC-33 | Owner decision 2026-10-05, measured on the prototype at 390, 834 and 1440; the bar no longer holds a primary button |
| D-15 | Contact block row label "Based in" | "Region" for the row with "Oslo, Norge" (Owner, 2026-10-07): "Based in" stays for the Residence in the About quick facts and in the footer, so the two do not read as a contradiction | Owner decision 2026-10-07 |
| D-16 | About quick fact "Languages" as one line | one language per line at every width | Owner decision 2026-10-07: one line reads badly |
| D-17 | Experience entry: two columns whenever the list is at least 560 px wide (a container query) | two columns from 768 to 1023 only, one column below 768 and from 1024 | container queries are not allowed by the lint rules (base-components ADR-0004) and the repo breakpoints are 360 / 768 / 1024 / 1440; the design's two columns between 592 and 767 are not reproduced |
| D-18 | "Copy" shows "Kopiert" with a check icon inside the button, also when the copy fails, and renames the button to "Kopiert"; the Toast says "Kopiert" | the button shows "Copied" (English, success colour, no check icon) for the copied duration after a copy that worked and then returns to "Copy"; a refused copy shows no such state; the accessible name stays "Copy" and the Toast is the one announcement: "Copied" with the address and its check icon, in English (AC-14, AC-15); the control keeps the design's width in both states | Owner decisions 2026-10-07: button labels are interface text, not a place for the Norwegian details, and the button and the Toast must not show two languages at once; without the icon the control does not grow; a failed copy must never read as done. "Kopiert" leaves the Norwegian list in `CLAUDE.md`; BRAND.md and the design still show it |
| D-19 | A Testimonial shows the whole quote, drawn two or three sentences long | a quote longer than three lines is closed to three lines with "Show more" / "Show less"; closed cards have the same height; the whole quote stays in the page and is shown whole with scripts off (AC-09) | Owner decision 2026-10-08: the real quotes are five and six paragraphs long and are never shortened, so the cards were too tall |
| D-20 | Testimonials in a two-column grid, every card visible | the same cards and columns; when there are more cards than columns the row becomes a carousel that goes round, with previous and next arrows and swipe; automatic turning exists and is off (AC-42, AC-43) | Owner decision 2026-10-08: more Recommendations may be added, and the section must not grow with each one |
| D-21 | "On LinkedIn" on every Testimonial leads to the LinkedIn profile | it leads to the recommendations on the profile and is shown only on a Recommendation that comes from LinkedIn (AC-09) | Owner decision 2026-10-08: the link should land on the originals, and later Recommendations may be given directly, with nothing on LinkedIn to point at |

Not a difference: the hero coordinates stay 59.91° N, 10.75° E. They belong to the Work region "Oslo, Norge" beside them; the footer keeps the Residence coordinates.

## 2. Goals

- A Recruiter on a phone learns who Alexander is, his role and his Work region from the first screen, and reaches the CV or a contact action without searching.
- Every way to contact Alexander works and tells the truth: the Contact block, the contact card and the QR.
- A Tech lead finds the page as careful as its content: complete without scripts, calm under reduced motion, looping motion that can be stopped, facts that have a confirmed source.
- v2 moves to Release 1: the six parity items of this step pass and the Shell's contact links reach a real place.
- The Shell fits each page: the header follows the page design, and the Sticky action bar and the closing band carry the actions that make sense where they are shown.

## 3. Non-goals

- The CV pages, the language switch and the `#cv` hand-off: step 5. The home page only links to the CV address.
- The Projects pages, case studies, the "Projects" navigation link and turning Selected projects on: step 7. Building them here would put a half-built Projects area into Release 1.
- The command palette and "Search Ctrl K" in the header: step 8.
- Analytics and its security-policy change: step 6. The KPI that needs it is measured from Release 1.
- A Norwegian version of the home page: the content rules keep the main content in English with Norwegian details.
- The Message form of the page design, with its delivery, sender limit and privacy line: roadmap step 12. Until then the contact section shows a mail-link sentence in its place, see IS-03.

## 4. User stories

### US-01: Know who this is at a glance

**As a** Recruiter
**I want** the first screen to tell me the name, the role, the Work region, that he is open to work, and to offer the CV
**So that** I can decide within a minute whether to read on or act

### US-02: Reach him the way I prefer

**As a** Recruiter
**I want** a Contact block with email, phone, profiles, a contact card to save and a QR to scan
**So that** I can contact him or keep his details in the way that suits me

### US-04: Get the background in numbers and a paragraph

**As a** Recruiter
**I want** a few key facts, a short introduction and quick facts on location, focus, stack and languages
**So that** I can match him to a role without opening the CV

### US-05: See where he has worked

**As a** Tech lead
**I want** a compact work history that I can expand entry by entry, with a way to the full CV
**So that** I can judge the experience behind the claims

### US-06: Hear from people who worked with him

**As a** Tech lead
**I want** real Recommendations with the person's name and role
**So that** I have an outside view and can check it on LinkedIn

### US-07: See selected projects when there are some

**As a** Tech lead
**I want** a Selected projects section once projects and their pages exist
**So that** I never follow a card to a page that is not there

### US-08: Recognise the page before opening it

**As a** Recruiter
**I want** a clear title, description and preview image when the link shows up in a search result or a message
**So that** I know whose page it is before I click

### US-09: Motion I can stop

**As a** Visitor
**I want** to pause the looping motion, and to get none of it when my device asks for reduced motion
**So that** I can read without distraction

### US-10: A page that needs no scripts

**As a** Tech lead
**I want** the whole page readable and every contact route usable with scripts off
**So that** I can see the interactive parts were added with care

### US-11: A header that fits the hero

**As a** Visitor
**I want** the header to stay readable over the hero and after it, in both themes
**So that** navigation and the contact action are always clear

### US-12: Facts that stay true

**As the** Owner
**I want** contact facts from one place, no placeholder on a page, and a Claims list I sign
**So that** nothing on the page contradicts the contact card or cannot be backed in an interview

### US-14: Useful actions at my thumb, out of the way when I want

**As a** Recruiter
**I want** the Sticky action bar to offer what fits the page I am on, and to be able to put it away
**So that** the bar helps me act and never covers what I am reading

## 5. Acceptance criteria

### AC-01 (US-01) — happy

**Given** a Recruiter who opens the home page on a phone screen 390 wide and 844 high, the size of the page design, in Dag or Natt
**When** the page has loaded and they have not scrolled
**Then** they see what the page design shows on that first screen, without scrolling: the availability badge "Open to work" with "Oslo area"; the line "Hei." and "Oslo, Norge", both marked as Norwegian, with the Work region coordinates; the name "Alexander Ponomarenko" as the main heading of the page; the roles "Software Engineer" and "Full Stack Developer"; the lead "Good products are built together."; one primary action "View CV"; and the Now line. The header offers "Get in touch", and the Sticky action bar offers "View CV" and "Save contact (.vcf)"

### AC-02 (US-01) — happy

**Given** a Visitor on a screen at least 1024 wide
**When** they look at the hero
**Then** the portrait sits in a round frame beside the text, is announced as an image with Alexander's name, and the page does not shift when it loads; below 1024 the portrait sits under the text

### AC-03 (US-01) — domain invariant

**Given** the Owner has not supplied a current project for the Now line
**When** a Visitor reads the hero
**Then** the Now line shows "Nå:", marked as Norwegian, followed only by "MSc Computer Science at Woolf University"; with a project supplied it shows the project first. No text in square brackets appears in either case

### AC-04 (US-01) — cross-context

**Given** the Projects pages do not exist yet
**When** a Visitor looks for a way to projects in the hero
**Then** "See projects" is not offered and "View CV" stands alone; the step that builds the Projects pages turns the button on together with the Selected projects section

### AC-05 (US-04) — happy

**Given** a Visitor below the hero
**When** they read the key facts panel
**Then** they see four facts, each with a value, a label and a line of context, overlapping the lower edge of the hero as in the page design; each value is in the page as its final number, also for assistive technology

### AC-06 (US-04) — happy

**Given** a Visitor whose browser runs scripts and whose device does not ask for reduced motion
**When** the key facts panel first comes into view
**Then** each value counts up once to its final number and stops; nothing around it moves while it counts, and assistive technology is given the final number only. With scripts off or reduced motion the final numbers are simply shown

### AC-07 (US-04) — happy

**Given** a Visitor in the About section
**When** they read it
**Then** they see the heading "Frontend-focused, full stack.", the introduction paragraph and four quick facts: "Based in" with the Residence and the Work region as "Nittedal, Oslo area" and the Norwegian work permit; "Focus"; "Stack" as plain text with no logos, bars or percentages; and "Languages" with the plain labels English upper-intermediate, Norwegian intermediate, Ukrainian native, with no level codes

### AC-08 (US-05) — happy

**Given** a Tech lead in the experience section
**When** they open or close an entry with a pointer or the keyboard
**Then** that entry shows or hides its summary, points and technology tags, and its state is announced; on arrival the first entry is open and the other three are closed; each entry always shows the role, the organisation and the period; a "Full CV" link leads to the CV. With scripts off every entry can still be opened

### AC-09 (US-06) — happy

**Given** at least one Recommendation is in the content
**When** a Tech lead reaches the recommendations section
**Then** each Recommendation holds the quote word for word, the person's name and role, and, when the Recommendation comes from LinkedIn, an "On LinkedIn" link to the recommendations on Alexander's profile (a Recommendation given to Alexander directly has no link); the section is headed "From people I've worked with" and the Contact section after it carries the next number. A quote longer than three lines shows its first three lines with a "Show more" text button, which opens the whole quote in place and becomes "Show less"; cards with a closed quote have the same height. With scripts off every quote is shown whole (D-19)

### AC-10 (US-06) — domain invariant

**Given** there is no Recommendation in the content, or the person behind a quote has not agreed to it being shown
**When** the page is built
**Then** a quote without that agreement is omitted and never edited, the section is left out entirely when no Recommendation remains, and the remaining sections are numbered without a gap. A Recommendation is the person's own words with their agreement, which the Owner confirms in the Claims list

### AC-11 (US-07) — cross-context

**Given** the Projects pages do not exist yet, whether or not a Published project exists
**When** a Visitor reads the home page
**Then** there is no Selected projects section, no "All projects" link and no gap in the section numbers. The section appears only when the Projects pages exist and at least one Published project exists; the step that builds the pages owns that switch

### AC-12 (US-07) — happy

**Given** the Owner opens the Styleguide
**When** they look at the Selected projects sample
**Then** they see the section as the page design draws it, with up to three featured projects, the first one large: each card has a status, a year, a title, a summary, one result with its label, technology tags and links to the live project and its code where they exist. The sample data is marked as sample on the page

### AC-13 (US-02) — happy

**Given** a Recruiter in the contact section
**When** they read the Contact block
**Then** they see the heading "Get in touch" with the lead "Email is fastest. Phone and LinkedIn work too.", and rows for the email address as a mail link, the phone number as a call link, the LinkedIn and GitHub profiles as links showing their short addresses, and "Region" with "Oslo, Norge" marked as Norwegian (D-15)

### AC-14 (US-02) — happy

**Given** a Recruiter whose browser runs scripts
**When** they activate "Copy" beside the email address
**Then** the address is on their clipboard and a Toast with a check mark confirms "Copied" together with the address, in English; the confirmation is announced to assistive technology and leaves by itself; the "Copy" control itself shows "Copied" for a moment and returns to "Copy", without changing its size or its name (D-18)

### AC-15 (US-02) — error

**Given** a Visitor whose browser refuses clipboard access, or runs no scripts
**When** they try to copy the email address
**Then** no confirmation is shown for a copy that did not happen: where copying is refused they are told to copy the address by hand, and with scripts off the "Copy" action is not offered at all. The address stays a mail link that can be selected

### AC-16 (US-02) — happy

**Given** a Recruiter in the Contact block
**When** they activate "Save contact (.vcf)"
**Then** the browser downloads the contact card, with the name, the title "Software Engineer", the phone, the email, the profiles and the Work region

### AC-17 (US-02) — happy

**Given** a Recruiter on a screen at least 1024 wide
**When** they look below the Contact block
**Then** they see the QR tile with the caption "Skann meg", marked as Norwegian, and the hint that pointing a phone camera at it opens the contact card; the tile matches the theme, has a text alternative, and scanning it offers the contact. Below 1024 the tile and the hint are not shown, because the Visitor is holding the phone

### AC-18 (US-02) — cross-context

**Given** a Visitor on any page of the site
**When** they activate "Contact" or "Get in touch" in the header or the mobile menu
**Then** they arrive at the contact section of the home page with its heading in view below the header, the mobile menu closed, and keyboard focus placed at that section

### AC-26 (US-08) — happy

**Given** a Recruiter who meets the home page in a search result or as a shared link
**When** the search engine or the app reads the page
**Then** it finds a title with the name and role, a description, the site's canonical address, a large preview card with the site's preview image and its size, and structured data describing a person: name, job title, email, phone, an address in Oslo, Norway, and the LinkedIn and GitHub profiles

### AC-27 (US-12) — domain invariant

**Given** the Owner changes a contact fact
**When** the checks run
**Then** the Contact block, the mail-link sentence of IS-03, the structured data, the footer, the menu and the hero take the fact from the one contact source, and the checks fail, naming the field, if the contact card disagrees with it, if the email address in the mail-link sentence of IS-03 differs from the one in the contact source, or if the coordinates shown in the hero differ from the Work region coordinates in the contact source. Contact facts live in one place

### AC-28 (US-12) — error

**Given** a page for Visitors whose built content holds text in square brackets that stands for a missing value
**When** the checks run
**Then** they fail and show the Owner the page and the text; the Styleguide's marked sample data is the only exception

### AC-29 (US-12) — happy

**Given** the feature is ready for review
**When** the Owner opens the pull request
**Then** it holds a Claims list: every number and status on the page (the four key facts, the attendee figure, the availability badge, the marker on the most recent role, each period, the language levels, the Now line, each Recommendation with the person's agreement) with its source, and the Owner has ticked each one. The feature is not done while one is open

### AC-30 (US-09) — happy

**Given** a Visitor whose browser runs scripts and whose device does not ask for reduced motion
**When** they activate the Motion control in the hero
**Then** the hero contour drift, the portrait float and the pulse of the badge dot all stop where they are, and the control now offers to play; activating it again resumes them. Its name says the action it will take, its state is exposed to assistive technology, it is reachable by keyboard with a visible focus ring, and the choice holds for the rest of the browser session on the home page, also after leaving and coming back, and is gone on a new visit; where the browser does not allow the site to keep it, the choice holds for the current page view

### AC-31 (US-09) — happy

**Given** a Visitor whose device asks for reduced motion
**When** they open and scroll the home page
**Then** no Ambient motion ever starts and no Motion control is shown; the key facts show final numbers; sections do not slide or count; the contours of the hero do not move with the pointer (with motion allowed they move against it, as in the design) and the contours of the closing band do not follow scrolling; a change of state is instant or at most a fade

### AC-32 (US-10) — authorization

**Given** a Tech lead who opens the home page with scripts off, or a page in which an inline script, an inline style or a script the site's security policy does not name has appeared
**When** the page is shown
**Then** every section is visible and readable, every link of the Contact block works, "Save contact" works, no Ambient motion runs and no Motion control or "Copy" action is offered; and the browser refuses the script or style that the policy does not name. This feature does not change the policy

### AC-33 (US-11) — happy

**Given** a Visitor on the home page whose browser runs scripts, at 390, 834 or 1440 wide
**When** they scroll past the hero and back
**Then** the header follows the page design, and switches exactly when the hero leaves the area under the header:
- In Dag, while the hero is under the header, the header is on spruce without a border, with a light wordmark and light links; "Get in touch" is primary on spruce at 390 and secondary on spruce at 834 and 1440. When the hero leaves, the header takes its default look and its border together, and "Get in touch" is primary.
- In Natt the colours of the header never change, and its border appears as soon as the page is scrolled from the top, as on every other page; "Get in touch" is secondary over the hero and primary after it at 834 and 1440, and primary throughout at 390.

In every one of these states the header's text and actions are readable at the contrast the site requires, also after returning to the page with the back button at a scrolled position. With scripts off the header keeps its default look and a primary "Get in touch" throughout

### AC-34 (US-11) — domain invariant

**Given** any page for Visitors, which is every page except the Styleguide, at 390, 834 or 1440 wide, at any scroll position
**When** the checks count the primary buttons on the visible screen
**Then** there are never more than two, and never more than one from the page content; the other one is the header's "Get in touch", the Shell's single primary action. On the home page the hero's "View CV" is the only primary button of the page content; the Sticky action bar holds no primary button on any page, and the closing band holds none on the home page. One primary action per screen is a brand rule

### AC-35 (US-12) — happy

**Given** the feature is complete
**When** the parity suite runs
**Then** the six items of this step pass as real tests: name and roles shown, contact data visible and linked, copy-email with "Copied" (D-18), "Save contact", head meta with structured data, and the Shell's contact links reaching the contact place

### AC-36 (US-10) — happy

**Given** a Visitor whose browser runs scripts and whose device does not ask for reduced motion
**When** a section below the hero first comes into view
**Then** it fades in once and stays; a section already in view when the page opens, or reached through a link to it, is shown at once

### AC-38 (US-14) — happy

**Given** a Recruiter on a phone, on the home page or on the Not-found page
**When** they look at the Sticky action bar
**Then** it offers "View CV" and "Save contact (.vcf)", both in the secondary style; "Save contact" downloads the contact card. Each page sets the actions of its bar through a page option, and no page edits the bar itself

### AC-39 (US-14) — happy

**Given** a Visitor on a phone, on any page with the Sticky action bar, with scripts on or off
**When** they activate the small arrow tab of the bar
**Then** the bar collapses and only the tab remains, with a narrow strip of the panel under it that shows something is tucked away; the tab is a target of at least 44 px that never covers the last lines of the page or the element that has keyboard focus; activating the tab again brings the bar back. The state is announced to assistive technology and the tab is reachable by keyboard. With motion allowed the panel and its tab slide away and back; with reduced motion the change is instant. Once the Visitor has collapsed the bar, scrolling does not bring it back for the rest of that page visit

### AC-40 (US-02) — happy

**Given** a Recruiter at the end of the home page
**When** they read the closing band, which sits right under the contact section
**Then** it offers "Save contact (.vcf)" and "Download CV", both in the secondary style, and no "Get in touch", because the contact section is already above it; on other pages the band keeps "Get in touch" and "Download CV". Each page sets the band's actions through a page option

### AC-42 (US-06) — happy

**Given** more Recommendations in the content than the section shows side by side (one below 768, two from 768)
**When** a Visitor uses the previous and next arrows, swipes on a touch screen, or scrolls the row with the keyboard
**Then** the cards move one at a time in a row that goes round: after the last card comes the first, and before the first the last. The arrows are named buttons and the position is announced as "Recommendation N of M". With no more Recommendations than fit side by side there are no arrows and the cards stand as the page design draws them. With scripts off the row can still be scrolled and every card is reachable (D-20)

### AC-43 (US-06, US-10) — happy

**Given** automatic turning of the Recommendations is switched on in the content (it is off by default)
**When** the row goes round and the Visitor does not ask for reduced motion
**Then** the row moves to the next card at a steady interval; it stops while the pointer is over the row, while focus is inside it, while a quote is open and while the page is hidden, and it follows the hero's Motion control. With reduced motion, or with automatic turning off, the row moves only when the Visitor moves it

### AC-41 (US-09) — happy

**Given** a Visitor on any page that shows the closing band, with scripts on or off
**When** they scroll the band into and through view, in a browser that supports motion tied to scrolling and on a device that does not ask for reduced motion
**Then** the band's contours shift with their scrolling and stand still when they stop; nothing in the band moves by itself. Without that browser support, or with reduced motion, the band is still

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Lighthouse categories, mobile | Performance, Accessibility, Best Practices, SEO each ≥ 95 on the home page | Lighthouse CI (mobile) on the built site |
| LCP / CLS / TBT, mobile | ≤ 2.0 s / ≤ 0.02 / ≤ 100 ms on the home page, with the count-up, reveal and portrait included | Lighthouse CI (mobile) |
| Initial JS on the home page | ≤ 50 KB gzip in total; the home page's own scripts together ≤ 10 KB gzip, measured apart from the Shell scripts (B-09) | build output size check in CI |
| Portrait | ≤ 40 KB at the largest size served; width and height reserved | build output size check in CI; CLS above |
| First screen on a phone | at 390 × 844, the size of the page design, everything AC-01 lists lies fully inside the first screen | e2e box measurement (AC-01) |
| Accessibility | 0 axe violations on the home page in Dag and Natt, with scripts on and off, and with an experience entry open | axe in Playwright |
| Touch targets | every interactive element of the page content ≥ 44 × 44 px at 390, counting its overlay | e2e box measurement |
| Ambient motion | 0 loops running when paused, with reduced motion, or with scripts off; pausing takes effect within 100 ms; 0 animations in the closing band that advance without scrolling | e2e check of running animations |
| Primary buttons | on every page except the Styleguide: visible screen ≤ 2, of which page content ≤ 1, at 390 / 834 / 1440; on the home page counted at the top, over the contact section and at the end; Sticky action bar 0 on every page, closing band 0 on the home page | e2e count (AC-34) |
| Header states | the 3 widths × 2 themes × 3 positions (top of the page, scrolled over the hero, after it) of AC-33 each match the page design, border included | e2e computed styles and visual tests |
| Sticky action bar, collapsed | the tab is ≥ 44 × 44 px; at 390, at the end of the page and with focus on the last footer link, it overlaps 0 px of the last line and of the focused element | e2e box measurement (AC-39) |
| Contrast | every text and background pair the new components render, in Dag, Natt and on spruce, including the header over the hero: body ≥ 4.5:1; large text, control boundaries and the focus ring ≥ 3:1 | contrast check script in CI |
| Visual regression | ≤ 0.1 % differing pixels per screenshot; home page per section at 390 / 834 / 1440 in Dag and Natt with motion off; new and changed Styleguide sections; the Not-found page re-baselined for its bar | Playwright visual tests in CI |
| Design match | 0 differences between the home page and `design/screenshots/{dag,natt}_home.png` (and the standalone design at 390 and 834) other than those listed in §1.2 and §1.3; the Dormant section is D-05; the header is compared in the states of AC-33 | manual review in the PR, screenshots side by side |
| Token-only styles | 0 findings over all page and component styles | Stylelint in CI |
| Placeholders | 0 bracketed placeholders on pages for Visitors | build check (AC-28) |

## 6.1 Security / privacy

- **Data classification:** public for everything the page shows. The page takes no input from Visitors.
- **Personal data touched:** third parties: the name, role and words of each person who gave a Recommendation, shown with their agreement. The Owner's own contact facts, as before. The Motion control keeps one "paused" value in the Visitor's browser for the session, never sent anywhere. No cookie is set.
- **AuthZ/AuthN impact:** none. No accounts or sign-in, and the site still receives no data from a Visitor. The security policy is not changed (AC-32).
- **Abuse cases:**
  - A Recommendation that the person did not agree to: omitted, not edited (AC-10).
  - A script or style the security policy does not name appearing in the page: refused by the browser (AC-32).
- **Security review:** N/A: the policy contract is unchanged and the page takes no input.

## 7. Metrics / KPIs

- **Open stub-parity items (`test.fixme` in the parity suite)** — baseline: 12, target: 6 when this feature merges into `v2` (P-20 to P-24 and P-50 turned on).
- **Differences from the page design not listed in §1.2 or §1.3** — baseline: the whole page (placeholder), target: 0 at the design-match review.
- **Claims list items confirmed by the Owner** — baseline: 0, target: all of them before merge.
- **Home visits that continue to the CV or to contact** — baseline: TBD; measured over the first 30 days after Release 1; the target is set from that baseline. As far as is known, the cookieless analytics that step 6 turns on counts page views, not link clicks. So the measurable part is visits that continue from the home page to the CV pages; mail, phone, contact card and QR actions may stay unmeasured. Step 6 confirms what it can count before the target is set.
- **Review rounds** — baseline: 2 (base-components), target: ≤ 2.

## 8. Open questions

None. The mechanism choices left open on purpose (the header mechanism over the hero, the look of the collapse tab of the bar) belong to the design stage and are bounded by AC-33 and AC-39.
