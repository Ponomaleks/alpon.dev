import { existsSync } from 'node:fs';
import { expect, test } from '../fixtures';

// SCR-05 / SCR-06 visual regression (cv AC-24, AC-29; spec §6): the content of each CV page at
// 390 / 834 / 1440 × Dag / Natt, with the Original PDF preview closed and open, motion off,
// ≤ 0.1 % differing pixels against approved Linux baselines. Same mode switch as home.spec.ts
// (FJORD_VISUAL=compare|write, Linux only, else skipped). The capture is `main`, so the footer
// with its date and year is outside it.

const MODE = process.env.FJORD_VISUAL;

test.describe('CV page visual baselines', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');
  test.skip(process.platform !== 'linux', 'visual baselines are Linux-only (sad §11)');
  test.skip(
    MODE !== 'compare' && MODE !== 'write',
    'runs only in the Playwright image with FJORD_VISUAL=compare or write',
  );

  for (const lang of ['en', 'no'] as const) {
    for (const theme of ['dag', 'natt'] as const) {
      for (const width of [390, 834, 1440]) {
        test.describe(`/cv/${lang} in ${theme} at ${width}`, () => {
          test.use({
            viewport: { width, height: 900 },
            colorScheme: theme === 'natt' ? 'dark' : 'light',
            reducedMotion: 'reduce',
          });

          for (const preview of ['closed', 'open'] as const) {
            test(`preview ${preview} matches the approved baseline`, async ({ page }, testInfo) => {
              test.skip(testInfo.project.name !== 'desktop', 'one run per viewport is enough');
              const name = `cv-${lang}-${preview}-${theme}-${width}.png`;
              if (MODE === 'compare')
                expect(
                  existsSync(testInfo.snapshotPath(name)),
                  `no approved Linux baseline for ${name}: add the visual-baselines label to the PR, review and commit the workflow's artifact`,
                ).toBe(true);
              await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
              await page.goto(`/cv/${lang}`);
              await page.evaluate(() => document.fonts.ready);
              if (preview === 'open') {
                await page.locator('main details summary').click();
                // The page images are lazy: wait until both are decoded before the capture.
                const images = page.locator('main details img');
                await expect(images).toHaveCount(2);
                for (const image of await images.all()) {
                  await image.scrollIntoViewIfNeeded();
                  await expect
                    .poll(() =>
                      image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
                    )
                    .toBe(true);
                }
              }
              await page.evaluate(() => scrollTo(0, 0));
              await expect(page.locator('main')).toHaveScreenshot(name, {
                maxDiffPixelRatio: 0.001,
              });
            });
          }
        });
      }
    }
  }
});
