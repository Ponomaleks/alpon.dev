# Tracker — fjord-foundation

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | [Install the check toolchain: Vitest and Stylelint with the ADR-0003 rule set](./t01-check-toolchain.md) | wiring | Alexander Ponomarenko | M | — | done |
| T2 | [Ship the seven brand faces and their metric-matched fallback faces](./t02-brand-fonts.md) | wiring | Alexander Ponomarenko | M | T1 | done |
| T3 | [Generate tokens.css from the design sources with Dag, Natt and the no-JS Natt block](./t03-token-generator.md) | wiring | Alexander Ponomarenko | M | T1 | done |
| T4 | [Extend the generator with reduced-motion tokens, fallback font stacks and --check mode](./t04-generator-motion-fonts-check.md) | wiring | Alexander Ponomarenko | S | T3 | done |
| T5 | [Add the contrast check over the generated tokens](./t05-contrast-check.md) | tests | Alexander Ponomarenko | M | T3 | done |
| T6 | [Port the handoff base.css as token-only element styles](./t06-base-styles.md) | ui | Alexander Ponomarenko | S | T4 | done |
| T7 | [Add the theme bootstrap and the BaseLayout head contract, with the home placeholder on it (SCR-01)](./t07-bootstrap-and-layout.md) | ui | Alexander Ponomarenko | M | T2, T4, T6 | done |
| T8 | [Generate the bootstrap hash into a single /* CSP rule with a fail-closed build integration](./t08-csp-integration.md) | wiring | Alexander Ponomarenko | M | T1, T7 | done |
| T9 | [Build the Fjord Not-found page (SCR-02) with the page-local home-link and ridge contours](./t09-not-found-page.md) | ui | Alexander Ponomarenko | M | T7 | done |
| T10 | [Add the budget check for bootstrap, JS and font sizes](./t10-budget-check.md) | tests | Alexander Ponomarenko | S | T2, T7 | done |
| T11 | [Cover the theme matrix end to end, including blocked storage and scripts off](./t11-theme-e2e.md) | tests | Alexander Ponomarenko | M | T7 | done |
| T12 | [Verify the delivered security policy end to end and flip P-16](./t12-headers-e2e-p16.md) | tests | Alexander Ponomarenko | S | T8 | done |
| T13 | [Verify font loading end to end and flip P-26](./t13-fonts-e2e-p26.md) | tests | Alexander Ponomarenko | M | T7 | todo |
| T14 | [Verify the Not-found page and reduced motion end to end and flip P-41](./t14-not-found-e2e-p41.md) | tests | Alexander Ponomarenko | S | T9 | todo |
| T15 | [Add axe checks in Dag and Natt and the Not-found visual baselines; capture the Natt references](./t15-a11y-visual.md) | tests | Alexander Ponomarenko | M | T9 | todo |
| T16 | [Run Lighthouse on both pages with the Roboto-only runner and protect v2 and main](./t16-ci-lighthouse-protection.md) | wiring | Alexander Ponomarenko | S | T9, T10 | todo |

**Total:** 16 tasks, ~13 person-days (S ≈ 0.5 d, M ≈ 1 d).
