import { expect, test, type Page } from '@playwright/test';

// AC-32: page content cross-fades while the header stays still; with reduced motion the new page
// simply opens. AC-28: reduced motion means no transition at all. Chromium only: cross-document
// view transitions are a progressive enhancement and `pagereveal` is its observable hook.

// Chromium runs no cross-document transition when the page being left was served with a 404, so
// the journey starts on /styleguide (a 200 HTML page) and follows the real header's wordmark link
// home. Scoped to header[data-header]: the Styleguide also contains sample headers.
const FROM = '/styleguide';
const LINK = 'header[data-header] a[href="/"]';
const TO = (url: URL) => url.pathname === '/';

// Chromium only runs the transition when the page being left has already been revealed, so wait
// for load before clicking; an early click leaves with no transition and would flake the tests.
async function followHome(page: Page) {
  await page.waitForLoadState('load');
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  await page.locator(LINK).click();
}

// Chromium drops the transition when the new page paints before the old page's snapshot has
// reached it, which a fast local server hits on some runs (a Chromium race, not a site defect).
// The journey is repeated until a transition is carried; without the CSS opt-in it never is, so
// the assertion stays as strict as a single try, and every attempt is a full fresh navigation.
async function journeyWithTransition(page: Page, animated?: () => Promise<boolean>) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await page.goto(FROM);
    await followHome(page);
    await page.waitForURL(TO);
    if (!(await reveals(page)).at(-1)?.hasTransition) continue;
    if (!animated || (await animated())) return;
  }
}

interface Reveal {
  hasTransition: boolean;
  path: string;
}

async function recordReveal(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __reveals: unknown[] };
    w.__reveals = [];
    window.addEventListener('pagereveal', (e) => {
      const event = e as Event & { viewTransition?: unknown };
      w.__reveals.push({ hasTransition: !!event.viewTransition, path: location.pathname });
    });
  });
}

// The reveal fires at the new page's first render, after the URL has already changed.
async function reveals(page: Page) {
  await page.waitForFunction(() =>
    (window as unknown as { __reveals?: Reveal[] }).__reveals?.some((r) => r.path === '/'),
  );
  return page.evaluate(() => (window as unknown as { __reveals: Reveal[] }).__reveals);
}

test.describe('page transitions', () => {
  // Mobile emulation resizes the viewport during navigation, which aborts the transition
  // ("Viewport size changed"), and the behaviour under test does not depend on the device: run
  // once, on the desktop project. One test at a time: the transition race is sensitive to CPU
  // contention, and parallel workers make it lose far more often.
  test.describe.configure({ mode: 'serial' });
  test.use({ isMobile: false, hasTouch: false });
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name !== 'desktop',
      'cross-document transitions: Chromium, desktop project',
    );
  });

  test.describe('motion allowed', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('following the header wordmark from /styleguide carries a view transition (AC-32)', async ({
      page,
    }) => {
      await recordReveal(page);
      await journeyWithTransition(page);
      const list = await reveals(page);
      expect(list.at(-1)).toEqual({ hasTransition: true, path: '/' });
    });

    test('the header has its own view-transition-name, unique on the page (AC-32)', async ({
      page,
    }) => {
      await page.goto(FROM);
      const names = await page.evaluate(() =>
        [...document.querySelectorAll('*')]
          .map((el) => getComputedStyle(el).viewTransitionName)
          .filter((n) => n && n !== 'none'),
      );
      const headerName = await page
        .locator('header[data-header]')
        .evaluate((el) => getComputedStyle(el).viewTransitionName);
      expect(headerName).not.toBe('none');
      expect(names.filter((n) => n === headerName)).toHaveLength(1);
    });

    test('the header group does not animate while the root cross-fades (AC-32)', async ({
      page,
    }) => {
      await page.goto(FROM);
      const headerName = await page
        .locator('header[data-header]')
        .evaluate((el) => getComputedStyle(el).viewTransitionName);
      expect(headerName).not.toBe('none');
      await page.addInitScript(() => {
        const w = window as unknown as { __groups: string[] };
        w.__groups = [];
        window.addEventListener('pagereveal', async (e) => {
          const vt = (e as Event & { viewTransition?: { ready: Promise<void> } }).viewTransition;
          if (!vt) return;
          await vt.ready.catch(() => undefined);
          w.__groups = document
            .getAnimations()
            .map((a) => String((a.effect as KeyframeEffect | null)?.pseudoElement ?? ''))
            .filter(Boolean);
        });
      });
      await recordReveal(page);
      const readGroups = () =>
        page.evaluate(() => (window as unknown as { __groups: string[] }).__groups);
      // A transition that was skipped after the reveal has no animations; try again then.
      await journeyWithTransition(page, async () => {
        await page.waitForTimeout(150);
        return (await readGroups()).length > 0;
      });
      const groups = await readGroups();
      expect(groups.some((g) => g.includes('(root)'))).toBe(true);
      expect(groups.some((g) => g.includes(`(${headerName})`) && g.includes('group'))).toBe(false);
    });
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('no view transition and the new page opens (AC-32, AC-28)', async ({ page }) => {
      await recordReveal(page);
      // Chromium carries a transition on only some runs (see journeyWithTransition), so a single
      // journey would pass even with the reduced-motion rule removed. Repeat it: every arrival
      // must have no transition, and the new page must open each time.
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await page.goto(FROM);
        await followHome(page);
        await page.waitForURL(TO);
        expect((await reveals(page)).at(-1)).toEqual({ hasTransition: false, path: '/' });
      }
      expect(new URL(page.url()).pathname).toBe('/');
    });
  });
});
