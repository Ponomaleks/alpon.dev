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
      await expect(bar.getByRole('link', { name: 'Save contact (.vcf)' })).toBeVisible();
      await expect(bar.getByRole('link', { name: 'Get in touch' })).toHaveCount(0);
      const box = await barBox(page);
      expect(Math.round(box.y + box.height)).toBe(844);
    });

    test('the last footer line ends above the bar at the end of the page (AC-07)', async ({
      page,
    }) => {
      await open(page, path);
      await scrollTo(page, 100000);
      const bar = await barBox(page);
      // The reserve for the bar is the footer's own bottom padding (as in the page design), so the
      // footer box runs under the bar; its last line, the base line, must end above it.
      const last = await box(page.locator('footer .fj-footer__base'));
      expect(last.y + last.height).toBeLessThanOrEqual(bar.y);
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

test.describe('the bar actions are secondary, with a contact card download (AC-34, AC-38)', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const { name, path } of pages) {
    test(`${name}: "View CV" and "Save contact (.vcf)", both secondary`, async ({ page }) => {
      await open(page, path);
      const bar = page.locator(BAR);
      await expect(bar.getByRole('link')).toHaveCount(2);
      const cv = bar.getByRole('link', { name: 'View CV' });
      const save = bar.getByRole('link', { name: 'Save contact (.vcf)' });
      await expect(cv).toHaveAttribute('href', '/cv');
      await expect(save).toHaveAttribute('href', '/alexander-ponomarenko.vcf');
      await expect(save).toHaveAttribute('download', /.*/);
      for (const action of [cv, save]) {
        await expect(action).toHaveClass(/\bfj-btn--secondary\b/);
        await expect(action).not.toHaveClass(/\bfj-btn--primary\b/);
      }
    });

    test(`${name}: "Save contact (.vcf)" downloads the contact card`, async ({ page }) => {
      await open(page, path);
      const downloading = page.waitForEvent('download');
      await page.locator(BAR).getByRole('link', { name: 'Save contact (.vcf)' }).click();
      const download = await downloading;
      expect(download.suggestedFilename()).toMatch(/\.vcf$/);
    });
  }
});

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

// Collapsible bar (home T6, AC-39, D-11): a native <details open> whose <summary> is the tab.
// Checked on the Not-found page at 390, with scripts on and off.

const TAB = `${BAR} > summary`;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Vertical overlap in px between two boxes that share a horizontal span (0 when they only touch). */
function overlap(a: Rect, b: Rect): number {
  const horizontal = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  if (horizontal <= 0) return 0;
  return Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
}

async function openNotFound(page: Page) {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto('/does-not-exist');
}

async function toEnd(page: Page) {
  await page.mouse.move(100, 100);
  await page.mouse.wheel(0, 100000);
  await page.waitForTimeout(300);
}

async function expectExpanded(page: Page, expanded: boolean) {
  const bar = page.locator(BAR);
  if (expanded) await expect(bar).toHaveAttribute('open', '');
  else await expect(bar).not.toHaveAttribute('open', /.*/);
  await expect(bar.getByRole('link', { name: 'View CV' })).toBeVisible({ visible: expanded });
  await expect(bar.getByRole('link', { name: 'Save contact (.vcf)' })).toBeVisible({
    visible: expanded,
  });
  await expect(page.locator(TAB)).toBeVisible();
}

for (const scripts of [true, false]) {
  test.describe(`Not-found: the bar tab, scripts ${scripts ? 'on' : 'off'} (AC-39)`, () => {
    test.use({ javaScriptEnabled: scripts, reducedMotion: 'reduce' });

    test('the bar is a <details open> and the tab is a named 44 x 44 target', async ({ page }) => {
      await openNotFound(page);
      const bar = page.locator(BAR);
      expect(await bar.evaluate((el) => el.tagName)).toBe('DETAILS');
      await expectExpanded(page, true);
      const tab = page.locator(TAB);
      await expect(tab).toHaveAccessibleName('Quick actions');
      const size = await box(tab);
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
      // On the end side of the bar, within the viewport.
      expect(size.x + size.width).toBeLessThanOrEqual(390);
      expect(size.x).toBeGreaterThan(195);
    });

    test('a pointer collapses the bar to the tab and brings it back', async ({ page }) => {
      await openNotFound(page);
      await page.locator(TAB).click();
      await expectExpanded(page, false);
      const tab = await box(page.locator(TAB));
      expect(tab.width).toBeGreaterThanOrEqual(44);
      expect(tab.height).toBeGreaterThanOrEqual(44);
      // Only the tab stays, in the bottom end corner.
      expect(Math.round(tab.y + tab.height)).toBe(600);
      expect(tab.x + tab.width).toBeGreaterThan(390 - 44);
      await page.locator(TAB).click();
      await expectExpanded(page, true);
    });

    test('the keyboard collapses and restores the bar (Enter and Space)', async ({ page }) => {
      await openNotFound(page);
      const tab = page.locator(TAB);
      await tab.focus();
      await expect(tab).toBeFocused();
      await page.keyboard.press('Enter');
      await expectExpanded(page, false);
      await expect(tab).toBeFocused();
      await page.keyboard.press('Space');
      await expectExpanded(page, true);
      await page.keyboard.press('Space');
      await expectExpanded(page, false);
      await page.keyboard.press('Enter');
      await expectExpanded(page, true);
    });

    for (const collapsed of [true, false]) {
      const state = collapsed ? 'collapsed' : 'open';

      test(`at the end of the page the tab overlaps 0 px of the last line, bar ${state}`, async ({
        page,
      }) => {
        await openNotFound(page);
        if (collapsed) await page.locator(TAB).click();
        await toEnd(page);
        const last = await box(page.locator('footer .fj-footer__base'));
        const tab = await box(page.locator(TAB));
        expect(overlap(last, tab)).toBe(0);
        if (!collapsed) expect(overlap(last, await box(page.locator(BAR)))).toBe(0);
      });

      test(`with focus on the last footer link the tab overlaps 0 px of it, bar ${state}`, async ({
        page,
      }) => {
        await openNotFound(page);
        if (collapsed) await page.locator(TAB).click();
        const link = page.locator('footer a[href]').last();
        await link.focus();
        await expect(link).toBeFocused();
        await page.waitForTimeout(300);
        const focused = await box(link);
        expect(overlap(focused, await box(page.locator(TAB)))).toBe(0);
        if (!collapsed) expect(overlap(focused, await box(page.locator(BAR)))).toBe(0);
      });
    }
  });
}

test.describe('Not-found: a collapsed bar stays collapsed while scrolling (AC-39)', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('scrolling down and up does not bring it back; restored, it scrolls as before', async ({
    page,
  }) => {
    await open(page, '/does-not-exist');
    const bar = page.locator(BAR);
    await page.locator(TAB).click();
    await expectExpanded(page, false);
    for (const y of [800, 1400, 600, 0, 900, 500]) {
      await scrollTo(page, y);
      await expect(bar).not.toHaveAttribute('open', /.*/);
      await expect(bar).not.toHaveAttribute('inert', /.*/);
      await expect(page.locator(TAB)).toBeInViewport();
    }
    await page.locator(TAB).click();
    await expectExpanded(page, true);
    await scrollTo(page, 0);
    await scrollTo(page, 900);
    await expect(bar).toHaveAttribute('inert', '');
    await scrollTo(page, 600);
    await expect(bar).not.toHaveAttribute('inert', /.*/);
    await expect(bar).toBeInViewport();
  });
});
