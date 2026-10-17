import { defineConfig } from '@playwright/test';
const deployedURL = process.env.EVENTIDE_SMOKE_URL;
export default defineConfig({
  testDir: './tests/production', outputDir: 'test-results-production', workers: 1, timeout: 60000,
  use: { baseURL: deployedURL ?? 'http://127.0.0.1:4173/EVENTIDE/', viewport: { width: 1280, height: 720 }, trace: 'retain-on-failure' },
  webServer: deployedURL ? undefined : { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173/EVENTIDE/', reuseExistingServer: false },
});
