---
id: T2
title: "Add the typed home content, the projects feature switch and the section numbering"
layer: "domain"
deps: []
acs: ["AC-03", "AC-05", "AC-07", "AC-10", "AC-11"]
files_hint: ["src/data/home.ts", "src/data/home.test.ts", "src/data/site.ts", "src/scripts/home/sections.ts", "src/scripts/home/sections.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T2 — Add the typed home content, the projects feature switch and the section numbering

## Why

AC-03, AC-05, AC-07, AC-10, AC-11 ([spec §5](../spec.md)); [sad §8 Home content, Dormant Selected projects](../sad.md); [screens.md SCR-01 Content](../screens.md).

## What

- `src/data/home.ts`: key facts (value, label, context), intro, quick facts, the four experience entries, `recommendations` (typed with `consent`, empty for now) and the optional `nowProject`. Copy is taken as it is from `design/handoff/site/project/site/data.js` and `Home.jsx`.
- Helpers in the same file: `visibleRecommendations()` (only entries with consent) and `nowLine()` (project first when supplied, otherwise only the MSc part).
- `src/data/site.ts`: `features.projects = false`, the switch step 7 owns.
- `src/scripts/home/sections.ts`: pure function that numbers the sections that are rendered (About 01, Experience 02, Recommendations 03 only when present, Contact next).
- `nowProject` is set to "alpon.dev", as the Owner supplied it in [owner-inputs.md](../owner-inputs.md): the Now line reads "Nå: alpon.dev · MSc Computer Science at Woolf University". `recommendations` stays empty until T27.

## Definition of Done

- [ ] `src/scripts/home/sections.test.ts`: Contact is 03 without Recommendations and 04 with them; no gap in any combination, including `features.projects` true
- [ ] `src/data/home.test.ts`: consent filter, `nowLine()` in both states, four key facts, four experience entries with the first marked open and the most recent marked current; with the repo data `nowLine()` gives "alpon.dev" first, then the MSc part
- [ ] Same test: no value in `home.ts` contains `[` or `]`; language labels are the plain ones of `CLAUDE.md`
- [ ] No EPAM client or event name appears in the copy (NDA rule of `CLAUDE.md`)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Contact facts stay in `contact.ts`; `home.ts` holds none of them.
- Every number and status in this file is a row of the Claims list (T26).
- Owner input: the Now line project is recorded in [owner-inputs.md](../owner-inputs.md); do not ask again. `nowLine()` keeps both states (with and without a project) and both are tested.
- The Recommendations in that file are not entered here: T27 does it.
