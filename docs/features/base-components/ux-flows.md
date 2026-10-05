---
status: draft
feature_size: "S"
updated_at: "2026-10-04"
---

# UX flows — base-components

> User flows for every UI-touching §4 user story of [spec.md](./spec.md), produced by `ux-flows`
> (after `specify`, before `design`) and read by `design` (target-surface evidence), `sequences`,
> `screens` (details every inventory row) and `plan-tests` (the e2e-through-UI paths).
> Flow altitude only: movement between screens and the branches the ACs demand. No layout, no
> components, no styling.

## Platform decisions

- **Posture:** mobile-first, per `docs/design-system.md`. Unlike fjord-foundation, the flows here do branch by width: at 768 (navigation shape, Sticky action bar) and at 1024 (arrangement of the Not-found page). The phone path is drawn first and the wide path is its branch.
- **Navigation shape:** flat, one level. Three targets from the Shell: the home page (wordmark), the CV and the contact place. At 768 and wider they sit in the header; below 768 the header keeps the wordmark, the menu button and "Get in touch", and the rest moves into the Mobile menu panel.
- **Mobile menu modality:** a panel over the current page, not a page of its own. When it opens, focus moves to its first link; it closes on Escape, on the close button and on any link. Choosing a theme inside it leaves it open. The mechanism is chosen in `design` (spec §1.3 D-12).
- **Sticky action bar:** a persistent part of the Shell below 768 only, never an overlay that blocks the page. A page for Visitors may leave it out (AC-24) only if it is the CV page itself or its own content links to the CV; in the page designs only the CV page does, and no Visitor page in this feature does. The Styleguide is exempt from this rule, as it is from AC-23. On such a page with scripts off, contact stays reachable through the header "Get in touch" and the footer email and phone, so AC-06 holds.
- **Theme switch:** changes the page in place, with no reload and no navigation. Offered only where scripts run.
- **Not-found modality:** a full page inside the Shell, delivered with a not-found response. Not an overlay and not a redirect.
- **Styleguide:** a standalone page reached only by typing its address. No flow from a Visitor page leads to it. It uses the real header (its theme switch is how the Owner changes between Dag and Natt) and the real footer. It leaves out the real Sticky action bar and the closing call-to-action band and shows both as samples: a fixed bar would overlap the sample sections and make the per-section screenshots unstable.
- **Toast:** transient and non-blocking. It never takes focus and goes away by itself.
- **Scripts off:** every navigation flow still completes. The theme switch is not offered (D-09), and for the same reason the menu button is not shown if the menu mechanism needs a script.
- **Motion:** with reduced motion every state change is instant or a fade; the flows end in the same states either way.
- **Interim targets:** the CV address and the contact place are exits of these flows, not screens of this feature (spec §1.2 IS-01, IS-02). They are drawn as exit nodes with their interim result.
- **Design input (not decided here):**
  - How the menu panel opens and closes (D-12). If the chosen mechanism needs a script, the menu button is not shown with scripts off; AC-06 is met by the Sticky action bar either way.
  - The menu panel is open and the screen becomes 768 or wider (rotation, resize): not covered by an AC.
  - Storage blocked (AC-11): the flows assume "this visit" means the page the Visitor is on, because nothing can be kept for the next page.
  - How the header gains its bottom border on scroll (AC-03), with scripts off as well.
  - AC-30 needs a surface where a Toast and the real Sticky action bar are on screen together. In this feature only the Styleguide triggers a Toast, and it has no real bar; `design` and `plan-tests` name the surface the check runs on.

## Screen inventory

| ID | Screen | Purpose | Entry | Exit |
|---|---|---|---|---|
| SCR-01 | Home placeholder | Temporary home page, now inside the Shell, until the real Home (step 4) | Direct visit to `/`; the wordmark; "Back to home" on SCR-02; "Contact" and "Get in touch" while the contact place does not exist (IS-01) | Shell links to the CV address and the contact place; SCR-03; footer links to other sites |
| SCR-02 | Not-found page ("Ikke funnet") | Turns a dead or mistyped link into the Fjord page from the page design, with one clear way back | Any address the site does not have | "Back to home" to SCR-01; the Shell links; SCR-03 |
| SCR-03 | Mobile menu panel | Gives a phone the navigation, the contact facts and the theme switch that a wide screen has in the header | The menu button in the header, below 768, on SCR-01, SCR-02 or SCR-04 | Escape or the close button back to the page it was opened on; a link to its target |
| SCR-04 | Styleguide | Shows every component in every state in Dag and Natt, as the surface for visual and accessibility checks | Typing its address; nothing links to it | The header and footer links; SCR-03 |

## Flows

### Flow: US-01 — Find the way from the header

```mermaid
flowchart TD
    A["Recruiter opens any page: SCR-01, SCR-02 or SCR-04"] --> B{"Screen width?"}
    B -->|"below 768"| C["Header: wordmark, menu button, one 'Get in touch'. No 'Projects', no search (AC-02)"]
    B -->|"768 and wider (AC-01)"| D["Header: wordmark, 'CV' and 'Contact' with the current page marked, theme switch, one 'Get in touch' with an arrow. No 'Projects', no search (AC-02)"]
    C -->|"menu button"| M["SCR-03 Mobile menu panel (Flow US-02)"]
    C --> P{"Sticky action bar on screen?"}
    P -->|"yes, and always with scripts off or reduced motion"| P1["Header 'Get in touch' is secondary, the bar holds the primary (AC-23)"]
    P -->|"no, it has scrolled away"| P2["Header 'Get in touch' is primary (AC-23)"]
    C --> N{"Action in the header?"}
    D --> N
    N -->|"wordmark"| H["SCR-01 Home placeholder"]
    N -->|"'Contact' or 'Get in touch'"| K["Contact place on the home page. Interim IS-01: the Visitor lands on SCR-01, parity P-50 stays open for step 4 (AC-31)"]
    N -->|"'CV', at 768 and wider"| V["CV address. Interim IS-02: the English PDF, parity P-51 stays open for step 5 (AC-31)"]
    N -->|"scrolls down"| R["Header stays at the top and gains a bottom border, also with reduced motion (AC-03)"]
    R -->|"back at the top of the page"| R2["The border is gone"]
    H --> T{"Page transitions supported and motion allowed?"}
    K --> T
    T -->|"yes (AC-32)"| T1["The content cross-fades, the header stays still"]
    T -->|"no"| T2["The new page simply opens, everything else is the same"]
```

A Recruiter opens any page. Below 768 the header shows the wordmark, the menu button and one "Get in touch"; at 768 and wider it shows the wordmark, "CV" and "Contact" with the current page marked, the theme switch and one "Get in touch". Neither width shows "Projects" or a search trigger. On a phone the menu button opens the Mobile menu panel, and the header's "Get in touch" is secondary while the Sticky action bar is on screen (always so with scripts off or reduced motion) and primary once the bar has scrolled away. From the header the wordmark leads to the Home placeholder; "Contact" and "Get in touch" lead to the contact place, which for now lands on the Home placeholder (parity P-50 open); "CV" leads to the CV address, which for now answers with the English PDF (parity P-51 open). Scrolling down keeps the header at the top and gives it a bottom border, which goes away again at the top of the page, with reduced motion too. When a link opens another page of the site, the content cross-fades and the header stays still where page transitions are supported and motion is allowed; otherwise the new page simply opens.

### Flow: US-02 — Navigate on a phone

```mermaid
flowchart TD
    A["Recruiter on a screen below 768 opens any page: SCR-01, SCR-02 or SCR-04"] --> B{"Scripts enabled?"}
    B -->|"no (AC-06)"| N["The menu button is not shown if the menu needs a script, like the theme switch (D-09). CV and contact stay reachable from the Shell: on SCR-01 and SCR-02 the Sticky action bar offers 'View CV' and 'Get in touch'"]
    B -->|"yes"| C["Activates the menu button in the header"]
    C --> D["SCR-03 Mobile menu panel opens and focus moves to its first link: 'CV', 'Contact', email, phone, Work region 'Oslo, Norge', theme switch, 'Get in touch'. No 'Projects', no search. Readable in Dag and Natt (AC-04)"]
    D --> E{"How does it close? (AC-05)"}
    E -->|"Escape"| F["Panel closes, focus returns to the menu button"]
    E -->|"close button"| F
    E -->|"link to another page or address"| G["Panel closes, the target opens"]
    E -->|"link to a place on the current page"| H["Panel closes, the page moves to that place"]
    D -->|"theme switch"| I["Theme changes, the panel stays open (Flow US-04)"]
```

A Recruiter on a phone opens any page. With scripts off, the menu button is not shown if the menu needs a script, the same way the theme switch is not offered; the CV and the contact action are still reachable from the Shell, because the Sticky action bar offers both, so navigation never waits for a script. With scripts on, the menu button opens the Mobile menu panel and focus moves to its first link. The panel holds "CV", "Contact", the email and phone as links, the Work region "Oslo, Norge", the theme switch and "Get in touch", and no "Projects" or search. It closes in four ways: Escape and the close button close it and return focus to the menu button; a link to another page closes it and opens the target; a link to a place on the current page closes it too and moves the page there. Choosing a theme inside the panel changes the theme and leaves the panel open.

### Flow: US-03 — Keep the two main actions at hand

```mermaid
flowchart TD
    A["Recruiter opens a page: SCR-01, SCR-02 or SCR-04"] --> B{"Screen below 768?"}
    B -->|"no"| X["No Sticky action bar (AC-07)"]
    B -->|"yes"| L{"Has the page left the bar out? (AC-24)"}
    L -->|"yes: SCR-04, an Owner page exempt from the rule"| S["No real bar on SCR-04, it shows the bar as a sample"]
    L -.->|"yes: a Visitor page, allowed only for the CV page itself or a page whose content links to the CV. None in this feature, the CV page in step 5"| Y["No bar. With scripts off, contact stays reachable through the header 'Get in touch' and the footer email and phone (AC-06)"]
    L -->|"no: SCR-01, SCR-02 (AC-07)"| C["Sticky action bar at the bottom of the screen: 'View CV' and 'Get in touch'. It never covers the last lines of the page or the focused element"]
    C --> D{"Scripts on and motion allowed?"}
    D -->|"no (AC-09)"| E["The bar stays in place while the page scrolls. Header 'Get in touch' stays secondary (AC-23)"]
    D -->|"yes, scrolls down (AC-08)"| G["The bar leaves the screen: its actions take no focus and are not announced. Header 'Get in touch' becomes primary (AC-23)"]
    G -->|"scrolls up"| H["The bar returns. Header 'Get in touch' is secondary again (AC-23)"]
    H -->|"scrolls down"| G
    C -->|"'View CV'"| V["CV address. Interim IS-02: the English PDF"]
    C -->|"'Get in touch'"| K["Contact place on the home page. Interim IS-01: the Visitor lands on SCR-01"]
```

A Recruiter opens a page. At 768 and wider there is no Sticky action bar. Below 768 the Styleguide leaves the real bar out and shows it only as a sample; it is an Owner page and exempt from the rule. A page for Visitors may leave the bar out only if it is the CV page itself or its own content links to the CV; none in this feature does (the dashed branch, the CV page in step 5), and on such a page with scripts off contact stays reachable through the header "Get in touch" and the footer email and phone. On the Home placeholder and the Not-found page the bar sits at the bottom of the screen with "View CV" and "Get in touch" and never covers the end of the page or the focused element. With scripts off or reduced motion it stays in place while the page scrolls, and the header's "Get in touch" stays secondary. With scripts on and motion allowed it leaves the screen on the way down, where its two actions cannot be focused and are not announced and the header's "Get in touch" becomes primary; on the way up it returns and the header action is secondary again. "View CV" leads to the CV address (for now the English PDF) and "Get in touch" to the contact place (for now the Home placeholder).

### Flow: US-04 — Switch the theme

```mermaid
flowchart TD
    A["Visitor opens any page: SCR-01, SCR-02 or SCR-04"] --> B{"Scripts enabled?"}
    B -->|"no (AC-11)"| N["No theme switch is offered, the page follows the device preference"]
    B -->|"yes"| C["Theme switch is shown: in the header at 768 and wider, in SCR-03 below 768. Its selection always equals the theme the page is in (AC-12)"]
    C -->|"chooses the other theme (AC-10)"| D{"Page transitions supported and motion allowed?"}
    D -->|"yes (AC-29)"| E["The two themes cross-fade"]
    D -->|"no"| F["The theme changes at once"]
    E --> G["The page is in the chosen theme, the switch shows it as selected, the header switch and the menu switch agree"]
    F --> G
    G --> H{"Site storage available?"}
    H -->|"yes"| I["Kept as the Theme choice: the next page opens in it from its first frame"]
    H -->|"no (AC-11)"| J["The theme holds for this visit, no error is shown"]
```

A Visitor opens any page. With scripts off no theme switch is offered and the page follows the device preference. With scripts on the switch is shown, in the header on a wide screen and in the Mobile menu panel on a phone, and whatever was stored before, its selection always equals the theme the page is in. Choosing the other theme changes the page in place: as a cross-fade where page transitions are supported and motion is allowed, at once otherwise. The switch then shows the new theme as selected, and the header switch and the menu switch agree. If site storage is available the choice is kept and the next page opens in that theme from its first frame; if storage is blocked the theme still holds for this visit and no error is shown. Choosing the first theme again does the reverse along the same path.

### Flow: US-05 — Skip to the content

```mermaid
flowchart TD
    A["Visitor has just opened any page: SCR-01, SCR-02 or SCR-04"] -->|"presses Tab once"| B["'Skip to content' is visible and has focus, as the first focusable element (AC-13)"]
    B -->|"activates it"| C["Focus moves to the main content of the same page, past the header"]
    B -->|"presses Tab again"| D["Focus goes on into the header"]
```

A Visitor has just opened any page and presses Tab once. A visible "Skip to content" link has focus; it is the first focusable element of the page. Activating it moves focus to the main content of the same page, past the header. Pressing Tab again instead carries on into the header as usual.

### Flow: US-06 — See who and where

```mermaid
flowchart TD
    A["Visitor reaches the end of any page: SCR-01, SCR-02 or SCR-04"] --> B["Footer: 'Good products are built together.', email, phone, LinkedIn, GitHub, 'Based in' Nittedal, Norge with 60.07° N, 10.87° E, copyright with the year and the name, 'Sist oppdatert' with the date (AC-14)"]
    B -->|"email"| C["The Visitor's mail app opens a message to Alexander"]
    B -->|"phone"| D["The Visitor's phone app opens the number"]
    B -->|"LinkedIn or GitHub"| E["The profile opens on the other site, which gets no handle on this page"]
    B -->|"reads on"| F["Residence, coordinates, copyright and last-updated date are plain text with nothing to activate"]
```

A Visitor reaches the end of any page and reads the footer: the line "Good products are built together.", the email and phone, the LinkedIn and GitHub profiles, "Based in" with the Residence and its coordinates, the copyright line and "Sist oppdatert" with the date. The email opens the Visitor's mail app and the phone their phone app. LinkedIn and GitHub open the profile on the other site, which gets no handle on the page it came from. The Residence, the coordinates, the copyright line and the date are plain text.

### Flow: US-07 — Recover from a dead link

```mermaid
flowchart TD
    A["Visitor follows an outdated or mistyped link"] --> B{"Address exists on the site?"}
    B -->|"yes"| X["The real page or short-link target (outside this flow)"]
    B -->|"no (AC-17)"| C["SCR-02 Not-found page inside the Shell, with a not-found response: code line with 'Ikke funnet', 'This page is off the map.', the body line and the map panel. Not indexed, the address is not shown back, no closing call-to-action band"]
    C --> D{"Screen width?"}
    D -->|"below 1024"| D1["The map sits under the text"]
    D -->|"1024 and wider"| D2["Text and map in two columns"]
    C --> E{"Published project exists?"}
    E -->|"no, the state in this feature (AC-18)"| F["'Back to home' is the only action in the page content"]
    E -.->|"yes, owned by step 7"| G["'See projects' is also offered"]
    F -->|"Back to home"| H["SCR-01 Home placeholder"]
    C -->|"screen reader (AC-19)"| S["Hears the code line, the heading, the body and 'Back to home'. The map, its pin label and its coordinates are not announced"]
    C -->|"uses the Shell instead"| T["Header, SCR-03, Sticky action bar and footer work as on any page (Flows US-01 to US-06)"]
```

A Visitor follows a link to an address the site does not have. Known addresses and short links go to their real target and are outside this flow. Any unknown address returns a not-found response with the Not-found page inside the Shell: the code line with "Ikke funnet", the heading "This page is off the map.", the body line and the map panel. The page is not indexed, never repeats the requested address and has no closing call-to-action band. Below 1024 the map sits under the text; from 1024 they are two columns. Because no Published project exists, "Back to home" is the only action in the page content and leads to the Home placeholder; the dashed branch with "See projects" belongs to step 7. A screen reader user hears the code line, the heading, the body and "Back to home", and nothing of the map. The Shell around the page works as on any other page.

### Flow: US-08 — Be invited to get in touch

```mermaid
flowchart TD
    A["Recruiter reaches the end of a page's content"] --> B{"Has the page left the closing band out?"}
    B -->|"yes: SCR-02, and SCR-04 which shows the band only as a sample"| X["No band, the footer follows the content"]
    B -->|"no: SCR-01"| C["Closing band above the footer: 'Let’s build something good together.', the line about hiring in the Oslo area, primary 'Get in touch', secondary 'Download CV' (AC-20)"]
    C -->|"Get in touch"| K["Contact place on the home page. Interim IS-01: the Visitor lands on SCR-01"]
    C -->|"Download CV"| L{"CV language the page declares?"}
    L -->|"none or English"| M["The English CV PDF downloads"]
    L -->|"Norwegian"| N["The Norwegian CV PDF downloads"]
```

A Recruiter reaches the end of a page's content. The Not-found page leaves the closing band out, so the footer follows directly; the Styleguide leaves the real band out too and shows it as a sample. On the Home placeholder, and on later pages that keep it, the band sits above the footer with "Let’s build something good together.", the line about hiring in the Oslo area, a primary "Get in touch" and a secondary "Download CV". "Get in touch" leads to the contact place (for now the Home placeholder). "Download CV" downloads the English PDF, or the Norwegian one on a page that declares Norwegian as its CV language; no page in this feature does.

### Flow: US-09 — A reference for every component

```mermaid
flowchart TD
    A["Owner types the Styleguide address"] --> B["SCR-04 Styleguide, with the real header and footer around it: every component of spec §1.1 in every state, the four header variants, the open SCR-03, and the Sticky action bar and the closing band as samples (AC-21)"]
    B -->|"switches the theme in the real header"| C["The same page in the other theme, so Dag and Natt are both checked"]
    C -->|"switches back"| B
    B -->|"triggers the Toast"| D["The Toast appears and goes away by itself (Flow US-10)"]
    V["Visitor or search engine without the address (AC-22)"] --> W["Looks in the site's navigation, its sitemap or a search engine"]
    W --> Z["Nothing leads to SCR-04. If it is opened anyway, it asks search engines not to index it"]
```

The Owner types the Styleguide address and gets the page with every component of spec §1.1 in every state it has, the four header variants, the open Mobile menu panel, the Sticky action bar and the closing band. The page has the real header and the real footer; the Sticky action bar and the closing band appear only as samples, not as real Shell parts. Switching the theme in the real header shows the same page in the other theme, so both Dag and Natt can be checked; the Owner can also trigger a Toast. A Visitor or a search engine that was not given the address finds nothing that leads there, in the navigation, the sitemap or a search engine, and the page itself asks not to be indexed.

### Flow: US-10 — Build pages without touching the Shell

```mermaid
flowchart TD
    O["Owner builds a later page and sets only page options (AC-24)"] --> P["The page gets the matching Shell: current link, header variant, with or without the closing band, CV language, and without the Sticky action bar only on the CV page itself or a page whose content links to the CV. No shared file is edited"]
    P --> A["Visitor reaches an interactive component on SCR-01, SCR-02, SCR-03 or SCR-04"]
    A --> B{"How do they use it? (AC-25)"}
    B -->|"touch"| C["The target is at least 44 by 44"]
    B -->|"keyboard"| D["A visible focus ring. Enter activates it, and Space too for buttons"]
    B -->|"pointer hover"| E["Hover tells nothing that is not available without it"]
    A -->|"an action triggers a Toast, in this feature only on SCR-04"| T{"Sticky action bar visible?"}
    T -->|"yes (AC-30)"| T1["The Toast sits above the bar and never covers it"]
    T -->|"no"| T2["The Toast appears in its usual place"]
    T1 --> U["Announced politely to assistive technology, goes away by itself"]
    T2 --> U
```

The Owner builds a later page and sets only page options: the current link, the header variant, whether the Sticky action bar and the closing band are left out, and the CV language. The Sticky action bar may be left out only on the CV page itself or on a page whose own content links to the CV. The page gets the matching Shell and no shared file is edited. A Visitor then reaches any interactive component: by touch its target is at least 44 by 44; by keyboard it shows a focus ring and works with Enter, and with Space for buttons; hover never carries information that is missing otherwise. When an action triggers a Toast (in this feature only the Styleguide does), it sits above the Sticky action bar if the bar is visible and never covers it, is announced politely and goes away by itself.

### Flow: US-14 — Calm for reduced motion

```mermaid
flowchart TD
    A["Visitor opens any page: SCR-01, SCR-02 or SCR-04"] --> B{"Device asks for reduced motion?"}
    B -->|"no"| M["Motion as designed: the menu, the bar, the Toast and the skip link move, the theme and pages cross-fade where supported"]
    B -->|"yes (AC-28)"| C{"What does the Visitor do?"}
    C -->|"opens or closes SCR-03"| C1["Instant or a fade, nothing slides"]
    C -->|"changes the theme"| C2["The theme changes at once, no cross-fade"]
    C -->|"focuses the skip link"| C3["It appears without sliding"]
    C -->|"scrolls"| C4["The Sticky action bar stays in place (AC-09), the header border still switches (AC-03)"]
    C -->|"triggers a Toast on SCR-04"| C5["It appears and leaves instantly or with a fade"]
    C -->|"follows a link"| C6["The new page simply opens (AC-32)"]
```

A Visitor opens any page. Without a reduced-motion preference the Shell moves as designed. With it, nothing slides, grows or loops: the Mobile menu panel opens and closes instantly or with a fade; the theme changes at once; the skip link appears without sliding; the Sticky action bar stays in place on scroll while the header border still switches, because that is a change of state; a Toast appears and leaves instantly or with a fade; and a link simply opens the new page.

### Out of scope (no human-facing UI flow)

- **US-11 — Contact facts in one place:** the Owner works in the repository and CI. The single source and its checks are build-time behaviour; the visible result is the footer (Flow US-06) and the Mobile menu panel (Flow US-02).
- **US-12 — Guardrails stay strict:** style checks run in CI, with no screen the Owner moves through.
- **US-13 — A Shell that needs no trust:** the browser enforces the security policy without any visible step. The scripts-off half of the story is visible and is drawn in Flows US-02, US-03 and US-04.

## AC coverage

| AC | Shown by | Notes |
|---|---|---|
| AC-01 | Flow US-01, branch `768 and wider (AC-01)` | Current page marked |
| AC-02 | Flow US-01, both header nodes; Flow US-02, node "SCR-03 Mobile menu panel opens" | No "Projects", no search |
| AC-03 | Flow US-01, branch `scrolls down` and `back at the top of the page` | Also in Flow US-14, branch `scrolls` |
| AC-04 | Flow US-02, node "SCR-03 Mobile menu panel opens and focus moves to its first link" | |
| AC-05 | Flow US-02, the four branches of "How does it close?" | Focus returns after Escape and the close button |
| AC-06 | Flow US-02, branch `no (AC-06)` of "Scripts enabled?"; Flow US-03, dashed branch `yes: a Visitor page` of "Has the page left the bar out?" | Met by the Sticky action bar; on a page without the bar, by the header action and the footer |
| AC-07 | Flow US-03, branch `no` of "Screen below 768?" and branch `no: SCR-01, SCR-02 (AC-07)` of "Has the page left the bar out?" | |
| AC-08 | Flow US-03, branch `yes, scrolls down (AC-08)`, then `scrolls up` | Off screen: no focus, not announced |
| AC-09 | Flow US-03, branch `no (AC-09)` | Also in Flow US-14, branch `scrolls` |
| AC-10 | Flow US-04, branch `chooses the other theme (AC-10)` to "Kept as the Theme choice" | Header and menu switches agree |
| AC-11 | Flow US-04, branch `no (AC-11)` of "Scripts enabled?" and branch `no (AC-11)` of "Site storage available?" | |
| AC-12 | Flow US-04, node "Theme switch is shown" | The six stored × device combinations are test cases for plan-tests |
| AC-13 | Flow US-05, whole flow | |
| AC-14 | Flow US-06, whole flow | |
| AC-15 | N/A: build-time single source and its check, Owner in CI, no UI | Visible result: Flow US-06 and Flow US-02 |
| AC-16 | N/A: build-time date check, Owner in CI, no UI | US-11 out of scope here |
| AC-17 | Flow US-07, branch `no (AC-17)` to SCR-02, and the "Screen width?" branches | |
| AC-18 | Flow US-07, branch `no, the state in this feature (AC-18)` | The `yes` branch is dashed: step 7 owns it |
| AC-19 | Flow US-07, branch `screen reader (AC-19)` | |
| AC-20 | Flow US-08, branch `no: SCR-01` and the "CV language" branches | SCR-02 leaves the band out; SCR-04 shows it as a sample |
| AC-21 | Flow US-09, node "SCR-04 Styleguide" and the theme branches | |
| AC-22 | Flow US-09, nodes from "Visitor or search engine without the address" | |
| AC-23 | Flow US-01, branches of "Sticky action bar on screen?"; Flow US-03, nodes for bar in place, off screen and returned | The count itself is an e2e check |
| AC-24 | Flow US-10, nodes "Owner builds a later page" and "The page gets the matching Shell" | Its options also appear as decisions in Flows US-03 and US-08 |
| AC-25 | Flow US-10, branches `touch`, `keyboard`, `pointer hover` | The Stat's final number is shown on SCR-04 (Flow US-09) |
| AC-26 | N/A: build-time style check, Owner in CI, no UI | US-12 out of scope here |
| AC-27 | N/A: browser-level enforcement with no visible step; covered by e2e in plan-tests | US-13 out of scope here |
| AC-28 | Flow US-14, branch `yes (AC-28)` and its six branches | |
| AC-29 | Flow US-04, branches `yes (AC-29)` and `no` of "Page transitions supported and motion allowed?" | |
| AC-30 | Flow US-10, branch `yes (AC-30)` of "Sticky action bar visible?" | SCR-04 has no real bar; the surface for this check is design input |
| AC-31 | Flow US-01, exit nodes "Contact place" (P-50) and "CV address" (P-51) | The release gate itself is a CI check |
| AC-32 | Flow US-01, branches of "Page transitions supported and motion allowed?" | Reduced-motion side also in Flow US-14, branch `follows a link` |
