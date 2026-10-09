import { expect, test, type Page } from '@playwright/test';

// The CV language switch (AC-08, AC-19, AC-23; ADR-0001; screens SCR-05 / SCR-06 `language
// switch ...`): the other page opens at the section in view, its heading clear of the header with
// keyboard focus at the section, one Back returns. From the CV head at 1440 and from the Sticky
// action bar at 390. Above the first section, or for a section the other page lacks, the other
// page opens at its top; the link of the current language does not navigate; scripts off opens
// the other page at its top; an unknown fragment focuses nothing.

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
const places: Where[] = [
  { name: 'CV head at 1440', width: 1440, scope: '.cv-head' },
  { name: 'action bar at 390', width: 390, scope: '[data-shell-bar]' },
];

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
      for (const id of IDS) {
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
