---
status: approved         # draft | approved
feature_size: "S"
tool: "code"             # copied from docs/design-system.md
updated_at: "2026-10-04"
---

# Screens — base-components

> The canonical **screen manifest** — every screen in every state — produced by `screens` (between
> `api` and `tasks`) and read by `tasks` (each `ui` task cites SCR ids + states), `implement`
> (builds the screen to the declared states) and `review` (the built screen must match this).
> Downstream stages reference **only this manifest** — never the raw design files.

## Source

- **Tool:** code (from `docs/design-system.md`).
- **File:** inline wireframes below.
- **Page designs (primary reference):**
  - Shell (SCR-01, SCR-02, SCR-04 and the panel SCR-03): `design/handoff/site/project/site/App.jsx` (skip link, Header, `main`, CtaBand, Footer, MobileMenu, StickyActionBar, ToastRegion) and `site.css` (`.x-skip`, `.x-main`, `.x-end`).
  - SCR-02: `design/handoff/site/project/site/Misc.jsx` (`Lost`), screenshots `design/screenshots/{dag,natt}_not_found_{390,834,1440}.png`.
  - SCR-01 has no page design of its own (interim, spec §1.2 IS-03); Home (`site/Home.jsx`) replaces its content in step 4. SCR-04 has no page design: it is an Owner page.
  - Natt and the open menu panel have no screenshot of their own beyond the Not-found set; use `design/handoff/site/alpon.dev standalone.html` for them.
- **Component references (secondary, building blocks):** the site copy of the design system, `design/handoff/site/project/_ds/…/components/{actions,brand,content,feedback,navigation}/*.css` and its bundle. Where it differs from `design/handoff/design-system/`, the site copy is used (`CLAUDE.md` Sources of truth).
- **Inventory:** `docs/design-system.md` §Component inventory. The manifest uses inventory names. Where the repo file gets a different name (sad.md §5), it is given once here:

  | Inventory name | Repo component (sad.md §5) |
  |---|---|
  | TextLink | `ui/Link` |
  | AvailabilityBadge, StatusBadge | `ui/Badge` (two variants of one component) |
  | Stat / StatRow | `ui/Stat` |
  | SectionHeader, Eyebrow | `ui/SectionHeader` |
  | Toast / ToastRegion | `ui/Toast` and the region in `BaseLayout` |
  | Terrain + NotFound map panel | `brand/TerrainMap` |
  | StickyActionBar | `layout/MobileBar` |
  | ThemeToggle (SegmentedControl) | `layout/ThemeToggle` |

- **Differences from the page design** are not repeated here; they are spec §1.3 D-01 to D-13 and are cited by ID.
- **Derivation:** there is no API contract (static site), so every state below comes from a spec §5 AC or a sad.md §6 branch. Confirmed per screen with the Owner on 2026-10-04; approved by the Owner the same day together with the decisions G-1 to G-7 (§Decided gaps).

### Shell states (apply to SCR-01, SCR-02 and SCR-04 alike)

`BaseLayout` gives these to every page, so they are listed once. Each screen's table points back here and names only what differs.

| State | Trigger / condition | What the Visitor sees | Components | Source |
|---|---|---|---|---|
| header-compact | Screen below 768 | Wordmark, one "Get in touch" (no arrow), menu button. No "Projects", no search | Header, Wordmark, Button, IconButton (`menu`) | AC-02, D-01, D-02, wireframe S-1 |
| header-wide | Screen 768 and wider | Wordmark, links "CV" and "Contact", theme switch, one "Get in touch" with an arrow. No "Projects", no search | Header, Wordmark, ThemeToggle, Button (arrow) | AC-01, AC-02, wireframe S-2 |
| header-current | The page sets `current` | That link has `aria-current="page"` and the underline marker, in the header and in SCR-03. In this feature only on SCR-04 samples (IS-04) | Header | AC-01, AC-24 |
| header-scrolled | Scripts on, the page is scrolled away from its top | The header stays at the top and has a bottom border; the border goes at the top of the page. Also under reduced motion. With scripts off there is no border | Header | AC-03, D-13 |
| header-cta-secondary | Below 768 while the page has a bar that is not `inert`; or `headerCta: 'secondary'` | Header "Get in touch" is outlined | Header, Button (secondary) | AC-23, D-06, sad.md §6 flow 2 |
| header-cta-primary | From 768; or below 768 once the bar has scrolled away; or below 768 on a page without the bar | Header "Get in touch" is filled | Header, Button (primary) | AC-23, sad.md §6 flow 2 |
| header-on-spruce | The page sets `headerVariant: 'on-spruce'` | Header in the on-spruce colours. In this feature only as a sample on SCR-04 (IS-04) | Header | AC-21, AC-24 |
| theme-dag / theme-natt | `data-theme` on `<html>` | The page in that theme; every theme switch shows the same theme as selected (`aria-pressed`) | ThemeToggle | AC-10, AC-12 |
| theme-changing | A segment of the theme switch is activated | Cross-fade where page transitions are supported and motion is allowed; at once otherwise. Kept as the Theme choice | ThemeToggle | AC-10, AC-29, sad.md §6 flow 1 |
| theme-storage-blocked | Site storage throws | The theme still changes for this page. **No error UI** | ThemeToggle | AC-11, sad.md §6 flow 1 `else storage blocked` |
| no-script | Scripts off (`:root:not([data-theme])`) | Theme by device preference. Theme switch and menu button are not displayed and leave no gap. No scroll border, the bar never moves, no Toast. CV and contact stay reachable: header links from 768, the bar below 768, the footer everywhere | Header, StickyActionBar, Footer | AC-06, AC-09, AC-11, D-09, D-12, D-13 |
| bar-on-screen | Below 768, the page has not left the bar out | Bar fixed to the bottom: "View CV" (secondary, file icon) and "Get in touch" (primary). The page keeps the bar's height free at its end, so the bar never covers the last lines or the focused element | StickyActionBar, Button ×2, Icon | AC-07, wireframe S-1 |
| bar-away | Scripts on, motion allowed, scrolling down | The bar slides out; it is `inert` (no focus, not announced). Header action becomes primary. The bar is not hidden while keyboard focus is inside it (G-4), and it is always shown near the top of the page (G-5) | StickyActionBar | AC-08, AC-23, sad.md §6 flow 2, G-4, G-5 |
| bar-returned | Same, scrolling up | The bar is back, header action secondary again | StickyActionBar | AC-08, G-5 |
| bar-static | Scripts off, or reduced motion | The bar stays in place while the page scrolls; header action stays secondary | StickyActionBar | AC-09, D-11 |
| bar-absent | Screen 768 and wider; or the page sets `mobileBar: false` | No bar. No clearance is reserved | — | AC-07, AC-24 |
| skip-link | First Tab on the page | "Skip to content" is visible at the top left with focus; activating it moves focus to `<main id="main">`. Hidden again on blur | NEW: SkipLink | AC-13, wireframe S-3 |
| cta-band | The page has not left the band out | Band above the footer, on spruce: "Let’s build something good together.", "If your team is hiring in the Oslo area, I’d like to hear about it.", primary "Get in touch", secondary "Download CV" (English PDF, or Norwegian with `cvLang: 'no'`; `download`). Static contours, no drift (step 4) | CtaBand, Contours, Button ×2 | AC-20, wireframe S-4 |
| footer | Every page | Slogan "Good products / are built together.", columns "Contact" (email, phone), "Elsewhere" (LinkedIn, GitHub, `rel="noopener noreferrer"`), "Based in" ("Nittedal, Norge" `lang="no"`, 60.07° N, 10.87° E), base line "© {year} Alexander Ponomarenko" and "Sist oppdatert {date}" (`lang="no"`, `<time>`) | Footer, TextLink | AC-14, D-05, D-10, wireframe S-5 |
| toast-shown | A script dispatches `fjord:toast` | A Toast in the polite live region, bottom centre; above the bar while the bar is on screen. Takes no focus, leaves by itself | Toast / ToastRegion | AC-30, wireframe S-6 |
| page-transition | A link to another page of the site, transitions supported, motion allowed | Content cross-fades, the header stays still. Otherwise the new page simply opens | Header | AC-32 |
| reduced-motion | `prefers-reduced-motion: reduce` | Nothing slides, grows or loops: skip link, menu, Toast appear instantly or fade; theme changes at once; bar-static applies; header-scrolled still switches | all Shell parts | AC-28 |
| interactive states | Hover, keyboard focus, pressed on any Shell control | The control changes colour only on hover and pressed and does not move; where motion is allowed the Button arrow and the external-link icon nudge on hover and keyboard focus, and with reduced motion they stay still (AC-28); the Fjord focus ring on `:focus-visible`; target at least 44 × 44; nothing is told by hover alone | Button, IconButton, TextLink, ThemeToggle | AC-25, D-08 |
| loading | N/A: static HTML, no client data fetch | — | — | repo ADR-0001 |
| empty | N/A: fixed content from `src/data/contact.ts`; a missing fact fails the build check, it is not rendered empty | — | — | AC-15 |
| error | N/A: no error UI in the Shell. Failures are silent by design (theme-storage-blocked) or are the no-script state | — | — | AC-11, sad.md §8 Error handling |

```text
S-1  Shell at 390 — header-compact, header-cta-secondary, bar-on-screen
+--------------------------------------+
| alpon.dev        ( Get in touch ) [≡]|  sticky header, compact height
|--------------------------------------|  border only in header-scrolled
|                                      |
|   <main id="main" tabindex="-1">     |
|   page content                       |
|                                      |
|  (cta-band, if the page keeps it)    |
|  (footer, S-5)                       |
|   ... bar-height clearance ...       |
+======================================+
| [ ▤ View CV      ] [ Get in touch  ] |  fixed bar: secondary + primary, 1fr 1fr
+--------------------------------------+
  no-script: [≡] not displayed, "Get in touch" moves to the right edge
  bar-away:  bar slid out and inert, header button filled
```

```text
S-2  Shell at 834 / 1440 — header-wide (D-01, D-02: no Projects, no Search)
+--------------------------------------------------------------------------------+
| alpon.dev    CV   Contact                    ( Light | Dark )  [ Get in touch → ]|
|--------------------------------------------------------------------------------|
|   <main> page content, wrap max-width from tokens, left-aligned               |
|   (cta-band)  (footer)                                   no bar at 768 and wider|
+--------------------------------------------------------------------------------+
  header-current: the current link is underlined (inset bottom line), text colour full
  no-script: the theme switch is not displayed
```

```text
S-3  skip-link (focused)                 S-6  toast-shown at 390, bar on screen
+--------------------------------------+ +--------------------------------------+
| [ Skip to content ]  ← raised, focus | |   page content                       |
| alpon.dev        ( Get in touch ) [≡]| |        ( ✓ Kopiert  meta )           |  above the bar,
|                                      | +======================================+  never over it
                                         | [ View CV ]       [ Get in touch ]   |
                                         +--------------------------------------+
```

```text
S-4  cta-band (on spruce)                             S-5  footer at 1440
+--------------------------------------------------+  +---------------------------------------------------------------+
| Let’s build something good together.        (h2)  |  | Good products       Contact        Elsewhere      Based in     |
| If your team is hiring in the Oslo area, I’d      |  | are built together. email          linkedin.com/… Nittedal, Norge
| like to hear about it.                            |  |                     phone          github.com/…   60.07° N, 10.87° E
| [ Get in touch ]  ( Download CV )     ~contours~  |  |---------------------------------------------------------------|
+--------------------------------------------------+  | © 2026 Alexander Ponomarenko          Sist oppdatert 2026-..-.. |
  one dark surface; contours bottom-right, static     +---------------------------------------------------------------+
                                                        834: slogan full width, then two columns per row
                                                        390: everything in one column, base line stacked
```

## Screens

### SCR-01 — Home placeholder

Interim page (IS-03): the content stays as in `src/pages/index.astro` (the name as `h1`, the role line with "Oslo, Norge"). New here is the Shell around it, with default page options. It is the surface for the Shell e2e checks with the real bar, including AC-30 at 390 (sad.md §8 Toast). No visual baseline of its own.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | Direct visit to `/`; the wordmark; "Back to home" on SCR-02; "Contact" and "Get in touch" until the contact place exists (IS-01) | BaseLayout (default options), NEW: SkipLink, Header, `h1` + `p`, CtaBand, Footer, StickyActionBar (below 768), ToastRegion | wireframe below; S-1, S-2 |
| Shell states | See §Shell states. All apply; `cta-band` is present, `bar-on-screen` below 768 | as there | S-1 to S-6 |
| header-current | N/A: the placeholder sets no `current` | — | — |
| loading / empty | N/A: see §Shell states | — | — |
| error | N/A: no data and no action that can fail | — | — |

```text
SCR-01 default — 390
+--------------------------------------+
| alpon.dev        ( Get in touch ) [≡]|
|                                      |
|  Alexander Ponomarenko         (h1)  |
|  Software Engineer · Full Stack      |
|  Developer · Oslo, Norge       (p)   |
|                                      |
| ██ Let’s build something good ██████ |  cta-band (S-4)
| ██ [ Get in touch ] ( Download CV ) █|
|--------------------------------------|
|  Good products are built together.   |  footer (S-5)
|  Contact / Elsewhere / Based in      |
+======================================+
| [ ▤ View CV      ] [ Get in touch  ] |
+--------------------------------------+
  primary buttons in page content: 1 (the band). On screen: at most 2 (AC-23)
  834 / 1440: header-wide (S-2), no bar
```

### SCR-02 — Not-found page ("Ikke funnet")

Rebuilt from the page design (`Misc.jsx` `Lost`), replacing the interim page of fjord-foundation. Page options: `noindex`, `ctaBand: false`. **The Sticky action bar stays** below 768, as in the 390 screenshot (fjord-foundation OQ-02 item 7); only the closing band is left out. Full-page visual baseline at 390 / 834 / 1440 × Dag / Natt; Design match compares with `design/screenshots/*_not_found_*.png`, differences limited to D-01 to D-06, D-08.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default, stacked | Any address the site does not have, screen below 1024. The edge answers 404 with `404.html` | BaseLayout (`noindex`, `ctaBand: false`), NEW: SkipLink, Header, NotFound (Eyebrow code line, `h1`, body, Button primary with arrow, map panel: Terrain, grid, dashed route, Icon `map-pin`), Footer, StickyActionBar (below 768) | wireframes 390 and 834 below |
| default, two columns | Same, screen 1024 and wider | same; text 5 parts, map 7 parts, centred vertically | wireframe 1440 below |
| Shell states | See §Shell states. All apply except `cta-band` | as there | S-1 to S-6 |
| cta-band | N/A: left out on this page; the footer follows the content | — | AC-17 |
| button hover / focus / pressed | Pointer hover, keyboard focus, press on "Back to home" | Button: colour only, Fjord focus ring; the Button does not move, its arrow nudges where motion is allowed and stays still with reduced motion | AC-25, AC-28 |
| screen reader | Assistive technology reads the page content | Code line, heading, body, "Back to home" are announced. The whole map panel is `aria-hidden` (map, pin label, coordinates) | AC-19 |
| with-projects | N/A: owned by step 7. With no Published project "See projects" is **not rendered** | — | AC-18, D-03 |
| requested address shown | N/A: never rendered; the body ends after "…has moved." | — | AC-17, D-04 |
| loading / empty | N/A: see §Shell states | — | — |
| error | N/A: this page *is* the error state of navigation; nothing on it can fail | — | AC-17 |

**Content (AC-17):**

- Code line: `404 / Ikke funnet`, mono eyebrow; "404" in the link colour, "Ikke funnet" in `lang="no"`.
- `h1`: "This page is off the map." (h1 size, balanced wrap).
- Body: "The link may be old, or the page has moved." (lead size, muted, narrow measure).
- Action: "Back to home" → `/`, Button primary with arrow. The only action in the page content, so the page content has one primary (AC-18, AC-23).
- Map panel (decoration): framed terrain at 4:3 with a 4 × 4 grid, the coordinates label "59.91° N · 10.75° E" bottom left (kept as in the design, spec §1.3 note), a dashed route leaving the frame to the top right, and the pin with "You are here" outside the frame. Inline SVG, colours from tokens through CSS classes, no `style=` (sad.md §2).
- Top space from the not-found space token, bottom space the section token; both through the generator (AC-26).

```text
SCR-02 default, stacked — 390
+--------------------------------------+
| alpon.dev        ( Get in touch ) [≡]|
|                                      |
|  404 / Ikke funnet        (eyebrow)  |
|  This page is                        |
|  off the map.                  (h1)  |
|  The link may be old, or the page    |
|  has moved.                  (lead)  |
|  [ Back to home  → ]      (primary)  |
|                                      |
|                              ◉       |  pin, outside the frame
|  +---------------------------+ You are here
|  |  ~ terrain contours ~   ..·'      |  dashed route crosses the frame edge
|  |  + grid 4×4        ..··'  |       |
|  |  59.91° N · 10.75° E      |       |  all aria-hidden
|  +---------------------------+       |
|--------------------------------------|
|  footer (S-5), no cta-band           |
+======================================+
| [ ▤ View CV      ] [ Get in touch  ] |
+--------------------------------------+
  834: same order, header-wide, h1 on one line, map nearly full width, no bar
```

```text
SCR-02 default, two columns — 1440
+--------------------------------------------------------------------------------+
| alpon.dev    CV   Contact                    ( Light | Dark )  [ Get in touch → ]|
|                                                                                |
|                                                                       ◉        |
|                                       +----------------------------+ You are here
|  404 / Ikke funnet                    |  ~ terrain contours ~   ..·'           |
|  This page is                         |                    ..··'   |           |
|  off the map.                         |      ( o )   ...··'        |           |
|  The link may be old, or the page     |  + grid 4×4                |           |
|  has moved.                           |                            |           |
|  [ Back to home  → ]                  |  59.91° N · 10.75° E       |           |
|                                       +----------------------------+           |
|--------------------------------------------------------------------------------|
|  footer (S-5): slogan + three columns, base line                               |
+--------------------------------------------------------------------------------+
  columns 5fr / 7fr, text centred vertically against the map; no bar, no cta-band
```

### SCR-03 — Mobile menu panel

A native modal `<dialog>` (ADR-0002) over the page it was opened on: SCR-01, SCR-02 or SCR-04, below 768 only. It covers the whole screen, so the bar and the page are behind it and cannot be reached. The page design is `MobileMenu` in the site copy of the design system (`.fj-sheet`), called from `App.jsx`. axe runs with the panel open.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| closed (default) | The page as loaded | MobileMenu (dialog without `open`, not displayed); the menu button in the header | S-1 |
| open | Scripts on, below 768, the menu button is activated | MobileMenu: Wordmark, IconButton (`x`, "Close menu"), numbered links "01 CV", "02 Contact", email and phone as TextLink, Work region "Oslo, Norge" (`lang="no"`), ThemeToggle, Button "Get in touch" (primary, large, full width, arrow), Contours (ridge, bottom left). Focus is on the first link. No "Projects", no search. The page behind does not scroll while the panel is open (G-3) | AC-04, AC-02, D-02, D-07, G-3; wireframe below |
| open, Natt | Open while the page is in Natt | same, Natt tokens; readable, contrast pairs in the manifest of the contrast check | AC-04 |
| open, current link | The page set `current` | That link is in the link colour with `aria-current="page"`. Only via SCR-04 in this feature (IS-04) | AC-01, AC-24 |
| theme changed inside | A segment of the panel's ThemeToggle is activated | The theme changes **at once, with no cross-fade** (G-6); **the panel stays open**; the panel switch and the header switch agree | AC-10, G-6, sad.md §6 Mobile menu `the theme switch in the panel` |
| closed by Escape or the close button | Escape, or the close IconButton | The panel closes, focus returns to the menu button | AC-05 |
| closed by a link | Any link in the panel, also one to a place on the current page | The panel closes; the target opens, or the page moves to that place. After a same-page link focus goes to the link target, not back to the menu button (G-1) | AC-05, G-1 |
| closed by width | The screen becomes 768 or wider while the panel is open | The panel closes; the header shows its links and theme switch. Focus is left to the platform default, no extra logic (G-2) | sad.md §6 Mobile menu `the screen becomes 768 or wider`, ADR-0002, G-2 |
| not reachable | Scripts off, or screen 768 and wider | The menu button is not displayed, so the panel cannot open. CV and contact come from the bar and the header | AC-06, D-12 |
| reduced-motion | `prefers-reduced-motion: reduce` | The panel appears and leaves instantly or with a fade; no slide | AC-28 |
| interactive states | Hover, focus, pressed on links, switch, buttons | As §Shell states `interactive states`; every target at least 44 × 44 | AC-25 |
| loading / empty | N/A: static markup from `src/data/contact.ts` | — | — |
| error | N/A: nothing in the panel can fail. A missing `showModal` is not a state of this manifest (Owner decision, 2026-10-04: supported by every current browser; with scripts off the button is hidden) | — | — |

```text
SCR-03 open — 390 (full screen, top layer)
+--------------------------------------+
| alpon.dev                        [✕] |  Wordmark, IconButton "Close menu"
|                                      |
|  01  CV                    ← focus   |  h1-size links, mono index,
|  ------------------------------------|  rule under each link
|  02  Contact                         |
|  ------------------------------------|
|                                      |
|                                      |
|  ponomaleks@gmail.com                |  mailto / tel as links (mono)
|  +47 405 94 584                      |
|  Oslo, Norge                         |  Work region, lang="no" (D-07)
|  ( Light | Dark )                    |  ThemeToggle
|  [ Get in touch                  → ] |  Button primary, large, block
| ~contours, bottom left~              |
+--------------------------------------+
  visible primary buttons while open: 1
```

### SCR-04 — Styleguide

Owner page at `/styleguide`: `noindex`, linked from nowhere, not in the sitemap (AC-22). Page options: `mobileBar: false`, `ctaBand: false`, `noindex`. It uses the **real** Header (its ThemeToggle switches Dag and Natt) and the **real** Footer. Everything else is a sample inside a section. Each section is one visual capture at 390 / 834 / 1440 × Dag / Natt, so a section must be stable: no fixed or top-layer element may overlap it. Exempt from AC-23 and from the bar rule of AC-24.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | The Owner types the address | BaseLayout (`noindex`, `mobileBar: false`, `ctaBand: false`), NEW: SkipLink, Header (real), sections listed below, Footer (real), ToastRegion | wireframe below |
| theme-dag / theme-natt | The real header's ThemeToggle (below 768: through SCR-03) | every section in that theme | AC-21 |
| demo states | Always: `data-demo-state="hover|focus|active"` on sample elements, `disabled` where the component has it | Button, IconButton, TextLink, ThemeToggle segments, header links. Static, no pointer needed | AC-21, sad.md §8 Styleguide states |
| toast triggered | The Owner activates "Show toast" (scripts on) | The real Toast in the real ToastRegion; leaves by itself. For e2e only, never in a visual capture | AC-21, AC-30 |
| toast sample | Always | A static Toast in its section (message with meta, e.g. "Kopiert" `lang="no"`), not in the live region. This is what the visual capture shows | AC-21 |
| Shell states | See §Shell states. Apply to the real Header, Footer and SkipLink | as there | S-2, S-3, S-5 |
| bar / cta-band (real) | N/A: left out on this page; both appear only as samples | — | AC-21 |
| no-script | Scripts off | Sections still render (static). The real theme switch, the menu button and "Show toast" are not displayed, all through the scripts-off gate (G-7) | AC-11, G-7, sad.md §8 Scripts off |
| reduced-motion | `prefers-reduced-motion: reduce` | Samples are static anyway; the real Toast appears and leaves instantly or with a fade | AC-28 |
| loading / empty | N/A: static page, every section has fixed sample content | — | — |
| error | N/A: nothing to fail | — | — |

**Sections (one per row; "States shown" is what AC-21 requires of it):**

| Section | Components | States shown |
|---|---|---|
| Button | Button | primary, secondary; default size and large; with arrow, with icon, block; default / hover / focus / pressed / disabled |
| Link | TextLink | default / hover / focus / pressed; external profile link |
| IconButton | IconButton | default / hover / focus / pressed / disabled; 44 × 44 box visible |
| Icon | Icon | every name in the typed map (at least `arrow-right`, `menu`, `x`, `file-text`, `map-pin`) at the icon sizes |
| Badge | AvailabilityBadge, StatusBadge | availability: open / talking / employed; status: live / progress / archived |
| Tag | Tag / TagList | single tag, list that wraps |
| Stat | Stat / StatRow | final number with label, as a row; no count-up (AC-25) |
| SectionHeader | SectionHeader, Eyebrow | sizes; with and without eyebrow and lead |
| Toast | Toast | static sample (success, with meta); the "Show toast" Button |
| Contours | Contours | ridge and corner, static |
| Terrain map | Terrain + NotFound map panel | the panel as on SCR-02 |
| Wordmark | Wordmark | default, on spruce |
| Skip link | NEW: SkipLink | sample in its focused look, in the flow (not fixed) |
| Theme switch | ThemeToggle | Light selected, Dark selected; segment hover / focus |
| Header variants | Header (samples, in the flow, not sticky) | default; bordered (scrolled); on spruce; secondary call to action. One with a current link (IS-04) |
| Mobile menu panel | MobileMenu markup as a **static sample** in a phone-width frame; **not** a dialog opened with `showModal()` (it would cover the page in the top layer) | open, with a current link |
| Sticky action bar | StickyActionBar (inline sample, positioned inside its frame) | on screen |
| Closing band | CtaBand (sample) | default, on spruce |
| Footer | Footer (the real one, at the end of the page) | default |

Samples are not live Shell parts: a sample header's menu button and theme switch, and the sample panel's switch, must not be wired twice into the Shell scripts in a way that breaks AC-12 (every *real* switch agrees with the page theme). Sample switches show a fixed selection.

```text
SCR-04 default — 1440 (390 / 834: same order, one column)
+--------------------------------------------------------------------------------+
| alpon.dev    CV   Contact                    ( Light | Dark )  [ Get in touch → ]|  real Header
|                                                                                |
|  Styleguide                                                              (h1)  |
|                                                                                |
|  Button ---------------------------------------------------------- (section)  |
|   [ Primary → ] [hover] [focus] [pressed] [disabled]                           |
|   ( Secondary ) (hover) (focus) (pressed) (disabled)      large · block · icon |
|  Link · IconButton · Icon · Badge · Tag · Stat · SectionHeader ------------    |
|  Toast -----------------------------------------------------------            |
|   ( ✓ Kopiert  meta )   static sample           [ Show toast ]                 |
|  Contours · Terrain map · Wordmark · Skip link · Theme switch --------------   |
|  Header variants ---------------------------------------------------           |
|   | default | bordered | on spruce | secondary call to action |   in the flow  |
|  Mobile menu panel ------------   Sticky action bar ---   Closing band -----   |
|   +---------+ static sample       +--------------+        ██ on spruce ██      |
|   | 01 CV   | 390-wide frame      | View CV | Get|                             |
|   +---------+                     +--------------+                             |
|--------------------------------------------------------------------------------|
|  real Footer (S-5)                                                             |
+--------------------------------------------------------------------------------+
  no real bar, no real cta-band; nothing fixed over a section
```

## Decided gaps

Raised by sad.md §6 "Gaps the flows revealed" (G-1 to G-6) and by this stage (G-7). **Decided by the Owner on 2026-10-04**; `tasks` and `plan-tests` build and test them as written and do not reopen them. The state tables above already carry each decision.

| # | Screen / state | Decision |
|---|---|---|
| G-1 | SCR-03 closed by a link (same page) | The panel closes and focus goes to the link target, not back to the menu button (sad.md §6 gap 1) |
| G-2 | SCR-03 closed by width | Platform default focus; no extra logic (sad.md §6 gap 2) |
| G-3 | SCR-03 open | Page scroll is locked while the dialog is open, with one CSS rule and no script: `html:has(dialog[open]) { overflow: hidden }`. The bar state therefore cannot change under the panel (sad.md §6 gap 3) |
| G-4 | Shell bar-away | The script does not hide the bar while keyboard focus is inside it (sad.md §6 gap 4) |
| G-5 | Shell bar-away / bar-returned | The prototype's threshold is the decision: a scroll change smaller than 8 px is ignored; the bar hides on a move down and returns on a move up; within 40 px of the top of the page it is always shown (`StickyActionBar` in the site copy of the design system; sad.md §6 gap 5) |
| G-6 | SCR-03 theme changed inside | A theme change made inside the open panel is instant, with no cross-fade. AC-29's cross-fade applies to the header switch only (sad.md §6 gap 6) |
| G-7 | SCR-04 no-script | "Show toast" is hidden by the scripts-off gate, like the other script-only controls |

## New components

| Component | Why no existing primitive fits | Registered in design-system |
|---|---|---|
| NEW: SkipLink (`src/components/layout/SkipLink.astro`) | The inventory has no skip link: the page design defines it only as a site-level rule (`.x-skip` in `site.css`), not as a design-system component. It is a fixed, focus-revealed link with its own layer token, which TextLink and Button do not cover. Required by AC-13 and stub-parity P-25 | pending |

The page-local `home-link` and `ridge-contours` of fjord-foundation are not new here: they are replaced by Button and Contours (spec §1.1), and their rows in `docs/design-system.md` are retired when `implement` registers the built components.
