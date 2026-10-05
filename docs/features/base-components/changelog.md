# Changelog — base-components

## base-components — the Shell and the base components every v2 page is built from

**What:** every v2 page now has the same Shell with no per-page setup. A page on `BaseLayout` gets the skip link, the header (wordmark, "CV", "Contact", theme switch, "Get in touch"), the phone menu, the Sticky action bar ("View CV" / "Get in touch") below 768, the closing call-to-action band, the footer with the contact facts, the Toast region and cross-fading page and theme changes. The base components are ready for Home and CV: Icon, Button, Link, IconButton, Badge, Tag, Stat, SectionHeader, Toast, Contours, the Terrain map panel and Wordmark. The Not-found page is rebuilt to its page design and is the first real page inside the Shell. `/styleguide` (noindex, not linked, not in the sitemap) shows every component and Shell part in every state in Dag and Natt, and is the surface for the visual and accessibility checks. Contact facts, both locations and the "Sist oppdatert" date now live in `src/data/contact.ts`.

**Why:** after fjord-foundation, v2 had tokens and a theme but no navigation, and steps 4 (Home) and 5 (CV) run in parallel and must not both edit shared files ([spec](./spec.md) §1, §2). The feature also meets stub-parity P-25, rewords P-41 and opens P-50 and P-51 for steps 4 and 5. Key decisions:

- [ADR-0001](./adr/0001-read-fjord-tokens-from-the-site-copy-of-the-design-system.md): the token generator reads the site copy of the design system.
- [ADR-0002](./adr/0002-open-the-mobile-menu-as-a-native-modal-dialog.md): the phone menu is a native modal `<dialog>`.
- [ADR-0003](./adr/0003-keep-shell-state-in-dom-attributes-and-let-css-derive-the-rest.md): Shell state lives in DOM attributes and CSS derives the rest.
- [ADR-0004](./adr/0004-enforce-token-only-styles-with-targeted-rules.md): token-only styles are enforced with targeted rules; it supersedes fjord-foundation ADR-0003.

**How to use:**

- New page: wrap it in `src/layouts/BaseLayout.astro`. The Shell comes from six page options and no shared file is edited (AC-24): `current`, `headerVariant`, `headerCta`, `mobileBar`, `ctaBand`, `cvLang`.
- Components: import from `src/components/{ui,layout,brand}/`; `/styleguide` is the reference for each state. A new component gets a Styleguide section, which gives it a visual baseline and an axe check.
- Contact facts: change `src/data/contact.ts` only. `npm run check:contact` (part of `npm run lint`) fails, naming the field, if the vCard disagrees or the last-updated date is not a real past date.
- Toast: dispatch the `fjord:toast` event; no copy action uses it yet.
- Stat row: `rowLabel` sets the row's accessible name.
- Visual baselines are written on Linux by the `visual-baselines` PR label, never locally.

**Operational notes:**

- Migration: <!-- none --> no datastore.
- Feature flag / config: none. The security policy contract (`tests/contracts/csp.contract.json`) and `public/_headers` are unchanged; the Shell's scripts are served by the site itself.
- New dev dependency: `stylelint-declaration-strict-value` (ADR-0004). Nothing is added to the shipped site.
- Deploy: merges into `v2` only. Production (`main`, the stub) is not affected.
- Interim until steps 4 and 5: "Contact" and "Get in touch" land on the home placeholder, "CV" and "View CV" answer with the English PDF (spec §1.2; P-50 and P-51 keep the release gate closed until then).
- Rollback: revert the merge commit on `v2`. Nothing outside the repo changes.

**Open items carried forward:**

- fjord-foundation OQ-02 is closed: the Owner accepted the Not-found design match on 2026-10-05; the accepted differences are spec §1.3 (D-01 to D-18).
- Before step 4: backlog B-09 (the Shell script budget measures the page total) and B-18. Before step 5: B-08. Step 4 or 5: B-05, B-25. Step 7: B-29. The full list is in [`docs/backlog.md`](../../backlog.md).
- fjord-foundation OQ-01 (the Dag warning pair, 4.40:1) is still printed as a known failure; fix before step 7.

**Acceptance criteria delivered:** AC-01 to AC-32: the header on every page, with nothing that leads nowhere (AC-01 to AC-03); the phone menu that opens, closes and never traps, and navigation with scripts off (AC-04 to AC-06); the Sticky action bar (AC-07 to AC-09); the theme switch, kept across pages and never showing a wrong selection (AC-10 to AC-12, AC-29); the skip link (AC-13); the footer and contact facts in one place (AC-14 to AC-16); the Not-found page per its page design (AC-17 to AC-19); the closing band (AC-20); the Styleguide, not discoverable (AC-21, AC-22); one primary action (AC-23); Shell by page options (AC-24); touch targets and keyboard use (AC-25); token-only styles (AC-26); the unchanged security policy (AC-27); reduced motion (AC-28); the Toast (AC-30); the two open parity items (AC-31); page cross-fade with a still header (AC-32).
