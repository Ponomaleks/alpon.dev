import { expect, test, type Page } from '@playwright/test';

// SCR-02 end to end (AC-07, AC-08) and reduced motion on both pages (AC-14).

test.describe('Not-found page', () => {
  test('an unknown address gets a 404 and the Fjord Not-found page', async ({ page }) => {
    const response = await page.goto('/this/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.locator('.code')).toHaveText('404 · Ikke funnet');
    await expect(page.locator('main [lang="no"]')).toHaveText('Ikke funnet');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.locator('main p')).toHaveText(
      'This page is off the map. The link may be old, or the page has moved.',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('"Back to home" is the only action and leads home (AC-08)', async ({ page }) => {
    await page.goto('/does-not-exist');
    const links = page.locator('main').getByRole('link');
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

for (const width of [390, 1440]) {
  test.describe(`"Back to home" at ${width}px (review F-08, F-20)`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('is a target of at least 44 × 44 px', async ({ page }) => {
      await page.goto('/does-not-exist');
      const box = await page.getByRole('link', { name: 'Back to home' }).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    });

    test('shows its whole keyboard focus ring: no ancestor clips it', async ({ page }) => {
      await page.goto('/does-not-exist');
      // The skip link now comes first in the tab order; reach the link by keyboard, then focus it
      // so the ring is the :focus-visible one.
      await page.keyboard.press('Tab');
      const link = page.getByRole('link', { name: 'Back to home' });
      await link.focus();
      await expect(link).toBeFocused();
      const clippedBy = await link.evaluate((element) => {
        const style = getComputedStyle(element);
        const reach = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
        const rect = element.getBoundingClientRect();
        const ring = {
          left: rect.left - reach,
          top: rect.top - reach,
          right: rect.right + reach,
          bottom: rect.bottom + reach,
        };
        const found: string[] = [];
        if (style.outlineStyle === 'none' || reach <= 0) found.push('no visible outline');
        if (ring.left < 0 || ring.right > document.documentElement.clientWidth)
          found.push('the viewport');
        for (let node = element.parentElement; node && node !== document.body;) {
          const { overflowX, overflowY } = getComputedStyle(node);
          const box = node.getBoundingClientRect();
          const outside =
            ring.left < box.left ||
            ring.top < box.top ||
            ring.right > box.right ||
            ring.bottom > box.bottom;
          if ((overflowX !== 'visible' || overflowY !== 'visible') && outside)
            found.push(`${node.tagName.toLowerCase()}.${node.className}`);
          node = node.parentElement;
        }
        return found;
      });
      expect(clippedBy).toEqual([]);
    });
  });
}

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
        // Focus first: the skip link is off screen until it has focus and cannot be hovered.
        await link.focus();
        await link.hover();
      }
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      expect(await movingTransitions(page)).toEqual([]);
    });
  }
});
