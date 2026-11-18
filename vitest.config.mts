import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = import.meta.dirname;
const srcAlias = path.resolve(rootDir, 'src');
const emptyServerOnly = path.resolve(
  rootDir,
  'node_modules/server-only/empty.js',
);

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '@': srcAlias,
          },
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.{ts,mjs}'],
        },
      },
      {
        resolve: {
          alias: {
            '@': srcAlias,
            'server-only': emptyServerOnly,
          },
        },
        test: {
          name: 'server',
          environment: 'node',
          include: ['tests/server/**/*.test.ts'],
        },
      },
      {
        plugins: [react()],
        resolve: {
          alias: {
            '@': srcAlias,
          },
        },
        test: {
          name: 'dom',
          environment: 'jsdom',
          setupFiles: ['tests/setup-dom.ts'],
          include: ['tests/dom/**/*.test.tsx'],
        },
      },
    ],
  },
});
