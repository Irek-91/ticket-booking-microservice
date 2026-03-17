import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export default defineConfig({
  resolve: {
    alias: {
      src: path.join(currentDir, 'src'),
      test: path.join(currentDir, 'test'),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
    globals: true,
    environment: 'node',
  },
});
