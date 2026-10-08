import { readFile } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';

// The Contact block end to end (home T21): AC-13 rows and links, AC-14 copy, AC-15 refused copy,
// AC-16 the contact card download, AC-17 the QR tile. Reduced motion is emulated so nothing moves.
test.use({ reducedMotion: 'reduce' });

const EMAIL = 'ponomaleks@gmail.com';
const SECTION = '#contact';

const box = async (target: Locator) => {
  const rect = await target.boundingBox();
  if (!rect) throw new Error('no box');
  return rect;
};

/** A colour token as the browser computes it, read from a probe inside the section. */
const token = (page: Page, name: string) =>
  page.locator(SECTION).evaluate((section, variable) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${variable})`;
    section.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);

async function openIn(page: Page, theme: 'dag' | 'natt', width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
  await page.evaluate(() => document.fonts.ready);
}

test.describe('rows and links (AC-13)', () => {
  test('the heading, the lead and the five rows', async ({ page }) => {
    await page.goto('/');
    const block = page.locator(SECTION);
    await expect(block.getByRole('heading', { name: 'Get in touch' })).toBeVisible();
    await expect(block.getByText('Email is fastest. Phone and LinkedIn work too.')).toBeVisible();
    const labels = await block.locator('dt').allTextContents();
    expect(labels).toEqual(['Email', 'Phone', 'LinkedIn', 'GitHub', 'Region']);
  });

  test('mail and phone stay in the tab; LinkedIn and GitHub open a new tab and say so (D-09)', async ({
    page,
  }) => {
    await page.goto('/');
    const rows = page.locator(`${SECTION} .contact__row`);
    const links = [
      [0, `mailto:${EMAIL}`, EMAIL, false],
      [1, 'tel:+4740594584', '+47 405 94 584', false],
      [2, 'https://www.linkedin.com/in/ponomalex/', 'linkedin.com/in/ponomalex', true],
      [3, 'https://github.com/ponomaleks', 'github.com/ponomaleks', true],
    ] as const;
    for (const [index, href, text, newTab] of links) {
      const link = rows.nth(index).getByRole('link');
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toContainText(text);
      if (newTab) {
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(link).toHaveAccessibleName(`${text} (opens in a new tab)`);
        await expect(link.locator('svg')).toBeVisible();
      } else {
        expect(await link.getAttribute('target')).toBeNull();
        await expect(link).toHaveAccessibleName(text);
      }
    }
  });

  test('a profile link really opens a new tab and leaves the page where it is', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    // The profile itself is not loaded: any request to another site is answered with an empty page.
    await context.route(/^https:\/\/(www\.)?(linkedin|github)\.com\//, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<title>stub</title>' }),
    );
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.locator(`${SECTION} .contact__row`).nth(3).getByRole('link').click(),
    ]);
    expect(popup.url()).toBe('https://github.com/ponomaleks');
    expect(await popup.evaluate(() => window.opener)).toBeNull();
    expect(new URL(page.url()).pathname).toBe('/');
    await popup.close();
  });

  test('"Region" shows Oslo, Norge marked as Norwegian', async ({ page }) => {
    await page.goto('/');
    const region = page.locator(`${SECTION} .contact__row`).nth(4);
    await expect(region.locator('dt')).toHaveText('Region');
    await expect(region.locator('[lang="no"]')).toHaveText('Oslo, Norge');
    await expect(page.locator(SECTION)).not.toContainText('Based in');
  });
});

// Page design (ContactList, .fj-contacts): the row values are mono, in the text colour of the
// theme (snow in Natt) and not underlined; the link colour and an underline come on hover.
test.describe('the look of the rows (design ContactList)', () => {
  for (const theme of ['dag', 'natt'] as const) {
    test(`${theme}: every value is mono, in the text colour, without an underline`, async ({
      page,
    }) => {
      await openIn(page, theme, 1440);
      const text = await token(page, '--fjord-color-text');
      if (theme === 'natt') expect(text).toBe(await token(page, '--fjord-snow'));
      const values = page.locator(`${SECTION} .contact__row dd .contact__value`);
      await expect(values).toHaveCount(5);
      for (const value of await values.all()) {
        const look = await value.evaluate((el) => {
          const style = getComputedStyle(el);
          return { color: style.color, line: style.textDecorationLine, font: style.fontFamily };
        });
        expect(look.color).toBe(text);
        expect(look.line).toBe('none');
        expect(look.font).toContain('JetBrains Mono');
      }
    });

    test(`${theme}: a hovered link takes the link colour and an underline`, async ({ page }) => {
      await openIn(page, theme, 1440);
      const link = page.locator(`${SECTION} .contact__row`).nth(1).getByRole('link');
      await link.hover();
      await expect(link).toHaveCSS('color', await token(page, '--fjord-color-link'));
      await expect(link).toHaveCSS('text-decoration-line', 'underline');
    });

    test(`${theme}: Copy is the small muted control with a hairline border`, async ({ page }) => {
      await openIn(page, theme, 1440);
      const chip = page.locator(`${SECTION} [data-copy-email] .fj-copy__chip`);
      const look = await chip.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          color: style.color,
          border: style.borderTopColor,
          background: style.backgroundColor,
          font: style.fontFamily,
          height: el.getBoundingClientRect().height,
        };
      });
      expect(look.height).toBe(32);
      expect(look.color).toBe(await token(page, '--fjord-color-text-muted'));
      expect(look.border).toBe(await token(page, '--fjord-color-border'));
      expect(look.background).toBe('rgba(0, 0, 0, 0)');
      expect(look.font).toContain('JetBrains Mono');
      const icon = await box(chip.locator('.fj-copy__face').first().locator('svg'));
      expect(icon.width).toBeCloseTo(14, 0);
      // Hover: the text colour and the strong border.
      await page.locator(`${SECTION} [data-copy-email]`).hover();
      await expect(chip).toHaveCSS('color', await token(page, '--fjord-color-text'));
      await expect(chip).toHaveCSS(
        'border-top-color',
        await token(page, '--fjord-color-border-strong'),
      );
    });
  }

  for (const width of [390, 834, 1440]) {
    test(`Copy ends the email row at its right edge at ${width}, with a 44px target`, async ({
      page,
    }) => {
      await openIn(page, 'dag', width);
      const row = await box(page.locator(`${SECTION} .contact__row`).first());
      const button = await box(page.locator(`${SECTION} [data-copy-email]`));
      const chip = await box(page.locator(`${SECTION} [data-copy-email] .fj-copy__chip`));
      const link = await box(page.locator(`${SECTION} .contact__row`).first().getByRole('link'));
      expect(chip.x + chip.width).toBeCloseTo(row.x + row.width, 0);
      expect(chip.x).toBeGreaterThanOrEqual(link.x + link.width);
      expect(Math.abs(chip.y + chip.height / 2 - (row.y + row.height / 2))).toBeLessThanOrEqual(1);
      expect(button.height).toBeGreaterThanOrEqual(44);
      expect(button.width).toBeGreaterThanOrEqual(44);
    });
  }

  test('the rows are 56px high with the label in a fixed column', async ({ page }) => {
    await openIn(page, 'dag', 1440);
    const rows = page.locator(`${SECTION} .contact__row`);
    for (let i = 0; i < 5; i++) {
      const row = await box(rows.nth(i));
      const value = await box(rows.nth(i).locator('.contact__value'));
      // 56px and the hairline above (the last row also has one below).
      expect(row.height).toBeGreaterThanOrEqual(56);
      expect(row.height).toBeLessThanOrEqual(58);
      expect(value.x).toBeCloseTo(row.x + 88 + 12, 0);
    }
  });
});

// Owner's design review: on a phone the label column is narrower than the design's 88px, so the
// address is not broken by one character. From 768 the design's column stays.
test.describe('the email address stays on one line on a phone', () => {
  /** The number of line boxes the text of an element takes. */
  const lines = (target: Locator) =>
    target.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });

  for (const width of [360, 375, 390]) {
    test(`at ${width} the address is one line, the row 56px and every label fits`, async ({
      page,
    }) => {
      await openIn(page, 'dag', width);
      const rows = page.locator(`${SECTION} .contact__row`);
      const email = rows.first();
      await expect(email.locator('[data-copy-email]')).toBeVisible();
      expect(await lines(email.getByRole('link'))).toBe(1);
      const row = await box(email);
      expect(row.height).toBeGreaterThanOrEqual(56);
      expect(row.height).toBeLessThanOrEqual(58);
      for (const label of await rows.locator('dt').all()) {
        expect(await lines(label)).toBe(1);
        expect(await label.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
      }
    });
  }

  test.describe('without scripts', () => {
    test.use({ javaScriptEnabled: false });
    for (const width of [360, 375, 390]) {
      test(`at ${width} the address is one line and Copy is not shown`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/');
        const email = page.locator(`${SECTION} .contact__row`).first();
        await expect(email.locator('[data-copy-email]')).toBeHidden();
        expect(await lines(email.getByRole('link'))).toBe(1);
      });
    }
  });

  test('from 768 the label column is the 88px of the design', async ({ page }) => {
    for (const width of [768, 834]) {
      await openIn(page, 'dag', width);
      const label = await box(page.locator(`${SECTION} .contact__row dt`).first());
      expect(label.width).toBe(88);
    }
  });
});

// screens.md H-3: from 1024 the mail-link sentence stands beside the list, where the page design
// draws the message form; below 1024 it follows "Save contact".
test.describe('the mail-link sentence beside the list (screens.md H-3)', () => {
  test('beside the list from 1024', async ({ page }) => {
    await openIn(page, 'dag', 1024);
    const list = await box(page.locator(`${SECTION} .contact__list`));
    const sentence = await box(page.locator(`${SECTION} .contact__sentence`));
    expect(sentence.x).toBeGreaterThanOrEqual(list.x + list.width);
    expect(sentence.y).toBeLessThan(list.y + list.height);
  });

  test('under "Save contact" below 1024', async ({ page }) => {
    await openIn(page, 'dag', 834);
    const save = await box(
      page.locator(SECTION).getByRole('link', { name: 'Save contact (.vcf)' }),
    );
    const sentence = await box(page.locator(`${SECTION} .contact__sentence`));
    expect(sentence.y).toBeGreaterThanOrEqual(save.y + save.height);
    expect(sentence.x).toBeCloseTo(save.x, 0);
  });
});

test.describe('copy the email address (AC-14)', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('the address is on the clipboard and a Toast confirms it', async ({ page }) => {
    await page.goto('/');
    await page.locator(`${SECTION} [data-copy-email]`).click();
    const region = page.getByRole('status');
    const toast = region.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Copied');
    await expect(toast.locator('[lang="no"]')).toHaveCount(0);
    await expect(toast).toContainText(EMAIL);
    await expect(toast).toHaveAttribute('data-icon', 'check');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
    // It leaves by itself.
    await expect(toast).toHaveCount(0, { timeout: 10_000 });
  });

  // Owner's design review (reverses D-18): Copy shows the design's own done state ("Copied", the
  // success colour) for --fjord-duration-copied and returns to "Copy". The control keeps its size
  // and its name, so the Toast is the one announcement.
  for (const width of [360, 768, 1023, 1440]) {
    test(`at ${width} Copy shows "Copied", keeps its size and name, and returns to "Copy"`, async ({
      page,
    }) => {
      await openIn(page, 'dag', width);
      const button = page.locator(`${SECTION} [data-copy-email]`);
      const copyFace = button.locator('.fj-copy__face').first();
      const doneFace = button.locator('.fj-copy__face--done');
      const address = page.locator(`${SECTION} .contact__row`).first().getByRole('link');
      // The click scrolls the page: compare the place across the row and the size.
      const place = async (target: Locator) => {
        const { x, width, height } = await box(target);
        return { x, width, height };
      };
      const before = { button: await place(button), address: await place(address) };
      await expect(copyFace).toBeVisible();
      await expect(doneFace).toBeHidden();
      await expect(button).not.toHaveAttribute('data-done');

      await button.click();
      await expect(button).toHaveAttribute('data-done', 'true');
      await expect(doneFace).toBeVisible();
      await expect(doneFace).toHaveText('Copied');
      await expect(doneFace.locator('[lang]')).toHaveCount(0);
      await expect(doneFace).toHaveAttribute('aria-hidden', 'true');
      await expect(copyFace).toHaveCSS('opacity', '0');
      // No check icon at any width, so the control is as wide as the design's "Copy".
      await expect(doneFace.locator('svg')).toHaveCount(0);
      expect((await box(button.locator('.fj-copy__chip'))).width).toBeCloseTo(
        (await box(copyFace)).width + 26,
        0,
      );
      const chip = button.locator('.fj-copy__chip');
      await expect(chip).toHaveCSS('color', await token(page, '--fjord-color-success'));
      await expect(chip).toHaveCSS('border-top-color', await token(page, '--fjord-color-success'));
      // The same name, the same box, the row untouched.
      await expect(button).toHaveAccessibleName('Copy');
      await expect(page.locator(SECTION).getByRole('button', { name: 'Copied' })).toHaveCount(0);
      expect(await place(button)).toEqual(before.button);
      expect(await place(address)).toEqual(before.address);
      // The Toast still confirms.
      await expect(page.getByRole('status').locator('.toast')).toContainText('Copied');

      // Back to "Copy" by itself.
      await expect(button).not.toHaveAttribute('data-done', { timeout: 5_000 });
      await expect(doneFace).toBeHidden();
      await expect(copyFace).toHaveCSS('opacity', '1');
      expect(await place(button)).toEqual(before.button);
    });
  }
});

test.describe('refused copy (AC-15)', () => {
  test('a rejected write shows the English message and never "Copied"', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    await page.goto('/');
    await page.locator(`${SECTION} [data-copy-email]`).click();
    const toast = page.getByRole('status').locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/select the address/i);
    await expect(toast).not.toContainText('Copied');
    await expect(toast).not.toHaveAttribute('data-icon', 'check');
    await expect(toast.locator('[lang="no"]')).toHaveCount(0);
    // No done state on the button either.
    const button = page.locator(`${SECTION} [data-copy-email]`);
    await expect(button).not.toHaveAttribute('data-done');
    await expect(button.locator('.fj-copy__face--done')).toBeHidden();
    await expect(button.locator('.fj-copy__face').first()).toHaveCSS('opacity', '1');
  });
});

test.describe('Save contact (AC-16)', () => {
  test('downloads the contact card with every field', async ({ page }) => {
    await page.goto('/');
    const link = page.locator(SECTION).getByRole('link', { name: 'Save contact (.vcf)' });
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    const path = await download.path();
    const card = await readFile(path, 'utf8');
    expect(card).toContain('FN:Alexander Ponomarenko');
    expect(card).toMatch(/^TITLE:Software Engineer\r?$/m);
    expect(card).toContain('+47 405 94 584');
    expect(card).toContain(EMAIL);
    expect(card).toContain('https://www.linkedin.com/in/ponomalex/');
    expect(card).toContain('https://github.com/ponomaleks');
    expect(card).toMatch(/^ADR[^:]*:.*Oslo.*Norway/m);
  });
});

test.describe('QR tile (AC-17)', () => {
  for (const theme of ['dag', 'natt'] as const) {
    test(`from 1024 the ${theme} tile is shown with its caption and hint`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 900 });
      await page.goto('/');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      const tile = page.locator(`${SECTION} .qr`);
      await tile.scrollIntoViewIfNeeded();
      await expect(tile).toBeVisible();
      await expect(tile.locator('[lang="no"]')).toHaveText('Skann meg');
      await expect(tile).toContainText('camera');
      const shown = tile.locator(`img[data-theme="${theme}"]`);
      const hidden = tile.locator(`img[data-theme="${theme === 'dag' ? 'natt' : 'dag'}"]`);
      await expect(shown).toBeVisible();
      await expect(hidden).toBeHidden();
      await expect(shown).toHaveAttribute('src', `/qr/qr-vcard-${theme}.svg`);
      expect(((await shown.getAttribute('alt')) ?? '').length).toBeGreaterThan(0);
      await expect
        .poll(() => shown.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
    });
  }

  // Page design (.fj-qr-figure, .x-qr): "Skann meg" is the figure's caption under the tile, in the
  // muted mono label style; the hint stands beside the figure, centred on it.
  for (const theme of ['dag', 'natt'] as const) {
    test(`${theme}: the caption is under the tile and the hint beside the figure`, async ({
      page,
    }) => {
      await openIn(page, theme, 1440);
      const tile = page.locator(`${SECTION} .qr`);
      await tile.scrollIntoViewIfNeeded();
      const image = await box(tile.locator(`img[data-theme="${theme}"]`));
      const figure = await box(tile.locator('figure'));
      const caption = tile.locator('figcaption');
      const captionBox = await box(caption);
      const hint = await box(tile.locator('.qr__hint'));
      expect(image.width).toBeCloseTo(132, 0);
      expect(captionBox.x).toBeCloseTo(image.x, 0);
      expect(captionBox.y).toBeCloseTo(image.y + image.height + 8, 0);
      expect(hint.x).toBeCloseTo(figure.x + figure.width + 20, 0);
      expect(
        Math.abs(hint.y + hint.height / 2 - (figure.y + figure.height / 2)),
      ).toBeLessThanOrEqual(1);
      await expect(caption).toHaveText('Skann meg');
      await expect(caption).toHaveAttribute('lang', 'no');
      await expect(caption).toHaveCSS('color', await token(page, '--fjord-color-text-muted'));
      await expect(caption).toHaveCSS('font-weight', '500');
      expect(await caption.evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
        'JetBrains Mono',
      );
      await expect(tile.locator('.qr__hint')).toHaveCSS(
        'color',
        await token(page, '--fjord-color-text-muted'),
      );
    });
  }

  test('below 1024 neither the tile nor the hint is shown', async ({ page }) => {
    await page.setViewportSize({ width: 1023, height: 900 });
    await page.goto('/');
    const tile = page.locator(`${SECTION} .qr`);
    await expect(tile).toBeHidden();
    await expect(page.getByText('camera')).toBeHidden();
    await expect(page.getByText('Skann meg')).toBeHidden();
  });
});
