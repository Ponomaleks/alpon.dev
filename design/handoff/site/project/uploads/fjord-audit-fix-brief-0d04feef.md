# Fix brief, round 2: Fjord design system + alpon.dev pages

Thanks, round 1 landed well: tokens, hit areas, `<dialog>` menu and palette, tooltip, toasts, contacts, Norwegian microcopy, real downloads and the new structure are all in place.
A second audit found the remaining issues below. Most are documentation drift and a few leftover literals. Work through the phases in order and after each phase give a short changelog (files touched, what changed, anything you could not do and why).

## Do not change

- Everything fixed in round 1 (token scales, hit-area overlays, dialogs, toast and tooltip behaviour, contacts as props, `Kopiert` / `Sist oppdatert` / `Ikke funnet`, real PDF and vCard links).
- The palette and contrast values in `tokens/colors.css`. Only add the tokens named below.
- Visual design, layouts, copy and data in `site/data.js`, except where a task says otherwise.
- Dashes in copy (en dash and em dash are allowed), language levels (EN "Upper-intermediate / Intermediate / Native", NO "Øvre mellomnivå / Mellomnivå / Morsmål"), the indirect description of the EPAM client.
- The static QR files `assets/qr-vcard-dag.svg` / `-natt.svg` (shortened vCard on purpose; do not regenerate).
- All fonts and weights (Schibsted Grotesk 400/500/600/700, JetBrains Mono 400/500/700).
- View Transitions stay skipped under `prefers-reduced-motion: reduce` (theme and page transitions).

## Phase 1 - Readme matches the code (highest priority)

The readme is the source of truth for the implementation, so it must not contradict the code or itself.

1. Merge the two "Themes" sections ("Themes" and "Themes and the head script") into one.
2. "Index": list only what exists in the project. Remove or mark as not included: `guidelines/`, `ui_kits/`, `assets/qr/`, `assets/card/`, `assets/banner/`, `assets/photo/`, `assets/icons/`, `_dev/`, `thumbnail.html`, `SKILL.md`, and the per-component `.d.ts` / `.prompt.md` files. Mention `assets/patterns/` (now present) and `components/forms/`, `components/casestudy/casestudy.css`.
3. "Placeholder content": describe the current data (projects `Project One` … `Project Eight`, case-study text, testimonials, posts, the "Nå" project). Remove Turplan / Kvittering / Bysykkel status / Nordlys API and "4 yrs · EPAM Systems" (facts now say 3+ yrs, EPAM 2022 – 2026). Same for the "Numbers" example in Content fundamentals.
4. "Content fundamentals › Languages": Norwegian small warm details now include UI microcopy. Update the rule and the list to: "Hei", "Nå", "Oslo, Norge", "Skann meg", "Kopiert", "Sist oppdatert", "Ikke funnet", "Ta kontakt" (always with `lang="no"`). Everything else a visitor acts on stays English.
5. "Examples": the 404 example becomes eyebrow "404 / Ikke funnet", title "This page is off the map.", body "The link may be old, or the page has moved." (as in `NotFound`).
6. "Layout rules": the footer shows "Sist oppdatert", not "Last updated".
7. "Type": JetBrains Mono is 400/500/700 (700 is shipped and used).
8. "Motion and reduced motion": state what `base.css` actually does (see Phase 2.3) so readme and CSS agree.

## Phase 2 - `tokens/base.css` utilities on the scale

The type utilities still use raw numbers, some off the leading scale, so `.fjord-h4` and component h4s render differently.

1. In `.fjord-display`, `.fjord-h1` … `.fjord-h4`, `.fjord-lead`, `.fjord-small`, `.fjord-caption`, `.fjord-stat`, `body`, `h1–h4`: use `--fjord-weight-*` instead of 400/500/600 and `--fjord-leading-*` instead of `1.2`, `1.3`, `1.5`, `1.45`, `1`. Snap the off-scale values: `.fjord-h4` 1.3 → `--fjord-leading-snug` (1.35, same as component h4s), `.fjord-caption` 1.45 → `--fjord-leading-normal` (1.5).
2. `:focus-visible { border-radius: 2px }` → `var(--fjord-radius-xs)`.
3. Reduced motion: the global rule shortens animations only. Also shorten transitions (`transition-duration: 0.01ms !important` or the fade-only approach the readme describes), keeping opacity fades where the readme says "fades only".

## Phase 3 - Disabled state follows the rule

Readme: "Disabled: dashed hairline + muted text, never just opacity". These still use opacity only:

- `.fj-chip:disabled` (`opacity:.45`)
- `.fj-seg button:disabled` (`opacity:.45`)
- `.fj-iconbtn:disabled` (`opacity:.55`)

Make them match `.fj-btn:disabled` (dashed `--fjord-color-border`, `--fjord-color-text-muted` text, `cursor:not-allowed`). If a control cannot carry a dashed border (e.g. segments inside the pill), document the exception in the readme.

## Phase 4 - Leftover literals

1. Tap size: replace the literal `44px` with `var(--fjord-tap-min)` in `.fj-btn` (height), `.fj-iconbtn`, `.fj-input` (min-height), `.fj-toast` (min-height), `.fj-palette__item`, `.x-toc a`, `.x-mtrail__list button`, `.x-demo__slot`, `.x-api__eps button`, `.x-browser__bar`, `.x-top .fj-iconbtn`.
2. Compact header: `.fj-header--compact .fj-header__in { height: 60px }` and `.fj-sheet__top { height: 60px }` → add `--fjord-header-height-compact: 60px` (or reuse `--fjord-header-height`) and use it in both.
3. Off-grid offsets: `.fj-terrain__label` (`left:12px; bottom:10px`) and `.x-shotph__tag` (`right:10px; bottom:8px`) → space tokens on the 4px grid. Also tokenise `.fj-toast-region bottom:24px`, `.x-skip left/top 12px`, `.x-top right 16px / bottom 24px / 84px`, `.fj-toast max-width: calc(100vw - 32px)`.
4. Fluid paddings: add tokens for the hero / page-head rhythm and use them instead of inline `clamp()`: `.x-head`, `.x-hero` (top and bottom), `.x-chero`, `.x-facts__panel`, `.x-browser__view`, `.fj-404`. Same for `scroll-margin-top` 96 / 120px (e.g. `calc(var(--fjord-header-height) + var(--fjord-space-6))`).
5. Easing: `linear` in `.fj-trail__fill` and `.x-mtrail__line` → `var(--fjord-ease-linear)`.
6. Opacity: add a small scale (e.g. `--fjord-opacity-faint .45`, `--fjord-opacity-muted .6`, `--fjord-opacity-soft .72`) and use it for `.fj-eyebrow i`, `.fj-crumbs li + li::before`, `.fj-404__grid`, `.fj-avail--open` ring, `.fj-toast__meta`, `.fj-tip__bubble kbd`.
7. Mono inline size: `.fj-link--mono` `.92em`, `.x-code` / `.fj-404__path` `.9em`, `.fj-prose code` `.88em` → one token (e.g. `--fjord-text-mono-inline: .9em`).
8. Natt contour line: `[data-theme="natt"] { --fjord-color-contour-line: rgba(156, 195, 178, .18) }` → add `--fjord-contour-line-night` next to `-stone` / `-spruce` and reference it.

## Phase 5 - Data and stale files

1. `ContactForm` error text hardcodes `ponomaleks@gmail.com`. Take it from a prop (e.g. `email`) and pass `P.email` from `site/Home.jsx`.
2. `site/Home.jsx`: `Testimonial href="https://linkedin.com/in/ponomalex"` → build from `P.linkedin`; hero `<h1>` "Alexander Ponomarenko" → `P.name`.
3. `ui_kits/alpon-dev/*` inside `_ds_bundle.js` (App, CaseStudy, Contact, Cv, Home, Projects, data.js) is out of sync with `site/`: `Copied` toast, hardcoded email, "4 yrs". Remove it from the bundle, or regenerate it from `site/` so it matches.
4. Prototype assets (optional, for preview only): add `alexander-ponomarenko.vcf` at the project root (Save contact currently 404s) and `cv/cv-{en,no}-{1,2}.webp` (the CV preview currently falls back to the iframe). The files exist in the code repository; upload copies if you want the prototype to show them.

## Done when

- The readme has one Themes section, an Index that matches the files, current placeholder notes, and language / type / layout rules that match the code.
- `tokens/base.css` utilities use weight, leading and radius tokens; `.fjord-h4` and component h4s share one line-height.
- No disabled state relies on opacity alone (or the exception is documented).
- No literal `44px`, `60px`, inline `clamp()` paddings, off-grid offsets, bare `linear` or raw opacity values remain in `components/**/*.css` and `site/site.css`.
- No contact data is hardcoded in components or pages; `ui_kits/alpon-dev` is removed or in sync.
- Both themes and `prefers-reduced-motion: reduce` look and behave as before.
