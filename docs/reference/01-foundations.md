# Spec 01 · Foundations: scaffold, tokens, base components

Status: ready
Branch: `v2` (the stub keeps running on `main` until the new site reaches parity)

## Goal

Set up the Astro project and build the foundation every page will use: design tokens for both themes, fonts, base styles, the core component set, article typography, and automated quality gates. The result is a `/styleguide` page that renders every component in both themes and matches the Claude Design handoff.

No real pages yet (Home, CV, Projects come in spec 02+).

## Inputs

- `design/handoff/` - Claude Design bundle ("Fjord" design system). Main source for token values and component specs.
- `design/brand/BRAND.md`, `design/brand/tokens.json` - brand rules and fixed core palette.
- `design/screenshots/` - reference screenshots (styleguide frames, article page, live preview, API "Try it", QR tile).
- Existing stub repo: reuse the woff2 font subsets, `_headers` and `wrangler.jsonc` as a starting point.

## Scope

### 1. Project scaffold
- Astro 6 + TypeScript strict, `output: 'static'`, `trailingSlash: 'never'`, `build.format: 'file'` or `'directory'` (pick one, keep URLs identical to the stub).
- `wrangler.jsonc`: static assets from `./dist`, `not_found_handling: "404-page"`, custom domain stays configured for production only, and a `"previews": {}` block (required by `npx wrangler preview`, which Workers Builds runs for non-production branches).
- Workers Builds builds `v2` as a preview version; document the preview URL in the README.
- ESLint + Prettier (Astro plugin), `astro check` in CI.
- `design/` folder with the handoff bundle and brand pack committed as read-only references.

### 2. Design tokens
- `src/styles/tokens.css` with `--fjord-*` custom properties generated from the handoff:
  - core palette (stone, spruce, accent, ink, muted, snow, lichen, contour),
  - semantic color tokens for `[data-theme="dag"]` and `[data-theme="natt"]` (bg, bg-raised, bg-inverse, text, text-muted, text-inverse, link, link-hover, focus-ring, border, border-strong, contour-line, selection, cta-bg, cta-text, cta-hover, success, warning, danger),
  - fluid type scale (display, h1-h4, lead, body, body-small, caption, stat-number, mono-label, mono-small) with `clamp()` between 360 and 1440px,
  - spacing (4, 8, 12, 16, 24, 32, 48, 64, 96, 128), radii (4, 8, 16, pill), borders, one elevation,
  - motion: durations (120, 200, 320, 560, 1200), easings (`fjord-out`, `fjord-in-out`),
  - layout: container max width, gutters per breakpoint, grid columns (4 / 8 / 12).
- A small script (`scripts/check-contrast.ts`) that verifies all text / background pairs from the semantic tokens meet WCAG AA in both themes. Runs in CI.

### 3. Theme
- Inline script in `<head>` sets `data-theme` before first paint: stored choice, otherwise `prefers-color-scheme`.
- `ThemeToggle` component ("Dag / Natt"), accessible (button with `aria-pressed` or a labelled switch), cross-fade using motion tokens, instant with reduced motion.
- `color-scheme` set correctly for native controls and scrollbars.

### 4. Fonts and base styles
- Self-hosted woff2 (Latin subset incl. æ ø å), `@font-face` with `font-display: swap`, preload only Schibsted Grotesk 400 and 600.
- Metric-matched fallback faces (`size-adjust`, `ascent-override`, ...) so swapping fonts causes no layout shift.
- `base.css`: modern reset, body text, headings with tracking -0.01em, tabular numbers utility, `:focus-visible` ring from tokens, `::selection`, skip link, `prefers-reduced-motion` global rule.

### 5. Components (`src/components/`)
Each component: typed props, all states from the handoff (default, hover, focus-visible, active, disabled), both themes, no hardcoded values.

| Component           | Notes                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`            | variants primary / secondary / ghost / icon; sizes; optional trailing arrow with hover nudge; renders `<a>` when `href` is set                                                   |
| `Link`              | inline, standalone with arrow, external (icon + `rel="noopener"`)                                                                                                                |
| `Badge`             | availability ("Open to work · Oslo area") and status (Live / In progress / Archived) with status dot                                                                             |
| `Tag`               | mono text tag for tech stack                                                                                                                                                     |
| `Stat`              | number + label + optional context; tabular figures; count-up once when visible (IntersectionObserver, off with reduced motion; the final number is in the HTML)                  |
| `SectionHeader`     | mono eyebrow ("01 / Projects") + heading, heading level as a prop                                                                                                                |
| `Callout`           | "Note" variant from the article design (icon + mono label + text)                                                                                                                |
| `CodeBlock`         | Shiki with a custom Fjord theme for Dag and Natt (colors from the handoff), optional filename line, copy button with "Kopiert" toast                                             |
| `Toast`             | polite live region, auto-dismiss, used by copy actions                                                                                                                           |
| `Contours`          | static brand contour group from `design/brand/patterns` as an inline SVG component: variants spruce / stone, size, crop position. Generative version comes later                 |
| `Header` / `Footer` | layout shells only: wordmark, nav links, ThemeToggle, persistent "Ta kontakt" CTA slot; footer with contacts from `src/data/contact.ts`, "Oslo, Norge", slogan, "Sist oppdatert" |
| `SkipLink`          | first focusable element                                                                                                                                                          |

### 6. Article typography (`Prose`)
- `Prose` wrapper and `prose.css` matching the article design: measure ~66ch, body 16 to 18px fluid, h2 / h3, paragraphs, lists, pull quote (large text with left rule), inline code, `CodeBlock`, `Callout`, figure with caption, images.
- Works for markdown content collections (MDX components mapping) and for HTML coming from an external loader later.

### 7. Data
- `src/data/contact.ts`: name, role, email, phone, LinkedIn, GitHub, location, site URL. Typed, single source. (vCard and QR generation come in the contact spec.)

### 8. Styleguide page
- `/styleguide`: every token group and component with all states, a sample article using `Prose`, both themes side by side or switchable.
- `noindex`, excluded from sitemap, not linked from navigation.

### 9. Quality gates (GitHub Actions on every PR)
- `astro check`, lint, build.
- Playwright visual tests of `/styleguide` at 390 / 834 / 1440 in Dag and Natt, plus with `prefers-reduced-motion`.
- axe: zero violations on `/styleguide`.
- Lighthouse CI on the built site with the budget from CLAUDE.md.
- Contrast check script.
- Fail the build if the long dash (U+2014) or en dash (U+2013) appears in `src/` text content.

## Out of scope

Real pages (Home, CV, Projects, case studies, 404 content), CV migration, short-link redirects, vCard and QR, command palette, generative contours, trail navigation, View Transitions, contact form, blog loader. These come in later specs.

## Acceptance criteria

1. `npm run build` produces a static site; the `v2` branch deploys to a Workers preview URL; production (`main`) is untouched.
2. All colors, spacing, type sizes, radii and motion values in components come from `--fjord-*` tokens (grep finds no hex colors outside `tokens.css`).
3. Theme follows the system by default, the toggle persists the choice, and there is no flash of the wrong theme on reload.
4. Fonts load without layout shift (CLS <= 0.02 on `/styleguide`).
5. `/styleguide` shows every component from section 5 and the sample article, in both themes, visually matching the handoff at 390 / 834 / 1440 (differences listed in the PR).
6. Keyboard: every interactive element is reachable, has a visible focus ring, and works with Enter / Space.
7. With `prefers-reduced-motion: reduce` there are no transforms or loops; `Stat` shows final values immediately.
8. axe reports zero violations; the contrast script passes in both themes.
9. Lighthouse mobile on `/styleguide`: all categories >= 95, initial JS <= 50 KB gzip.
10. CI runs all checks on the PR and is green.

## Deliverables

- PR from `v2` with the scaffold, tokens, components, `Prose`, `/styleguide`, tests and CI.
- README section: how to run, test, and where the preview URL is.
- A short list of design questions or conflicts found in the handoff.