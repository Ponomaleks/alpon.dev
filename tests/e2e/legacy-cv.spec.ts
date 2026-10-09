import { expect, test } from '@playwright/test';

// The Legacy CV addresses hand over to the CV pages (cv T21): AC-13, AC-14. The hand-off replaces
// the history entry, so one Back returns to the page before the home page. With scripts off, or for
// any other fragment, the home page is shown as before.

const OTHER = '/this-path-does-not-exist';

for (const [fragment, target] of [
  ['#cv', /\/cv\/en$/],
  ['#cv-no', /\/cv\/no$/],
] as const) {
  test(`/${fragment} opens the CV page and one Back returns to the page before`, async ({
    page,
  }) => {
    await page.goto(OTHER);
    await page.goto(`/${fragment}`);
    await expect(page).toHaveURL(target);
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${OTHER}$`));
  });
}

test.describe('scripts off', () => {
  test.use({ javaScriptEnabled: false });

  test('/#cv shows the home page and "View CV" leads to the CV page', async ({ page }) => {
    await page.goto('/#cv');
    await expect(page).toHaveURL(/\/#cv$/);
    const link = page.getByRole('link', { name: 'View CV' }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/cv\/en$/);
  });
});

test('/#contact stays on the home page and opens the contact place', async ({ page }) => {
  await page.goto('/#contact');
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator('#contact')).toBeVisible();
});

test('another fragment stays on the home page', async ({ page }) => {
  await page.goto('/#cv-no-x');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/#cv-no-x$/);
});
