---
id: R36
title: "Name the source of every Not-found design value in sad.md and screens.md and sweep docs/ for stale 404 statements"
layer: "docs"
deps: ["R35"]
acs: ["AC-07"]
files_hint: ["docs/features/fjord-foundation/sad.md", "docs/features/fjord-foundation/screens.md", "docs/features/fjord-foundation/spec.md", "docs/features/fjord-foundation/ux-flows.md", "docs/features/fjord-foundation/tasks/tracker.md", "docs/roadmap.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R36 — Name the source of every Not-found design value in sad.md and screens.md and sweep docs/ for stale 404 statements

## Why

Review round 6, S1-15 and S1-16. R31 added the OQ-02 pointers, but some statements next to them still come from the component demo or misstate the built page:

- `sad.md:452` says `code line "404 · Ikke funnet" instead of the requested path`. In the page design the code line is "404 / Ikke funnet" and the requested path sits in the body (OQ-02 item 4 and the "Intentional" paragraph).
- `screens.md:85` says "Layout (from `feedback.css`) … min-height (design 420px) … 16px gap". Those are the component demo's values (`design/handoff/design-system/project/components/feedback/feedback.css:36`); the site copy has no min-height and a `--fjord-space-5` gap.
- `screens.md:81` and `:112` say "max 46ch"; the built page uses `--fjord-measure-narrow` (48ch, `src/pages/404.astro:124`).

Owner's decision (2026-10-03): fix now, docs only, and finish with a sweep so that no further round finds the same kind of statement.

## Definition of Done

- [ ] `sad.md:452`: the code-line phrase is rewritten to what `design/handoff/site/project/site/Misc.jsx` shows. It is read from the page design, not from the component demo.
- [ ] `screens.md:85`: 420px and the 16px gap are labelled "component demo", not "design".
- [ ] `screens.md:81` and `:112`: "max 46ch" becomes "`--fjord-measure-narrow` (48ch; page design 46ch)".
- [ ] The code comment in `src/pages/404.astro:2` is kept as it is for the step 3 rebuild.
- [ ] Final sweep: grep `docs/` for every statement about the 404 design (spec, sad, screens, ux-flows, roadmap, tracker). Each one either matches `Misc.jsx` or points to OQ-02, and the source of every value is named (page design / component demo / built).
- [ ] The changed lines are reported (file and line) in the task result.
- [ ] No code or baseline changes.
- [ ] `npm run lint` and `npm run test:unit` green
