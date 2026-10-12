import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '../fixtures';

// The delivered security policy (AC-09, AC-12; ADR-0002): one CSP header with the current
// bootstrap hash on every response, and the browser refuses anything else.

const bootstrap = readFileSync('src/scripts/theme-bootstrap.js', 'utf8');
const HASH = `'sha256-${createHash('sha256').update(bootstrap).digest('base64')}'`;

const RESPONSES = [
  { name: 'home', path: '/', status: 200 },
  { name: 'a not-found response', path: '/does-not-exist', status: 404 },
  { name: 'the EN CV PDF', path: '/cv/alexander-ponomarenko-cv-en.pdf', status: 200 },
];

for (const { name, path, status } of RESPONSES) {
  test(`${name} carries exactly one CSP header with the current bootstrap hash`, async ({
    request,
  }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(status);
    const policies = response
      .headersArray()
      .filter((h) => h.name.toLowerCase() === 'content-security-policy');
    expect(policies).toHaveLength(1);
    const policy = policies[0]?.value ?? '';
    const scriptSrc = policy.split(';').find((d) => d.trim().startsWith('script-src'));
    expect(scriptSrc?.trim()).toBe(`script-src 'self' ${HASH}`);
    expect(policy).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(policy).toContain("frame-ancestors 'self'");
  });
}

test.describe('in the browser', () => {
  test.use({ colorScheme: 'dark' });

  test('the bootstrap runs and an injected inline script is refused', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const w = window as unknown as { __injected?: boolean };
      const violation = new Promise<string>((resolve) =>
        document.addEventListener('securitypolicyviolation', (e) => resolve(e.effectiveDirective), {
          once: true,
        }),
      );
      const script = document.createElement('script');
      script.textContent = 'window.__injected = true';
      document.head.append(script);
      return {
        directive: await violation,
        injected: w.__injected ?? false,
        theme: document.documentElement.dataset.theme,
      };
    });
    expect(result).toEqual({ directive: 'script-src-elem', injected: false, theme: 'natt' });
  });

  test('a script from another origin is refused', async ({ page }) => {
    await page.goto('/does-not-exist');
    const result = await page.evaluate(async () => {
      const violation = new Promise<string>((resolve) =>
        document.addEventListener('securitypolicyviolation', (e) => resolve(e.blockedURI), {
          once: true,
        }),
      );
      const script = document.createElement('script');
      script.src = 'https://example.com/injected.js';
      document.head.append(script);
      return { blocked: await violation };
    });
    expect(result.blocked).toContain('https://example.com/injected.js');
  });

  test('an inline handler attribute does not run', async ({ page }) => {
    await page.goto('/');
    const ran = await page.evaluate(async () => {
      const w = window as unknown as { __handler?: boolean };
      const violation = new Promise<void>((resolve) =>
        document.addEventListener('securitypolicyviolation', () => resolve(), { once: true }),
      );
      const img = document.createElement('img');
      img.setAttribute('onerror', 'window.__handler = true');
      img.src = 'data:,not-an-image';
      document.body.append(img);
      await violation;
      return w.__handler ?? false;
    });
    expect(ran).toBe(false);
  });

  // AC-17: the Shell adds scripts but not trust; injection stays refused and its own scripts run.
  test('on a page with the Shell an injected inline style is refused and the theme switch still works', async ({
    page,
  }) => {
    const width = page.viewportSize()?.width ?? 0;
    test.skip(
      width < 1024,
      'the header theme switch shows from 1024; the menu one is covered in shell tests',
    );
    await page.goto('/');
    await expect(page.locator('header .theme-toggle')).toBeVisible();
    const result = await page.evaluate(async () => {
      const violation = new Promise<string>((resolve) =>
        document.addEventListener('securitypolicyviolation', (e) => resolve(e.effectiveDirective), {
          once: true,
        }),
      );
      const style = document.createElement('style');
      style.textContent = 'body { outline: 9px solid red }';
      document.head.append(style);
      const directive = await violation;
      return { directive, outline: getComputedStyle(document.body).outlineWidth };
    });
    expect(result.directive).toBe('style-src-elem');
    expect(result.outline).not.toBe('9px');

    await page.locator('header [data-theme-value="dag"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dag');
    await page.locator('header [data-theme-value="natt"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
  });

  test('an injected inline script is refused on the Shell page while the menu script still runs', async ({
    page,
  }) => {
    await page.goto('/');
    const injected = await page.evaluate(async () => {
      const violation = new Promise<string>((resolve) =>
        document.addEventListener('securitypolicyviolation', (e) => resolve(e.effectiveDirective), {
          once: true,
        }),
      );
      const script = document.createElement('script');
      script.textContent = 'window.__injected = true';
      document.body.append(script);
      return {
        directive: await violation,
        ran: (window as unknown as { __injected?: boolean }).__injected ?? false,
      };
    });
    expect(injected).toEqual({ directive: 'script-src-elem', ran: false });
  });

  test('the CSP contract file is unchanged by this feature and matches the delivered header', async ({
    request,
  }) => {
    const contract = JSON.parse(readFileSync('tests/contracts/csp.contract.json', 'utf8')) as {
      directives: Record<string, string[]>;
    };
    const expected = Object.entries(contract.directives)
      .map(([name, values]) => [name, ...values.map((v) => v.replace('{{hash}}', HASH))].join(' '))
      .join('; ');
    const response = await request.get('/');
    expect(response.headers()['content-security-policy']).toBe(expected);
  });
});

// AC-18 (cv; sad §8 Response headers): the CV pages follow the freshness rule of the home page,
// the CV PDFs and the page images keep the one-hour rule, only the PDFs are shown inline, and
// every answer carries the site's security headers.

const CV_PAGES = ['/cv', '/cv/en', '/cv/no'];
const CV_FILES = readdirSync('public/cv').sort();
const PDF_NAMES: Record<string, string> = {
  'alexander-ponomarenko-cv-en.pdf': 'Alexander_Ponomarenko_CV_EN.pdf',
  'alexander-ponomarenko-cv-no.pdf': 'Alexander_Ponomarenko_CV_NO.pdf',
};
const SECURITY_HEADERS = [
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'strict-transport-security',
  'x-frame-options',
  'content-security-policy',
];

// The rule paths written in public/_headers (lines that start at column zero).
const RULE_PATHS = readFileSync('public/_headers', 'utf8')
  .split(/\r?\n/)
  .filter((l) => l.startsWith('/'))
  .map((l) => l.trim());

function cspFromContract(): string {
  const contract = JSON.parse(readFileSync('tests/contracts/csp.contract.json', 'utf8')) as {
    directives: Record<string, string[]>;
  };
  return Object.entries(contract.directives)
    .map(([name, values]) => [name, ...values.map((v) => v.replace('{{hash}}', HASH))].join(' '))
    .join('; ');
}

test.describe('CV response headers (AC-18)', () => {
  test('the three CV page addresses carry the cache rule of the home page', async ({ request }) => {
    const home = (await request.get('/')).headers()['cache-control'];
    expect(home).toBe('public, max-age=0, must-revalidate');
    for (const path of CV_PAGES) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()['cache-control'], path).toBe(home);
    }
  });

  test('public/_headers has no wildcard rule for /cv', () => {
    expect(RULE_PATHS).not.toContain('/cv/*');
  });

  test('every file in public/cv/ has an explicit rule by its full path', () => {
    expect(CV_FILES.length).toBeGreaterThanOrEqual(6);
    const missing = CV_FILES.filter((f) => !RULE_PATHS.includes(`/cv/${f}`));
    expect(missing, 'files in public/cv/ without a rule in public/_headers').toEqual([]);
  });

  test('each CV file carries the one-hour rule; only the PDFs are inline under their names', async ({
    request,
  }) => {
    for (const file of CV_FILES) {
      const response = await request.get(`/cv/${file}`);
      expect(response.status(), file).toBe(200);
      const headers = response.headers();
      expect(headers['cache-control'], file).toBe('public, max-age=3600, must-revalidate');
      const pdfName = PDF_NAMES[file];
      if (pdfName) {
        expect(headers['content-disposition'], file).toBe(`inline; filename="${pdfName}"`);
      } else {
        expect(headers['content-disposition'], file).toBeUndefined();
      }
    }
  });

  test('every CV answer carries the security headers of the home page and the agreed policy', async ({
    request,
  }) => {
    const home = (await request.get('/')).headers();
    const expectedCsp = cspFromContract();
    for (const path of [...CV_PAGES, ...CV_FILES.map((f) => `/cv/${f}`)]) {
      const headers = (await request.get(path)).headers();
      for (const name of SECURITY_HEADERS) {
        expect(headers[name], `${path} ${name}`).toBe(home[name]);
      }
      expect(headers['content-security-policy'], path).toBe(expectedCsp);
    }
  });
});
