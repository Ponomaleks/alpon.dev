# Fjord — design system for alpon.dev

Fjord is the brand and web design system of **Alexander Ponomarenko**, Software Engineer / Full Stack Developer in the Oslo area, Norway. It started as a business card and now covers the personal site **alpon.dev** (landing, CV in English + Norwegian, portfolio with case studies, later a blog), the LinkedIn banner and the Open Graph image. The site exists to get him hired in Norway, so every page ends in a clear call to action and states a few honest numbers.

Nordic minimalism: light **stone** ground, deep **spruce** green, and topographic **contour lines** that read both as a map of Nordmarka and as isolines on a chart. "Quiet creative": one expressive detail per composition, everything else calm.

## Sources

- Brand pack (uploaded, now in this project): `guidelines/BRAND.source.md` (original rules, in Ukrainian), `guidelines/tokens.source.json`, the original `tokens.css` (superseded by `tokens/`), fonts, contour SVGs, QR SVG/PNG, business card and LinkedIn banner PNGs, portrait photo.
- Live site: https://alpon.dev (currently a one-page "under construction" version: name, role, contacts, CV embed). Copy such as "Hei!", "View CV", "Email me", "Save contact", "Adds me to your phone's contacts (.vcf)", "PDF · 2 pages · A4", "Snart kommer mer" comes from there.
- No codebase or Figma file was provided. Components are authored from the brief + brand pack.

## Index

- `styles.css` — entry point; `@import`s only. Link this one file.
- `tokens/` — `fonts.css`, `colors.css` (palette + Dag / Natt / on-spruce), `typography.css`, `spacing.css` (space, grid, radii, elevation), `motion.css`, `base.css` (element defaults, type classes, contour fills, motion helpers).
- `fonts/` — Schibsted Grotesk 400–700, JetBrains Mono 400/500/700 (TTF, OFL).
- `assets/` — `patterns/` contour tiles + masks, `qr/`, `card/`, `banner/`, `photo/portrait.png`, `icons/` (Lucide SVGs, 1.5px).
- `components/` — React primitives; each has `.jsx`, `.d.ts`, `.prompt.md`, and one card per folder. Component CSS lives next to them (`brand.css`, `actions.css`, …) and is imported by `styles.css`.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Motion, Brand, Voice).
- `ui_kits/alpon-dev/` — click-through recreation of the website (`index.html`, `mobile.html`).
- `thumbnail.html`, `SKILL.md`.
- `_dev/all.jsx` + `ui_kits/alpon-dev/index.dev.html` — bundle-free preview used while authoring (transpiles the component sources in the browser). Safe to delete; regenerate if components change.

## Components

- **brand/** — `Icon`, `Contours`, `Terrain` (+ `terrainPath`), `QrTile`, `Wordmark`, `Portrait`, `OgImage`
- **actions/** — `Button`, `IconButton`, `TextLink`
- **feedback/** — `AvailabilityBadge`, `StatusBadge`, `Tag` (+ `TagList`), `Toast` (+ `ToastRegion`), `Tooltip`, `Skeleton`, `EmptyState`, `NotFound`
- **navigation/** — `Header`, `MobileMenu`, `Footer`, `SegmentedControl` (+ `ThemeToggle`, `applyTheme`), `Breadcrumbs`, `FilterChips`, `Pagination`, `StickyActionBar` (+ `ScrollProgress`), `CommandPalette`, `TrailNav`
- **content/** — `SectionHeader` (+ `Eyebrow`), `Stat` (+ `StatRow`), `CtaBand`, `ProjectCard`, `Testimonial`
- **casestudy/** — `MetaRow`, `Callout`, `Figure`, `ArchDiagram`, `NextProject`, `InlineCta`, `Prose`
- **cv/** — `ExperienceItem` (+ `ExperienceList`), `SkillGroup`, `LanguageList`, `CopyButton`, `ContactList`, `TextField`, `ContactForm`

Intentional additions beyond the brief: `Icon` (wraps the copied Lucide set), `TextField` (the form needs a field primitive), `CopyButton` (shared by contact list and palette), `Skeleton`/`Tooltip` were in the brief; `ScrollProgress` is exported from StickyActionBar for the scroll-linked progress line.

---

## CONTENT FUNDAMENTALS

**Tone.** Modest and concrete, in the spirit of Janteloven. Confidence comes from facts, never adjectives. Say what was built, for whom, and what the number was.

**Person.** First person singular, plain: "I build calm, fast web products", "I’ll answer by email." Address the reader as "you" only in calls to action.

**Languages.** English for everything a visitor acts on or needs to understand: navigation, buttons, form labels, errors, toasts, headings, empty and 404 states. The site must never look half-translated. Norwegian appears only as small warm details that read fine even if you don't know the language, always with `lang="no"`: the greeting "Hei", the location "Oslo, Norge", the QR caption "Skann meg", and the Norwegian slogan on the LinkedIn banner. The Norwegian CV (NO toggle) is fully Norwegian, which is a real translation and not a detail. Theme names are "Dag" / "Natt" in code and tokens only; the UI shows "Light" / "Dark".

**Main CTA:** "Get in touch". Slogan: **"Good products are built together."** / **"Gode produkter skapes sammen."**

**Role line.** Always two lines: **Software Engineer** (accent), **Full Stack Developer** (muted).

**Casing.** Sentence case everywhere: headings, buttons, labels ("View CV", "Download PDF", "Save contact"). No ALL CAPS except where the mono label style is used as small wayfinding text, and even then keep the source casing ("01 / Projects").

**Numbers.** Few, verifiable, with a source line: "4 yrs · EPAM Systems", "1.1 s median LCP on 4G". Units spelled short (yrs, s, kB, ms). Never percentages of skill, never "10x", never unsourced growth claims.

**Punctuation.** Middle dot `·` as the separator in meta ("PDF · 2 pages · A4"). Slash `/` in eyebrows and breadcrumbs. Curly quotes, en dash for ranges ("2021 – 2025"). Coordinates as "59.91° N, 10.75° E". ISO dates in mono (2026-09-30).

**Banned.** "passionate", "rockstar", "ninja", "world-class", "cutting-edge", skill bars, star ratings, tech logos, emoji, flags, vikings, aurora gradients, stock fjord photos.

**Examples.**
- Hero lead: "I build calm, fast web products end to end, from database to the last pixel. Looking for a team in the Oslo area."
- CTA band: "Good products are built together." + "If your team is hiring in the Oslo area, I’d like to hear about it."
- Empty state: "No results — No projects with this filter yet. Client work is under NDA. Ask me about it in a call."
- 404: "Page not found — This page is off the map. The link may be old, or the page has moved."

---

## VISUAL FOUNDATIONS

**Colour.** Fixed core palette: stone `#F3F4F0`, spruce `#24493D`, accent `#2E5E4E`, ink `#1B2421`, muted `#5E6B65`, snow `#EEF2EE`, lichen `#BFD3C9`, contour `#9CC3B2` (28% on spruce, 13% accent on stone). Semantic tokens `--fjord-color-*` map it per theme: **Dag** (stone ground, ink text, accent links) and **Natt** ("spruce night" `#111A17`, snow text, lichen secondary, `#86BFA9` links, `#9CC3B2` focus). `.fjord-on-spruce` re-maps tokens for spruce blocks (CTA band, menu sheet, OG image), so components inside invert automatically (primary CTA becomes stone with spruce text). Status colours are desaturated and paired with soft tints. Every text pair is AA or better; ratios are in the tokens file and the Contrast card.

**Colour rules.** One dark colour per composition (spruce ground *or* ink text on stone). Accent only for text and interactive states, never large fills. The primary CTA is the only solid high-contrast button on a screen; on the home page the header CTA drops to secondary while the hero CTA is visible.

**Type.** Schibsted Grotesk 400/500/600/700 for everything readable; JetBrains Mono 400/500 for URLs, contacts, metadata, eyebrows, dates, code. Headings 600 with −0.01em tracking, display −0.02em, line-height 1.0–1.12. Body 16→18px, line-height 1.6, measure 66ch. Fluid `clamp()` scale from 360 to 1440px (see `tokens/typography.css`). Tabular figures for stats, dates, meta. Mono labels are wayfinding: "01 / Projects", coordinates, dates, status.

**Spacing and grid.** 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Fluid section rhythm 64→128px. Grid 4 / 8 / 12 columns at 360 / 768 / 1024+, gutters 16/24, max content 1200px. Left-aligned, asymmetric (7 + 5 splits), generous whitespace.

**Backgrounds.** Flat stone or spruce. No gradients, no photos as backgrounds, no textures except the contour lines. Contours appear as (a) the cropped ring group from the business card (`Contours`), bleeding out of one corner, centre never in the middle of the composition, or (b) seamless tile fills (`.fjord-contours-spruce/-stone/-layer`) for whole sections. One contour moment per viewport.

**Generative terrain.** `Terrain` builds a deterministic contour map from a seed (project slug) with marching squares on a small sum-of-bumps field: the main peak is forced off-centre. It is the placeholder whenever a project has no screenshot, and the texture of the OG image for case studies.

**Borders, cards, shadows.** 1px hairlines (`--fjord-color-border`) instead of shadows. Cards are mostly *not boxes*: project cards are a framed media block + text; stats are a top hairline + number. Framed things (media, testimonial, inline CTA, diagram) use 1px border, radius 8, raised background at most. Exactly one elevation, `--fjord-shadow-float`, and only for floating UI: menus, command palette, toasts, sticky bar. No coloured left-border accents.

**Radii.** 4 (tags, kbd, focus), 8 (buttons, inputs, frames), 16 (palette, sheets), pill (badges, chips, segmented). QR plate uses 6% of its width.

**Transparency and blur.** Contour lines are the only transparent layer. The sticky header uses a 94% ground colour, no blur. Scrims are a flat tint. No glassmorphism anywhere.

**Imagery.** Screenshots in a plain frame (1px border, radius 8, no device mockups). The portrait is calm natural light, gently desaturated (`--fjord-photo-filter`), 4:5 in a hairline frame with a contour group overlapping behind it; dims slightly in Natt. The warm wall in the photo is pulled toward neutral so it sits on stone.

**Motion.** Durations 120 / 200 / 320 / 560 / 1200ms; easing `fjord-out` cubic-bezier(0.2, 0.8, 0.2, 1) and `fjord-in-out` cubic-bezier(0.65, 0, 0.35, 1). Patterns: reveal (opacity + 10px rise, 50ms stagger), stat count-up once in view, underline draw-in, arrow nudge +3px on CTA hover, press 1px down / scale .985, theme cross-fade via View Transitions, shared-element project transitions (`view-transition-name: project-<slug>`), "Copied" toast rise, 2px scroll progress, sticky bar hide/show by scroll direction. Contours may drift over 32s and shift ≤10px with the pointer on desktop. Nothing loops in the reading area. `prefers-reduced-motion`: fades only, numbers shown final, contours static.

**Hover / press.** Links: colour deepens (accent → spruce; Natt lighter) and underline goes from 45% to full. Primary: spruce → accent (Dag), contour → lighter mint (Natt). Secondary/ghost: faint accent-soft fill. Press: 1px down. Disabled: dashed hairline + muted text, never just opacity. Focus: 2px focus-ring outline with 2px offset on everything.

**Layout rules.** Sticky header (64/72px) with persistent "Get in touch". On mobile a bottom action bar ("View CV" / "Get in touch") hides on scroll down. Every page ends with the spruce CTA band, then the footer with the slogan and "Last updated".

---

## ICONOGRAPHY

- **Set:** Lucide (ISC), copied from `lucide-static@0.460.0` into `assets/icons/*.svg` with stroke-width set to **1.5**, round caps and joins. The same path data is inlined in `components/brand/iconData.js` for the `Icon` component (no CDN needed at runtime).
- **Sizes:** 16 (inline, tags, links), 20 (buttons, UI), 24 (large affordances). Always `currentColor`.
- **Use:** functional only — arrows on CTAs and links (→, ↗ for external), copy/check, download/file-down, search, command, sun/moon, menu/x, map-pin, chevrons, status (circle-check / circle-alert / info).
- **Never:** filled or multicolour icons, tech/brand logos as decoration, emoji, flags. Unicode is used only as typography: `·` separator, `→` inside mono hints, `⌘` in the shortcut label.
- **No logo mark.** The brand mark is the wordmark "alpon.dev" set in JetBrains Mono 500 (`Wordmark`), `.dev` in the link colour. No symbol exists; do not draw one.

---

## Themes

Dag is the default on `:root`. Natt is `[data-theme="natt"]` on `<html>` (or any subtree; `[data-theme="dag"]` resets a subtree). To follow the OS until the user picks, put this in `<head>` before the stylesheet paints:

```html
<script>try{var t=localStorage.getItem('fjord-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'natt':'dag');document.documentElement.dataset.theme=t}catch(e){}</script>
```

`applyTheme(t)` (exported with SegmentedControl) switches with a View Transition cross-fade and stores the choice.

## Placeholder content

Projects (Turplan, Kvittering, Bysykkel status, Nordlys API), their metrics, the case-study text, the testimonial and most CV details in the UI kit are **samples** to show layout. Only name, role, contacts, location and "4 yrs · EPAM Systems" are real.
