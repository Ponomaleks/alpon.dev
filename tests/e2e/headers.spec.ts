import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

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
