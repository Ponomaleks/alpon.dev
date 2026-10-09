import { expect, test, type Page } from '@playwright/test';

// BackToTop end to end (cv T31): AC-21, AC-22; SCR-01 states back-to-top absent / hidden at the
// top / shown / always shown / activated / clearance; wireframe W-6. Below 768 the corner belongs
// to the Sticky action bar, so there is no control; from 768 it is a fixed link to #top.

const LINK = 'a[href="#top"]';
const pages = [
  { name: 'home', path: '/' },
  { name: 'Not-found', path: '/does-not-exist' },
  { name: 'CV en', path: '/cv/en' },
  { name: 'CV no', path: '/cv/no' },
] as const;
const wide = [768, 834, 1024, 1440] as const;

// Inline style sheets are blocked by the CSP; the CSSOM is not.
const tall = (page: Page) =>
  page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.style.minHeight = '2400px';
  });

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(path);
  // Home and Not-found are short: make them scrollable so scrolling is possible.
  await tall(page);
}

const frames = (page: Page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );

async function scrollTo(page: Page, y: number | 'end') {
  await page.evaluate(
    (top) => window.scrollTo(0, top === 'end' ? document.documentElement.scrollHeight : top),
    y,
  );
  await frames(page);
}

const supportsTimeline = (page: Page) =>
  page.evaluate(() => CSS.supports('animation-timeline: scroll()'));

type Box = { x: number; y: number; width: number; height: number };
const overlap = (a: Box, b: Box) => {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return Math.max(0, w) * Math.max(0, h);
};

for (const { name, path } of pages) {
  test.describe(`${name}: below 768 there is no BackToTop (AC-22)`, () => {
    for (const width of [390, 767]) {
      test(`not displayed at ${width}, also after scrolling`, async ({ page }) => {
        await open(page, path, width);
        await scrollTo(page, 1500);
        await expect(page.locator(LINK)).toHaveCount(1);
        await expect(page.locator(LINK)).toBeHidden();
        expect(await page.locator(LINK).evaluate((el) => getComputedStyle(el).display)).toBe(
          'none',
        );
      });
    }
  });

  for (const width of wide) {
    test.describe(`${name} at ${width}`, () => {
      test('hidden at the top where scroll-driven animation is supported, always shown otherwise (AC-21)', async ({
        page,
      }) => {
        await open(page, path, width);
        await scrollTo(page, 0);
        if (await supportsTimeline(page)) {
          await expect(page.locator(LINK)).toBeHidden();
          expect(await page.locator(LINK).evaluate((el) => getComputedStyle(el).visibility)).toBe(
            'hidden',
          );
          // Not focusable: Tab through the page and never land on it.
          for (let i = 0; i < 12; i += 1) {
            await page.keyboard.press('Tab');
            expect(
              await page.evaluate(() => document.activeElement?.matches('a[href="#top"]')),
            ).toBe(false);
          }
        } else {
          await expect(page.locator(LINK)).toBeVisible();
        }
      });

      test('is a named link of at least 44 x 44 once scrolled (AC-21)', async ({ page }) => {
        await open(page, path, width);
        await scrollTo(page, 1500);
        const link = page.getByRole('link', { name: 'Back to top' });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', '#top');
        const box = await link.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
        const viewport = page.viewportSize();
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport?.width ?? 0);
        expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport?.height ?? 0);
      });

      test('activating it puts the page at its top and the next Tab reaches the skip link (AC-21)', async ({
        page,
      }) => {
        await open(page, path, width);
        await scrollTo(page, 1500);
        const link = page.getByRole('link', { name: 'Back to top' });
        await expect(link).toBeVisible();
        await link.focus();
        await page.keyboard.press('Enter');
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
        await page.keyboard.press('Tab');
        await expect(page.locator('.skip-link')).toBeFocused();
      });

      test('a click does the same (AC-21)', async ({ page }) => {
        await open(page, path, width);
        await scrollTo(page, 1500);
        await page.getByRole('link', { name: 'Back to top' }).click();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
        await page.keyboard.press('Tab');
        await expect(page.locator('.skip-link')).toBeFocused();
      });

      test('at the end of the page it covers neither the last line nor the focused last footer link (AC-22)', async ({
        page,
      }) => {
        await open(page, path, width);
        const lastLink = page.locator('footer a').last();
        await lastLink.focus();
        await scrollTo(page, 'end');
        const link = page.getByRole('link', { name: 'Back to top' });
        await expect(link).toBeVisible();
        await expect(lastLink).toBeFocused();
        const linkBox = await link.boundingBox();
        const focusedBox = await lastLink.boundingBox();
        const lastLine = await page.evaluate(() => {
          // The box of the last text in the document: the page's last line.
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let last: Range | null = null;
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const parent = n.parentElement;
            if (!n.textContent?.trim() || !parent) continue;
            if (parent.closest('script, style, template')) continue;
            if (parent.closest('a[href="#top"]')) continue;
            if (getComputedStyle(parent).display === 'none') continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            if (range.getBoundingClientRect().height > 0) last = range;
          }
          const r = last?.getBoundingClientRect();
          return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
        });
        expect(linkBox).not.toBeNull();
        expect(focusedBox).not.toBeNull();
        expect(lastLine).not.toBeNull();
        expect(overlap(linkBox as Box, focusedBox as Box)).toBe(0);
        expect(overlap(linkBox as Box, lastLine as Box)).toBe(0);
      });

      test('has a visible focus ring (AC-21)', async ({ page }) => {
        await open(page, path, width);
        await scrollTo(page, 1500);
        const link = page.getByRole('link', { name: 'Back to top' });
        await expect(link).toBeVisible();
        await page.keyboard.press('Shift');
        await link.focus();
        const ring = await link.evaluate((el) => {
          const s = getComputedStyle(el);
          return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
        });
        expect(ring.style !== 'none' && ring.width > 0).toBe(true);
      });
    });
  }

  test.describe(`${name}: with JavaScript disabled`, () => {
    test.use({ javaScriptEnabled: false });

    test('the link still takes the page to the top and the next Tab reaches the skip link (AC-21)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1024, height: 844 });
      await page.goto(path);
      await tall(page);
      await page.evaluate(() => window.scrollTo(0, 1500));
      const link = page.getByRole('link', { name: 'Back to top' });
      await expect(link).toBeVisible();
      await link.click();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.keyboard.press('Tab');
      await expect(page.locator('.skip-link')).toBeFocused();
    });
  });

  test.describe(`${name}: reduced motion`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('appears without movement: no transform is animated (AC-21)', async ({ page }) => {
      await open(page, path, 1024);
      await scrollTo(page, 1500);
      const link = page.getByRole('link', { name: 'Back to top' });
      await expect(link).toBeVisible();
      const moved = await link.evaluate((el) => {
        const animated = document
          .getAnimations()
          .filter((a) => (a.effect as KeyframeEffect | null)?.target === el)
          .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes())
          .flatMap((k) => Object.keys(k))
          .filter((key) => ['transform', 'translate', 'scale', 'rotate'].includes(key));
        const s = getComputedStyle(el);
        return { animated, transform: s.transform, translate: s.translate };
      });
      expect(moved.animated).toEqual([]);
      expect(moved.transform).toBe('none');
      expect(['none', '0px', '0px 0px']).toContain(moved.translate);
    });
  });
}
