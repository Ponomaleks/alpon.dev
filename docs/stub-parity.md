---
status: Current
owner: "Alexander Ponomarenko"
updated_at: "2026-10-02"
reflects_commit: "812f46f"
---

# Stub parity checklist

The temporary stub (`public/index.html`, `public/app.js`, `public/styles.css`, `public/404.html` on `main`)
is what represents Alexander until v2 reaches parity. This file records its observable behaviour
before scaffold deletes those files on `v2`, so nothing it does is lost. **Release 1 goes to `main`
only when every item below is met by v2** (idea brief §6).

Each item has an id. `tests/e2e/parity.spec.ts` carries one test per id:
- **active**: the behaviour is served by assets that survive on v2 (redirects, headers, static files). It must pass from scaffold on.
- **fixme**: the behaviour needs a v2 page that doesn't exist yet. It is a `test.fixme` until the feature spec that builds it flips it to a normal test.
  The release gate is "no `fixme` left in `parity.spec.ts`". None is left.

Source of truth for the stub: commit `89d375b` (`git show 89d375b:public/index.html`, `…:public/app.js`).

## Routes and short links (`public/_redirects`)

| Id | Behaviour | Test |
|---|---|---|
| P-01 | `/cv` answers 200 with the CV page itself, no redirect | active |
| P-02 | `/cv/en` answers 200 with the English CV page itself, no redirect | active |
| P-03 | `/cv/no` answers 200 with the Norwegian CV page itself, no redirect | active |
| P-04 | `/linkedin` → 302 → `https://www.linkedin.com/in/ponomalex/` | active |
| P-05 | `/github` → 302 → `https://github.com/ponomaleks` | active |

Note: the cv feature serves `/cv`, `/cv/en` and `/cv/no` as pages (P-01..P-03); the PDFs stay at their own addresses.

## Static files and headers (`public/_headers`)

| Id | Behaviour | Test |
|---|---|---|
| P-10 | `/cv/alexander-ponomarenko-cv-{en,no}.pdf` served inline, `Content-Disposition: inline; filename="Alexander_Ponomarenko_CV_{EN,NO}.pdf"` | active |
| P-11 | `/alexander-ponomarenko.vcf` served as `text/vcard; charset=utf-8`, `attachment; filename="Alexander Ponomarenko.vcf"` | active |
| P-12 | `/og.png` is served (1200×630, referenced by `og:image`) | active |
| P-13 | `/favicon.svg`, `/apple-touch-icon.png`, `/robots.txt`, `/sitemap.xml` are served | active |
| P-14 | Every response carries `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` | active |
| P-15 | `/fonts/*` cached `immutable`; `/cv/*` cached 1 h `must-revalidate`; the three CV page addresses and the four page images are served | active |
| P-16 | Home has a CSP with `script-src 'self'` and no `'unsafe-inline'`. On v2, the inline theme script is allowed through a **hash**, never `'unsafe-inline'` (review `_headers` when the Astro pages land) | active |

## Home page (`/`)

| Id | Behaviour | Test |
|---|---|---|
| P-20 | Shows name "Alexander Ponomarenko" and role "Software Engineer" / "Full Stack Developer" | active |
| P-21 | Contact data visible and linked: phone `+47 405 94 584` (`tel:+4740594584`), email `ponomaleks@gmail.com` (`mailto:`), LinkedIn `linkedin.com/in/ponomalex`, GitHub `github.com/ponomaleks`, "Oslo, Norge" | active |
| P-22 | Copy-email button copies the address and confirms (stub: "Copied"; v2: "Copied", home spec D-18) | active |
| P-23 | "Save contact" links to `/alexander-ponomarenko.vcf` with a `download` attribute | active |
| P-24 | Head meta: title, description, canonical `https://alpon.dev/`, `og:*` with `og:image=https://alpon.dev/og.png` 1200×630, `twitter:card=summary_large_image`, JSON-LD `Person` (name, jobTitle, email, telephone, Oslo/NO address, `sameAs` LinkedIn + GitHub) | active |
| P-25 | Skip link is the first focusable element | active |
| P-26 | Fonts: the two brand font files preloaded (Schibsted Grotesk and JetBrains Mono, one variable file each; home sad §1) | active |

## CV viewer (stub: on the home page, `#cv`)

| Id | Behaviour | Test |
|---|---|---|
| P-30 | EN / NO switch is two links, `/cv/en` and `/cv/no` (stub: ARIA tabs with arrow / Home / End keys). EN is the default | active |
| P-31 | The legacy addresses `/#cv` and `/#cv-no` hand over to the CV pages `/cv/en` and `/cv/no` | active |
| P-32 | The CV page replaces the inline PDF viewer (stub: `iframe`, `#view=FitH&pagemode=none`) | active |
| P-33 | "View original PDF" shows the page images `/cv/cv-{lang}-{1,2}.webp` at every width, no `iframe`. Page 1 eager, page 2 lazy | active |
| P-34 | "Download PDF" follows the selected CV language (`download="Alexander_Ponomarenko_CV_{EN,NO}.pdf"`); the page images open that PDF in a new tab. Meta line "PDF · 2 pages · A4" | active |

## 404

| Id | Behaviour | Test |
|---|---|---|
| P-40 | Unknown path returns status 404 | active |
| P-41 | 404 page shows "404 / Ikke funnet", has `noindex` and a link back to `/` | active |

## Not in the stub (Release 1 adds these, listed for the release gate)

- Contact QR (`public/qr/qr-vcard-{dag,natt}.svg`), required by the idea brief §6 parity line.
- Footer year: the stub fills it with JS (`#year`). On v2 it's set at build time (no JS needed).

| Id | Behaviour | Test |
|---|---|---|
| P-50 | The Shell's contact links (header, menu, bar, band) reach the contact place. Owner: step 4 | active (header and menu in parity.spec.ts; all four in contact-place.spec.ts) |
| P-51 | The Shell's CV links (header, menu, bar) reach the CV page | active |
