import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',fullyParallel:false,workers:1,timeout:60000,outputDir:'test-results-v141',
  use:{baseURL:'http://127.0.0.1:4195/EVENTIDE/',viewport:{width:1280,height:720},trace:'retain-on-failure'},
  webServer:{command:'npx vite preview --outDir artifacts/v141/after-benchmark --host 127.0.0.1 --port 4195 --strictPort',url:'http://127.0.0.1:4195',reuseExistingServer:!process.env.CI},
});
