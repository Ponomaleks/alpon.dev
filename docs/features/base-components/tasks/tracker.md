# Tracker — base-components

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | [Point the token generator at the site copy of the design system and emit the new tokens](./t01-token-source-site-copy.md) | wiring | Alexander Ponomarenko | M | — | done |
| T2 | [Extend the token-only allow lists for the Shell styles, one recorded entry per form](./t02-stylelint-allow-lists.md) | wiring | Alexander Ponomarenko | M | T1 | done |
| T3 | [Add src/data/contact.ts and the contact check against the vCard and the last-updated date](./t03-contact-data-and-check.md) | domain | Alexander Ponomarenko | S | — | done |
| T4 | [Build Icon, Button, Link and IconButton with all interactive states](./t04-action-components.md) | ui | Alexander Ponomarenko | M | T2 | done |
| T5 | [Build Badge, Tag, Stat and SectionHeader with Eyebrow](./t05-content-components.md) | ui | Alexander Ponomarenko | S | T2 | done |
| T6 | [Build Contours, the Terrain map panel and Wordmark](./t06-brand-components.md) | ui | Alexander Ponomarenko | M | T2, T4 | done |
| T7 | [Build ThemeToggle, the theme script and the scripts-off gate](./t07-theme-toggle.md) | ui | Alexander Ponomarenko | M | T2 | done |
| T8 | [Build Toast, its polite live region and the fjord:toast script](./t08-toast.md) | ui | Alexander Ponomarenko | S | T4 | done |
| T9 | [Build SkipLink, CtaBand and Footer from the contact data](./t09-static-shell-parts.md) | ui | Alexander Ponomarenko | M | T3, T4, T6 | done |
| T10 | [Build Header with its variants, the scroll border script and the one-primary rule](./t10-header.md) | ui | Alexander Ponomarenko | M | T4, T6, T7 | done |
| T11 | [Build the mobile menu panel as a native modal dialog (SCR-03)](./t11-mobile-menu.md) | ui | Alexander Ponomarenko | M | T3, T10 | done |
| T12 | [Build the Sticky action bar and its scroll script](./t12-sticky-action-bar.md) | ui | Alexander Ponomarenko | M | T4 | done |
| T13 | [Compose the Shell in BaseLayout from page options and keep the existing suites green](./t13-base-layout-shell.md) | wiring | Alexander Ponomarenko | M | T8, T9, T10, T11, T12 | done |
| T14 | [Add cross-document page transitions with a still header](./t14-view-transitions.md) | ui | Alexander Ponomarenko | S | T13 | done |
| T15 | [Rebuild the Not-found page to its page design (SCR-02) and reword P-41](./t15-not-found-rebuild.md) | ui | Alexander Ponomarenko | M | T13 | done |
| T16 | [Build the Styleguide page with the base component sections (SCR-04)](./t16-styleguide-base-sections.md) | ui | Alexander Ponomarenko | M | T5, T13 | done |
| T17 | [Add the Shell samples and the Toast trigger to the Styleguide](./t17-styleguide-shell-sections.md) | ui | Alexander Ponomarenko | M | T16 | done |
| T18 | [Verify the Shell end to end, flip P-25 and open P-50 and P-51](./t18-shell-e2e-parity.md) | tests | Alexander Ponomarenko | M | T13 | done |
| T19 | [Verify the mobile menu and the theme switch end to end](./t19-menu-theme-e2e.md) | tests | Alexander Ponomarenko | M | T13 | done |
| T20 | [Verify the Sticky action bar, the one-primary rule, the Toast position and reduced motion](./t20-bar-primary-motion-e2e.md) | tests | Alexander Ponomarenko | M | T15 | done |
| T21 | [Add axe checks for the three pages and the open menu, and the Styleguide and Not-found visual baselines](./t21-axe-and-visual.md) | tests | Alexander Ponomarenko | M | T15, T17 | todo |
| T22 | [Extend the budget and contrast checks and prove the security policy is unchanged](./t22-budgets-contrast-policy.md) | tests | Alexander Ponomarenko | M | T15, T17 | todo |
| T23 | [Close the cross-document pointers and register the built components](./t23-docs-pointers-inventory.md) | docs | Alexander Ponomarenko | S | T14, T18, T19, T20, T21, T22 | todo |

**Total:** 23 tasks, ~20.5 person-days (S = half a day, M = one day).
