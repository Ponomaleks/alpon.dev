import { expect, test } from '@playwright/test';

test('home responds 200 with a document language', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', /\S+/);
});

test('unknown path responds 404', async ({ page }) => {
  const response = await page.goto('/this-path-does-not-exist');
  expect(response?.status()).toBe(404);
});
