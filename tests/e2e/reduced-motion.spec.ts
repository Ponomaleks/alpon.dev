import { expect, test, type Locator, type Page } from '@playwright/test';

// Reduced motion on the Shell parts (base-components T20): AC-28, AC-30. Nothing slides, grows or
// loops: no transform change and no running animation on a transform-like property.
test.use({ reducedMotion: 'reduce' });

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error('element has no box');
  return found;
}

const MOTION =
  /^(transform|translate|scale|rotate|margin.*|top|bottom|left|right|inset.*|height|width)$/;

async function open(page: Page, path = '/') {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.style.minHeight = '2400px';
  });
}

/** Computed transform, translate, scale and top margin of the element on each of N frames. */
async function frames(page: Page, selector: string, count = 20) {
  return page.evaluate(
    ({ selector, count }) =>
      new Promise<string[]>((resolve) => {
        const out: string[] = [];
        const tick = () => {
          const el = document.querySelector(selector);
          if (el) {
            const s = getComputedStyle(el);
            out.push(`${s.transform}|${s.translate}|${s.scale}|${s.marginTop}`);
          } else out.push('missing');
          if (out.length < count) requestAnimationFrame(tick);
          else resolve(out);
        };
        tick();
      }),
    { selector, count },
  );
}

async function movingAnimations(page: Page) {
  return page.evaluate((source) => {
    const motion = new RegExp(source);
    return document.getAnimations().flatMap((a) => {
      const props = new Set<string>();
      (a.effect as KeyframeEffect | null)
        ?.getKeyframes()
        .forEach((k) => Object.keys(k).forEach((p) => props.add(p)));
      if (a instanceof CSSTransition) props.add(a.transitionProperty);
      return [...props].filter((p) => motion.test(p));
    });
  }, MOTION.source);
}

/** After the first frame the value never changes: the change is instant, not a slide. */
const settled = (list: string[]) => new Set(list.slice(1)).size <= 1;

test('the menu opens without a transform change (AC-28)', async ({ page }) => {
  await open(page);
  await page.locator('header').getByRole('button', { name: 'Open menu' }).click();
  const list = await frames(page, 'dialog#mobile-menu', 24);
  expect(new Set(list).size, `menu frames ${[...new Set(list)].join(' ; ')}`).toBe(1);
  expect(list[0].startsWith('none|none')).toBe(true);
  expect(await movingAnimations(page)).toEqual([]);
});

test('the skip link appears without sliding (AC-28)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  const list = await frames(page, 'a.skip-link', 24);
  expect(settled(list), `skip link frames ${[...new Set(list)].join(' ; ')}`).toBe(true);
  expect(await movingAnimations(page)).toEqual([]);
});

test('the bar does not move while scrolling (AC-09, AC-28)', async ({ page }) => {
  await open(page);
  await page.evaluate(() => window.scrollTo(0, 900));
  const list = await frames(page, '[data-shell-bar]', 24);
  expect(new Set(list).size).toBe(1);
  expect(await movingAnimations(page)).toEqual([]);
});

test('a Toast fades without sliding, sits above the bar, is polite and goes away (AC-28, AC-30)', async ({
  page,
}) => {
  await open(page);
  await expect(page.locator('[data-toast-region]')).toHaveAttribute('role', 'status');
  await page.evaluate(() =>
    document.dispatchEvent(
      new CustomEvent('fjord:toast', {
        detail: { message: 'Kopiert', meta: 'ponomaleks@gmail.com' },
      }),
    ),
  );
  const toast = page.locator('[role="status"] .toast');
  await expect(toast).toBeVisible();
  const list = await frames(page, '[role="status"] .toast', 24);
  expect(settled(list), `toast frames ${[...new Set(list)].join(' ; ')}`).toBe(true);
  expect(await movingAnimations(page)).toEqual([]);

  const t = await box(toast);
  const bar = await box(page.locator('[data-shell-bar]'));
  expect(t.y + t.height).toBeLessThanOrEqual(bar.y);

  await expect(page.locator('[role="status"] .toast')).toHaveCount(0, { timeout: 8000 });
});
