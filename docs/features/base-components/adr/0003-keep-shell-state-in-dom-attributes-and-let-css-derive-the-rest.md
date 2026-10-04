---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-04"
feature_size: "S"
ticket: "roadmap step 3 (base-components)"
---

# 0003 — Keep Shell state in DOM attributes and let CSS derive the rest

- **Status:** Accepted
- **Date:** 2026-10-04
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design pass (depth easy, confirmed through the assumptions ledger)

## Context

Several Shell parts react to the same facts: the header call to action changes style when the Sticky action bar leaves the screen (AC-23), the Toast sits above the bar while it is on screen (AC-30), the theme switch in the header and the one in the menu must agree (AC-10), the header gains a border after scroll (AC-03), and the theme switch and the menu button must not be offered when scripts are off (D-09, D-12). Step 4 later adds its own script for the header over the home hero and must not rewrite a shared component. The Owner noted that the header style should follow the bar's state with one CSS rule and no extra script.

## Decision drivers

- Quality goal 1: Shell scripts ≤ 5 KB gzip in total; no inline script or style (AC-27).
- AC-12 and the CLS limit of spec §6 (≤ 0.02): a control must not appear late or show a wrong selection.
- AC-24 and the lane rule: later steps change Shell behaviour through options or their own script, never by editing shared files.
- fjord-foundation ADR-0001 invariant: with scripts on, `data-theme` is always set before the first frame; with scripts off it is never set.

## Considered options

1. **State attributes set by small per-component scripts, everything else in CSS** — each script sets one attribute (`data-theme`, `open`, `inert`, `data-scrolled`); styles derive the rest, including the header action through `:has()` and the scripts-off gate through `:root:not([data-theme])`.
2. **One Shell controller script** — a single module holds the state in memory and writes classes on every part that depends on it (header action, toast offset, both theme switches), and reveals script-only controls by removing `hidden`.
3. **CSS only where possible** — scroll-driven animations for the header border and the bar, the `scripting` media feature for the gate; a script remains for the theme, the menu and browsers without scroll-driven animations.

## Decision outcome

**Chosen:** Option 1. The DOM attribute is the single place a state lives, so two parts cannot disagree, a later step can drive the same attribute from its own script, and tests assert one attribute. The gate reuses an invariant that already exists and is set before the first frame, so script-only controls are right from the first frame with no layout shift and no new mechanism. Option 2 couples every part to one script and reveals controls late. Option 3 leaves two code paths per behaviour to test, and the bar's `inert` state (AC-08) needs a script in any case.

## Consequences

**Positive**
- Cross-component rules are plain selectors: the header action is secondary below 768 while the page has a bar that is not `inert`; the Toast offset follows the same selector.
- `inert` on the bar is at once the visual state hook and the reason its actions cannot be focused or announced (AC-08).
- The selected theme segment is styled from `data-theme`, so it is never wrong (AC-12); the script only adds `aria-pressed`.

**Negative**
- If the bootstrap ran but an external Shell script failed to load, the theme switch and the menu button are shown and do nothing (SAD §11).
- With scripts off the header has no scroll border; the static state is the header without a border.
- Styles depend on `:has()`; a browser without it keeps the header action secondary below 768 on pages with the bar, which still satisfies one primary per screen.

**Neutral**
- The header border uses an `IntersectionObserver` on a sentinel at the top of the page, not a scroll listener; the bar uses a passive scroll listener and does nothing under reduced motion (AC-09).
- Scripts never add classes or inline styles, which also keeps them inside the `style-src 'self'` policy.

## Links

- Spec: [[../spec.md]] (AC-03, AC-08 to AC-12, AC-23, AC-24, AC-30; §1 Notes for the design stage; §1.3 D-06, D-09, D-12)
- SAD: [[../sad.md]] §4, §8 Shell state, Scripts off, One primary
- Related ADR: [[0002-open-the-mobile-menu-as-a-native-modal-dialog]], [[../../fjord-foundation/adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks]]
