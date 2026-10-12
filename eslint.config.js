// @ts-check
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'dist/',
    '.astro/',
    '.wrangler/',
    'design/',
    'public/',
    'tools/',
    'test-results/',
    'playwright-report/',
    '.lighthouseci/',
    '.worktrees/',
  ]),
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // The theme bootstrap is the ADR-0001 snippet verbatim (its CSP hash depends on every byte):
    // an empty catch is the point — a storage error means "no Theme choice".
    files: ['src/scripts/theme-bootstrap.js'],
    rules: { 'no-empty': 'off', '@typescript-eslint/no-unused-vars': 'off' },
  },
  {
    // Every Playwright file takes `test` from the shared fixture, which answers requests to the
    // Web Analytics host locally (release-1 D-03). The fixture re-exports the rest of the package.
    files: ['tests/**/*.ts'],
    ignores: ['tests/fixtures.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message: "Import from 'tests/fixtures' instead (release-1 D-03).",
            },
          ],
        },
      ],
    },
  },
  {
    // CommonJS config files (lighthouserc.cjs): LHCI loads them with require().
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
