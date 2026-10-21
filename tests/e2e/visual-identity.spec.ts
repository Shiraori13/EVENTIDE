import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder='artifacts/visual-identity/after/qa';mkdirSync(folder,{recursive:true});
test('visual: boss transition hủy dư ảnh, kết thúc đúng hạn chỉ fade120ms',async({page})=>{
  await page.goto('./?perf=1');await page.locator('[data-action=start]').click();await page.keyboard.press('Escape');
  const id=await page.evaluate(()=>{const d=window.__eventide!,id=d.spawn('elder',160,0)!;d.patch({time:10,beam:{x:160,y:0,angle:Math.PI,fire:9,end:10.3,ownerId:id,locked:true},nextSpawn:Infinity});return id;});
  await expect.poll(()=>page.evaluate(()=>window.__eventidePerf!.counters().beamTailCached)).toBe(1);
  await page.evaluate(id=>{window.__eventide!.hit(id,1e9);window.__eventide!.patch({time:10.1});},id);
  await expect.poll(()=>page.evaluate(()=>window.__eventidePerf!.counters().beamTailCached)).toBe(0);
  await page.evaluate(()=>window.__eventide!.patch({time:10.35}));await page.waitForTimeout(70);expect(await page.evaluate(()=>window.__eventidePerf!.counters().beamAfterglow)).toBe(0);
  await page.evaluate(()=>window.__eventide!.patch({time:11,beam:{x:160,y:0,angle:0,fire:10,end:11.3,locked:true}}));await expect.poll(()=>page.evaluate(()=>window.__eventidePerf!.counters().beamTailCached)).toBe(1);
  await page.evaluate(()=>window.__eventide!.patch({time:11.35,beam:undefined}));await expect.poll(()=>page.evaluate(()=>window.__eventidePerf!.counters().beamAfterglow)).toBe(1);
  await page.evaluate(()=>window.__eventide!.patch({time:11.5}));await expect.poll(()=>page.evaluate(()=>window.__eventidePerf!.counters().beamAfterglow)).toBe(0);expect(await page.evaluate(()=>window.__eventidePerf!.counters().beamTailCached)).toBe(0);
});
for(const [width,height] of[[1280,720],[1366,768],[1920,1080],[390,844]])test(`visual: menu/settings/Core/Balo/HUD ${width}×${height}`,async({page})=>{
  await page.setViewportSize({width,height});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('./?e2e=1');await page.locator('[data-action=settings]').click();
  await expect(page.locator('select[data-setting=quality] option')).toHaveCount(3);
  await page.locator('select[data-setting=quality]').selectOption('low');await page.locator('input[data-setting=reducedMotion]').check();
  await expect(page.locator('html')).toHaveAttribute('data-motion','reduced');await page.locator('[data-action=back]').click();await page.reload();
  await page.locator('[data-action=settings]').click();await expect(page.locator('select[data-setting=quality]')).toHaveValue('low');await expect(page.locator('input[data-setting=reducedMotion]')).toBeChecked();
  await page.locator('[data-action=back]').click();await page.locator('[data-action=core]').click();await expect(page.locator('.core-panel')).toContainText('Stardust tinh khiết');await page.screenshot({path:`${folder}/core-${width}.png`});await page.locator('[data-action=back]').click();
  await expect(page.locator('[data-action=start]')).toBeVisible();await page.screenshot({path:`${folder}/menu-${width}.png`});await page.locator('[data-action=start]').click();
  await page.keyboard.down('w');await page.keyboard.down('d');await page.waitForTimeout(220);await page.keyboard.up('w');await page.keyboard.up('d');await page.keyboard.down('a');await page.waitForTimeout(180);await page.keyboard.up('a');
  await page.keyboard.press('b');const before=await page.evaluate(()=>window.__eventide!.snapshot()!);await page.waitForTimeout(250);expect(await page.evaluate(()=>window.__eventide!.snapshot()!.time)).toBe(before.time);
  await expect(page.locator('[data-action=read-back]')).toBeVisible();await page.screenshot({path:`${folder}/build-${width}.png`});await page.keyboard.press('b');await page.screenshot({path:`${folder}/hud-${width}.png`});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false);expect(errors).toEqual([]);
});
test('visual: Beacon hit/critical, Low giữ telegraph, motion preference thắng OS',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./?e2e=1');await page.locator('[data-action=settings]').click();await expect(page.locator('input[data-setting=reducedMotion]')).toBeChecked();await page.locator('input[data-setting=reducedMotion]').uncheck();await expect(page.locator('html')).toHaveAttribute('data-motion','full');await page.locator('select[data-setting=quality]').selectOption('low');await page.locator('[data-action=back]').click();await page.reload();await expect(page.locator('html')).toHaveAttribute('data-motion','full');
  await page.locator('[data-action=start]').click();await page.keyboard.press('Escape');await page.evaluate(()=>{window.__eventide!.patch({time:100,beacon:{hp:100,maxHP:600,lastHit:100},nextSpawn:Infinity,beam:{x:160,y:0,angle:Math.PI,fire:101,end:103,locked:true}});});await page.keyboard.press('Escape');await page.waitForTimeout(50);await page.keyboard.press('Escape');await page.keyboard.press('b');await page.keyboard.press('b');await page.locator('[data-action=resume]').click();await expect(page.locator('#beacon-status')).toContainText(/Nguy cấp|Trúng đòn/);await page.screenshot({path:`${folder}/critical-low.png`});
  await page.waitForTimeout(1100);await page.keyboard.press('Escape');await page.keyboard.press('b');const s=await page.evaluate(()=>window.__eventide!.snapshot()!);expect(s.beam).toBeDefined();await page.keyboard.press('b');await page.screenshot({path:`${folder}/beam-fire-low.png`});
  writeFileSync(`${folder}/critical-beam.json`,JSON.stringify(s,null,2));
});
