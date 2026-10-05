import { expect, test, type Page } from '@playwright/test';

// The theme switch end to end (base-components T19): AC-10, AC-11, AC-12, AC-29.
// Reduced motion is emulated by default; the cross-fade test turns it off.
test.use({ reducedMotion: 'reduce' });

type Theme = 'dag' | 'natt';
const LABEL = { dag: 'Light', natt: 'Dark' } as const;
const BG = { dag: 'rgb(243, 244, 240)', natt: 'rgb(17, 26, 23)' } as const;
const deviceTheme = (scheme: 'light' | 'dark'): Theme => (scheme === 'dark' ? 'natt' : 'dag');

function watch(page: Page) {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !/status of 404/.test(message.text()))
      problems.push(`console: ${message.text()}`);
  });
  return problems;
}

/** Runs before page scripts: on every selection that is visible and wrong, counts one. */
function recordSelections() {
  const w = window as unknown as {
    __wrong: number;
    __first?: { theme?: string; bg: string };
    __stored: string[];
  };
  w.__wrong = 0;
  w.__stored = [];
  const check = () => {
    const theme = document.documentElement.dataset.theme;
    for (const b of document.querySelectorAll<HTMLElement>('[data-theme-button]')) {
      if (b.closest('[data-sample]') || b.getAttribute('aria-pressed') !== 'true') continue;
      if (b.dataset.themeValue !== theme) w.__wrong++;
    }
  };
  new MutationObserver(check).observe(document, {
    attributes: true,
    subtree: true,
    attributeFilter: ['data-theme', 'aria-pressed'],
  });
  requestAnimationFrame(() => {
    w.__first = {
      theme: document.documentElement.dataset.theme,
      bg: getComputedStyle(document.documentElement).backgroundColor,
    };
    check();
  });
}

const selected = (page: Page, scope: string) =>
  page.evaluate((s) => {
    return [...document.querySelectorAll<HTMLElement>(`${s} [data-theme-button]`)]
      .filter((b) => getComputedStyle(b).backgroundColor !== 'rgba(0, 0, 0, 0)')
      .map((b) => b.dataset.themeValue);
  }, scope);

const pressed = (page: Page, scope: string) =>
  page.evaluate((s) => {
    return [...document.querySelectorAll<HTMLElement>(`${s} [data-theme-button]`)]
      .filter((b) => b.getAttribute('aria-pressed') === 'true')
      .map((b) => b.dataset.themeValue);
  }, scope);

for (const device of ['light', 'dark'] as const) {
  test.describe(`device ${device}`, () => {
    test.use({ colorScheme: device });

    for (const stored of ['dag', 'natt', null] as const) {
      const expected: Theme = stored ?? deviceTheme(device);
      test(`stored ${stored ?? 'none'}: page is ${expected}, both switches show it, no wrong selection (AC-12)`, async ({
        page,
        context,
      }) => {
        const problems = watch(page);
        if (stored)
          await context.addInitScript((t) => localStorage.setItem('fjord-theme', t), stored);
        await page.addInitScript(recordSelections);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await page.waitForFunction(() => '__first' in window);
        const result = await page.evaluate(() => {
          const w = window as unknown as {
            __wrong: number;
            __first: { theme: string; bg: string };
          };
          return { wrong: w.__wrong, first: w.__first };
        });
        expect(result.first).toEqual({ theme: expected, bg: BG[expected] });
        expect(result.wrong).toBe(0);
        // The selection a Visitor sees (raised segment) is the page's theme, in both switches.
        for (const scope of ['header', '#mobile-menu']) {
          expect(await selected(page, scope), scope).toEqual([expected]);
        }
        expect(problems).toEqual([]);
      });
    }
  });
}

test.describe('pressed state from load', () => {
  test.use({ colorScheme: 'dark' });

  test('both switches expose the selected segment as pressed before any click (AC-12)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    expect(await pressed(page, 'header')).toEqual(['natt']);
    expect(await pressed(page, '#mobile-menu')).toEqual(['natt']);
  });
});

test.describe('choosing a theme', () => {
  test.use({ colorScheme: 'light' });

  test('Dark in the header: Natt at once, kept, next page is Natt from its first frame; Light reverses (AC-10)', async ({
    page,
  }) => {
    const problems = watch(page);
    await page.addInitScript(recordSelections);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const header = page.locator('header');
    await header.getByRole('button', { name: LABEL.natt }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    await expect(header.getByRole('button', { name: 'Dark' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await page.evaluate(() => localStorage.getItem('fjord-theme'))).toBe('natt');

    await page.goto('/does-not-exist');
    await page.waitForFunction(() => '__first' in window);
    const next = await page.evaluate(() => {
      const w = window as unknown as { __wrong: number; __first: { theme: string; bg: string } };
      return { first: w.__first, wrong: w.__wrong };
    });
    expect(next.first).toEqual({ theme: 'natt', bg: BG.natt });
    expect(next.wrong).toBe(0);

    await page.locator('header').getByRole('button', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dag');
    expect(await page.evaluate(() => localStorage.getItem('fjord-theme'))).toBe('dag');
    expect(problems).toEqual([]);
  });

  test('the header switch and the menu switch always agree; storage holds only dag or natt (AC-10)', async ({
    page,
  }) => {
    const problems = watch(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const dialog = page.locator('dialog#mobile-menu');
    for (const theme of ['natt', 'dag', 'natt'] as const) {
      await dialog.getByRole('button', { name: LABEL[theme] }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect(await pressed(page, 'header')).toEqual([theme]);
      expect(await pressed(page, '#mobile-menu')).toEqual([theme]);
      expect(await page.evaluate(() => localStorage.getItem('fjord-theme'))).toBe(theme);
    }
    expect(problems).toEqual([]);
  });

  test('blocked storage: the theme still changes for this visit, no error (AC-11)', async ({
    page,
  }) => {
    const problems = watch(page);
    await page.addInitScript(() =>
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('The operation is insecure.', 'SecurityError');
        },
      }),
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.locator('header').getByRole('button', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    await expect(page.locator('header').getByRole('button', { name: 'Dark' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(problems).toEqual([]);
  });
});

test.describe('scripts off', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`no switch is offered and the page follows the device (${scheme}) (AC-11)`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        colorScheme: scheme,
        viewport: { width: 1440, height: 900 },
      });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page.locator('header').getByRole('group', { name: 'Theme' })).toBeHidden();
      await expect(page.locator('header .header__theme')).toBeHidden();
      const bg = await page.evaluate(
        () => getComputedStyle(document.documentElement).backgroundColor,
      );
      expect(bg).toBe(BG[deviceTheme(scheme)]);
      await context.close();
    });
  }
});

test.describe('cross-fade with motion allowed (AC-29)', () => {
  test.use({ reducedMotion: 'no-preference', colorScheme: 'light' });

  const spy = () => {
    const w = window as unknown as { __vt: number };
    w.__vt = 0;
    const original = document.startViewTransition?.bind(document);
    if (!original) return;
    document.startViewTransition = ((cb: () => void) => {
      w.__vt++;
      return original(cb);
    }) as typeof document.startViewTransition;
  };
  const count = (page: Page) => page.evaluate(() => (window as unknown as { __vt: number }).__vt);

  test('the header switch uses a view transition and the theme changes', async ({ page }) => {
    const problems = watch(page);
    await page.addInitScript(spy);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => typeof document.startViewTransition)).toBe('function');
    await page.locator('header').getByRole('button', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    expect(await count(page)).toBe(1);
    expect(problems).toEqual([]);
  });

  test('the switch inside the panel changes at once without a view transition (G-6)', async ({
    page,
  }) => {
    const problems = watch(page);
    await page.addInitScript(spy);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('dialog#mobile-menu').getByRole('button', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    expect(await count(page)).toBe(0);
    expect(problems).toEqual([]);
  });

  test('with reduced motion the header switch uses no view transition', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.addInitScript(spy);
    await page.goto('/');
    await page.locator('header').getByRole('button', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    expect(await count(page)).toBe(0);
    await context.close();
  });
});

// R8 / S2-04: after choosing Dark on another page, Back to a page restored from the
// back/forward cache must show the stored theme. Pages are parameters so the Shell's other
// pages are covered without editing this test.
test.describe('back/forward cache restore (R8)', () => {
  test.use({ colorScheme: 'light' });

  const PAIRS: ReadonlyArray<readonly [string, string]> = [['/', '/styleguide']];

  for (const [from, to] of PAIRS) {
    test(`Dark on ${to}, Back to ${from}: ${from} is Natt and both switches agree`, async ({
      page,
    }, testInfo) => {
      const problems = watch(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(from);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dag');
      // Mark the document: a surviving marker after Back proves a bfcache restore, not a reload.
      await page.evaluate(() => {
        (window as unknown as { __restored: boolean }).__restored = true;
        window.addEventListener('pageshow', (e) => {
          (window as unknown as { __persisted: boolean }).__persisted = e.persisted;
        });
      });

      await page.goto(to);
      await page.getByRole('banner').getByRole('button', { name: 'Dark' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
      expect(await page.evaluate(() => localStorage.getItem('fjord-theme'))).toBe('natt');

      await page.goBack();
      await page.waitForURL((url) => url.pathname.replace(/\/$/, '') === from.replace(/\/$/, ''));
      const restored = await page.evaluate(
        () => (window as unknown as { __restored?: boolean }).__restored === true,
      );
      testInfo.annotations.push({
        type: 'bfcache',
        description: restored
          ? 'restored from bfcache (document survived)'
          : 'NOT restored from bfcache (page reloaded); synthetic pageshow used',
      });

      if (restored) {
        // Real bfcache restore: the page is stale until the pageshow handler runs.
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
      } else {
        // Chromium under Playwright did not restore from bfcache: the reload already shows
        // Natt, so exercise the handler path with a synthetic persisted pageshow instead.
        await page.evaluate(() => {
          document.documentElement.dataset.theme = 'dag';
          for (const b of document.querySelectorAll<HTMLElement>('[data-theme-button]'))
            b.setAttribute('aria-pressed', String(b.dataset.themeValue === 'dag'));
          localStorage.setItem('fjord-theme', 'natt');
          window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
        });
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
      }
      expect(await pressed(page, 'header')).toEqual(['natt']);
      expect(await pressed(page, '#mobile-menu')).toEqual(['natt']);
      expect(problems).toEqual([]);
    });
  }

  test('a synthetic non-persisted pageshow leaves the page as it is', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fjord-theme', 'natt');
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }));
    });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dag');
  });
});
