import { existsSync } from 'node:fs';
import { contourImagesShown, expect, test } from '../fixtures';
import { SECTIONS } from './styleguide-sections.ts';

// /styleguide visual regression (AC-17, spec §6, sad §10): one capture per data-section at
// 390 / 834 / 1440 × Dag / Natt, ≤ 0.1 % differing pixels against approved Linux baselines.
// Same mode switch as not-found.spec.ts (FJORD_VISUAL=compare|write, Linux only, else skipped).
// The copyright year lives in the real Footer, outside the sections; it is masked wherever a
// capture contains it.

const MODE = process.env.FJORD_VISUAL;

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

test.describe('Styleguide visual baselines', () => {
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

        test(`every section matches the approved baseline`, async ({ page }, testInfo) => {
          test.skip(testInfo.project.name !== 'desktop', 'one run per viewport is enough');
          await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
          await page.goto('/styleguide');
          await page.evaluate(() => document.fonts.ready);
          await contourImagesShown(page);
          await expect(page.locator('[data-section]')).toHaveCount(SECTIONS.length);
          for (const section of SECTIONS) {
            const name = `styleguide-${slug(section)}-${theme}-${width}.png`;
            if (MODE === 'compare')
              expect(
                existsSync(testInfo.snapshotPath(name)),
                `no approved Linux baseline for ${name}: add the visual-baselines label to the PR, review and commit the workflow's artifact`,
              ).toBe(true);
            await expect(page.locator(`[data-section="${section}"]`)).toHaveScreenshot(name, {
              maxDiffPixelRatio: 0.001,
              mask: [page.locator('.fj-footer__base')],
            });
          }
        });
      });
    }
  }
});
