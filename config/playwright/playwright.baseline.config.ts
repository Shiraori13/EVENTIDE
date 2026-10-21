import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '../../artifacts/vnext/baseline-source/tests/e2e', testMatch: 'game.spec.ts', outputDir: '../../artifacts/vnext/baseline-e2e', workers: 1, timeout: 60000, use: { baseURL: 'http://localhost:4175', viewport: { width: 1280, height: 720 } } });
