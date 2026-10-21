import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder = 'artifacts/multiboss/after/ui'; mkdirSync(folder, { recursive: true });

for (const [width, height] of [[1280, 720], [1366, 768], [1920, 1080], [390, 844]]) test(`wallet thật, focus và không cung rời ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height });
  await page.goto('./?e2e=1'); await page.waitForFunction(() => !!window.__eventide);
  await page.evaluate(() => window.__eventide!.seedSave({ currency: 1234567 })); await page.reload();
  const wallet = page.locator('[data-action=core-wallet]'); await expect(wallet).toContainText('1.000.000');
  expect(await wallet.evaluate(el => getComputedStyle(el.querySelector('img')!).width)).toBe('32px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await wallet.focus(); await page.keyboard.press('Enter'); await expect(page.locator('#core-wallet')).toHaveText('1.000.000');
  await page.locator('[data-action=buy]').click(); await expect(page.locator('#core-wallet')).toHaveText('999.990');
  await page.keyboard.press('Escape'); await expect(page.locator('#menu-wallet')).toHaveText('999.990');
  await page.screenshot({ path: `${folder}/menu-${width}.png` });
  for (let i = 0; i < 2; i++) {
    await page.locator('[data-action=read-achievements]').click();
    expect(await page.locator('.panel h2').evaluate(el => getComputedStyle(el, '::before').content)).toBe('none');
    await page.keyboard.press('Escape');
  }
  expect(await page.locator('.menu h1').evaluate(el => getComputedStyle(el, '::after').content)).toBe('none');
  await page.locator('[data-action=start]').click(); await page.keyboard.press('b');
  await expect(page.locator('.read-content')).toBeVisible();
  expect(await page.locator('.panel h2').evaluate(el => getComputedStyle(el, '::before').content)).toBe('none');
  await page.screenshot({ path: `${folder}/build-${width}.png` }); await page.keyboard.press('Escape');
  expect((await page.evaluate(() => window.__eventide!.save())).currency).toBe(999990);
});

test('hai owner cùng chạy, HUD hai hàng, pause/kill/restart dọn đúng', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?e2e=1'); await page.locator('[data-action=start]').click();
  await page.evaluate(() => { const d = window.__eventide!, s = d.snapshot()!; d.patch({ time: 659.99, nextSpawn: Infinity, nextPlasma: Infinity, pickups: [], player: { ...s.player, hp: 10000, maxHP: 10000 }, bossEvents: [{ at: 540, hpScale: 1, kind: 'elder', spawned: false }, { at: 660, hpScale: .8, kind: 'helion', spawned: false }] }); d.advance(.02); });
  await expect(page.locator('#boss')).toBeVisible(); await expect(page.locator('#boss-second')).toBeVisible();
  await page.evaluate(() => window.__eventide!.advance(4));
  let s = await page.evaluate(() => window.__eventide!.snapshot()!);
  expect(s.enemies).toHaveLength(2); expect(s.enemies.every(e => (e.boss?.skillCount ?? 0) >= 1)).toBe(true);
  await page.keyboard.press('b'); const frozen = await page.evaluate(() => window.__eventide!.snapshot()!);
  await page.waitForTimeout(300); expect((await page.evaluate(() => window.__eventide!.snapshot()!)).time).toBe(frozen.time);
  await page.keyboard.press('Escape');
  const owner = s.enemies[0].id, other = s.enemies[1].id;
  await page.evaluate(id => window.__eventide!.hit(id, 1e9), owner);
  s = await page.evaluate(() => window.__eventide!.snapshot()!);
  expect(s.enemies.find(e => e.id === owner)!.bossPhase).toBe('transition');
  expect(s.bossZones.every(z => z.ownerId === other)).toBe(true);
  await page.screenshot({ path: `${folder}/two-bosses.png` });
  await page.evaluate(() => { const d = window.__eventide!; d.advance(1.4); });
  await page.evaluate(id => window.__eventide!.hit(id, 1e9), owner); await page.evaluate(() => window.__eventide!.advance(.02));
  s = await page.evaluate(() => window.__eventide!.snapshot()!); expect(s.enemies.find(e => e.id === other)!.boss!.skillCount).toBeGreaterThan(0);
  await page.keyboard.press('Escape'); await page.locator('[data-action=restart]').click();
  s = await page.evaluate(() => window.__eventide!.snapshot()!); expect(s.bossZones).toHaveLength(0); expect(s.bossEvents.every(e => !e.spawned)).toBe(true); expect(s.enemies).toHaveLength(0); expect(errors).toEqual([]);
  writeFileSync(`${folder}/owner-reset.json`, JSON.stringify(s, null, 2));
});

test('Thấp/giảm chuyển động giữ vùng và cue hazard; pause không tick damage', async ({ page }) => {
  await page.goto('./?e2e=1'); await page.locator('[data-action=start]').click();
  await page.evaluate(() => { const d = window.__eventide!, s = d.snapshot()!; d.seedSave({ settings: { ...d.save().settings, quality: 'low', reducedMotion: true } }); d.patch({ time: 207, player: { ...s.player, x: 700, y: 0 }, nextSpawn: Infinity, nextPlasma: Infinity, pickups: [] }); d.advance(.02); });
  const warning = await page.evaluate(() => window.__eventide!.snapshot()!); expect(warning.astronomy[0].zones).toHaveLength(2); expect(warning.player.hp).toBe(100);
  await page.screenshot({ path: `${folder}/radiation-warning-low.png` });
  await page.evaluate(() => { const d = window.__eventide!, s = d.snapshot()!, p = s.astronomy[0].zones![0]; d.patch({ time: 210, player: { ...s.player, x: p.x, y: p.y } }); d.advance(.02); });
  await expect(page.locator('#hazard-status')).toContainText('PHÓNG XẠ');
  await page.keyboard.press('b'); const frozen = await page.evaluate(() => window.__eventide!.snapshot()!);
  await page.evaluate(() => window.__eventide!.advance(5)); expect((await page.evaluate(() => window.__eventide!.snapshot()!)).player.hp).toBe(frozen.player.hp);
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const d = window.__eventide!, s = d.snapshot()!; d.patch({ time: 466.5, player: { ...s.player, x: 700, y: 0 } }); d.advance(.02); });
  await expect(page.locator('#hazard-status')).toContainText('ĐANG HÚT'); await page.screenshot({ path: `${folder}/tide-low.png` });
  await page.evaluate(() => { window.__eventide!.patch({ time: 469.5 }); window.__eventide!.advance(.02); }); await expect(page.locator('#hazard-status')).toContainText('ĐANG ĐẨY');
});

test('duo restart/menu lặp: owner/VFX/listener/texture hữu hạn sau warmup', async ({ page }) => {
  await page.goto('./?perf=1'); await page.waitForFunction(() => !!window.__eventidePerf);
  const rows = [], cdp = await page.context().newCDPSession(page);
  for (let i = 0; i < 7; i++) {
    await page.evaluate(() => { window.__eventidePerf!.scenario('duo'); window.__eventide!.advance(4); });
    await page.waitForTimeout(100);
    const active = await page.evaluate(() => window.__eventidePerf!.counters());
    expect(active.bossCount).toBe(2); expect(active.enemies).toBe(112); expect(active.bossZones).toBeGreaterThan(0); expect(active.projectiles).toBeLessThanOrEqual(160);
    await page.keyboard.press('Escape'); await page.locator('[data-action=menu]').click();
    await cdp.send('HeapProfiler.collectGarbage');
    const counts = await page.evaluate(() => window.__eventidePerf!.counters()), dom = await cdp.send('Memory.getDOMCounters');
    expect(counts.bossCount + counts.bossZones + counts.bossBeams + counts.reservedBullets + counts.beamTailCached).toBe(0);
    expect(counts.tweens + counts.timers).toBe(0);
    if (i >= 2) rows.push({ counts, dom });
  }
  expect(new Set(rows.map(r => r.counts.textures)).size).toBe(1); expect(new Set(rows.map(r => r.counts.sceneListeners)).size).toBe(1); expect(new Set(rows.map(r => r.dom.jsEventListeners)).size).toBe(1);
  writeFileSync('artifacts/multiboss/duo-lifecycle.json', JSON.stringify(rows, null, 2));
});
