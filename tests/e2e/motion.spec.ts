import { expect, test, type Page } from '../fixtures';

// Ambient motion end to end (home T24): AC-06 count-up, AC-30 Motion control, AC-36 reveal,
// AC-31 pointer parallax, AC-41 the band's contours. Motion is allowed here; the reduced-motion
// cases live in reduced-motion.spec.ts. Running animations are read with document.getAnimations().
test.use({ reducedMotion: 'no-preference' });

const trimmed = (list: string[]) => list.map((t) => t.trim());
const CONTROL = { name: /^(Pause|Play) animation$/ };

/** Names of the running, never-ending CSS animations on the page. */
async function loops(page: Page) {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter(
        (a) =>
          a.playState === 'running' &&
          a instanceof CSSAnimation &&
          a.effect?.getComputedTiming().iterations === Infinity,
      )
      .map((a) => (a as CSSAnimation).animationName),
  );
}

const isDrift = (name: string) => name.includes('contours-drift');
const isFloat = (name: string) => name.includes('portrait-float');
// The pulse of the availability badge's dot (Owner decision): the third piece of Ambient motion.
const isPulse = (name: string) => name.includes('badge-pulse');

async function expectRunning(page: Page) {
  await expect.poll(async () => (await loops(page)).some(isDrift)).toBe(true);
  await expect.poll(async () => (await loops(page)).some(isFloat)).toBe(true);
  await expect.poll(async () => (await loops(page)).some(isPulse)).toBe(true);
}

async function expectStopped(page: Page) {
  await expect
    .poll(async () => (await loops(page)).filter((n) => isDrift(n) || isFloat(n) || isPulse(n)))
    .toEqual([]);
}

test.describe('the Motion control (AC-30)', () => {
  test('hero drift, portrait float and badge pulse run, the control pauses all within 100 ms and resumes them', async ({
    page,
  }) => {
    await page.goto('/');
    await expectRunning(page);

    const control = page.getByRole('button', CONTROL);
    await expect(control).toHaveAccessibleName('Pause animation');
    await expect(control).toHaveAttribute('aria-pressed', 'false');

    const result = await page.evaluate(() => {
      const button = document.querySelector<HTMLElement>('[data-motion-control]');
      const t0 = performance.now();
      button?.click();
      const states = document
        .getAnimations()
        .filter(
          (a) =>
            a instanceof CSSAnimation &&
            (a.animationName.includes('contours-drift') ||
              a.animationName.includes('portrait-float') ||
              a.animationName.includes('badge-pulse')),
        )
        .map((a) => a.playState);
      return { ms: performance.now() - t0, states };
    });
    expect(result.states.length).toBeGreaterThanOrEqual(3);
    expect(result.states.every((s) => s === 'paused')).toBe(true);
    expect(result.ms).toBeLessThan(100);

    await expect(control).toHaveAccessibleName('Play animation');
    await expect(control).toHaveAttribute('aria-pressed', 'true');

    await control.click();
    await expect(control).toHaveAccessibleName('Pause animation');
    await expect(control).toHaveAttribute('aria-pressed', 'false');
    await expectRunning(page);
  });

  test('only the dot of the hero badge pulses: its ring, and nothing else on the page', async ({
    page,
  }) => {
    await page.goto('/');
    await expectRunning(page);
    const pulses = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a instanceof CSSAnimation && a.animationName.includes('badge-pulse'))
        .map((a) => {
          const effect = a.effect as KeyframeEffect;
          return {
            inHero: !!effect.target?.closest('[data-hero]'),
            dot: effect.target?.className ?? '',
            pseudo: effect.pseudoElement,
            props: effect.getKeyframes().flatMap((k) => Object.keys(k)),
          };
        }),
    );
    expect(pulses).toHaveLength(1);
    expect(pulses[0]?.inHero).toBe(true);
    expect(pulses[0]?.dot).toContain('badge__dot');
    expect(pulses[0]?.pseudo).toBe('::after');
    // Compositor-only: the ring scales and fades, nothing is laid out again.
    const animated = new Set(pulses[0]?.props);
    for (const meta of ['offset', 'computedOffset', 'easing', 'composite']) animated.delete(meta);
    expect([...animated].sort()).toEqual(['opacity', 'transform']);
  });

  test('the control sits at the end of the badge row, 44 x 44, and adds no height (T-5)', async ({
    page,
  }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      const control = page.getByRole('button', CONTROL);
      await expect(control).toBeVisible();
      const box = async (selector: string) => {
        const found = await page.locator(selector).boundingBox();
        if (!found) throw new Error(`no box for ${selector}`);
        return found;
      };
      const [badge, row, button, eyebrow, text] = await Promise.all([
        box('main .hero .badge'),
        box('main .hero__badges'),
        box('[data-motion-control]'),
        box('main .hero__eyebrow'),
        box('main .hero__text'),
      ]);
      expect(button.width).toBeGreaterThanOrEqual(44);
      expect(button.height).toBeGreaterThanOrEqual(44);
      expect(row.height).toBeCloseTo(badge.height, 0);
      expect(eyebrow.y - (badge.y + badge.height)).toBeCloseTo(20, 0);
      // End of the row, centred on the badge, clear of the badge and of the eyebrow.
      expect(button.x + button.width).toBeCloseTo(text.x + text.width, 0);
      expect(button.y + button.height / 2).toBeCloseTo(badge.y + badge.height / 2, 0);
      expect(button.x).toBeGreaterThanOrEqual(badge.x + badge.width);
      expect(button.y + button.height).toBeLessThanOrEqual(eyebrow.y);

      // No layout shift between the motion states: pausing moves nothing.
      await control.click();
      await expect(control).toHaveAccessibleName('Play animation');
      expect(await box('main .hero .badge')).toEqual(badge);
      expect(await box('[data-motion-control]')).toEqual(button);
      await control.click();
      await expect(control).toHaveAccessibleName('Pause animation');
    }
  });

  test('paused, the hero stops where it is', async ({ page }) => {
    await page.goto('/');
    await expectRunning(page);
    await page.getByRole('button', CONTROL).click();
    const read = () =>
      page.evaluate(() =>
        [
          document.querySelector('[data-contours-parallax]'),
          document.querySelector('main .portrait'),
        ]
          // The numbers of each computed transform (`none` gives none).
          .map((el) => {
            if (!el) throw new Error('hero layer missing');
            return (getComputedStyle(el).transform.match(/-?[0-9.]+(?:e-?[0-9]+)?/g) ?? []).map(
              Number,
            );
          }),
      );
    const first = await read();
    await page.waitForTimeout(300);
    const second = await read();
    // Two reads of a stopped layer can differ in the last digits (about 0.0001 px seen in CI on the
    // mobile project, B-81): compare within 0.01 px, far below any movement of the running hero.
    expect(second.map((values) => values.length)).toEqual(first.map((values) => values.length));
    second.forEach((values, layer) =>
      values.forEach((value, i) =>
        expect(Math.abs(value - (first[layer]?.[i] ?? NaN))).toBeLessThanOrEqual(0.01),
      ),
    );
  });

  test('the control is reachable by keyboard and shows a focus ring', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'keyboard focus is checked on the desktop project');
    await page.goto('/');
    const control = page.getByRole('button', CONTROL);
    await page.keyboard.press('Tab');
    for (
      let i = 0;
      i < 12 && !(await control.evaluate((el) => el === document.activeElement));
      i++
    ) {
      await page.keyboard.press('Tab');
    }
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(control).toHaveAccessibleName('Play animation');
  });

  test('a paused choice survives a navigation away and back, and is gone in a new browser context', async ({
    page,
    browser,
    baseURL,
  }) => {
    await page.goto('/');
    await expectRunning(page);
    await page.getByRole('button', CONTROL).click();
    await expectStopped(page);

    await page.goto('/does-not-exist');
    await page.goto('/');
    const control = page.getByRole('button', CONTROL);
    await expect(control).toHaveAccessibleName('Play animation');
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await expectStopped(page);

    const fresh = await browser.newContext({ baseURL, reducedMotion: 'no-preference' });
    const other = await fresh.newPage();
    await other.goto('/');
    await expect(other.getByRole('button', CONTROL)).toHaveAccessibleName('Pause animation');
    await expectRunning(other);
    await fresh.close();
  });

  test('with storage blocked the choice holds for the page view', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'sessionStorage', {
        get() {
          throw new DOMException('denied', 'SecurityError');
        },
      });
    });
    await page.goto('/');
    await expectRunning(page);
    const control = page.getByRole('button', CONTROL);
    await control.click();
    await expect(control).toHaveAccessibleName('Play animation');
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await expectStopped(page);
    await page.waitForTimeout(300);
    await expectStopped(page);
  });
});

test('scripts off, with motion allowed: no loop runs and no Motion control is shown (AC-32, AC-30)', async ({
  page,
}) => {
  await page.route('**/_astro/**/*.js', (route) => route.abort());
  await page.goto('/');
  await page.waitForTimeout(300);
  expect(await loops(page)).toEqual([]);
  await expect(page.locator('[data-motion-control]')).toBeHidden();
});

type CountLog = { count: string[]; final: string[] };

/** Records every value written to the key facts and to the accessible finals, from document start. */
async function recordCounts(page: Page) {
  await page.addInitScript(() => {
    const log: CountLog = { count: [], final: [] };
    Object.assign(window, { __log: log });
    document.addEventListener('DOMContentLoaded', () => {
      const watch = (selector: string, into: string[]) => {
        for (const el of document.querySelectorAll(selector)) {
          new MutationObserver(() => into.push(el.textContent ?? '')).observe(el, {
            childList: true,
            characterData: true,
            subtree: true,
          });
        }
      };
      watch('[data-count-to]', log.count);
      watch('.stat__final', log.final);
    });
  });
}

const readLog = (page: Page) =>
  page.evaluate(() => (window as unknown as { __log: CountLog }).__log);

test.describe('key facts count up once (AC-06)', () => {
  test('values count to their final numbers once, the accessible text is final throughout', async ({
    page,
  }) => {
    await recordCounts(page);
    await page.goto('/');
    const finals = (await page.locator('.stat__final').allTextContents()).map((t) => t.trim());
    expect(finals.length).toBe(4);

    await page.locator('[data-count-up]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-count-up]')).toHaveAttribute('data-count-state', 'counting');
    await expect
      .poll(async () => page.locator('[data-count-to]').allTextContents().then(trimmed), {
        timeout: 5000,
      })
      .toEqual(finals);

    const log = await readLog(page);
    expect(log.count.length, 'the values were written while counting').toBeGreaterThan(4);
    expect(log.final, 'the accessible final text is never rewritten').toEqual([]);
    for (const el of await page.locator('[data-count-to]').all()) {
      await expect(el).toHaveAttribute('aria-hidden', 'true');
    }
    expect(trimmed(await page.locator('.stat__final').allTextContents())).toEqual(finals);

    // Once: leaving and coming back into view does not count again.
    const before = (await readLog(page)).count.length;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    expect((await readLog(page)).count.length).toBe(before);
    expect(await page.locator('[data-count-to]').allTextContents().then(trimmed)).toEqual(finals);
  });

  test('nothing around the numbers moves while they count', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('.key-facts__panel');
    const first = await panel.boundingBox();
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(250);
      expect(await panel.boundingBox()).toEqual(first);
    }
  });
});

const sectionStates = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-reveal-section]')].map((el) => ({
      top: el.getBoundingClientRect().top,
      state: el.getAttribute('data-reveal'),
      opacity: getComputedStyle(el).opacity,
    })),
  );

test.describe('sections fade in once (AC-36)', () => {
  test('a section below the fold fades in once it is in view and stays', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.addInitScript(() => {
      const history: string[] = [];
      Object.assign(window, { __reveal: history });
      document.addEventListener('DOMContentLoaded', () => {
        const last = document.querySelector('.contact-place');
        if (!last) return;
        history.push(`start:${last.getAttribute('data-reveal')}`);
        new MutationObserver(() => history.push(String(last.getAttribute('data-reveal')))).observe(
          last,
          { attributes: true, attributeFilter: ['data-reveal'] },
        );
      });
    });
    await page.goto('/');
    const contact = page.locator('.contact-place');
    await expect(contact).toHaveAttribute('data-reveal', 'pending');
    await expect(contact).toHaveCSS('opacity', '0');

    await contact.scrollIntoViewIfNeeded();
    await expect(contact).toHaveAttribute('data-reveal', 'in');
    await expect(contact).toHaveCSS('opacity', '1');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await contact.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await expect(contact).toHaveCSS('opacity', '1');
    const history = await page.evaluate(
      () => (window as unknown as { __reveal: string[] }).__reveal,
    );
    expect(history, 'pending then in, once').toEqual(['start:pending', 'in']);
  });

  test('a section already in view when the page opens is shown at once', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 3000 });
    await page.goto('/');
    await page.waitForLoadState('load');
    const states = await sectionStates(page);
    const visible = states.filter((s) => s.top < 3000);
    expect(visible.length).toBeGreaterThan(0);
    for (const s of visible) {
      expect(s.state).toBeNull();
      expect(s.opacity).toBe('1');
    }
  });

  test('the target of the address fragment is shown at once', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.goto('/#contact');
    const contact = page.locator('.contact-place');
    await expect(contact).toBeVisible();
    expect(await contact.getAttribute('data-reveal')).toBeNull();
    await expect(contact).toHaveCSS('opacity', '1');
  });
});

test.describe('pointer parallax under the real policy (AC-31)', () => {
  test('a fine pointer moves the contours layer against it and no policy violation is reported', async ({
    page,
    isMobile,
    baseURL,
  }) => {
    test.skip(isMobile, 'needs a fine pointer');
    const head = await page.request.get(`${baseURL}/`);
    expect(head.headers()['content-security-policy']).toContain("script-src 'self'");

    await page.addInitScript(() => {
      const seen: string[] = [];
      Object.assign(window, { __violations: seen });
      document.addEventListener('securitypolicyviolation', (e) =>
        seen.push(`${e.violatedDirective} ${e.blockedURI}`),
      );
    });
    const errors: string[] = [];
    page.on('console', (m) => {
      if (/content security policy/i.test(m.text())) errors.push(m.text());
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const layer = page.locator('[data-contours-parallax]');
    await expect(layer).toHaveCount(1);
    expect(await layer.evaluate((el) => el.style.getPropertyValue('--fj-px'))).toBe('');

    const hero = await page.locator('[data-hero]').boundingBox();
    if (!hero) throw new Error('no hero');
    await page.mouse.move(hero.x + hero.width * 0.1, hero.y + hero.height * 0.2);
    await page.mouse.move(hero.x + hero.width * 0.9, hero.y + hero.height * 0.8, { steps: 5 });

    await expect
      .poll(() => layer.evaluate((el) => el.style.getPropertyValue('--fj-px')))
      .not.toBe('');
    await expect
      .poll(() => layer.evaluate((el) => getComputedStyle(el).translate))
      .not.toMatch(/^(none|0px( 0px)?)$/);
    // Page design (Home.jsx): `(e.clientX / innerWidth - 0.5) * -20`. The pointer rests right of
    // and below the centre, so the layer has gone left and up.
    const offset = await layer.evaluate((el) => [
      Number.parseFloat(el.style.getPropertyValue('--fj-px')),
      Number.parseFloat(el.style.getPropertyValue('--fj-py')),
    ]);
    expect(offset[0]).toBeLessThan(0);
    expect(offset[1]).toBeLessThan(0);
    expect(
      await page.evaluate(() => (window as unknown as { __violations: string[] }).__violations),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
});

/** Animations whose target lies in the closing band, with what drives them. */
async function bandAnimations(page: Page) {
  return page.evaluate(() => {
    const band = document.querySelector('.fj-band');
    return document
      .getAnimations()
      .filter((a) => {
        const target = (a.effect as KeyframeEffect | null)?.target;
        return !!band && !!target && band.contains(target);
      })
      .map((a) => ({
        scrollDriven: !(a.timeline instanceof DocumentTimeline),
        active: a.timeline?.currentTime != null,
        state: a.playState,
        name: a instanceof CSSAnimation ? a.animationName : 'transition',
      }));
  });
}

const layerTransform = (page: Page) =>
  page.evaluate(() => {
    const layer = document.querySelector('.fj-band .contours__layer');
    return layer ? getComputedStyle(layer).transform : 'missing';
  });

for (const scripts of ['on', 'off'] as const) {
  test(`the band's contours follow scrolling and nothing in the band moves by itself, scripts ${scripts} (AC-41)`, async ({
    page,
  }) => {
    if (scripts === 'off') await page.route('**/_astro/**/*.js', (route) => route.abort());
    await page.goto('/');
    await page.locator('.fj-band').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
    const all = await bandAnimations(page);
    expect(
      all.filter((a) => !a.scrollDriven && a.state === 'running'),
      'time-driven animations in the band',
    ).toEqual([]);

    if (!supported) {
      // No scroll-driven animations in this browser: the band must be still.
      expect(all.filter((a) => a.state === 'running')).toEqual([]);
      return;
    }
    expect(
      all.filter((a) => a.scrollDriven).length,
      'a scroll-driven animation drives the layer',
    ).toBeGreaterThan(0);

    expect(
      all.filter((a) => a.scrollDriven && !a.active).length,
      'the scroll timeline of the band is active (its scroller scrolls)',
    ).toBe(0);

    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate((y) => window.scrollTo(0, y - 200), pageHeight);
    await page.waitForTimeout(200);
    const stopped = await layerTransform(page);
    await page.waitForTimeout(400);
    expect(await layerTransform(page), 'still when scrolling stops').toBe(stopped);

    await page.evaluate(() => window.scrollBy(0, -250));
    await page.waitForTimeout(200);
    expect(await layerTransform(page), 'moves with scrolling').not.toBe(stopped);
  });
}
