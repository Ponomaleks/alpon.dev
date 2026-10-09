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

// AC-34 at the three places of the home page (top, over the contact section, end) and on the
// Not-found page at its top and end, at 390, 834 and 1440. Counted on the visible screen.
async function onScreen(page: Page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const visible = [...document.querySelectorAll('.fj-btn--primary')].filter((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return (
        s.display !== 'none' &&
        s.visibility !== 'hidden' &&
        s.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        r.width > 0 &&
        r.height > 0 &&
        r.bottom > 0 &&
        r.top < vh &&
        !el.closest('[inert]')
      );
    });
    return {
      screen: visible.length,
      content: visible.filter((el) => el.closest('main')).length,
      header: visible.filter((el) => el.closest('header')).length,
    };
  });
}

type Place = 'top' | 'contact' | 'end';

async function goTo(page: Page, place: Place) {
  await page.evaluate((where) => {
    if (where === 'top') window.scrollTo(0, 0);
    else if (where === 'end') window.scrollTo(0, document.documentElement.scrollHeight);
    else {
      const section = document.querySelector('#contact') as HTMLElement;
      window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY - 80);
    }
  }, place);
}

test.describe('on the visible screen at each place (AC-34)', () => {
  test.use({ reducedMotion: 'reduce' });
  const places: { path: string; name: string; at: Place[] }[] = [
    { path: '/', name: 'home', at: ['top', 'contact', 'end'] },
    { path: '/does-not-exist', name: 'Not-found', at: ['top', 'end'] },
  ];
  for (const { path, name, at } of places) {
    for (const width of [390, 834, 1440]) {
      for (const place of at) {
        test(`${name} at ${width}, ${place}`, async ({ page }) => {
          await open(page, path, width);
          await goTo(page, place);
          const c = await onScreen(page);
          expect(c.screen).toBeLessThanOrEqual(2);
          expect(c.content).toBeLessThanOrEqual(1);
          await expect(page.locator('[data-shell-bar] .fj-btn--primary')).toHaveCount(0);
        });
      }
    }
  }
});

test.describe('the closing band of the home page (AC-34, AC-40)', () => {
  test('holds no primary button and no "Get in touch"; offers the two downloads', async ({
    page,
  }) => {
    await open(page, '/', 1440);
    const band = page.locator('.fj-band');
    await expect(band.locator('.fj-btn--primary')).toHaveCount(0);
    await expect(band.getByRole('link', { name: /get in touch/i })).toHaveCount(0);
    await expect(band.getByRole('link', { name: 'Save contact (.vcf)' })).toBeVisible();
    await expect(band.getByRole('link', { name: 'Download CV' })).toBeVisible();
    await expect(band.locator('.fj-btn--secondary')).toHaveCount(2);
  });

  test('other pages keep "Get in touch" in the band', async ({ page }) => {
    await open(page, '/does-not-exist', 1440);
    const band = page.locator('.fj-band');
    if ((await band.count()) > 0) {
      await expect(band.getByRole('link', { name: /get in touch/i })).toHaveCount(1);
    }
  });
});

// The CV pages (cv spec AC-06, spec section 6 "Primary buttons"): at 390, 834 and 1440, at the
// top, in the middle and at the end, the visible screen holds at most two primary buttons, the
// page content at most one and the Sticky action bar none. "Download PDF" in the CV head is the
// page content's only primary button; the header's "Get in touch" is the other.
test.describe('the CV pages on the visible screen at each place (AC-06)', () => {
  test.use({ reducedMotion: 'reduce' });
  const places: Place[] = ['top', 'contact', 'end'];

  for (const path of ['/cv/en', '/cv/no']) {
    for (const width of [390, 834, 1440]) {
      for (const place of places) {
        test(`${path} at ${width}, ${place === 'contact' ? 'middle' : place}`, async ({ page }) => {
          await open(page, path, width);
          await page.evaluate((where) => {
            if (where === 'top') window.scrollTo(0, 0);
            else if (where === 'end') window.scrollTo(0, document.documentElement.scrollHeight);
            else window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2);
          }, place);
          const c = await onScreen(page);
          expect(c.screen).toBeLessThanOrEqual(2);
          expect(c.content).toBeLessThanOrEqual(1);
          await expect(page.locator('[data-shell-bar] .fj-btn--primary')).toHaveCount(0);
        });
      }
    }

    test(`${path}: "Download PDF" in the CV head is the page content's only primary button`, async ({
      page,
    }) => {
      await open(page, path, 1440);
      const primaries = page.locator('main .fj-btn--primary');
      await expect(primaries).toHaveCount(1);
      await expect(page.locator('.cv-head .fj-btn--primary')).toHaveAttribute('download', /\.pdf$/);
      await expect(page.locator('.cv-aside .fj-btn--primary')).toHaveCount(0);
    });

    // B-35: the test that the band keeps "Get in touch" runs against a CV page.
    test(`${path}: the band keeps "Get in touch" as the Shell's primary action (B-35)`, async ({
      page,
    }) => {
      await open(page, path, 1440);
      const band = page.locator('.fj-band');
      await expect(band.getByRole('link', { name: 'Get in touch', exact: true })).toHaveCount(1);
      await expect(band.locator('.fj-btn--primary')).toHaveCount(1);
      await expect(band.getByRole('link', { name: 'Download CV' })).toBeVisible();
    });
  }
});
