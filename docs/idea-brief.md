---
status: Draft
owner: "Alexander Ponomarenko"
updated_at: "2026-10-02"
depth: "easy"
---

# Idea brief — alpon-dev-v2

## 1. Raw idea

Rebuild alpon.dev from the current static stub into a full personal site on Astro 6, implementing the Claude Design "Fjord" design system: a landing page with contacts and clear CTAs, a CV page (EN/NO, HTML + PDF), a portfolio of live projects with case-study pages, and later a blog fed from an external CMS. The goal is to help Norwegian recruiters and tech leads understand in under a minute who I am, what I build and how to reach me, while the site itself shows my frontend craft (fast, accessible, zero hosting cost on Cloudflare Workers).

## 2. Problem

Alexander is job-hunting in Norway right now, and alpon.dev is still a temporary stub. It doesn't explain who he is or what he builds within a minute, and it doesn't show his frontend skill. Every week the stub stays live, it represents him to recruiters and tech leads at a lower level than his actual work.

## 3. Users

- **Norwegian recruiters**: a quick scan to see who he is, his role, his location (Oslo area), and how to get the CV and contact details.
- **Tech leads and hiring engineers**: a deeper look at live projects, case studies and the quality of the site itself.
- People who scan the QR on the business card or LinkedIn banner: they land on the home page on a phone and need name, role, CV and contact on the first screen.
- **Alexander himself**: he maintains the site with no hosting cost and adds projects (and later posts) without rework.

## 4. Why now

There's an active job search in Norway. The stub is what represents him today, so waiting has a real cost (see §7: ship a thin slice first).

## 5. Out of scope

- **Blog in the first release**: it stays in fog until there are posts to publish. The content source is decided in a later spec.
- **Hosting the portfolio projects here**: each one lives in its own repository and deploys separately. This site only presents them.
- **Paid services of any kind**: running cost must stay at zero, and only the domain is paid for.
- **Unverified numbers or claims**: anything Alexander hasn't confirmed stays a placeholder.

## 6. Risks

- **The success measure is craft proof, not conversations** (weakest spot): the site could become an engineer's showpiece that a recruiter can't scan in a minute. This assumes recruiters notice quality. That's false if nothing on the page makes the quality visible.
- **Success** = a recruiter can, within 60 seconds on a phone or laptop, tell who Alexander is and either open the CV or contact him. Craft proof supports this goal, it does not replace it. Measure with free, cookieless Cloudflare Web Analytics (visits to /cv, PDF downloads, contact clicks where possible) plus the 3-5 person comprehension test from §8.
- **Polishing delays launch**: perfectionism on full scope keeps the stub live during the job search. The thin-slice order in §7 mitigates this.
- **The portfolio depends on other repos**: case-study pages are only as strong as live projects that can be framed, and those ship on their own timelines.
- **Invisible quality**: performance and accessibility scores don't speak for themselves unless the site says so.
- Release 1 goes to main only at parity with the stub: /cv, /cv/en, /cv/no, /linkedin, /github, #cv-no deep link, vCard download, contact QR, 404 "Ikke funnet", security headers.

## 7. Recommendation

Ship a thin slice to production first: the landing page with contacts and the CV (EN/NO, HTML + PDF), both at the full Fjord quality bar. Add the projects section after that, and the blog last. Make alpon.dev itself case study #1. Its specs, test gates, Lighthouse/axe results and the agentic-engineering process turn invisible craft into something a tech lead can read, and they fill the portfolio before the external projects are ready. We are presenting this publicly in a restrained manner: Claude Code as a tool within the engineering process, rather than as a headline.

## 8. Open questions

- What does "craft proof" mean in practice? Which numbers or artifacts go on the alpon.dev case study, and how are they kept true? Owner: Alexander.
- Which external projects are ready to be case studies #2 and onward, and when? Owner: Alexander.
- Blog content source (proposed: Notion), decided in a later spec. Owner: Alexander.
- Should a recruiter-oriented check run alongside the craft metrics, e.g. a 60-second comprehension test with 3–5 people? Owner: Alexander.
