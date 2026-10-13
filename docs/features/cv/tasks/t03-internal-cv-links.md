---
id: T3
title: "Point every internal CV link at the canonical CV address through the contact data"
layer: "domain"
deps: ["T2"]
acs: ["AC-16"]
files_hint: ["src/data/contact.ts", "src/components/home/Hero.astro", "src/components/home/ExperienceList.astro", "src/components/home/hero.test.ts", "src/components/home/experience.test.ts", "src/layouts/BaseLayout.test.ts", "tests/e2e/action-bar.spec.ts", "tests/e2e/home.spec.ts", "tests/e2e/shell.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T3 — Point every internal CV link at the canonical CV address through the contact data

## Why

AC-16 ([spec §5](../spec.md)); [sad §1 Decision overrides, first item](../sad.md); [sad §8 Addresses](../sad.md); [sad §11, the row on internal CV links](../sad.md).

## What

- `src/data/contact.ts`: `links.cvPages { en: '/cv/en', no: '/cv/no' }`; `links.cv` becomes `'/cv/en'`.
- `Hero.astro` and `ExperienceList.astro` read `contact.links.cv` and stop writing the literal.
- Update the assertions on `href="/cv"` listed in sad §11 so they follow the data.

## Definition of Done

- [ ] `src/components/home/hero.test.ts` and `experience.test.ts`: the CV links carry `contact.links.cv`
- [ ] `src/layouts/BaseLayout.test.ts`: the Shell's CV links carry `contact.links.cv`
- [ ] A search for a literal CV address in `src/components/` and `src/layouts/` finds none
- [ ] `tests/e2e/home.spec.ts`, `shell.spec.ts`, `action-bar.spec.ts`: every CV link from the home page and the Not-found page arrives at `/cv/en`
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. Ends home IS-01.
- `/cv` stays a page for people who type or share it; nothing links to it from inside the site.
- The `.vcf` and the QR files are not touched.
