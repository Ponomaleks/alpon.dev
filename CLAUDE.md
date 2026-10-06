# alpon.dev

Personal site of Alexander Ponomarenko, Software Engineer / Full Stack Developer, Oslo area, Norway.
It is his professional home during a job search in Norway: landing page with contacts, CV (EN + NO), portfolio of live projects with case studies, and later a blog (/thoughts).
The site itself is a portfolio piece: code quality, accessibility and performance are part of the product.

## Stack

- Astro 6, TypeScript (strict), static output (`output: 'static'`).
- Plain CSS with custom properties. No Tailwind, no CSS-in-JS, no UI kits.
- Interactive parts are small islands (vanilla TS or React only when it clearly pays off). Default is zero client JS.
- Hosting: Cloudflare Workers with static assets (`wrangler.jsonc`, `assets.directory: ./dist`), deployed by Workers Builds from GitHub. Production branch: `main`. Other branches get preview URLs.
- Package manager: npm. Node LTS.
- Tests: Playwright (visual + e2e), @axe-core/playwright, Lighthouse CI. Run in GitHub Actions on every PR.
- Running cost must stay at zero (only the domain is paid). Do not add paid services.

## Sources of truth (read before changing UI)

1. `design/handoff/` - bundle exported from Claude Design. Read-only. It has two levels:
   - `design/handoff/site/` (page designs: `project/site/*.jsx`, `alpon.dev standalone.html`) is the source of truth for what each page looks like: layout, content, sections, copy. Reference screenshots of the page designs are in `design/screenshots/`.
   - `design/handoff/design-system/` provides the building blocks: tokens, components, states. Component demos are examples, not page specs.
   - If a page design and a component demo differ, the page design wins; the component is adapted or extended to match it. The site bundles its own, newer copy of the design system (`design/handoff/site/project/_ds/`), so a component there can differ from `design/handoff/design-system/`. `BRAND.md` still wins over both for brand rules. List conflicts in the PR.
2. `design/brand/BRAND.md` and `design/brand/tokens.json` - brand rules. If the handoff conflicts with BRAND.md, BRAND.md wins; report the conflict in the PR description.
3. `docs/` - artifacts of the SDD workflow (idea brief, specs, plans, tasks). The current SDD spec defines scope; implement only what it asks for.
4. `docs/reference/` - early drafts written before the SDD workflow (e.g. 01-foundations.md, phase 1 scaffold scope). Use them as input; if they differ from SDD artifacts, the SDD artifacts win.

## Design rules (non-negotiable)

- Use tokens only: every color, font, space, radius, duration and easing comes from `--fjord-*` custom properties in `src/styles/tokens.css`. No hardcoded hex values or magic numbers in components.
- Two themes: `Dag` (light) and `Natt` (dark). Theme = `data-theme="dag|natt"` on `<html>`, default from `prefers-color-scheme`, user choice saved in localStorage. No flash of wrong theme.
- One dark color per composition; accent only for text and interactive states, never large fills; one primary CTA per screen. The rule is counted per visible screen: at most two primary buttons, the header's "Get in touch", which is the Shell's single primary action, and at most one from page content. The closing band's "Get in touch" on pages other than home is the same Shell action as the header's (same target) and counts once with it. The sticky action bar on phones takes its actions from the page (home and 404: "View CV" and "Save contact"), uses the secondary style only and can be collapsed by the Visitor. Over the home hero the header follows the page design (home spec AC-33).
- Fonts: Schibsted Grotesk (400/500/600/700) and JetBrains Mono (400/500/700), self-hosted woff2, Latin subset including æ ø å, delivered by two variable files (weight axis 400–700, one per family; home sad §1). Max two families. Every family and weight used by the design system or the page designs is required; ship it (the variable sources are in `tools/fonts/src/`; `tools/fonts/subset.py` writes the subset woff2).
- 4px spacing grid, left-aligned asymmetric layouts, breakpoints 360 / 768 / 1024 / 1440.
- Motion: only via motion tokens. Everything must work with `prefers-reduced-motion: reduce` (fades only, no loops, counters show final values).
- View Transitions (page navigation, theme switch) are progressive enhancement: feature-detect (`document.startViewTransition` / `@view-transition`), and with `prefers-reduced-motion: reduce` disable them entirely (`@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }`, skip `startViewTransition` in JS and apply the change directly). The UI must work identically without them.
- Icons: thin line icons (1.5px stroke). No emoji as icons. No tech logos, no skill bars or percentages.

## Content rules

- English for main content. Norwegian for small warm details: "Hei", "Ta kontakt", "Kopiert", "Nå", "Oslo, Norge", "Skann meg", "Ikke funnet", "Sist oppdatert". The shell's call to action is English, "Get in touch", as in the page design; BRAND.md's "Norwegian for the call to action" applies to labels such as "Ta kontakt", not to the shell buttons.
- Voice: modest and concrete. No "passionate", "rockstar", superlatives.
- Dashes are allowed in user-facing text: the long dash (U+2014) and the en dash (U+2013) as used in the design copy (e.g. date ranges `Nov 2022 – Jan 2026`).
- Never name the EPAM client or its events directly (NDA). Indirect descriptions are allowed and the design copy is the reference (e.g. "a global B2B software leader (Fortune Global 500)", "an international conference series", "28,000+ attendees").
- Numbers on the site must be real and verified by Alexander. Unverified values stay as `[placeholder]`.
- Language levels are self-assessed: show plain labels, no CEFR codes. EN: English "Upper-intermediate", Norwegian "Intermediate", Ukrainian "Native". NO: Engelsk "Øvre mellomnivå", Norsk "Mellomnivå", Ukrainsk "Morsmål".
- Contacts live in one place: `src/data/contact.ts` (used by the contact block and footer). The vCard file (`public/alexander-ponomarenko.vcf`) is static and must match it. The QR SVGs are static too and intentionally encode a shortened subset of the vCard; do not regenerate them when the `.vcf` changes.
- Location has two meanings, keep them apart: "Oslo, Norge" / Oslo area is the region of work (hero, contacts, vCard `ADR: Oslo, Norway`); "Nittedal" is the place of residence and appears in the CV (`1482 Nittedal, Norway`) in the home quick facts ("Based in: Nittedal, Oslo area") and in the footer "Based in" column ("Nittedal, Norge", with the municipality coordinates 60.07° N, 10.87° E). `src/data/contact.ts` keeps the two as separate fields.
- Contact title: vCard `TITLE` is the broad role "Software Engineer"; the specialisation goes to `NOTE` (Full Stack Developer, agentic engineering).
- Downloads are real files, never placeholders: "Download CV" links to `public/cv/alexander-ponomarenko-cv-en.pdf` or `public/cv/alexander-ponomarenko-cv-no.pdf` by the current CV language (EN on pages without a language), and "Save contact" links to `public/alexander-ponomarenko.vcf`; both use the `download` attribute. The CV "View original PDF" preview uses the page images `public/cv/cv-{en,no}-{1,2}.webp`.

## Quality bar

- WCAG 2.2 AA: semantic HTML, logical headings, skip link, visible `:focus-visible`, 44px touch targets, no hover-only information, alt text. Exception: footer text links keep the tight spacing of the page design and meet WCAG 2.2 AA target size (2.5.8: at least 24px, or at least 24px between target centres) instead of the 44px rule.
- Performance budget per page (Lighthouse mobile): Performance, Accessibility, Best Practices, SEO >= 95; LCP <= 2.0 s; CLS <= 0.02; TBT <= 100 ms; initial JS <= 50 KB gzip (islands loaded on interaction do not count).
- No layout shift from fonts (preload the 2 critical files, `font-display: swap`, metric-matched fallbacks).
- Security headers in `public/_headers` (CSP without `unsafe-inline` scripts where possible, HSTS, Referrer-Policy, Permissions-Policy).

## Review policy

The SDD plugin has no severity scale or round limit; this section sets them and overrides the review skill's defaults.

- Blocking findings:
  - stage 1 findings that change what is built or how an AC is verified;
  - stage 2 findings that are real defects: bug, security, accessibility, broken test or CI.

  Only these are raised with the owner as Fix now / Defer / Not an issue.

- Everything else is non-blocking. This covers doc wording and drift that changes nothing built or tested, edge-case hardening of lint or test rules that no code under `src/` uses, and style. It goes to `docs/backlog.md` without asking, and the review record lists it in one table.
- Spec §8 is only for real open questions, never for deferred findings.
- At most two review rounds per feature. Round 2 reviews only the changed surface (pass the commit range as the argument). A third round happens only if round 2 has a blocking finding.
- Each fact lives in one doc. Other docs link to it by ID (AC-xx, OQ-xx, SCR-xx) and never copy values. Cite IDs, not line numbers.
- The spec lists out-of-scope and interim surfaces up front, and review does not check them against the design.
- Historical records (task results, past review rounds) are not edited and not reviewed for drift.

## Architecture decisions

- Portfolio projects live in separate repositories and deploy separately on subdomains (`<name>.alpon.dev`) or external URLs. This repo only presents them (`/projects/[slug]`).
- Project data: Astro content collection, one markdown file per project in `src/content/projects/`.
- Live previews on case-study pages use the facade pattern: a static screenshot first, the live `<iframe>` loads only after a click and only on wide screens (>= 1024px). Phones get the screenshot plus "Open live app". Each embedded app must allow framing via `Content-Security-Policy: frame-ancestors https://alpon.dev`.
- API "Try it" blocks call recorded sample responses (static JSON) by default, labelled "Sandbox · sample data". Real requests are optional and must fall back to the recorded response.
- Contact QR on desktop is a static asset, not generated in code: `public/qr/qr-vcard-dag.svg` (transparent, for the light theme) and `public/qr/qr-vcard-natt.svg` (on a stone plate, for the dark theme). Both encode a shortened vCard (ECC M, version 9), not the full `.vcf`; keep them as they are. Show one or the other by `data-theme`. Do not add QR libraries.
- Blog (/thoughts): content comes from an external source through an Astro content loader at build time; publishing triggers a rebuild through a Cloudflare Deploy Hook. The source is decided in a later spec (proposed: Notion database). Images from the source are downloaded and optimized at build time.
- Keep existing short links and routes from the stub: `/cv`, `/cv/en`, `/cv/no`, `/linkedin`, `/github`, `#cv-no` deep link, vCard download, custom 404 "Ikke funnet".

## Project structure

```
design/            handoff bundle, brand pack, reference screenshots (read-only)
docs/              SDD artifacts: idea brief, architecture map, ADRs, features/, stub-parity.md
public/            fonts, cv/, qr/, vCard, _headers, _redirects, static files (copied into dist/)
scripts/           build-time Node/TS checks (e.g. contrast check)
src/
  data/            contact.ts and other typed data
  styles/          tokens.css, base.css, prose.css
  components/
    ui/            Button, Link, Badge, Tag, Stat, SectionHeader, Callout, CodeBlock, ...
    layout/        Header, Footer, ThemeToggle, SkipLink, MobileBar
    brand/         Contours, QrTile
    prose/         Prose and its element mappings
  layouts/         BaseLayout.astro
  pages/           index.astro, 404.astro, later cv/, projects/[slug], thoughts/
  content/         content collections (projects, later thoughts)
tests/
  e2e/             smoke.spec.ts, parity.spec.ts (one test per docs/stub-parity.md id)
  a11y/            axe checks (zero violations)
  visual/          screenshots at 390 / 834 / 1440 x Dag / Natt (from the first UI spec)
tools/             sources for the OG image, contours and CV previews (not deployed)
```

## Workflow

- Follow the SDD workflow. Before coding, restate the acceptance criteria from the current SDD spec and list open questions.
- Small commits, one PR per spec (or per logical part of it). PR description: what changed, screenshots at 390 / 834 / 1440 in both themes, test results, conflicts with the design.
- After each UI change, run the visual tests and compare with the page-design screenshots in `design/screenshots/`, not with component demos.
- Every screen in a feature's `screens.md` cites its page design (file and screen in `design/handoff/site/`) as the primary reference; component files are secondary. The "Design match" review compares the built page with the page-design screenshots in `design/screenshots/` and lists every difference.
- Do not add dependencies without explaining why in the PR. Prefer platform features (CSS, View Transitions, native `<dialog>`, `popover`).
- Commands: `npm run dev`, `npm run build`, `npm run preview` (`wrangler dev` on `dist/`, production routing), `npm run test` (Playwright e2e + axe against `wrangler dev`), `npm run lint` (`astro check` + ESLint + Prettier check), `npm run format`, `npm run lhci` (Lighthouse CI on `dist/`, run after a build).
- Parity gate: `main` serves the stub until v2 reaches parity. `tests/e2e/parity.spec.ts` mirrors `docs/stub-parity.md`; the feature spec that builds an item flips its `test.fixme` to `test`. v2 goes to `main` only when no `test.fixme` is left.
- Unit tests: Vitest (`npm run test:unit`, added by fjord-foundation) runs the pure logic in `scripts/`, `src/` and `tools/` from `*.test.ts` files next to the code. `tests/` stays Playwright only.
- Astro 6 and Cloudflare Workers features change fast. Before using an API or config option, check the Astro Docs MCP and Cloudflare Docs MCP instead of relying on memory.
