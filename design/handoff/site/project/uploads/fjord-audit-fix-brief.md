# Fix brief: Fjord design system + alpon.dev pages

Please fix the issues below in this project (`_ds/fjord-design-system-…` and `site/`).
They come from an audit against the project rules. Work through the phases in order and after each phase give a short changelog (files touched, what changed, anything you could not do and why).

## Do not change

- The palette and contrast values in `tokens/colors.css` (Dag, Natt, `.fjord-on-spruce`). Only add the new tokens listed below.
- Visual design, layouts, copy and data in `site/data.js`, except where a task says otherwise.
- Dashes in copy: the en dash and em dash are allowed (e.g. `Nov 2022 – Jan 2026`). Keep them.
- Language levels stay as they are: EN "Upper-intermediate / Intermediate / Native", NO "Øvre mellomnivå / Mellomnivå / Morsmål".
- Indirect description of the EPAM client (Fortune Global 500, international conference series, 28,000+ attendees) stays as is.
- The static QR files `assets/qr-vcard-dag.svg` and `assets/qr-vcard-natt.svg` intentionally encode a shortened vCard. Do not regenerate them.
- All fonts and weights currently used (Schibsted Grotesk 400/500/600/700, JetBrains Mono 400/500/700) are required. Do not remove any.
- `applyTheme` already skips View Transitions under `prefers-reduced-motion: reduce`. Keep this behaviour and apply the same rule to the page-transition code in `site/App.jsx` (it already checks `reduce()`; keep it).

## Phase 1 - Tokens (highest priority)

Rule: every color, font size, weight, letter-spacing, line-height, space, radius, duration, easing and z-index in component and site CSS comes from a `--fjord-*` token. No magic numbers.

1. Typography: add UI sizes that the components already use, then replace the literals.
   - Add e.g. `--fjord-text-ui: 15px`, `--fjord-text-ui-sm: 14px`, `--fjord-text-ui-xs: 13px`, `--fjord-text-mono-xs: 11px` (name them consistently with the scale; fluid or fixed, your call, but document it).
   - Replace ≈45 fixed `font-size` px values across `actions.css`, `content.css`, `cv.css`, `feedback.css`, `navigation.css`, `site.css` (11, 12, 13, 14, 15, 16, 34px). `.fj-sheet__nav a` 34px should map to an existing heading token.
   - `.fj-btn`: the `font` shorthand uses a token and is then overridden by `font-size:15px`. Keep one declaration that uses a token.
   - Use `--fjord-weight-*` instead of numeric `font-weight` everywhere.
   - Use `--fjord-tracking-*` instead of literal `letter-spacing` (`.02em` → `--fjord-tracking-label`, `-0.01em` → `--fjord-tracking-heading`, `-0.02em` → `--fjord-tracking-display`). Snap off-scale values (`-0.015em`, `-0.005em`) to the nearest token.
   - Use `--fjord-leading-*` instead of literal `line-height`. Off-scale values in use: 1.04, 1.08, 1.1, 1.2, 1.3, 1.4, 1.45, 1.55, 1.65. Either snap them to the scale or add the few genuinely needed steps as tokens.
2. Spacing: components use literal px almost everywhere and `--fjord-space-*` almost nowhere.
   - Replace gaps/paddings/margins with space tokens.
   - Snap values that are off the 4px grid: 2, 3, 5, 6, 9, 10, 13, 14, 18px (e.g. `.fj-btn gap:10px; padding:0 18px`, `.fj-sechead gap:14px`, `.fj-stat gap:10px`, `.fj-avail padding:0 13px`, `.fj-status padding:0 9px`, `.fj-chip padding:0 14px`, `.fj-toast padding:10px 16px 10px 14px`, `.fj-copy padding:0 10px`, `.fj-input padding:10px 12px`, `.fj-form gap:18px`). If a 2px or 6px step is really needed, add it as a token (`--fjord-space-0-5`, `--fjord-space-1-5`).
3. Colors: remove the 6 hardcoded values outside the token files.
   - `feedback.css` `.fj-toast--error .fj-icon{color:#E0998F}` → new token `--fjord-color-danger-on-inverse` (defined for Dag and Natt).
   - `brand.css` `.fj-terrain--spruce` `rgba(156,195,178,.42)` and `.fj-terrain--stone` `rgba(46,94,78,.22)` → new tokens `--fjord-terrain-line-spruce` / `--fjord-terrain-line-stone`.
   - `components/brand/Contours.jsx` tone map `rgba(156,195,178,.28)` / `rgba(46,94,78,.13)` duplicates `--fjord-color-contour-line`; read the CSS variable instead.
   - `site/site.css` `[data-theme="natt"] .fjord-on-spruce{--fjord-color-bg-raised:#21433A}` → move into `colors.css` as part of the Natt mapping for `.fjord-on-spruce`.
4. Radius: add `--fjord-radius-xs: 3px` and use it for `.fj-prose code`, `.fj-kbd kbd`, `.fj-palette__esc`, `.x-code`. Use the existing `--fjord-radius-qr` in `.fj-qr` instead of `6%`.
5. Motion: replace literal durations with tokens: `600ms` (`.fj-contours__layer`), `900ms` (`.fj-btn__spin`), `1.6s` (`.fj-skel`), `6s` (`.x-orb` float in `site.css`). Add e.g. `--fjord-duration-spin`, `--fjord-duration-loop`, `--fjord-duration-float`. In JS, `Stat` `duration=1200` and `ToastRegion` `duration=2400` should default to values that match the tokens (read the CSS variable or reference the token name in a comment).
6. z-index: add a scale (e.g. `--fjord-z-sticky`, `--fjord-z-header`, `--fjord-z-actionbar`, `--fjord-z-progress`, `--fjord-z-sheet`, `--fjord-z-toast`, `--fjord-z-palette`, `--fjord-z-skip`) and replace literals 20/30/35/40/50/60/70/100. Fix the collision: `.x-top` and `.fj-progress` both use 35.
7. `tokens/colors.css` repeats the whole Dag block in `:root` and `[data-theme="dag"]`. Define it once (e.g. `:root, [data-theme="dag"] { … }`).
8. Breakpoints: CSS variables cannot be used in media queries, so keep the 768/1024 literals but stay on the scale 360 / 768 / 1024 / 1440. Align the off-scale container/media queries (440px in `.fj-form`, 560px in `.fj-xp-item`, `.x-rows`) or document why they are container-specific.

## Phase 2 - Touch targets (44px minimum)

Every interactive control must have a hit area of at least 44 × 44px. The visual size may stay smaller if the hit area is extended (padding or a `::before` overlay), without layout shift.

- `.fj-seg button` (28px, `--lg` 36px)
- `.fj-copy` (32px)
- `.fj-kbd` palette trigger (32px)
- `.fj-chip` (36px)
- `.fj-btn--sm` (36px), `.fj-iconbtn--sm` (36px)
- `.fj-header__nav a` (36px)
- `site.css` `.x-toc a` (min-height 36px)

## Phase 3 - Dialogs, overlays, feedback (accessibility)

1. `MobileMenu`: has `aria-modal` but no focus trap; Tab escapes to the page. Rebuild on native `<dialog>` with `showModal()` (focus containment, Esc, `::backdrop`), keep focus return and scroll lock, keep the open animation with a reduced-motion fallback.
2. `CommandPalette`: same, rebuild on `<dialog>`; return focus to the trigger on close; remove the `setTimeout(…,10)` focus hack (use `autofocus` on the input or focus after `showModal()`). Keep the combobox / listbox / `aria-activedescendant` pattern.
3. `Tooltip`: must be dismissable with Escape without moving focus or pointer (WCAG 1.4.13), and stay open while the pointer is over the bubble.
4. `Toast` / `ToastRegion`: pause the auto-dismiss timer on hover and focus; error toasts use `role="alert"` (assertive), success/info stay polite. Consider a slightly longer default than 2.4 s.
5. `SegmentedControl`: add Home / End keys (radiogroup pattern).
6. `TextField`: the placeholder uses the muted color at `opacity:.8`, which can fall below 4.5:1. Use the muted color at full opacity (or a token that passes 4.5:1 in both themes).

## Phase 4 - Content and data

1. Contacts must come from one source. `ContactList`, `Footer` and `MobileMenu` hardcode email/phone (and `ContactList` location) as default props. Remove the contact defaults and pass them from `window.AP.person` in `site/`. Keep `vcardHref` default `/alexander-ponomarenko.vcf`.
2. Norwegian microcopy (small warm details are in Norwegian by project rule):
   - `CopyButton` done label and the `Copied` toast in `site/App.jsx` → `Kopiert`.
   - `Footer` `Last updated` → `Sist oppdatert`.
   - `NotFound` default title `Page not found` → `Ikke funnet` as eyebrow, with an English headline (match `OffMap` in `site/ext.jsx`).
   - Keep the existing Norwegian bits: "Hei", "Nå", "Oslo, Norge", "Skann meg", "Ta kontakt" where used.
3. Downloads are real files, not toasts:
   - `#pdf` → `/cv/alexander-ponomarenko-cv-en.pdf` or `/cv/alexander-ponomarenko-cv-no.pdf` by current CV language (EN outside the CV page), with the `download` attribute.
   - `#vcf` → `/alexander-ponomarenko.vcf` with `download`.
   - Remove those two entries from `PLACEHOLDER_LINKS` in `site/App.jsx` and the "Download CV" toast in the command palette; make the palette action open the PDF. (`#live` and `#code` stay as prototype placeholders.)
   - CV "View original PDF" preview: replace the grey line mock with the page images `/cv/cv-{en,no}-1.webp` and `/cv/cv-{en,no}-2.webp` (add them to `assets/` in this project if needed for the preview).

## Phase 5 - Structure, broken references, docs

1. `tokens/base.css` references `../assets/patterns/contours-tile-*.svg`, which do not exist in the project, so `.fjord-contours-spruce`, `.fjord-contours-stone`, `.fjord-contours-layer` are broken. Either add the SVG tiles or remove these classes.
2. Duplicates: `NotFound` vs `OffMap` (site), `NextProject` vs `Pagination`, `QrTile` (encodes the alpon.dev URL) vs static vCard QR files. Keep one of each: promote `OffMap` into the system as `NotFound`, decide whether `NextProject` stays, and either drop `QrTile` or make it render the static vCard assets.
3. Categories: move `ContactForm`, `TextField`, `CopyButton` from `cv/` to a new `forms/` category; move `Tag` / `TagList` from `feedback/` to `content/`; give `casestudy/` its own CSS file instead of living in `content.css`.
4. Class naming: document the three prefixes (`fjord-*` utilities and tokens, `fj-*` components, `x-*` site) and add a table that maps each component to its root class (`ProjectCard` → `fj-pcard`, `ExperienceItem` → `fj-xp-item`, `SectionHeader` → `fj-sechead`, `CtaBand` → `fj-band`, `Testimonial` → `fj-quote`, `MobileMenu` → `fj-sheet`, `Pagination` → `fj-pager`, `StickyActionBar` → `fj-actionbar`, `TrailNav` → `fj-trail`, `CommandPalette` → `fj-palette`, `FilterChips` → `fj-chips`, `LanguageList` → `fj-langs`, `SkillGroup` → `fj-skills`, `ContactList` → `fj-contacts`, `AvailabilityBadge` → `fj-avail`, `StatusBadge` → `fj-status`, `Breadcrumbs` → `fj-crumbs`). Renaming is optional; the table is required.
5. `readme.md`, `_ds_manifest.json` and `_adherence.oxlintrc.json` are listed in the project but return 404. Restore them. The readme should cover: themes and the head script, token categories (including the new ones from Phase 1), the prefix convention, motion and reduced-motion rules, and per-component variants and states.

## Done when

- No hex/rgba, px font sizes, numeric font weights, literal letter-spacing/line-height, off-grid spacing or literal z-index remain in `components/**/*.css` and `site/site.css` (token files excepted).
- Every interactive control has a 44 × 44px hit area.
- Menu and palette trap focus, close on Esc, and return focus; tooltip closes on Esc; toasts pause on hover/focus.
- Both themes and `prefers-reduced-motion: reduce` look and behave as before (no visual regressions apart from hit areas).
- PDF and vCard links download the real files.
- The readme documents everything above.
