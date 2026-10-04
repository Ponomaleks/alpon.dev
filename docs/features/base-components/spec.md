---
status: Draft
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-04"
feature_size: "S"
---

# Spec — base-components

> **Glossary:** [CONTEXT](../../../CONTEXT.md) (repo root; this feature has no feature-level CONTEXT)
> **Reference module / docs / channels used:** `CLAUDE.md`; `docs/roadmap.md` step 3 and lane rules; `docs/stub-parity.md` P-25, P-41; `docs/backlog.md` B-01; `docs/design-system.md`; `docs/features/fjord-foundation/spec.md` §5 AC-07, AC-08, AC-14 and §8 OQ-02; fjord-foundation ADR-0002 and ADR-0003; `design/brand/BRAND.md` (read in full); the file list of `src/components/` and `src/layouts/` after fjord-foundation; the `test.fixme` list in `tests/e2e/parity.spec.ts`; page designs `design/handoff/site/project/site/App.jsx` (shell), `Misc.jsx` (not-found screen), `data.js`; the site copy of the design system `design/handoff/site/project/_ds/` (Header, MobileMenu, StickyActionBar, ThemeToggle, Footer, NotFound); screenshots `design/screenshots/{dag,natt}_not_found_{390,834,1440}.png`.

## 1. Context

After fjord-foundation, v2 has tokens, fonts, the Dag/Natt theme and one shared layout, but no Shell and no components. A Recruiter who opens any v2 page on a phone finds no header, no way to the CV or to contact, no theme switch and no footer. Home (step 4) and CV (step 5) cannot start, because both need the same buttons, links, tags, header and footer, and they are built in parallel. The Not-found page that fjord-foundation shipped is an interim page built from a component demo; it differs from the page design in the fifteen ways listed in fjord-foundation spec §8 OQ-02.

Why now: this is wave 2 of the roadmap and the only step in it. Steps 4 and 5 run in parallel worktrees, and the lane rule says shared files belong to the Shell steps. Everything two pages share has to exist before they start, or the two worktrees will both edit it. This step also owns stub-parity item P-25 (the skip link) and the rewording of P-41.

Committed approach: build the whole Shell and the base components once, from the page designs, and prove them on two surfaces. The Styleguide shows every component in every state in Dag and Natt and becomes the surface for visual and accessibility checks. The Not-found page is rebuilt to its page design and is the first real page inside the Shell. Platform features come first: a behaviour gets a script only when the platform cannot do it, and every scripted behaviour has a working state with scripts off and with reduced motion. Later pages compose the Shell through options and do not edit it. The research pass found no reference that combines a script-light phone shell, a persisted accessible theme switch and a branded not-found page checked on one gallery page, so there is no outside pattern to copy; the sharpest failure mode it found is a phone menu that either is not reachable with scripts off or stays open after a same-page link, and AC-05 and AC-06 pin both.

Traceability:
- Parity: P-25 flips from `fixme` to `test` here. P-41 stays active and its wording changes to the page design (AC-17). Two items are added to `docs/stub-parity.md` under "Not in the stub", each with its own `test.fixme`: P-50, the Shell's contact links reach the contact place (owner: step 4), and P-51, the Shell's CV links reach the CV page (owner: step 5). The 5x range is new and belongs to the Shell, following the file's one-range-per-area numbering (AC-31).
- This spec's AC-17 and AC-18 replace fjord-foundation AC-07 and AC-08. When this feature is implemented, those two get a one-line "superseded by base-components AC-17 / AC-18" pointer and keep no wording of their own. fjord-foundation §8 OQ-02 closes when base-components AC-17 and base-components AC-07 (the Sticky action bar, OQ-02 item 7) pass and the Design match row of §6 is at 0; backlog B-01 is done with it. fjord-foundation §3 promised animated theme and page transitions for step 3; that line gets a pointer to AC-29 and AC-32.
- The token-only style check is enforced as recorded in ADR-0004, which supersedes fjord-foundation ADR-0003 (AC-26).
- The page design uses tokens that the generated token file does not have yet (for example the fifth space step, the not-found top space, the layer order tokens). They are added through the token generator, never by hand (AC-26).
- If the task breakdown goes above about 25 tasks, `tasks` proposes a split before writing tasks: 3a components, contact data and Styleguide; 3b the Not-found rebuild and its baselines. In a split, the part that first shows the Shell on the Not-found page also owns that page's e2e and visual baseline changes, so neither part merges red.
- Decision: BRAND.md says the call to action is Norwegian; the page design says "Get in touch". The Owner confirmed English for the Shell's call to action; this feature records it in `CLAUDE.md` (Content rules).
- Decision: "one primary CTA per screen" counts buttons in page content; the Shell's persistent contact action is one action and is not counted separately. This feature records it in `CLAUDE.md` (Design rules); AC-23 checks it.
- Decision: the footer shows the Residence; this feature adds the footer to the places where Nittedal appears in `CLAUDE.md` (Content rules). The contact card keeps the Work region and does not change, and neither do the QR files.
- Decision override: the BackToTop note in §3 names a mechanism for step 5 — rationale: the Owner asked for it to be recorded here so that the step 5 spec starts from it.
- Notes for the design stage, from the Owner:
  - Mobile menu: a dialog is fine. AC-06 is met by the Sticky action bar, which is always on screen with scripts off and carries both the CV and the contact action.
  - Header call to action below 768: no extra script. The Sticky action bar's script already sets the bar's state; the header style follows it with one CSS rule (`:has()`).
  - Token-only check: `color-mix()` takes only Fjord token arguments (`var()`), never a literal colour. The allow-list method this note first described is replaced by ADR-0004 (Owner decision, 2026-10-04).
- Change log, 2026-10-04 (ux-flows stage, decided by the Owner): AC-24 gained the rule for leaving out the Sticky action bar; AC-21 and the `/styleguide` row of §1.1 now say which Shell parts the Styleguide uses for real and which it shows as samples; D-12 says that the menu button is not shown with scripts off if the menu mechanism needs a script. Nothing else changed.
- Change log, 2026-10-04 (design stage, decided by the Owner): §1.3 gained D-13, the header's scroll border appears only where scripts run. Nothing else changed.
- Change log, 2026-10-04 (implement stage, decided by the Owner): AC-26 now states the targeted token rules of ADR-0004 instead of allow lists; the §6 Contrast row gates text, control boundaries and the focus ring, and only reports decorative `aria-hidden` lines; the arrow and icon nudges of the page design stay where motion is allowed (`screens.md` interactive states, AC-28 for reduced motion); text widths may use math on a measure token. Nothing else changed.
- Change log, 2026-10-04 (design match, decided by the Owner): the header is 64 high below 768 with a 17 px wordmark and a 36 px "Get in touch"; the theme switch is 38 high; these keep a 44 px target through an overlay (D-08). Footer text links are as high as their line, so AC-25 and the §6 Touch targets row name that exception. The page keeps one bottom reserve for the Sticky action bar (the footer's), not two. Nothing else changed.
- The e2e suite runs with reduced motion emulated, so page and theme transitions never make it unstable; AC-29 and AC-32 have their own tests with motion allowed.

### 1.1 New or extended

Nothing that fjord-foundation built is specified again. `src/components/` is empty today.

| Item | Status | Note |
|---|---|---|
| Button, Link, IconButton, Icon | new | `home-link` on the Not-found page is promoted to Button |
| Badge (availability, status), Tag, Stat, SectionHeader with Eyebrow | new | Stat shows the final number, no count-up |
| Toast and its live region | new | no copy action uses it yet; the Styleguide triggers it |
| Contours, Terrain map panel, Wordmark | new | `ridge-contours` on the Not-found page is promoted to Contours |
| SkipLink, Header, MobileMenu, ThemeToggle, CtaBand, Footer, MobileBar (Sticky action bar) | new | the Shell |
| `src/data/contact.ts` | new | contact facts, Work region, Residence, "Sist oppdatert" date |
| `/styleguide` | new | noindex, not linked, not in the sitemap; uses the real header and footer, and leaves out the real Sticky action bar and the closing call-to-action band, which it shows as samples |
| BaseLayout | extend | renders the Shell and takes the page options of AC-24 |
| Not-found page | extend (rebuild) | per the page design; closes OQ-02 |
| Home placeholder | unchanged | gets the Shell from the layout; content is step 4 |
| Token generator source, Stylelint token-only rules (ADR-0004) | extend | AC-26 |
| `tests/e2e/parity.spec.ts`, `docs/stub-parity.md` | extend | P-25 on, P-41 reworded, P-50 and P-51 added as `fixme` |
| `CLAUDE.md` | extend | three rule clarifications from §1 Traceability, written together with this spec |
| `docs/features/fjord-foundation/spec.md` | extend | pointers only: AC-07, AC-08, §3 transitions, §8 OQ-02 closed |

### 1.2 Interim surfaces

Review does not check these against the design (`CLAUDE.md` Review policy).

| Id | Interim surface | Owning step |
|---|---|---|
| IS-01 | "Contact" and "Get in touch" lead to the contact place on the home page, which the placeholder does not have yet; the Visitor lands on the placeholder | 4 |
| IS-02 | "CV" and "View CV" lead to the CV address, which today answers with the English PDF | 5 |
| IS-03 | The home page content is still the placeholder, now inside the Shell | 4 |
| IS-04 | The current-page marker and the on-spruce header appear only on the Styleguide | 4, 5 |
| IS-05 | Badge, Tag, Stat, SectionHeader, Link and Toast appear only on the Styleguide | 4, 5 |

### 1.3 Confirmed differences from the page design

Decided by the Owner; they go to the PR's design-difference list as they are.

| Id | Page design | This feature | Reason |
|---|---|---|---|
| D-01 | Header has "Search Ctrl K" | hidden | the command palette is step 8 |
| D-02 | Header and menu have "Projects" | hidden | no Published project yet (step 7) |
| D-03 | Not-found page offers "See projects" | hidden | same |
| D-04 | Not-found body ends "Nothing lives at" plus the address | omitted | the address is never shown back |
| D-05 | Footer coordinates 59.91° N, 10.75° E | 60.07° N, 10.87° E | the footer shows the Residence; value checked against Wikipedia "Nittedal" on 2026-10-03 (60.07306° N, 10.87222° E), rounded to two decimals |
| D-06 | Header "Get in touch" is filled at 390 | below 768, outlined (secondary) only while the Sticky action bar is on screen, and filled (primary) once the bar has scrolled away; with scripts off or reduced motion the bar never leaves, so the header action stays outlined. A page can also ask for the secondary style at any width (AC-24) | one primary rule, AC-23 |
| D-07 | Menu panel shows the single design location | shows the Work region "Oslo, Norge" | the menu contacts are Recruiter-facing |
| D-08 | Theme switch segments and header links are lower than 44 px | same look, 44 px touch target | `CLAUDE.md` quality bar |
| D-09 | Theme switch always shown | not offered with scripts off | it could not work |
| D-10 | "Sist oppdatert 2026-09-30", year from the clock | date from the contact data, year set at build | real values, no script |
| D-11 | Sticky action bar slides away on scroll down | same with scripts on; stays in place with scripts off or reduced motion | AC-09 |
| D-12 | Mobile menu is a modal dialog driven by script | mechanism chosen at the design stage, platform features first; a dialog is acceptable. If the mechanism needs a script, the menu button is not shown with scripts off, for the same reason as D-09 | Owner decision; AC-04 to AC-06 are the contract |
| D-13 | Header gains its bottom border on scroll, driven by script in the prototype | same with scripts on; with scripts off the header has no scroll border | one mechanism in every browser (design ADR-0003); the border is a visual cue and navigation does not depend on it. AC-03 is read with this row |

Not a difference: the coordinates printed on the Not-found map stay "59.91° N · 10.75° E". They are decoration, hidden from assistive technology, and are not a location fact; the single-source rule for contact data does not cover them.

## 2. Goals

- Any v2 page gives a Visitor the same Shell: a way to the CV and to contact and the footer facts, on a phone as well as on a wide screen, with scripts on or off; and a theme switch wherever scripts run.
- Home and CV can be built in parallel from ready components and Shell options, without either step editing a shared file.
- The Not-found page matches its page design, and every component has a checked reference on the Styleguide in both themes.
- v2 moves closer to Release 1: P-25 is met and P-41 follows the page design.

## 3. Non-goals

- Home content, contact block, copy-email action, QR tile, head meta and JSON-LD: step 4. Here the home page stays the placeholder.
- CV pages, language switch and the BackToTop control: step 5. BackToTop is assigned to step 5 only, so the two parallel worktrees do not both add it. Note for step 5: build it without script, as a link to the top of the page, with its appearance after scroll done by a scroll-driven animation under a support check; without support it is always visible.
- Stat count-up, Contours drift and parallax, and the header turning spruce over the home hero: step 4. Step 4 adds its own script and does not rewrite the shared components; the static variants it needs ship here (AC-24).
- The command palette and its header trigger: step 8.
- The "Projects" link, "See projects" and anything that leads to a projects section: step 7, once a Published project exists.
- Prose, CodeBlock and Callout: step 7. The contact form: not planned; it needs its own ADR.
- A performance budget for the Styleguide: it is not a Visitor page. It is covered by the visual and accessibility checks only.

## 4. User stories

### US-01: Find the way from the header

**As a** Recruiter
**I want** the same header on every page, with links to the CV and to contact and one clear contact action
**So that** I can reach what I came for from wherever I landed

### US-02: Navigate on a phone

**As a** Recruiter
**I want** a menu on my phone that opens from the header and closes without trapping me
**So that** I get the same navigation, contact facts and theme switch as on a wide screen

### US-03: Keep the two main actions at hand

**As a** Recruiter
**I want** "View CV" and "Get in touch" within thumb reach on my phone
**So that** I can act without scrolling back to the top

### US-04: Switch the theme

**As a** Visitor
**I want** to switch between the light and the dark theme and have the site remember it
**So that** I read comfortably on every page and every visit

### US-05: Skip to the content

**As a** Visitor using a keyboard or a screen reader
**I want** a skip link as the first stop on every page
**So that** I do not walk through the header each time

### US-06: See who and where

**As a** Visitor
**I want** a footer with the contact facts, the profiles elsewhere, where Alexander is based and when the site was last updated
**So that** I can check the basics on any page

### US-07: Recover from a dead link

**As a** Visitor following an outdated or mistyped link
**I want** the Fjord not-found page from the page design, inside the Shell
**So that** I see where I am and have a clear way back

### US-08: Be invited to get in touch

**As a** Recruiter
**I want** a closing call-to-action band with "Get in touch" and "Download CV" at the end of a page
**So that** the next step is obvious when I finish reading

### US-09: A reference for every component

**As the** Owner
**I want** a Styleguide that shows every component in every state in Dag and Natt
**So that** a visual or accessibility regression is caught by a check and not by a Visitor

### US-10: Build pages without touching the Shell

**As the** Owner
**I want** components and Shell options that Home and CV can use as they are
**So that** steps 4 and 5 run in parallel without editing shared files

### US-11: Contact facts in one place

**As the** Owner
**I want** every contact fact, both locations and the last-updated date to live in one place
**So that** the footer, the menu and the contact card can never disagree

### US-12: Guardrails stay strict

**As the** Owner
**I want** the token-only rule to stay enforced while the components bring new layout and motion needs
**So that** the Shell does not become the place where raw values come back

### US-13: A Shell that needs no trust

**As a** Tech lead
**I want** the Shell to work with scripts off and to run only scripts the site's security policy allows
**So that** I can see the interactive parts were added with care

### US-14: Calm for reduced motion

**As a** Visitor who prefers reduced motion
**I want** the Shell to change state without moving
**So that** the menu, the bar and the theme switch are comfortable to use

## 5. Acceptance criteria

### AC-01 (US-01) — happy

**Given** a Recruiter on a screen at least 768 wide
**When** they open any page of the site
**Then** the header shows the site wordmark leading to the home page, the links "CV" and "Contact", the theme switch and one "Get in touch" action with an arrow; the link of the page they are on is marked as current, visibly and for assistive technology

### AC-02 (US-01) — cross-context

**Given** the site has no Published project and no command palette yet
**When** a Visitor sees the header or the mobile menu
**Then** neither shows a "Projects" link or a search trigger, because the site never offers a way into something that does not exist yet

### AC-03 (US-01) — happy

**Given** a Visitor on any page
**When** they scroll the page down from its top
**Then** the header stays at the top of the screen and gains a bottom border, and loses it again at the top of the page; this also happens for a Visitor who prefers reduced motion, because it is a change of state and not movement

### AC-04 (US-02) — happy

**Given** a Recruiter on a screen narrower than 768
**When** they activate the menu button in the header
**Then** a menu panel opens with the navigation links, the email and phone as links, the Work region, the theme switch and "Get in touch"; keyboard focus moves into the panel, and the panel is readable in Dag and in Natt

### AC-05 (US-02) — happy

**Given** the menu panel is open
**When** the Visitor presses Escape, activates the close button, or follows any link in the panel, including a link to a place on the page they are already on
**Then** the panel closes; after Escape or the close button, focus returns to the menu button

### AC-06 (US-02) — error

**Given** a Recruiter on a phone whose browser has scripts turned off
**When** they open any page of the site
**Then** they can still reach the CV and the contact action from the Shell; navigation never depends on a script having run

### AC-07 (US-03) — happy

**Given** a Recruiter on a screen narrower than 768, on a page that has not left the bar out
**When** the page is shown
**Then** a Sticky action bar at the bottom of the screen offers "View CV" and "Get in touch"; it never covers the last lines of the page or the element that has keyboard focus, and it is not shown at 768 and wider

### AC-08 (US-03) — happy

**Given** the Sticky action bar is shown and scripts are running
**When** the Recruiter scrolls down, and later scrolls up
**Then** the bar leaves the screen on the way down and returns on the way up; while it is off screen its two actions cannot receive keyboard focus and are not announced

### AC-09 (US-03) — error

**Given** a Visitor on a phone with scripts turned off, or who prefers reduced motion
**When** they scroll the page
**Then** the Sticky action bar stays in place and never moves

### AC-10 (US-04) — happy

**Given** a Visitor on a page shown in Dag
**When** they choose "Dark" in the theme switch
**Then** the page becomes Natt at once, the switch shows "Dark" as selected, the choice is kept as their Theme choice, and the next page they open is Natt from its first frame; choosing "Light" does the reverse, and the switch in the header and the one in the menu always agree

### AC-11 (US-04) — error

**Given** a Visitor whose browser blocks site storage
**When** they choose a theme
**Then** the page still changes theme for this visit and shows no error; and for a Visitor with scripts turned off the theme switch is not offered at all, while the page follows the device preference

### AC-12 (US-04) — happy

**Given** a Visitor opens a page with any stored Theme choice or none
**When** the theme switch becomes visible
**Then** it never shows a selection that differs from the theme the page is in

### AC-13 (US-05) — happy

**Given** a Visitor who has just opened any page
**When** they press Tab once
**Then** a visible "Skip to content" link has focus, as the first focusable element of the page, and activating it moves focus to the main content

### AC-14 (US-06) — happy

**Given** a Visitor at the end of any page
**When** they read the footer
**Then** they see the line "Good products are built together.", the email and phone as links, the LinkedIn and GitHub profiles as links, "Based in" with the Residence "Nittedal, Norge" marked as Norwegian and the coordinates 60.07° N, 10.87° E, the copyright line with the current year and the name, and "Sist oppdatert" with the last-updated date, marked as Norwegian

### AC-15 (US-11) — domain invariant

**Given** the Owner changes a contact fact in the one place where contact facts live
**When** the site is built and the checks run
**Then** the footer and the menu show the new value with no other edit, and the checks fail, naming the field, if the downloadable contact card disagrees with it, because contact facts live in one place

### AC-16 (US-11) — error

**Given** the Owner sets a last-updated date that is not a real calendar date or lies in the future
**When** the checks run
**Then** they fail and show the Owner the value and the rule it breaks

### AC-17 (US-07) — happy

**Given** a Visitor opens an address the site does not have
**When** the page loads
**Then** the browser receives a not-found response together with the Fjord Not-found page inside the Shell: a code line with the not-found code, a slash and "Ikke funnet" marked as Norwegian; the heading "This page is off the map."; the body "The link may be old, or the page has moved."; one primary "Back to home" action with an arrow that leads to the home page; and the map panel with grid, contours, a dashed route and the "You are here" pin. From 1024 the text and the map sit in two columns; below 1024 the map sits under the text. The page asks search engines not to index it, does not repeat the requested address, and shows no closing call-to-action band

### AC-18 (US-07) — cross-context

**Given** the site has no Published project yet
**When** a Visitor sees the Not-found page
**Then** its content offers "Back to home" as its only action and no "See projects"; the links of the Shell around it are not part of the page content

### AC-19 (US-07) — happy

**Given** a Visitor using a screen reader on the Not-found page
**When** they move through the page content
**Then** they hear the code line, the heading, the body and "Back to home"; the map panel, its pin label and its coordinates are decoration and are not announced

### AC-20 (US-08) — happy

**Given** a Recruiter at the end of a page that has not left the closing call-to-action band out (the Not-found page leaves it out)
**When** they reach the band above the footer
**Then** it shows "Let’s build something good together.", the line about hiring in the Oslo area, a primary "Get in touch" and a secondary "Download CV" that downloads the English CV PDF, or the Norwegian one on a page that declares Norwegian as its CV language

### AC-21 (US-09) — happy

**Given** the Owner opens the Styleguide
**When** the page is shown in Dag and in Natt
**Then** it shows every component of §1.1 in every state it has: default, hover, keyboard focus, pressed and disabled for interactive ones; the four header variants (default, bordered, on spruce, secondary call to action); the open menu panel; the Sticky action bar; the closing call-to-action band; the footer; and a Toast that the Owner can trigger. The Styleguide itself uses the real header, whose theme switch is how the Owner changes between Dag and Natt, and the real footer; it leaves out the real Sticky action bar and the closing call-to-action band and shows both as samples, and the rule of AC-24 for leaving out the bar does not apply to it, as AC-23 does not

### AC-22 (US-09) — authorization

**Given** a Visitor or a search engine that was not given the Styleguide address
**When** they use the site's navigation, its sitemap or a search engine
**Then** nothing leads them to the Styleguide, and the page asks search engines not to index it, because it is a working page for the Owner and not content for Visitors

### AC-23 (US-01) — domain invariant

**Given** any page for Visitors, which is every page except the Styleguide, at 390, 834 or 1440 wide
**When** the checks count the primary buttons
**Then** the page content has at most one, and the visible screen at most two. Below 768, on a page that has the Sticky action bar, the header's "Get in touch" uses the secondary style while the bar is on screen and the primary style once the bar has scrolled away, so the contact action is primary exactly once; with scripts off or reduced motion the bar stays on screen and the header action stays secondary. One primary action per screen is a brand rule, and the Shell's contact action counts once

### AC-24 (US-10) — happy

**Given** the Owner builds a later page on the shared layout
**When** they set only page options: which navigation link is current, the header variant, leaving out the Sticky action bar, leaving out the closing call-to-action band, and the CV language for the download
**Then** the page gets the matching Shell with no change to any shared component or layout file; a page for Visitors may leave out the Sticky action bar only if it is the CV page itself or its own content links to the CV

### AC-25 (US-10) — happy

**Given** a Visitor using any interactive component of §1.1 by touch or by keyboard
**When** they reach it and activate it
**Then** it has a touch target of at least 44 by 44 (the control's own box, or an invisible overlay where the page design draws the control lower, D-08; footer text links are as high as their line and keep at least 24 between their centres), a visible focus ring, works with Enter (and Space for buttons), and tells nothing by hover alone; a Stat shows its final number in the page itself, with scripts on or off

### AC-26 (US-12) — domain invariant

**Given** the Owner writes a style that has a colour literal in any property, a value that is not a Fjord token on an enforced property (colour, spacing, type size, radius, transition and animation duration and easing), a breakpoint outside the four, or a Fjord token that the token generator does not produce
**When** the checks run
**Then** they fail and point to the file and line, because Fjord tokens stay the only source of these values; the enforced properties, the accepted forms and the accepted gaps are recorded in ADR-0004, and a number with a unit inside a math function on an enforced property still fails

### AC-27 (US-13) — authorization

**Given** a page that carries the Shell
**When** an inline script, an inline style or a script from another origin appears in it
**Then** the browser refuses it, while the Shell's own scripts, served by the site itself, still run; the site's security policy is not widened by this feature

### AC-28 (US-14) — happy

**Given** a Visitor whose device asks for reduced motion
**When** they open the menu, change the theme, focus the skip link, scroll the page or trigger a Toast
**Then** nothing slides, grows or loops; each change is instant or at most a fade

### AC-29 (US-04) — happy

**Given** a Visitor whose device does not ask for reduced motion, in a browser that supports page transitions
**When** they change the theme
**Then** the two themes cross-fade; in a browser without that support the theme changes at once and everything else behaves the same

### AC-30 (US-10) — happy

**Given** a Toast is triggered on a phone while the Sticky action bar is visible
**When** it appears
**Then** it sits above the bar and never covers it, is announced politely to assistive technology, and goes away by itself

### AC-31 (US-01) — cross-context

**Given** the Shell's links to the CV and to the contact place are set to their final addresses before those targets exist
**When** the release gate is checked
**Then** two parity items stand open, one saying that the Shell's contact links reach the contact place and one saying that the Shell's CV links reach the CV page; step 4 and step 5 each close their own, and Release 1 cannot pass while either is open

### AC-32 (US-01) — happy

**Given** a Visitor whose device does not ask for reduced motion, in a browser that supports page transitions
**When** they follow a link to another page of the site
**Then** the page content cross-fades while the header stays still; with reduced motion, or in a browser without that support, the new page simply opens and everything else behaves the same

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Lighthouse categories, mobile | Performance, Accessibility, Best Practices, SEO each ≥ 95 on the home placeholder and the Not-found page, now with the Shell; SEO not asserted on the noindex Not-found page | Lighthouse CI (mobile) on the built site |
| LCP / CLS / TBT, mobile | ≤ 2.0 s / ≤ 0.02 / ≤ 100 ms on the same two pages | Lighthouse CI (mobile) |
| Initial JS per page | ≤ 50 KB gzip in total; all Shell scripts together ≤ 5 KB gzip. If the built scripts exceed 5 KB, the measurement is reported to the Owner before anything is changed | build output size check in CI |
| Not-found page weight | HTML ≤ 20 KB gzip, with the map panel inline. If the built page exceeds it, the map is not simplified, because the page design wins: either the map moves to a separate cached SVG file, which must still meet AC-17, AC-19 and AC-26 in Dag and Natt, or the PR proposes a new limit with the measured size; the limit in CI changes only through that proposal | build output size check in CI |
| Accessibility | 0 axe violations on the home placeholder, the Not-found page and the Styleguide, in Dag and Natt, and with the menu panel open | axe in Playwright |
| Touch targets | every interactive element of the Shell has a target ≥ 44 × 44 px at 390, counting its overlay (D-08); footer text links: line height, ≥ 24 px between centres (WCAG 2.2 2.5.8 spacing) | e2e box and overlay measurement |
| Primary buttons | page content ≤ 1, visible screen ≤ 2, at 390 / 834 / 1440, on every page except the Styleguide; at 390 the count is taken in three states: bar on screen (header action secondary), bar scrolled away (header action primary, bar actions not focusable), and scripts off or reduced motion (bar on screen, header action secondary) | e2e count (AC-23) |
| Visual regression | ≤ 0.1 % differing pixels per screenshot; the Styleguide is captured per component section, not as one page; Not-found page full page; all at 390 / 834 / 1440 in Dag and Natt; the copyright year is masked | Playwright visual tests in CI |
| Design match | 0 differences between the Not-found page and `design/screenshots/` at 390 / 834 / 1440 in Dag and Natt other than those listed in §1.3 | manual review in the PR, screenshots side by side |
| Contrast | every text and background pair the new components render, in Dag, Natt and on spruce: body ≥ 4.5:1; large text, control boundaries (the outline that identifies a Button, input or switch) and the focus ring ≥ 3:1; decorative, `aria-hidden` lines that identify no control (dividers, hairlines, the map route) are measured and reported, not gated | contrast check script in CI |
| Token-only styles | 0 findings over all page and component styles | Stylelint in CI |
| Wrong selection on the theme switch | 0 across the 6 combinations (stored Dag / Natt / none × device light / dark) | e2e test |

## 6.1 Security / privacy

- **Data classification:** public. Everything the Shell shows is published by the Owner on purpose.
- **Personal data touched:** the Owner's own contact facts (email, phone, profile links), the Work region and the Residence as a municipality with coordinates rounded to two decimals, which is the municipality centre and not a home address. No Visitor data: the Theme choice is one "dag"/"natt" value that this feature now writes, kept only in the Visitor's own browser and never sent anywhere. No cookie is set.
- **AuthZ/AuthN impact:** no accounts or sign-in. The security policy is not changed: the Shell's scripts are served by the site itself, and no inline script or inline style is added.
- **Abuse cases:**
  - Injected inline script or style in a page with the Shell: refused by the browser; the policy stays as it is (AC-27).
  - Tampered Theme choice in the Visitor's storage: only the two known themes are ever written or honoured; anything else falls back to the device preference.
  - Reflected content on the Not-found page: the requested address is never shown back (AC-17).
  - The Styleguide found and indexed as if it were site content: not linked, not in the sitemap, noindex (AC-22).
  - Links to other sites (LinkedIn, GitHub) used to reach back into the page that opened them: they open without giving the other site a handle on this one (checked with AC-14).
  - A more precise home location leaking through the footer: coordinates are never shown with more than two decimals (AC-14).
- **Security review:** N/A, as long as the policy contract (`tests/contracts/csp.contract.json`) is unchanged at the end of the feature. If the feature has to change it, a lightweight review of the delivered policy on the preview URL is required before merge.

## 7. Metrics / KPIs

- **Open stub-parity items (`test.fixme` in the parity suite)** — baseline: 11, target: 12 when this feature merges into `v2`: P-25 turned on, and P-50 and P-51 added for steps 4 and 5 to close.
- **fjord-foundation OQ-02 items closed** — baseline: 0 of 15, target: 15 of 15 when this feature merges (base-components AC-17, base-components AC-07 and the Design match row).
- **Differences from the page design not listed in §1.3, on the Not-found page** — baseline: 15, target: 0 at the design-match review.
- **Components with a checked reference on the Styleguide** — baseline: 0, target: every item marked "new" in §1.1 when this feature merges.
- **Edits to shared Shell or component files needed to build Home and CV** — baseline: not measurable yet, target: 0 in the step 4 and step 5 PRs; measured at their review.
- **Review rounds** — baseline: 8 (fjord-foundation), target: ≤ 2.

## 8. Open questions

None. Every decision raised during specify was settled by the Owner; the mechanism choices left open on purpose (mobile menu, header border) belong to the design stage and are bounded by AC-03 to AC-06.
