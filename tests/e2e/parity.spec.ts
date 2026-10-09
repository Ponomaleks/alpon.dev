import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// One test per item in docs/stub-parity.md. `active` items must pass from scaffold on.
// `fixme` items wait for the feature spec that builds them; that spec flips them to `test`.
// Release gate: no `test.fixme` left in this file.

const noRedirect = { maxRedirects: 0 };

test.describe('routes and short links', () => {
  const cvPages = [
    ['P-01', '/cv'],
    ['P-02', '/cv/en'],
    ['P-03', '/cv/no'],
  ] as const;

  for (const [id, path] of cvPages) {
    test(`${id} ${path} answers 200 with the page itself, no redirect`, async ({ request }) => {
      const response = await request.get(path, noRedirect);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/html');
      expect(response.headers()['location']).toBeUndefined();
      expect(new URL(response.url()).pathname).toBe(path);
    });
  }

  const shortLinks = [
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
    for (const path of ['/cv', '/cv/en', '/cv/no']) {
      const page = await request.get(path);
      expect(page.headers()['cache-control'], path).toBe('public, max-age=0, must-revalidate');
    }
    for (const lang of ['en', 'no']) {
      for (const n of [1, 2]) {
        const image = await request.get(`/cv/cv-${lang}-${n}.webp`);
        expect(image.headers()['cache-control']).toContain('max-age=3600');
        expect(image.headers()['cache-control']).toContain('must-revalidate');
      }
    }
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
      // A link to another site ends its name with the new-tab hint (home D-09).
      const name = href.startsWith('https://') ? text + ' (opens in a new tab)' : text;
      const link = block.getByRole('link', { name, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toContainText(text);
      await expect(link).toHaveAttribute('href', href);
    }
    await expect(block.getByText('Oslo, Norge')).toBeVisible();
  });

  test('P-22 copy-email button copies and confirms "Copied"', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.locator('#contact [data-copy-email]').click();
    await expect(page.getByRole('status')).toContainText('Copied');
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

test.describe('CV pages (the stub viewer, reworded)', () => {
  const pdfName = { en: 'Alexander_Ponomarenko_CV_EN.pdf', no: 'Alexander_Ponomarenko_CV_NO.pdf' };

  test('P-30 EN / NO switch is two links, EN by default', async ({ page }) => {
    await page.goto('/cv');
    const group = page.locator('#main').getByRole('group', { name: 'CV language' });
    await expect(group.getByRole('link', { name: 'EN' })).toHaveAttribute('aria-current', 'true');
    const no = group.getByRole('link', { name: 'NO' });
    await expect(no).toHaveAttribute('href', '/cv/no');
    await expect(no).toHaveAttribute('lang', 'no');
    await no.click();
    await expect(page).toHaveURL(/\/cv\/no$/);
  });

  for (const [fragment, target] of [
    ['#cv', /\/cv\/en$/],
    ['#cv-no', /\/cv\/no$/],
  ] as const) {
    test(`P-31 /${fragment} hands over to the CV page`, async ({ page }) => {
      await page.goto(`/${fragment}`);
      await expect(page).toHaveURL(target);
    });
  }

  test('P-32 the CV page replaces the inline PDF viewer', async ({ page }) => {
    await page.goto('/cv/en');
    await expect(page.locator('iframe, embed, object')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  for (const lang of ['en', 'no'] as const) {
    test(`P-33 page images of the preview (${lang}) at every width`, async ({ page }) => {
      await page.goto(`/cv/${lang}`);
      const preview = page.locator('details.cv-preview');
      await expect(preview).not.toHaveAttribute('open', '');
      await preview.locator('summary').click();
      const images = preview.locator('img');
      await expect(images).toHaveCount(2);
      for (const n of [1, 2]) {
        await expect(images.nth(n - 1)).toHaveAttribute('src', `/cv/cv-${lang}-${n}.webp`);
      }
      const boxes = await Promise.all([0, 1].map((i) => images.nth(i).boundingBox()));
      expect(boxes[0] && boxes[1] && Math.abs(boxes[0].y - boxes[1].y) < 2).toBe(true);
    });

    test(`P-34 downloads, new-tab page images and meta line (${lang})`, async ({ page }) => {
      await page.goto(`/cv/${lang}`);
      const download = page.locator(`a[download="${pdfName[lang]}"]`).first();
      await expect(download).toHaveAttribute('href', `/cv/alexander-ponomarenko-cv-${lang}.pdf`);
      const preview = page.locator('details.cv-preview');
      await preview.locator('summary').click();
      for (const link of await preview.locator('a').all()) {
        await expect(link).toHaveAttribute('href', `/cv/alexander-ponomarenko-cv-${lang}.pdf`);
        await expect(link).toHaveAttribute('target', '_blank');
      }
      const meta =
        lang === 'en'
          ? /Last updated .* PDF · 2 pages · A4/
          : /Sist oppdatert .* PDF · 2 sider · A4/;
      await expect(page.locator('.cv-meta').first()).toHaveText(meta);
    });
  }
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
  test('P-51 Shell CV links reach the CV page', async ({ page }) => {
    await page.goto('/this-path-does-not-exist');
    const link = page.locator('header, .mobile-bar').getByRole('link', { name: /^(View )?CV$/ });
    await link.locator('visible=true').first().click();
    await expect(page).toHaveURL(/\/cv\/en$/);
  });
});

test.describe('parity ledger', () => {
  const ledger = readFileSync('docs/stub-parity.md', 'utf8');
  const rows = [...ledger.matchAll(/^\| (P-\d+) \|.*\| (\w+)[^|]*\|$/gm)].map((m) => ({
    id: m[1],
    status: m[2],
  }));
  const spec = readFileSync('tests/e2e/parity.spec.ts', 'utf8');

  test('no parity item is left as fixme in the ledger or in the spec', () => {
    expect(rows.filter((r) => r.status === 'fixme').map((r) => r.id)).toEqual([]);
    expect(spec).not.toMatch(/test\.fixme\(/);
  });

  test('every ledger id has a test in the spec, and the set is the one before the CV feature', () => {
    const ids = rows.map((r) => r.id);
    expect(ids).toHaveLength(new Set(ids).size);
    for (const id of ids) expect(spec, id).toContain(id);
    const expected = [
      'P-01',
      'P-02',
      'P-03',
      'P-04',
      'P-05',
      'P-10',
      'P-11',
      'P-12',
      'P-13',
      'P-14',
      'P-15',
      'P-16',
      'P-20',
      'P-21',
      'P-22',
      'P-23',
      'P-24',
      'P-25',
      'P-26',
      'P-30',
      'P-31',
      'P-32',
      'P-33',
      'P-34',
      'P-40',
      'P-41',
      'P-50',
      'P-51',
    ];
    expect(ids).toEqual(expected);
  });
});
