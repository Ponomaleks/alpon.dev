---
status: draft
feature_size: "S"
updated_at: "2026-10-05"
---

# UX flows — home

> User flows for every UI-touching §4 user story of [spec.md](./spec.md), produced by `ux-flows`
> (after `specify`, before `design`) and read by `design` (target-surface evidence), `sequences`,
> `screens` (details every inventory row) and `plan-tests` (the e2e-through-UI paths).
> Flow altitude only: movement between screens and the branches the ACs demand. No layout, no
> components, no styling.

## Platform decisions

- **Posture:** mobile-first, per `docs/design-system.md`. The phone path is drawn first; the flows branch at 768 (Sticky action bar, header navigation) and at 1024 (portrait beside the text, QR tile).
- **Page shape:** the home page is one long page. Its sections (hero, key facts, About, Experience, Recommendations, Contact) are places on one screen, not screens of their own; a Visitor moves between them by scrolling or by a link to the contact section.
- **Message form:** not part of this feature (spec §1.2 IS-03, roadmap step 12). In its place the contact section shows a mail-link sentence, see spec §1.2 IS-03, the same with scripts on or off.
- **Contact place:** the contact section of the home page. "Contact" and "Get in touch" in the header and in the Mobile menu panel lead there from every page: on the home page the page moves to it, from another page the home page opens at it. Focus is placed at the section in both cases.
- **Experience entries:** each entry opens and closes in place and independently of the others; nothing navigates.
- **Copy confirmation:** a Toast, transient and non-blocking, as in base-components. On a phone it is the first Toast shown together with the real Sticky action bar.
- **Motion control:** one control in the hero, changing the page in place. It exists only where scripts run and the device does not ask for reduced motion.
- **Sticky action bar:** below 768 only; its two actions come from the page and it can be collapsed to a tab. Collapsing holds for the page the Visitor is on; a newly opened page shows the bar again.
- **Closing band:** on the home page it follows the contact section directly and carries no contact action.
- **Scripts off:** every section is readable and every contact route works. The actions that need a script (the Motion control, "Copy") are not offered.
- **Motion:** with reduced motion every flow ends in the same state; changes are instant or a fade and nothing loops or counts; the hero contours do not follow the pointer and the closing band's contours do not follow scrolling.
- **Interim and dormant targets:** the CV address is an exit of these flows, not a screen of this feature (spec §1.2 IS-01). The Selected projects section and "See projects" are dormant until step 7; their branches are dashed.
- **Design input, decided (Owner, 2026-10-05):** `design`, `screens` and `plan-tests` take these as given.
  - Sticky action bar brought back with the tab: it behaves like a bar that was never collapsed, so it again leaves on the way down and returns on the way up. AC-39's "scrolling does not bring it back" holds while the bar is collapsed.
  - A Toast while the bar is collapsed sits above the tab, as it sits above the bar when the bar is visible (base-components AC-30).
  - Experience entries open and close independently, as in the prototype.
- **Design input (not decided here):**
  - How the header follows the hero (AC-33), including the state after returning with the back button at a scrolled position.
  - The look and position of the collapse tab of the Sticky action bar (D-11).

## Screen inventory

Ids match the base-components inventory where the screen is the same.

| ID | Screen | Purpose | Entry | Exit |
|---|---|---|---|---|
| SCR-01 | Home page | Answers who, what role, where and how to reach Alexander; holds the contact place | Direct visit to `/`; the wordmark; "Back to home" on SCR-02; "Contact" and "Get in touch" from any page (opens at the contact section) | The CV address ("View CV", "Full CV"); the mail and phone apps; LinkedIn and GitHub; the contact card and CV downloads; SCR-03 |
| SCR-02 | Not-found page ("Ikke funnet") | Unchanged page content; its Sticky action bar now carries the home pair of actions, and its "Contact" and "Get in touch" reach a real place | Any address the site does not have | "Back to home", "Contact" and "Get in touch" to SCR-01; the CV address; the contact card download; SCR-03 |
| SCR-03 | Mobile menu panel | Phone navigation; "Contact" and "Get in touch" now lead to the contact section | The menu button below 768 on SCR-01, SCR-02 or SCR-04 | A link to its target (the contact section of SCR-01, the CV address); Escape or the close button back to the page |
| SCR-04 | Styleguide | Shows every new component in every state, the Dormant Selected projects section with marked sample data, and the changed Shell samples | Typing its address; nothing links to it | The header and footer links; SCR-03 |

## Flows

### Flow: US-01 — Know who this is at a glance

```mermaid
flowchart TD
    A["Recruiter opens SCR-01 Home page, in Dag or Natt, and has not scrolled"] --> B{"Screen width?"}
    B -->|"below 768, drawn at 390 by 844 (AC-01)"| C["First screen without scrolling: badge 'Open to work' with 'Oslo area', 'Hei.' and 'Oslo, Norge' with the Work region coordinates, the name as the main heading, both roles, the lead, one primary 'View CV', the Now line. Header offers 'Get in touch'. Sticky action bar offers 'View CV' and 'Save contact (.vcf)'"]
    B -->|"768 to 1023"| D["The same hero content, no Sticky action bar, the portrait under the text"]
    B -->|"1024 and wider (AC-02)"| E["The portrait sits beside the text, is announced as an image with the name, and the page does not shift when it loads"]
    C --> P["Below 1024 the portrait sits under the text (AC-02)"]
    C --> N{"Has the Owner supplied a current project?"}
    D --> N
    E --> N
    N -->|"yes"| N1["Now line: 'Nå:', the project, then the MSc (AC-03)"]
    N -->|"no"| N2["Now line: 'Nå:' and only 'MSc Computer Science at Woolf University'. No text in square brackets (AC-03)"]
    C --> J{"Do the Projects pages exist?"}
    D --> J
    E --> J
    J -->|"no, the state in this feature (AC-04)"| J1["'View CV' stands alone, 'See projects' is not offered"]
    J -.->|"yes, owned by step 7"| J2["'See projects' is offered next to 'View CV'"]
    J1 -->|"'View CV'"| V["CV address. Interim IS-01: the English PDF"]
    C -->|"header 'Get in touch'"| K["Contact section of SCR-01 (Flow US-02)"]
    C -->|"a Sticky action bar action"| S["Flow US-14"]
    J1 -->|"scrolls on"| F["Key facts and About (Flow US-04)"]
```

A Recruiter opens the home page and has not scrolled. On a phone (drawn at 390 by 844) the first screen shows, without scrolling, the availability badge, "Hei." and "Oslo, Norge" with the Work region coordinates, the name as the main heading, the two roles, the lead, one primary "View CV" and the Now line; the header offers "Get in touch" and the Sticky action bar offers "View CV" and "Save contact (.vcf)". From 768 the bar is gone; below 1024 the portrait sits under the text and from 1024 it sits beside it, is announced as an image with Alexander's name and does not shift the page. The Now line shows the project first if the Owner supplied one, and only the MSc otherwise, never text in square brackets. Because the Projects pages do not exist, "View CV" stands alone; the dashed branch with "See projects" belongs to step 7. "View CV" leads to the CV address (for now the English PDF), the header's "Get in touch" to the contact section, and scrolling on to the key facts.

### Flow: US-02 — Reach him the way I prefer

```mermaid
flowchart TD
    A["Recruiter scrolls SCR-01 to the contact section"] --> K
    A2["Visitor on any page activates 'Contact' or 'Get in touch' in the header or in SCR-03 (AC-18)"] --> H{"Already on SCR-01?"}
    H -->|"yes"| H1["SCR-03 closes if open, the page moves to the contact section"]
    H -->|"no, for example SCR-02"| H2["SCR-01 opens at the contact section"]
    H1 --> K["Contact section of SCR-01: its heading in view below the header, the menu closed, keyboard focus at the section"]
    H2 --> K
    K --> L["Contact block: 'Get in touch', the lead 'Email is fastest. Phone and LinkedIn work too.', rows for email, phone, LinkedIn, GitHub and 'Based in' with 'Oslo, Norge' (AC-13)"]
    L -->|"email address"| M1["The Visitor's mail app opens a message to Alexander"]
    L -->|"phone number"| M2["The Visitor's phone app opens the number"]
    L -->|"LinkedIn or GitHub"| M3["The profile opens on the other site, in the same tab"]
    L -->|"'Copy' beside the email"| C{"Do scripts run?"}
    C -->|"no (AC-15)"| C1["'Copy' is not offered at all. The address stays a mail link that can be selected"]
    C -->|"yes"| C2{"Does the browser allow clipboard access?"}
    C2 -->|"yes (AC-14)"| C3["The address is on the clipboard. A Toast with a check mark says 'Kopiert' with the address, is announced and leaves by itself. Below 768 it sits above the Sticky action bar, or above its tab when the bar is collapsed"]
    C2 -->|"no (AC-15)"| C4["No confirmation. The Visitor is told to copy the address by hand"]
    L -->|"'Save contact (.vcf)' (AC-16)"| D["The contact card downloads: name, title 'Software Engineer', phone, email, profiles, Work region"]
    L --> Q{"Screen 1024 or wider?"}
    Q -->|"yes (AC-17)"| Q1["QR tile for the current theme with 'Skann meg' and the camera hint. Scanning it with a phone offers the contact"]
    Q -->|"no"| Q2["No QR tile and no hint, the Visitor is holding the phone"]
    L -->|"reads on to the end of the page"| R["Closing band right under the contact section: 'Save contact (.vcf)' and 'Download CV', both secondary, no 'Get in touch' (AC-40)"]
    R -->|"'Save contact (.vcf)'"| D
    R -->|"'Download CV'"| R1["The English CV PDF downloads"]
    R -.->|"other pages with the band, from step 5"| R2["The band keeps 'Get in touch' and 'Download CV'"]
    L --> F["Beside the Contact block, in the place of the page design's Message form: a mail-link sentence, with scripts on or off (interim, see IS-03)"]
    F -->|"the mail link"| M1
```

A Recruiter reaches the contact section by scrolling, or a Visitor on any page activates "Contact" or "Get in touch" in the header or the Mobile menu panel. On the home page the menu closes and the page moves to the section; from another page, such as the Not-found page, the home page opens at it. Either way the section's heading is in view below the header and keyboard focus is at the section. The Contact block shows the heading, the lead and rows for email, phone, LinkedIn, GitHub and "Based in" with "Oslo, Norge". The email opens the mail app, the phone number the phone app, and the profiles open on the other site in the same tab. "Copy" depends on the browser: with scripts off it is not offered and the address stays a selectable mail link; with scripts on and clipboard access, the address is copied and a Toast confirms "Kopiert" with the address, announced, and leaves by itself (on a phone it sits above the Sticky action bar, or above its tab when the bar is collapsed); where clipboard access is refused no confirmation appears and the Visitor is told to copy by hand. "Save contact (.vcf)" downloads the contact card. From 1024 the QR tile with "Skann meg" and the camera hint is shown and scanning it offers the contact; below 1024 neither is shown. At the end of the page the closing band offers "Save contact (.vcf)" and "Download CV" (the English PDF), both secondary and without "Get in touch"; on other pages the band keeps its usual pair (dashed, from step 5). Where the page design draws the Message form, the contact section shows a mail-link sentence, the same with scripts on or off (interim, see IS-03); it opens the mail app like the email row.

### Flow: US-04 — Get the background in numbers and a paragraph

```mermaid
flowchart TD
    A["Visitor scrolls SCR-01 below the hero"] --> B["Key facts: four facts, each with a value, a label and a line of context. Each value is in the page as its final number (AC-05)"]
    B --> C{"Scripts run and motion allowed?"}
    C -->|"yes, the panel first comes into view (AC-06)"| D["Each value counts up once to its final number and stops. Nothing around it moves, assistive technology gets the final number only"]
    C -->|"no: scripts off or reduced motion (AC-06)"| E["The final numbers are simply shown"]
    D --> F["About: 'Frontend-focused, full stack.', the introduction, and four quick facts: 'Based in' Nittedal, Oslo area with the work permit, 'Focus', 'Stack' as plain text, 'Languages' with plain labels (AC-07)"]
    E --> F
    F -->|"reads on"| G["Experience (Flow US-05)"]
```

A Visitor scrolls below the hero and reads the key facts: four facts, each with a value, a label and a line of context, and every value is in the page as its final number. Where scripts run and motion is allowed, each value counts up once when the panel first comes into view and stops, nothing around it moves, and assistive technology is given the final number only; with scripts off or reduced motion the final numbers are simply there. The About section follows with its heading, the introduction and four quick facts: "Based in" with the Residence, the Work region and the work permit, "Focus", "Stack" as plain text, and "Languages" with plain labels. Nothing in these two sections is activated; the Visitor reads on to the experience.

### Flow: US-05 — See where he has worked

```mermaid
flowchart TD
    A["Tech lead reaches the experience section of SCR-01"] --> B["Four entries, each always showing role, organisation and period. The first is open, the other three are closed (AC-08)"]
    B -->|"opens a closed entry, by pointer or keyboard"| C["That entry shows its summary, points and technology tags. Its state is announced"]
    C -->|"closes it again"| D["That entry hides them. Its state is announced"]
    D --> B
    B -->|"scripts off"| E["Every entry can still be opened and closed"]
    B -->|"'Full CV'"| V["CV address. Interim IS-01: the English PDF"]
```

A Tech lead reaches the experience section. It lists four entries; each always shows the role, the organisation and the period, the first is open on arrival and the other three are closed. Opening an entry with a pointer or the keyboard shows its summary, points and technology tags, closing it hides them, and the state is announced each time; entries open and close independently. With scripts off every entry can still be opened and closed. "Full CV" leads to the CV address, which for now answers with the English PDF.

### Flow: US-06 — Hear from people who worked with him

```mermaid
flowchart TD
    A["The page is built from the content"] --> B{"Is there a Recommendation whose author agreed to it being shown?"}
    B -->|"no (AC-10)"| C["A quote without that agreement is omitted, never edited. With none left the section is left out and Contact is section 03, with no gap"]
    B -->|"yes (AC-09)"| D["Tech lead reaches 'From people I've worked with' on SCR-01: each Recommendation with the quote word for word, the person's name and role, and 'On LinkedIn'. Contact carries the next number"]
    D -->|"'On LinkedIn'"| E["Alexander's LinkedIn profile opens, in the same tab"]
    D -->|"reads on"| F["Contact section (Flow US-02)"]
    C --> F
```

Whether a Tech lead meets this section is settled when the page is built. A quote whose author has not agreed to it being shown is omitted and never edited; if no Recommendation remains, the section is left out entirely and the Contact section takes the number 03 with no gap. With at least one Recommendation, the section "From people I've worked with" shows each quote word for word with the person's name and role and an "On LinkedIn" link, which opens Alexander's profile in the same tab, and the Contact section carries the next number.

### Flow: US-07 — See selected projects when there are some

```mermaid
flowchart TD
    A["Visitor reads SCR-01"] --> B{"Do the Projects pages exist and is there a Published project?"}
    B -->|"no, the state in this feature (AC-11)"| C["No Selected projects section, no 'All projects' link, no gap in the section numbers"]
    B -.->|"yes, switched on by step 7"| D["The Selected projects section appears on SCR-01 and its cards lead to real pages"]
    O["Owner types the Styleguide address"] --> S["SCR-04: the Selected projects sample as the page design draws it, with up to three featured projects, the first one large. Each card has a status, a year, a title, a summary, one result with its label, technology tags and links where they exist. The data is marked as sample (AC-12)"]
```

A Visitor reading the home page finds no Selected projects section, no "All projects" link and no gap in the section numbers, because the Projects pages do not exist; this holds whether or not a Published project exists. The dashed branch, where the section appears and its cards lead to real pages, is switched on by step 7. The Owner sees the section today only on the Styleguide: the sample as the page design draws it, up to three featured projects with the first one large, each card with its status, year, title, summary, one result, tags and links, and the data marked as sample.

### Flow: US-09 — Motion I can stop

```mermaid
flowchart TD
    A["Visitor opens SCR-01"] --> B{"Does the device ask for reduced motion?"}
    B -->|"yes (AC-31)"| R["No Ambient motion ever starts and no Motion control is shown. Key facts show final numbers, sections do not slide or count, the hero contours do not follow the pointer and the closing band's contours do not follow scrolling, a change of state is instant or a fade"]
    B -->|"no"| C{"Do scripts run?"}
    C -->|"no"| S["The hero is still and has no Motion control"]
    C -->|"yes"| D{"Was the motion paused earlier in this browser session?"}
    D -->|"no"| E["Hero contour drift and portrait float run. The Motion control offers to pause"]
    D -->|"yes (AC-30)"| P["Both are still. The Motion control offers to play"]
    E -->|"activates the Motion control (AC-30)"| P2["Both stop where they are. The control now offers to play and its state is exposed to assistive technology"]
    P2 --> K{"May the site keep the choice in the browser?"}
    K -->|"yes"| K1["It holds for the rest of the browser session on the home page, also after leaving and coming back, and is gone on a new visit"]
    K -->|"no"| K2["It holds for the current page view"]
    P2 -->|"activates it again"| E
    P -->|"activates it"| E
    A -->|"scrolls the closing band into view, on any page that has it"| Z{"Scroll-tied motion supported and motion allowed?"}
    Z -->|"yes, with scripts on or off (AC-41)"| Z1["The band's contours shift with the scrolling and stand still when it stops. Nothing in the band moves by itself"]
    Z -->|"no"| Z2["The band is still"]
```

A Visitor opens the home page. If the device asks for reduced motion, no Ambient motion ever starts and no Motion control is shown; key facts show final numbers, sections do not slide or count, the hero contours do not follow the pointer and the closing band's contours do not follow scrolling, and a change of state is instant or a fade. Otherwise, with scripts off the hero is still and has no Motion control. With scripts on, the hero contour drift and the portrait float run and the Motion control offers to pause, unless the Visitor paused earlier in this browser session, in which case both are still and the control offers to play. Activating the control stops both where they are, the control then offers to play and exposes its state; activating it again resumes both. Where the browser lets the site keep the choice, it holds for the rest of the browser session on the home page, also after leaving and coming back, and is gone on a new visit; where it does not, it holds for the current page view. Apart from the hero, the closing band's contours shift only while the Visitor scrolls and stand still when they stop, with scripts on or off, where the browser supports motion tied to scrolling and motion is allowed; otherwise the band is still.

### Flow: US-10 — A page that needs no scripts

```mermaid
flowchart TD
    A["Tech lead opens SCR-01"] --> B{"Do scripts run?"}
    B -->|"no (AC-32)"| C["Every section is visible and readable. Every link of the Contact block works and 'Save contact' works. No Ambient motion, no Motion control, no 'Copy'"]
    C --> C2["The rest still works: experience entries open (Flow US-05), the sentence in the place of the Message form is a plain mail link (Flow US-02), the Sticky action bar collapses (Flow US-14), the header keeps its default look (Flow US-11)"]
    B -->|"yes"| D{"Motion allowed?"}
    D -->|"no, reduced motion"| E["Every section is shown at once (AC-31)"]
    D -->|"yes"| F{"How does a section below the hero come into view?"}
    F -->|"already in view when the page opens, or reached through a link to it (AC-36)"| G["It is shown at once"]
    F -->|"scrolled into view for the first time (AC-36)"| H["It fades in once and stays"]
    X["An inline script, an inline style or a script the security policy does not name appears in the page (AC-32)"] --> Y["The browser refuses it. The page stays readable, with no visible step for the Visitor"]
```

A Tech lead opens the home page. With scripts off every section is visible and readable, every link of the Contact block and "Save contact" work, and nothing that needs a script is offered: no Ambient motion, no Motion control and no "Copy". The rest still works: experience entries open, the sentence in the place of the Message form is a plain mail link, the Sticky action bar collapses and the header keeps its default look. With scripts on and reduced motion, every section is shown at once. With scripts on and motion allowed, a section that is already in view when the page opens, or that is reached through a link to it, is shown at once, and a section scrolled into view for the first time fades in once and stays. Separately, if an inline script, an inline style or a script the security policy does not name appears in the page, the browser refuses it and the page stays readable; the Visitor sees no step.

### Flow: US-11 — A header that fits the hero

```mermaid
flowchart TD
    A["Visitor opens SCR-01 at 390, 834 or 1440 wide"] --> B{"Do scripts run?"}
    B -->|"no (AC-33)"| N["The header keeps its default look and a primary 'Get in touch' throughout"]
    B -->|"yes"| T{"Theme?"}
    T -->|"Dag"| D1["While the hero is under the header: the header is on spruce without a border, with a light wordmark and light links. 'Get in touch' is primary at 390 and secondary at 834 and 1440"]
    D1 -->|"scrolls until the hero leaves the area under the header"| D2["The header takes its default look and its border together. 'Get in touch' is primary"]
    D2 -->|"scrolls back over the hero"| D1
    T -->|"Natt"| N1["At the top: the header's usual colours, no border. 'Get in touch' is secondary at 834 and 1440, primary at 390"]
    N1 -->|"scrolls from the top, still over the hero"| N2["The border appears, as on every other page. Colours and 'Get in touch' stay as they are"]
    N2 -->|"scrolls until the hero leaves"| N3["'Get in touch' is primary at every width"]
    N3 -->|"scrolls back over the hero"| N2
    N2 -->|"back at the top"| N1
    A -->|"returns with the back button at a scrolled position (AC-33)"| R["The header is in the state of that position at once, readable at the required contrast"]
    A -->|"anywhere on the page (AC-34)"| P["Never more than two primary buttons on the visible screen, at most one from page content: 'View CV' at the top, none at the contact section or at the end. The Sticky action bar and the closing band hold none"]
    O["Visitor on SCR-02 (D-14)"] --> O1["The header never changes style and 'Get in touch' is always primary. Only the bottom border appears after scrolling. The same primary count holds (AC-34)"]
```

A Visitor opens the home page at 390, 834 or 1440 wide. With scripts off the header keeps its default look and a primary "Get in touch" throughout. With scripts on it follows the page design. In Dag, while the hero is under the header, the header is on spruce without a border, with a light wordmark and light links, and "Get in touch" is primary at 390 and secondary at 834 and 1440; exactly when the hero leaves the area under the header, it takes its default look and its border together and "Get in touch" is primary; scrolling back reverses this. In Natt the header's colours never change: the border appears as soon as the page is scrolled from the top, and "Get in touch" is secondary over the hero and primary after it at 834 and 1440, and primary throughout at 390. Returning with the back button at a scrolled position gives the header the state of that position at once, and it is readable in every state. At any scroll position the visible screen holds at most two primary buttons, at most one of them from page content: "View CV" at the top and none at the contact section or at the end, since the Sticky action bar and the home page's closing band hold none. On the Not-found page the header never changes style, "Get in touch" is always primary and only the bottom border appears after scrolling.

### Flow: US-14 — Useful actions at my thumb, out of the way when I want

```mermaid
flowchart TD
    A["Recruiter opens SCR-01 or SCR-02"] --> B{"Screen below 768?"}
    B -->|"no"| X["No Sticky action bar"]
    B -->|"yes (AC-38)"| C["Sticky action bar with 'View CV' and 'Save contact (.vcf)', both secondary. The page set these actions, the bar itself is not edited"]
    C -->|"'View CV'"| V["CV address. Interim IS-01: the English PDF"]
    C -->|"'Save contact (.vcf)'"| D["The contact card downloads"]
    C -->|"activates the arrow tab, with scripts on or off (AC-39)"| T["The bar collapses and only the tab remains: a target of at least 44 px that never covers the last lines of the page or the focused element. The state is announced and the tab is reachable by keyboard"]
    T -->|"activates the tab again"| C
    T -->|"scrolls up or down"| T2["The bar stays collapsed, scrolling never brings it back (AC-39)"]
    C --> S{"Scripts on and motion allowed?"}
    S -->|"no"| S1["The bar stays in place while the page scrolls"]
    S -->|"yes, the bar is not collapsed, also after it was brought back with the tab"| S2["The bar leaves on the way down and returns on the way up, as in base-components"]
    C -.->|"CV page in step 5, project pages in step 7 (D-10)"| L["Those pages set their own pair of actions"]
    O["Owner on SCR-04"] --> O1["The bar is shown as a sample with the new pair and the collapse tab"]
```

A Recruiter opens the home page or the Not-found page. At 768 and wider there is no Sticky action bar. Below 768 the bar offers "View CV" and "Save contact (.vcf)", both in the secondary style; the page sets these actions and the bar itself is not edited. "View CV" leads to the CV address (for now the English PDF) and "Save contact" downloads the contact card. Activating the bar's small arrow tab, with scripts on or off, collapses the bar so that only the tab remains, at least 44 px, never covering the last lines of the page or the focused element; the state is announced and the tab is reachable by keyboard. While the bar is collapsed, scrolling never brings it back; only the tab does. A bar that is not collapsed, including one brought back with the tab, behaves as in base-components: it stays in place with scripts off or reduced motion, and otherwise leaves on the way down and returns on the way up. The CV page (step 5) and the project pages (step 7) set their own pairs (dashed). The Owner sees the bar with the new pair and the tab as a sample on the Styleguide.

### Out of scope (no human-facing UI flow)

- **US-08 — Recognise the page before opening it:** the title, description, preview card and structured data are read by search engines and other apps; the Recruiter sees them outside the site and there is no screen to move through.
- **US-12 — Facts that stay true:** the Owner works in the repository, CI and the pull request (contact source check, placeholder check, Claims list, parity suite). The visible results are the Contact block (Flow US-02), the Now line (Flow US-01) and the Recommendations (Flow US-06).

## AC coverage

| AC | Shown by | Notes |
|---|---|---|
| AC-01 | Flow US-01, branch `below 768, drawn at 390 by 844 (AC-01)` | The box measurement is an e2e check |
| AC-02 | Flow US-01, branch `1024 and wider (AC-02)` and node "Below 1024 the portrait sits under the text" | |
| AC-03 | Flow US-01, both branches of "Has the Owner supplied a current project?" | |
| AC-04 | Flow US-01, branch `no, the state in this feature (AC-04)` | The `yes` branch is dashed: step 7 owns it |
| AC-05 | Flow US-04, node "Key facts" | The overlap with the hero edge is layout, detailed in `screens` |
| AC-06 | Flow US-04, both branches of "Scripts run and motion allowed?" | |
| AC-07 | Flow US-04, node "About" | |
| AC-08 | Flow US-05, whole flow | Scripts-off branch included |
| AC-09 | Flow US-06, branch `yes (AC-09)` | |
| AC-10 | Flow US-06, branch `no (AC-10)` | Decided when the page is built |
| AC-11 | Flow US-07, branch `no, the state in this feature (AC-11)` | The `yes` branch is dashed: step 7 owns it |
| AC-12 | Flow US-07, node "SCR-04" | |
| AC-13 | Flow US-02, node "Contact block" and the email, phone and profile branches | |
| AC-14 | Flow US-02, branch `yes (AC-14)` of "Does the browser allow clipboard access?" | The Toast above the bar is base-components AC-30; above the tab when the bar is collapsed (Owner decision) |
| AC-15 | Flow US-02, branch `no (AC-15)` of "Do scripts run?" and branch `no (AC-15)` of "Does the browser allow clipboard access?" | |
| AC-16 | Flow US-02, branch `'Save contact (.vcf)' (AC-16)` | Also reached from the closing band and from Flow US-14 |
| AC-17 | Flow US-02, both branches of "Screen 1024 or wider?" | |
| AC-18 | Flow US-02, node "Visitor on any page activates 'Contact' or 'Get in touch'" and both branches of "Already on SCR-01?" | SCR-02 and SCR-03 are the other entry points |
| AC-26 | N/A: head meta and structured data, read by search engines and apps, no screen of the site | US-08 out of scope here |
| AC-27 | N/A: build-time contact source check, Owner in CI | Visible result: Flow US-02 and Flow US-01 |
| AC-28 | N/A: build-time placeholder check, Owner in CI | Visible result: Flow US-01, Now line branches |
| AC-29 | N/A: Claims list in the pull request, no screen of the site | US-12 out of scope here |
| AC-30 | Flow US-09, branches `activates the Motion control (AC-30)`, `activates it again`, `yes (AC-30)` and both branches of "May the site keep the choice in the browser?" | |
| AC-31 | Flow US-09, branch `yes (AC-31)`; Flow US-10, branch `no, reduced motion` | Also Flow US-04, branch `no: scripts off or reduced motion` |
| AC-32 | Flow US-10, branch `no (AC-32)` and nodes from "An inline script, an inline style or a script the security policy does not name" | The refusal has no visible step; e2e in `plan-tests` |
| AC-33 | Flow US-11, branches `no (AC-33)`, `Dag`, `Natt` and `returns with the back button at a scrolled position (AC-33)` | The 3 widths × 2 themes × 3 positions are test cases for `plan-tests` |
| AC-34 | Flow US-11, node "Never more than two primary buttons on the visible screen" and node for SCR-02 | The count itself is an e2e check |
| AC-35 | N/A: the parity suite runs in CI | The six behaviours are drawn in Flows US-01, US-02 and US-14 |
| AC-36 | Flow US-10, both branches of "How does a section below the hero come into view?" | |
| AC-38 | Flow US-14, branch `yes (AC-38)` with the `'View CV'` and `'Save contact (.vcf)'` branches | On SCR-01 and SCR-02 |
| AC-39 | Flow US-14, branch `activates the arrow tab, with scripts on or off (AC-39)`, then `activates the tab again` and `scrolls up or down` | A bar brought back with the tab scrolls like a normal bar (Owner decision) |
| AC-40 | Flow US-02, node "Closing band right under the contact section" and its branches | Other pages: dashed, from step 5 |
| AC-41 | Flow US-09, both branches of "Scroll-tied motion supported and motion allowed?" | In this feature only SCR-01 shows the band |
