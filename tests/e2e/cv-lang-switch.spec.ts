import { expect, test, type Page } from '@playwright/test';

// The CV language switch (AC-08, AC-19, AC-23; ADR-0001; screens SCR-05 / SCR-06 `language
// switch ...`). Switching the language must not move the page.
// - From the Sticky action bar at 390, which is on screen mid-page: the other page opens at the
//   section in view at the moment of the click, its heading clear of the header with keyboard focus
//   at the section, one Back returns. Above the first section at that moment, or for a section the
//   other page lacks, the other page opens at its top.
// - From the CV head, which is on screen only above the first section: the other page opens at the
//   scroll position the Visitor had and never at a section. The position crosses as one number in
//   sessionStorage, removed on arrival.
// - The link of the current language does not navigate; scripts off opens the other page at its
//   top; an unknown fragment focuses nothing.

const IDS = [
  'profile',
  'skills',
  'languages',
  'experience',
  'projects',
  'education',
  'courses',
  'community',
] as const;

type Lang = 'en' | 'no';
const other = (lang: Lang): Lang => (lang === 'en' ? 'no' : 'en');
type Where = { name: string; width: number; scope: string };
const HEAD: Where = { name: 'CV head at 1440', width: 1440, scope: '.cv-head' };
const BAR: Where = { name: 'action bar at 390', width: 390, scope: '[data-shell-bar]' };
const places: Where[] = [HEAD, BAR];

const link = (page: Page, scope: string, lang: Lang) =>
  page.locator(`${scope} [data-lang-switch] a[data-switch-to="${lang}"]`);

async function ids(page: Page): Promise<string[]> {
  return page.evaluate(() => [...document.querySelectorAll('main section[id]')].map((s) => s.id));
}

async function scrollToSection(page: Page, id: string) {
  await page.evaluate((target) => document.getElementById(target)?.scrollIntoView(), id);
  // The script reads the scroll position in an animation frame.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

for (const where of places) {
  test.describe(where.name, () => {
    test.use({ reducedMotion: 'reduce' });

    for (const from of ['en', 'no'] as const) {
      const to = other(from);
      // Only the bar is on screen while a section is in view.
      for (const id of where === BAR ? IDS : []) {
        test(`/cv/${from} to /cv/${to} at ${id}: fragment, heading under the header, focus, Back (AC-08)`, async ({
          page,
        }) => {
          await page.setViewportSize({ width: where.width, height: 900 });
          await page.goto(`/cv/${from}`);
          await page.evaluate(() => document.fonts.ready);
          await scrollToSection(page, id);

          await link(page, where.scope, to).click();
          await page.waitForURL(`**/cv/${to}#${id}`);
          await page.evaluate(() => document.fonts.ready);

          const state = await page.evaluate((target) => {
            const section = document.getElementById(target);
            const header = document.querySelector('[data-header]');
            const margin = section ? parseFloat(getComputedStyle(section).scrollMarginTop) : NaN;
            return {
              top: section?.getBoundingClientRect().top ?? NaN,
              headerBottom: header?.getBoundingClientRect().bottom ?? NaN,
              margin,
              focused: document.activeElement?.id ?? '',
            };
          }, id);
          expect(state.focused).toBe(id);
          // The heading starts exactly at the scroll offset under the header: not hidden by it.
          expect(state.top).toBeGreaterThanOrEqual(state.headerBottom - 1);
          expect(Math.abs(state.top - state.margin)).toBeLessThanOrEqual(1);

          await page.goBack();
          await expect(page).toHaveURL(new RegExp(String.raw`/cv/${from}(#.*)?$`));
          await expect(page).not.toHaveURL(new RegExp(String.raw`/cv/${to}`));
        });
      }

      test(`/cv/${from}: above the first section the other page opens at its top (AC-08)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: where.width, height: 900 });
        await page.goto(`/cv/${from}`);
        await link(page, where.scope, to).click();
        await page.waitForURL(`**/cv/${to}`);
        expect(new URL(page.url()).hash).toBe('');
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
      });

      test(`/cv/${from}: the link of the current language causes no navigation (AC-08)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: where.width, height: 900 });
        await page.goto(`/cv/${from}`);
        await scrollToSection(page, 'skills');
        const before = page.url();
        await page.evaluate(() => {
          (window as unknown as { __kept: boolean }).__kept = true;
        });
        await link(page, where.scope, from).click();
        expect(page.url()).toBe(before);
        expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(
          true,
        );
      });
    }

    test('a section the other page lacks opens the other page at its top (AC-08)', async ({
      page,
    }) => {
      test.skip(where !== BAR, 'the CV head never carries a section');
      await page.setViewportSize({ width: where.width, height: 900 });
      await page.goto('/cv/en');
      const enIds = await ids(page);
      await page.goto('/cv/no');
      const noIds = await ids(page);
      const lacking = enIds.filter((id) => !noIds.includes(id));
      test.skip(lacking.length === 0, 'both CV pages have all eight sections today');
      await page.goto('/cv/en');
      await scrollToSection(page, lacking[0]);
      await link(page, where.scope, 'no').click();
      await page.waitForURL('**/cv/no');
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });
  });
}

// The scroll position from which the first section counts as in view, and the last one at which
// the head's link to `to` is still clear of the header.
async function lines(page: Page, to: Lang) {
  return page.evaluate((lang) => {
    const first = document.querySelector('main section[id]');
    const header = document.querySelector('[data-header]');
    const target = document.querySelector(
      `.cv-head [data-lang-switch] a[data-switch-to="${lang}"]`,
    );
    if (!first || !header || !target) throw new Error('CV head, header or first section missing');
    const offset = parseFloat(getComputedStyle(first).scrollMarginTop) || 0;
    return {
      firstSection: first.getBoundingClientRect().top + scrollY - offset - 1,
      headLink:
        target.getBoundingClientRect().top + scrollY - header.getBoundingClientRect().bottom,
    };
  }, to);
}

const settle = (page: Page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );

const stored = (page: Page) =>
  page.evaluate(() => Object.keys(sessionStorage).map((k) => [k, sessionStorage.getItem(k)]));

test.describe('CV head: the other page opens at the same scroll position (AC-08)', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const width of [1440, 834] as const) {
    for (const from of ['en', 'no'] as const) {
      const to = other(from);

      test(`/cv/${from} to /cv/${to} at ${width}: same position, no fragment, no focus move, Back`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/cv/${from}`);
        await page.evaluate(() => document.fonts.ready);
        const { headLink } = await lines(page, to);
        const y = Math.floor(headLink) - 8;
        expect(y).toBeGreaterThan(0);
        await page.evaluate((top) => scrollTo(0, top), y);

        // The link is on screen, so the click itself does not scroll the page.
        await link(page, '.cv-head', to).click();
        await page.waitForURL(`**/cv/${to}`);
        expect(new URL(page.url()).hash).toBe('');
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
        expect(
          await page.evaluate(() => document.activeElement?.closest('section[id]') ?? null),
        ).toBe(null);
        // One number crossed, and it is gone on arrival: nothing stays stored.
        expect(await stored(page)).toEqual([]);

        await page.goBack();
        await expect(page).toHaveURL(new RegExp(String.raw`/cv/${from}$`));
      });

      test(`/cv/${from} at ${width}: read down into a section, back above the first, switch: no section, same position`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/cv/${from}`);
        await page.evaluate(() => document.fonts.ready);
        await scrollToSection(page, 'education');
        const { headLink } = await lines(page, to);
        const y = Math.floor(headLink) - 8;
        await page.evaluate((top) => scrollTo(0, top), y);
        await settle(page);

        await link(page, '.cv-head', to).click();
        await page.waitForURL(`**/cv/${to}`);
        expect(new URL(page.url()).hash).toBe('');
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
      });
    }
  }

  test('the position is in place from the first paint of the new page: no visible jump', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // On every document: where the page is at each early frame.
    await page.addInitScript(() => {
      const log: { t: number; y: number }[] = [];
      (window as unknown as { __frames: typeof log }).__frames = log;
      const tick = () => {
        log.push({ t: performance.now(), y: scrollY });
        if (log.length < 120) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.goto('/cv/en');
    await page.evaluate(() => document.fonts.ready);
    const { headLink } = await lines(page, 'no');
    const y = Math.floor(headLink) - 8;
    await page.evaluate((top) => scrollTo(0, top), y);
    await link(page, '.cv-head', 'no').click();
    await page.waitForURL('**/cv/no');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
    await page.waitForFunction(
      () => performance.getEntriesByName('first-contentful-paint').length > 0,
    );
    await settle(page);
    const seen = await page.evaluate(() => {
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? NaN;
      const frames = (window as unknown as { __frames: { t: number; y: number }[] }).__frames;
      return { fcp, painted: frames.filter((f) => f.t >= fcp).map((f) => f.y) };
    });
    // Every frame from the first paint on is already at the carried position.
    expect(seen.painted.length).toBeGreaterThan(0);
    expect([...new Set(seen.painted)]).toEqual([y]);
  });

  test('a stale or crafted stored value does no harm and is removed (spec §6.1)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/cv/en');
    await page.evaluate((top) => scrollTo(0, top), 40);
    const key = await page.evaluate(() => {
      const a = document.querySelector<HTMLElement>(
        '.cv-head [data-lang-switch] a[data-switch-to="no"]',
      );
      a?.addEventListener('click', (e) => e.preventDefault());
      a?.click();
      return Object.keys(sessionStorage)[0] ?? '';
    });
    expect(key).not.toBe('');
    for (const value of ['999999', '<img src=x onerror=alert(1)>', '-40']) {
      await page.evaluate(([k, v]) => sessionStorage.setItem(k, v), [key, value] as const);
      await page.goto('/cv/no');
      await settle(page);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      expect(await stored(page)).toEqual([]);
    }
  });
});

test.describe('action bar at 390: above the first section at the click (AC-08)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('read down into a section, back above the first, switch: the other page opens at its top', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/cv/en');
    await page.evaluate(() => document.fonts.ready);
    await scrollToSection(page, 'education');
    const { firstSection } = await lines(page, 'no');
    await page.evaluate((top) => scrollTo(0, top), Math.floor(firstSection) - 40);
    await settle(page);
    await link(page, '[data-shell-bar]', 'no').click();
    await page.waitForURL('**/cv/no');
    expect(new URL(page.url()).hash).toBe('');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await stored(page)).toEqual([]);
  });
});

test.describe('scripts off', () => {
  test.use({ javaScriptEnabled: false });

  test('the other page opens at its top (AC-08, AC-23)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/cv/en');
    await link(page, '.cv-head', 'no').click();
    await page.waitForURL('**/cv/no');
    expect(new URL(page.url()).hash).toBe('');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test('an unknown fragment focuses nothing (AC-08)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/cv/no#nonsense');
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const tag = await page.evaluate(() => document.activeElement?.tagName);
  expect(tag).toBe('BODY');
});
