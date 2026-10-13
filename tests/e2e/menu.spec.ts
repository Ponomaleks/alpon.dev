import { expect, test, type Page } from '../fixtures';

// The mobile menu end to end (base-components T19): AC-04, AC-05 and the SCR-03 states
// "open", "closed by Escape or the close button", "closed by a link", "closed by width",
// "theme changed inside", "not reachable". Reduced motion is emulated (spec section 1).
test.use({ reducedMotion: 'reduce' });

async function open(page: Page, path = '/') {
  const errors: Error[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => errors.push(error));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  return { errors, consoleErrors };
}

const menuButton = (page: Page) =>
  page.locator('header').getByRole('button', { name: 'Open menu' });
const panel = (page: Page) => page.locator('dialog#mobile-menu');

async function openMenu(page: Page) {
  await menuButton(page).click();
  await expect(panel(page)).toBeVisible();
}

test.describe('mobile menu at 390', () => {
  test('opens with the content, focus on the first link, page behind inert and not scrollable (AC-04)', async ({
    page,
  }) => {
    const { errors, consoleErrors } = await open(page);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await openMenu(page);
    const dialog = panel(page);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');

    await expect(dialog.getByRole('link', { name: /CV/ })).toBeVisible();
    await expect(dialog.getByRole('link', { name: /Contact/ })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'ponomaleks@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:ponomaleks@gmail.com',
    );
    await expect(dialog.getByRole('link', { name: '+47 405 94 584' })).toHaveAttribute(
      'href',
      /^tel:\+47/,
    );
    await expect(dialog.getByText('Oslo, Norge')).toBeVisible();
    await expect(dialog.getByRole('group', { name: 'Theme' })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Get in touch' })).toBeVisible();

    // Focus is inside the panel, on the first navigation link.
    const first = dialog.locator('[data-menu-nav] a').first();
    await expect(first).toBeFocused();

    // Page behind: modal, so inert; Tab never leaves the panel; the page does not scroll.
    expect(await dialog.evaluate((el) => el.matches(':modal'))).toBe(true);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(
        await page.evaluate(() => !document.activeElement?.closest('header, main, footer')),
      ).toBe(true);
    }
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden',
    );
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  for (const [how, close] of [
    ['Escape', (page: Page) => page.keyboard.press('Escape')],
    [
      'the close button',
      (page: Page) => panel(page).getByRole('button', { name: 'Close menu' }).click(),
    ],
  ] as const) {
    test(`closes by ${how} and focus returns to the menu button (AC-05)`, async ({ page }) => {
      await open(page);
      await openMenu(page);
      await close(page);
      await expect(panel(page)).toBeHidden();
      await expect(menuButton(page)).toBeFocused();
      await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
      expect(
        await page.evaluate(() => getComputedStyle(document.documentElement).overflow),
      ).not.toBe('hidden');
    });
  }

  test('closes by a link to another page (AC-05)', async ({ page }) => {
    await open(page, '/does-not-exist');
    await openMenu(page);
    await panel(page)
      .getByRole('link', { name: /Contact/ })
      .click();
    await page.waitForURL('**/#contact');
    await expect(panel(page)).toBeHidden();
    await expect(page).toHaveURL(/\/#contact$/);
  });

  test('closes by a link to the page the Visitor is already on (AC-05)', async ({ page }) => {
    await open(page, '/');
    await openMenu(page);
    await panel(page)
      .getByRole('link', { name: /Contact/ })
      .click();
    await expect(panel(page)).toBeHidden();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe(
      'hidden',
    );
  });

  test('after a same-page link focus is on the link target itself, not the menu button (G-1, AC-05)', async ({
    page,
  }) => {
    await open(page, '/');
    await openMenu(page);
    await panel(page)
      .getByRole('link', { name: /Contact/ })
      .click();
    await expect(panel(page)).toBeHidden();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(menuButton(page)).not.toBeFocused();
    const active = await page.evaluate(() => document.activeElement?.id ?? null);
    expect(active, 'document.activeElement should be the element with id "contact"').toBe(
      'contact',
    );
  });

  test('works from the keyboard: Enter opens, Space toggles a theme segment, Space closes (R6, AC-25)', async ({
    page,
  }) => {
    await open(page);
    const button = menuButton(page);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(panel(page)).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    const dialog = panel(page);
    const segments = dialog.getByRole('group', { name: 'Theme' }).getByRole('button');
    const idle = segments.and(page.locator('[aria-pressed="false"]'));
    await expect(idle).toHaveCount(1);
    const idleName = (await idle.getAttribute('aria-label')) ?? (await idle.textContent());
    const expected = /dark/i.test(idleName ?? '') ? 'natt' : 'dag';
    await idle.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('html')).toHaveAttribute('data-theme', expected);
    await expect(idle).toHaveCount(1);
    await expect(segments.and(page.locator('[aria-pressed="true"]'))).toHaveCount(1);
    await expect(dialog).toBeVisible();

    const close = dialog.getByRole('button', { name: 'Close menu' });
    await close.focus();
    await page.keyboard.press('Space');
    await expect(dialog).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('the panel wordmark has the size of the header wordmark, as in the page design (R1)', async ({
    page,
  }) => {
    await open(page);
    const size = (el: Element) => getComputedStyle(el).fontSize;
    const inHeader = await page
      .locator('header[data-header] a[aria-label="alpon.dev, home"]')
      .evaluate(size);
    await openMenu(page);
    const inPanel = await panel(page).locator('a[aria-label="alpon.dev, home"]').evaluate(size);
    expect(inPanel).toBe(inHeader);
  });

  test('closes when the width reaches 768', async ({ page }) => {
    await open(page);
    await openMenu(page);
    await page.setViewportSize({ width: 768, height: 844 });
    await expect(panel(page)).toBeHidden();
    const button = page.locator('header [aria-controls="mobile-menu"]');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeHidden();
  });

  for (const theme of ['dag', 'natt'] as const) {
    test(`a theme change inside leaves the panel open, readable in ${theme === 'dag' ? 'Dag' : 'Natt'}`, async ({
      page,
    }) => {
      const { errors, consoleErrors } = await open(page);
      await openMenu(page);
      const dialog = panel(page);
      const other = theme === 'dag' ? 'Dark' : 'Light';
      // Start from the opposite theme, then choose the target one inside the panel.
      await dialog.getByRole('button', { name: other }).click();
      await dialog.getByRole('button', { name: theme === 'dag' ? 'Light' : 'Dark' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(dialog).toBeVisible();
      await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
      await expect(
        dialog.getByRole('button', { name: theme === 'dag' ? 'Light' : 'Dark' }),
      ).toHaveAttribute('aria-pressed', 'true');
      // The page design puts the sheet on spruce (fj-sheet fjord-on-spruce): --fjord-spruce in
      // Dag, --fjord-spruce-deep in Natt, snow text. Token values are read from the page.
      const colors = await dialog.evaluate(
        (el, token) => {
          const probe = (prop: 'backgroundColor' | 'color', value: string) => {
            const p = document.createElement('i');
            p.style[prop] = value;
            document.body.append(p);
            const out = getComputedStyle(p)[prop];
            p.remove();
            return out;
          };
          const style = getComputedStyle(el);
          return {
            bg: style.backgroundColor,
            fg: style.color,
            ground: probe('backgroundColor', `var(${token})`),
            snow: probe('color', 'var(--fjord-snow)'),
          };
        },
        theme === 'dag' ? '--fjord-spruce' : '--fjord-spruce-deep',
      );
      expect(colors.bg).toBe(colors.ground);
      expect(colors.fg).toBe(colors.snow);

      // The theme switch inside the panel: pill shape, selected segment clearly distinct.
      const sw = await dialog.getByRole('group', { name: 'Theme' }).evaluate((el) => {
        const probe = document.createElement('i');
        probe.style.borderTopLeftRadius = 'var(--fjord-radius-pill)';
        document.body.append(probe);
        const pill = getComputedStyle(probe).borderTopLeftRadius;
        probe.remove();
        const buttons = [...el.querySelectorAll('button')];
        const on = buttons.find((b) => b.getAttribute('aria-pressed') === 'true');
        const off = buttons.find((b) => b.getAttribute('aria-pressed') !== 'true');
        return {
          pill,
          radius: getComputedStyle(el).borderTopLeftRadius,
          onBg: on ? getComputedStyle(on).backgroundColor : '',
          offBg: off ? getComputedStyle(off).backgroundColor : '',
        };
      });
      expect(sw.radius).toBe(sw.pill);
      expect(sw.onBg).not.toBe(sw.offBg);
      expect(errors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }

  test('not reachable with scripts off: the button is hidden, the links stay in the header', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await expect(menuButton(page)).toBeHidden();
    await expect(panel(page)).toBeHidden();
    await expect(page.getByRole('link', { name: 'Get in touch' }).first()).toBeVisible();
    await context.close();
  });
});

// R2 (review S2-02, AC-04, AC-25): the panel scrolls when the viewport is shorter than its
// content, and keeps the bottom block at the bottom when there is room.
test.describe('mobile menu scrolling (R2)', () => {
  test('on a short viewport the Visitor can scroll to "Get in touch" and activate it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    await openMenu(page);
    const dialog = panel(page);
    const cta = dialog.getByRole('link', { name: 'Get in touch' });

    // A real wheel gesture over the panel, as a Visitor would scroll; no programmatic scroll.
    await page.mouse.move(333, 200);
    await page.mouse.wheel(0, 2000);
    await expect
      .poll(() => dialog.evaluate((el) => el.scrollTop), {
        message: 'the dialog should scroll when its content is taller than the viewport',
      })
      .toBeGreaterThan(0);

    const box = await cta.boundingBox();
    if (!box) throw new Error('"Get in touch" has no bounding box');
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(375);

    await cta.click();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(panel(page)).toBeHidden();
  });

  test('on a tall viewport the bottom block stays at the bottom of the panel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await openMenu(page);
    const dialog = panel(page);
    const m = await dialog.evaluate((el) => {
      const d = el.getBoundingClientRect();
      const foot = el.querySelector('.menu__foot');
      if (!foot) throw new Error('.menu__foot is missing');
      const f = foot.getBoundingClientRect();
      return {
        gap: d.bottom - f.bottom,
        padding: parseFloat(getComputedStyle(el).paddingBottom),
        scrolls: el.scrollHeight > el.clientHeight + 1,
      };
    });
    expect(m.scrolls).toBe(false);
    expect(m.gap).toBeGreaterThanOrEqual(0);
    expect(m.gap).toBeLessThanOrEqual(m.padding + 1);
  });
});

// Owner design review: the panel's top bar repeats the header's, so the wordmark stays where it
// is and the close button takes the place of the menu button when the panel opens and closes.
// Measured once the panel's entrance animation has finished, in the conditions that moved it:
// a viewport shorter than the panel's content (the top bar used to shrink) and a classic,
// space-taking scrollbar (the page used to widen under the open panel).
test.describe('the panel top bar lines up with the header', () => {
  const HOME = 'a[aria-label="alpon.dev, home"]';
  type Box = { x: number; y: number; width: number; height: number };

  const headerBoxes = (page: Page) =>
    page.evaluate((home) => {
      const box = (el: Element | null | undefined) => {
        if (!el) throw new Error('element is missing');
        const { x, y, width, height } = el.getBoundingClientRect();
        return { x, y, width, height };
      };
      return {
        wordmark: box(document.querySelector(`header[data-header] ${home}`)),
        button: box(document.querySelector('header[data-header] [aria-controls="mobile-menu"]')),
      };
    }, HOME);

  // Waits for every animation of the panel to finish, then reads the final boxes.
  const panelBoxes = (page: Page) =>
    page.evaluate(async (home) => {
      const dialog = document.querySelector('dialog#mobile-menu');
      if (!dialog) throw new Error('the panel is missing');
      await Promise.all(dialog.getAnimations({ subtree: true }).map((a) => a.finished));
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
      const box = (el: Element | null) => {
        if (!el) throw new Error('element is missing');
        const { x, y, width, height } = el.getBoundingClientRect();
        return { x, y, width, height };
      };
      return {
        wordmark: box(dialog.querySelector(home)),
        button: box(dialog.querySelector('button[aria-label="Close menu"]')),
      };
    }, HOME);

  const expectSamePlaces = (
    before: { wordmark: Box; button: Box },
    after: { wordmark: Box; button: Box },
  ) => {
    for (const part of ['wordmark', 'button'] as const) {
      for (const side of ['x', 'y', 'width', 'height'] as const) {
        expect(
          Math.abs(after[part][side] - before[part][side]),
          `${part} ${side}: header ${before[part][side]}, panel ${after[part][side]}`,
        ).toBeLessThanOrEqual(0.5);
      }
    }
  };

  async function measure(page: Page, path: string, scrolled: boolean) {
    await page.goto(path);
    if (scrolled) {
      await page.evaluate(() => window.scrollTo(0, 400));
      await expect(page.locator('header[data-header]')).toHaveAttribute('data-scrolled', '');
    }
    const before = await headerBoxes(page);
    // The Styleguide has sample headers too: the live one is the header with the scroll state.
    await page.locator('header[data-header] [aria-controls="mobile-menu"]').click();
    await expect(panel(page)).toBeVisible();
    return { before, after: await panelBoxes(page) };
  }

  for (const width of [390, 360]) {
    for (const theme of ['dag', 'natt'] as const) {
      for (const scrolled of [false, true]) {
        test(`at ${width} in ${theme === 'dag' ? 'Dag' : 'Natt'}, page ${scrolled ? 'scrolled' : 'at the top'}: the wordmark and the close button take the places of the header's wordmark and menu button`, async ({
          page,
        }) => {
          await page.emulateMedia({
            colorScheme: theme === 'dag' ? 'light' : 'dark',
            reducedMotion: 'reduce',
          });
          await page.setViewportSize({ width, height: 844 });
          const { before, after } = await measure(page, '/', scrolled);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          expectSamePlaces(before, after);
        });
      }
    }
  }

  // The panel's content is about 490 to 530 tall: 480 and 320 are shorter than it, 844 is not.
  for (const width of [360, 390, 600, 767]) {
    for (const height of [844, 480, 320]) {
      for (const motion of ['no-preference', 'reduce'] as const) {
        test(`at ${width} by ${height}, motion ${motion === 'reduce' ? 'reduced' : 'allowed'}: the places are the same after the entrance animation`, async ({
          page,
        }) => {
          await page.emulateMedia({ reducedMotion: motion });
          await page.setViewportSize({ width, height });
          const { before, after } = await measure(page, '/', false);
          expectSamePlaces(before, after);
        });
      }
    }
  }

  for (const path of ['/does-not-exist', '/styleguide']) {
    test(`on ${path} at 390 by 480, page scrolled, motion allowed: the places are the same`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.setViewportSize({ width: 390, height: 480 });
      const { before, after } = await measure(page, path, path === '/styleguide');
      expectSamePlaces(before, after);
    });
  }

  // The test browsers hide scrollbars; a desktop browser draws one that takes page width.
  test('with a classic scrollbar the panel is as wide as the header was, so the close button stays over the menu button', async ({
    playwright,
    browserName,
    isMobile,
    baseURL,
  }) => {
    test.skip(browserName !== 'chromium', 'the scrollbar flag is a Chromium one');
    test.skip(isMobile, 'a phone draws overlay scrollbars, which take no page width');
    // It starts a browser of its own: about 5 s alone, past 30 s once in a full run (backlog B-37).
    test.setTimeout(90_000);
    const browser = await playwright.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
    try {
      for (const [width, height] of [
        [600, 844],
        [390, 480],
      ] as const) {
        const page = await browser.newPage({ baseURL, viewport: { width, height } });
        await page.goto('/');
        const drawn = await page.evaluate(
          () => window.innerWidth - document.documentElement.clientWidth,
        );
        expect(drawn, 'the browser draws a classic scrollbar').toBeGreaterThan(0);
        const before = await headerBoxes(page);
        await openMenu(page);
        expectSamePlaces(before, await panelBoxes(page));
        await page.close();
      }
    } finally {
      await browser.close();
    }
  });
});

// AC-20, B-05: the current link of the spruce panel differs from the other links by more than
// colour: an accent rule at the start of its row. Every link keeps the weight of the page design.
test.describe('current link in the mobile menu (AC-20)', () => {
  const link = (page: Page, name: string) =>
    panel(page).locator('[data-menu-nav] a', { hasText: name });
  const look = (page: Page, name: string) =>
    link(page, name).evaluate((el) => {
      const cs = getComputedStyle(el);
      const before = getComputedStyle(el, '::before');
      const side = (s: CSSStyleDeclaration) => ({
        border: s.borderInlineStartWidth,
        borderStyle: s.borderInlineStartStyle,
        shadow: s.boxShadow,
        content: s.content,
        width: s.width,
        bg: s.backgroundColor,
      });
      return {
        current: el.getAttribute('aria-current'),
        weight: Number(cs.fontWeight),
        own: side(cs),
        pseudo: side(before),
      };
    });
  const hasRule = (l: Awaited<ReturnType<typeof look>>) =>
    (l.own.border !== '0px' && l.own.borderStyle !== 'none') ||
    (l.own.shadow !== 'none' && /inset/.test(l.own.shadow)) ||
    (l.pseudo.content !== 'none' &&
      l.pseudo.content !== 'normal' &&
      l.pseudo.bg !== 'rgba(0, 0, 0, 0)');

  for (const path of ['/cv/en', '/cv/no']) {
    test(`on ${path} the current link has the rule and the weight of the other links`, async ({
      page,
    }) => {
      await open(page, path);
      await openMenu(page);
      const cv = await look(page, 'CV');
      const contactLink = await look(page, 'Contact');
      expect(cv.current).toBe('page');
      expect(contactLink.current).toBeNull();
      expect(cv.weight).toBe(600);
      expect(contactLink.weight).toBe(600);
      expect(hasRule(cv)).toBe(true);
      expect(hasRule(contactLink)).toBe(false);
    });
  }

  test('on the home page no link has the rule, and every link has the weight of the design', async ({
    page,
  }) => {
    await open(page, '/');
    await openMenu(page);
    for (const name of ['CV', 'Contact']) {
      const l = await look(page, name);
      expect(l.current).toBeNull();
      expect(l.weight).toBe(600);
      expect(hasRule(l)).toBe(false);
    }
  });

  test('on /cv/no the panel is marked English', async ({ page }) => {
    await open(page, '/cv/no');
    await expect(panel(page)).toHaveAttribute('lang', 'en');
  });
});
