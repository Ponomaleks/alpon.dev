import { expect, test, type Locator, type Page } from '@playwright/test';

// Rendered checks of two components on the Styleguide (AC-21): the Stat row never lets a value
// leave its column, and the theme switch has the look of the page design's segmented control.

const box = async (target: Locator) => {
  const rect = await target.boundingBox();
  if (!rect) throw new Error('element has no box');
  return rect;
};

test.describe('Stat row at 390', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('no value leaves its column or reaches a neighbour, also a long one', async ({ page }) => {
    await page.goto('/styleguide');
    const stats = page.locator('[data-section="Stat"] .stat');
    expect(await stats.count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator('[data-section="Stat"] [data-long-value]')).toHaveCount(1);

    for (const stat of await stats.all()) {
      const column = await box(stat);
      const value = await box(stat.locator('.stat__value'));
      expect(value.x + value.width).toBeLessThanOrEqual(column.x + column.width + 0.5);
      // The text itself does not spill out of the value box either.
      const spill = await stat
        .locator('.stat__value')
        .evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(spill).toBeLessThanOrEqual(0);
    }
  });

  test('the row has two columns, as in the page design', async ({ page }) => {
    await page.goto('/styleguide');
    const first = page.locator('[data-section="Stat"] .stats').first().locator('.stat');
    const a = await box(first.nth(0));
    const b = await box(first.nth(1));
    const c = await box(first.nth(2));
    expect(b.y).toBeCloseTo(a.y, 0);
    expect(b.x).toBeGreaterThan(a.x + a.width);
    expect(c.y).toBeGreaterThan(a.y + a.height - 1);
    expect(c.x).toBeCloseTo(a.x, 0);
  });
});

const look = (target: Locator) =>
  target.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      radius: parseFloat(s.borderTopLeftRadius),
      height: el.getBoundingClientRect().height,
      background: s.backgroundColor,
      color: s.color,
      font: s.fontFamily,
    };
  });

const token = (page: Page, scope: Locator, name: string, property: 'color' | 'background-color') =>
  scope.evaluate(
    (el, [n, p]) => {
      const probe = document.createElement('span');
      probe.style.setProperty(p, `var(${n})`);
      el.append(probe);
      const value = getComputedStyle(probe).getPropertyValue(p);
      probe.remove();
      return value;
    },
    [name, property] as const,
  );

// WCAG relative luminance contrast of two rgb()/rgba() colours.
const contrast = (one: string, two: string) => {
  const lum = (value: string) => {
    const [r, g, b] = (value.match(/[\d.]+/g) ?? []).slice(0, 3).map((n) => {
      const c = Number(n) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [lum(one), lum(two)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const theme of ['dag', 'natt'] as const) {
  test.describe(`theme switch in ${theme}`, () => {
    test.use({ colorScheme: theme === 'natt' ? 'dark' : 'light' });

    const cases = [
      ['sample', '[data-section="Theme switch"] .theme-toggle[data-selected="natt"]'],
      ['on spruce', '[data-section="Header variants"] .fjord-on-spruce .theme-toggle'],
      ['menu panel sample', '[data-section="Mobile menu panel"] .theme-toggle'],
    ] as const;

    for (const [name, selector] of cases) {
      test(`${name}: pill track, inverted selected segment, mono labels`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/styleguide');
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const track = page.locator(selector).first();
        const segments = track.locator('.theme-toggle__segment');
        // The selected one: fixed by the sample, or the page theme on a live-looking switch.
        const chosen = (await track.getAttribute('data-selected')) ?? theme;
        const selected = track.locator(`[data-theme-value="${chosen}"]`);

        const t = await look(track);
        expect(t.radius).toBeGreaterThanOrEqual(t.height / 2);
        for (const segment of await segments.all()) {
          const s = await look(segment);
          expect(s.radius).toBeGreaterThanOrEqual(s.height / 2);
          expect(s.font).toContain('JetBrains Mono');
        }

        const s = await look(selected);
        expect(s.background).toBe(
          await token(page, track, '--fjord-color-text', 'background-color'),
        );
        expect(s.color).toBe(await token(page, track, '--fjord-color-bg', 'color'));
        // Non-text contrast of the selected segment against the track, and its label on it.
        expect(contrast(s.background, t.background)).toBeGreaterThanOrEqual(3);
        expect(contrast(s.color, s.background)).toBeGreaterThanOrEqual(4.5);
      });
    }
  });
}

test.describe('Wordmark on spruce', () => {
  test('the whole wordmark is snow, ".dev" included, as in the page design', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/styleguide');
    const wordmark = page.locator('[data-section="Wordmark"] .fjord-on-spruce .wordmark');
    await expect(wordmark).toHaveCount(1);
    const colours = await wordmark.evaluate((el) => {
      const probe = document.createElement('i');
      probe.style.color = 'var(--fjord-snow)';
      el.append(probe);
      const snow = getComputedStyle(probe).color;
      probe.remove();
      const dev = el.querySelector('span');
      if (!dev) throw new Error('the wordmark has no ".dev" span');
      return { snow, text: getComputedStyle(el).color, dev: getComputedStyle(dev).color };
    });
    expect(colours.text).toBe(colours.snow);
    expect(colours.dev).toBe(colours.snow);
  });
});

test.describe('Header with the forced secondary call to action', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('"Get in touch" changes on hover, like a secondary Button', async ({ page }) => {
    await page.goto('/styleguide');
    const action = page.locator('header[data-sample][data-cta="secondary"] .header__cta .fj-btn');
    await expect(action).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    const border = await action.evaluate((el) => getComputedStyle(el).borderTopColor);
    await action.hover();
    await expect(action).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(action).not.toHaveCSS('border-top-color', border);
  });
});

test.describe('Sticky action bar', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the sample and the live bar carry the float shadow of the page design', async ({
    page,
  }) => {
    await page.goto('/styleguide');
    await expect(page.locator('.mobile-bar[data-sample]')).not.toHaveCSS('box-shadow', 'none');
    await page.goto('/');
    await expect(page.locator('[data-shell-bar]')).not.toHaveCSS('box-shadow', 'none');
  });
});
