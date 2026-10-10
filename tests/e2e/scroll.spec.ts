import { expect, test } from '@playwright/test';

// Moves inside a page scroll smoothly, as in the page design (`behavior: 'smooth'` in ext.jsx),
// and at once under reduced motion (Owner, 2026-10-10). One CSS rule on the root, no script: the
// contact place, "On this page", BackToTop and the skip link all follow it. Arriving from another
// page is not a move inside the page and is never animated by the browser.

const pages = ['/', '/cv/en', '/cv/no', '/does-not-exist'] as const;
const behaviour = () => getComputedStyle(document.documentElement).scrollBehavior;

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  for (const path of pages) {
    test(`${path} scrolls smoothly inside the page`, async ({ page }) => {
      await page.goto(path);
      expect(await page.evaluate(behaviour)).toBe('smooth');
    });
  }

  test('"On this page" on a CV page travels to the section instead of jumping', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/cv/en');
    await page.evaluate(() => document.fonts.ready);
    const target = await page.evaluate(() => {
      const section = document.getElementById('education');
      if (!section) throw new Error('no education section');
      return (
        section.getBoundingClientRect().top +
        scrollY -
        parseFloat(getComputedStyle(section).scrollMarginTop)
      );
    });
    await page.locator('.cv-aside a[href="#education"]').click();
    // Right after the click the page is still on its way.
    const early = await page.evaluate(() => scrollY);
    expect(early).toBeLessThan(target - 1);
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(Math.round(target));
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of pages) {
    test(`${path} moves at once`, async ({ page }) => {
      await page.goto(path);
      expect(await page.evaluate(behaviour)).toBe('auto');
    });
  }
});
