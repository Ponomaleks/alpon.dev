import { expect, test } from '../fixtures';

// SCR-04 reachability (AC-22): the Styleguide exists but nothing leads to it.

test.describe('Styleguide', () => {
  test('/styleguide answers 200 with noindex and one h1', async ({ page }) => {
    const response = await page.goto('/styleguide');
    expect(response?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Styleguide');
  });

  test('the sitemap and built pages do not link to it (AC-22)', async ({ page, request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).not.toContain('styleguide');
    const styleguide = await request.get('/styleguide');
    expect(styleguide.status()).toBe(200);
    for (const path of ['/', '/this-page-does-not-exist']) {
      await page.goto(path);
      await expect(page.locator('a[href*="styleguide"]')).toHaveCount(0);
      expect(await page.content()).not.toMatch(/href="[^"]*styleguide/);
    }
  });

  test('"Show toast" shows the real Toast in the live region', async ({ page }) => {
    await page.goto('/styleguide');
    await page.getByRole('button', { name: 'Show toast' }).click();
    await expect(page.locator('[data-toast-region] .toast')).toContainText('Copied');
  });

  test('the real theme switch changes the page; sample switches keep their selection', async ({
    page,
  }) => {
    await page.goto('/styleguide');
    const samples = page.locator('[data-section="Theme switch"] [data-sample]');
    await expect(samples).toHaveCount(2);
    // Below 768 the real switch lives in the menu panel; the header one is hidden.
    let real = page.locator('header[data-header] [data-theme-button]');
    if (!(await real.first().isVisible())) {
      await page.locator('header[data-header] button[aria-label="Open menu"]').click();
      real = page.locator('#mobile-menu [data-theme-button]');
    }
    await real.filter({ hasText: 'Dark' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    await real.filter({ hasText: 'Light' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dag');
    await real.filter({ hasText: 'Dark' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    await expect(samples.nth(0)).toHaveAttribute('data-selected', 'dag');
    await expect(samples.nth(1)).toHaveAttribute('data-selected', 'natt');
    // AC-12: every live switch agrees with data-theme
    const live = page.locator('[data-theme-button]:not([data-sample] *)');
    for (const b of await live.all()) {
      const value = await b.getAttribute('data-theme-value');
      await expect(b).toHaveAttribute('aria-pressed', String(value === 'natt'));
    }
  });
});

test.describe('Styleguide with scripts off', () => {
  test.use({ javaScriptEnabled: false });
  test('"Show toast" is not displayed', async ({ page }) => {
    await page.goto('/styleguide');
    await expect(page.getByRole('button', { name: 'Show toast' })).toBeHidden();
  });
});
