---
status: draft            # draft | approved
feature_size: "S"
tool: "code"             # copied from docs/design-system.md
updated_at: "2026-10-09"
---

# Screens — cv

> The canonical **screen manifest** — every screen in every state — produced by `screens` (between
> `api` and `tasks`) and read by `tasks` (each `ui` task cites SCR ids + states), `implement`
> (builds the screen to the declared states) and `review` (the built screen must match this).
> Downstream stages reference **only this manifest** — never the raw design files.

## Source

- **Tool:** code (from `docs/design-system.md`).
- **File:** inline wireframes below.
- **Page designs (primary reference):**
  - SCR-05 and SCR-06: `design/handoff/site/project/site/Cv.jsx` (`Cv`, `CvJob`), with `data.js` (`cv.en`, `cv.no`: copy and labels), `ext.jsx` (`BackToTop`), `App.jsx` (closing band) and `site.css` (`.x-head`, `.x-cvbar*`, `.x-pdf*`, `.x-cvgrid`, `.x-cvmain`, `.x-cvsec`, `.x-job*`, `.x-cvlist*`, `.x-rows*`, `.x-cvside`, `.x-toc`, `.x-top`, `@media print`). Screenshots `design/screenshots/{dag,natt}_cv.png` (1440, English). For 390 and 834, for the Norwegian page and for the open preview, use `design/handoff/site/alpon.dev standalone.html`.
  - SCR-01 to SCR-04: unchanged page designs, see `docs/features/home/screens.md` §Source and `docs/features/base-components/screens.md` §Source.
- **Component references (secondary, building blocks):** the site copy of the design system, `design/handoff/site/project/_ds/…/components/{actions,cv,navigation}/*.css` (`.fj-crumbs`, `.fj-seg`, `.fj-skills`, `.fj-langs`, the ghost button).
- **Inventory:** `docs/design-system.md` §Component inventory. The manifest uses inventory names. Where the repo file gets a different name (sad.md §5), it is given once here:

  | Inventory name | Repo component (sad.md §5) |
  |---|---|
  | Breadcrumbs | `ui/Breadcrumbs` |
  | SegmentedControl (its look, as two links) | NEW: LangSwitch, `ui/LangSwitch` |
  | SkillGroup | `cv/SkillGroup` |
  | LanguageList | `cv/LanguageList` |
  | ContactList, CopyButton | inside `cv/CvAside` (second consumer; the home one stays in `home/ContactBlock`) |
  | MobileBar (Sticky action bar) | `layout/MobileBar` |
  | Link | `ui/Link` |

  `cv/CvPage`, `cv/CvHead`, `cv/CvSection`, `cv/CvProjects` and `cv/CvAside` are page sections: compositions of inventory names and of the components in §New components, not inventory components.
- **Base manifests:** `docs/features/base-components/screens.md` (§Shell states, SCR-02, SCR-03, SCR-04) as changed by `docs/features/home/screens.md` (§Shell state changes, SCR-01 to SCR-04). Both stay valid except where §Shell state changes and the screen sections below replace or add a row. Rows are cited by state name and are not copied.
- **Differences from the page design** are not repeated here; they are spec §1.3 D-01 to D-10 and are cited by ID.
- **Derivation:** there is no API contract (static site, sad.md §6 "Flagged by the flows" item 5), so every state below comes from a spec §5 AC or a sad.md §6 branch. The decisions of §Decided at this stage were taken with the Owner on 2026-10-09; C-1 and C-4 changed the wording of spec AC-02, AC-04 and AC-23 the same day.

### Shell state changes (apply to every page for Visitors unless a row says otherwise)

These rows replace or add to §Shell states of the base manifest as changed by the home manifest. Every other Shell state is unchanged.

| State | Trigger / condition | What the Visitor sees | Components | Source |
|---|---|---|---|---|
| header-current, CV (now on real pages) | SCR-05 and SCR-06 set `current="cv"` | "CV" in the header has `aria-current="page"` and the underline marker of the page design. On SCR-01 and SCR-02 no link is marked | Header | AC-20; sad.md §8 Current page |
| header CV link | Any page | From SCR-01, SCR-02 and SCR-04 "CV" leads to the English CV page. On a CV page it leads to the CV page of the CV language being read, so activating it loads the same page at its top | Header | AC-16; sad.md §6 Reach the CV, branch `on a CV page` |
| header on a CV page | SCR-05, SCR-06, any scroll position | Default header, never over-hero; "Get in touch" is primary and English at every width; the bottom border appears after scrolling | Header, Button (primary) | AC-06; home `header-cta-primary` |
| Shell language on SCR-06 | The page sets `lang: 'no'` | Every Shell part (skip link, header, menu panel, closing band, footer, bar frame and its tab, BackToTop, Toast region) is marked English; the page content is Norwegian. The two bar actions and a Toast message the page sends are marked Norwegian | BaseLayout | AC-02; sad.md §8 Internationalisation |
| cta-band on a CV page | End of SCR-05 and SCR-06 | The default pair: primary "Get in touch" (to the contact place of SCR-01) and secondary "Download CV", which saves the CV PDF in the CV language of the page. Both labels English on both pages | CtaBand, Button ×2 | AC-16; home `cta-band` |
| bar-open on a CV page (page pair) | SCR-05, SCR-06 below 768 | The bar's two slots are the language switch (start side, its own width, centred vertically) and "Download PDF" with the `file-down` icon ("Last ned PDF" on SCR-06), both secondary. The tab, collapse, restore, clearance and bar-away rules are the home ones | MobileBar, NEW: LangSwitch, Button (secondary), Icon (`file-down`) | AC-19, D-05; sad.md §6 Sticky action bar on a CV page; wireframe W-5 |
| back-to-top absent | Screen below 768, any page | No BackToTop: that corner belongs to the Sticky action bar | — | AC-22, D-07 |
| back-to-top hidden at the top | Screen 768 or wider, the browser can tie appearance to scrolling, page at its top | BackToTop is not visible, not focusable and not announced | NEW: BackToTop | AC-21; sad.md §6 BackToTop |
| back-to-top shown | Same, the Visitor has scrolled down (the page design shows it after one and a half screens) | A round 44 × 44 control with the `arrow-up` icon on a raised surface with the float shadow, fixed at the bottom end corner; name "Back to top". With motion allowed it fades and rises in; with reduced motion it appears without movement | NEW: BackToTop, Icon (`arrow-up`) | AC-21; wireframe W-6 |
| back-to-top always shown | Screen 768 or wider, the browser cannot tie appearance to scrolling | Visible all the time, also at the top of the page | NEW: BackToTop | AC-21 |
| back-to-top activated | Pointer or keyboard, scripts on or off | The page is at its top and keyboard focus starts again from the start of the page (the next Tab reaches the skip link) | NEW: BackToTop | AC-21 |
| back-to-top clearance | Screen 768 or wider, end of the page, focus on the last link of the footer | BackToTop covers no part of the last line and no part of the focused element: its space is reserved by a block at the end of the page and by `scroll-padding-bottom`, as for the bar | BaseLayout, NEW: BackToTop | AC-22; sad.md §8 BackToTop |
| back-to-top left out | SCR-04 (`backToTop: false`) | No fixed BackToTop; it is shown as a sample in its section | — | sad.md §5 Page options |
| print | Any page is printed | The light colours from either theme (the Print block). Only the CV pages have print styles of their own, see SCR-05 `print` | — | AC-12; ADR-0002 |

```text
W-6  BackToTop at 834 / 1440 — shown, and at the end of the page
+----------------------------------------------------+   +----------------------------------------------------+
|  page content                                      |   |  footer                                            |
|                                                    |   |  © 2026 Alexander Ponomarenko   Sist oppdatert …   |
|                                              (↑)   |   |  ... reserved block ...                      (↑)   |
+----------------------------------------------------+   +----------------------------------------------------+
  a link, 44 × 44, fixed; focus ring visible               the last line and the focused link stay clear
```

## Screens

### SCR-05 — English CV page

The whole page design, content first. Addresses: the short CV address and the English CV address (same page; the short one names the English address as canonical). Page options: `lang: 'en'`, `cvLang: 'en'`, `current: 'cv'`, `canonical`, `alternates`, `mobileBarActions` = language switch and "Download PDF", default closing band. Parts in order: CV head, Original PDF preview control, the numbered sections, the side column (from 1024), closing band, footer. Visual baseline at 390 / 834 / 1440 × Dag / Natt with the preview closed and open; Design match compares with `design/screenshots/{dag,natt}_cv.png`, differences limited to D-01 to D-10.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | The short CV address, the English CV address, any CV link of the Shell or SCR-01, "EN" on SCR-06, the English Legacy CV address; scripts on, Dag or Natt | BaseLayout, SkipLink, Header (current CV), Breadcrumbs, `h1`, NEW: LangSwitch, Button ×3 (primary, secondary, ghost), `<details>` with Button look (ghost, small), SectionHeader ×8, SkillGroup, LanguageList, NEW: CvJob, Tag, Link (external), NEW: DatedRows, NEW: ContentsList, ContactList, CopyButton, CtaBand, Footer, MobileBar (below 768), NEW: BackToTop (from 768), Toast region | wireframes W-1, W-2 |
| head | Always | Breadcrumbs "alpon.dev / CV": "alpon.dev" is a link to SCR-01, "CV" is the current item. `h1` "Alexander Ponomarenko". Role line in the link colour. Location line, mono and muted: "1482 Nittedal, Norway · Norwegian work permit". Tools: the language switch (large), then a row with "Download PDF" (primary, `file-down`, `download`), "Get in touch" (secondary, to the contact place of SCR-01) and "Print" (ghost, `file-text`), then the meta line. One primary button in the page content, this one | Breadcrumbs, NEW: LangSwitch, Button ×3, Icon | AC-01, AC-05, AC-06, D-01; W-1, W-2 |
| head, below 1024 | Screen below 1024 | The tools follow the name block and are aligned to the start; the button row wraps | — | page design `.x-cvbar`, `.x-cvbar__tools` |
| head, 1024 and wider | Screen at least 1024 | Name block at the start, tools at the end side, aligned to the end and to the bottom of the name block | — | page design `.x-cvbar`; W-2 |
| meta line | Always, in the head and again under the open preview | "Last updated", the CV date in a `<time>`, then "PDF · 2 pages · A4"; mono, muted. The CV date is not the footer date | — | AC-05, D-08 |
| language switch | Always; in the head (large) and in the bar | Two links in one pill, "EN" and "NO", group name "CV language". "EN" is filled and has `aria-current="true"`; "NO" is marked Norwegian. Each link has a 44 × 44 target around the drawn segment (C-7) | NEW: LangSwitch | AC-07; sad.md §8 Language switch, Current page |
| language switch, other language, scripts off | "NO" is activated | SCR-06 opens at its top | NEW: LangSwitch | AC-07; sad.md §6 Critical flow 1 `scripts are off` |
| language switch, other language, section in view | Scripts on, the switch of the bar (below 768), a section both pages have is in view at the activation | SCR-06 opens at the same section: heading clear of the header, keyboard focus at the section. One press of Back returns here | NEW: LangSwitch | AC-08; ADR-0001; Critical flow 1 `the Norwegian page has that section` |
| language switch, other language, no section | Scripts on, the switch of the bar, the Visitor is above the first section at the activation, or SCR-06 has no such section | SCR-06 opens at its top | NEW: LangSwitch | AC-08; Critical flow 1 `no such section`; Sticky action bar flow `above the first section` |
| language switch, other language, from the CV head | Scripts on, the switch of the CV head, which is on screen only above the first section | SCR-06 opens at the scroll position the Visitor had, already there at its first paint, with no fragment and no move of focus; at the top if that position is not above its first section. One press of Back returns here | NEW: LangSwitch | AC-08; ADR-0001 (amended) |
| language switch, current language | "EN" is activated | Scripts on: nothing changes, no reload and no jump. Scripts off: the same page opens at its top | NEW: LangSwitch | sad.md §1 overrides; Sticky action bar flow `the language already shown` |
| arrived at a section | The address carries the id of a CV section this page has (from the switch, a link of "On this page", or a typed address) | That section's heading is in view below the header. With scripts on keyboard focus is at the section; the section is shown at once | NEW: ContentsList | AC-04, AC-08; `src/scripts/cv/arrive.ts` |
| arrived with an unknown fragment | The address carries anything else | The page opens at its top; nothing is focused, nothing is reported | — | AC-08; spec §6.1 |
| preview closed | On arrival | Under the head: one control "View original PDF" (ghost, small, `eye` icon). No page image has been requested | `<details>` summary with the Button look, Icon (`eye`) | AC-09; W-1 |
| preview open | The control is activated, scripts on or off | The control shows the `x` icon and the platform announces the expanded state. Under it a group named "View original PDF": two page images side by side at every width (two equal columns, at most 720 wide), each on the paper ground with a border, A4 proportion, width and height reserved; under them the meta line. With motion allowed the group rises in; with reduced motion it only fades | NEW: OriginalPdfPreview, Icon (`x`) | AC-09, D-03; wireframe W-3 |
| page image link | Preview open | Each image is one link that opens the English CV PDF in a new tab. Its name is the image's text alternative: "CV page 1 of 2, English, PDF, opens in a new tab" and "CV page 2 of 2, English, PDF, opens in a new tab". The CV page stays open in its tab. Focus ring around the whole page image | NEW: OriginalPdfPreview | AC-09; sad.md §6 Original PDF preview |
| page image failed (error) | Preview open, a page image cannot be loaded | The link is still there with its name and still opens the CV PDF. Its box keeps the reserved size on the paper ground with the border and shows the name as text (C-8). No embedded PDF. The other image is not affected | NEW: OriginalPdfPreview | AC-10; sad.md §6 Original PDF preview `the image cannot be loaded` |
| preview closed again | The control is activated again | The group is hidden, the `eye` icon is back, the collapsed state is announced | NEW: OriginalPdfPreview | AC-09 |
| sections | Always | Eight sections, each a SectionHeader (small) with its number and an `h2`: 01 Profile, 02 Skills, 03 Languages, 04 Work experience, 05 Personal projects, 06 Education, 07 Courses, 08 Community & volunteering. Ids as sad.md §5 "Section ids". One column at every width; from 1024 it takes 8 of 12 parts | SectionHeader | AC-01; W-1, W-2 |
| profile | Always | One paragraph at the reading measure | — (C-9) | AC-01 |
| skills | Always | Six SkillGroups, each a mono label (`h3`) and its skills as one line of text; one column below 768, two from 768. No logos, bars or percentages | SkillGroup | AC-01, AC-03 |
| languages | Always | Three rows with hairlines: language (strong) and its level at the end side: "English / Upper-intermediate", "Norwegian / Intermediate", "Ukrainian / Native". No level codes | LanguageList | AC-01, AC-03 |
| work experience | Always | Jobs on a timeline rail with a marker each; the first job has the filled marker. Each job: role (`h3`), organisation (strong) with its note, period (mono, at the end side from where it fits, under the heading otherwise). Then, as the CV PDF has them: client projects (`h4`, paragraph, "Applied technologies" with Tags), "Internal projects" (eyebrow, then `h4` and paragraph each), or paragraphs. The client and its events are described as the CV PDF describes them | NEW: CvJob, Tag | AC-01, AC-03; W-2 |
| personal projects | Always | The note "Backend practice alongside frontend work" (muted), then each project between hairlines: title (`h3`) with its stack (mono, muted), paragraph, and the code link as an external Link (mono, new tab, arrow icon, hidden hint) | Link (external) | AC-01; home D-09 |
| education, courses | Always | Dated rows with hairlines: the period (mono, muted; a second line for place or mode) in a 128 px column from 768 and above the entry below 768; title (strong), organisation (muted), optional note (mono, small). Norwegian names inside a row are marked Norwegian | NEW: DatedRows | AC-01 |
| community | Always | A plain list of three items | — (C-9) | AC-01 |
| side column, 1024 and wider | Screen at least 1024 | Beside the sections (4 of 12 parts), sticky under the header: "On this page" (eyebrow) with a numbered link to each of the eight sections, 44 px rows with hairlines; "Contact" (eyebrow) with the ContactList rows Email (mail link, "Copy"), Phone (call link), LinkedIn and GitHub (short addresses, external, new tab), Based in "Nittedal, Norge" (marked Norwegian); "Download PDF" (secondary, full width, `file-down`, `download`). No contact card, no QR | NEW: ContentsList, ContactList, CopyButton, Button (secondary), Link | AC-04, D-01; W-2 |
| side column, below 1024 | Screen below 1024 | Not displayed, as in the page design (C-1). The contact routes of the page at these widths are "Get in touch" in the head, the closing band and the footer; the download is in the head, the bar and the closing band | — | AC-04; page design `.x-cvside` |
| contents link activated | A link of "On this page" | The page moves to that section, heading clear of the header; state `arrived at a section` | NEW: ContentsList | AC-04 |
| copy offered / success / refused / not offered | Side column, as on SCR-01 | The four states of home SCR-01 (`copy offered`, `copy success`, `copy refused`, `copy not offered`), with the same module: "Copy", then "Copied" in the button and in the Toast with the address, in English; the refusal Toast; no "Copy" with scripts off | CopyButton, Toast | AC-04, AC-23; home AC-14, AC-15; sad.md §6 Open and read a CV page |
| download | "Download PDF" in the head, the side column or the bar, or "Download CV" in the band | The browser saves "Alexander_Ponomarenko_CV_EN.pdf". Nothing opens; the Visitor stays where they were | Button (`download`) | AC-05, AC-16, AC-19; sad.md §6 Take the file |
| print offered | Scripts on | "Print" in the head, ghost; activating it opens the browser's print dialog | Button (ghost), Icon (`file-text`) | AC-11; sad.md §6 Print the CV page |
| print not offered | Scripts off, or the page script did not load | "Print" is not displayed and leaves no gap | — | AC-11, D-04 |
| print (document) | Printed by "Print" or from the browser's menu, from Dag or Natt | Dark text on a white sheet, no dark fills, the same from both themes. In order: the name, the role line, the location line, one contact line with email, phone, LinkedIn and GitHub, then every section. Not printed: header, menu panel, breadcrumbs, language switch, the three buttons, the meta line, the preview and its control, the side column, the bar, BackToTop, the closing band, the footer. No job, project, education or course entry is split across sheets; no section heading is left alone at the foot of a sheet; links to other sites show their address as text. The theme on screen does not change | NEW: PrintContactLine | AC-11, AC-12, D-04; ADR-0002; wireframe W-4 |
| contact line on screen | Any screen state | Not displayed and not announced | NEW: PrintContactLine | AC-11 |
| bar on this page | Below 768 | §Shell state changes `bar-open on a CV page`; the switch behaves as the four `language switch` states above, the download as `download`; bar-collapsed and bar-restored as on SCR-01 | MobileBar | AC-19; W-5 |
| primary count | 390 / 834 / 1440, at the top, in the middle, at the end | At most two primary buttons on the visible screen: the header's "Get in touch" and, while the head is in view, its "Download PDF". At the end the band's "Get in touch" is the same Shell action as the header's. None in the bar | — | AC-06 |
| no-script | Scripts off | Every section, the language switch (two links), the three downloads, the preview, the side column's contents list and contact links (from 1024), the closing band and the footer work. Not displayed: "Print", "Copy", the theme switch, the menu button. The switch opens the other page at its top | — | AC-23; base `no-script` |
| reduced-motion | `prefers-reduced-motion: reduce` | The preview opens with a fade only; BackToTop appears without movement; moving to a section is instant; the bar and the Toast as on SCR-01 | — | AC-21; base `reduced-motion` |
| Dag / Natt | Theme | The page in that theme. The page images stay on the paper ground in both; the filled segment of the switch and the filled job marker use the theme's text and link colours | — | AC-24; `natt_cv.png` |
| Shell states | Base manifest §Shell states with the home changes and §Shell state changes above | as there | W-5, W-6 |
| interactive states | Hover, focus, pressed on any control of the page content | As base `interactive states`. Breadcrumb link: link colour and underline on hover. Switch segment, contents link and ghost Button: text colour change on hover. Every target at least 44 × 44 at 390, with the preview closed and open | — | AC-24; spec §6 Touch targets |
| loading | N/A: static HTML, no client data fetch. The page images load into reserved space after the preview is opened | — | repo ADR-0001; AC-09 |
| empty | N/A: fixed content from the CV data. A section the CV PDF does not have is not rendered and the numbers have no gap; a bracketed placeholder fails the build | — | AC-02, AC-03 |
| validation | N/A: the page takes no input | — | spec §6.1 |
| error (page level) | N/A: the run-time failures are `page image failed` and the copy refusal (above). A changed CV PDF or a contact mismatch fails the gate, it is never rendered | — | AC-25, AC-27 |

**Content.** Copy comes from the CV data (`src/data/cv/en.ts`), written from `design/handoff/site/project/site/data.js` (`cv.en`) after the comparison with the English CV PDF (spec §1 "Content source"); contact facts come from `src/data/contact.ts`. The texts in the wireframes are the design's and stand for whatever the confirmed CV data holds. Headings: one `h1`; `h2` per section and in the closing band; `h3` for a job, a personal project and a skill group; `h4` for a client or internal project. "On this page" and "Contact" in the side column are eyebrows inside a named `nav` and a group, not headings.

```text
W-1  SCR-05 at 390 — top of the page, preview closed, Dag
+--------------------------------------+
| alpon.dev        [ Get in touch ] [≡]|  default header, primary
|--------------------------------------|
| alpon.dev / CV                       |  Breadcrumbs, mono
| Alexander                            |
| Ponomarenko                    (h1)  |
| Frontend Developer · Backend Exp…    |  role line, link colour
| 1482 Nittedal, Norway · Norwegian    |  mono, muted
| work permit                          |
| ( EN | NO )                          |  LangSwitch, large; EN filled
| [ ⇩ Download PDF ] ( Get in touch )  |  primary, secondary
| ▤ Print                              |  ghost; not displayed with scripts off
| Last updated 2026-09-30 · PDF · 2    |  meta line
| pages · A4                           |
| ◉ View original PDF                  |  ghost, small; <details> summary
|                                      |
| 01                                   |
| Profile                        (h2)  |
| paragraph                     +----+ |
+===============================+ ⌄  +=+  bar-open (W-5)
| ( EN | NO )      [ ⇩ Download PDF  ] |
+--------------------------------------+
  below, in order: 02 Skills (one column) · 03 Languages · 04 Work experience ·
  05 Personal projects · 06 Education · 07 Courses (period above each entry) ·
  08 Community & volunteering · closing band · footer · clearance to the tab
  no side column below 1024; no BackToTop below 768
  834: header-wide with CV underlined, skills in two columns, dated rows with the
  128 px period column, no bar, BackToTop after scrolling
```

```text
W-2  SCR-05 at 1440 — head, sections and side column, Dag
+--------------------------------------------------------------------------------+
| alpon.dev    CV   Contact                    ( Light | Dark )  [ Get in touch → ]|
|              ‾‾                                                                 |  CV: aria-current, underline
| alpon.dev / CV                                                                 |
| Alexander Ponomarenko                  (h1)                        ( EN | NO ) |
| Frontend Developer · Backend Experience   [ ⇩ Download PDF ] ( Get in touch ) ▤ Print |
| 1482 Nittedal, Norway · Norwegian work permit   Last updated 2026-09-30 · PDF · 2 pages · A4 |
| ◉ View original PDF                                                            |
|                                                                                |
| 01                                              | On this page                 |
| Profile                                   (h2)  | ---------------------------- |
| paragraph                                       | 01  Profile                  |
|                                                 | 02  Skills                   |
| 02                                              | …                            |
| Skills                                          | 08  Community & volunteering |
| Frontend            | Backend                   |                              |
| React, Next.js, …   | Python, FastAPI, …        | Contact                      |
| Web & APIs          | Architecture & Quality    | Email     ponomaleks@…  [⧉ Copy]
| …                   | …                         | Phone     +47 405 94 584     |
|                                                 | LinkedIn  linkedin.com/in/…  |
| 03  Languages                                   | GitHub    github.com/…       |
| English                     Upper-intermediate  | Based in  Nittedal, Norge    |
| Norwegian                         Intermediate  |                              |
| Ukrainian                               Native  | ( ⇩ Download PDF           ) |  secondary, block (D-01)
|                                                 |   sticky under the header    |
| 04  Work experience                             |
| ● Software Engineer (Consultant)   (h3)   Nov 2022 – Jan 2026
| │ EPAM Systems · Global digital engineering company, …
| │ --------------------------------------------
| │ SaaS Customization                      (h4)
| │ paragraph
| │ Applied technologies  [JavaScript] [LESS] [RainFocus] [Webpack]
| │ --------------------------------------------   … more client projects
| │ Internal projects                  (eyebrow)
| │ EPAM IT Marathons (2023 – 2025)         (h4)   paragraph
| ○ Agency Group Manager / Insurance Specialist    Dec 2010 – Nov 2021
| │ Universalna Insurance Company (…) · Ukraine     paragraphs
|
| 05  Personal projects    Backend practice alongside frontend work
| Async Contacts REST API   FastAPI, PostgreSQL, Docker
| paragraph      github.com/Ponomaleks/fastapi-contacts-api ↗
|
| 06  Education                         07  Courses (same rows)
| 2025 –     MSc in Computer Science: Software Engineering and AI
| online     Woolf University, Malta
| 2004 – 2009  Master’s Degree in Process Automation and Control
| Ukraine      Ukrainian State University of Chemical Technology
|              Recognized in Norway as equivalent to …      (note, mono)
|
| 08  Community & volunteering      • … • … • …
|████ closing band: [ Get in touch → ] ( Download CV ) ████|                (↑)   BackToTop (W-6)
| footer
  sections 8 parts, side column 4 parts
```

```text
W-3  Original PDF preview — open (same at every width; 390 shown)
| ✕ View original PDF                  |  expanded state announced
| +----------------+ +----------------+|  group "View original PDF"
| |                | |                ||  two equal columns, max 720 wide
| |  page image 1  | |  page image 2  ||  A4 proportion, paper ground, border
| |  (link, new    | |  (link, new    ||  name = text alternative:
| |   tab)         | |   tab)         ||  "CV page 1 of 2, English, PDF,
| +----------------+ +----------------+|   opens in a new tab"
| PDF · 2 pages · A4 with the CV date  |  the meta line
  page image failed: the same box, paper ground and border, the name as text
```

```text
W-4  Printed document (A4, from Dag or Natt)
+----------------------------------------------+
| Alexander Ponomarenko                        |
| Frontend Developer · Backend Experience      |
| 1482 Nittedal, Norway · Norwegian work permit|
| ponomaleks@gmail.com · +47 405 94 584 ·      |  contact line: print only
| linkedin.com/in/ponomalex · github.com/…     |
| 01 Profile …                                 |
| 02 Skills …   03 Languages …                 |
| 04 Work experience … (entries kept whole)    |
| … 08 Community & volunteering                |
+----------------------------------------------+
  white sheet, dark text; no Shell part, no control, no side column, no meta line
  code links print their address as text
```

```text
W-5  Sticky action bar on a CV page at 390 — SCR-05 and SCR-06
+===============================+ ⌄  +=+   +===============================+ ⌄  +=+
| ( EN | NO )      [ ⇩ Download PDF  ] |   | ( EN | NO )      [ ⇩ Last ned PDF  ] |
+--------------------------------------+   +--------------------------------------+
  EN filled, NO marked Norwegian              NO filled; both actions marked Norwegian
  switch: default size, 44 × 44 targets; download: secondary, never primary (D-05)
  tab name "Quick actions" stays English on both pages
```

### SCR-06 — Norwegian CV page

Delta against SCR-05. The layout, the components and every state not listed here are as on SCR-05, with the Norwegian CV PDF and file name in place of the English ones. Address: the Norwegian CV address. Page options: `lang: 'no'`, `cvLang: 'no'`, otherwise as SCR-05. Visual baseline as SCR-05.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | The Norwegian CV address, "NO" on SCR-05, the Norwegian Legacy CV address | as SCR-05 `default`; the page is marked Norwegian, the Shell English | AC-02; §Shell state changes `Shell language on SCR-06` |
| head | Always | Breadcrumbs "alpon.dev / CV". Role line and location line as the Norwegian CV PDF has them. Switch group name "CV-språk", "NO" filled with `aria-current="true"`. Buttons "Last ned PDF" (primary), "Ta kontakt" (secondary, to the contact place of SCR-01), "Skriv ut" (ghost). Meta line "Sist oppdatert", the same CV date, "PDF · 2 sider · A4". The header's and the band's "Get in touch" stay English | Breadcrumbs, NEW: LangSwitch, Button ×3 | AC-02, AC-05, AC-06, D-10 |
| sections | Always | The sections the Norwegian CV PDF has, numbered in the order shown with no gap, with the shared ids. Headings: Profil, Kompetanse, Språk, Arbeidserfaring, Personlige prosjekter, Utdanning, Kurs, Frivillig arbeid. Labels inside: "Teknologier", "Interne prosjekter"; no note above the personal projects | SectionHeader | AC-02, D-06 |
| languages | Always | "Engelsk / Øvre mellomnivå", "Norsk / Mellomnivå", "Ukrainsk / Morsmål" | LanguageList | AC-03 |
| preview | As SCR-05 | Control and group name "Se original-PDF". Page images of the Norwegian CV PDF; link names "CV, side 1 av 2, norsk, PDF, åpnes i ny fane" and "CV, side 2 av 2, norsk, PDF, åpnes i ny fane" (C-3). The links open the Norwegian CV PDF | NEW: OriginalPdfPreview | AC-09, AC-10 |
| side column, 1024 and wider | Screen at least 1024 | "På denne siden" with the Norwegian headings; "Kontakt" with the row labels "E-post", "Telefon", "LinkedIn", "GitHub", "Bosted" (C-3); "Last ned PDF" (secondary) | NEW: ContentsList, ContactList, Button | AC-02, AC-04 |
| copy offered / success / not offered | Side column, from 1024 | The button says "Kopier"; after a copy it shows "Kopiert" and the Toast says "Kopiert" with the address. The Toast message is marked Norwegian inside the English Toast region (C-4) | CopyButton, Toast | AC-02, AC-04 |
| copy refused (error) | The browser refuses the clipboard write | Toast without the check icon, in Norwegian (wording in C-3, to be confirmed). The address stays a selectable mail link | CopyButton, Toast | home AC-15 |
| language switch | As SCR-05, mirrored | "EN" opens SCR-05 with the four behaviours of SCR-05; "NO" is the current language | NEW: LangSwitch | AC-07, AC-08 |
| download | Any download of this page | The browser saves "Alexander_Ponomarenko_CV_NO.pdf" | Button (`download`) | AC-05, AC-16, AC-19 |
| header and menu CV link | "CV" in the header or SCR-03 | Leads to this page, not to SCR-05 | Header, MobileMenu | AC-16 |
| bar on this page | Below 768 | The switch and "Last ned PDF", both marked Norwegian; the bar's frame and tab stay English | MobileBar | AC-19; W-5 |
| print (document) | As SCR-05 | The same document with the Norwegian content; the contact line is the same four facts | NEW: PrintContactLine | AC-11, AC-12 |
| section missing on the other page | "EN" or "NO" with a section in view that the other page lacks | The other page opens at its top | — | AC-08 |
| loading / empty / validation / error | As SCR-05 | — | — |

**Content.** `src/data/cv/no.ts`, written from `data.js` (`cv.no`) after the comparison with the current Norwegian CV PDF (D-06), so the section set and the texts can differ from the design's Norwegian copy.

### SCR-01 — Home page

Delta only. Everything not listed here is as in the home manifest, SCR-01.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | As home SCR-01 | as there; "View CV" (hero and bar), "Full CV" and the header's "CV" now lead to the English CV page; BackToTop from 768 | AC-16; §Shell state changes |
| legacy hand-off, English | Scripts on, the address is the English Legacy CV address | SCR-05 opens at its top; the home page may be seen for a moment first. One press of Back returns to where the Visitor came from, not to SCR-01 | AC-13; sad.md §6 Legacy CV hand-off |
| legacy hand-off, Norwegian | Scripts on, the Norwegian Legacy CV address | SCR-06 opens at its top; Back as above | AC-13 |
| legacy address, scripts off | Scripts off | The home page as before; "View CV" on the first screen leads to SCR-05 | AC-14 |
| other fragment | The contact place, any other fragment, or none | As before: `contact arrived by link` for the contact place, the home page otherwise | AC-14 |
| header current | Any | No link is marked as current | AC-20 |
| loading / empty / validation / error | N/A: as home SCR-01 | — | — |

The visual baseline is re-taken at 834 and 1440 in Dag and Natt for BackToTop; 390 does not change.

### SCR-02 — Not-found page ("Ikke funnet")

Delta only. Everything not listed here is as in the base manifest with the home delta.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | As before | as there; "CV" in the header and "View CV" in the bar lead to the English CV page; BackToTop from 768 by the rules of §Shell state changes (on a page shorter than the scroll range it never appears where appearance follows scrolling) | AC-16, AC-21, AC-22 |
| header current | Any | No link is marked as current | AC-20 |
| loading / empty / error | N/A: as base manifest SCR-02 | — | — |

The visual baseline is re-taken at 834 and 1440 in Dag and Natt.

### SCR-03 — Mobile menu panel

Delta only. Everything not listed here is as in the base manifest with the home delta.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| open, current link (replaces the base row) | Opened on SCR-05 or SCR-06 | "CV" has `aria-current="page"`, an accent rule at the start of its row and the semibold weight, so it differs from "Contact" by more than colour. It leads to the CV page it was opened on | MobileMenu | AC-16, AC-20; sad.md §8 Current page; wireframe below |
| open, no current link | Opened on SCR-01 or SCR-02 | No link is marked; "CV" leads to the English CV page | MobileMenu | AC-16, AC-20 |
| open on SCR-06 | Opened on the Norwegian CV page | The panel is English and marked English | MobileMenu | AC-02 |
| loading / empty / error | N/A: as base manifest SCR-03 | — | — |

```text
SCR-03 open on a CV page — 390
| alpon.dev                        [✕] |
|                                      |
| ▌01  CV                              |  accent rule at the start, semibold,
|  ------------------------------------|  aria-current="page"
|  02  Contact                         |
|  ------------------------------------|
```

### SCR-04 — Styleguide

Delta only. Page options gain `backToTop: false`. The CV page script does not run here: every sample is static. Each new or changed section is one visual capture at 390 / 834 / 1440 × Dag / Natt. Sample CV data comes from `src/data/samples.ts` inside a `data-sample` block under a "Sample data" label.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | The Owner types the address | The earlier sections plus the sections below | AC-29 |
| sample data marked | Always | Every section that shows CV content carries the visible "Sample data" label | AC-29 |
| whole CV page sample | N/A: not shown here (C-5). The parts are shown on their own; the whole page is captured on SCR-05 and SCR-06 | — | home T-3 |
| loading / empty / error | N/A: as base manifest SCR-04 | — | — |

**New sections:**

| Section | Components | States shown |
|---|---|---|
| Breadcrumbs | Breadcrumbs | two items, three items; link default / hover / focus; current item |
| Language switch | NEW: LangSwitch | large and default size; "EN" current, "NO" current; segment hover / focus |
| Skill group | SkillGroup | two groups side by side |
| Language list | LanguageList | three rows |
| CV job | NEW: CvJob, Tag | current job with two client projects and internal projects; an earlier job with paragraphs only |
| Dated rows | NEW: DatedRows | a row with a two-line period and a note; a row with a Norwegian name |
| Contents list | NEW: ContentsList | eight numbered links; hover / focus |
| Original PDF preview | NEW: OriginalPdfPreview | closed; open with the two English page images and the meta line. The failed-image state is checked by e2e only |
| Print contact line | NEW: PrintContactLine | shown as it prints, in a framed sample |
| BackToTop | NEW: BackToTop | default / hover / focus, in the flow, not fixed |

**Changed sections:**

| Section | Components | States shown |
|---|---|---|
| Button | Button | adds the ghost variant: default and small; with an icon; default / hover / focus / pressed |
| Icon | Icon | adds `file-down`, `eye`, `arrow-up` |
| Mobile menu panel | MobileMenu (static sample) | the current link in its new form |
| Sticky action bar | MobileBar (inline samples) | adds the CV pair: language switch and "Download PDF", open |
| Contact list | ContactList, CopyButton | adds the CV form: "Based in" with the Residence, no "Save contact"; the Norwegian labels with "Kopier" |
| Toast | Toast | adds "Kopiert" with an address, marked Norwegian |

## Decided at this stage

C-1 to C-4 were decided by the Owner on 2026-10-09. C-5 to C-9 are derived at this stage from earlier decisions and the page design and were not asked; the Owner confirms them when approving this manifest. `tasks` and `plan-tests` take them as written.

| # | Screen / state | Decision |
|---|---|---|
| C-1 | SCR-05, SCR-06 side column | Below 1024 the side column is not displayed, as in the page design. It stays in the page's HTML at every width, so the contact check (AC-27) reads it. Spec AC-04 and AC-23 are reworded to match. Below 1024 a CV page therefore has no contents list, no contact list and no copy action; contact goes through the head's contact button, the closing band and the footer |
| C-2 | SCR-05, SCR-06 "Print" and the preview control | Button gets a `ghost` variant, as in the page design. It is never a primary button. Its text, focus ring and hover pairs go to the contrast check |
| C-3 | SCR-06 wording | Norwegian texts that neither the page design nor the spec gives: contact list labels "E-post", "Telefon", "LinkedIn", "GitHub", "Bosted"; page image names "CV, side 1 av 2, norsk, PDF, åpnes i ny fane" and "CV, side 2 av 2, norsk, PDF, åpnes i ny fane". Both go to the Claims list for the Owner's check. Proposed at this stage and not yet seen by the Owner, also for the Claims list: the refusal Toast "Kunne ikke kopiere. Marker adressen for å kopiere den." and the name of the breadcrumb navigation, "Brødsmulesti" (English page: "Breadcrumb") |
| C-4 | SCR-06 copy action | On the Norwegian CV page the copy action follows the CV language: "Kopier", then "Kopiert" in the button and in the Toast, marked Norwegian. "Copy" and "Copied" stay on the English CV page and the home page. `CLAUDE.md` Content rules and spec AC-02 and AC-04 say so |
| C-5 | SCR-04 | No whole-page CV sample on the Styleguide, as home T-3 decided for the hero |
| C-6 | Shell BackToTop | It is a link with the look of a secondary IconButton. On a page too short to scroll past the range it never appears where appearance follows scrolling |
| C-7 | SCR-05, SCR-06 targets | The switch segments (36 px high in the head, 28 px in the bar) and the breadcrumb link keep the drawn size inside a 44 × 44 target, as home D-18 did for "Copy" |
| C-8 | SCR-05, SCR-06 page image failed | The link's box keeps the reserved size on the paper ground with its border and shows the image's text alternative; nothing else is drawn |
| C-9 | SCR-05, SCR-06 profile and community | A plain paragraph and a plain list inside the CV section, not the design-only Prose component, which step 7 builds (sad.md §5 lists no Prose) |

## New components

| Component | Why no existing primitive fits | Registered in design-system |
|---|---|---|
| NEW: LangSwitch (`src/components/ui/LangSwitch.astro`) | The inventory's SegmentedControl is a radio group that needs a script; the language switch must be two links that work with scripts off and mark the current one (AC-07). It keeps the SegmentedControl look | yes (T28) |
| NEW: BackToTop (`src/components/layout/BackToTop.astro`) | The inventory has no fixed Shell link; the page design defines it only at site level (`BackToTop` in `ext.jsx`, `.x-top`). IconButton is a button, this is a link with scroll-tied appearance and a reserve (AC-21, AC-22) | pending |
| NEW: CvJob (`src/components/cv/CvJob.astro`) | ExperienceItem is a collapsible summary of a job for the home page; the CV needs an always-open entry with client projects, their technologies, internal projects or paragraphs (`CvJob` in `Cv.jsx`, AC-01) | yes (T28) |
| NEW: DatedRows (`src/components/cv/DatedRows.astro`) | No inventory list has a period column with a title, an organisation and a note (`.x-rows`); QuickFacts is a key and value list without dates (AC-01) | yes (T28) |
| NEW: ContentsList (inside `src/components/cv/CvAside.astro`) | The design-only TrailNav belongs to case studies and tracks the section in view with a script; "On this page" is a plain numbered list of links (`.x-toc`, AC-04) | yes (T28) |
| NEW: OriginalPdfPreview (`src/components/cv/OriginalPdfPreview.astro`) | Figure is a design-only single image with a caption; this is a native disclosure with two linked page images, reserved boxes and the meta line (AC-09, AC-10) | yes (T28) |
| NEW: PrintContactLine (`src/components/cv/PrintContactLine.astro`) | ContactList is a labelled list with actions for the screen; the printed CV needs one line of four facts that exists only in print (AC-11) | pending |

Not new: Breadcrumbs, SkillGroup and LanguageList are design-only inventory rows that this feature builds; `implement` moves them to "Built in the repo" with their paths. The ghost variant extends Button, the CV pair extends MobileBar, the current marker extends MobileMenu, and `file-down`, `eye` and `arrow-up` extend Icon.
