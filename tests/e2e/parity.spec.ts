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
    const font = await request.get('/fonts/schibsted-grotesk-400.woff2');
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
  test.fixme('P-20 shows name and role', async () => {});
  test.fixme('P-21 contact data is visible and linked', async () => {});
  test.fixme('P-22 copy-email button copies and confirms "Kopiert"', async () => {});
  test.fixme('P-23 "Save contact" downloads the vCard', async () => {});
  test.fixme('P-24 head meta, Open Graph and JSON-LD Person', async () => {});
  test.fixme('P-25 skip link is the first focusable element', async () => {});
  test('P-26 Schibsted Grotesk 400 and 600 are preloaded', async ({ page }) => {
    await page.goto('/');
    const preloads = page.locator('link[rel="preload"][as="font"][type="font/woff2"][crossorigin]');
    await expect(preloads).toHaveCount(2);
    expect(await preloads.evaluateAll((links) => links.map((l) => l.getAttribute('href')))).toEqual(
      ['/fonts/schibsted-grotesk-400.woff2', '/fonts/schibsted-grotesk-600.woff2'],
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
