---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-02"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0003: Keep all content in the repo, with no runtime datastore

- **Status:** Accepted
- **Date:** 2026-10-02
- **Deciders:** Alexander Ponomarenko (survey, greenfield foundation)

## Context

The site's data is contacts, CV files, project case studies and, later, blog posts. None of it is written by visitors. The question is where content lives and whether anything needs a database and migrations.

## Decision drivers

- Zero running cost (`CLAUDE.md`).
- Alexander adds projects and posts without rework (idea brief §3).
- Static output (ADR-0001): data has to be available at build time.

## Considered options

1. **Repo content**: typed data in `src/data/`, Astro content collections (zod-validated markdown) in `src/content/`, static files in `public/`. External sources (the blog) come in through a build-time content loader.
2. **A runtime datastore (D1 / KV)**: only needed for visitor-written data, and nothing writes any. It adds migrations, bindings and a server.
3. **A headless CMS for everything**: an external dependency and an account for content that changes rarely. Kept only for the blog, decided in its own spec.

## Decision outcome

**Chosen:** Option 1. Content is versioned with the code, validated by the build, and costs nothing. There's no datastore, so `migration_tool: none` and scaffold drops its migration task.

## Consequences

**Positive**
- Every content change is reviewed in a PR and type-checked. There are no runtime failure modes.

**Negative**
- Content edits need a commit and a rebuild (minutes, not seconds).

**Neutral**
- The blog's external source (proposed: Notion) is read at build time only. It's still not a runtime datastore.

## Links

- Map: [[../architecture-map.md]] §Datastores
- Related ADR: [[0001-build-a-static-astro-site-served-by-workers-static-assets]]
