import { expect, test } from '@playwright/test';

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
});
