# Fjord — design system for alpon.dev

Fjord is the brand and web design system of **Alexander Ponomarenko**, Software Engineer / Full Stack Developer in the Oslo area, Norway. It started as a business card and now covers the personal site **alpon.dev** (landing, CV in English + Norwegian, portfolio with case studies, later a blog), the LinkedIn banner and the Open Graph image. The site exists to get him hired in Norway, so every page ends in a clear call to action and states a few honest numbers.

Nordic minimalism: light **stone** ground, deep **spruce** green, and topographic **contour lines** that read both as a map of Nordmarka and as isolines on a chart. "Quiet creative": one expressive detail per composition, everything else calm.

## Sources

- Brand pack (uploaded, now in this project): `guidelines/BRAND.source.md` (original rules, in Ukrainian), `guidelines/tokens.source.json`, the original `tokens.css` (superseded by `tokens/`), fonts, contour SVGs, QR SVG/PNG, business card and LinkedIn banner PNGs, portrait photo.
- Live site: https://alpon.dev (currently a one-page "under construction" version: name, role, contacts, CV embed). Copy such as "Hei!", "View CV", "Email me", "Save contact", "Adds me to your phone's contacts (.vcf)", "PDF · 2 pages · A4", "Snart kommer mer" comes from there.
- No codebase or Figma file was provided. Components are authored from the brief + brand pack.

## Index

What ships in this copy of the system (`_ds/fjord-design-system-…/`):

- `styles.css` — entry point; `@import`s only. Link this one file, or the individual files below in the same order.
- `tokens/` — `fonts.css`, `colors.css` (palette, line colours, opacity scale, Dag / Natt / on-spruce), `typography.css`, `spacing.css` (space, fluid rhythm, grid, radii, z-index, elevation), `motion.css`, `base.css` (element defaults, type classes, contour fills, motion helpers, reduced motion).
- `fonts/` — Schibsted Grotesk 400/500/600/700, JetBrains Mono 400/500/700 (TTF, OFL).
- `assets/patterns/` — contour tiles used by `.fjord-contours-spruce / -stone / -layer` (`contours-tile-spruce-transparent.svg`, `contours-tile-stone-transparent.svg`, `contours-tile-mask.svg`).
- `components/<category>/<category>.css` — component CSS: `brand/`, `actions/`, `feedback/`, `navigation/`, `content/`, `casestudy/casestudy.css`, `cv/`, `forms/`.
- `_ds_bundle.js` — all components compiled into one plain script; exports on `window.FjordDesignSystem_44c954` (plus `applyTheme`, `fjordMs`).
- `_ds_manifest.json`, `_adherence.oxlintrc.json` — component / token manifest and lint rules.
- `readme.md` — this file.

Not included in this copy (they live in the source design-system project): `guidelines/`, `ui_kits/`, `assets/qr/`, `assets/card/`, `assets/banner/`, `assets/photo/`, `assets/icons/` (icon paths are inlined in the bundle), `_dev/`, `thumbnail.html`, `SKILL.md`, and the per-component `.jsx` / `.d.ts` / `.prompt.md` sources. The site keeps its own copies of the portrait (`assets/portrait.png`) and the vCard QR (`assets/qr-vcard-dag.svg`, `-natt.svg`).

## Components

- **brand/** — `Icon`, `Contours`, `Terrain` (+ `terrainPath`), `QrTile`, `Wordmark`, `Portrait`, `OgImage`
- **actions/** — `Button`, `IconButton`, `TextLink`
- **feedback/** — `AvailabilityBadge`, `StatusBadge`, `Toast` (+ `ToastRegion`), `Tooltip`, `Skeleton`, `EmptyState`, `NotFound`
- **navigation/** — `Header`, `MobileMenu`, `Footer`, `SegmentedControl` (+ `ThemeToggle`, `applyTheme`), `Breadcrumbs`, `FilterChips`, `Pagination`, `StickyActionBar` (+ `ScrollProgress`), `CommandPalette`, `TrailNav`
- **content/** — `SectionHeader` (+ `Eyebrow`), `Stat` (+ `StatRow`), `CtaBand`, `ProjectCard`, `Testimonial`, `Tag` (+ `TagList`)
- **casestudy/** — `MetaRow`, `Callout`, `Figure`, `ArchDiagram`, `InlineCta`, `Prose`
- **cv/** — `ExperienceItem` (+ `ExperienceList`), `SkillGroup`, `LanguageList`, `ContactList`
- **forms/** — `TextField`, `ContactForm`, `CopyButton`

Intentional additions beyond the brief: `Icon` (wraps the copied Lucide set), `TextField` (the form needs a field primitive), `CopyButton` (shared by contact list and palette), `Skeleton`/`Tooltip` were in the brief; `ScrollProgress` is exported from StickyActionBar for the scroll-linked progress line.

---

## CONTENT FUNDAMENTALS

**Tone.** Modest and concrete, in the spirit of Janteloven. Confidence comes from facts, never adjectives. Say what was built, for whom, and what the number was.

**Person.** First person singular, plain: "I build calm, fast web products", "I’ll answer by email." Address the reader as "you" only in calls to action.

**Languages.** English for everything a visitor acts on or needs to understand: navigation, buttons, form labels, errors, toasts, headings, empty and 404 states. The site must never look half-translated. Norwegian appears only as small warm details that read fine even if you don't know the language, always with `lang="no"`: "Hei", "Nå", "Oslo, Norge", "Skann meg", "Kopiert" (copy feedback and its toast), "Sist oppdatert" (footer), "Ikke funnet" (404 eyebrow), "Ta kontakt", and the Norwegian slogan on the LinkedIn banner. Everything else a visitor acts on (navigation, buttons, form labels, errors, headings) stays English. The Norwegian CV (NO toggle) is fully Norwegian, which is a real translation and not a detail. Theme names are "Dag" / "Natt" in code and tokens only; the UI shows "Light" / "Dark".

**Main CTA:** "Get in touch". Slogan: **"Good products are built together."** / **"Gode produkter skapes sammen."**

**Role line.** Always two lines: **Software Engineer** (accent), **Full Stack Developer** (muted).

**Casing.** Sentence case everywhere: headings, buttons, labels ("View CV", "Download PDF", "Save contact"). No ALL CAPS except where the mono label style is used as small wayfinding text, and even then keep the source casing ("01 / Projects").

**Numbers.** Few, verifiable, with a source line: "3+ yrs · EPAM Systems · 2022 – 2026", "~2,000 · IT Marathon participants". Units spelled short (yrs, s, kB, ms). Never percentages of skill, never "10x", never unsourced growth claims.

**Punctuation.** Middle dot `·` as the separator in meta ("PDF · 2 pages · A4"). Slash `/` in eyebrows and breadcrumbs. Curly quotes, en dash for ranges ("2021 – 2025"). Coordinates as "59.91° N, 10.75° E". ISO dates in mono (2026-09-30).

**Banned.** "passionate", "rockstar", "ninja", "world-class", "cutting-edge", skill bars, star ratings, tech logos, emoji, flags, vikings, aurora gradients, stock fjord photos.

**Examples.**
- Hero lead: "I build calm, fast web products end to end, from database to the last pixel. Looking for a team in the Oslo area."
- CTA band: "Good products are built together." + "If your team is hiring in the Oslo area, I’d like to hear about it."
- Empty state: "No results — No projects with this filter yet. Client work is under NDA. Ask me about it in a call."
- 404: eyebrow "404 / Ikke funnet", title "This page is off the map.", body "The link may be old, or the page has moved." (as in `NotFound`).

---

## VISUAL FOUNDATIONS

**Colour.** Fixed core palette: stone `#F3F4F0`, spruce `#24493D`, accent `#2E5E4E`, ink `#1B2421`, muted `#5E6B65`, snow `#EEF2EE`, lichen `#BFD3C9`, contour `#9CC3B2` (28% on spruce, 13% accent on stone). Semantic tokens `--fjord-color-*` map it per theme: **Dag** (stone ground, ink text, accent links) and **Natt** ("spruce night" `#111A17`, snow text, lichen secondary, `#86BFA9` links, `#9CC3B2` focus). `.fjord-on-spruce` re-maps tokens for spruce blocks (CTA band, menu sheet, OG image), so components inside invert automatically (primary CTA becomes stone with spruce text). Status colours are desaturated and paired with soft tints. Every text pair is AA or better; ratios are in the tokens file and the Contrast card.

**Colour rules.** One dark colour per composition (spruce ground *or* ink text on stone). Accent only for text and interactive states, never large fills. The primary CTA is the only solid high-contrast button on a screen; on the home page the header CTA drops to secondary while the hero CTA is visible.

**Type.** Schibsted Grotesk 400/500/600/700 for everything readable; JetBrains Mono 400/500/700 for URLs, contacts, metadata, eyebrows, dates, code. Headings 600 with −0.01em tracking, display −0.02em, line-height 1.0–1.12. Body 16→18px, line-height 1.6, measure 66ch. Fluid `clamp()` scale from 360 to 1440px (see `tokens/typography.css`). Tabular figures for stats, dates, meta. Mono labels are wayfinding: "01 / Projects", coordinates, dates, status.

**Spacing and grid.** 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Fluid section rhythm 64→128px. Grid 4 / 8 / 12 columns at 360 / 768 / 1024+, gutters 16/24, max content 1200px. Left-aligned, asymmetric (7 + 5 splits), generous whitespace.

**Backgrounds.** Flat stone or spruce. No gradients, no photos as backgrounds, no textures except the contour lines. Contours appear as (a) the cropped ring group from the business card (`Contours`), bleeding out of one corner, centre never in the middle of the composition, or (b) seamless tile fills (`.fjord-contours-spruce/-stone/-layer`) for whole sections. One contour moment per viewport.

**Generative terrain.** `Terrain` builds a deterministic contour map from a seed (project slug) with marching squares on a small sum-of-bumps field: the main peak is forced off-centre. It is the placeholder whenever a project has no screenshot, and the texture of the OG image for case studies.

**Borders, cards, shadows.** 1px hairlines (`--fjord-color-border`) instead of shadows. Cards are mostly *not boxes*: project cards are a framed media block + text; stats are a top hairline + number. Framed things (media, testimonial, inline CTA, diagram) use 1px border, radius 8, raised background at most. Exactly one elevation, `--fjord-shadow-float`, and only for floating UI: menus, command palette, toasts, sticky bar. No coloured left-border accents.

**Radii.** 4 (tags, kbd, focus), 8 (buttons, inputs, frames), 16 (palette, sheets), pill (badges, chips, segmented). QR plate uses 6% of its width.

**Transparency and blur.** Contour lines are the only transparent layer. The sticky header uses a 94% ground colour, no blur. Scrims are a flat tint. No glassmorphism anywhere.

**Imagery.** Screenshots in a plain frame (1px border, radius 8, no device mockups). The portrait is calm natural light, gently desaturated (`--fjord-photo-filter`), 4:5 in a hairline frame with a contour group overlapping behind it; dims slightly in Natt. The warm wall in the photo is pulled toward neutral so it sits on stone.

**Motion.** Durations 120 / 200 / 320 / 560 / 1200ms; easing `fjord-out` cubic-bezier(0.2, 0.8, 0.2, 1) and `fjord-in-out` cubic-bezier(0.65, 0, 0.35, 1). Patterns: reveal (opacity + 10px rise, 50ms stagger), stat count-up once in view, underline draw-in, arrow nudge +3px on CTA hover, press 1px down / scale .985, theme cross-fade via View Transitions, shared-element project transitions (`view-transition-name: project-<slug>`), "Kopiert" toast rise, 2px scroll progress, sticky bar hide/show by scroll direction. Contours may drift over 32s and shift ≤10px with the pointer on desktop. Nothing loops in the reading area. `prefers-reduced-motion`: fades only, numbers shown final, contours static (details in › Motion and reduced motion).

**Hover / press.** Links: colour deepens (accent → spruce; Natt lighter) and underline goes from 45% to full. Primary: spruce → accent (Dag), contour → lighter mint (Natt). Secondary/ghost: faint accent-soft fill. Press: 1px down. Disabled: dashed hairline + muted text, never just opacity (buttons, icon buttons, chips, inputs). Exception: segments inside `SegmentedControl` sit in a pill and cannot carry their own dashed border, so the whole pill turns dashed and the disabled segment shows muted text (a checked segment loses its fill and keeps a hairline ring). Focus: 2px focus-ring outline with 2px offset on everything.

**Layout rules.** Sticky header (64/72px) with persistent "Get in touch". On mobile a bottom action bar ("View CV" / "Get in touch") hides on scroll down. Every page ends with the spruce CTA band, then the footer with the slogan and "Sist oppdatert" (`lang="no"`).

---

## ICONOGRAPHY

- **Set:** Lucide (ISC), copied from `lucide-static@0.460.0` (SVG files in the source project's `assets/icons/`) with stroke-width set to **1.5**, round caps and joins. The same path data is inlined in `components/brand/iconData.js` for the `Icon` component (no CDN needed at runtime).
- **Sizes:** 16 (inline, tags, links), 20 (buttons, UI), 24 (large affordances). Always `currentColor`.
- **Use:** functional only — arrows on CTAs and links (→, ↗ for external), copy/check, download/file-down, search, command, sun/moon, menu/x, map-pin, chevrons, status (circle-check / circle-alert / info).
- **Never:** filled or multicolour icons, tech/brand logos as decoration, emoji, flags. Unicode is used only as typography: `·` separator, `→` inside mono hints, `⌘` in the shortcut label.
- **No logo mark.** The brand mark is the wordmark "alpon.dev" set in JetBrains Mono 500 (`Wordmark`), `.dev` in the link colour. No symbol exists; do not draw one.

---

## Placeholder content

Real (from the 2026 CVs, verify before launch): name, role, contacts, location (Nittedal, Oslo area), work permit, experience and education, the CV text in EN / NO, the facts row (3+ yrs · EPAM Systems 2022 – 2026, ~40 students, ~2,000 IT Marathon participants, 100+ GitHub repositories).

Placeholders on the site (`site/data.js`, `site/Case.jsx`): the pet projects `Project One` … `Project Eight` and their metrics (values in brackets such as `[1.2 s]`), all case-study text and architecture diagrams, the recommendations (`[Name]`, `[Role, company]`), the posts under /thoughts, the "Nå" project (`[current project]`), and the "Coming soon" card. `#live` / `#code` links show a prototype toast until the projects exist.

---

## Themes

Dag (light) is the default, defined once on `:root, [data-theme="dag"]`; `[data-theme="dag"]` also resets a subtree to light. Natt is `[data-theme="natt"]` on `<html>` (or any subtree). `.fjord-on-spruce` remaps tokens for spruce blocks (CTA band, menu sheet, OG image, home / case-study hero in Dag), and `[data-theme="natt"] .fjord-on-spruce` deepens those blocks to spruce-deep. Theme names are "Dag" / "Natt" in code only; the UI says "Light" / "Dark".

To follow the OS until the user picks, put this in `<head>` before the stylesheets paint, so the first frame already has the right theme:

```html
<script>try{var t=localStorage.getItem('fjord-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'natt':'dag');document.documentElement.dataset.theme=t}catch(e){}</script>
```

`applyTheme(t)` (exported on the namespace) sets `data-theme`, stores the choice in `localStorage` (`fjord-theme`) and cross-fades with a View Transition. The transition is skipped under `prefers-reduced-motion: reduce`; page transitions on the site follow the same rule.

## Token categories

Every colour, size, weight, tracking, leading, space, radius, duration, easing and z-index in component and site CSS is a `--fjord-*` token. Token files (`tokens/*.css`) are the only place with literal values.

| Category | Tokens | Notes |
|---|---|---|
| Palette | `--fjord-stone`, `-spruce`, `-accent`, `-ink`, `-muted`, `-snow`, `-lichen`, `-contour`, `-spruce-deep`, `-night` | fixed by the brand pack |
| Lines | `--fjord-contour-line-stone / -spruce / -night`, `--fjord-terrain-line-stone / -spruce` | read by `Contours`, `Terrain`, `.fjord-on-spruce` |
| Semantic colour | `--fjord-color-*` incl. new `--fjord-color-danger-on-inverse` (error icon on toasts) | per theme |
| Print | `--fjord-print-bg`, `--fjord-print-text` | print stylesheet only |
| Type scale (fluid) | `--fjord-text-display … -caption`, `-stat`, `-mono-label`, `-mono-sm` | clamp() 360 → 1440px |
| Type scale (fixed UI) | `--fjord-text-ui-lg` 16, `-ui` 15, `-ui-sm` 14, `-ui-xs` 13, `--fjord-text-mono-xs` 11 | px on purpose: controls keep one size |
| OG image | `--fjord-og-text-title / -sub / -meta / -eyebrow / -small` | fixed 1200 × 630 canvas |
| Weight | `--fjord-weight-regular / -medium / -semibold / -bold` | 400 / 500 / 600 / 700 |
| Leading | `none` 1 · `display` 1.02 · `heading` 1.12 · `tight` 1.2 · `snug` 1.35 · `ui` 1.4 · `normal` 1.5 · `mono` 1.5 · `body` 1.6 | off-scale values were snapped to the nearest step |
| Tracking | `display` −0.02em · `heading` −0.01em · `body`/`mono` 0 · `label` 0.02em | |
| Space | `--fjord-space-0-5` 2 · `-1` 4 · `-1-5` 6 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 20 · `-6` 24 · `-7` 28 · `-8` 32 · `-10` 40 · `-12` 48 · `-14` 56 · `-16` 64 · `-18` 72 · `-20` 80 · `-24` 96 · `-32` 128 · `-section` · `-block` | 2 and 6 only inside small controls |
| Radius | `-xs` 3 · `-sm` 4 · `-md` 8 · `-lg` 16 · `-pill` · `-round` 50% · `-qr` 6% | |
| Motion | `--fjord-duration-120 / 200 / 320 / 560 / 1200`, `-drift` 32s, `-parallax` 600ms, `-spin` 900ms, `-loop` 1.6s, `-float` 6s, `-copied` 1800ms, `-toast` 4000ms; `--fjord-ease-out / -in-out / -linear` | JS reads durations with `fjordMs(name, fallback)` |
| z-index | `base` 0 · `raised` 1 · `overlap` 2 · `sticky` 20 · `header` 30 · `fab` 34 · `progress` 36 · `actionbar` 40 · `tooltip` 45 · `sheet` 50 · `toast` 60 · `palette` 70 · `skip` 100 | modal `<dialog>`s sit in the top layer above all |
| Fluid rhythm | `--fjord-space-page-head`, `-hero-top`, `-hero-bottom`, `-hero-sm-top`, `-hero-sm-bottom`, `-panel`, `-404`; `--fjord-scroll-offset`, `-trail` | clamp() / calc() live only in tokens |
| Opacity | `--fjord-opacity-faint` .45 · `-muted` .6 · `-soft` .72 | decorative layers and secondary text inside inverse UI |
| Inline mono | `--fjord-text-mono-inline` .9em | code, paths and mono links inside running text |
| Layout | `--fjord-header-height` 64/72, `--fjord-header-height-compact` 60, `--fjord-bp-*` 360 / 768 / 1024 / 1440, grid, `--fjord-tap-min` 44px | media queries use the literals 768 / 1024; component `@container` thresholds (440 `.fj-form`, 560 `.fj-xp-item`) are component widths |

## Class prefixes

- `fjord-*` — tokens (`--fjord-*`) and global utilities in `tokens/base.css` (`.fjord-h1`, `.fjord-on-spruce`, `.fjord-reveal`, `.fjord-contours-*`).
- `fj-*` — design-system components (root class + BEM-style `__part` / `--variant`).
- `x-*` — site layout in `site/site.css`; never used inside the system.

| Component | Root class | Component | Root class |
|---|---|---|---|
| Button | `fj-btn` | ProjectCard | `fj-pcard` |
| IconButton | `fj-iconbtn` | Stat / StatRow | `fj-stat` / `fj-stats` |
| TextLink | `fj-link` | SectionHeader / Eyebrow | `fj-sechead` / `fj-eyebrow` |
| Contours | `fj-contours` | CtaBand | `fj-band` |
| Terrain | `fj-terrain` | Testimonial | `fj-quote` |
| Portrait | `fj-portrait` | Tag / TagList | `fj-tag` / `fj-tags` |
| QrTile | `fj-qr` | MetaRow | `fj-meta` |
| OgImage | `fj-og` | Callout | `fj-callout` |
| AvailabilityBadge | `fj-avail` | Figure | `fj-figure` |
| StatusBadge | `fj-status` | ArchDiagram | `fj-arch` |
| Toast / ToastRegion | `fj-toast` / `fj-toast-region` | InlineCta | `fj-inlinecta` |
| Tooltip | `fj-tip` | Prose | `fj-prose` |
| Skeleton | `fj-skel` | ExperienceItem / List | `fj-xp-item` / `fj-xp` |
| EmptyState | `fj-empty` | SkillGroup | `fj-skills` |
| NotFound | `fj-404` | LanguageList | `fj-langs` |
| Header | `fj-header` | ContactList | `fj-contacts` |
| MobileMenu | `fj-sheet` (+ `fj-dialog`) | CopyButton | `fj-copy` |
| Footer | `fj-footer` | TextField | `fj-field` / `fj-input` |
| SegmentedControl | `fj-seg` | ContactForm | `fj-form` |
| Breadcrumbs | `fj-crumbs` | CommandPalette | `fj-palette` (+ `fj-dialog`) |
| FilterChips | `fj-chips` / `fj-chip` | Pagination (NextProject alias) | `fj-pager` |
| StickyActionBar | `fj-actionbar` | ScrollProgress | `fj-progress` |
| TrailNav | `fj-trail` | | |

## Motion and reduced motion

Durations and easings come from `tokens/motion.css`. Under `prefers-reduced-motion: reduce`:

- Tokens collapse: `--fjord-reveal-rise` 0, `--fjord-parallax-max` 0, `--fjord-duration-1200` 0 (stats show the final number), `--fjord-duration-parallax` 0.
- `base.css` sets `animation-duration` and `transition-duration` to 0.01ms with one iteration on every element, and `scroll-behavior: auto`. Loops (contour drift, portrait float, skeleton shimmer, spinner) therefore stop at once.
- Opacity fades are kept, at `--fjord-duration-200`, for `.fjord-reveal`, `.fj-toast`, `.fj-tip__bubble`, the card screenshot cross-fade and back-to-top; their transforms are dropped.
- The menu sheet and palette open without motion; View Transition pseudo-elements get `animation: none`, and `applyTheme` / page transitions skip `startViewTransition` entirely.

## Accessibility contracts

- **Hit area:** every control is at least `--fjord-tap-min` (44 × 44px). Controls drawn smaller (`fj-btn--sm`, `fj-iconbtn--sm`, `fj-seg button`, `fj-copy`, `fj-kbd`, `fj-chip`, header nav links; or any element with `.fj-hit`) get an invisible centred `::before` overlay, so the layout does not move.
- **MobileMenu, CommandPalette:** native `<dialog>` + `showModal()`: focus is contained, Esc closes (`cancel` event), `::backdrop` is the scrim, focus returns to the trigger. Palette keeps combobox / listbox / `aria-activedescendant`; ↑ ↓ Home End Enter.
- **Tooltip:** shows on hover and focus, stays open while the pointer is over the bubble, Escape hides it without moving focus or pointer (WCAG 1.4.13).
- **Toast:** auto-dismiss (`--fjord-duration-toast`, 4s) pauses on hover and focus; success / info in a polite `role="status"` stack, errors in an assertive `role="alert"` stack.
- **SegmentedControl:** radiogroup with roving tabindex; ← → ↑ ↓ Home End.
- **TextField:** placeholder uses `--fjord-color-text-muted` at full opacity (≥ 4.5:1 in both themes).

## Variants and states

| Component | Variants / props | States |
|---|---|---|
| Button | `primary` · `secondary` · `ghost`; `sm` · `md` · `lg`; `icon`, `iconEnd`, `arrow`, `block`, `href` (+ `download`, `external`) | hover, active (1px down, .985), focus-visible, disabled (dashed), loading (spinner) |
| IconButton | `ghost` · `secondary`; `sm` · `md` | hover, active, focus, disabled |
| TextLink | `inline` · `standalone` · `external`; `mono` | hover (underline 45% → full), focus, disabled |
| SegmentedControl / ThemeToggle | `md` · `lg` | checked, hover, focus, disabled |
| FilterChips | single / `multi`, counts | pressed, hover, focus, disabled |
| ProjectCard | `featured` · `compact`; `tone` spruce · stone · auto; `status` live · progress · archived | hover (terrain → screenshot on the site), focus |
| Stat / StatRow | `countUp`, `duration` (default token), `compact` row | counting, final |
| Toast | `success` · `info` · `error`; `lang` | entering, paused (hover/focus), leaving |
| ContactForm / TextField | `email` (fallback address in the error state), `status` idle · sending · success · error; `optional`, `hint`, `error`, `multiline` | invalid, focus, disabled |
| CopyButton | `label` / `done` ("Kopiert") | idle, done (1.8s) |
| QrTile | static vCard QR (`assets/qr-vcard-dag.svg` / `-natt.svg`, override with `srcDag` / `srcNatt`); `caption` | switches with theme |
| NotFound | `title`, `body`, `path`, `actions`, `seed` | — |
| MobileMenu / CommandPalette | `inline` (static frame for docs) | open, closing |
| Header | `ctaVariant` primary · secondary, `compact` | scrolled (hairline), over hero (`.fjord-on-spruce`) |
| StickyActionBar | `visible`, `threshold` | hidden on scroll down |

## Contacts and downloads

Components hold no contact data. `ContactList`, `Footer` and `MobileMenu` take email / phone / LinkedIn / GitHub / location as props; the site passes them from one object (`window.AP.person`). `ContactList` keeps `vcardHref` default `/alexander-ponomarenko.vcf`. CV downloads are real files: `/cv/alexander-ponomarenko-cv-en.pdf`, `/cv/alexander-ponomarenko-cv-no.pdf` (with `download`).
