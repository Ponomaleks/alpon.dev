## Summary

Phase 4a of **home** (roadmap step 4, [spec](docs/features/home/spec.md)): the home page rebuilt from its page design, content first (Hero, key facts, About, Experience, Contact), the Shell changes the Owner decided on 2026-10-05 (header over the hero, Sticky action bar with page actions and a collapse tab, closing band with page actions and scroll-tied contours), head meta with structured Person data, and stub-parity P-20 to P-24 and P-50 turned on.

Base: `v2`. Production (`main`) is not touched.

**State: ready for review.**

- T1 to T25 are `done`. The Linux baselines are those of `67fa35b`, written by the `visual-baselines` workflow on `68ffcdf` ([run 37640606979](https://github.com/Ponomaleks/alpon.dev/actions/runs/37640606979)); the Owner reviewed the PNGs on 2026-10-07 and found no problems.
- T26 (this text, the document pointers, the component inventory) is `review` and stays open for one item only: **the Claims list below is not ticked yet** (AC-29). The manual iPhone focus check (T23, AC-18) passed, see below. No number or status on the page has been confirmed by the Owner through this pull request.
- **Phase 4b is not in this pull request**: Recommendations, Selected projects, their Styleguide sections and baselines (T27 to T30) follow as a separate pull request after this one is merged, branched from the updated `v2` (Owner decision 2026-10-07). Until then AC-09 and AC-12 are open; AC-10 and AC-11 hold because neither section is rendered.

## What changed

**Data and checks**

- `src/data/contact.ts`: the Work region coordinates; `src/data/person.ts` builds the structured Person data from it (AC-26, AC-27).
- `src/data/home.ts`: the typed home content (key facts, introduction, quick facts, experience, the Now line); `src/data/site.ts`: the projects feature switch; `src/scripts/home/sections.ts`: section numbers without a gap (D-05).
- `src/data/shell-actions.ts`: the typed actions a page passes to the bar and the band (home ADR-0002).
- New build checks: `scripts/check-placeholders.ts` (AC-28) and the built half of `scripts/check-contact.ts` (structured data, hero coordinates, the address in the mail-link sentence; AC-27). `scripts/check-budgets.ts` measures the Shell scripts apart from a page's own scripts and checks the four portrait files (closes backlog B-09). `scripts/contrast-pairs.ts` has the pairs of the new components and of the header over the hero.

**Shell changes**

- Header over the home hero as in the page design, 18 states (AC-33); the "secondary while the bar is on screen" rule of base-components is gone (D-14).
- Sticky action bar: actions from a page option, all secondary (AC-38); a collapse tab built on native `<details>`, drawn as part of the panel, working with scripts off (AC-39, D-11).
- One bottom reserve for the bar (`body::after` in `src/styles/base.css`); the footer has no clearance of its own (closes backlog B-08).
- Closing band: actions from a page option, the home pair without "Get in touch" (AC-40); its top margin (backlog B-18); contours that follow scrolling through `animation-timeline: view()` under `@supports`, no script (AC-41).
- `main` has its minimum height and no focus outline (backlog B-18). Toast has the optional check icon (closes backlog B-25).
- The menu panel's top bar lines up with the header.

**Home sections** (`src/components/home/`, composed in `src/pages/index.astro`)

- Hero with the availability badge, the Motion control, the eyebrow with the Work region and its coordinates, name, roles, lead, one primary "View CV", the Now line and the portrait (AC-01 to AC-04).
- Key facts panel on Stat (AC-05); About with QuickFacts (AC-07); the experience list from native `<details>` entries (AC-08).
- Contact block: five rows, "Copy" on the email row, "Save contact (.vcf)", the QR tile from 1024 and the mail-link sentence of IS-03 (AC-13 to AC-17). The contact place has `id="contact"` and takes focus (AC-18).
- Changed base components: Link `standalone`, Badge `pulse`, Button `download`, Stat `countUp`, twelve new Icon names, CopyButton (new). The Styleguide has a section for every new component and the changed Shell samples.

**Motion**

- Ambient motion (hero contour drift, portrait float, badge pulse) runs only under `data-motion="running"`, which the page script sets (home ADR-0003); the Motion control pauses and resumes it and keeps the choice for the session (AC-30).
- Count-up of the key facts, section reveal and the pointer parallax of the hero contours, each once and only with motion allowed (AC-06, AC-31, AC-36). The page's own scripts are in `src/scripts/home/`, loaded as one file.

**Head meta and structured data**

- `BaseLayout` renders the canonical address, the Open Graph and Twitter card tags with the preview image and its size, and one `application/ld+json` Person block from a page option (AC-26). A noindex page gets none of them.

**Fonts**

- The brand fonts are two variable files, weight axis 400 to 700, one per family (home sad §1 Decision override, §8 Fonts). The font limits are 50 KB per file and 80 KB for the two preloads.

**Build integration**

- `src/integrations/one-stylesheet.ts` joins the stylesheets of each page into one file after the build.

**Tests and CI**

- New e2e specs: home (first phone screen, sections, touch targets, scripts off), contact, contact place in Chromium, Firefox and WebKit, header states, primary-button count, action bar, motion. Axe cases for the home page; visual specs for the home page per section, all Styleguide sections and the Not-found page.
- Parity: P-20 to P-24 and P-50 run as real tests (AC-35); P-50 and P-51 are reworded in `docs/stub-parity.md`.
- CI runs the placeholder check and the built contact check after the build. Lighthouse CI audits `127.0.0.1` instead of `localhost` (a fix of the measurement method, home sad §10).
- No new npm dependency.

**Documents**

- `CLAUDE.md` Project structure; one-line pointers in the base-components spec at D-06, AC-03, AC-07, AC-08, AC-20, AC-23, AC-24 and the §6 "Primary buttons" row; the component inventory in `docs/design-system.md`; backlog B-09, B-18 and B-25 closed; the step 4 row of `docs/roadmap.md`.

## Test results

**Local gate** (Windows, the last full run before this text):

- `npm run test:unit`: 849 passed in 46 files.
- `npm run lint`: clean.
- `npm run test` (Playwright): 870 passed, 116 skipped.
- `npm run check:budgets`, `npm run check:placeholders`, `npm run check:contact:built`: pass.
- `npm run lhci`: green.

**CI**: run 37587038717 on `1668cd5`: all jobs green, including `visual`.

**Screenshots**: the Linux baselines in `tests/visual/__screenshots__/linux/` at 390, 834 and 1440 in Dag and Natt are the screenshots of this pull request; the Owner reviews them against `design/screenshots/{dag,natt}_home.png` and the standalone design.

### Lighthouse

The budget is unchanged (`CLAUDE.md`, Quality bar): four categories ≥ 95, LCP ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 100 ms.

| Where | Method | Page | Performance | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Cloudflare preview of the branch, `https://feat-home-alpon-dev.ponomalex-work.workers.dev/` | 2026-10-06, the Owner: Chrome DevTools in incognito, no extensions, Lighthouse 13.4.1, mobile, simulated throttling, one run | `/` | 99 | 1.18 s | 1.59 s | 81 ms | 0 |
| Local, the Owner's Windows machine | 2026-10-06 and 2026-10-07: `npm run lhci` (Lighthouse 12.6.1 in Playwright's headless Chromium, mobile, simulated throttling, 3 runs, `wrangler dev` at `127.0.0.1:8788`) | `/` | 99 | 1.14 to 1.36 s | 1972, 1968, 1971 ms on 2026-10-07; earlier runs 2121, 2120, 1968 ms (passed) and 2014, 2020, 2168 ms (failed) | 0 to 113 ms | 0 |
| Local, same method | 2026-10-07 | `/404` | 100 | 0.91 to 0.96 s | 1662, 1669, 1669 ms | 0 ms | 0 |

- On the preview, accessibility and best practices are 100. **SEO is 69 there only because `workers.dev` preview addresses send `x-robots-tag: noindex`**; `alpon.dev` does not send it.
- `lhci` asserts on the best of the three runs: the default `optimistic` aggregation, kept by Owner decision of 2026-10-07 (backlog B-38).
- The budget is met on the production-like host. Locally `/` sits at the LCP limit (backlog B-38): if that blocks pushes it goes to the Owner as a decision, the limit is not changed.
- CI (Linux Chromium, Lighthouse CI of run 37545199262 on `f91652e`, 2026-10-06): `/` LCP 1985, 1981 and 1996 ms, FCP 1154 to 1164 ms, TBT 0, CLS 0, all four categories 0.99 to 1; `/404` LCP 1680, 1691 and 1682 ms. In the same run the contact place spec passed in Firefox and in WebKit.

### Budgets

`npm run check:budgets` on a build of `1668cd5`, 2026-10-07:

| What | Measured | Limit |
|---|---|---|
| Home page, initial JS | 4.1 KB gzip | 50 KB |
| Home page, Shell scripts | 2.2 KB gzip | 5 KB |
| Home page, its own scripts | 1.9 KB gzip | 10 KB |
| `schibsted-grotesk-wght.woff2` | 45.7 KB | 50 KB |
| `jetbrains-mono-wght.woff2` | 30.6 KB | 50 KB |
| Two font preloads | 76.3 KB | 80 KB |
| Portrait 340 AVIF / 340 WebP / 680 AVIF / 680 WebP | 4.4 / 7.3 / 22.6 / 37.0 KB | 40 KB each |
| `404.html` | 12.0 KB gzip | 20 KB |

## Acceptance criteria

Built and covered by tests in this phase: AC-01 to AC-08, AC-13 to AC-18, AC-26 to AC-28, AC-30 to AC-36, AC-38 to AC-41 (the task per AC is in the [epic](docs/features/home/tasks/_epic.md), "AC coverage").

Open:

- AC-29: the Claims list below waits for the Owner's ticks; phase 4b adds the Recommendations rows.
- AC-09, AC-12: phase 4b.
- The "Design match" row of spec §6 is the Owner's manual review of this pull request.

## Differences from the page design

By ID; the full rows are in spec §1.2 and §1.3.

Interim surfaces (not checked against the design):

- IS-01: "View CV" and "Full CV" lead to the CV address (step 5).
- IS-02: the legacy `#cv` addresses do nothing yet (step 5).
- IS-03: a mail-link sentence in the place of the Message form (step 12).

Confirmed differences:

- D-01: a Motion control in the hero; the badge dot pulses under it.
- D-02: the loops start only with scripts and with motion allowed.
- D-03: the Contact block shows the Work region.
- D-04: sections are visible by default.
- D-05: no "See projects", no Selected projects; sections renumbered.
- D-06: the Now line has a real project, no bracketed text.
- D-08: the header over the hero needs scripts; default header without them.
- D-09: profile links open in the same tab.
- D-10: the Sticky action bar's actions per page, all secondary.
- D-11: the bar can be collapsed by a tab that is part of the panel.
- D-12: the home closing band has no "Get in touch".
- D-13: the band's contours follow scrolling.
- D-14: base-components D-06 dropped.
- D-15: contact row label "Region".
- D-16: one language per line.
- D-17: two-column experience entries from 768 to 1023 only.
- D-18: "Copy" shows "Copied" (English, no check icon, the design's width) after a copy that worked, where the design shows "✓ Kopiert", and nothing after a refused one; its name stays "Copy"; the Toast says "Copied" with the address in English. "Kopiert" leaves the Norwegian list in `CLAUDE.md`; this differs from BRAND.md's list of Norwegian details (Owner decision).

(D-07 left the spec with the Message form.)

Accepted during implementation:

- `main` has a literal `min-height: 60vh`: sizes are outside the token rule of base-components ADR-0004 and `tokens.css` has no size for it (T4, accepted by the Owner).
- The Dag header over the hero takes its colours from the on-spruce rule of `tokens.css`, which names its selector (T7).
- The brand fonts as two variable files and the one joined stylesheet per page (see "What changed").
- Not taken in the Owner's design review of 2026-10-07: the header border in Natt stays as specified (AC-33), and BackToTop stays with step 5.
- Small differences left after that review, in the backlog: B-40 (the menu panel's top bar moves while the panel enters), B-41 (the email address wraps by one character at 390), B-42 (badge height, external Link icon size, the Now line in two lines on a phone, a faint badge pulse in Dag).

### Design review by the Owner (2026-10-07)

Fixed to match the page design: the Dag header over the hero is translucent again; the Natt hero has the page ground, a bottom border and the link colour for the first role and the Now dot; the Motion control no longer stretches the badge row; the Now dot sits on the first line; the hero contours move against the pointer; the experience entries follow the design's layout and the Experience split is 7 / 5; "Full CV" has its arrow; the contact values are mono, in the text colour, underlined on hover only; "Copy" is the design's small control at the end of the row; "Save contact (.vcf)" has the user-plus icon, also in the Sticky action bar; "Skann meg" stands under the QR tile with the hint beside it; the mail-link sentence stands beside the list from 1024; the menu panel's top bar lines up with the header.

## iPhone focus check (T23)

Manual iPhone check for AC-18, reported by the Owner on 2026-10-07: a real iPhone, Safari with VoiceOver, on the Workers preview. **Pass in all three cases**: focus lands at the start of the contact section, not at the top of the page. The Owner ticks each case.

- [x] **1.** Home, menu → "Contact": after the jump VoiceOver announced "03" (the section number); the first swipe right reads the heading, further swipes read the contact rows.
- [x] **2.** Home, header "Get in touch": the same.
- [x] **3.** Not-found page → "Contact": the navigation works and VoiceOver behaves the same.

Follow-up from the check, made after it and not re-tested on the device: the bare "03" had no context, so the section number is now hidden from assistive technology and the About, Experience and Contact sections take their names from their headings (`aria-labelledby`). No visual change.

## Known open points

- The first Workers Builds attempt for `0bfb705` failed: the preview command in the Cloudflare Workers Builds settings was corrected by the Owner (`npm run build && npx wrangler preview`); nothing in the repo changed.
- `upgrade-insecure-requests` left the Content-Security-Policy in a separate pull request to `v2` (Ponomaleks/alpon.dev#4, merged into this branch): WebKit applied it to the local test server and every WebKit test hung. This feature itself does not change the security policy (AC-32).
- The Owner's ticks on the Claims list (T26).

## Claims list (AC-29)

Every number and status a Visitor can read on the home page, as built at `1668cd5`, with its source in the repo. **Nothing here is ticked or confirmed yet.** The Owner ticks a row after checking that the claim is true and can be backed in an interview. A claim shown in several places has one row.

### Hero

- [ ] **1.** "Open to work". Where: hero, availability badge. Source: `src/components/home/Hero.astro`, Badge `label`
- [ ] **2.** "Oslo area". Where: hero, availability badge. Source: `src/components/home/Hero.astro`, Badge `detail`
- [ ] **3.** "Oslo, Norge". Where: hero eyebrow; menu panel; Contact block row "Region". Source: `src/data/contact.ts` `workRegion`
- [ ] **4.** "59.91° N, 10.75° E". Where: hero eyebrow, beside "Oslo, Norge". Source: `src/data/contact.ts` `workRegionGeo.lat`, `workRegionGeo.lon`
- [ ] **5.** "Software Engineer" and "Full Stack Developer". Where: hero, roles. Source: `src/components/home/Hero.astro`
- [ ] **6.** "Nå: alpon.dev" (the current project). Where: hero, Now line. Source: `src/data/home.ts` `nowProject`; `docs/features/home/owner-inputs.md`
- [ ] **7.** "MSc Computer Science at Woolf University". Where: hero, Now line. Source: `src/data/home.ts` `MSC` (used by `nowLine`)

### Key facts

- [ ] **8.** "3+ yrs" "Software Engineer in enterprise teams". Where: key facts, first. Source: `src/data/home.ts` `keyFacts[0]` `value`, `suffix`, `unit`, `label`
- [ ] **9.** "EPAM Systems · 2022 – 2026". Where: key facts, first, context line. Source: `src/data/home.ts` `keyFacts[0].context`
- [ ] **10.** "~40" "Students taught React fundamentals". Where: key facts, second. Source: `src/data/home.ts` `keyFacts[1]` `value`, `prefix`, `label`
- [ ] **11.** "Alfred Nobel University · 2 groups". Where: key facts, second, context line. Source: `src/data/home.ts` `keyFacts[1].context`
- [ ] **12.** "~2000" "Participants in the IT Marathon where I led an Angular team". Where: key facts, third. Source: `src/data/home.ts` `keyFacts[2]` `value`, `prefix`, `label`
- [ ] **13.** "EPAM IT Marathons · 2023 – 2025". Where: key facts, third, context line. Source: `src/data/home.ts` `keyFacts[2].context`
- [ ] **14.** "100+" "Repositories on GitHub". Where: key facts, fourth. Source: `src/data/home.ts` `keyFacts[3]` `value`, `suffix`, `label`
- [ ] **15.** "github.com/ponomaleks". Where: key facts, fourth, context line. Source: `src/data/home.ts` `keyFacts[3].context`

### About

- [ ] **16.** "I’m a frontend-focused full stack engineer. I build web applications with React, Angular and TypeScript, and backend services with Python and FastAPI.". Where: About, introduction. Source: `src/data/home.ts` `intro`
- [ ] **17.** "For the last years I worked at EPAM Systems on a large enterprise event platform, led a small Angular team". Where: About, introduction. Source: `src/data/home.ts` `intro`
- [ ] **18.** "mentored around 40 students". Where: About, introduction. Source: `src/data/home.ts` `intro`
- [ ] **19.** "Now I’m based in the Oslo area and looking for a team to build good products with.". Where: About, introduction. Source: `src/data/home.ts` `intro`
- [ ] **20.** "Based in": "Nittedal, Oslo area" (Residence and Work region). Where: About, quick facts. Source: `src/data/home.ts` `quickFacts[0].v`
- [ ] **21.** "Norwegian work permit". Where: About, quick facts, "Based in". Source: `src/data/home.ts` `quickFacts[0].v`
- [ ] **22.** "Focus": "Frontend, with backend experience". Where: About, quick facts. Source: `src/data/home.ts` `quickFacts[1].v`
- [ ] **23.** "Stack": "React · Angular · TypeScript · Next.js · Python · FastAPI". Where: About, quick facts. Source: `src/data/home.ts` `quickFacts[2].v`
- [ ] **24.** "English, upper-intermediate". Where: About, quick facts, "Languages". Source: `src/data/home.ts` `quickFacts[3].v[0]`
- [ ] **25.** "Norwegian, intermediate". Where: About, quick facts, "Languages". Source: `src/data/home.ts` `quickFacts[3].v[1]`
- [ ] **26.** "Ukrainian, native". Where: About, quick facts, "Languages". Source: `src/data/home.ts` `quickFacts[3].v[2]`

### Experience

The first entry is open on arrival; the others open on demand.

- [ ] **27.** "Software Engineer (Consultant)" at "EPAM Systems". Where: entry 1, heading. Source: `src/data/home.ts` `experience[0].role`, `.org`
- [ ] **28.** "Nov 2022 – Jan 2026". Where: entry 1, period. Source: `src/data/home.ts` `experience[0].period`
- [ ] **29.** "Global digital engineering company". Where: entry 1, note under the period. Source: `src/data/home.ts` `experience[0].location`
- [ ] **30.** The marker of the most recent role: the timeline dot of entry 1 is filled in the link colour. Where: entry 1, timeline. Source: `src/data/home.ts` `experience[0].current`
- [ ] **31.** "Four client and internal projects in enterprise teams, from SaaS customization to data-heavy interfaces.". Where: entry 1, summary. Source: `src/data/home.ts` `experience[0].summary`
- [ ] **32.** "Reusable, accessible React components and design-system tokens in Adobe Experience Manager for a conference series with 28,000+ attendees at the flagship event.". Where: entry 1, point 1. Source: `src/data/home.ts` `experience[0].points[0]`
- [ ] **33.** "Rebranded and extended third-party RainFocus portals for registration, live broadcasts and in-session chat.". Where: entry 1, point 2. Source: `src/data/home.ts` `experience[0].points[1]`
- [ ] **34.** "Search and interactive map modules over Elasticsearch APIs for a defense analytics product.". Where: entry 1, point 3. Source: `src/data/home.ts` `experience[0].points[2]`
- [ ] **35.** "Features, testing and one sprint as Scrum Master on EPAM University’s assessment platform (Angular).". Where: entry 1, point 4. Source: `src/data/home.ts` `experience[0].points[3]`
- [ ] **36.** Tags "React", "TypeScript", "Angular", "Redux", "Storybook", "LESS", "AEM". Where: entry 1, tags. Source: `src/data/home.ts` `experience[0].stack`
- [ ] **37.** "Angular Team Lead and Technical Expert" at "EPAM IT Marathons". Where: entry 2, heading. Source: `src/data/home.ts` `experience[1].role`, `.org`
- [ ] **38.** "2023 – 2025". Where: entry 2, period. Source: `src/data/home.ts` `experience[1].period`
- [ ] **39.** "Internal projects". Where: entry 2, note under the period. Source: `src/data/home.ts` `experience[1].location`
- [ ] **40.** "Progressed from Angular Developer to Team Lead, building MVPs from scratch.". Where: entry 2, summary. Source: `src/data/home.ts` `experience[1].summary`
- [ ] **41.** "Led three frontend developers supporting a public development programme with ~2,000 participants.". Where: entry 2, point 1. Source: `src/data/home.ts` `experience[1].points[0]`
- [ ] **42.** "Gave a technical session on EPAM’s YouTube channel.". Where: entry 2, point 2. Source: `src/data/home.ts` `experience[1].points[1]`
- [ ] **43.** Tags "Angular", "TypeScript". Where: entry 2, tags. Source: `src/data/home.ts` `experience[1].stack`
- [ ] **44.** "React course author and mentor" at "Alfred Nobel University". Where: entry 3, heading. Source: `src/data/home.ts` `experience[2].role`, `.org`
- [ ] **45.** "EPAM mentorship" (shown in the place of a period; the entry has no dates). Where: entry 3, period. Source: `src/data/home.ts` `experience[2].period`
- [ ] **46.** "Third-year CS students". Where: entry 3, note under the period. Source: `src/data/home.ts` `experience[2].location`
- [ ] **47.** "Designed and taught a React fundamentals course for ~40 students: 10 lectures and 10 workshops per group, final exam.". Where: entry 3, summary. Source: `src/data/home.ts` `experience[2].summary`
- [ ] **48.** Tag "React". Where: entry 3, tags. Source: `src/data/home.ts` `experience[2].stack`
- [ ] **49.** "Agency Group Manager / Insurance Specialist" at "Universalna Insurance Company (Fairfax Financial Holdings)". Where: entry 4, heading. Source: `src/data/home.ts` `experience[3].role`, `.org`
- [ ] **50.** "Dec 2010 – Nov 2021". Where: entry 4, period. Source: `src/data/home.ts` `experience[3].period`
- [ ] **51.** "Ukraine". Where: entry 4, note under the period. Source: `src/data/home.ts` `experience[3].location`
- [ ] **52.** "Led an agency group for eleven years and grew personal sales 20×.". Where: entry 4, summary. Source: `src/data/home.ts` `experience[3].summary`
- [ ] **53.** "Trained agents and partners in sessions for up to 100 people.". Where: entry 4, summary. Source: `src/data/home.ts` `experience[3].summary`
- [ ] **54.** "Moved into software engineering in 2021 through full-time retraining.". Where: entry 4, point 1. Source: `src/data/home.ts` `experience[3].points[0]`

### Contact, closing band and footer

- [ ] **55.** "ponomaleks@gmail.com". Where: Contact block row "Email" and the mail-link sentence; menu panel; footer. Source: `src/data/contact.ts` `email`
- [ ] **56.** "+47 405 94 584". Where: Contact block row "Phone"; menu panel; footer. Source: `src/data/contact.ts` `phone`
- [ ] **57.** "linkedin.com/in/ponomalex". Where: Contact block row "LinkedIn"; footer. Source: `src/data/contact.ts` `linkedin`
- [ ] **58.** "github.com/ponomaleks". Where: Contact block row "GitHub"; footer. Source: `src/data/contact.ts` `github`
- [ ] **59.** "Email is fastest. Phone and LinkedIn work too.". Where: Contact block, lead. Source: `src/components/home/ContactBlock.astro`
- [ ] **60.** "If your team is hiring in the Oslo area, I’d like to hear about it.". Where: closing band. Source: `src/components/layout/CtaBand.astro`
- [ ] **61.** "Based in": "Nittedal, Norge" (Residence). Where: footer. Source: `src/data/contact.ts` `residence.name`
- [ ] **62.** "60.07° N, 10.87° E". Where: footer, under the Residence. Source: `src/data/contact.ts` `residence.lat`, `residence.lon`
- [ ] **63.** "Sist oppdatert 2026-10-04". Where: footer. Source: `src/data/contact.ts` `lastUpdated`
- [ ] **64.** The contact card "Save contact (.vcf)" downloads, and the QR tile: name, title "Software Engineer", phone, email, both profiles, address Oslo, Norway. Where: Contact block, closing band, Sticky action bar; QR tile from 1024. Source: `public/alexander-ponomarenko.vcf`, checked against `src/data/contact.ts` by `scripts/check-contact.ts`; `public/qr/qr-vcard-{dag,natt}.svg` (static, a shortened card)

### Read outside the page (search results and link previews)

- [ ] **65.** "Alexander Ponomarenko · Software Engineer". Where: page title, preview card title. Source: `src/pages/index.astro`, `title`
- [ ] **66.** "Alexander Ponomarenko, Software Engineer and Full Stack Developer based in Oslo, Norway.". Where: page description, preview card. Source: `src/pages/index.astro`, `description`
- [ ] **67.** Structured Person data: job title "Software Engineer", address Oslo, NO, email, phone, both profiles. Where: `application/ld+json` block. Source: `src/data/person.ts` `buildPerson`, from `src/data/contact.ts`

Not in this list: Recommendations (phase 4b adds a row per quote with the person's agreement) and Selected projects (not rendered, AC-11).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
