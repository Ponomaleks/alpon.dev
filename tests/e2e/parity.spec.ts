import { expect, test } from '@playwright/test';

// One test per item in docs/stub-parity.md. `active` items must pass from scaffold on.
// `fixme` items wait for the feature spec that builds them; that spec flips them to `test`.
// Release gate: no `test.fixme` left in this file.

const noRedirect = { maxRedirects: 0 };

test.describe('routes and short links', () => {
  const shortLinks = [
    ['P-01', '/cv', '/cv/alexander-ponomarenko-cv-en.pdf'],
    ['P-02', '/cv/en', '/cv/alexander-ponomarenko-cv-en.pdf'],
    ['P-03', '/cv/no', '/cv/alexander-ponomarenko-cv-no.pdf'],
    ['P-04', '/linkedin', 'https://www.linkedin.com/in/ponomalex/'],
    ['P-05', '/github', 'https://github.com/ponomaleks'],
  ] as const;

  for (const [id, from, to] of shortLinks) {
    test(`${id} ${from} redirects 302 to ${to}`, async ({ request }) => {
      const response = await request.get(from, noRedirect);
      expect(response.status()).toBe(302);
      expect(response.headers()['location']).toBe(to);
    });
  }
});

test.describe('static files and headers', () => {
  for (const lang of ['en', 'no'] as const) {
    test(`P-10 CV PDF (${lang}) is served inline with a readable filename`, async ({ request }) => {
      const response = await request.get(`/cv/alexander-ponomarenko-cv-${lang}.pdf`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/pdf');
      expect(response.headers()['content-disposition']).toBe(
        `inline; filename="Alexander_Ponomarenko_CV_${lang.toUpperCase()}.pdf"`,
      );
    });
  }

  test('P-11 vCard is served as a text/vcard attachment', async ({ request }) => {
    const response = await request.get('/alexander-ponomarenko.vcf');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('text/vcard; charset=utf-8');
    expect(response.headers()['content-disposition']).toBe(
      'attachment; filename="Alexander Ponomarenko.vcf"',
    );
  });

  test('P-12 og.png is served at 1200x630', async ({ request }) => {
    const response = await request.get('/og.png');
    expect(response.status()).toBe(200);
    const png = await response.body();
    // PNG IHDR: width and height are big-endian uint32 at bytes 16 and 20.
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  });

  for (const path of ['/favicon.svg', '/apple-touch-icon.png', '/robots.txt', '/sitemap.xml']) {
    test(`P-13 ${path} is served`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
    });
  }

  test('P-14 responses carry the security headers', async ({ request }) => {
    for (const path of ['/', '/og.png']) {
      const headers = (await request.get(path)).headers();
      expect(headers['x-content-type-options'], path).toBe('nosniff');
      expect(headers['referrer-policy'], path).toBeTruthy();
      expect(headers['permissions-policy'], path).toBeTruthy();
      expect(headers['strict-transport-security'], path).toContain('max-age=');
    }
  });

  test('P-15 fonts are immutable, CV files revalidate hourly', async ({ request }) => {
    const font = await request.get('/fonts/schibsted-grotesk-wght.woff2');
    expect(font.headers()['cache-control']).toContain('immutable');
    const cv = await request.get('/cv/alexander-ponomarenko-cv-en.pdf');
    expect(cv.headers()['cache-control']).toContain('max-age=3600');
    expect(cv.headers()['cache-control']).toContain('must-revalidate');
  });

  test("P-16 home CSP: script-src 'self' plus a hash, no 'unsafe-inline'", async ({ request }) => {
    const policy = (await request.get('/')).headers()['content-security-policy'] ?? '';
    const scriptSrc = policy.split(';').find((d) => d.trim().startsWith('script-src'));
    expect(scriptSrc?.trim()).toMatch(/^script-src 'self' 'sha256-[A-Za-z0-9+/]+={0,2}'$/);
    expect(policy).not.toContain("'unsafe-inline'");
  });
});

test.describe('home page', () => {
  test('P-20 shows name and role', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alexander Ponomarenko');
    const hero = page.locator('main .hero');
    await expect(hero).toContainText('Software Engineer');
    await expect(hero).toContainText('Full Stack Developer');
  });

  test('P-21 contact data is visible and linked', async ({ page }) => {
    await page.goto('/');
    const block = page.locator('#contact');
    const links = [
      ['+47 405 94 584', 'tel:+4740594584'],
      ['ponomaleks@gmail.com', 'mailto:ponomaleks@gmail.com'],
      ['linkedin.com/in/ponomalex', 'https://www.linkedin.com/in/ponomalex/'],
      ['github.com/ponomaleks', 'https://github.com/ponomaleks'],
    ] as const;
    for (const [text, href] of links) {
      const link = block.getByRole('link', { name: text, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    }
    await expect(block.getByText('Oslo, Norge')).toBeVisible();
  });

  test('P-22 copy-email button copies and confirms "Kopiert"', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.locator('#contact [data-copy-email]').click();
    await expect(page.getByRole('status')).toContainText('Kopiert');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('ponomaleks@gmail.com');
  });

  test('P-23 "Save contact" downloads the vCard', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#contact').getByRole('link', { name: 'Save contact (.vcf)' });
    await expect(link).toHaveAttribute('href', '/alexander-ponomarenko.vcf');
    await expect(link).toHaveAttribute('download', /.*/);
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    expect(download.suggestedFilename()).toMatch(/\.vcf$/);
  });

  test('P-24 head meta, Open Graph and JSON-LD Person', async ({ page }) => {
    await page.goto('/');
    const meta = (selector: string) => page.locator(selector).getAttribute('content');
    await expect(page).toHaveTitle(/Alexander Ponomarenko/);
    expect(await meta('meta[name="description"]')).toBeTruthy();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://alpon.dev/',
    );
    expect(await meta('meta[property="og:title"]')).toBeTruthy();
    expect(await meta('meta[property="og:description"]')).toBeTruthy();
    expect(await meta('meta[property="og:url"]')).toBe('https://alpon.dev/');
    expect(await meta('meta[property="og:image"]')).toBe('https://alpon.dev/og.png');
    expect(await meta('meta[property="og:image:width"]')).toBe('1200');
    expect(await meta('meta[property="og:image:height"]')).toBe('630');
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const person = JSON.parse(raw ?? '{}');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Alexander Ponomarenko');
    expect(person.jobTitle).toBe('Software Engineer');
    expect(person.email).toBe('ponomaleks@gmail.com');
    expect(person.telephone).toBe('+47 405 94 584');
    expect(person.address.addressLocality).toBe('Oslo');
    expect(person.address.addressCountry).toBe('NO');
    expect(person.sameAs).toEqual([
      'https://www.linkedin.com/in/ponomalex/',
      'https://github.com/ponomaleks',
    ]);
  });
  test('P-25 skip link is the first focusable element', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  });
  test('P-26 the two brand font files are preloaded', async ({ page }) => {
    await page.goto('/');
    const preloads = page.locator('link[rel="preload"][as="font"][type="font/woff2"][crossorigin]');
    await expect(preloads).toHaveCount(2);
    expect(await preloads.evaluateAll((links) => links.map((l) => l.getAttribute('href')))).toEqual(
      ['/fonts/schibsted-grotesk-wght.woff2', '/fonts/jetbrains-mono-wght.woff2'],
    );
  });
});

test.describe('CV viewer', () => {
  test.fixme('P-30 EN / NO switch, EN by default', async () => {});
  test.fixme('P-31 #cv-no deep link and replaceState hash updates', async () => {});
  test.fixme('P-32 inline PDF on desktop with a built-in viewer', async () => {});
  test.fixme('P-33 page images on narrow screens or without a PDF viewer', async () => {});
  test.fixme('P-34 "Open PDF" and "Download" follow the selected language', async () => {});
});

test.describe('404', () => {
  test('P-40 unknown path returns 404', async ({ request }) => {
    const response = await request.get('/this-path-does-not-exist');
    expect(response.status()).toBe(404);
  });

  test('P-41 404 page shows "404 / Ikke funnet", noindex, link to /', async ({ page }) => {
    const response = await page.goto('/this-path-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('404 / Ikke funnet')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });
});

test.describe('Not in the stub: Shell links', () => {
  test('P-50 Shell contact links (header, menu) reach the contact place', async ({ page }) => {
    await page.goto('/this-path-does-not-exist');
    await page.locator('header').getByRole('link', { name: 'Get in touch' }).click();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(
      page.locator('#contact').getByRole('heading', { name: 'Get in touch' }),
    ).toBeInViewport();
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? '')).toBe('contact');
  });
  test.fixme('P-51 Shell CV links reach the CV page', async () => {});
});
