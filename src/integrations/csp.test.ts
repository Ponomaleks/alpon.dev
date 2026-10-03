import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { applyCsp, CspError, HASH_PLACEHOLDER, type BuiltPage } from './csp.ts';

// ADR-0002: the build audits every page's inline code and writes the bootstrap hash into the one
// /* CSP line, failing closed on anything unexpected (AC-09, AC-12).

const BOOTSTRAP = "var t;document.documentElement.dataset.theme='dag'";
const hash = (source: string) => `'sha256-${createHash('sha256').update(source).digest('base64')}'`;

const POLICY = `default-src 'self'; script-src 'self' ${HASH_PLACEHOLDER}; style-src 'self'; frame-ancestors 'self'`;
const HEADERS = `/*
  X-Content-Type-Options: nosniff
  Content-Security-Policy: ${POLICY}

/
  Cache-Control: public, max-age=0, must-revalidate
`;

const page = (body: string, name = 'index.html'): BuiltPage => ({
  name,
  html: `<!doctype html><html lang="en"><head><script>${BOOTSTRAP}</script></head><body>${body}</body></html>`,
});
const run = (pages: BuiltPage[], headers = HEADERS, bootstrap = BOOTSTRAP) =>
  applyCsp({ pages, headers, bootstrap });

describe('applyCsp', () => {
  it('substitutes the bootstrap hash into the single policy line', () => {
    const out = run([page('<main></main>')]);
    expect(out).toContain(`script-src 'self' ${hash(BOOTSTRAP)};`);
    expect(out).not.toContain(HASH_PLACEHOLDER);
    expect(out.match(/Content-Security-Policy:/g)).toHaveLength(1);
  });

  it('a changed bootstrap yields a different hash with no other edit', () => {
    const changed = BOOTSTRAP.replace("'dag'", "'natt'");
    const out = run(
      [{ name: 'index.html', html: `<script>${changed}</script>` }],
      HEADERS,
      changed,
    );
    expect(out).toContain(hash(changed));
    expect(out).not.toContain(hash(BOOTSTRAP));
  });

  it.each(['application/ld+json', 'Application/LD+JSON', ' application/ld+json '])(
    'allows a structured-data block with type "%s"',
    (type) => {
      expect(() => run([page(`<script type="${type}">{"@type":"Person"}</script>`)])).not.toThrow();
    },
  );

  it.each([
    ['no type', '<script>{"@type":"Person"}</script>'],
    ['text/javascript', '<script type="text/javascript">{"@type":"Person"}</script>'],
    ['module', '<script type="module">alert(1)</script>'],
    ['a second bootstrap copy', `<script>${BOOTSTRAP}</script>`],
  ])('fails on an inline script with %s, naming the page', (_, script) => {
    expect(() => run([page(script, 'cv/en.html')])).toThrow(CspError);
    expect(() => run([page(script, 'cv/en.html')])).toThrow(/cv\/en\.html.*inline script/);
  });

  it('allows external same-origin scripts', () => {
    expect(() =>
      run([page('<script type="module" src="/_astro/island.js"></script>')]),
    ).not.toThrow();
  });

  it.each([
    ['an HTML script', '<script src="/_astro/a.js"> </script>'],
    ['an SVG script with href', '<svg><script href="/_astro/a.js"></script></svg>'],
    ['an SVG script with xlink:href', '<svg><script xlink:href="/_astro/a.js"></script></svg>'],
  ])('allows an external %s with an empty body', (_, script) => {
    expect(() => run([page(script)])).not.toThrow();
  });

  it.each([
    ['an inline <style> element', '<style>p{color:red}</style>', /<style>/],
    ['a style attribute', '<p style="color:red">x</p>', /style attribute/],
    ['an onclick handler', '<button onclick="go()">x</button>', /onclick/],
    ['an SVG <style>', '<svg><style>.a{}</style></svg>', /<style>/],
  ])('fails on %s, naming the page', (_, body, reason) => {
    expect(() => run([page(body, '404.html')])).toThrow(/404\.html/);
    expect(() => run([page(body, '404.html')])).toThrow(reason);
  });

  // Review 2026-10-02 F-06: attribute look-alikes and a '>' in a value must not hide anything.
  it.each([
    ['data-src= on an inline script', '<script data-src="x">alert(1)</script>', /inline script/],
    [
      'data-type="application/ld+json" on an inline script',
      '<script data-type="application/ld+json">alert(1)</script>',
      /inline script/,
    ],
    [
      "a '>' in an attribute value before onclick=",
      '<a title="a>b" onclick="x()">x</a>',
      /onclick handler/,
    ],
    [
      "a '>' in an attribute value before style=",
      '<div data-x="1>0" style="color:red">x</div>',
      /style attribute/,
    ],
    [
      'a handler inside <template>',
      '<template><b onmouseover="x()">x</b></template>',
      /onmouseover/,
    ],
    // Review 2026-10-02-2 S2-02: the script branch must not skip the handler and style checks.
    [
      'onload= on an ld+json data block',
      '<script type="application/ld+json" onload="x()">{}</script>',
      /onload handler/,
    ],
    [
      'onerror= on the (only) bootstrap copy',
      {
        name: '404.html',
        html: `<!doctype html><html lang="en"><head><script onerror="x()">${BOOTSTRAP}</script></head><body></body></html>`,
      },
      /onerror handler/,
    ],
    [
      'style= on an ld+json data block',
      '<script type="application/ld+json" style="color:red">{}</script>',
      /style attribute/,
    ],
    // Review 2026-10-03 R25: any script with a non-whitespace body is inline, src/href or not.
    [
      'an SVG <script src> that also has a body',
      '<svg><script src="x.js">alert(1)</script></svg>',
      /inline script/,
    ],
    [
      'an HTML <script src> that also has a body',
      '<script src=x.js>alert(1)</script>',
      /inline script/,
    ],
    // Review 2026-10-02-3 S2-07: with scripting on (as browsers parse), <noscript> is raw text, so
    // a script hidden in <title> / <textarea> of the scripting-off tree is a real script.
    [
      'a script that is <title> text only with scripting off',
      '<noscript><title></noscript><script>alert(1)</script></title></noscript>',
      /inline script \(type none\) that is not the bootstrap: "alert\(1\)"/,
    ],
    [
      'a script that is <textarea> text only with scripting off',
      '<noscript><textarea></noscript><script>alert(1)</script></textarea></noscript>',
      /inline script \(type none\) that is not the bootstrap: "alert\(1\)"/,
    ],
  ] as [string, string | BuiltPage, RegExp][])(
    'fails on %s, naming the page',
    (_, probe, reason) => {
      const built = typeof probe === 'string' ? page(probe, '404.html') : probe;
      expect(() => run([built])).toThrow(/404\.html/);
      expect(() => run([built])).toThrow(reason);
    },
  );

  // S2-07: both parse trees are audited, but a problem both trees see is reported once, and the
  // one bootstrap copy is counted per tree (not as a second copy).
  it('reports a problem seen in both parse trees once', () => {
    const error = (() => {
      try {
        run([page('<a onclick="x()">x</a>', '404.html')]);
      } catch (e) {
        return e as CspError;
      }
    })();
    expect(error).toBeInstanceOf(CspError);
    expect(error?.message.match(/onclick handler/g)).toHaveLength(1);
    expect(error?.message).not.toMatch(/second copy/);
  });

  // Review 2026-10-02 F-17: browsers hash an inline script after turning CRLF into LF.
  it('hashes a CRLF bootstrap source as the LF text the browser hashes', () => {
    const lf = 'var t;\ndocument.documentElement.dataset.theme = t;';
    const crlf = lf.replace(/\n/g, '\r\n');
    const out = run([{ name: 'index.html', html: `<script>${lf}</script>` }], HEADERS, crlf);
    expect(out).toContain(hash(lf));
  });

  it('accepts a bootstrap copy that reached the page with CRLF line endings', () => {
    const lf = 'var t;\ndocument.documentElement.dataset.theme = t;';
    const page = `<script>${lf.replace(/\n/g, '\r\n')}</script>`;
    const out = run([{ name: 'index.html', html: page }], HEADERS, lf);
    expect(out).toContain(hash(lf));
  });

  it('does not mistake text that mentions style= or onclick= for attributes', () => {
    expect(() => run([page('<p>Set style="x" or onclick="y" in prose.</p>')])).not.toThrow();
  });

  it('fails when the placeholder is missing from the template', () => {
    const headers = HEADERS.replace(HASH_PLACEHOLDER, "'sha256-stale'");
    expect(() => run([page('')], headers)).toThrow(/placeholder/);
  });

  it('fails when a placeholder is left after substitution', () => {
    const headers = `${HEADERS}\n/cv/*\n  X-Debug: ${HASH_PLACEHOLDER}\n`;
    expect(() => run([page('')], headers)).toThrow(/placeholder/);
  });

  it('fails on more than one Content-Security-Policy line', () => {
    const headers = `${HEADERS}\n/cv/*\n  Content-Security-Policy: default-src 'none'\n`;
    expect(() => run([page('')], headers)).toThrow(/more than one Content-Security-Policy/);
  });

  it.each(["'unsafe-inline'", "'unsafe-eval'"])('never emits a policy with %s', (keyword) => {
    const headers = HEADERS.replace("style-src 'self'", `style-src 'self' ${keyword}`);
    expect(() => run([page('')], headers)).toThrow(new RegExp(keyword));
  });

  it('reports every offending page, not only the first', () => {
    const error = (() => {
      try {
        run([page('<style></style>', 'a.html'), page('<p style="x"></p>', 'b.html')]);
      } catch (e) {
        return e as Error;
      }
    })();
    expect(error?.message).toMatch(/a\.html[\s\S]*b\.html/);
  });
});
