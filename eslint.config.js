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
    // CommonJS config files (lighthouserc.cjs): LHCI loads them with require().
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
