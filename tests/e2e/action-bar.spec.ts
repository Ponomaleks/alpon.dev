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
      // The reserve for the bar is the body::after block of base.css (home T6); the last line of
      // the footer, the base line, must end above the bar.
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
      // The tab is part of the panel and leaves with it.
      await expect(page.locator(`${BAR} > summary`)).not.toBeInViewport();
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
// Checked on the Not-found page at 390, with scripts on and off. The tab is part of the panel
// (Owner design review): one outline, and collapsed a strip of the panel stays under the tab.

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

/** The part of the panel that stays on screen under the tab when collapsed: --fjord-space-3. */
const STRIP = 12;

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
      // The tab stays at the end side, with a strip of the panel under it down to the edge.
      expect(Math.round(tab.y + tab.height)).toBe(600 - STRIP);
      expect(tab.x + tab.width).toBeGreaterThan(390 - 44);
      const panel = await box(page.locator(BAR));
      expect(panel.y).toBeLessThanOrEqual(tab.y + tab.height);
      expect(panel.y + panel.height).toBeGreaterThanOrEqual(600);
      expect(panel.x).toBe(0);
      expect(panel.width).toBe(390);
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

    for (const collapsed of [false, true]) {
      test(`the tab and the panel are one shape, bar ${collapsed ? 'collapsed' : 'open'}`, async ({
        page,
      }) => {
        await openNotFound(page);
        if (collapsed) await page.locator(TAB).click();
        await expectExpanded(page, !collapsed);
        const look = await page.evaluate(
          ([barSel, tabSel]) => {
            const bar = document.querySelector(barSel ?? '');
            const tab = document.querySelector(tabSel ?? '');
            if (!bar || !tab) throw new Error('no bar');
            const b = getComputedStyle(bar);
            const t = getComputedStyle(tab);
            return {
              sameSurface: t.backgroundColor === b.backgroundColor,
              sameLine:
                t.borderTopColor === b.borderTopColor &&
                t.borderLeftColor === b.borderTopColor &&
                t.borderRightColor === b.borderTopColor &&
                t.borderTopWidth === b.borderTopWidth,
              // No line between the tab and the panel: the tab's bottom edge is not drawn.
              openBottom:
                parseFloat(t.borderBottomWidth) === 0 || t.borderBottomColor === 'rgba(0, 0, 0, 0)',
              tabShadow: t.boxShadow,
              barShadow: b.boxShadow,
              barLine: parseFloat(b.borderTopWidth),
              radii: [
                t.borderTopLeftRadius,
                t.borderTopRightRadius,
                t.borderBottomRightRadius,
                t.borderBottomLeftRadius,
              ].map((r) => parseFloat(r)),
              // The tab's bottom edge against the panel's top line: it covers the line, no gap.
              seam: tab.getBoundingClientRect().bottom - bar.getBoundingClientRect().top,
            };
          },
          [BAR, TAB],
        );
        expect(look.sameSurface).toBe(true);
        expect(look.sameLine).toBe(true);
        expect(look.openBottom).toBe(true);
        expect(look.seam).toBe(look.barLine);
        expect(look.radii[0]).toBeGreaterThan(0);
        expect(look.radii[1]).toBeGreaterThan(0);
        expect(look.radii.slice(2)).toEqual([0, 0]);
        // One float shadow, the panel's; the tab casts none onto the panel.
        expect(look.tabShadow).toBe('none');
        expect(look.barShadow).not.toBe('none');
      });
    }

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

// Toast above the tab and the instant change with reduced motion (home T6b, AC-39).

const TOAST = '[data-toast-region] .toast';

for (const collapsed of [false, true]) {
  const state = collapsed ? 'collapsed' : 'open';

  test(`Not-found: a Toast sits above the tab with 0 px overlap, bar ${state} (AC-39)`, async ({
    page,
  }) => {
    await openNotFound(page);
    if (collapsed) await page.locator(TAB).click();
    await expectExpanded(page, !collapsed);
    await page.evaluate(() =>
      document.dispatchEvent(
        new CustomEvent('fjord:toast', { detail: { message: 'Kopiert', meta: 'hei@alpon.dev' } }),
      ),
    );
    const toast = page.locator(TOAST);
    await expect(toast).toBeVisible();
    // Let the Toast entrance animation settle before measuring.
    await page.waitForTimeout(400);
    const toastBox = await box(toast);
    const tabBox = await box(page.locator(TAB));
    expect(overlap(toastBox, tabBox)).toBe(0);
    expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(tabBox.y);
    if (!collapsed) {
      expect(toastBox.y + toastBox.height).toBeLessThanOrEqual((await box(page.locator(BAR))).y);
    }
  });
}

test.describe('Not-found: with reduced motion the bar changes instantly (AC-39)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('collapsing and restoring run no transition or animation on the bar or the tab', async ({
    page,
  }) => {
    await openNotFound(page);
    const running = () =>
      page.evaluate(
        ([bar, tab]) => {
          const nodes = [document.querySelector(bar), document.querySelector(tab)];
          const durations = nodes.map((node) => {
            const style = node ? getComputedStyle(node) : null;
            return [style?.transitionDuration, style?.animationDuration].join(' ');
          });
          const live = document
            .getAnimations()
            .filter((a) => {
              const target = (a.effect as KeyframeEffect | null)?.target;
              return !!target && nodes.some((n) => n && (n === target || n.contains(target)));
            })
            .map((a) => a.constructor.name);
          return { durations, live };
        },
        [BAR, TAB],
      );
    const settled = (r: { durations: string[]; live: string[] }) => {
      expect(r.live).toEqual([]);
      for (const d of r.durations)
        expect(d.split(' ').every((v) => parseFloat(v) === 0)).toBe(true);
    };
    settled(await running());
    await page.locator(TAB).click();
    settled(await running());
    await expectExpanded(page, false);
    await page.locator(TAB).click();
    settled(await running());
    await expectExpanded(page, true);
  });

  test('the tab and the bar are at their final place in the frame after the click', async ({
    page,
  }) => {
    await openNotFound(page);
    const before = await box(page.locator(TAB));
    await page.locator(TAB).click();
    // Read in the next frame, with no waiting: an instant change is already done.
    const after = await page.evaluate(
      (selector) =>
        new Promise<{ y: number; height: number; bottom: number }>((resolve) =>
          requestAnimationFrame(() => {
            const r = document.querySelector(selector)?.getBoundingClientRect();
            resolve({ y: r?.y ?? 0, height: r?.height ?? 0, bottom: r?.bottom ?? 0 });
          }),
        ),
      TAB,
    );
    expect(Math.round(after.bottom)).toBe(600 - STRIP);
    expect(Math.round(after.height)).toBe(Math.round(before.height));
  });
});

test.describe('Not-found: with motion allowed the panel slides and the tab travels with it', () => {
  test.use({ reducedMotion: 'no-preference' });

  /** The running transitions of the bar itself and the tab's place while they run. */
  const sliding = (page: Page) =>
    page.evaluate(
      ([barSel, tabSel]) => {
        const bar = document.querySelector(barSel ?? '');
        const tab = document.querySelector(tabSel ?? '');
        if (!bar || !tab) throw new Error('no bar');
        const run = bar
          .getAnimations()
          .filter((a): a is CSSTransition => a instanceof CSSTransition);
        return {
          properties: run.map((a) => a.transitionProperty),
          durations: run.map((a) => a.effect?.getComputedTiming().duration),
          tabBottom: tab.getBoundingClientRect().bottom,
        };
      },
      [BAR, TAB],
    );
  const settle = (page: Page) =>
    page.evaluate(
      (barSel) =>
        Promise.all(
          (document.querySelector(barSel)?.getAnimations({ subtree: true }) ?? []).map((a) =>
            a.finished.catch(() => null),
          ),
        ).then(() => null),
      BAR,
    );
  const token = (page: Page, name: string) =>
    page.evaluate((n) => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      return raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
    }, name);
  const contentVisibility = (page: Page) =>
    page.evaluate((barSel) => {
      const bar = document.querySelector(barSel);
      if (!bar) throw new Error('no bar');
      return getComputedStyle(bar, '::details-content').contentVisibility;
    }, BAR);

  test('collapse and restore are one transform transition of the panel, by the panel duration token', async ({
    page,
  }) => {
    await openNotFound(page);
    const duration = await token(page, '--fjord-duration-320');
    const tab = await box(page.locator(TAB));
    const open = tab.y + tab.height;

    await page.locator(TAB).click();
    const down = await sliding(page);
    expect(down.properties).toEqual(['transform']);
    expect(down.durations).toEqual([duration]);
    // Mid-slide the tab is between its two places: it has not jumped to the end.
    expect(down.tabBottom).toBeGreaterThanOrEqual(open - 1);
    expect(down.tabBottom).toBeLessThan(600 - STRIP);
    await settle(page);
    const closed = await box(page.locator(TAB));
    expect(Math.round(closed.y + closed.height)).toBe(600 - STRIP);
    await expectExpanded(page, false);

    await page.locator(TAB).click();
    const up = await sliding(page);
    expect(up.properties).toEqual(['transform']);
    expect(up.durations).toEqual([duration]);
    expect(up.tabBottom).toBeGreaterThan(open);
    await settle(page);
    const back = await box(page.locator(TAB));
    expect(Math.round(back.y + back.height)).toBe(Math.round(open));
    await expectExpanded(page, true);
  });

  test('the actions stay drawn while the panel slides away (where ::details-content is supported)', async ({
    page,
  }) => {
    await openNotFound(page);
    test.skip(
      !(await page.evaluate(() => CSS.supports('selector(::details-content)'))),
      'no ::details-content: the actions leave at once, the panel still slides',
    );
    await page.locator(TAB).click();
    expect(await contentVisibility(page)).toBe('visible');
    await settle(page);
    expect(await contentVisibility(page)).toBe('hidden');
  });

  test('the scripted scroll-away uses the same transition as the tab', async ({ page }) => {
    await open(page, '/does-not-exist');
    const duration = await token(page, '--fjord-duration-320');
    await scrollTo(page, 800);
    await expect(page.locator(BAR)).toHaveAttribute('inert', '');
    const away = await sliding(page);
    expect(away.properties).toEqual(['transform']);
    expect(away.durations).toEqual([duration]);
  });
});

// One bottom reserve (home T6, backlog B-08): the room for the bar is the body::after block alone.
// The footer keeps the bottom padding it has on a wide screen and adds nothing for the bar.
test.describe('one bottom reserve at 390 (AC-39, B-08)', () => {
  test.use({ reducedMotion: 'reduce' });

  /** The end of the page: space under the last footer line, the footer's own padding, the reserve. */
  const endOfPage = (page: Page) =>
    page.evaluate(() => {
      const footer = document.querySelector('footer.fj-footer');
      const last = document.querySelector('footer .fj-footer__base');
      if (!footer || !last) throw new Error('no footer');
      const after = getComputedStyle(document.body, '::after');
      return {
        below:
          document.documentElement.scrollHeight - (last.getBoundingClientRect().bottom + scrollY),
        footerPadding: parseFloat(getComputedStyle(footer).paddingBottom),
        reserve: after.content === 'none' ? 0 : parseFloat(after.height),
      };
    });

  /** The footer's bottom padding on a wide screen, where no page has the bar. */
  async function widePadding(page: Page, path: string) {
    await page.setViewportSize({ width: 834, height: 844 });
    await page.goto(path);
    return (await endOfPage(page)).footerPadding;
  }

  for (const { name, path } of pages) {
    for (const collapsed of [false, true]) {
      const state = collapsed ? 'collapsed' : 'open';

      test(`${name}, bar ${state}: the space under the last footer line is the footer padding plus the clearance of that state, once`, async ({
        page,
      }) => {
        const wide = await widePadding(page, path);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(path);
        if (collapsed) await page.locator(TAB).click();
        await expectExpanded(page, !collapsed);

        // The clearance of the state: from the top of the tab to the bottom edge, plus the gap
        // kept above the tab (--fjord-space-4).
        const tab = await box(page.locator(TAB));
        const gap = await page.evaluate(() =>
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--fjord-space-4'),
          ),
        );
        const clearance = 844 - tab.y + gap;

        const end = await endOfPage(page);
        // The footer has no padding of its own for the bar: the same as on a wide screen.
        expect(end.footerPadding).toBe(wide);
        // Open: tab 44 + bar 68 + gap 16. Collapsed: tab 44 + strip 12 + gap 16.
        expect(end.reserve).toBe(collapsed ? 72 : 128);
        expect(Math.abs(end.reserve - clearance)).toBeLessThan(1);
        expect(Math.abs(end.below - (end.footerPadding + end.reserve))).toBeLessThan(1);
      });

      test(`${name}, bar ${state}: the tab and the bar cover 0 px of the last footer line and of a focused footer link`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 390, height: 600 });
        await page.goto(path);
        if (collapsed) await page.locator(TAB).click();
        await toEnd(page);
        const last = await box(page.locator('footer .fj-footer__base'));
        expect(overlap(last, await box(page.locator(TAB)))).toBe(0);
        if (!collapsed) expect(overlap(last, await box(page.locator(BAR)))).toBe(0);

        const link = page.locator('footer a[href]').last();
        await link.focus();
        await expect(link).toBeFocused();
        await page.waitForTimeout(300);
        const focused = await box(link);
        expect(overlap(focused, await box(page.locator(TAB)))).toBe(0);
        if (!collapsed) expect(overlap(focused, await box(page.locator(BAR)))).toBe(0);
      });
    }
  }

  test('a page without the bar has no bottom reserve at all (the Styleguide, mobileBar off)', async ({
    page,
  }) => {
    const wide = await widePadding(page, '/styleguide');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/styleguide');
    await expect(page.locator(BAR)).toHaveCount(0);
    const end = await endOfPage(page);
    expect(end.reserve).toBe(0);
    expect(end.footerPadding).toBe(wide);
    expect(Math.abs(end.below - end.footerPadding)).toBeLessThan(1);
    await expect(page.locator('body')).toHaveCSS('padding-bottom', '0px');
  });
});
