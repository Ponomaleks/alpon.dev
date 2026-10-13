import { expect, test, type Page } from '../fixtures';

// The Original PDF preview (AC-09, AC-10; screens SCR-05 / SCR-06, C-3, C-8): no page image
// requested before it opens, two named links, the open state, a blocked image that keeps the link,
// the name and the box, and the same with scripts off.

const cases = [
  {
    path: '/cv/en',
    summary: 'View original PDF',
    names: [
      'CV page 1 of 2, English, PDF, opens in a new tab',
      'CV page 2 of 2, English, PDF, opens in a new tab',
    ],
    href: '/cv/alexander-ponomarenko-cv-en.pdf',
    images: ['/cv/cv-en-1.webp', '/cv/cv-en-2.webp'],
  },
  {
    path: '/cv/no',
    summary: 'Se original-PDF',
    names: [
      'CV, side 1 av 2, norsk, PDF, åpnes i ny fane',
      'CV, side 2 av 2, norsk, PDF, åpnes i ny fane',
    ],
    href: '/cv/alexander-ponomarenko-cv-no.pdf',
    images: ['/cv/cv-no-1.webp', '/cv/cv-no-2.webp'],
  },
] as const;

const isImage = (url: URL) => /\/cv\/cv-(en|no)-\d\.webp$/.test(url.pathname);

function logImages(page: Page) {
  const log: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (isImage(url)) log.push(url.pathname);
  });
  return log;
}

for (const c of cases) {
  test.describe(c.path, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('0 page-image requests before opening, then two named links (AC-09)', async ({ page }) => {
      const log = logImages(page);
      await page.goto(c.path, { waitUntil: 'networkidle' });
      expect(log).toEqual([]);
      const details = page.locator('.cv-preview');
      await expect(details).not.toHaveAttribute('open', '');
      const summary = details.locator('summary');
      await expect(summary).toContainText(c.summary);
      await summary.click();
      await expect(details).toHaveAttribute('open', '');
      for (const [i, name] of c.names.entries()) {
        const link = page.getByRole('link', { name, exact: true });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', c.href);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link.locator('img')).toHaveAttribute('src', c.images[i]);
      }
      await expect.poll(() => [...new Set(log)].sort()).toEqual([...c.images].sort());
      await summary.click();
      await expect(details).not.toHaveAttribute('open', '');
    });

    // Readable, not thumbnails (Owner, 2026-10-10; spec D-11): one page under the other, each as
    // wide as the content, at every width.
    test('the two pages sit one under the other, each as wide as the content (AC-09)', async ({
      page,
    }) => {
      for (const width of [390, 834, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(c.path);
        await page.locator('.cv-preview summary').click();
        const [a, b] = await page
          .locator('.cv-preview__page')
          .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
        const content = await page
          .locator('.cv-page__preview')
          .evaluate((el) => el.getBoundingClientRect().width);
        expect(b.top).toBeGreaterThanOrEqual(a.bottom - 1);
        expect(Math.abs(a.left - b.left)).toBeLessThan(1);
        for (const box of [a, b]) {
          expect(Math.abs(box.width - content)).toBeLessThanOrEqual(1);
          expect(box.height / box.width).toBeCloseTo(297 / 210, 1);
        }
        // A page of 1240 px drawn at 700 px or more can be read; on a phone it takes the screen.
        if (width >= 834) expect(a.width).toBeGreaterThanOrEqual(700);
      }
    });

    test('a blocked image keeps the link, the name and the box (AC-10)', async ({ page }) => {
      await page.route(isImage, (route) => route.abort());
      await page.goto(c.path);
      await page.locator('.cv-preview summary').click();
      for (const name of c.names) {
        const link = page.getByRole('link', { name, exact: true });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', c.href);
      }
      await expect
        .poll(() =>
          page
            .locator('.cv-preview img')
            .evaluateAll((imgs) =>
              (imgs as HTMLImageElement[]).every((i) => i.complete && i.naturalWidth === 0),
            ),
        )
        .toBe(true);
      const box = await page.locator('.cv-preview__page').first().boundingBox();
      if (!box) throw new Error('the page link has no box');
      expect(box.width).toBeGreaterThan(100);
      // The reserved ratio of an A4 page.
      expect(box.height / box.width).toBeCloseTo(297 / 210, 1);
      await expect(
        page.locator('.cv-preview embed, .cv-preview object, .cv-preview iframe'),
      ).toHaveCount(0);
    });

    test('the box is the same size with the image blocked and loaded (AC-10)', async ({
      page,
      browser,
    }) => {
      await page.goto(c.path);
      await page.locator('.cv-preview summary').click();
      await expect
        .poll(() =>
          page
            .locator('.cv-preview img')
            .first()
            .evaluate((i) => (i as HTMLImageElement).complete),
        )
        .toBe(true);
      const loaded = await page.locator('.cv-preview__page').first().boundingBox();
      const blockedPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await blockedPage.route(isImage, (route) => route.abort());
      await blockedPage.goto(new URL(c.path, page.url()).toString());
      await blockedPage.locator('.cv-preview summary').click();
      const blocked = await blockedPage.locator('.cv-preview__page').first().boundingBox();
      await blockedPage.close();
      if (!blocked || !loaded) throw new Error('the page link has no box');
      expect(Math.round(blocked.width)).toBe(Math.round(loaded.width));
      expect(Math.round(blocked.height)).toBe(Math.round(loaded.height));
    });

    test.describe('scripts off', () => {
      test.use({ javaScriptEnabled: false });
      test('opens with two named links; a blocked image keeps them (AC-09, AC-10)', async ({
        page,
      }) => {
        await page.route(isImage, (route) => route.abort());
        await page.goto(c.path);
        const details = page.locator('.cv-preview');
        await details.locator('summary').click();
        await expect(details).toHaveAttribute('open', '');
        for (const name of c.names) {
          const link = page.getByRole('link', { name, exact: true });
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href', c.href);
        }
        await expect(
          page.locator('.cv-preview embed, .cv-preview iframe, .cv-preview object'),
        ).toHaveCount(0);
      });
    });
  });
}
