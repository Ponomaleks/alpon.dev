import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// SCR-01 home visual regression (AC-38, spec §6, sad §10): one capture per section at
// 390 / 834 / 1440 × Dag / Natt with motion off, ≤ 0.1 % differing pixels against approved Linux
// baselines. Same mode switch as not-found.spec.ts (FJORD_VISUAL=compare|write, Linux only, else
// skipped). The copyright year lives in the Footer, outside the sections; it is masked anyway.

const MODE = process.env.FJORD_VISUAL;

const SECTIONS = [
  { name: 'hero', selector: 'main .hero' },
  { name: 'key-facts', selector: 'main .key-facts' },
  { name: 'about', selector: 'main .about' },
  { name: 'experience', selector: 'main .experience' },
  { name: 'contact', selector: 'main #contact' },
  { name: 'closing-band', selector: '.fj-band' },
];

test.describe('Home visual baselines', () => {
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
          reducedMotion: 'reduce',
        });

        for (const { name: section, selector } of SECTIONS) {
          test(`${section} matches the approved baseline`, async ({ page }, testInfo) => {
            test.skip(testInfo.project.name !== 'desktop', 'one run per viewport is enough');
            const name = `home-${section}-${theme}-${width}.png`;
            if (MODE === 'compare')
              expect(
                existsSync(testInfo.snapshotPath(name)),
                `no approved Linux baseline for ${name}: add the visual-baselines label to the PR, review and commit the workflow's artifact`,
              ).toBe(true);
            await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
            await page.goto('/');
            await page.evaluate(() => document.fonts.ready);
            const target = page.locator(selector);
            await target.scrollIntoViewIfNeeded();
            await expect(target).toHaveScreenshot(name, {
              maxDiffPixelRatio: 0.001,
              mask: [page.locator('.fj-footer__base')],
            });
          });
        }
      });
    }
  }
});
