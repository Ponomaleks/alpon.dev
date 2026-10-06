import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

// The Contact block end to end (home T21): AC-13 rows and links, AC-14 copy, AC-15 refused copy,
// AC-16 the contact card download, AC-17 the QR tile. Reduced motion is emulated so nothing moves.
test.use({ reducedMotion: 'reduce' });

const EMAIL = 'ponomaleks@gmail.com';
const SECTION = '#contact';

test.describe('rows and links (AC-13)', () => {
  test('the heading, the lead and the five rows', async ({ page }) => {
    await page.goto('/');
    const block = page.locator(SECTION);
    await expect(block.getByRole('heading', { name: 'Get in touch' })).toBeVisible();
    await expect(block.getByText('Email is fastest. Phone and LinkedIn work too.')).toBeVisible();
    const labels = await block.locator('dt').allTextContents();
    expect(labels).toEqual(['Email', 'Phone', 'LinkedIn', 'GitHub', 'Based in']);
  });

  test('every link opens in the same tab with the right target', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator(`${SECTION} .contact__row`);
    const links = [
      [0, `mailto:${EMAIL}`, EMAIL],
      [1, 'tel:+4740594584', '+47 405 94 584'],
      [2, 'https://www.linkedin.com/in/ponomalex/', 'linkedin.com/in/ponomalex'],
      [3, 'https://github.com/ponomaleks', 'github.com/ponomaleks'],
    ] as const;
    for (const [index, href, text] of links) {
      const link = rows.nth(index).getByRole('link');
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveText(text);
      expect(await link.getAttribute('target')).toBeNull();
    }
  });

  test('"Based in" shows Oslo, Norge marked as Norwegian', async ({ page }) => {
    await page.goto('/');
    const based = page.locator(`${SECTION} .contact__row`).nth(4);
    await expect(based.locator('[lang="no"]')).toHaveText('Oslo, Norge');
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
    await expect(toast.locator('[lang="no"]')).toHaveText('Kopiert');
    await expect(toast).toContainText(EMAIL);
    await expect(toast).toHaveAttribute('data-icon', 'check');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
    // It leaves by itself.
    await expect(toast).toHaveCount(0, { timeout: 10_000 });
  });
});

test.describe('refused copy (AC-15)', () => {
  test('a rejected write shows the English message and never "Kopiert"', async ({ page }) => {
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
    await expect(toast).not.toContainText('Kopiert');
    await expect(toast).not.toHaveAttribute('data-icon', 'check');
    await expect(toast.locator('[lang="no"]')).toHaveCount(0);
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

  test('below 1024 neither the tile nor the hint is shown', async ({ page }) => {
    await page.setViewportSize({ width: 1023, height: 900 });
    await page.goto('/');
    const tile = page.locator(`${SECTION} .qr`);
    await expect(tile).toBeHidden();
    await expect(page.getByText('camera')).toBeHidden();
    await expect(page.getByText('Skann meg')).toBeHidden();
  });
});
