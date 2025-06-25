import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/mockData',
      ],
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  },
  resolve: {
    alias: {
      '@aicd/core': path.resolve(__dirname, './packages/core/src'),
      '@aicd/auth': path.resolve(__dirname, './packages/auth/src'),
      '@aicd/database': path.resolve(__dirname, './packages/database/src'),
      '@aicd/cms': path.resolve(__dirname, './packages/cms/src'),
    },
  },
});