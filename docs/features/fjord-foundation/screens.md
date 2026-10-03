---
status: draft            # draft | approved
feature_size: "S"
tool: "code"             # copied from docs/design-system.md
updated_at: "2026-10-03"
---

# Screens — fjord-foundation

> The canonical **screen manifest** — every screen in every state — produced by `screens` (between
> `api` and `tasks`) and read by `tasks` (each `ui` task cites SCR ids + states), `implement`
> (builds the screen to the declared states) and `review` (the built screen must match this).
> Downstream stages reference **only this manifest** — never the raw design files.

## Source

- **Tool:** code (from `docs/design-system.md`).
- **File:** inline wireframes below.
- **Page design (primary reference):** SCR-02 is the 404 screen of the site design: `design/handoff/site/project/site/Misc.jsx` (not-found screen), `design/handoff/site/alpon.dev standalone.html`, screenshots `design/screenshots/{dag,natt}_not_found_{390,834,1440}.png`. SCR-01 is a temporary placeholder with no page design; Home (`site/Home.jsx`) replaces it in step 4. **Known gap:** the SCR-02 manifest below was written from the component demo, not from the page design, and differs from it in fifteen ways (map panel, layout, heading, code line separator, body copy, title scale, sticky action bar, code line colour, spacing, button size, code line typography, actions offset, section min-height, arrow size, body measure); see spec §8 OQ-02. It is kept as built and is rewritten from the page design in step 3.
- **Component references (secondary, building blocks):** `design/handoff/design-system/project/components/feedback/NotFound.jsx` + `feedback.css` (`.fj-404*`), `components/brand/Contours.jsx` (`ridge`) and `components/actions/actions.css` (`.fj-btn--primary`). The page-design files (`Misc.jsx`, the standalone HTML) are listed only under the primary reference above.
- **Inventory:** `docs/design-system.md` §Component inventory. Only `BaseLayout` is built in the repo; the page-local pieces below are registered there as pending, and step 3 promotes them to `components/ui/Button` and `components/brand/Contours`.

### Cross-screen states (apply to SCR-01 and SCR-02 alike)

These come from AC-01..AC-06, AC-14 and AC-15, and the BaseLayout gives them to both screens. Neither screen has a layout of its own for them, so they are listed once here. Each screen's table points back to this list.

| State | Trigger / condition | What the Visitor sees | Source |
|---|---|---|---|
| theme-dag | Stored Theme choice `dag`; or no usable choice and the device prefers light | The page in Dag from the first frame | AC-01, AC-02 |
| theme-natt | Stored Theme choice `natt`; or no usable choice and the device prefers dark | The page in Natt from the first frame; native controls and scrollbars are dark (`color-scheme`) | AC-01, AC-02 |
| theme-fallback | Stored value unknown, or site storage blocked (the access throws) | Same as theme-dag or theme-natt by device preference. **No error UI.** | AC-03, sad.md §6 flow 1 `alt` |
| no-script | Scripts turned off | Theme by device preference through the CSS-only Natt block, brand fonts, readable contrast. Identical to the theme states. | AC-04 |
| font-fallback | Cold cache, before the brand fonts arrive, or a font file fails | Text in the metric-matched Arial/Roboto fallback. Swapping to the brand font causes no visible shift (CLS ≤ 0.02). If a font fails, the fallback simply stays. | AC-05, AC-06, AC-15 |
| reduced-motion | `prefers-reduced-motion: reduce` | The same static page. Nothing moves in this feature: no drift, parallax or arrow nudge. The color transitions (links in `base.css`, the home-link) are declared only under `prefers-reduced-motion: no-preference`, so none runs here. | AC-14 |
| loading | N/A: static HTML with no client data fetch, so there is no loading UI. Only fonts arrive late, and font-fallback covers that. | — | ADR-0001 (repo) |

## Screens

### SCR-01 — Home placeholder

A temporary page on the shared layout until step 4. It proves that a page with only a title and description gets the whole Fjord base (AC-13). Content stays as in the current `src/pages/index.astro`: the name as `h1` and the role line with "Oslo, Norge". Checked by axe and Lighthouse only, with no visual baseline (spec §3).

| State | Trigger / condition | Components | Source-ref |
|---|---|---|---|
| default | Direct visit to `/`, or "Back to home" from SCR-02 | `BaseLayout` (existing), `h1` + `p` under `base.css` element styles | wireframe below |
| theme-dag / theme-natt / theme-fallback / no-script / font-fallback / reduced-motion | See §Cross-screen states | `BaseLayout` | same wireframe, token values differ |
| loading | N/A: see §Cross-screen states | — | — |
| empty | N/A: fixed static content; nothing can be empty | — | — |
| error | N/A: no data and no action that can fail. The only failure is the storage error in AC-03, and it is silent by design (theme-fallback). | — | — |

```text
SCR-01 default — 390 (same structure at 834 / 1440; left-aligned, wrap max-width from tokens)
+--------------------------------------+
|                                      |   <html lang="en" data-theme="dag|natt">
|  Alexander Ponomarenko         (h1)  |   page background: --fjord-color-bg
|  Software Engineer · Full Stack      |   text: --fjord-color-text
|  Developer · Oslo, Norge       (p)   |   muted line: --fjord-color-text-muted
|                                      |
+--------------------------------------+
  no header / footer / nav yet (step 3)
```

### SCR-02 — Not-found page ("Ikke funnet")

> **Interim 404.** This section describes the built page only. Step 3 rewrites SCR-02 against Misc.jsx; see OQ-02.

Built from the design-system `NotFound` component demo (`.fj-404`), not from the page design (see §Source, known gap). It is the feature's only visual-test surface: 390 / 834 / 1440 × Dag / Natt.

| State | Trigger / condition | Components | Source-ref |
|---|---|---|---|
| default (no Published project) | Any address the site does not have. The edge returns 404 status + `404.html` with the same CSP. | `BaseLayout` (`noindex`); page-local: code line, `h1`, body, **NEW: home-link** (primary), **NEW: ridge-contours** | wireframe below |
| with-projects | N/A: owned by step 7. With no Published project, "See projects" is **not rendered** (AC-08). | — | — |
| theme-dag / theme-natt / theme-fallback / no-script / font-fallback / reduced-motion | See §Cross-screen states | as default | same wireframe |
| home-link hover / focus-visible | Pointer hover, or keyboard focus | NEW: home-link. Only the color changes, through the component demo Button's tokens (`--fjord-color-cta-bg` → `--fjord-color-cta-hover`, text `--fjord-color-cta-text`). The focus ring is the base `:focus-visible`. No transform or arrow nudge. | wireframe below (no layout change) |
| loading | N/A: see §Cross-screen states | — | — |
| empty | N/A: fixed static content | — | — |
| error | N/A: this page *is* the error state of navigation (AC-07, sad.md §6 flow 2). Nothing on it can fail. | — | — |

**Content (AC-07, spec §1 design differences):**

- Code line: `404 · Ikke funnet` in the mono label style (`.fj-404__code`). "Ikke funnet" is wrapped in `lang="no"` (sad.md §8). The requested path is **never** shown (interim 404, see spec §8 OQ-02: the page design reads "404 / Ikke funnet" with the "404" in the link colour).
- Title `h1`: "Page not found" (`.fj-404__title`, display size; the component demo's default; the page design says "This page is off the map." at h1 size, see spec §8 OQ-02 items 3 and 6).
- Body: "This page is off the map. The link may be old, or the page has moved." (the component demo's default; the page design's body omits the first sentence, see spec §8 OQ-02 item 5; `.fj-404__body`, lead size, muted, `--fjord-measure-narrow` (48ch; page design 46ch)).
- Action: "Back to home" → `/`, primary, with an arrow. The **only** action (AC-08).
- `<meta name="robots" content="noindex">` through `BaseLayout noindex`.

**Layout (built; from the component demo's `feedback.css`, not from the page design):** the section is `position: relative` and does not clip: only the ridge wrapper has `overflow: hidden`, so the home-link focus ring is not cut (review F-08; the component demo clips the whole section). It has a min-height (`calc(var(--fjord-space-1) * 105)`, the component demo's 420px; the page design has none), content stacked at the bottom (`justify-content: flex-end`; the page design centres it), and a `--fjord-space-4` gap (the component demo's 16px; the page design has `--fjord-space-5`). See spec §8 OQ-02 items 9 and 13. The ridge sits behind the content (content at `z-index: 1`), anchored top-right at 150% of the section's width and height. All values come from tokens; no component-demo value is written into the page as a literal (ADR-0003).

**Ridge constraints (user decision, this run):**

- A build-time inline `<svg>` with `aria-hidden="true"` and `focusable="false"`. No `<style>` inside the SVG and no `style=` attributes (the CSP audit fails the build otherwise, ADR-0002).
- Color comes from CSS, not SVG attributes: a class on the SVG and a rule in the page stylesheet, `stroke: var(--fjord-color-contour-line)`. Presentation attributes can't take `var()`, and literal colors fail Stylelint.
- The SVG is absolutely positioned inside the `ridge-contours` wrapper (`inset: 0`), so it takes no space in the flow, causes no layout shift and is never the LCP element. The wrapper crops the ring group; the section does not. The rings' centre is off the middle of the composition (BRAND.md).
- No drift, parallax or animation. Step 3 rebuilds the page per `Misc.jsx` and re-baselines the 404 visuals (spec §8 OQ-02); the page design has a map panel and no ridge background (OQ-02 items 1 and 2).

**Home-link constraints (user decision, this run):**

- `<a href="/">` styled page-locally after the component demo's `.fj-btn--primary`: `--fjord-tap-min` height (44px), `--fjord-radius-md`, `--fjord-weight-semibold`. The page design's Button differs in padding, gap, font size and arrow size (spec §8 OQ-02 items 10 and 14); step 3 replaces the link with `components/ui/Button` and re-baselines.
- The arrow is an inline SVG with `aria-hidden="true"` and `stroke="currentColor"`, a 1.5px line icon at `--fjord-icon-sm` (16px; the page design has 18px, OQ-02 item 14), and no `style=`.
- Hover and focus change color only, through tokens. Nothing moves; the color change is a transition only under `prefers-reduced-motion: no-preference`.

```text
SCR-02 default — 390
+--------------------------------------+
|                  ╭──────────────╮    |  ridge contours: top-right, cropped by their
|               ╭──┤ ╭────────╮   │    |  own wrapper (review F-08), aria-hidden,
|              ╭┤  │ │  ╭──╮  │   │    |  stroke --fjord-color-contour-line
|              │╰──┤ ╰──┴──┴──╯   │    |
|                                      |
|  404 · Ikke funnet       (mono, muted)|  "Ikke funnet" lang="no"
|  Page not                            |
|  found                    (h1, display)
|  This page is off the map. The link  |
|  may be old, or the page has moved.  |  lead, muted, --fjord-measure-narrow (48ch; page design 46ch)
|                                      |
|  [ Back to home  → ]     (primary)   |  44px, the only action
+--------------------------------------+
```

```text
SCR-02 default — 1440 (834 is the same structure with narrower gutters)
+--------------------------------------------------------------------------------+
|                                                    ╭──────────────────────╮    |
|                                               ╭────┤  ╭────────────╮      │    |
|                                              ╭┤    │  │   ╭────╮   │      │    |
|                                              │╰────┤  ╰───┴────┴───╯      │    |
|  404 · Ikke funnet                                                             |
|  Page not found                                                                |
|  This page is off the map. The link may be old, or                             |
|  the page has moved.                                                           |
|  [ Back to home  → ]                                                           |
+--------------------------------------------------------------------------------+
  left-aligned, content at the bottom of the section; no header/footer (step 3)
```

## New components

These are **page-local** pieces in `src/pages/404.astro` (and its page stylesheet), registered as pending in `docs/design-system.md`. Step 3 promotes them.

| Component | Why no existing primitive fits | Registered in design-system |
|---|---|---|
| NEW: home-link (page-local primary link + arrow) | The repo has no Button yet; `components/ui/Button` is a step-3 base component (spec §3). It is styled after the component demo's Button. | pending (listed in docs/design-system.md): step 3 replaces it with `components/ui/Button`, built from the page design, and re-baselines (spec §8 OQ-02) |
| NEW: ridge-contours (page-local static inline SVG) | The repo has no brand components yet; `components/brand/Contours` is step 3. It is static (no parallax or drift) so this feature has no motion. | pending (listed in docs/design-system.md): step 3 builds `components/brand/Contours`; the page design's 404 has a map panel, not a ridge background (spec §8 OQ-02 item 1) |

`BaseLayout` already exists (`src/layouts/BaseLayout.astro`). This feature extends its head contract (sad.md §8) but adds no new component.
