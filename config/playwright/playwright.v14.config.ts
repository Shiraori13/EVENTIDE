import { fileURLToPath } from 'node:url';
const projectRoot=fileURLToPath(new URL('../../',import.meta.url));
import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'../../tests/e2e',fullyParallel:false,workers:1,timeout:60000,outputDir:'../../test-results-v14',use:{baseURL:'http://127.0.0.1:4194',viewport:{width:1280,height:720},trace:'retain-on-failure'},webServer:{ cwd:projectRoot,command:'npx vite preview --outDir artifacts/v14/after-benchmark --host 127.0.0.1 --port 4194 --strictPort',url:'http://127.0.0.1:4194',reuseExistingServer:!process.env.CI} });
