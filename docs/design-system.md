---
status: Living
tool: code               # figma | pencil | code — the single committed source of the design-tool choice (never sdd.local.md: that file is per-developer + gitignored)
figma_file: ""           # tool: figma → the Figma file URL/key the canon lives in; else ""
pen_file: ""             # tool: pencil → the .pen library path (e.g. docs/design/library.pen); else ""
updated_at: "2026-10-09"
---

# Design system — alpon.dev (Fjord)

> The project's **design canon**, produced once per repo by `design-system` and read by
> `ux-flows` / `screens` / `implement` / `review`. Committed — the tool choice and the inventory
> are team-wide, not per-developer. `architecture-map.md` §Frontend / UI foundation stays the
> inventory of the **code**; this file is the **design-side** canon (tool, posture, tokens,
> component inventory, cross-screen conventions). Refresh via `/sdd:design-system` when the
> foundation changes.

Precedence (`CLAUDE.md` §Sources of truth), highest first:

1. `design/brand/BRAND.md` + `design/brand/tokens.json` for brand rules.
2. The page designs in `design/handoff/site/` (`project/site/*.jsx`, `alpon.dev standalone.html`, screenshots in `design/screenshots/`) for what each page looks like: layout, content, sections, copy.
3. `design/handoff/design-system/` for the building blocks: tokens, components, states. Component demos are examples, not page specs.

If a page design and a component demo differ, the page design wins and the component is adapted or extended to match it. Conflicts are listed in the PR description. Every screen in a `screens.md` cites its page design (file and screen) as the primary reference and component files as secondary; the "Design match" review compares against `design/screenshots/`.

The inventory below lists building blocks. A row never defines a page: the "Source" column is where the component's design lives, and the page that uses it is specified by its page design.

## Platform posture

- **Posture:** mobile-first. Recruiters often scan the site on a phone, and the mobile Lighthouse budget is the one that binds (`CLAUDE.md` §Quality bar).
- **Breakpoints / device classes:** 360 / 768 / 1024 / 1440 (`CLAUDE.md` §Design rules). Visual tests run at 390 / 834 / 1440 × Dag / Natt. Live iframe previews only appear at ≥ 1024.

## Design tool

- **Tool:** code. The design comes as a Claude Design handoff (JSX + CSS), not a Figma or Pencil file. `screens.md` carries inline markdown wireframes, and it needs no MCP.
- **Library location:** pages follow `design/handoff/site/` (`project/site/*.jsx` and `alpon.dev standalone.html`, whole site, including Natt); building blocks come from `design/handoff/design-system/project/` (components, tokens, guidelines). The site bundles a newer copy of the design system in `design/handoff/site/project/_ds/`; where the two copies of a component differ, the site copy is the one the page designs use. All are read-only. The in-repo library is `src/components/{ui,layout,brand,home,cv,prose}/`. Handoff JSX is a reference only; it is never copied into the Astro site.

## Token source

All values come from `src/styles/tokens.css` (`--fjord-*`, generated, do not edit). It is produced by `scripts/tokens/build.ts` (fjord-foundation ADR-0001) from the sources below. Screens and components never declare a literal value (fjord-foundation ADR-0003, Stylelint).

- **Colors:** `design/brand/tokens.json` (core palette, wins) + `design/handoff/design-system/project/tokens/colors.css` (semantic Dag/Natt)
- **Spacing / sizing:** `design/handoff/design-system/project/tokens/spacing.css` (4px grid, radii)
- **Typography:** `design/handoff/design-system/project/tokens/typography.css` + `fonts.css`. Faces are self-hosted in `src/styles/fonts.css` / `public/fonts/`.
- **Motion:** `design/handoff/design-system/project/tokens/motion.css` (durations, easings). Reduced-motion handling is generated, not copied from motion.css: movement distances and the count-up duration collapse to 0, and opacity fades keep `--fjord-duration-fade` (fjord-foundation SAD §8 Motion).

## Component inventory

`screens.md` may use only these names, or declare `NEW: <name>` with a why-no-primitive-fits line (`implement` then registers it here). **Repo** = the component is built in `src/`. **Handoff** = design-only so far, and the first feature that needs it builds it at the target path. States are given where the handoff signature defines them; otherwise see the component's `.d.ts`/`.prompt.md`. Handoff paths are relative to `design/handoff/design-system/project/`.

**Built in the repo** (base-components registers the Shell and the base components here, home phase 4a the home components and the Shell changes, phase 4b Testimonial, ProjectCard and their sections, cv phase 5a the CV components; the handoff rows of built components are removed)

| Component | Source (`file:line` / node / URL) | States it supports | Notes |
|---|---|---|---|
| BaseLayout | `src/layouts/BaseLayout.astro:1` | — (head contract: lang, title, description, noindex) | fjord-foundation extends it: theme bootstrap, font preloads, tokens → fonts → base |
| Button | `src/components/ui/Button.astro` | primary / secondary / ghost; size; arrow; icon; `download`; disabled; hover / focus-visible | one primary CTA per screen; promoted from the Not-found `home-link`; `ghost` added by cv for the control of the Original PDF preview |
| Link | `src/components/ui/Link.astro` | default / hover / focus-visible; external (leaves the site: new tab, `rel="noopener noreferrer"`, the arrow icon, hidden hint "(opens in a new tab)"); external `quiet` (the type and colour of the text around it, 44px target, for a value in a list); `standalone` (a link on a line of its own, with its arrow) | `standalone` added by home for "Full CV"; every link to another site uses `external` (home D-09); `quiet` added by home for the profile rows of the Contact block |
| IconButton | `src/components/ui/IconButton.astro` | default / hover / focus-visible | 44px target |
| Icon | `src/components/ui/Icon.astro` | — | 1.5px line icons; home added `play`, `pause`, `check`, `chevron-down`, `chevron-up`, `copy`, `download`, `user-plus`, `mail`, `phone`, `linkedin`, `github`; cv added `file-down`, `eye`, `arrow-up` |
| Badge (availability, status) | `src/components/ui/Badge.astro` | status; `pulse` (the ring of the open dot, only under `data-motion="running"`) | `pulse` is used by the home hero only (home D-01) |
| Tag | `src/components/ui/Tag.astro` | — |  |
| Stat | `src/components/ui/Stat.astro` | single / row; compact; `countUp` | the final number is in the HTML; with `countUp` the page script `src/scripts/home/count-up.ts` counts a hidden copy once (home AC-06) |
| SectionHeader with Eyebrow | `src/components/ui/SectionHeader.astro` | size; eyebrow; lead |  |
| Toast and its live region | `src/components/ui/Toast.astro`, script `src/scripts/shell/toast.ts` | tone; message; optional check icon | polite live region; the check icon is asked for by the `fjord:toast` event (home AC-14) |
| Contours | `src/components/brand/Contours.astro` | static; `parallax` layer (hero drift and pointer parallax); scroll-tied in the closing band | promoted from the Not-found `ridge-contours`; motion per home AC-30, AC-31, AC-41 |
| Terrain map panel | `src/components/brand/TerrainMap.astro` | static | map panel of the Not-found page |
| Wordmark | `src/components/brand/Wordmark.astro` | — |  |
| SkipLink | `src/components/layout/SkipLink.astro` | default / focus-visible | first focusable element |
| Header | `src/components/layout/Header.astro` | variants; scroll border (script `src/scripts/shell/header.ts`); over-hero state `data-over-hero` (script `src/scripts/home/hero-header.ts`) | over the home hero it follows home AC-33 |
| MobileMenu | `src/components/layout/MobileMenu.astro` | open / closed (script `src/scripts/shell/menu.ts`) | native modal dialog |
| ThemeToggle | `src/components/layout/ThemeToggle.astro` | dag / natt (script `src/scripts/shell/theme.ts`) | View Transition is progressive and skipped under reduced motion |
| CtaBand | `src/components/layout/CtaBand.astro` | actions from a page option (default pair, home pair) | action types in `src/data/shell-actions.ts` (home AC-40); contours follow scrolling (home AC-41) |
| Footer | `src/components/layout/Footer.astro` | — | data from `src/data/contact.ts`; the two profile links open a new tab with the hidden hint and no icon (home D-09) |
| MobileBar (Sticky action bar) | `src/components/layout/MobileBar.astro` | shown / hidden (script `src/scripts/shell/action-bar.ts`); open / collapsed by its tab (native `<details>`); actions from a page option; a slot is a link or the LangSwitch | all actions secondary (home AC-38); the tab is part of the panel (home AC-39, D-11); the CV pages pass the LangSwitch and "Download PDF" (cv AC-19) |
| contact data | `src/data/contact.ts` | — | single source for contacts; Person data built from it in `src/data/person.ts` |
| Portrait | `src/components/home/Portrait.astro` | still / floating under `data-motion="running"` | AVIF and WebP at 340 and 680 from `public/img/`; width and height reserved (home AC-02) |
| QrTile | `src/components/brand/QrTile.astro` | Dag / Natt asset; `sample` | static `public/qr/qr-vcard-{dag,natt}.svg`, no QR library; shown from 1024 (home AC-17) |
| ContactList | built inside `src/components/home/ContactBlock.astro` | — | no file of its own; data from `src/data/contact.ts` (home AC-13); the CV side column has its own list, built inside `src/components/cv/CvAside.astro` (cv AC-02) |
| CopyButton | `src/components/ui/CopyButton.astro` | default / hover / focus-visible | the confirmation is the Toast, not a state of the button (home D-18); the copying is done by `src/scripts/home/copy-email.ts` |
| ExperienceItem / ExperienceList | `src/components/home/ExperienceList.astro` | entry open / closed (native `<details>`); current; `sample` | one file for the list and its entries (home AC-08) |
| Hero (NEW) | `src/components/home/Hero.astro` | motion running / paused / none | home AC-01; scripts `src/scripts/home/motion.ts`, `parallax.ts` |
| MotionControl (NEW) | `src/components/home/MotionControl.astro` | pause / play; hidden without `data-motion`; hover / focus-visible | home AC-30 |
| KeyFacts (NEW) | `src/components/home/KeyFacts.astro` | — | a panel around Stat with `countUp` (home AC-05) |
| About (NEW) | `src/components/home/About.astro` | — | home AC-07 |
| QuickFacts (NEW) | `src/components/home/QuickFacts.astro` | one value / several values, one per line | description list (home AC-07, D-16) |
| ContactBlock (NEW) | `src/components/home/ContactBlock.astro` | — | the list, "Save contact", QrTile and the mail-link sentence of home IS-03 |
| Testimonial | built inside `src/components/home/Recommendations.astro` | quote whole / closed to three lines with "Show more" / open with "Show less" (script `src/scripts/home/quote-toggle.ts`); with or without "On LinkedIn" | no file of its own; the quote word for word, name and role; the link only on a Recommendation from LinkedIn; real quotes only, with the person's agreement (home AC-09, AC-10, D-19, D-21) |
| Recommendations (NEW) | `src/components/home/Recommendations.astro` | present / absent (no quote with consent); grid / carousel that goes round when there are more cards than columns, with two IconButton arrows; automatic turning on / off; `sample` | the section is left out when no Recommendation remains (home AC-10); the row scrolls with scroll snap without a script, `src/scripts/home/carousel.ts` adds the rest, no library (home AC-42, AC-43, D-20) |
| ProjectCard | `src/components/home/ProjectCard.astro` | compact / featured; media ground spruce / auto; with or without "Live" and "Code" (both open a new tab) | the media is a contour panel with the slug until step 7 adds screenshots and the link to the case study (home AC-12) |
| SelectedProjects (NEW) | `src/components/home/SelectedProjects.astro` | one to three featured projects, the first large; heading level | Dormant section: on the Styleguide with marked sample data, on the home page only when `features.projects` is on and a Published project exists (home AC-11, AC-12) |
| home content data | `src/data/home.ts` | — | key facts, introduction, quick facts, experience, Recommendations, the Now line |
| project data | `src/data/projects.ts`, `src/content.config.ts` | — | the entry shape of the `projects` collection (`src/content/projects/*.md`, empty until step 7) and the choice of the projects a page shows |
| sample data | `src/data/samples.ts` | — | Styleguide only: sample Recommendations, projects and CV data, shown inside a `data-sample` block under a "Sample data" label (home AC-12, AC-28; cv AC-29) |
| Shell action data | `src/data/shell-actions.ts` | — | the bar and band actions a page passes as options |
| Breadcrumbs | `src/components/ui/Breadcrumbs.astro` | — | links, then the current page as plain text with `aria-current="page"`; the page gives the name of the navigation in its own language (cv AC-01) |
| LangSwitch (NEW) | `src/components/ui/LangSwitch.astro` | current `en` / `no`; size default / large | two links in one pill, so it works with scripts off (cv AC-07); `src/scripts/cv/lang-switch.ts` keeps the section across the switch (cv AC-08); also a slot of MobileBar |
| SkillGroup | `src/components/cv/SkillGroup.astro` | — | a label and its skills as one line of text; no skill bars or percentages |
| LanguageList | `src/components/cv/LanguageList.astro` | — | plain labels, no CEFR codes |
| CvJob (NEW) | `src/components/cv/CvJob.astro` | first (filled marker) / later; with client projects, internal projects or paragraphs | always open, unlike ExperienceList; the technologies are Tags (cv AC-01, AC-03) |
| DatedRows (NEW) | `src/components/cv/DatedRows.astro` | with or without organisation and note; period on one or two lines | Education and Courses of the CV page (cv AC-01) |
| ContentsList (NEW) | built inside `src/components/cv/CvAside.astro` | — | no file of its own; a plain numbered list of links to the sections of the page (cv AC-04) |
| OriginalPdfPreview (NEW) | `src/components/cv/OriginalPdfPreview.astro` | closed / open (native `<details>`, no script); `open` for the Styleguide sample | two page images one under the other, each as wide as the content (cv D-11), each a link that opens the CV PDF in a new tab, with reserved boxes; the meta line is `src/components/cv/CvMeta.astro` (cv AC-09, AC-10) |
| PrintContactLine (NEW) | `src/components/cv/PrintContactLine.astro` | one state; displayed in print only | one line of email, phone, LinkedIn and GitHub from `src/data/contact.ts` under the location line of the printed CV (cv AC-11, AC-27) |
| BackToTop (NEW) | `src/components/layout/BackToTop.astro` | hidden at the top / shown after scrolling / hidden over the end of the page; always shown where the browser cannot tie it to scrolling; hover, focus; `sample` for the Styleguide | a Shell link to the empty `#top` target that `BaseLayout` puts first in the body, from 768 only; opacity only under reduced motion (cv AC-21, AC-22) |
| CV data | `src/data/cv/` | — | the text of each CV page (`en.ts`, `no.ts`), the Section ids (`sections.ts`), the CV date and the two CV PDFs with their checksums (`index.ts`) |

**Design-only (handoff), by group**

| Component | Source (`file:line` / node / URL) | States it supports | Notes |
|---|---|---|---|
| OgImage | `components/brand/OgImage.jsx:5` | — | source lives in `tools/`, not deployed |
| ArchDiagram | `components/casestudy/ArchDiagram.jsx:4` | see `.d.ts` | case studies |
| Callout | `components/casestudy/Callout.jsx:4` | see `.d.ts` | |
| Figure | `components/casestudy/Figure.jsx:4` | see `.d.ts` | |
| InlineCta | `components/casestudy/InlineCta.jsx:4` | see `.d.ts` | |
| MetaRow | `components/casestudy/MetaRow.jsx:3` | see `.d.ts` | |
| NextProject | `components/casestudy/NextProject.jsx:5` | see `.d.ts` | |
| Prose | `components/casestudy/Prose.jsx:3` | — | target `src/components/prose/`; step 7 |
| ContactForm | `components/cv/ContactForm.jsx:10` | see `.d.ts` | needs a server endpoint (Worker); requires its own ADR before building (repo ADR-0001) |
| TextField | `components/cv/TextField.jsx:4` | default / hint / error / optional; multiline | |
| EmptyState | `components/feedback/EmptyState.jsx:4` | eyebrow / title / body / action | |
| NotFound | `components/feedback/NotFound.jsx:4`; newer site copy `design/handoff/site/project/_ds/…/components/feedback/feedback.css:40` (terrain map, "You are here" pin) | title / body / code line / actions; map panel in the site copy | A building block, not the page spec. The 404 page follows the site design (`design/handoff/site/project/site/Misc.jsx`, `design/screenshots/{dag,natt}_not_found_*.png`). `src/pages/404.astro` is rebuilt to the page design by base-components (AC-17) |
| Skeleton | `components/feedback/Skeleton.jsx:3` | — | islands only; static pages have no loading state |
| Tooltip | `components/feedback/Tooltip.jsx:3` | — | never the only carrier of information |
| CommandPalette | `components/navigation/CommandPalette.jsx:5` | see `.d.ts` | after Release 1, loaded lazily on first Ctrl/Cmd+K (roadmap step 8) |
| FilterChips | `components/navigation/FilterChips.jsx:3` | see `.d.ts` | |
| Pagination | `components/navigation/Pagination.jsx:4` | prev / next optional | |
| SegmentedControl | `components/navigation/SegmentedControl.jsx:3` | see `.d.ts` | |
| ScrollProgress | `components/navigation/StickyActionBar.jsx:29` | see `.d.ts` | |
| TrailNav | `components/navigation/TrailNav.jsx:5` | see `.d.ts` | |

## Interaction & writing conventions

- **Errors:** page-level for navigation (the Fjord Not-found page, "Ikke funnet"). Inline under the field for forms (`TextField` `error`). There are no error toasts. A silent fallback is used where the Visitor can't act (e.g. an unusable stored Theme choice).
- **Empty states:** `EmptyState` (eyebrow + title + body + optional action). A section with nothing published is hidden rather than shown empty (roadmap: projects never go public empty).
- **Loading:** none on static pages: content is rendered at build time, and fonts use matched fallbacks. `Skeleton` only for islands that fetch.
- **Validation:** inline error attached to the field (`aria-describedby`). Timing is decided in the spec of the first form (CV contact).
- **Microcopy tone:** modest and concrete, English for main content, Norwegian for small warm details ("Hei", "Ta kontakt", "Ikke funnet", …; `lang="no"`). No superlatives, numbers verified or `[placeholder]` (`CLAUDE.md` §Content rules).
- **Motion:** motion tokens only. With `prefers-reduced-motion: reduce`, fades only and no loops. View Transitions are progressive enhancement.
- **Accessibility:** WCAG 2.2 AA, 44px touch targets, visible `:focus-visible`, no hover-only information.
