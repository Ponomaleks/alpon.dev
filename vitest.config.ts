import { defineConfig } from 'vitest/config';

// Unit tests for build-time logic (scripts/, src/integrations/, tools/).
// tests/** holds the Playwright suites; Vitest must never pick them up.
export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    exclude: ['tests/**', 'node_modules/**', 'dist/**', '.astro/**', 'design/**', '.worktrees/**'],
    // Some suites run a real `astro build` (into throwaway directories); concurrent builds
    // share Astro's and Vite's caches and break each other, so test files run one at a time.
    fileParallelism: false,
    // A real build takes 5–15 s on a loaded Windows machine, past the 5 s / 10 s defaults.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
