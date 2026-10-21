import { test,expect,type Page } from '@playwright/test';
import { mkdirSync,writeFileSync } from 'node:fs';
const folder='artifacts/next-beta/regression';mkdirSync(folder,{recursive:true});
const state=(page:Page)=>page.evaluate(()=>window.__eventide!.snapshot()!);
async function start(page:Page){await page.goto('./?perf=1');await page.locator('[data-action=start]').click();}
for(const viewport of [{width:1280,height:720},{width:1366,height:768},{width:1920,height:1080},{width:1024,height:576}])test(`UX: overview, recipe click pause/focus và draft ${viewport.width}`,async({page})=>{
 await page.setViewportSize(viewport);await start(page);await page.keyboard.press('Escape');
 await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{hull:5,armor:4},nextSpawn:Infinity,player:{...s.player,maxHP:150,hp:150}});});
 await page.keyboard.press('b');await expect(page.locator('.build-slots .build-slot')).toHaveCount(5);await expect(page.locator('.build-progress')).toContainText('Giáp phân tán cấp 4/5');await expect(page.locator('[data-action=ask-fusion]')).toBeFocused();
 const ready=await page.locator('[data-action=ask-fusion]').evaluate(el=>{const r=el.getBoundingClientRect(),clip=el.closest('.read-content')!.getBoundingClientRect();return r.top>=clip.top&&r.bottom<=clip.bottom;});expect(ready).toBe(true);
 await page.locator('.build-details>summary').click();await expect(page.locator('.stats-table')).toBeVisible();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Escape');expect((await state(page)).phase).toBe('paused');
 await page.keyboard.press('b');await page.locator('[data-action=ask-fusion]').click();const before=await state(page);await page.locator('[data-action=cancel-fusion]').click();expect((await state(page)).modules).toEqual(before.modules);
 await page.locator('[data-action=ask-fusion]').click();await page.locator('[data-action=confirm-fusion]').dblclick();expect((await state(page)).modules).toEqual({plasma:5,quasar:5});expect((await state(page)).time).toBe(before.time);await page.screenshot({path:`${folder}/${viewport.width}-build.png`});
 await page.keyboard.press('Escape');await page.locator('[data-action=resume]').click();await page.evaluate(()=>window.__eventide!.xp(15));await expect(page.locator('.upgrade-panel')).toBeVisible();await expect(page.locator('.preview-changes')).toHaveCount((await state(page)).choices.length);
 const draft=await state(page);await page.locator('.draft-details>summary').first().click();expect((await state(page)).picks).toBe(draft.picks);await page.locator('[data-action=read-build]').click();await page.keyboard.press('Escape');expect((await state(page)).draftId).toBe(draft.draftId);expect((await state(page)).rerollsRemaining).toBe(draft.rerollsRemaining);await expect(page.locator('[data-action=read-build]')).toBeFocused();
 await page.keyboard.press('Tab');await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('[role=dialog]'))).toBe(true);await page.screenshot({path:`${folder}/${viewport.width}-draft.png`});
});
test('tutorial hoãn nguy hiểm/draft, chỉ seen khi hiện, skip/reload/replay giữ meta',async({page})=>{
 await page.addInitScript(()=>{if(!localStorage.getItem('eventide.e2e.v1'))localStorage.setItem('eventide.e2e.v1',JSON.stringify({saveVersion:3,currency:77,coreLevel:2,echo:true,careerKills:101,unlockedAchievements:['kills-100'],settings:{muted:true,quality:'medium'}}));});
 await start(page);await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({player:{...s.player,x:850,y:0,hp:20},nextSpawn:Infinity,pickups:[],noticeUntil:0});});
 await page.waitForTimeout(350);await expect(page.locator('#tutorial-tip')).toBeHidden();expect((await page.evaluate(()=>window.__eventide!.save())).tutorialSeen).toEqual([]);
 await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({player:{...s.player,x:0,y:100,hp:100}});});
 await expect(page.locator('#tutorial-text')).toContainText('Corruption tăng');await expect(page.locator('#tutorial-tip')).toBeVisible();expect((await page.evaluate(()=>window.__eventide!.save())).tutorialSeen).toEqual(['outside']);
 const tip=await page.locator('#tutorial-text').evaluate(el=>el.clientHeight/parseFloat(getComputedStyle(el).lineHeight));expect(tip).toBeLessThanOrEqual(3.1);
 await page.locator('[data-action=skip-tutorial]').click();await expect(page.locator('#tutorial-tip')).toBeHidden();
 await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({beacon:{...s.beacon,lastHit:s.time},modules:{pulsar:5,ion:5},noticeUntil:0});d.xp(15);});await expect(page.locator('.upgrade-panel')).toBeVisible();expect((await page.evaluate(()=>window.__eventide!.save())).tutorialSeen).toEqual(['outside']);
 await page.waitForTimeout(200);await page.keyboard.press('1');await expect(page.locator('#tutorial-text')).toContainText('tam giác vàng',{timeout:8000});await page.locator('[data-action=skip-tutorial]').click();await expect(page.locator('#tutorial-text')).toContainText('Mở Balo',{timeout:8000});await page.screenshot({path:`${folder}/tutorial.png`});
 await page.keyboard.press('Escape');await page.locator('[data-action=menu]').click();await page.locator('[data-action=settings]').click();await page.locator('[data-setting=tutorial]').uncheck();await page.reload();await page.locator('[data-action=start]').waitFor();expect((await page.evaluate(()=>window.__eventide!.save())).settings.tutorial).toBe(false);
 await page.locator('[data-action=settings]').click();await page.locator('[data-action=replay-tutorial]').click();const save=await page.evaluate(()=>window.__eventide!.save());expect(save.tutorialSeen).toEqual([]);expect(save.settings.tutorial).toBe(true);expect(save.currency).toBe(77);expect(save.coreLevel).toBe(2);expect(save.echo).toBe(true);expect(save.unlockedAchievements).toContain('kills-100');
});
test('report fatal/snapshot/đúng reward khi cùng chết, chi tiết không settle lần hai',async({page})=>{
 await start(page);await page.keyboard.press('Escape');await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({time:719.98,modules:{quasar:5,drones:5,well:5},supports:{armor:5,hull:5},nextSpawn:Infinity,nextQuasar:Infinity,nextWell:Infinity,player:{...s.player,x:900,y:0,hp:1},beacon:{...s.beacon,hp:2},enemies:[],projectiles:[],astronomy:[]});d.spawn('wisp',900,0);d.spawn('drifter',0,0,'beacon');});
 await page.locator('[data-action=resume]').click();await expect(page.locator('.result-cause')).toContainText('cùng bị phá hủy');await expect(page.locator('.result-loadout')).toContainText('Quasar Cannon');
 const s=await state(page);expect(s.phase).toBe('defeat');expect(s.report?.cause).toBe('both');expect(s.report?.telemetry.fatal.ship?.kind).toBe('wisp');expect(s.report?.telemetry.fatal.beacon?.kind).toBe('drifter');expect(s.enemies).toHaveLength(0);const currency=await page.evaluate(()=>window.__eventide!.save().currency);
 await page.locator('.result-details>summary').click();await expect(page.locator('.result-details')).toContainText('không phải DPS');await expect(page.locator('.result-details')).toContainText('2 HP đã mất');await page.screenshot({path:`${folder}/fatal-report.png`});await page.locator('.result-details>summary').click();await page.waitForTimeout(200);expect(await page.evaluate(()=>window.__eventide!.save().currency)).toBe(currency);
});
test('modal trap và input không kích hoạt phím tắt phía sau; 20 panel + 5 restart cleanup',async({page})=>{
 await start(page);const cdp=await page.context().newCDPSession(page),rows=[];
 for(let i=0;i<7;i++){
  for(let j=0;j<4;j++){await page.keyboard.press('b');await expect(page.locator('.read-panel')).toBeVisible();await page.keyboard.press('Escape');}
  await page.keyboard.press('Escape');await page.locator('[data-action=menu]').click();await cdp.send('HeapProfiler.collectGarbage');rows.push({counts:await page.evaluate(()=>window.__eventidePerf!.counters()),dom:await cdp.send('Memory.getDOMCounters')});if(i<6)await page.locator('[data-action=start]').click();
 }
 const stable=rows.slice(2);expect(new Set(stable.map(r=>r.dom.jsEventListeners)).size).toBe(1);expect(new Set(stable.map(r=>r.counts.textures)).size).toBe(1);expect(stable.every(r=>r.counts.timers===0&&r.counts.tweens===0&&r.counts.bossCount===0)).toBe(true);
 await page.locator('[data-action=settings]').click();await page.locator('[data-setting=quality]').focus();await page.keyboard.press('b');await page.keyboard.press('1');await expect(page.locator('[data-setting=quality]')).toBeFocused();
 await page.locator('[data-action=reset]').focus();await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('[role=dialog]'))).toBe(true);await page.locator('[data-setting=quality]').focus();await page.keyboard.press('Escape');await expect(page.locator('[data-action=start]')).toBeVisible();writeFileSync(`${folder}/lifecycle.json`,JSON.stringify(rows,null,2));
});
test('HUD hysteresis, Corruption buff thật và thời gian event dừng khi pause',async({page})=>{
 await start(page);await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({player:{...s.player,hp:25,x:700,y:0},nextSpawn:Infinity,corruption:40});});await expect(page.locator('#ship-status')).toContainText('nguy cấp');
 await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({player:{...s.player,hp:26},corruption:43});});await expect(page.locator('#ship-status')).toContainText('nguy cấp');await expect(page.locator('#corruption-effect')).toContainText('Gần ngưỡng');
 await page.evaluate(()=>window.__eventide!.patch({corruption:60}));await expect(page.locator('#corruption-effect')).toContainText('Gây +20% / nhận +20%');await page.keyboard.press('Escape');const before=await state(page);await page.waitForTimeout(300);expect((await state(page)).time).toBe(before.time);
});
