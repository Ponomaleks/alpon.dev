// Lighthouse CI: the per-page budget from CLAUDE.md (Quality bar), mobile emulation (the default).
// Runs against the built dist/ with Playwright's Chromium, so CI and local use the same browser.
const { chromium } = require('@playwright/test');

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
      staticDistDir: './dist',
      chromePath: chromium.executablePath(),
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--headless=new --no-sandbox',
      },
    },
    assert: {
      assertMatrix: [
        { matchingUrlPattern: '^(?!.*/404\\.html$).*', assertions: budget },
        // The 404 page is noindex on purpose, so the SEO category does not apply to it.
        {
          matchingUrlPattern: '/404\\.html$',
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
