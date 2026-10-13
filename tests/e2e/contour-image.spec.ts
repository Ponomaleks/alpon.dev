import { contourImagesShown, expect, test, type Page } from '../fixtures';

// release-1 AC-06, D-10: the contours of the closing band and of the mobile menu are one image
// file. A load of the home page does not ask for it; it is asked for when the Visitor scrolls
// towards the closing band or opens the mobile menu.

const IMAGE = '/img/contours-ridge-spruce.svg';

/** The addresses of the contour image the page has asked for so far. */
function watchImage(page: Page): string[] {
  const asked: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === IMAGE) asked.push(request.url());
  });
  return asked;
}

const shown = (page: Page, scope: string) =>
  page
    .locator(`${scope} img.contours__image`)
    .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);

test.describe('the contour image is asked for only when it is needed (AC-06)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a load of the home page asks for no contour image; scrolling to the closing band does', async ({
    page,
  }) => {
    const asked = watchImage(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('main .hero .contours svg')).toBeVisible();
    expect(asked).toEqual([]);

    const band = page.locator('.fj-band');
    await band.scrollIntoViewIfNeeded();
    await expect.poll(() => asked.length).toBe(1);
    await expect.poll(() => shown(page, '.fj-band')).toBe(true);

    // The image fills the contour layer of the band, as the inline rings did.
    const layer = await band.locator('.contours').boundingBox();
    const image = await band.locator('img.contours__image').boundingBox();
    const bandBox = await band.boundingBox();
    expect(layer).toEqual(bandBox);
    expect(image).toEqual(layer);
  });

  test('opening the mobile menu asks for the contour image', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const asked = watchImage(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(asked).toEqual([]);

    await page.locator('[aria-controls="mobile-menu"]').click();
    const menu = page.locator('dialog#mobile-menu');
    await expect(menu).toBeVisible();
    await expect.poll(() => asked.length).toBe(1);
    await expect.poll(() => shown(page, 'dialog#mobile-menu')).toBe(true);
  });

  test('the helper of the visual tests loads every contour image without scrolling', async ({
    page,
  }) => {
    const asked = watchImage(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(asked).toEqual([]);
    await contourImagesShown(page);
    const images = await page
      .locator('img.contours__image')
      .evaluateAll((all: HTMLImageElement[]) =>
        all.map((img) => img.complete && img.naturalWidth > 0),
      );
    // The band's and the menu's (the closed dialog is not rendered, the image still loads).
    expect(images).toEqual([true, true]);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('the image is served as SVG with the cache rule of /img/', async ({ request }) => {
    const response = await request.get(IMAGE);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/svg+xml');
    expect(response.headers()['cache-control']).toBe('public, max-age=604800');
  });

  // The colour of the rings is held by tools/contour-image.test.ts and the visual baselines.
  for (const theme of ['dag', 'natt'] as const) {
    test(`the lazy image has no filter, opacity or blend mode in ${theme}: it does not follow the theme`, async ({
      page,
    }) => {
      await page.addInitScript((t) => localStorage.setItem('fjord-theme', t), theme);
      await page.goto('/');
      const band = page.locator('.fj-band');
      await band.scrollIntoViewIfNeeded();
      await expect.poll(() => shown(page, '.fj-band')).toBe(true);
      const look = await band.locator('img.contours__image').evaluate((img) => {
        const style = getComputedStyle(img);
        return { filter: style.filter, opacity: style.opacity, blend: style.mixBlendMode };
      });
      expect(look).toEqual({ filter: 'none', opacity: '1', blend: 'normal' });
    });
  }
});
