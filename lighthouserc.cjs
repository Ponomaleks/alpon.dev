// Lighthouse CI: the per-page budget from CLAUDE.md (Quality bar), mobile emulation (the default).
// Runs with Playwright's Chromium, so CI and local use the same browser, against `wrangler dev`
// serving the built dist/, so _headers (CSP, HSTS, …) and the Workers routing are in effect as in
// production. Run `npm run build` first.
const { chromium } = require('@playwright/test');

const PORT = 8788; // not Playwright's 8787
// The address, not the name: on Windows `localhost` is tried over IPv6 first while wrangler dev
// listens on IPv4, which adds about 10 ms to every request Lighthouse observes and, on the home
// page, 150 to 200 ms of simulated blocking time that the page does not have (home sad §10).
const baseUrl = `http://127.0.0.1:${PORT}`;

const budget = {
  'categories:performance': ['error', { minScore: 0.95 }],
  'categories:accessibility': ['error', { minScore: 0.95 }],
  'categories:best-practices': ['error', { minScore: 0.95 }],
  'categories:seo': ['error', { minScore: 0.95 }],
  'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.02 }],
  'total-blocking-time': ['error', { maxNumericValue: 100 }],
};

module.exports = {
  ci: {
    collect: {
      startServerCommand: `npx wrangler dev --port ${PORT}`,
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 60_000,
      // Lighthouse refuses to audit a document answered with 404 (ERRORED_DOCUMENT_REQUEST), so the
      // Not-found page is audited at its own path, served with the same headers.
      url: [`${baseUrl}/`, `${baseUrl}/404`],
      chromePath: chromium.executablePath(),
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--headless=new --no-sandbox',
      },
    },
    assert: {
      assertMatrix: [
        { matchingUrlPattern: '^(?!.*/404$).*', assertions: budget },
        // The 404 page is noindex on purpose, so the SEO category does not apply to it: Lighthouse's
        // crawlability audit (is-crawlable) fails a noindex page by design. Recorded in spec §6/§7.
        {
          matchingUrlPattern: '/404$',
          assertions: { ...budget, 'categories:seo': 'off' },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
