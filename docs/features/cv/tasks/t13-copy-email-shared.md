---
id: T13
title: "Move copy-email to scripts/shared and let it follow the language of the page"
layer: "app"
deps: []
acs: ["AC-02", "AC-04", "AC-23"]
files_hint: ["src/scripts/shared/copy-email.ts", "src/scripts/shared/copy-email.test.ts", "src/scripts/home/copy-email.ts", "src/scripts/home/copy-email.test.ts", "src/scripts/home/index.ts", "src/components/ui/CopyButton.astro", "src/components/ui/Toast.astro", "src/scripts/shell/toast.ts", "src/scripts/shell/toast.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T13 — Move copy-email to scripts/shared and let it follow the language of the page

## Why

AC-02, AC-04, AC-23 ([spec §5](../spec.md)); [sad §1 Decision overrides, second item](../sad.md); [sad §8 Internationalisation](../sad.md); [screens C-4](../screens.md); screens SCR-06 `copy offered / success / not offered`, `copy refused`.

## What

- Reuses: the existing module, `ui/CopyButton`, `ui/Toast`, `shell/toast.ts`.
- Move `copy-email.ts` and its test from `src/scripts/home/` to `src/scripts/shared/`; `home/index.ts` imports it from there.
- The labels and the language come from the button's attributes, so the module holds no Norwegian text; the `fjord:toast` payload gains an optional `lang`, set on the message element.

## Definition of Done

- [ ] `src/scripts/shared/copy-email.test.ts`: every earlier case passes unchanged; a Norwegian button shows "Kopiert"; the Toast payload has the message and `lang: 'no'`; the refusal message follows the button's language
- [ ] `src/scripts/shell/toast.test.ts`: with `lang`, without `lang`, replace clears it; the live region is unchanged
- [ ] `tests/e2e/contact.spec.ts` still green (home copy action)
- [ ] `npm run build && npm run check:budgets`: Shell scripts stay within 5 KB gzip, home scripts within 10 KB
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. Lane with T21 and T20 through `src/scripts/home/index.ts` and the shared module.
- If the shared chunk pushes the Shell budget over, report it to the Owner; the fallback of sad §11 is one copy per page entry.
