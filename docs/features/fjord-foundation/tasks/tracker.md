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
| T13 | [Verify font loading end to end and flip P-26](./t13-fonts-e2e-p26.md) | tests | Alexander Ponomarenko | M | T7 | done |
| T14 | [Verify the Not-found page and reduced motion end to end and flip P-41](./t14-not-found-e2e-p41.md) | tests | Alexander Ponomarenko | S | T9 | done |
| T15 | [Add axe checks in Dag and Natt and the Not-found visual baselines; capture the Natt references](./t15-a11y-visual.md) | tests | Alexander Ponomarenko | M | T9 | review |
| T16 | [Run Lighthouse on both pages with the Roboto-only runner and protect v2 and main](./t16-ci-lighthouse-protection.md) | wiring | Alexander Ponomarenko | S | T9, T10 | review |
| R1 | [Parse built HTML with a real parser in the CSP audit and hash a CRLF-normalised bootstrap](./r01-review-fix.md) | wiring | Alexander Ponomarenko | S | — | todo |
| R2 | [Prove with a real rebuild that editing the bootstrap updates the delivered policy](./r02-review-fix.md) | tests | Alexander Ponomarenko | S | R1 | todo |
| R3 | [Bootstrap without globals, one Norwegian language code, no viewport-fit, Norwegian 'Oslo, Norge'](./r03-review-fix.md) | ui | Alexander Ponomarenko | S | R1 | todo |
| R4 | [Close the token-only lint gaps: shorthands, units, size and radius, unknown tokens](./r04-review-fix.md) | tests | Alexander Ponomarenko | S | — | todo |
| R5 | [Not-found: unclipped focus ring, arrow icon from tokens, measured 44px target](./r05-review-fix.md) | ui | Alexander Ponomarenko | S | R3, R4 | todo |
| R6 | [Make reduced-motion tokens fail loudly and add the base reduced-motion guard](./r06-review-fix.md) | wiring | Alexander Ponomarenko | S | R4 | todo |
| R7 | [Keep the Dag warning pair visible as a named known contrast failure](./r07-review-fix.md) | tests | Alexander Ponomarenko | S | — | todo |
| R8 | [Assert drawn brand fonts with scripts off and measure text runs in the font-swap test](./r08-review-fix.md) | tests | Alexander Ponomarenko | S | R5 | todo |
| R9 | [Make missing visual baselines fail CI and add a manual baseline workflow](./r09-review-fix.md) | wiring | Alexander Ponomarenko | S | — | todo |
| R10 | [Run Lighthouse CI against wrangler dev so the delivered headers apply](./r10-review-fix.md) | wiring | Alexander Ponomarenko | S | R9 | todo |
| R11 | [Remove the stray screenshots and ignore mangled temp paths](./r11-review-fix.md) | wiring | Alexander Ponomarenko | S | — | todo |

**Total:** 16 tasks + 11 review follow-ups (R1–R11), ~13 person-days (S ≈ 0.5 d, M ≈ 1 d).
