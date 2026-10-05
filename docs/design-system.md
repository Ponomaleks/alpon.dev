---
status: Living
tool: code               # figma | pencil | code — the single committed source of the design-tool choice (never sdd.local.md: that file is per-developer + gitignored)
figma_file: ""           # tool: figma → the Figma file URL/key the canon lives in; else ""
pen_file: ""             # tool: pencil → the .pen library path (e.g. docs/design/library.pen); else ""
updated_at: "2026-10-03"
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
- **Library location:** pages follow `design/handoff/site/` (`project/site/*.jsx` and `alpon.dev standalone.html`, whole site, including Natt); building blocks come from `design/handoff/design-system/project/` (components, tokens, guidelines). The site bundles a newer copy of the design system in `design/handoff/site/project/_ds/`; where the two copies of a component differ, the site copy is the one the page designs use. All are read-only. The in-repo library is `src/components/{ui,layout,brand,prose}/`. Handoff JSX is a reference only; it is never copied into the Astro site.

## Token source

All values come from `src/styles/tokens.css` (`--fjord-*`, generated, do not edit). It is produced by `scripts/tokens/build.ts` (fjord-foundation ADR-0001) from the sources below. Screens and components never declare a literal value (fjord-foundation ADR-0003, Stylelint).

- **Colors:** `design/brand/tokens.json` (core palette, wins) + `design/handoff/design-system/project/tokens/colors.css` (semantic Dag/Natt)
- **Spacing / sizing:** `design/handoff/design-system/project/tokens/spacing.css` (4px grid, radii)
- **Typography:** `design/handoff/design-system/project/tokens/typography.css` + `fonts.css`. Faces are self-hosted in `src/styles/fonts.css` / `public/fonts/`.
- **Motion:** `design/handoff/design-system/project/tokens/motion.css` (durations, easings). Reduced-motion handling is generated, not copied from motion.css: movement distances and the count-up duration collapse to 0, and opacity fades keep `--fjord-duration-fade` (fjord-foundation SAD §8 Motion).

## Component inventory

`screens.md` may use only these names, or declare `NEW: <name>` with a why-no-primitive-fits line (`implement` then registers it here). **Repo** = the component is built in `src/`. **Handoff** = design-only so far, and the first feature that needs it builds it at the target path. States are given where the handoff signature defines them; otherwise see the component's `.d.ts`/`.prompt.md`. Handoff paths are relative to `design/handoff/design-system/project/`.

**Built in the repo** (base-components registers the Shell and the base components here; the handoff rows of built components are removed)

| Component | Source (`file:line` / node / URL) | States it supports | Notes |
|---|---|---|---|
| BaseLayout | `src/layouts/BaseLayout.astro:1` | — (head contract: lang, title, description, noindex) | fjord-foundation extends it: theme bootstrap, font preloads, tokens → fonts → base |
| Button | `src/components/ui/Button.astro` | primary / secondary; size; arrow; disabled; hover / focus-visible | one primary CTA per screen; promoted from the Not-found `home-link` |
| Link | `src/components/ui/Link.astro` | default / hover / focus-visible |  |
| IconButton | `src/components/ui/IconButton.astro` | default / hover / focus-visible | 44px target |
| Icon | `src/components/ui/Icon.astro` | — | 1.5px line icons |
| Badge (availability, status) | `src/components/ui/Badge.astro` | — |  |
| Tag | `src/components/ui/Tag.astro` | — |  |
| Stat | `src/components/ui/Stat.astro` | — | shows the final number, no count-up |
| SectionHeader with Eyebrow | `src/components/ui/SectionHeader.astro` | size; eyebrow; lead |  |
| Toast and its live region | `src/components/ui/Toast.astro`, script `src/scripts/shell/toast.ts` | tone; message | polite live region; the Styleguide triggers it |
| Contours | `src/components/brand/Contours.astro` | static | promoted from the Not-found `ridge-contours` |
| Terrain map panel | `src/components/brand/TerrainMap.astro` | static | map panel of the Not-found page |
| Wordmark | `src/components/brand/Wordmark.astro` | — |  |
| SkipLink | `src/components/layout/SkipLink.astro` | default / focus-visible | first focusable element |
| Header | `src/components/layout/Header.astro` | variants; scroll border (script `src/scripts/shell/header.ts`) |  |
| MobileMenu | `src/components/layout/MobileMenu.astro` | open / closed (script `src/scripts/shell/menu.ts`) | native modal dialog |
| ThemeToggle | `src/components/layout/ThemeToggle.astro` | dag / natt (script `src/scripts/shell/theme.ts`) | View Transition is progressive and skipped under reduced motion |
| CtaBand | `src/components/layout/CtaBand.astro` | — |  |
| Footer | `src/components/layout/Footer.astro` | — | data from `src/data/contact.ts` |
| MobileBar (Sticky action bar) | `src/components/layout/MobileBar.astro` | shown / hidden (script `src/scripts/shell/action-bar.ts`) |  |
| contact data | `src/data/contact.ts` | — | single source for contacts |

**Design-only (handoff), by group**

| Component | Source (`file:line` / node / URL) | States it supports | Notes |
|---|---|---|---|
| OgImage | `components/brand/OgImage.jsx:5` | — | source lives in `tools/`, not deployed |
| Portrait | `components/brand/Portrait.jsx:4` | see `.d.ts` | |
| QrTile | `components/brand/QrTile.jsx:4` | Dag / Natt asset | uses static `public/qr/qr-vcard-{dag,natt}.svg`, no QR library |
| ArchDiagram | `components/casestudy/ArchDiagram.jsx:4` | see `.d.ts` | case studies |
| Callout | `components/casestudy/Callout.jsx:4` | see `.d.ts` | |
| Figure | `components/casestudy/Figure.jsx:4` | see `.d.ts` | |
| InlineCta | `components/casestudy/InlineCta.jsx:4` | see `.d.ts` | |
| MetaRow | `components/casestudy/MetaRow.jsx:3` | see `.d.ts` | |
| NextProject | `components/casestudy/NextProject.jsx:5` | see `.d.ts` | |
| Prose | `components/casestudy/Prose.jsx:3` | — | target `src/components/prose/`; step 7 |
| ProjectCard | `components/content/ProjectCard.jsx:7` | see `.d.ts` | |
| Testimonial | `components/content/Testimonial.jsx:4` | see `.d.ts` | real quotes only, with name and link; hidden if none |
| ContactForm | `components/cv/ContactForm.jsx:10` | see `.d.ts` | needs a server endpoint (Worker); requires its own ADR before building (repo ADR-0001) |
| ContactList | `components/cv/ContactList.jsx:5` | see `.d.ts` | data from `src/data/contact.ts` |
| CopyButton | `components/cv/CopyButton.jsx:5` | see `.d.ts` | "Kopiert" feedback |
| ExperienceItem / ExperienceList | `components/cv/ExperienceItem.jsx:5`, `:30` | see `.d.ts` | |
| LanguageList | `components/cv/LanguageList.jsx:4` | — | plain labels, no CEFR codes |
| SkillGroup | `components/cv/SkillGroup.jsx:4` | — | no skill bars or percentages |
| TextField | `components/cv/TextField.jsx:4` | default / hint / error / optional; multiline | |
| EmptyState | `components/feedback/EmptyState.jsx:4` | eyebrow / title / body / action | |
| NotFound | `components/feedback/NotFound.jsx:4`; newer site copy `design/handoff/site/project/_ds/…/components/feedback/feedback.css:40` (terrain map, "You are here" pin) | title / body / code line / actions; map panel in the site copy | A building block, not the page spec. The 404 page follows the site design (`design/handoff/site/project/site/Misc.jsx`, `design/screenshots/{dag,natt}_not_found_*.png`). `src/pages/404.astro` is rebuilt to the page design by base-components (AC-17) |
| Skeleton | `components/feedback/Skeleton.jsx:3` | — | islands only; static pages have no loading state |
| Tooltip | `components/feedback/Tooltip.jsx:3` | — | never the only carrier of information |
| Breadcrumbs | `components/navigation/Breadcrumbs.jsx:3` | — | |
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
- **Microcopy tone:** modest and concrete, English for main content, Norwegian for small warm details ("Hei", "Ta kontakt", "Kopiert", "Ikke funnet", …; `lang="no"`). No superlatives, numbers verified or `[placeholder]` (`CLAUDE.md` §Content rules).
- **Motion:** motion tokens only. With `prefers-reduced-motion: reduce`, fades only and no loops. View Transitions are progressive enhancement.
- **Accessibility:** WCAG 2.2 AA, 44px touch targets, visible `:focus-visible`, no hover-only information.
