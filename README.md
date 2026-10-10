# alpon.dev

**[alpon.dev](https://alpon.dev/)** is the personal site of Alexander Ponomarenko, Software Engineer / Full Stack Developer in the Oslo area, Norway: contacts, CV (EN + NO) and, later, a portfolio of live projects with case studies.

The site is a portfolio piece itself, so code quality, accessibility and performance are part of the product.

## Live Demo

[**View the live website →**](https://alpon.dev/)

[alpon.dev](https://alpon.dev/) still serves the temporary stub from `main`; the new site is the `v2` branch, which deploys as a preview until it is released (see [Two lines](#two-lines)).

## Two lines

- **`main`** is a temporary static stub (contacts, CV EN / NO, vCard) served straight from `public/`, with no build. It stays in production until v2 reaches parity.
- **`v2`** is the new site: Astro 6 (static output) with the Fjord design system. It deploys as a preview and does not touch production. Feature branches are merged into `v2` through pull requests.

## What v2 has today

| Route | What it is |
|---|---|
| `/` | Home: hero with portrait and the "Nå" line, key facts, About with quick facts, experience list, recommendations carousel, contact block (copy email, vCard, QR tile) |
| `/styleguide` | Every Fjord component and Shell state in one place; the visual tests screenshot it |
| 404 | The "Ikke funnet" page |
| `/cv`, `/cv/en`, `/cv/no` | CV pages in English and Norwegian, built from the CV PDFs: language switch, "Download PDF", "View original PDF" with the page images, contents list and contact list. `/cv` shows the English page and names `/cv/en` as canonical. The old `#cv` and `#cv-no` addresses of the home page hand over to them |
| `/linkedin`, `/github` | Short links kept from the stub (`public/_redirects`) |

Both themes, `Dag` (light) and `Natt` (dark), work with no flash of the wrong theme. Pages ship no client JavaScript by default; interactive parts are small vanilla TypeScript scripts.

Next on the [roadmap](docs/roadmap.md): the rest of the CV step (the printed CV with its Print button, the BackToTop link, the current-page marker in the mobile menu, the visual baselines of the CV pages), then Release 1 (v2 → `main`), then the project case studies.

## Stack

- Astro 6, TypeScript (strict), static output.
- Plain CSS with custom properties (`--fjord-*` tokens in `src/styles/tokens.css`, generated from the design system bundle and `design/brand/tokens.json`). No Tailwind, no CSS-in-JS, no UI kit.
- Self-hosted variable fonts: Schibsted Grotesk and JetBrains Mono.
- Cloudflare Workers with static assets (`wrangler.jsonc`), deployed by Workers Builds from GitHub. Free plan; only the domain is paid.
- Tests: Vitest (unit), Playwright (e2e + visual), `@axe-core/playwright`, Lighthouse CI.

## Development

Requires Node 24 (`.nvmrc`) and npm.

```powershell
npm ci
npx playwright install chromium   # once, for the tests and Lighthouse CI
```

| Command | What it does |
|---|---|
| `npm run dev` | `astro dev` with hot reload |
| `npm run build` | `astro build` → `dist/` (`public/` is copied into it) |
| `npm run preview` | `wrangler dev` on `dist/`: `_headers`, `_redirects` and the 404 page as in production (http://localhost:8787). Run `npm run build` first |
| `npm run test` | Playwright (e2e + axe) against `wrangler dev`; builds `dist/` and starts the server itself. The visual tests are skipped outside the Linux Playwright image |
| `npm run test:unit` | Vitest: the `*.test.ts` files next to the code in `scripts/`, `src/` and `tools/` |
| `npm run lint` | Token, contrast, contact and CV PDF checks, `astro check`, ESLint, Prettier `--check`, Stylelint |
| `npm run format` | Prettier `--write` |
| `npm run tokens:build` | Regenerates `src/styles/tokens.css` from the design sources |
| `npm run check:budgets` | Script and asset budgets on `dist/` (after a build) |
| `npm run check:placeholders` | Fails when `dist/` still contains a `[placeholder]` value (after a build) |
| `npm run lhci` | Lighthouse CI on `dist/` (after a build) |

### Quality bar

- WCAG 2.2 AA; axe reports zero violations.
- Lighthouse mobile, per page: Performance, Accessibility, Best Practices and SEO ≥ 95, LCP ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 100 ms, initial JS ≤ 50 KB gzip.
- Security headers in `public/_headers`. The Content-Security-Policy allows no inline scripts except the theme bootstrap, whose hash is written at build time (`src/integrations/csp.ts`).

### CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main` and `v2`. Branch protection requires two checks, `check` and `visual`. `check` gathers the results of `quality` and of the two `e2e` shards, which run side by side:

- `quality`: lint, unit tests, build, budgets, placeholder and contact checks, Lighthouse CI.
- `e2e` (two shards): Playwright e2e and axe (Chromium desktop and phone; Firefox and WebKit on the contact place spec), half of the suite each.
- `check`: passes only when `quality` and both shards passed.
- `visual`: the visual tests against the Linux baselines.

### Visual baselines

The visual tests (`tests/visual/`) compare pages with the Linux baselines in `tests/visual/__screenshots__/linux/`, taken in the official Playwright image (`mcr.microsoft.com/playwright:v1.63.0-noble`, the same version as `@playwright/test`). Without a baseline the `visual` job fails.

Main path: add the `visual-baselines` label to the pull request. The workflow `.github/workflows/visual-baselines.yml` builds the site, writes the baselines (`FJORD_VISUAL=write`) and uploads the PNG files as the `visual-baselines-linux` artifact; while the label is on, every new push to the pull request writes them again. Compare the PNG files with the design, remove the label, and only then commit them to `tests/visual/__screenshots__/linux/` and push. Otherwise the push with the baselines starts the workflow once more.

```sh
gh label create visual-baselines --description "Write the Linux visual baselines on this PR"
gh pr edit <pr> --add-label visual-baselines
gh run list --workflow visual-baselines.yml --limit 1
gh run download <run-id> -n visual-baselines-linux -D tests/visual/__screenshots__/linux
gh pr edit <pr> --remove-label visual-baselines   # before the commit and push of the baselines
```

The label is created once per repository. `gh run download` puts the PNG files straight into `tests/visual/__screenshots__/linux/`.

Fallback, locally in Docker (the same image; an anonymous volume for `node_modules` keeps the Windows dependencies untouched):

```powershell
docker run --rm --ipc=host -v "${PWD}:/work" -v /work/node_modules -w /work -e FJORD_VISUAL=write mcr.microsoft.com/playwright:v1.63.0-noble bash -c "npm ci && npx playwright test tests/visual --project desktop --update-snapshots=all"
```

## Project structure

```
alpon.dev/
├─ astro.config.mjs        Astro: static, build.format 'file', trailingSlash 'never'
├─ wrangler.jsonc          Worker: assets.directory ./dist, 404-page, auto-trailing-slash
├─ src/
│  ├─ pages/               index, 404, cv, cv/en, cv/no, styleguide
│  ├─ layouts/             BaseLayout
│  ├─ components/          ui/, layout/ (the Shell), brand/, home/, cv/
│  ├─ scripts/             page and Shell scripts (vanilla TypeScript)
│  ├─ styles/              tokens.css, fonts.css, base.css, global.css
│  ├─ data/                contact.ts, home.ts, cv/ and other typed data
│  ├─ content/             content collections (projects)
│  └─ integrations/        build integrations: CSP hash, one stylesheet per page
├─ public/                 fonts, cv/, qr/, img/, vCard, og.png, _headers, _redirects
├─ scripts/                build-time checks: tokens, contrast, contact, CV PDF, placeholders, budgets
├─ tests/                  Playwright: e2e/, a11y/ (axe), visual/
├─ docs/                   idea brief, roadmap, architecture map, ADRs, feature specs, backlog
├─ design/                 design handoff and brand pack (read-only)
└─ tools/                  sources of the OG image, contours, fonts and CV previews (not deployed)
```

## How the work is organised

The site is built spec first. Each feature has its own folder in `docs/features/` with the spec, the architecture document, tasks, the test plan and the review record; architecture decisions are in `docs/adr/`. `docs/roadmap.md` holds the steps and their order, and `docs/backlog.md` holds deferred, non-blocking findings.

### Parity with the stub

`docs/stub-parity.md` lists everything the stub does. `tests/e2e/parity.spec.ts` has one test per item: the built ones run now, the rest are `test.fixme` until a feature spec builds them. The last open items, those of the CV pages, run since the CV pages were built, so no `test.fixme` is left; the release itself (roadmap step 6) is still ahead. **v2 goes to `main` only when no `test.fixme` is left in `parity.spec.ts`.**

## Deployment

Hosting is Cloudflare Workers with static assets; the Worker is `alpon-dev` (the name must match `name` in `wrangler.jsonc`) and `alpon.dev` is its Custom Domain. Workers Builds deploys from GitHub. It does not read a custom build from `wrangler.jsonc`, and the build settings are shared by all branches, so:

- **Build command:** empty (`main` has no `package.json`; on `v2` Workers Builds installs the dependencies itself).
- **Deploy command** (production, `main`): `npx wrangler deploy`, which serves the stub's `public/`.
- **Non-production branch deploy command** (`v2` and other branches): `npm run build && npx wrangler preview`.

The preview URL of a branch is in the Worker `alpon-dev` → **Deployments**, and in the commit status on GitHub.

Workers Builds reads the Node version from `.nvmrc`. If a build log ever shows another version, add the build variable `NODE_VERSION=24` for non-production branches.

When `v2` is merged into `main`, change the production deploy command to `npm run build && npx wrangler deploy`.

### One-time Cloudflare setup (done)

Kept for reference, in case the Worker has to be created again.

1. dash.cloudflare.com → **Workers & Pages** → **Create application** → **Import a repository**; give access to this repository only. Project name `alpon-dev`, root directory `/`, commands as above.
2. Domain: the first deploy creates the DNS record and the certificate for `alpon.dev` from `wrangler.jsonc`. Check it in the Worker → **Settings** → **Domains & Routes**. If the deploy reports a DNS conflict, delete the old `A` / `AAAA` / `CNAME` records of `alpon.dev` in **DNS → Records** and retry the deployment.
3. `www.alpon.dev` → `alpon.dev`: a proxied DNS record (`AAAA`, name `www`, `100::`) and the Redirect Rule template **Redirect from WWW to Root**.
4. Optional: cookieless **Web Analytics** for `alpon.dev`, and **Email Routing** for an address on the domain.

Checks after a production deploy:

- `https://alpon.dev`: the page, the CV and the buttons.
- `https://alpon.dev/cv`: the English CV page (while `main` serves the stub: the English PDF opens).
- `https://alpon.dev/nope`: the branded 404 page.
- A phone: scan the QR code from the business card and try "Save contact".
- Link preview: https://www.linkedin.com/post-inspector/ shows `og.png`.
- Headers: https://securityheaders.com/?q=alpon.dev

To publish by hand, without Workers Builds: `npx wrangler login`, then `npx wrangler deploy` (on `v2`, `npm run build` first).

## Updating content

| What | Where | Then |
|---|---|---|
| CV (`v2`) | The CV PDF in `public/cv/` and the CV page in `src/data/cv/` | Follow [Replacing a CV PDF](#replacing-a-cv-pdf) |
| CV (`main`) | Replace `public/cv/alexander-ponomarenko-cv-en.pdf` / `-no.pdf` (same file names) | `python tools/cv-previews.py` (first time: `pip install pymupdf pillow`) |
| Contacts (`v2`) | `src/data/contact.ts` and `public/alexander-ponomarenko.vcf` | `npm run check:contact` confirms the two match |
| Contacts (`main`) | `public/index.html` (the Contact block and the JSON-LD in `<head>`) and `public/alexander-ponomarenko.vcf` | |
| Home page copy (`v2`) | `src/data/home.ts` | |

PDF files are cached for an hour, so a new version reaches everyone within the hour (or at once: **Caching → Configuration → Purge Everything**).

### Replacing a CV PDF

On `v2` the CV exists twice: as a CV PDF (`public/cv/alexander-ponomarenko-cv-en.pdf` / `-no.pdf`, the source of truth for the CV content) and as a CV page (`/cv/en`, `/cv/no`). A CV update changes both. When a CV PDF is replaced (same file name), the same pull request does this, in this order:

1. Update the CV page in that CV language from the new file: `src/data/cv/en.ts` or `src/data/cv/no.ts`.
2. Make the page images of that file again: `public/cv/cv-{en,no}-{1,2}.webp`, with `python tools/cv-previews.py` (first time: `pip install pymupdf pillow`). `--out <directory>` writes them somewhere else, to compare with the committed ones first.
3. Set the CV date: `cvDate` in `src/data/cv/index.ts`, one value for both CV languages.
4. Only after that, update the `sha256` of that file in `src/data/cv/index.ts`.
5. The Owner confirms the CV rows of the Claims list again ([owner-inputs.md](docs/features/cv/owner-inputs.md), table 3).

`npm run check:cv`, part of `npm run lint`, fails while a CV PDF differs from its recorded checksum (or is missing) and names the file and the CV page to check; the failure message prints the new checksum. The check compares checksums only and reads no text, so comparing the text of the page with the file stays the Owner's check.

## The stub (`main`)

A static page in the Fjord style: contacts from the business card, the CV (EN / NO) viewed in the browser, the vCard and the OG image. No build and no dependencies. Its files (`public/index.html`, `styles.css`, `app.js`, `404.html`) exist only on `main`; on `v2` the Astro pages replace them. Local preview on `main`: `npx wrangler dev`, then open http://localhost:8787.

How the stub shows the CV:

- Desktop browsers with a PDF viewer show the PDF inside the page.
- Phones and browsers without a PDF viewer show both pages as images; a tap opens the full PDF.
- "Open PDF" and "Download" always work. `alpon.dev/#cv-no` opens the Norwegian version.
