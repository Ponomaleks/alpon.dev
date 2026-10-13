---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-04"
feature_size: "S"
ticket: "roadmap step 3 (base-components)"
---

# 0002 — Open the mobile menu as a native modal dialog

- **Status:** Accepted
- **Date:** 2026-10-04
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design pass (depth easy, confirmed through the assumptions ledger)

## Context

Below 768 the header keeps the wordmark, the menu button and "Get in touch"; the navigation links, contact facts and the theme switch move into a menu panel (SCR-03). Spec D-12 left the mechanism to the design stage, platform features first, and the Owner noted that a dialog is acceptable. AC-04 and AC-05 are the contract: focus moves into the panel, Escape and the close button close it and return focus to the menu button, and any link closes it, including a link to a place on the current page. The spec names the failure to avoid: a phone menu that is not reachable with scripts off, or that stays open after a same-page link.

## Decision drivers

- AC-04, AC-05, AC-06 and the accessibility row of spec §6 (0 axe violations with the menu panel open).
- Quality goal 1: all Shell scripts together ≤ 5 KB gzip, policy unchanged.
- Spec §1 committed approach: a behaviour gets a script only when the platform cannot do it.
- D-12: if the mechanism needs a script, the menu button is not shown with scripts off.

## Considered options

1. **Native `<dialog>` opened with `showModal()`** — a small script opens it, closes it on any link and when the screen becomes 768 or wider; focus move, focus trap, Escape, the inert page behind and focus return come from the platform.
2. **Popover (`popover` with `popovertarget`)** — opens and closes without a script, but is not modal: the page behind stays reachable, focus is not kept inside, and a same-page link still needs a script to close it.
3. **`<dialog>` opened by invoker commands (`commandfor`, `command="show-modal"`)** — opens without a script where supported, but with scripts off a same-page link ("Contact" on the home page) leaves the panel open over the page, which is the failure the spec names, and unsupported browsers need the script path anyway.

## Decision outcome

**Chosen:** Option 1. It is the only option that meets AC-04 and AC-05 in full with one code path in every browser, and it leaves the focus handling to the platform. Because it needs a script, the menu button is hidden with scripts off through the scripts-off gate (ADR-0003), and AC-06 is met by the Sticky action bar, the header action and the footer.

## Consequences

**Positive**
- No hand-written focus trap; Escape, backdrop and focus return are browser behaviour.
- The script is a few lines: open, close on link click, close on the 768 media change.

**Negative**
- With scripts off a phone has no menu panel; the contact facts and navigation it would show are reached through the bar and the footer instead, and the theme follows the device.
- The panel's open and close animation must be written against the dialog's `open` attribute and collapse under reduced motion.

**Neutral**
- The Styleguide shows the open panel as an inline sample (not a modal), so it can be captured next to other sections.
- Moving to invoker commands later is a change inside `MobileMenu` and `menu.ts` only.

## Links

- Spec: [[../spec.md]] (US-02, AC-04 to AC-06, §1.3 D-12)
- SAD: [[../sad.md]] §4, §8 Mobile menu
- Related ADR: [[0003-keep-shell-state-in-dom-attributes-and-let-css-derive-the-rest]]
