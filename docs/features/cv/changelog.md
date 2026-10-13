# Changelog — cv

## cv — the CV as a page in English and Norwegian, with print, BackToTop and the last parity items

**What:** the CV is now a page of the site and no longer only a file. `/cv/en` and `/cv/no` show the content of the two CV PDFs as HTML: the head (breadcrumbs, name, role and location lines, the language switch, "Download PDF" as the one primary button, the CV date and the size of the file), eight numbered sections, and from 1024 a side column with "On this page", the contact list and a second download. `/cv` serves the English page. "View original PDF" opens the page images of the file, which are requested only then. The language switch is two links that work with scripts off; with scripts on it keeps the Visitor's place. The page prints as a plain document in the light colours from either theme. The old home addresses `#cv` and `#cv-no` hand over to the CV pages.

The Shell changed with it, on every page for Visitors: BackToTop from 768, a marker of the current link in the mobile menu, canonical addresses and language alternates in the head, and a Sticky action bar that can carry a language switch.

The feature went into `v2` in one pull request ([Ponomaleks/alpon.dev#8](https://github.com/Ponomaleks/alpon.dev/pull/8), T1 to T34), after two review rounds ([round 1](./_review/review-2026-10-10.md), [round 2](./_review/review-2026-10-11.md)).

**Why:** after `home` every CV link of the site led to a file, and the stub's CV viewer had no counterpart in v2 ([spec](./spec.md) §1, §2). A Recruiter on a phone reads a page more easily than a PDF, and Release 1 waits for this step: stub-parity P-01 to P-03, P-30 to P-34 and P-51 belong to it and are switched on here, so no `test.fixme` is left in `tests/e2e/parity.spec.ts`. Key decisions:

- [ADR-0001](./adr/0001-carry-the-section-across-the-language-switch-as-a-shared-fragment-id.md): the section crosses the language switch as a fragment id both pages share; the scroll position of the CV head crosses as one number in the tab's session storage.
- [ADR-0002](./adr/0002-generate-a-print-block-that-reapplies-the-dag-tokens.md): the generated tokens carry a print block that re-applies the Dag colours, so print does not depend on the theme on screen.
- The CV PDF is the source of truth for the CV page, and a checksum check ties the two together (AC-25).
- Owner decisions recorded in the spec as differences from the page design: §1.3, D-01 to D-11. After implement: AC-08 reworded on 2026-10-09 (the switch of the CV head keeps the scroll position, the one of the Sticky action bar keeps the section); BackToTop hides over the end of the page (AC-22); each CV prints on three A4 sheets (AC-11).

**How to use:**

- CV text: `src/data/cv/en.ts` and `src/data/cv/no.ts`. Contact facts stay in `src/data/contact.ts`; the CV pages read them from there.
- Replacing a CV PDF, in this order and in one pull request (AC-25, `CLAUDE.md`): update the CV page in that CV language from the new file; make its page images again with `tools/cv-previews.py`; set `cvDate` in `src/data/cv/index.ts`; only then update the `sha256` of the file there; have the Owner confirm the CV rows of the Claims list again ([owner-inputs](./owner-inputs.md), table 3). Until the checksum matches, `npm run check:cv` (part of `npm run lint`) fails and names the file and the page.
- A language switch in the Sticky action bar of a new page: pass it through the page options of `BaseLayout`, as the CV pages do (home ADR-0002); no shared component is edited.
- A page with a language of its own: pass `cvLang`, the canonical address and the alternates to `BaseLayout`; the Shell stays English.
- `/styleguide` has a section for every new component with marked sample data (AC-29).

**Operational notes:**

- Migration: <!-- none --> no datastore.
- Feature flag / config: <!-- none -->
- Routing: the three `/cv` rules left `public/_redirects`; `/cv`, `/cv/en` and `/cv/no` answer 200 with the page. The addresses of the CV PDFs are unchanged.
- Response headers: `public/_headers` has rules for the CV pages (the freshness rule of the home page), the CV PDFs (shown in the browser under their file names, one hour) and the page images (one hour). The security policy and `tests/contracts/csp.contract.json` are unchanged.
- Browser storage: one whole number in the tab's session storage for one navigation (AC-08, spec §6.1). No cookie.
- No new npm dependency.
- CI: the Playwright suite runs as two shards beside a `quality` job; `check` gathers them and stays the required check with `visual`.
- Deploy: merges into `v2` only. Production (`main`, the stub) is not affected.
- Rollback: revert the merge commit on `v2`. The revert brings the `/cv` redirect rules back with it; nothing outside the repo changes.

**Open items carried forward:**

- Lighthouse CI on `/` has no room under the 2.0 s LCP limit, locally (backlog B-38) and now in CI (B-86, Owner decision).
- AC-08: about one arrival in ten under load shows one frame at the top before the carried position is restored; accepted by the Owner on 2026-10-09.
- Safari was not checked for print or for the preview; Firefox and WebKit run one spec in CI.
- The focus-ring walk of the CV content runs at 390 and 1440 in one theme (B-84).
- Natt and the widths 1024 and 360 were not measured against the page design.
- Flakes on record: B-65, B-81, B-85. Other non-blocking findings of the two review rounds, B-61 and B-66 are in [`docs/backlog.md`](../../backlog.md).

**Acceptance criteria delivered:** AC-01 to AC-29: the English and the Norwegian CV page with the content of their CV PDF, plain language levels and no client name (AC-01 to AC-03); the side column (AC-04); the downloads and the meta line (AC-05); the primary-button rule (AC-06); the language switch with scripts off and on (AC-07, AC-08); the Original PDF preview and its failure case (AC-09, AC-10); print, in the light colours from either theme (AC-11, AC-12); the Legacy CV hand-off (AC-13, AC-14); the three addresses as pages and the CV links of the site (AC-15, AC-16); head meta, alternates and sitemap (AC-17); response headers (AC-18); the Sticky action bar on the CV pages (AC-19); the current-page marker (AC-20); BackToTop (AC-21, AC-22); the page with scripts off and under the unchanged security policy (AC-23); structure, targets, focus rings and the accessibility check (AC-24); the checksum rule (AC-25); the difference lists and the Claims list, ticked by the Owner (AC-26); the contact check on the CV pages (AC-27); the parity items (AC-28); the Styleguide sections (AC-29).
