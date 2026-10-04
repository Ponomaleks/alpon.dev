import { expect, test } from '@playwright/test';

// AC-32, AC-28: what the browser computes from the shipped rules, checked without waiting for a
// transition to happen. Whether Chromium carries a cross-document view transition on a given
// navigation is a race on a fast local server, so the rules themselves (the opt-in under
// no-preference, `none` under reduce, the still header group, the token timing) are checked on the
// built CSS in src/styles/view-transitions.test.ts.

// The Styleguide has the live header and sample headers; the name must be on the live one only.
const FROM = '/styleguide';
const HEADER_NAME = 'site-header';

test.describe('page transitions', () => {
  test('the live header has its own view-transition-name, unique on the page (AC-32)', async ({
    page,
  }) => {
    await page.goto(FROM);
    const headerName = await page
      .locator('header[data-header]')
      .evaluate((el) => getComputedStyle(el).viewTransitionName);
    expect(headerName).toBe(HEADER_NAME);
    const named = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((el) => getComputedStyle(el).viewTransitionName)
        .filter((name) => name && name !== 'none'),
    );
    // The root element carries the browser's own name, "root"; the header's is the only other.
    expect(named.sort()).toEqual(['root', HEADER_NAME]);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('following the header wordmark opens the new page (AC-32, AC-28)', async ({ page }) => {
      await page.goto(FROM);
      await page.locator('header[data-header] a[href="/"]').click();
      await page.waitForURL((url) => url.pathname === '/');
      await expect(page.locator('header[data-header]')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  });
});
