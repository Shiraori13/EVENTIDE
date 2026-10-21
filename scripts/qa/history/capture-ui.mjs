import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const args = Object.fromEntries(process.argv.slice(2).map(x => x.replace(/^--/, '').split('=')));
const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1280, height: 720 }, { width: 1920, height: 1080 }]) {
    const folder = `artifacts/vnext/${args.label ?? 'before-ui'}/${viewport.width}x${viewport.height}`; mkdirSync(folder, { recursive: true });
    const context = await browser.newContext({ viewport }), page = await context.newPage();
    await page.goto(`${args.url ?? 'http://localhost:4175'}/?e2e=1`); await page.getByRole('button', { name: 'Khởi hành' }).waitFor();
    await page.screenshot({ path: `${folder}/menu.png` }); await page.getByRole('button', { name: 'Khởi hành' }).click();
    await page.keyboard.press('Escape'); await page.getByRole('button', { name: 'Tiếp tục' }).waitFor(); await page.screenshot({ path: `${folder}/pause.png` }); await context.close();
  }
} finally { await browser.close(); }
