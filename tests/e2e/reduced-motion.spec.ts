import { devices, expect, test, type Locator, type Page } from '../fixtures';

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
    // A paused animation does not move: the home hero keeps its loops paused under reduced motion.
    return document
      .getAnimations()
      .filter((a) => a.playState !== 'paused')
      .flatMap((a) => {
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

const NUDGED = '.fj-btn__arrow, .fj-link__icon';
const transforms = (page: Page) =>
  page.locator(NUDGED).evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));

test('the arrow and icon nudges stay still, also on hover and in the hover samples (AC-28)', async ({
  page,
}) => {
  await page.goto('/styleguide');
  const all = await transforms(page);
  expect(all.length).toBeGreaterThan(0);
  expect(new Set(all)).toEqual(new Set(['none']));

  await page.goto('/does-not-exist');
  const home = page.locator('main a.fj-btn');
  await home.hover();
  await expect(home.locator('.fj-btn__arrow')).toHaveCSS('transform', 'none');
});

const PRESSED = ':is(.fj-btn, .fj-iconbtn)[data-demo-state="active"]';
const pressedTransforms = (page: Page) =>
  page.locator(PRESSED).evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));

test('a pressed Button or IconButton does not move, in the pressed samples and under a real press (AC-28)', async ({
  page,
}) => {
  await page.goto('/styleguide');
  const samples = await pressedTransforms(page);
  expect(samples.length).toBeGreaterThanOrEqual(3);
  expect(new Set(samples)).toEqual(new Set(['none']));

  await page.goto('/does-not-exist');
  const home = page.locator('main a.fj-btn');
  await home.hover();
  await page.mouse.down();
  await expect(home).toHaveCSS('transform', 'none');
  await page.mouse.up();
});

test.describe('with motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the hover samples do nudge, so the reduced-motion check is not vacuous', async ({
    page,
  }) => {
    await page.goto('/styleguide');
    expect((await transforms(page)).some((value) => value !== 'none')).toBe(true);
  });

  test('the pressed samples move as the design does: the Button sinks and shrinks, the IconButton shrinks', async ({
    page,
  }) => {
    await page.goto('/styleguide');
    const button = page.locator('.fj-btn[data-demo-state="active"]').first();
    await expect(button).toHaveCSS('transform', 'matrix(0.985, 0, 0, 0.985, 0, 1)');
    const icon = page.locator('.fj-iconbtn[data-demo-state="active"]').first();
    await expect(icon).toHaveCSS('transform', 'matrix(0.94, 0, 0, 0.94, 0, 0)');
  });
});

// Home, reduced motion and scripts off (home T24, AC-31, AC-41): no Ambient motion starts, no
// Motion control, final numbers, no reveal, no parallax properties, a still band.
const homeLoops = (page: Page) =>
  page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations === Infinity,
        ).length,
  );

const bandMoving = (page: Page) =>
  page.evaluate(() => {
    const band = document.querySelector('.fj-band');
    return document.getAnimations().filter((a) => {
      const target = (a.effect as KeyframeEffect | null)?.target;
      return !!band && !!target && band.contains(target) && a.playState === 'running';
    }).length;
  });

const parallaxProps = (page: Page) =>
  page
    .locator('[data-contours-parallax]')
    .evaluate((el) => [el.style.getPropertyValue('--fj-px'), el.style.getPropertyValue('--fj-py')]);

test.describe('the home page with reduced motion (AC-31, AC-41)', () => {
  test('0 running loops, no Motion control, final numbers, no reveal', async ({ page }) => {
    await page.goto('/');
    expect(await homeLoops(page)).toBe(0);
    await expect(page.locator('[data-hero]')).not.toHaveAttribute('data-motion', /.*/);
    await expect(page.getByRole('button', { name: /^(Pause|Play) animation$/ })).toHaveCount(0);
    await expect(page.locator('[data-motion-control]')).toBeHidden();

    const trim = (list: string[]) => list.map((t) => t.trim());
    const finals = trim(await page.locator('.stat__final').allTextContents());
    expect(finals.length).toBe(4);
    await page.evaluate(() => document.querySelector('.key-facts')?.scrollIntoView());
    await page.waitForTimeout(1600);
    expect(trim(await page.locator('[data-count-to]').allTextContents())).toEqual(finals);
    await expect(page.locator('[data-count-up]')).not.toHaveAttribute('data-count-state', /.*/);

    expect(await page.locator('[data-reveal]').count()).toBe(0);
    await expect(page.locator('.contact-place')).toHaveCSS('opacity', '1');
    expect(await homeLoops(page)).toBe(0);
  });

  test('--fj-px and --fj-py stay unset under a fine pointer', async ({ page, isMobile }) => {
    test.skip(isMobile, 'needs a fine pointer');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const hero = await page.locator('[data-hero]').boundingBox();
    if (!hero) throw new Error('no hero');
    await page.mouse.move(hero.x + 20, hero.y + 20);
    await page.mouse.move(hero.x + hero.width - 20, hero.y + hero.height - 20, { steps: 6 });
    await page.waitForTimeout(200);
    expect(await parallaxProps(page)).toEqual(['', '']);
    await expect(page.locator('[data-contours-parallax]')).toHaveCSS('translate', 'none');
  });

  test('the closing band is still', async ({ page }) => {
    await page.goto('/');
    await page.locator('.fj-band').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await bandMoving(page)).toBe(0);
  });

  test('scripts off: 0 loops, no control, nothing hidden, still band', async ({ page }) => {
    await page.route('**/_astro/**/*.js', (route) => route.abort());
    await page.goto('/');
    expect(await homeLoops(page)).toBe(0);
    await expect(page.locator('[data-motion-control]')).toBeHidden();
    expect(await page.locator('[data-reveal]').count()).toBe(0);
    expect(await bandMoving(page)).toBe(0);
  });
});

test.describe('a touch-only device with motion allowed (AC-31)', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the contours do not follow the pointer: --fj-px and --fj-py stay unset', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ ...devices['Pixel 7'], baseURL });
    const page = await context.newPage();
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(true);
    await page.evaluate(() => {
      const hero = document.querySelector('[data-hero]');
      const r = hero?.getBoundingClientRect();
      if (!hero || !r) return;
      for (const [fx, fy] of [
        [0.2, 0.2],
        [0.8, 0.8],
      ]) {
        hero.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            pointerType: 'touch',
            clientX: r.left + r.width * fx,
            clientY: r.top + r.height * fy,
          }),
        );
      }
    });
    await page.waitForTimeout(200);
    expect(await parallaxProps(page)).toEqual(['', '']);
    await context.close();
  });
});
