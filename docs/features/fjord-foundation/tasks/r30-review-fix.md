---
id: R30
title: "List every Not-found design difference in OQ-02 and give the sticky action bar a roadmap step"
layer: "docs"
deps: []
acs: ["AC-07"]
files_hint: ["docs/features/fjord-foundation/spec.md", "docs/roadmap.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R30 — List every Not-found design difference in OQ-02 and give the sticky action bar a roadmap step

## Why

Review round 5, S1-11. Spec §8 OQ-02 (`spec.md:218-224`) lists four differences between `src/pages/404.astro` and the page design, plus three intentional ones. The reviewer found six more, so the Design match NFR (`spec.md:194`, "0 undocumented differences") is not yet met by documentation:

| # | Difference | Design | Current | Checked against |
|---|---|---|---|---|
| 1 | Body copy | starts "The link may be old, or the page has moved." ("This page is off the map." is the heading) | `404.astro:38` starts "This page is off the map. The link may be old, …" | page-design screenshots and `404.astro` |
| 2 | Title scale | `--fjord-text-h1`, semibold, heading tracking and leading, `text-wrap: balance` (site copy `feedback.css:44`) | `--fjord-text-display` with display tracking and leading (`404.astro:116-120`) | site `_ds` CSS |
| 3 | Sticky action bar at 390 | "View CV / Get in touch" (`site/App.jsx:127`, `dag_not_found_390.png`) | none | `App.jsx` |
| 4 | Code line colour | "404" in the link/accent colour | whole line muted (`404.astro:107-114`) | screenshots only |
| 5 | Spacing and alignment | text gap `--fjord-space-5`; padding `--fjord-space-404` / `--fjord-space-section`; grid `align-items: center` (site copy `feedback.css:41-43`) | gap `--fjord-space-4`; padding `--fjord-space-12`; content at the bottom of the section (`404.astro:72-80`). `--fjord-space-404` is not in `src/styles/tokens.css` | site `_ds` CSS |
| 6 | Button size | "Back to home" about 170 px wide at 1440 | about 155 px | screenshots only |

Owner's decision (2026-10-03): fix now, docs only, with all six items.

## Definition of Done

- [x] Spec §8 OQ-02 has one line per difference above, each with the design value and the current value.
- [x] Items 4 and 6 are checked against `design/handoff/site` (`Misc.jsx` and the site's `NotFound`); an item that cannot be confirmed there is marked "to confirm against the page design" and is not dropped.
- [x] The sticky action bar is named next to "no Header or Footer" in OQ-02, and `docs/roadmap.md` step 3 lists it as part of MobileBar, together with Header/Footer.
- [x] No code or baseline changes. The 404 rebuild stays in step 3 and follows the page design (`Misc.jsx`), not the component demo.
- [x] Committed together with R31 (the other 404 docs changes).
- [ ] `npm run lint` and `npm run test:unit` green
