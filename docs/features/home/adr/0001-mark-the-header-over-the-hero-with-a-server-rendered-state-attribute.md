---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-05"
feature_size: "S"
ticket: "roadmap step 4 (home)"
---

# 0001 — Mark the header over the hero with a server-rendered state attribute

- **Status:** Accepted
- **Date:** 2026-10-05
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design pass (depth easy, decided by a direct question)

## Context

AC-33 asks the header on the home page to follow the page design while the hero is under it: in Dag it sits on spruce with a light wordmark and no border, in Natt only the style of "Get in touch" changes, and in both themes it returns to its default look exactly when the hero leaves the area under the header. With scripts off the header must keep its default look and a primary "Get in touch". The spec left the mechanism to this stage (spec §8). The header is a Shell component that every page shares, the trigger is the home page's own hero, and the result is checked in 18 states (3 widths, 2 themes, 3 scroll positions), so the choice is seen by several modules.

## Decision drivers

- AC-33: the right state at each scroll position, also after a reload or a return with the back button at a scrolled position; default look with scripts off.
- Spec §6: CLS ≤ 0.02 and TBT ≤ 100 ms on the home page; "Header states" must match the page design in all 18 states.
- base-components ADR-0003: one state attribute per behaviour, set by a small script, with every visual consequence in CSS.
- fjord-foundation ADR-0001 invariant: `data-theme` is on `<html>` before the first frame when scripts run and is never set when they do not.
- AC-24 of base-components and the lane rule: a page changes the Shell through page options, not by editing a shared file per page.

## Considered options

1. **Attribute in the HTML plus an observer** — the page asks for `data-over-hero` on the header through a `BaseLayout` option; styles apply it only under `:root[data-theme]`; the home page script removes and restores it with an `IntersectionObserver` on the hero.
2. **Script-only attribute** — the HTML has the default header and the home page script adds `data-over-hero` after it loads.
3. **Scroll listener as in the prototype** — on every scroll event the script measures the hero and compares it with the header height, as `App.jsx` does.

## Decision outcome

**Chosen:** Option 1. The header is right in the first frame, because the attribute is already in the HTML and the theme bootstrap has set `data-theme` before anything is painted; with scripts off `data-theme` is absent, so the same HTML shows the default header with no extra rule. Options 2 and 3 both paint the default header over the dark hero first and switch after the script has loaded, which is a visible flash on the main screen and a risk for the visual tests. Option 3 also runs code on every scroll frame and adds a second mechanism next to the observer the header already uses for its border.

What the attribute does:

- **Dag** (`:root[data-theme='dag'] .header[data-over-hero]`): spruce background, light wordmark and links, no border even when `data-scrolled` is set; "Get in touch" is primary on spruce below 768 and secondary on spruce from 768.
- **Natt** (`:root[data-theme='natt'] .header[data-over-hero]`): the colours do not change and the border follows `data-scrolled` as on every other page; the attribute only switches "Get in touch" to secondary from 768. Below 768 it stays primary.
- Without the attribute the header has its default look and its usual border, and "Get in touch" is primary.

How the attribute changes: `src/scripts/home/hero-header.ts` observes the hero (`[data-hero]`) with a top root margin of minus the header height, removes the attribute when the hero no longer reaches below the header and restores it when it does. It also checks the position synchronously when it starts and on `pageshow`, so a reload or a back-button return at a scrolled position gets the state of that position at once. The header height differs below and from 768, so the observer is created again when that breakpoint is crossed.

## Consequences

**Positive**
- No layout shift and no flash at the top of the page: the first frame is already the designed one.
- One attribute to assert. The 18 states of AC-33 are tested by computed styles and by visual tests at fixed scroll positions, not by timing.
- A theme switch while the hero is under the header needs no script: the selectors follow `data-theme`.
- The header component gains no page knowledge: it renders an attribute it is asked for, and any later page with a hero can ask for the same.

**Negative**
- Accepted risk: if scripts run but the home page script fails to load, the header keeps the over-hero look after the hero has left. In Dag it stays a spruce bar with light text over the light page; the text stays readable because the over-hero header has its own spruce background, and the pairs of the header over the hero are checked by the contrast script (spec §6 "Contrast"). In Natt the only effect is that "Get in touch" stays secondary from 768. Navigation works in both cases.
- The styles of the header now depend on two attributes (`data-over-hero`, `data-scrolled`) and the theme; the Styleguide shows each combination as a static sample.
- The observer needs the header height in pixels for its root margin, so it is rebuilt at the 768 breakpoint.

**Neutral**
- The existing `headerVariant: 'on-spruce'` option stays for static samples; the home page uses the new option and does not set `headerVariant`.
- Moving to a pure CSS mechanism later (scroll-driven or scroll-state queries) would replace the script only; the attribute contract in the styles and tests would stay.

## Links

- Spec: [[../spec.md]] (US-11; AC-33, AC-34; §1.3 D-08, D-14; §6 "Header states", "Contrast")
- SAD: [[../sad.md]] §4, §5 page options, §8 Header over the hero
- Related ADR: [[0003-run-ambient-motion-only-under-a-state-attribute-the-page-script-sets]] (same failure behaviour), [[../../base-components/adr/0003-keep-shell-state-in-dom-attributes-and-let-css-derive-the-rest]], [[../../fjord-foundation/adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks]]
