import { expect, test, type Locator, type Page } from '@playwright/test';

// The Sticky action bar end to end (base-components T20): AC-07, AC-08, AC-09; SCR-01 states
// bar-shown, bar-away, bar-returned, bar-static; G-4, G-5. Scripts-off and reduced-motion contexts
// check bar-static; the hide and return cases run with motion allowed (sad section 8 Testing).

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error('element has no box');
  return found;
}

const BAR = '[data-shell-bar]';
const pages = [
  { name: 'home', path: '/' },
  { name: 'Not-found', path: '/does-not-exist' },
] as const;

async function open(page: Page, path: string, width = 390) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(path);
  // Home and Not-found are short: make them scrollable so scrolling is possible.
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.style.minHeight = '2400px';
  });
}

async function scrollTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  // The script reads the scroll position in an animation frame.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

const barBox = async (page: Page) => await box(page.locator(BAR));

for (const { name, path } of pages) {
  test.describe(`${name}: reduced motion keeps the bar in place (AC-07, AC-09)`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('bar sits on the bottom edge at 390 with both actions (AC-07)', async ({ page }) => {
      await open(page, path);
      const bar = page.locator(BAR);
      await expect(bar).toBeVisible();
      await expect(bar.getByRole('link', { name: 'View CV' })).toBeVisible();
      await expect(bar.getByRole('link', { name: 'Get in touch' })).toBeVisible();
      const box = await barBox(page);
      expect(Math.round(box.y + box.height)).toBe(844);
    });

    test('the last footer line ends above the bar at the end of the page (AC-07)', async ({
      page,
    }) => {
      await open(page, path);
      await scrollTo(page, 100000);
      const bar = await barBox(page);
      const footer = await box(page.locator('footer'));
      expect(footer.y + footer.height).toBeLessThanOrEqual(bar.y);
    });

    test('a focused footer link is not covered by the bar (AC-07)', async ({ page }) => {
      await open(page, path);
      const link = page.locator('footer a[href]').last();
      await link.focus();
      await expect(link).toBeFocused();
      const bar = await barBox(page);
      const linkBox = await box(link);
      expect(linkBox.y + linkBox.height).toBeLessThanOrEqual(bar.y);
    });

    test('scrolling never moves the bar (AC-09)', async ({ page }) => {
      await open(page, path);
      const before = await barBox(page);
      for (const y of [600, 1400, 600, 0]) {
        await scrollTo(page, y);
        expect(await barBox(page)).toEqual(before);
        await expect(page.locator(BAR)).not.toHaveAttribute('inert', /.*/);
      }
    });
  });
}

test.describe('bar-static with scripts off (AC-09)', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 400 } });

  for (const { name, path } of pages) {
    test(`${name}: the bar stays after scrolling`, async ({ page }) => {
      await page.goto(path);
      const before = await barBox(page);
      const footerBefore = await box(page.locator('footer'));
      await page.mouse.move(100, 100);
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(300);
      // The page did scroll, and the bar did not move.
      expect((await box(page.locator('footer'))).y).toBeLessThan(footerBefore.y);
      expect(await barBox(page)).toEqual(before);
      await expect(page.locator(BAR)).toBeInViewport();
    });
  }
});

for (const width of [768, 834, 1440]) {
  test(`the bar is not displayed at ${width} (AC-07)`, async ({ page }) => {
    await open(page, '/', width);
    await expect(page.locator(BAR)).toBeHidden();
  });
}

test.describe('bar away and returned, motion allowed (AC-08, G-4, G-5)', () => {
  test.use({ reducedMotion: 'no-preference' });

  for (const { name, path } of pages) {
    test(`${name}: leaves on the way down, returns on the way up, inert actions out of the focus order`, async ({
      page,
    }) => {
      await open(page, path);
      const bar = page.locator(BAR);
      await expect(bar).toBeInViewport();
      await expect(bar).not.toHaveAttribute('inert', /.*/);

      await scrollTo(page, 800);
      await expect(bar).toHaveAttribute('inert', '');
      await expect(bar).not.toBeInViewport();
      // Not announced and not focusable: Tab never reaches the bar's actions.
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      const reached: string[] = [];
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
        reached.push(
          await page.evaluate(
            (selector) => (document.activeElement?.closest(selector) ? 'bar' : 'page'),
            BAR,
          ),
        );
      }
      expect(reached).not.toContain('bar');

      await scrollTo(page, 600);
      await expect(bar).not.toHaveAttribute('inert', /.*/);
      await expect(bar).toBeInViewport();
      await expect(bar.getByRole('link', { name: 'View CV' })).toBeVisible();
    });
  }

  test('focus inside the bar keeps it on screen while scrolling down (G-4)', async ({ page }) => {
    await open(page, '/');
    await page.locator(BAR).getByRole('link', { name: 'View CV' }).focus();
    await scrollTo(page, 900);
    await expect(page.locator(BAR)).not.toHaveAttribute('inert', /.*/);
    await expect(page.locator(BAR)).toBeInViewport();
  });

  test('a small scroll step does not hide it and the top of the page always shows it (G-5)', async ({
    page,
  }) => {
    await open(page, '/');
    await scrollTo(page, 900);
    await expect(page.locator(BAR)).toHaveAttribute('inert', '');
    await scrollTo(page, 500);
    await scrollTo(page, 504);
    await expect(page.locator(BAR)).not.toHaveAttribute('inert', /.*/);
    await scrollTo(page, 900);
    await expect(page.locator(BAR)).toHaveAttribute('inert', '');
    await scrollTo(page, 0);
    await expect(page.locator(BAR)).not.toHaveAttribute('inert', /.*/);
  });
});
