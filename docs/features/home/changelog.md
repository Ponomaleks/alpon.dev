# Changelog — home

## home — the whole home page from its page design, with Recommendations

**What:** the v2 home page now answers who, what role, where and how to reach Alexander. It has the Hero (availability badge, "Oslo, Norge", name, roles, lead, "View CV", the Now line, the portrait and a Motion control), the key facts, About with quick facts, the experience list, Recommendations and the Contact block (five rows, "Copy" on the email, "Save contact (.vcf)", the QR tile from 1024 and a mail-link sentence in the place of the Message form). The head carries the meta and the structured Person data. The Shell changed with it: the header follows the page design over the hero, the Sticky action bar takes its actions from the page and can be collapsed, and the closing band takes its actions from the page and its contours follow scrolling. Selected projects and the shape of a project entry are built as a Dormant section, shown only on the Styleguide.

Two details of phase 4a, both in `v2`: the Contact block labels the Work region "Region", not "Based in" (`9d647f9`), and each numbered section is named by its heading through `aria-labelledby` while the section number is hidden from assistive technology (`13c5ba5`).

The feature went into `v2` in two pull requests:

- Phase 4a ([Ponomaleks/alpon.dev#3](https://github.com/Ponomaleks/alpon.dev/pull/3), T1 to T26): the Shell changes, the parity part, Hero, key facts, About, experience, Contact, head meta and motion.
- Phase 4b ([Ponomaleks/alpon.dev#5](https://github.com/Ponomaleks/alpon.dev/pull/5), T27 to T31): Recommendations with the two quotes the Owner supplied, "Show more" on long quotes, the carousel, the `projects` collection with the Dormant Selected projects section, their Styleguide sections, and the rule that every link to another site opens a new tab.

**Why:** after base-components the home page was a placeholder, and "Contact" and "Get in touch" in the Shell led to a place that did not exist ([spec](./spec.md) §1, §2). Release 1 waits for this step: stub-parity P-20 to P-24 and P-50 belong to it and are turned on here. Key decisions:

- [ADR-0001](./adr/0001-mark-the-header-over-the-hero-with-a-server-rendered-state-attribute.md): the header over the hero is marked with a server-rendered state attribute.
- [ADR-0002](./adr/0002-pass-shell-actions-as-typed-descriptors-through-page-options.md): a page passes the actions of the bar and the band as typed descriptors through page options.
- [ADR-0003](./adr/0003-run-ambient-motion-only-under-a-state-attribute-the-page-script-sets.md): Ambient motion runs only under a state attribute the page script sets.
- Owner decisions of 2026-10-08, recorded in the spec as differences from the page design: D-19 (long quotes closed to three lines), D-20 (the row is a carousel when there are more cards than columns), D-21 ("On LinkedIn" leads to the recommendations on the profile), D-09 (links to other sites open a new tab).

**How to use:**

- Home content: change `src/data/home.ts` (key facts, introduction, quick facts, experience, the Now line, Recommendations). Contact facts stay in `src/data/contact.ts`.
- A new Recommendation: add an entry to `recommendations` in `src/data/home.ts` with the quote word for word, the name, the role, `source` (`'linkedin'` shows "On LinkedIn", `'direct'` shows no link) and `consent: true`. Without `consent: true` the quote is left out; with none left the section is left out and Contact takes its number (AC-10). Add its row to the Claims list of the pull request (AC-29).
- With more Recommendations than columns (one below 768, two from 768) the row becomes a carousel by itself; nothing is configured.
- Automatic turning: `recommendationsAutoplay` in `src/data/home.ts`, off.
- A project: one markdown file in `src/content/projects/` with the fields of AC-12. Nothing is shown on the home page until step 7 turns `features.projects` on in `src/data/site.ts` and builds the Projects pages (AC-11).
- Bar and band actions of a new page: pass them through the page options of `BaseLayout` (ADR-0002); no shared component is edited.
- `/styleguide` has a section for every new component, "Testimonial" and "Selected projects" with marked sample data.

**Operational notes:**

- Migration: <!-- none --> no datastore.
- Feature flag / config: `features.projects` (`src/data/site.ts`) is off and step 7 owns it. `recommendationsAutoplay` (`src/data/home.ts`) is off.
- Security policy: `public/_headers` and `tests/contracts/csp.contract.json` are unchanged apart from the removal of `upgrade-insecure-requests` in [Ponomaleks/alpon.dev#4](https://github.com/Ponomaleks/alpon.dev/pull/4).
- No new npm dependency in the shipped site. The carousel uses CSS scroll snap and one page script; the page's own scripts are 3.6 KB gzip (budget 10 KB).
- Deploy: merges into `v2` only. Production (`main`, the stub) is not affected.
- Rollback: revert the merge commit of the phase on `v2`. Nothing outside the repo changes.

**Open items carried forward:**

- The carousel's keyboard order is tested in Chromium only; WebKit and Firefox are backlog B-57.
- The home page stays at the local LCP limit (backlog B-38): 1983 to 1998 ms against 2000 ms on 2026-10-08.
- A full local Playwright run still has a one-off `Unexpected end of JSON input` failure that passes on its retry (backlog B-44).
- Leftover worktrees in `.worktrees/` break the unfiltered local unit and lint runs (backlog B-47).
- The non-blocking review findings of phase 4b are backlog B-50 to B-56. The full list is in [`docs/backlog.md`](../../backlog.md).

**Acceptance criteria delivered:** AC-01 to AC-18, AC-26 to AC-36 and AC-38 to AC-43 (the ids AC-19 to AC-25 and AC-37 left with the Message form and are not used): the first phone screen and the Hero (AC-01 to AC-04); key facts, count-up and About (AC-05 to AC-07); the experience list (AC-08); Recommendations, word for word and only with agreement (AC-09, AC-10), the carousel (AC-42) and automatic turning (AC-43); the Dormant Selected projects section (AC-11, AC-12); the Contact block, copy, the contact card, the QR tile and the contact place (AC-13 to AC-18); head meta and Person data that match the contact data (AC-26, AC-27); no placeholder on a page and the Claims list (AC-28, AC-29); the Motion control, reveal and reduced motion (AC-30 to AC-32, AC-36); the header over the hero and the primary-button rule (AC-33, AC-34); the parity items (AC-35); the Sticky action bar and the closing band with page actions (AC-38 to AC-41).
