import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder='artifacts/v141/visual';mkdirSync(folder,{recursive:true});
async function start(page: Page) { await page.goto('./?e2e=1');await page.locator('[data-action=start]').click(); }
const snapshot = (page: Page) => page.evaluate(()=>window.__eventide!.snapshot()!);
for(const width of [1024,1280,1920]) test(`E01/E02/E04/E08/E09: B từ pause, click visible, Quasar damage sau resume ${width}`,async({page})=>{
  await page.setViewportSize({width,height:width===1024?576:width===1280?720:1080});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;
    d.patch({time:350,minuteIndex:5,enemyEventFactor:1.5,modules:{plasma:5,pulsar:5,ion:5},supports:{power:5,haste:1},masteryBonus:{damage:1800,hp:0,rate:0,pickup:0,speed:0},
      salvage:{...s.salvage,bonuses:{damage:1000,rate:0,hp:0,pickup:0,speed:0}},corruption:60,nextSpawn:Infinity,nextPlasma:Infinity,bossSpawned:true,
      player:{...s.player,x:900,y:0,previousX:900,previousY:0},astronomy:s.astronomy.map(e=>e.id==='chaos'?{...e,phase:'active'}:e),
      pulses:[{id:90000,start:349.9,end:350.5,startAngle:0,swept:0,hitIds:new Set<number>(),damage:132,range:340,level:5}],ionTraces:[{id:90001,points:[{x:900,y:0},{x:1100,y:0}],end:350.24,level:5}]});
    d.spawn('drifter',1100,0);const n=d.snapshot()!;d.patch({enemies:n.enemies.map(e=>({...e,baseHP:10000,hp:10000,maxHP:10000,damage:0,speed:0}))});
  });
  const before=await snapshot(page);await page.keyboard.press('b');await expect(page.locator('.read-content')).toContainText('Đã lắp 5/5 ô; đạt trần 4/5 ô');
  await page.locator('[data-action=ask-fusion]').click();
  const geometry=await page.locator('[data-action=confirm-fusion]').evaluate(el=>{const r=el.getBoundingClientRect(),c=el.closest('.read-content')!.getBoundingClientRect();return {top:r.top,bottom:r.bottom,clipTop:c.top,clipBottom:c.bottom,visible:r.top>=c.top&&r.bottom<=c.bottom,focused:document.activeElement===el};});
  expect(geometry.visible).toBe(true);expect(geometry.focused).toBe(true);await page.screenshot({path:`${folder}/${width}-confirm.png`});
  await page.locator('[data-action=confirm-fusion]').dblclick();await expect(page.locator('.fusion-feedback')).toContainText('Đã tiến hóa');await expect(page.locator('.read-content')).toContainText('Quasar Cannon · cấp 5');await expect(page.locator('[data-action=ask-fusion]')).toHaveCount(0);
  const committed=await snapshot(page);expect(committed.modules).toEqual({plasma:5,quasar:5});expect(committed.pulses).toHaveLength(0);expect(committed.ionTraces).toHaveLength(0);
  for(const key of ['time','player','beacon','enemies','astronomy','corruption','xp','pending','picks','draftId','rerollsRemaining','masteryBonus','salvage','supports'] as const)expect(committed[key]).toEqual(before[key]);
  await page.waitForTimeout(300);expect((await snapshot(page)).time).toBe(before.time);await page.screenshot({path:`${folder}/${width}-committed.png`});await page.keyboard.press('b');await expect(page.locator('[data-action=resume]')).toBeVisible();expect((await snapshot(page)).phase).toBe('paused');
  // Resume bằng nút thật, để renderer/clock/weapon/combat bình thường chạy, không debug.advance.
  await page.locator('[data-action=resume]').click();await expect.poll(async()=>(await snapshot(page)).enemies[0].hp,{timeout:7000,intervals:[50]}).toBeLessThan(10000);await page.keyboard.press('Escape');const resumed=await snapshot(page);
  expect(10000-resumed.enemies[0].hp).toBeCloseTo(220*(1+0.4+0.1+0.18)*1.2*1.15,5);expect(resumed.metrics.pulsarHits).toBe(before.metrics.pulsarHits);expect(resumed.metrics.ionHits).toBe(before.metrics.ionHits);expect(resumed.pulses.every(p=>p.source==='quasar')).toBe(true);expect(resumed.time).toBeGreaterThan(before.time);
  await page.keyboard.press('b');await expect(page.locator('[data-action=ask-fusion]')).toHaveCount(0);await expect(page.locator('.read-content')).toContainText('Ô module trống');await page.keyboard.press('Escape');expect((await snapshot(page)).phase).toBe('paused');expect(errors).toEqual([]);
  writeFileSync(`${folder}/${width}-paused-click-resume.json`,JSON.stringify({geometry,before,committed,resumed,errors},null,2));
});
test('P02/P03/P07/P08/P10: base hỗ trợ, stale +2%, queue và reroll không đổi',async({page})=>{
  await start(page);await page.evaluate(()=>{const d=window.__eventide!;d.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{hull:1},pending:3,masteryBonus:{damage:1800,rate:0,hp:0,pickup:0,speed:0},nextSpawn:Infinity,xp:17});d.advance(1/60);});
  await expect(page.locator('[data-upgrade^=mastery-]')).toHaveCount(0);await page.locator('[data-action=reroll]').click();expect((await snapshot(page)).rerollsRemaining).toBe(0);const draft=(await snapshot(page)).draftId;
  await page.keyboard.press('b');await page.locator('[data-action=ask-fusion]').click();await page.locator('[data-action=confirm-fusion]').click();await page.keyboard.press('Escape');let s=await snapshot(page);expect(s.draftId).toBe(draft);expect(s.pending).toBe(3);expect(s.rerollsRemaining).toBe(0);expect(s.masteryBonus.damage).toBe(1800);await expect(page.locator('[data-upgrade^=mastery-]')).toHaveCount(0);
  // Draft cũ bị mutation: action phải refresh và render cùng ID, chưa tiêu pick.
  await page.evaluate(()=>window.__eventide!.patch({choices:['mastery-hp'],buildRevision:77}));await expect(page.locator('[data-upgrade=mastery-hp]')).toBeVisible();await page.waitForTimeout(220);await page.locator('[data-upgrade=mastery-hp]').click();await expect(page.locator('[data-upgrade=mastery-hp]')).toHaveCount(0);await expect(page.locator('.upgrade-panel')).toContainText('chưa tiêu lượt');s=await snapshot(page);expect(s.draftId).toBe(draft);expect(s.pending).toBe(3);expect(s.xp).toBe(17);expect(s.masteryBonus.hp).toBe(0);expect(s.rerollsRemaining).toBe(0);
  await page.evaluate(()=>window.__eventide!.patch({modules:{plasma:5,quasar:5,drones:5},supports:{hull:5,armor:4},choices:['armor'],rerollsRemaining:1,buildRevision:78}));await expect(page.locator('[data-upgrade=armor]')).toHaveCount(1);await expect(page.locator('[data-action=reroll]')).toBeDisabled();await expect(page.locator('[data-action=reroll]')).toHaveAttribute('title',/Không còn/);await page.waitForTimeout(220);await page.locator('[data-upgrade=armor]').click();await expect(page.locator('[data-upgrade^=mastery-]')).toHaveCount(3);s=await snapshot(page);expect(s.masteryBonus.damage).toBe(1800);expect(s.pending).toBe(2);expect(s.xp).toBe(17);
});
test('E05/E07: confirmation đang mở đọc state mới, thất bại có lý do và giữ nguyên liệu',async({page})=>{
  await start(page);await page.keyboard.press('Escape');await page.evaluate(()=>window.__eventide!.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{}}));await page.keyboard.press('b');await page.locator('[data-action=ask-fusion]').click();await page.evaluate(()=>window.__eventide!.patch({modules:{plasma:5,pulsar:5,ion:4}}));await page.locator('[data-action=confirm-fusion]').click();await expect(page.locator('.fusion-feedback')).toContainText('Cần Pulsar');expect((await snapshot(page)).modules).toEqual({plasma:5,pulsar:5,ion:4});await expect(page.locator('[data-action=ask-fusion]')).toHaveCount(0);await page.keyboard.press('Escape');await page.locator('[data-action=restart]').click();const fresh=await snapshot(page);expect(fresh.modules).toEqual({plasma:1});expect(fresh.weaponMasteryReached).toBe(false);expect(fresh.buildRevision).toBe(0);
});
test('fusion thật qua bảy lượt: handler/owner/texture không tăng sau warmup',async({page})=>{
  await page.goto('./?perf=1');await page.waitForFunction(()=>!!window.__eventidePerf);const cdp=await page.context().newCDPSession(page),rows=[];
  for(let i=0;i<7;i++){
    await page.locator('[data-action=start]').click();await page.keyboard.press('Escape');await page.evaluate(()=>window.__eventide!.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{hull:1}}));await page.keyboard.press('b');await page.locator('[data-action=ask-fusion]').click();await page.locator('[data-action=confirm-fusion]').click();expect((await snapshot(page)).modules).toEqual({plasma:5,quasar:5});
    await page.keyboard.press('Escape');await page.locator('[data-action=menu]').click();await cdp.send('HeapProfiler.collectGarbage');if(i>=2)rows.push({counts:await page.evaluate(()=>window.__eventidePerf!.counters()),dom:await cdp.send('Memory.getDOMCounters')});
  }
  expect(new Set(rows.map(r=>r.counts.textures)).size).toBe(1);expect(new Set(rows.map(r=>r.counts.sceneListeners)).size).toBe(1);expect(new Set(rows.map(r=>r.dom.jsEventListeners)).size).toBe(1);expect(rows.every(r=>r.counts.pulses===0&&r.counts.ionTraces===0&&r.counts.timers===0&&r.counts.tweens===0)).toBe(true);
  writeFileSync('artifacts/v141/fusion-lifecycle.json',JSON.stringify(rows,null,2));
});
