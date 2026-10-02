import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// SCR-02 visual regression (spec §6, sad §10): 390 / 834 / 1440 × Dag / Natt, ≤ 0.1 % differing
// pixels against approved Linux baselines. Baselines are produced only on Linux (CI or the
// official Playwright image), never on Windows (sad §11). Until a baseline is approved and
// committed the comparison is skipped; CI's "Visual baselines" step writes the missing ones and
// uploads them as an artifact for review.

const WRITE_BASELINES = process.env.FJORD_VISUAL_BASELINES === 'write';

test.describe('Not-found page visual baselines', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');
  test.skip(process.platform !== 'linux', 'visual baselines are Linux-only (sad §11)');

  for (const theme of ['dag', 'natt'] as const) {
    for (const width of [390, 834, 1440]) {
      test.describe(`${theme} at ${width}`, () => {
        test.use({
          viewport: { width, height: 900 },
          colorScheme: theme === 'natt' ? 'dark' : 'light',
        });

        test(`matches the approved baseline`, async ({ page }, testInfo) => {
          test.skip(testInfo.project.name !== 'desktop', 'one run per viewport is enough');
          const name = `not-found-${theme}-${width}.png`;
          test.skip(
            !WRITE_BASELINES && !existsSync(testInfo.snapshotPath(name)),
            `no approved Linux baseline for ${name} yet (see the CI "Visual baselines" artifact)`,
          );
          await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
          await page.goto('/does-not-exist');
          await page.evaluate(() => document.fonts.ready);
          await expect(page).toHaveScreenshot(name, { fullPage: true, maxDiffPixelRatio: 0.001 });
        });
      });
    }
  }
});
