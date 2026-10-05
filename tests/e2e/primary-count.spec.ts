import { expect, test, type Page } from '@playwright/test';

// One primary rule (base-components T20): AC-23, spec section 6 "Primary buttons". Counted by the
// primary style hook of Button (.fj-btn--primary) whose painted style is the filled one. The
// header "Get in touch" is always primary outside the home hero (AC-34, D-14): the bar no longer
// restyles it.

const pages = [
  { name: 'home', path: '/' },
  { name: 'Not-found', path: '/does-not-exist' },
] as const;

async function counts(page: Page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const painted = (el: Element) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return (
        s.display !== 'none' &&
        s.visibility !== 'hidden' &&
        r.width > 0 &&
        r.height > 0 &&
        s.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        s.backgroundColor !== 'transparent'
      );
    };
    const all = [...document.querySelectorAll('.fj-btn--primary')].filter(painted);
    const inMain = all.filter((el) => el.closest('main'));
    const onScreen = all.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < vh && !el.closest('[inert]');
    });
    const header = document.querySelector('header[data-header] .fj-btn');
    return {
      // AC-34: the Sticky action bar holds no primary button, painted or not.
      bar: document.querySelectorAll('[data-shell-bar] .fj-btn--primary').length,
      main: inMain.length,
      screen: onScreen.length,
      headerPrimary: !!header && all.includes(header),
    };
  });
}

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(path);
}

async function scrollAway(page: Page) {
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.style.minHeight = '2400px';
    window.scrollTo(0, 900);
  });
}

test.describe('at most 1 primary in main and 2 on screen at 390, 834 and 1440', () => {
  test.use({ reducedMotion: 'reduce' });
  for (const { name, path } of pages) {
    for (const width of [390, 834, 1440]) {
      test(`${name} at ${width}`, async ({ page }) => {
        await open(page, path, width);
        const c = await counts(page);
        expect(c.main).toBeLessThanOrEqual(1);
        expect(c.screen).toBeLessThanOrEqual(2);
        expect(c.bar).toBe(0);
        // Where the bar is absent the header action is the primary one on screen.
        if (width >= 768) expect(c.screen).toBeGreaterThanOrEqual(1);
      });
    }
  }
});

test.describe('the bar states at 390 (AC-34)', () => {
  for (const { name, path } of pages) {
    test(`${name}: bar on screen, the header action is primary`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await open(page, path, 390);
      await expect(page.locator('[data-shell-bar]')).toBeInViewport();
      const c = await counts(page);
      expect(c.headerPrimary).toBe(true);
      expect(c.bar).toBe(0);
      expect(c.main).toBeLessThanOrEqual(1);
      expect(c.screen).toBeLessThanOrEqual(2);
    });

    test(`${name}: bar scrolled away, the header action is primary, bar actions not focusable`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await open(page, path, 390);
      await scrollAway(page);
      const bar = page.locator('[data-shell-bar]');
      await expect(bar).toHaveAttribute('inert', '');
      // With motion allowed the header action fades from transparent to the filled style, so the
      // filled background is not there on the frame the bar turns inert: wait for it.
      await expect.poll(async () => (await counts(page)).headerPrimary).toBe(true);
      const c = await counts(page);
      expect(c.main).toBeLessThanOrEqual(1);
      expect(c.screen).toBeLessThanOrEqual(2);
      expect(await bar.evaluate((el: HTMLElement) => el.inert)).toBe(true);
    });

    test(`${name}: reduced motion keeps the bar and the header action stays primary`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page, path, 390);
      await scrollAway(page);
      await expect(page.locator('[data-shell-bar]')).toBeInViewport();
      const c = await counts(page);
      expect(c.headerPrimary).toBe(true);
      expect(c.screen).toBeLessThanOrEqual(2);
    });
  }

  test.describe('scripts off', () => {
    test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    for (const { name, path } of pages) {
      test(`${name}: bar on screen, the header action is primary`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('[data-shell-bar]')).toBeInViewport();
        const c = await counts(page);
        expect(c.headerPrimary).toBe(true);
        expect(c.main).toBeLessThanOrEqual(1);
        expect(c.screen).toBeLessThanOrEqual(2);
      });
    }
  });
});
