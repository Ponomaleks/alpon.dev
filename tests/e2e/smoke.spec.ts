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

test('home renders its sections in order, numbered, with the contact place', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main [data-hero]')).toBeVisible();
  await expect(page.locator('main section#about')).toHaveCount(1);
  await expect(page.locator('main section.experience')).toHaveCount(1);
  const contact = page.locator('main section#contact');
  await expect(contact).toHaveAttribute('tabindex', '-1');
  const eyebrows = await page.locator('main .eyebrow').allTextContents();
  expect(eyebrows.map((t) => t.replace(/\s+/g, ' ').trim())).toEqual([
    '01 / About',
    '02 / Experience',
    '03 / Recommendations',
    '04 / Contact',
  ]);
  await expect(page.locator('header[data-over-hero]')).toHaveCount(1);
});

test('opening /#contact shows the contact section unrevealed and clear of the header', async ({
  page,
}) => {
  await page.goto('/#contact');
  const contact = page.locator('main section#contact');
  await expect(contact).toBeInViewport();
  await expect(contact).not.toHaveAttribute('data-reveal', 'pending');
  const top = await contact.evaluate((el) => el.getBoundingClientRect().top);
  const header = await page
    .locator('header[data-header]')
    .evaluate((el) => el.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(header - 1);
});
