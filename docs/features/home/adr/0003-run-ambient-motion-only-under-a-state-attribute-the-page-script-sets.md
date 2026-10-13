---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-05"
feature_size: "S"
ticket: "roadmap step 4 (home)"
---

# 0003 — Run Ambient motion only under a state attribute the page script sets

- **Status:** Accepted
- **Date:** 2026-10-05
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design pass (depth easy, decided by a direct question)

## Context

The home hero has two loops that start by themselves: the contour drift and the portrait float (Ambient motion in `CONTEXT.md`). WCAG 2.2 success criterion 2.2.2 and spec §1.3 D-01 and D-02 require a Motion control, no motion where the Visitor cannot stop it, and a pause that holds for the browser session on the home page (AC-30). The spec's note for this stage said the loops start "only when scripts run, the same gate as the theme switch", which would mean a CSS condition on `data-theme`. That gate is set by the theme bootstrap before the first frame, earlier than any page script can read a saved pause.

## Decision drivers

- AC-30: a pause holds after leaving and coming back; pausing takes effect within 100 ms (spec §6 "Ambient motion").
- D-02 and AC-32: a Visitor never gets motion they cannot stop; with scripts off there is no motion and no control.
- AC-31: under reduced motion no Ambient motion ever starts and no control is shown.
- base-components ADR-0003: one state attribute set by a script; styles derive the rest; scripts add no classes.

## Considered options

1. **Own attribute set by the page script** — the loops are paused in CSS by default and run only under `[data-motion='running']` on the hero; the home page script decides the value after it has read the saved choice and the device setting.
2. **Gate on `data-theme`** — the loops run under `:root[data-theme]`, as the spec note said, and the page script pauses them afterwards if a pause was saved.

## Decision outcome

**Chosen:** Option 1. `src/scripts/home/motion.ts` first reads `sessionStorage` (key `fjord-motion`, value `paused`, wrapped in try and catch) and `prefers-reduced-motion`, and only then sets `data-motion="running"` or `data-motion="paused"` on the hero. The drift and the float are declared with `animation-play-state: paused` and run only under `[data-motion='running']`, so pausing stops them where they are. The Motion control is displayed by CSS only when the hero has a `data-motion` attribute. With option 2 a Visitor who paused and came back would see motion until the page script has run, and if the page script failed to load the motion would run with no way to stop it, which contradicts D-02.

This replaces the spec note "the same gate as the theme switch" on purpose. The goal of the note, loops only where scripts run, is kept and made stricter: loops only where the script that can stop them has run. The note in spec §1 now points here.

## Consequences

**Positive**
- A saved pause never shows a frame of motion on return.
- Same failure behaviour as ADR-0001: when the page script does not run, the page stays still and shows no control. There is no dead control.
- Tests assert one attribute and the list of running animations; "0 loops running when paused, with reduced motion, or with scripts off" follows from the default paused state.

**Negative**
- The loops start a little after the first frame, when the page script has run, instead of with the first paint.
- The Motion control is not in the first frame either; its place in the hero is reserved in the layout so that nothing shifts when it appears.

**Neutral**
- Reduced motion: the script sets no attribute when the device asks for reduced motion and removes it if the setting changes during the visit. The existing global reduced-motion rule in `src/styles/base.css` applies as well; there are no per-element special cases.
- The attribute governs Ambient motion only. Count-up, section reveal, the pointer-follow parallax of the hero contours and the scroll-driven contours of the closing band are not Ambient motion and are not paused by the control.
- Where the browser does not allow the site to keep the value, the choice holds for the current page view (AC-30).

## Links

- Spec: [[../spec.md]] (US-09; AC-30, AC-31, AC-32; §1.3 D-01, D-02; §1 Notes for the design stage; §6 "Ambient motion")
- SAD: [[../sad.md]] §4, §8 Ambient motion
- Related ADR: [[0001-mark-the-header-over-the-hero-with-a-server-rendered-state-attribute]], [[../../base-components/adr/0003-keep-shell-state-in-dom-attributes-and-let-css-derive-the-rest]]
