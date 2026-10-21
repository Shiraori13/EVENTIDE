import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  testDir:'../../tests/e2e',outputDir:'../../test-results-next-beta',
  // SwiftShader/DPR2,5 có thể dựng menu4K chậm; vẫn giữ mọi assertion, không dùng timeout làm số đo FPS.
  fullyParallel:false,workers:1,timeout:120000,
  reporter:[['list'],['json',{outputFile:fileURLToPath(new URL('../../artifacts/next-beta/e2e-final.json',import.meta.url))}]],
  use:{baseURL:'http://127.0.0.1:4301/EVENTIDE/',viewport:{width:1280,height:720},trace:'retain-on-failure'},
  webServer:{cwd:fileURLToPath(new URL('../../',import.meta.url)),command:'npx vite preview --outDir artifacts/next-beta/after-build --host 127.0.0.1 --port 4301 --strictPort',url:'http://127.0.0.1:4301/EVENTIDE/',reuseExistingServer:!process.env.CI},
});
