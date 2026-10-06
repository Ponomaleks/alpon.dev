import { defineConfig, devices } from '@playwright/test';

const PORT = 8787;
const baseURL = `http://localhost:${PORT}`;

// Tests run against `wrangler dev` serving dist/, so _headers, _redirects and the
// 404 page behave as they do in production on Workers static assets.
export default defineConfig({
  testDir: './tests',
  // Screenshots live per platform; only Linux baselines are committed (fjord-foundation sad §11).
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/__screenshots__/{platform}/{testFileName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    // Firefox and WebKit run only in CI (owner decision 2026-10-06), on the contact place spec.
    ...(process.env.CI
      ? [
          {
            name: 'firefox',
            testMatch: /contact-place\.spec\.ts/,
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            testMatch: /contact-place\.spec\.ts/,
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),
  ],
  webServer: {
    command: `npm run build && npx wrangler dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { WRANGLER_SEND_METRICS: 'false' },
  },
});
