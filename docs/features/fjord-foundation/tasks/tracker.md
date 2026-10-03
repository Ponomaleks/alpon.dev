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
| T15 | [Add axe checks in Dag and Natt and the Not-found visual baselines; capture the Natt references](./t15-a11y-visual.md) | tests | Alexander Ponomarenko | M | T9 | done |
| T16 | [Run Lighthouse on both pages with the Roboto-only runner and protect v2 and main](./t16-ci-lighthouse-protection.md) | wiring | Alexander Ponomarenko | S | T9, T10 | done |
| R1 | [Parse built HTML with a real parser in the CSP audit and hash a CRLF-normalised bootstrap](./r01-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R2 | [Prove with a real rebuild that editing the bootstrap updates the delivered policy](./r02-review-fix.md) | tests | Alexander Ponomarenko | S | R1 | done |
| R3 | [Bootstrap without globals, one Norwegian language code, no viewport-fit, Norwegian 'Oslo, Norge'](./r03-review-fix.md) | ui | Alexander Ponomarenko | S | R1 | done |
| R4 | [Close the token-only lint gaps: shorthands, units, size and radius, unknown tokens](./r04-review-fix.md) | tests | Alexander Ponomarenko | S | — | done |
| R5 | [Not-found: unclipped focus ring, arrow icon from tokens, measured 44px target](./r05-review-fix.md) | ui | Alexander Ponomarenko | S | R3, R4 | done |
| R6 | [Make reduced-motion tokens fail loudly and add the base reduced-motion guard](./r06-review-fix.md) | wiring | Alexander Ponomarenko | S | R4 | done |
| R7 | [Keep the Dag warning pair visible as a named known contrast failure](./r07-review-fix.md) | tests | Alexander Ponomarenko | S | — | done |
| R8 | [Assert drawn brand fonts with scripts off and measure text runs in the font-swap test](./r08-review-fix.md) | tests | Alexander Ponomarenko | S | R5 | done |
| R9 | [Make missing visual baselines fail CI and add a manual baseline workflow](./r09-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R10 | [Run Lighthouse CI against wrangler dev so the delivered headers apply](./r10-review-fix.md) | wiring | Alexander Ponomarenko | S | R9 | done |
| R11 | [Remove the stray screenshots and ignore mangled temp paths](./r11-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R12 | [Produce the visual baselines from a labelled PR and document the local Docker fallback](./r12-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R13 | [Require both check and visual, and record the branch-protection commands](./r13-review-fix.md) | wiring | Alexander Ponomarenko | S | R12 | done |
| R14 | [Run the handler and style checks on every element in the CSP audit](./r14-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R15 | [Measure the font swap at phone width and assert the Mono labels and body face](./r15-review-fix.md) | tests | Alexander Ponomarenko | S | — | done |
| R16 | [Make the no-global bootstrap test see top-level let bindings](./r16-review-fix.md) | tests | Alexander Ponomarenko | S | — | done |
| R17 | [Disallow container-query units and restrict viewport heights by value](./r17-review-fix.md) | tests | Alexander Ponomarenko | S | — | done |
| R18 | [Classify scale tokens by handoff usage and reject movement tokens outside motion.css](./r18-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R19 | [Record that SEO is not asserted on the noindex Not-found page](./r19-review-fix.md) | docs | Alexander Ponomarenko | S | — | done |
| R20 | [Make the measure tokens font-independent so text does not rewrap when the brand fonts swap in](./r20-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R21 | [Fix baseline-run concurrency, document the label and download, then run CI and the label flow](./r21-review-fix.md) | wiring | Alexander Ponomarenko | S | R20, R22 | done |
| R22 | [Audit both the scripting-off and scripting-on parse trees in the CSP audit](./r22-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R23 | [Amend ADR-0003 to match the stylelint rules added by R17](./r23-review-fix.md) | docs | Alexander Ponomarenko | S | — | done |
| R24 | [Upload the Lighthouse reports and move upload-artifact to Node 24](./r24-review-fix.md) | wiring | Alexander Ponomarenko | S | R21 | done |
| R25 | [Audit every script with a body as inline in the CSP audit, whatever its src or href](./r25-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R26 | [Switch the token-only lint from block lists to allow lists for functions and units](./r26-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R27 | [Validate the "0" advance in the token generator and pin it in the test](./r27-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R28 | [Upload the Lighthouse reports only when Lighthouse ran](./r28-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R29 | [Correct the R20 definition of done from rem to em](./r29-review-fix.md) | docs | Alexander Ponomarenko | S | — | done |
| R30 | [List every Not-found design difference in OQ-02 and give the sticky action bar a roadmap step](./r30-review-fix.md) | docs | Alexander Ponomarenko | S | — | done |
| R31 | [Point the stale Not-found design statements to OQ-02 and rank the page design first in screens.md](./r31-review-fix.md) | docs | Alexander Ponomarenko | S | R30 | done |
| R32 | [Ban @container in the token-only lint until a feature needs container queries](./r32-review-fix.md) | wiring | Alexander Ponomarenko | S | — | done |
| R33 | [Cut the function allow list to var and calc](./r33-review-fix.md) | wiring | Alexander Ponomarenko | S | R32 | done |
| R34 | [Test the .notdef guard through the real font lookup](./r34-review-fix.md) | tests | Alexander Ponomarenko | S | — | done |

**Total:** 16 tasks + 34 follow-ups (R1–R34), ~20 person-days (S ≈ 0.5 d, M ≈ 1 d).
