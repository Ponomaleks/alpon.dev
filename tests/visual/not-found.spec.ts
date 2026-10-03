import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// SCR-02 visual regression (spec §6, sad §10): 390 / 834 / 1440 × Dag / Natt, ≤ 0.1 % differing
// pixels against approved Linux baselines. Baselines and comparisons both run in the official
// Playwright image, so the pixels come from one environment (sad §11):
// - FJORD_VISUAL=compare (CI "visual" job): a missing baseline fails the test.
// - FJORD_VISUAL=write (the "Visual baselines" workflow, run by the `visual-baselines` PR label):
//   writes the baselines, which the Owner reviews against the design before committing them.
// Anywhere else the suite is skipped.

const MODE = process.env.FJORD_VISUAL;

test.describe('Not-found page visual baselines', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');
  test.skip(process.platform !== 'linux', 'visual baselines are Linux-only (sad §11)');
  test.skip(
    MODE !== 'compare' && MODE !== 'write',
    'runs only in the Playwright image with FJORD_VISUAL=compare or write',
  );

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
          if (MODE === 'compare')
            expect(
              existsSync(testInfo.snapshotPath(name)),
              `no approved Linux baseline for ${name}: add the visual-baselines label to the PR, review and commit the workflow's artifact`,
            ).toBe(true);
          await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
          await page.goto('/does-not-exist');
          await page.evaluate(() => document.fonts.ready);
          await expect(page).toHaveScreenshot(name, { fullPage: true, maxDiffPixelRatio: 0.001 });
        });
      });
    }
  }
});
