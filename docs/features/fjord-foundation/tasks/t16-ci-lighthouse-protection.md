---
id: T16
title: "Run Lighthouse on both pages with the Roboto-only runner and protect v2 and main"
layer: "wiring"
deps: ["T9", "T10"]
acs: ["AC-05", "AC-06"]
files_hint: [".github/workflows/ci.yml", "lighthouserc.cjs"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T16 — Run Lighthouse on both pages with the Roboto-only runner and protect v2 and main

## Why

NFR rows CLS / LCP / TBT / Lighthouse ([spec §6](../spec.md)); [sad §7 What gates what, §11 risks](../sad.md).

## What

- `ci.yml`: install `fonts-roboto`, assert no Arial (`fc-list`), before Playwright and Lighthouse.
- `lighthouserc.cjs`: confirm both `/` and `/404.html` are collected (the existing matrix already relaxes SEO on 404).
- Branch protection: record the exact `gh api` commands (required checks `check` and `visual`, no direct pushes; see [Branch protection commands](#branch-protection-commands)); the Owner runs them — it is an outward-facing repository setting. Review follow-up S1-02 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)), task R13.
- Record the Lighthouse baseline of the unstyled skeleton and the final scores in the PR ([spec §7](../spec.md)).

## Definition of Done

- [ ] CI log shows Roboto installed and no Arial
- [ ] `npm run lhci` green: Performance, Accessibility, Best Practices, SEO ≥ 95 (SEO off on 404), LCP ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 100 ms
- [ ] Branch protection active on `v2` with required checks `check` and `visual`, and on `main` by the option the Owner picks (verified with `gh api repos/Ponomaleks/alpon.dev/branches/<b>/protection`)

## Branch protection commands

Repository: `Ponomaleks/alpon.dev` (from `git remote get-url origin`). The required check names are the job ids in `.github/workflows/ci.yml`: `check` and `visual` (neither job sets `name:`). `app_id` 15368 is GitHub Actions, so only a run from the CI workflow satisfies the check. `required_approving_review_count: 0` requires a pull request (no direct pushes) without blocking a single-owner repository on an approval. `strict: true` requires the branch to be up to date with the base before merging.

Both jobs must keep reporting on every PR into `v2` and `main`: no `paths` / `paths-ignore` filters and no job-level `if:`. A required check that never reports blocks the merge forever. `ci.yml` carries a comment that says so.

### v2 — apply now

```sh
gh api -X PUT repos/Ponomaleks/alpon.dev/branches/v2/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "check", "app_id": 15368 },
      { "context": "visual", "app_id": 15368 }
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": false
}
JSON
```

### main — the Owner picks one option

`main` serves the stub until v2 reaches parity.

**Option 1: protect now, admin bypass allowed.** Same rules as `v2`, but `enforce_admins: false`, so the Owner can still merge a stub hotfix before Release 1. Note: `origin/main` has no `.github/` yet, so a PR into `main` from a branch without `ci.yml` never reports `check` or `visual`; such a hotfix merges only through the admin bypass until v2 lands on `main`.

```sh
gh api -X PUT repos/Ponomaleks/alpon.dev/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "check", "app_id": 15368 },
      { "context": "visual", "app_id": 15368 }
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": false
}
JSON
```

**Option 2: apply at Release 1.** Run the `v2` command above with `branches/main` in the URL, as a step of the Release 1 merge (v2 into `main`, once no `test.fixme` is left), right after the merge so `main` already carries `ci.yml`. Until then `main` stays unprotected.

### Verify

```sh
gh api repos/Ponomaleks/alpon.dev/branches/v2/protection --jq '.required_status_checks.checks, .enforce_admins.enabled'
gh api repos/Ponomaleks/alpon.dev/branches/main/protection --jq '.required_status_checks.checks, .enforce_admins.enabled'
```

## Notes

- Never apply the branch protection without the Owner's explicit confirmation in chat. The commands above go into the PR; the Owner runs them.
