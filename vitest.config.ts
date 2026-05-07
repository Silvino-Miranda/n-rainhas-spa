/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  test: {
    // include + exclude scope the run to src/. Default vitest watch
    // never walks excluded dirs (.aiox-core, .claude, docs, dist, ...).
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/out-tsc/**',
      '**/.angular/**',
      'docs/**',
      '.aiox-core/**',
      '.aiox/**',
      '.claude/**',
      '.codex/**',
      '.agent/**',
      '.cursor/**',
      '.gemini/**'
    ],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/test-setup.ts',
        'src/main.ts',
        'src/environments/**',
        'src/**/_solvers/**'
      ]
    }
  },
  define: {
    'import.meta.vitest': mode !== 'production'
  }
}));
