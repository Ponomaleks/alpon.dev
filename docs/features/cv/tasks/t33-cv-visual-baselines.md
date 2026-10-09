---
id: T33
title: "Add the visual tests of the CV pages and re-take the baselines BackToTop changed"
layer: "tests"
deps: ["T30", "T31", "T32"]
acs: ["AC-24", "AC-29"]
files_hint: ["tests/visual/cv.spec.ts", "tests/visual/styleguide-sections.ts", "tests/visual/home.spec.ts", "tests/visual/not-found.spec.ts", "tests/visual/__screenshots__/linux/", ".github/workflows/ci.yml"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T33 — Add the visual tests of the CV pages and re-take the baselines BackToTop changed

## Why

AC-24, AC-29 ([spec §5](../spec.md)); spec §6 row Visual regression; screens SCR-05 and SCR-06 (visual baseline), SCR-01 and SCR-02 (re-taken at 834 and 1440), SCR-04 (one capture per new or changed section).

## What

- `tests/visual/cv.spec.ts`: `/cv/en` and `/cv/no` × 390 / 834 / 1440 × Dag / Natt × preview closed and open.
- `tests/visual/styleguide-sections.ts`: the sections of T24, T30, T31 and T32.
- Open the pull request `feat/cv` → `v2` as a draft at the start of this task: it is the one pull request of the feature, opened early because the `visual-baselines` workflow needs it.
- Baselines in `tests/visual/__screenshots__/linux/`, written by the `visual-baselines` workflow, the main path of the README section "Visual baselines": the Owner adds the label, the artifact is downloaded and replaces the PNG folders, as on home; the home and Not-found baselines at 834 and 1440 are re-taken with them.
- `.github/workflows/ci.yml`: the name of the visual step lists the CV pages.

## Definition of Done

- [ ] 24 CV page captures exist and pass; one capture per new or changed Styleguide section at 390 / 834 / 1440 × Dag / Natt
- [ ] The home and Not-found baselines at 834 and 1440 show BackToTop by the rules of screens §Shell state changes; the 390 baselines are byte-identical to before
- [ ] The pull request `feat/cv` → `v2` exists as a draft; the gate was green before the push that opened it
- [ ] The baselines come from the `visual-baselines-linux` artifact of the workflow run on that pull request; the label is removed before they are committed and pushed
- [ ] The `visual` job of CI is green on the pull request with the committed baselines
- [ ] The Owner has looked at the new baselines before they are committed

## Notes

- Phase 5b.
- Baselines are Linux only: never written with the local Docker command and never from a Windows browser (Owner, 2026-10-09).
- Order: (1) gate green, push, open the draft pull request; the `visual` check is red, as expected; (2) stop and ask the Owner to add the `visual-baselines` label; (3) `gh run download` the artifact and replace the PNG folders; (4) stop for the Owner's review of the PNG files; (5) the label is removed, then commit and push the baselines.
- The draft stays a draft through T34 and is marked ready for review after it.
- Compare the CV captures with `design/screenshots/{dag,natt}_cv.png`; every difference outside D-01 to D-10 goes to the Owner (Design match, T34).
