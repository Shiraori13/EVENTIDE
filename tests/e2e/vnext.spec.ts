import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder = 'artifacts/v14/regression/visual/regression';
const open = async (page: Page, perf = false): Promise<void> => { await page.goto(perf ? './?perf=1' : './?e2e=1'); await expect(page.getByRole('button', { name: 'Khởi hành' })).toBeVisible(); };
const photo = async (page: Page, path: string): Promise<void> => { await page.screenshot({ path: `${folder}/${path}.png` }); };
for (const view of [
  { width: 1280, height: 720, zoom: 1, dpr: 1 }, { width: 1280, height: 720, zoom: 1.25, dpr: 1 },
  { width: 1366, height: 768, zoom: 1, dpr: 1 }, { width: 1366, height: 768, zoom: 1.25, dpr: 2 },
  { width: 1920, height: 1080, zoom: 1, dpr: 1 }, { width: 1920, height: 1080, zoom: 1.25, dpr: 2 },
]) test(`VNext layout ${view.width}x${view.height} zoom${view.zoom} DPR${view.dpr}`, async ({ browser }, info) => {
  const width = Math.round(view.width / view.zoom), height = Math.round(view.height / view.zoom), name = `${view.width}x${view.height}-zoom${view.zoom}-dpr${view.dpr}`;
  const context = await browser.newContext({ baseURL: info.project.use.baseURL, viewport: { width, height }, deviceScaleFactor: view.dpr * view.zoom });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('eventide.e2e.v1', JSON.stringify({ saveVersion: 1, currency: 47, coreLevel: 2, echo: true, settings: { muted: true, volume: 0.6, reducedEffects: false, shake: false } })));
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page); expect(await page.evaluate(() => document.documentElement.dataset.fontStatus)).toBe('loaded');
  await expect(page.locator('#small-screen')).toBeHidden(); await photo(page, `${name}/menu`);
  for (const [button, shot] of [['Hướng dẫn', 'help'], ['Beacon Core', 'core'], ['Echo', 'echo'], ['Cài đặt', 'settings']]) {
    await page.getByRole('button', { name: button, exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible();
    if (shot === 'settings') { await page.getByLabel('Chất lượng hình ảnh').selectOption('low'); expect(await page.evaluate(() => window.__eventide!.save().settings.quality)).toBe('low'); }
    const bounds = await page.locator('.panel').boundingBox(); expect(bounds!.y).toBeGreaterThanOrEqual(0); expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height + 1);
    await photo(page, `${name}/${shot}`); await page.getByRole('button', { name: 'Trở về' }).click();
  }
  const save = await page.evaluate(() => window.__eventide!.save()); expect(save.currency).toBe(47); expect(save.coreLevel).toBe(2); expect(save.echo).toBe(true);
  await page.getByRole('button', { name: 'Khởi hành' }).click(); await expect(page.locator('#beacon-hp')).toContainText('360/360'); await photo(page, `${name}/hud`);
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Tiếp tục' })).toBeVisible(); await photo(page, `${name}/pause`);
  await page.getByRole('button', { name: 'Tiếp tục' }).click(); await page.evaluate(() => window.__eventide!.xp(12)); await expect(page.locator('.upgrade-panel')).toBeVisible();
  await photo(page, `${name}/upgrade`); await page.waitForTimeout(220); await page.keyboard.press('1'); await expect(page.locator('#ship-hp')).toBeVisible();
  await page.evaluate(() => window.__eventide!.patch({ time: 719.99 })); await expect(page.getByRole('heading', { name: 'Ánh sáng đã trở về.' })).toBeVisible();
  await page.getByRole('button', { name: 'Về menu' }).scrollIntoViewIfNeeded(); await photo(page, `${name}/result`);
  expect(errors).toEqual([]); await context.close();
});
test('font tải lỗi và font đến muộn không treo boot hoặc giữ fallback vĩnh viễn', async ({ browser }, info) => {
  const context = await browser.newContext({ baseURL: info.project.use.baseURL }); const page = await context.newPage();
  await page.route('**/assets/fonts/*.ttf', route => route.abort()); await open(page);
  expect(await page.evaluate(() => document.documentElement.dataset.fontStatus)).toBe('fallback');
  await page.getByRole('button', { name: 'Khởi hành' }).click(); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Tiếp tục' })).toBeVisible(); await photo(page, 'font-failure-pause');
  await context.close();
  const late = await browser.newContext({ baseURL: info.project.use.baseURL }); const delayed = await late.newPage();
  await delayed.route('**/assets/fonts/*.ttf', async route => { await new Promise(resolve => setTimeout(resolve, 4000)); await route.continue(); });
  await open(delayed); await delayed.waitForFunction(() => document.documentElement.dataset.fontStatus === 'loaded'); await photo(delayed, 'font-late-menu'); await late.close();
});
test('Canvas Text tiếng Việt dùng face đã load và toàn bộ chuỗi QA', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 }); await open(page, true);
  await page.evaluate(() => window.__eventidePerf!.typography());
  await page.locator('#ui').evaluate(el => { (el as HTMLElement).style.visibility = 'hidden'; });
  await photo(page, 'font-canvas-sans-serif'); await page.evaluate(() => window.__eventidePerf!.clearTypography());
});
test('ledger nhường slot cùng cell không thưởng XP ngoài radius trong browser', async ({ page }) => {
  await open(page, true); await page.getByRole('button', { name: 'Khởi hành' }).click();
  await page.evaluate(() => {
    const d = window.__eventide!, s = d.snapshot()!, cells = s.loot.cells.map(() => null) as typeof s.loot.cells;
    cells[29 * 57 + 29] = { x: 56, y: 56, minX: 56, maxX: 56, minY: 56, maxY: 56, value: 7 };
    d.patch({ player: { ...s.player, x: 0, y: 0 }, pickups: Array.from({ length: 220 }, (_, i) => ({ id: 10000 + i, x: 119, y: 119, value: 1, created: s.time, state: 'available' as const })), loot: { ...s.loot, cells, ledgerCount: 1, ledgerXP: 7, created: 227, collected: 0 }, nextId: 11000 });
  });
  await expect.poll(() => page.evaluate(() => window.__eventide!.snapshot()!.loot.collected)).toBe(7);
  expect(await page.evaluate(() => window.__eventide!.snapshot()!.xp)).toBe(7);
  const s = await page.evaluate(() => window.__eventide!.snapshot()!); expect(s.pickups.reduce((n, p) => n + p.value, 0) + s.loot.ledgerXP).toBe(220);
});
test('FX Low/High, bounds hút và restart 5 lần có capacity hữu hạn', async ({ page }) => {
  await open(page, true); const results = [], memory = []; const cdp = await page.context().newCDPSession(page);
  for (let run = 0; run < 7; run++) {
    await page.evaluate(() => window.__eventidePerf!.scenario('endgame')); await page.waitForTimeout(300);
    const counts = await page.evaluate(() => window.__eventidePerf!.counters()); if (run >= 2) results.push(counts);
    expect(counts.spriteCapacity).toBeLessThanOrEqual(640); expect(counts.suctionParticles).toBeLessThanOrEqual(96); expect(counts.enemies).toBe(110);
    expect(counts.starCanvasWidth).toBe(page.viewportSize()!.width); expect(counts.starCanvasHeight).toBe(page.viewportSize()!.height);
    if (run === 0) {
      await page.evaluate(() => { const d = window.__eventide!, s = d.snapshot()!; d.patch({ time: 637, wells: [{ x: 1080, y: 350, start: 636, end: 638, radius: 205, force: 135, damage: 140 }], player: { ...s.player, x: 1080, y: 350 } }); });
      await page.waitForTimeout(100); await photo(page, 'gravity-high-active');
      await page.keyboard.press('Escape'); const time = await page.evaluate(() => window.__eventide!.snapshot()!.time); await page.waitForTimeout(250); expect(await page.evaluate(() => window.__eventide!.snapshot()!.time)).toBe(time); await page.getByRole('button', { name: 'Tiếp tục' }).click();
    }
    await page.keyboard.press('Escape'); await page.getByRole('button', { name: 'Về menu' }).click();
    if (run === 1) { await page.getByRole('button', { name: 'Cài đặt', exact: true }).click(); await page.getByLabel('Chất lượng hình ảnh').selectOption('low'); await page.getByRole('button', { name: 'Trở về' }).click(); }
    const idle = await page.evaluate(() => window.__eventidePerf!.counters()); expect(idle.enemies).toBe(0); expect(idle.physicsBodies).toBe(0); expect(idle.tweens).toBe(0); expect(idle.timers).toBe(0);
    await page.waitForTimeout(100); await cdp.send('HeapProfiler.collectGarbage'); const dom = await cdp.send('Memory.getDOMCounters'); if (run >= 2) memory.push(dom);
  }
  expect(new Set(results.map(r => r.sceneListeners)).size).toBe(1); expect(new Set(results.map(r => r.textures)).size).toBe(1);
  expect(Math.max(...results.map(r => r.spriteCapacity)) - Math.min(...results.map(r => r.spriteCapacity))).toBeLessThanOrEqual(20);
  await page.evaluate(() => window.__eventidePerf!.scenario('endgame')); await page.waitForTimeout(250); await photo(page, 'gravity-low-warning');
  await page.evaluate(() => { const s = window.__eventide!.snapshot()!; window.__eventide!.patch({ time: 637, wells: [{ x: 1080, y: 350, start: 636, end: 638, radius: 205, force: 135, damage: 140 }], player: { ...s.player, x: 1080, y: 350 } }); });
  await page.waitForTimeout(100); await photo(page, 'gravity-low-active');
  mkdirSync('artifacts/vnext', { recursive: true }); writeFileSync('artifacts/v14/regression/lifecycle.json', JSON.stringify({ counters: results, domAfterGC: memory }, null, 2));
  expect(new Set(memory.map(m => m.jsEventListeners)).size).toBe(1);
  await page.setViewportSize({ width: 1366, height: 768 }); await page.waitForTimeout(200);
  const resized = await page.evaluate(() => window.__eventidePerf!.counters());
  expect(resized.starCanvasWidth).toBe(1366); expect(resized.starCanvasHeight).toBe(768);
});
