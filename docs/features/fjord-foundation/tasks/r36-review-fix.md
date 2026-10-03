---
id: R36
title: "Name the source of every Not-found design value in sad.md and screens.md and sweep docs/ for stale 404 statements"
layer: "docs"
deps: ["R35"]
acs: ["AC-07"]
files_hint: ["docs/features/fjord-foundation/sad.md", "docs/features/fjord-foundation/screens.md", "docs/features/fjord-foundation/spec.md", "docs/features/fjord-foundation/ux-flows.md", "docs/features/fjord-foundation/tasks/tracker.md", "docs/roadmap.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R36 — Name the source of every Not-found design value in sad.md and screens.md and sweep docs/ for stale 404 statements

## Why

Review round 6, S1-15 and S1-16. R31 added the OQ-02 pointers, but some statements next to them still come from the component demo or misstate the built page:

- `sad.md:452` says `code line "404 · Ikke funnet" instead of the requested path`. In the page design the code line is "404 / Ikke funnet" and the requested path sits in the body (OQ-02 item 4 and the "Intentional" paragraph).
- `screens.md:85` says "Layout (from `feedback.css`) … min-height (design 420px) … 16px gap". Those are the component demo's values (`design/handoff/design-system/project/components/feedback/feedback.css:36`); the site copy has no min-height and a `--fjord-space-5` gap.
- `screens.md:81` and `:112` say "max 46ch"; the built page uses `--fjord-measure-narrow` (48ch, `src/pages/404.astro:124`).

Owner's decision (2026-10-03): fix now, docs only, and finish with a sweep so that no further round finds the same kind of statement.

## Definition of Done

- [x] `sad.md:452`: the code-line phrase is rewritten to what `design/handoff/site/project/site/Misc.jsx` shows. It is read from the page design, not from the component demo.
- [x] `screens.md:85`: 420px and the 16px gap are labelled "component demo", not "design".
- [x] `screens.md:81` and `:112`: "max 46ch" becomes "`--fjord-measure-narrow` (48ch; page design 46ch)".
- [x] The code comment in `src/pages/404.astro:2` is kept as it is for the step 3 rebuild.
- [x] Final sweep: grep `docs/` for every statement about the 404 design (spec, sad, screens, ux-flows, roadmap, tracker). Each one either matches `Misc.jsx` or points to OQ-02, and the source of every value is named (page design / component demo / built).
- [x] The changed lines are reported (file and line) in the task result.
- [x] No code or baseline changes.
- [x] `npm run lint` and `npm run test:unit` green

## Result

Changed lines:

- `sad.md:452` (§10 Design match): the code line is "404 · Ikke funnet" (built) where the page design reads "404 / Ikke funnet"; the page design's body sentence "Nothing lives at <path>." is omitted.
- `sad.md:471` (§11): the same statement, found by the sweep.
- `screens.md:80`: the title is named as the component demo's default, with the page-design value and OQ-02 items 3 and 6 (found by the sweep).
- `screens.md:81`, `:112`: the measure.
- `screens.md:85`: the layout values are named as built from the component demo, each with the page-design value; "a design value that has no token" is now "a component-demo value".
- `screens.md:19` and `spec.md:194`, `:220`, `:229-235`, `docs/roadmap.md:24` were changed by R35.

Checked and left as they are:

- `spec.md:27` names both sources (component demo "404 · <requested path>", page design "404 / Ikke funnet"); both match the handoff files.
- `spec.md:130`, `:259-263`, `ux-flows.md:85`, `:93`, `:121`, `sad.md:232` and `tasks/_epic.md:72` state the AC-07 wording of the built page, not the design; OQ-02 defers that wording to step 3.
- `screens.md:79` already points to OQ-02.
- `docs/design-system.md:61-62`, `:100` name the component files as building blocks and say the 404 page follows the page design.
- `tasks/tracker.md` holds task titles only.
