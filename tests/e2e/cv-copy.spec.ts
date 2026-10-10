import { expect, test } from '@playwright/test';

// The copy-email action on the CV pages (AC-04, AC-23; screens SCR-05 / SCR-06 `copy offered /
// success`; home spec D-18): "Copied" on the English page, "Kopiert" with the Toast message marked
// Norwegian on the Norwegian page, no Copy without JavaScript. The side column shows from 1024.

const ADDRESS = /@/;

test.beforeEach(async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1280, height: 900 });
});

test('/cv/en: Copy writes the address and confirms with "Copied" (AC-04)', async ({ page }) => {
  await page.goto('/cv/en');
  const aside = page.locator('.cv-aside');
  const copy = aside.locator('[data-copy-email]');
  await copy.click();
  await expect(copy).toHaveAttribute('data-done', 'true');
  const toast = page.locator('[data-toast-region] .toast');
  await expect(toast).toContainText('Copied');
  await expect(toast.locator('[lang]')).toHaveCount(0);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toMatch(ADDRESS);
  expect(clip).toBe(await copy.getAttribute('data-copy-email'));
});

test('/cv/no: Copy says "Kopier", confirms with "Kopiert" and a Toast marked lang="no" (AC-04)', async ({
  page,
}) => {
  await page.goto('/cv/no');
  const copy = page.locator('.cv-aside [data-copy-email]');
  await expect(copy).toContainText('Kopier');
  await copy.click();
  await expect(copy).toHaveAttribute('data-done', 'true');
  const message = page.locator('[data-toast-region] .toast [lang="no"]');
  await expect(message).toHaveText('Kopiert');
});

test.describe('scripts off', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of ['/cv/en', '/cv/no']) {
    test(`${path}: no Copy is offered (AC-04, AC-23)`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.cv-aside [data-copy-email]')).toBeHidden();
      await expect(page.locator('.cv-aside a[href^="mailto:"]')).toBeVisible();
    });
  }
});
