import { expect, test, type Locator, type Page } from '@playwright/test';

// Sizes of the Shell that CSS fixes, taken from the page design (design system Header, .fj-btn--sm, .fj-seg,
// .fj-footer, .fj-band and site.css). Where the design draws a control lower than 44 px, the
// touch target is kept by an invisible overlay (spec D-08), which shell.spec.ts measures.
// Nothing here depends on how a font is rendered: text wrapping is left to the visual baselines.

const open = async (page: Page, width: number, path = '/') => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(path);
};

const height = async (target: Locator) => {
  const box = await target.boundingBox();
  if (!box) throw new Error('element has no box');
  return box.height;
};

test.describe('header at 390', () => {
  test('is 64 high with a 17 px wordmark and a 36 px "Get in touch"', async ({ page }) => {
    await open(page, 390);
    const header = page.locator('header[data-header]');
    // 64 px of content plus the bottom border line.
    expect(await height(header.locator('.header__in'))).toBe(64);
    await expect(header.locator('a[aria-label="alpon.dev, home"]')).toHaveCSS('font-size', '17px');
    expect(await height(header.locator('.header__cta .fj-btn'))).toBe(36);
  });
});

for (const width of [834, 1440]) {
  test(`the header theme switch is 38 high at ${width}`, async ({ page }) => {
    await open(page, width);
    expect(await height(page.locator('header[data-header] .theme-toggle'))).toBe(38);
    expect(await height(page.locator('header[data-header] .header__cta .fj-btn'))).toBe(36);
  });
}

test('the menu panel theme switch is 38 high at 390', async ({ page }) => {
  await open(page, 390);
  await page.locator('header[data-header] button[aria-label="Open menu"]').click();
  expect(await height(page.locator('#mobile-menu .theme-toggle'))).toBe(38);
});

test.describe('footer at 390', () => {
  test('link rows are as high as their line, 21 px, with no minimum height', async ({ page }) => {
    await open(page, 390);
    const links = page.locator('footer .fj-footer__col a');
    expect(await links.count()).toBeGreaterThanOrEqual(4);
    for (const link of await links.all()) expect(await height(link)).toBe(21);
  });

  test('the page ends with one 96 px reserve for the bar, not two', async ({ page }) => {
    await open(page, 390);
    await expect(page.locator('body')).toHaveCSS('padding-bottom', '0px');
    await expect(page.locator('footer.fj-footer')).toHaveCSS('padding-bottom', '96px');
    const gap = await page.evaluate(() => {
      const footer = document.querySelector('footer.fj-footer');
      if (!footer) throw new Error('no footer');
      return (
        document.documentElement.scrollHeight - (footer.getBoundingClientRect().bottom + scrollY)
      );
    });
    expect(Math.abs(gap)).toBeLessThan(1);
  });
});
