import { fileURLToPath } from 'node:url';
const projectRoot=fileURLToPath(new URL('../../',import.meta.url));
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../../tests/e2e', outputDir: '../../test-results-vnext', workers: 1, timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:4192', viewport: { width: 1280, height: 720 }, trace: 'retain-on-failure' },
  webServer: { cwd:projectRoot, command: 'npx vite preview --outDir artifacts/v13/after-benchmark --host 127.0.0.1 --port 4192 --strictPort', url: 'http://127.0.0.1:4192', reuseExistingServer: true },
});
