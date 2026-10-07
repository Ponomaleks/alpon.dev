---
id: T3
title: "Add the icons the home page needs and the optional check icon of the Toast"
layer: "ui"
deps: []
acs: ["AC-14", "AC-15"]
files_hint: ["src/components/ui/Icon.astro", "src/components/ui/actions.test.ts", "src/components/ui/Toast.astro", "src/scripts/shell/toast.ts", "src/scripts/shell/toast.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# T3 — Add the icons the home page needs and the optional check icon of the Toast

## Why

AC-14, AC-15 ([spec §5](../spec.md)); backlog B-25; [screens.md Shell state changes, toast-shown](../screens.md); [sad §8 Copy email](../sad.md).

## What

- Reuses: `ui/Icon` (typed path map, 1.5 px stroke), `ui/Toast` and `shell/toast.ts`.
- `Icon.astro`: add `play`, `pause`, `check`, `chevron-down`, `chevron-up`, `copy`, `download` and the contact icons (mail, phone, LinkedIn and GitHub as plain line glyphs, no brand logos), drawn from the site copy of the design system.
- `toast.ts` and `Toast.astro`: the `fjord:toast` payload gains an optional `icon: "check"`; the icon is shown before the message and is decorative.

## Definition of Done

- [ ] `src/scripts/shell/toast.test.ts`: with icon, without icon, replace clears the icon; the live region and its announcement are unchanged
- [ ] `src/components/ui/actions.test.ts`: each new icon renders `aria-hidden` with the stroke width token and no `style` attribute
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- The check icon is in the HTML and shown by a state attribute; the script adds no class and no inline style (base-components ADR-0003).
- No tech logos (`CLAUDE.md` Design rules): LinkedIn and GitHub rows use neutral line icons or none, as the page design draws them.
