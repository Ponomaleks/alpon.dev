---
status: Living
tool: code               # figma | pencil | code — the single committed source of the design-tool choice (never sdd.local.md: that file is per-developer + gitignored)
figma_file: ""           # tool: figma → the Figma file URL/key the canon lives in; else ""
pen_file: ""             # tool: pencil → the .pen library path (e.g. docs/design/library.pen); else ""
updated_at: "2026-10-02"
---

# Design system — alpon.dev (Fjord)

> The project's **design canon**, produced once per repo by `design-system` and read by
> `ux-flows` / `screens` / `implement` / `review`. Committed — the tool choice and the inventory
> are team-wide, not per-developer. `architecture-map.md` §Frontend / UI foundation stays the
> inventory of the **code**; this file is the **design-side** canon (tool, posture, tokens,
> component inventory, cross-screen conventions). Refresh via `/sdd:design-system` when the
> foundation changes.

Precedence (`CLAUDE.md` §Sources of truth): `design/brand/BRAND.md` + `design/brand/tokens.json` win over `design/handoff/`. A conflict between them is reported in the PR description.

## Platform posture

- **Posture:** mobile-first. Recruiters often scan the site on a phone, and the mobile Lighthouse budget is the one that binds (`CLAUDE.md` §Quality bar).
- **Breakpoints / device classes:** 360 / 768 / 1024 / 1440 (`CLAUDE.md` §Design rules). Visual tests run at 390 / 834 / 1440 × Dag / Natt. Live iframe previews only appear at ≥ 1024.

## Design tool

- **Tool:** code. The design comes as a Claude Design handoff (JSX + CSS), not a Figma or Pencil file. `screens.md` carries inline markdown wireframes, and it needs no MCP.
- **Library location:** the visual reference is `design/handoff/design-system/project/` (components, tokens, guidelines) and `design/handoff/site/alpon.dev standalone.html` (whole site, including Natt). Both are read-only. The in-repo library is `src/components/{ui,layout,brand,prose}/`. Handoff JSX is a reference only; it is never copied into the Astro site.

## Token source

All values come from `src/styles/tokens.css` (`--fjord-*`, generated, do not edit). It is produced by `scripts/tokens/build.ts` (fjord-foundation ADR-0001) from the sources below. Screens and components never declare a literal value (fjord-foundation ADR-0003, Stylelint).

- **Colors:** `design/brand/tokens.json` (core palette, wins) + `design/handoff/design-system/project/tokens/colors.css` (semantic Dag/Natt)
- **Spacing / sizing:** `design/handoff/design-system/project/tokens/spacing.css` (4px grid, radii)
- **Typography:** `design/handoff/design-system/project/tokens/typography.css` + `fonts.css`. Faces are self-hosted in `src/styles/fonts.css` / `public/fonts/`.
- **Motion:** `design/handoff/design-system/project/tokens/motion.css` (durations, easings). Reduced-motion handling is generated, not copied from motion.css: movement distances and the count-up duration collapse to 0, and opacity fades keep `--fjord-duration-fade` (fjord-foundation SAD §8 Motion).

## Component inventory

`screens.md` may use only these names, or declare `NEW: <name>` with a why-no-primitive-fits line (`implement` then registers it here). **Repo** = the component is built in `src/`. **Handoff** = design-only so far, and the first feature that needs it builds it at the target path. States are given where the handoff signature defines them; otherwise see the component's `.d.ts`/`.prompt.md`. Handoff paths are relative to `design/handoff/design-system/project/`.

**Built in the repo**

| Component | Source (`file:line` / node / URL) | States it supports | Notes |
|---|---|---|---|
| BaseLayout | `src/layouts/BaseLayout.astro:1` | — (head contract: lang, title, description, noindex) | fjord-foundation extends it: theme bootstrap, font preloads, tokens → fonts → base |

**Registered page-local (built by fjord-foundation, `docs/features/fjord-foundation/screens.md`; step 3 promotes them)**

| Component | Source (`file:line` / node / URL) | States it supports | Notes |
|---|---|---|---|
| home-link | `src/pages/404.astro:40` (markup), `src/pages/404.astro:140` (styles); design `components/actions/actions.css:8` | default / hover / focus-visible (color only) | Promoted to `Button` (primary, arrow) in step 3, same token names |
| ridge-contours | `src/pages/404.astro:17` (markup), `src/pages/404.astro:90` (styles); paths from design `components/brand/contourData.js`; design `components/brand/Contours.jsx:28` | static only | Promoted to `Contours` in step 3, same markup |

**Design-only (handoff), by group**

| Component | Source (`file:line` / node / URL) | States it supports | Notes |
|---|---|---|---|
| Button | `components/actions/Button.jsx:4` | variant primary/secondary…; size; disabled; loading; arrow; icon | target `src/components/ui/`; one primary CTA per screen |
| IconButton | `components/actions/IconButton.jsx:4` | see `.d.ts` | 44px target |
| TextLink | `components/actions/TextLink.jsx:4` | see `.d.ts` | |
| Contours | `components/brand/Contours.jsx:28` | shape ridge/corner; tone; ambient drift; parallax | target `src/components/brand/`; drift/parallax off under reduced motion |
| Icon | `components/brand/Icon.jsx:4` | see `.d.ts` | 1.5px line icons, no tech logos |
| OgImage | `components/brand/OgImage.jsx:5` | — | source lives in `tools/`, not deployed |
| Portrait | `components/brand/Portrait.jsx:4` | see `.d.ts` | |
| QrTile | `components/brand/QrTile.jsx:4` | Dag / Natt asset | uses static `public/qr/qr-vcard-{dag,natt}.svg`, no QR library |
| Terrain | `components/brand/Terrain.jsx:41` | see `.d.ts` | |
| Wordmark | `components/brand/Wordmark.jsx:3` | — | |
| ArchDiagram | `components/casestudy/ArchDiagram.jsx:4` | see `.d.ts` | case studies |
| Callout | `components/casestudy/Callout.jsx:4` | see `.d.ts` | |
| Figure | `components/casestudy/Figure.jsx:4` | see `.d.ts` | |
| InlineCta | `components/casestudy/InlineCta.jsx:4` | see `.d.ts` | |
| MetaRow | `components/casestudy/MetaRow.jsx:3` | see `.d.ts` | |
| NextProject | `components/casestudy/NextProject.jsx:5` | see `.d.ts` | |
| Prose | `components/casestudy/Prose.jsx:3` | — | target `src/components/prose/`; step 7 |
| CtaBand | `components/content/CtaBand.jsx:5` | see `.d.ts` | |
| ProjectCard | `components/content/ProjectCard.jsx:7` | see `.d.ts` | |
| SectionHeader | `components/content/SectionHeader.jsx:3` | size; eyebrow; lead | |
| Eyebrow | `components/content/SectionHeader.jsx:14` | — | |
| Stat / StatRow | `components/content/Stat.jsx:6`, `:42` | see `.d.ts` | real numbers only; reduced motion shows final values |
| Testimonial | `components/content/Testimonial.jsx:4` | see `.d.ts` | real quotes only, with name and link; hidden if none |
| ContactForm | `components/cv/ContactForm.jsx:10` | see `.d.ts` | needs a server endpoint (Worker); requires its own ADR before building (repo ADR-0001) |
| ContactList | `components/cv/ContactList.jsx:5` | see `.d.ts` | data from `src/data/contact.ts` |
| CopyButton | `components/cv/CopyButton.jsx:5` | see `.d.ts` | "Kopiert" feedback |
| ExperienceItem / ExperienceList | `components/cv/ExperienceItem.jsx:5`, `:30` | see `.d.ts` | |
| LanguageList | `components/cv/LanguageList.jsx:4` | — | plain labels, no CEFR codes |
| SkillGroup | `components/cv/SkillGroup.jsx:4` | — | no skill bars or percentages |
| TextField | `components/cv/TextField.jsx:4` | default / hint / error / optional; multiline | |
| AvailabilityBadge | `components/feedback/AvailabilityBadge.jsx:5` | see `.d.ts` | |
| EmptyState | `components/feedback/EmptyState.jsx:4` | eyebrow / title / body / action | |
| NotFound | `components/feedback/NotFound.jsx:4` | title / body / code line / actions | built as `src/pages/404.astro` by fjord-foundation |
| Skeleton | `components/feedback/Skeleton.jsx:3` | — | islands only; static pages have no loading state |
| StatusBadge | `components/feedback/StatusBadge.jsx:5` | see `.d.ts` | |
| Tag / TagList | `components/feedback/Tag.jsx:3`, `:7` | — | |
| Toast / ToastRegion | `components/feedback/Toast.jsx:4`, `:16` | tone success…; message; meta | |
| Tooltip | `components/feedback/Tooltip.jsx:3` | — | never the only carrier of information |
| Breadcrumbs | `components/navigation/Breadcrumbs.jsx:3` | — | |
| CommandPalette | `components/navigation/CommandPalette.jsx:5` | see `.d.ts` | after Release 1, loaded lazily on first Ctrl/Cmd+K (roadmap step 8) |
| FilterChips | `components/navigation/FilterChips.jsx:3` | see `.d.ts` | |
| Footer | `components/navigation/Footer.jsx:3` | — | target `src/components/layout/`; step 3 |
| Header | `components/navigation/Header.jsx:9` | see `.d.ts` | target `src/components/layout/`; step 3 |
| MobileMenu | `components/navigation/MobileMenu.jsx:10` | open / closed | |
| Pagination | `components/navigation/Pagination.jsx:4` | prev / next optional | |
| SegmentedControl | `components/navigation/SegmentedControl.jsx:3` | see `.d.ts` | |
| ThemeToggle | `components/navigation/SegmentedControl.jsx:26` | dag / natt | step 3; View Transition is progressive and skipped under reduced motion |
| StickyActionBar / ScrollProgress | `components/navigation/StickyActionBar.jsx:4`, `:29` | see `.d.ts` | |
| TrailNav | `components/navigation/TrailNav.jsx:5` | see `.d.ts` | |

## Interaction & writing conventions

- **Errors:** page-level for navigation (the Fjord Not-found page, "Ikke funnet"). Inline under the field for forms (`TextField` `error`). There are no error toasts. A silent fallback is used where the Visitor can't act (e.g. an unusable stored Theme choice).
- **Empty states:** `EmptyState` (eyebrow + title + body + optional action). A section with nothing published is hidden rather than shown empty (roadmap: projects never go public empty).
- **Loading:** none on static pages: content is rendered at build time, and fonts use matched fallbacks. `Skeleton` only for islands that fetch.
- **Validation:** inline error attached to the field (`aria-describedby`). Timing is decided in the spec of the first form (CV contact).
- **Microcopy tone:** modest and concrete, English for main content, Norwegian for small warm details ("Hei", "Ta kontakt", "Kopiert", "Ikke funnet", …; `lang="no"`). No superlatives, numbers verified or `[placeholder]` (`CLAUDE.md` §Content rules).
- **Motion:** motion tokens only. With `prefers-reduced-motion: reduce`, fades only and no loops. View Transitions are progressive enhancement.
- **Accessibility:** WCAG 2.2 AA, 44px touch targets, visible `:focus-visible`, no hover-only information.
