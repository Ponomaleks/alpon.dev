import { expect, test, type Page } from '@playwright/test';

// SCR-02 end to end (AC-07, AC-08) and reduced motion on both pages (AC-14).

test.describe('Not-found page', () => {
  test('an unknown address gets a 404 and the Fjord Not-found page', async ({ page }) => {
    const response = await page.goto('/this/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.locator('.code')).toHaveText('404 · Ikke funnet');
    await expect(page.locator('[lang="no"]')).toHaveText('Ikke funnet');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.locator('main p')).toHaveText(
      'This page is off the map. The link may be old, or the page has moved.',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('"Back to home" is the only action and leads home (AC-08)', async ({ page }) => {
    await page.goto('/does-not-exist');
    const links = page.getByRole('link');
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute('href', '/');
    await expect(links).toHaveAccessibleName('Back to home');
    await expect(page.getByText(/see projects/i)).toHaveCount(0);
    await expect(page.locator('a[href^="/projects"]')).toHaveCount(0);
    await links.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alexander Ponomarenko');
  });

  test('a crafted address with markup is never echoed back or executed', async ({ page }) => {
    const dialogs: string[] = [];
    page.on('dialog', (dialog) => {
      dialogs.push(dialog.message());
      void dialog.dismiss();
    });
    const crafted = '/<b>x</b>-%3Cscript%3Ealert(1)%3C/script%3E';
    const response = await page.goto(crafted);
    expect(response?.status()).toBe(404);
    const requested = new URL(page.url()).pathname;
    const html = await page.content();
    for (const fragment of [requested, decodeURIComponent(requested), '<b>x</b>', 'alert(1)'])
      expect(html).not.toContain(fragment);
    expect(dialogs).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  /** Every declared transition that is not an opacity fade, as `selector: property`. */
  const movingTransitions = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll('*')].flatMap((element) => {
        const style = getComputedStyle(element);
        const properties = style.transitionProperty.split(',').map((p) => p.trim());
        const durations = style.transitionDuration.split(',').map((d) => parseFloat(d));
        return properties
          .filter(
            (property, i) => (durations[i % durations.length] ?? 0) > 0 && property !== 'opacity',
          )
          .map((property) => `${element.tagName.toLowerCase()}.${element.className}: ${property}`);
      }),
    );

  for (const path of ['/', '/does-not-exist']) {
    test(`${path} has no running animation and no transition other than opacity`, async ({
      page,
    }) => {
      await page.goto(path);
      for (const link of await page.getByRole('link').all()) {
        await link.hover();
        await link.focus();
      }
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      expect(await movingTransitions(page)).toEqual([]);
    });
  }
});
