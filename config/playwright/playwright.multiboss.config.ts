import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  testDir: '../../tests/e2e', outputDir: '../../test-results-multiboss',
  fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:4201/EVENTIDE/', viewport: { width: 1280, height: 720 }, trace: 'retain-on-failure' },
  webServer: { cwd: fileURLToPath(new URL('../../', import.meta.url)), command: 'npx vite preview --outDir artifacts/multiboss/after-build --host 127.0.0.1 --port 4201 --strictPort', url: 'http://127.0.0.1:4201/EVENTIDE/', reuseExistingServer: !process.env.CI },
});
