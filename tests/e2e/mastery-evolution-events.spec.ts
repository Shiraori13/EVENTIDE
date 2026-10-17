import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder='artifacts/v141/visual'; mkdirSync(folder,{recursive:true});
async function start(page: import('@playwright/test').Page): Promise<void> { await page.goto('./?e2e=1'); await page.locator('[data-action=start]').click(); }
for(const width of [1024,1280,1920]) test(`beta mastery/fusion/action/queue và tiếng Việt ${width}`,async({page})=>{
  await page.setViewportSize({width,height:width===1024?576:width===1280?720:1080}); const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
  await page.evaluate(()=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({player:{...s.player,hp:120,maxHP:120},modules:{plasma:5,pulsar:5,ion:5},supports:{hull:5,armor:5},level:31,pending:3,nextSpawn:Infinity});d.advance(1/60);});
  await expect(page.locator('.upgrade-panel')).toContainText('Đủ ba vũ khí và hai hỗ trợ đạt trần');await expect(page.locator('[data-upgrade^=mastery-]')).toHaveCount(3);await expect(page.locator('[data-upgrade=drones]')).toHaveCount(0);await page.screenshot({path:`${folder}/${width}-mastery.png`});
  await page.locator('[data-action=reroll]').click();let s=await page.evaluate(()=>window.__eventide!.snapshot()!);const draft=s.draftId;expect(s.rerollsRemaining).toBe(0);
  await page.locator('[data-action=read-build]').click();await expect(page.locator('.stats-table th')).toContainText(['Chỉ số','Gốc','Hỗ trợ','Trang bị','Mastery','Tạm thời / ghi chú','Hiệu lực']);
  await page.locator('[data-action=ask-fusion]').click();await expect(page.locator('.fusion-confirm')).toBeVisible();await page.locator('[data-action=cancel-fusion]').click();expect((await page.evaluate(()=>window.__eventide!.snapshot()!)).modules).toEqual({plasma:5,pulsar:5,ion:5});
  await page.locator('[data-action=ask-fusion]').click();await page.locator('[data-action=confirm-fusion]').click();await expect(page.locator('.read-content')).toContainText('Quasar Cannon · cấp 5');await page.screenshot({path:`${folder}/${width}-fusion-build.png`});await page.keyboard.press('Escape');
  s=await page.evaluate(()=>window.__eventide!.snapshot()!);expect(s.modules).toEqual({plasma:5,quasar:5});expect(s.weaponMasteryReached).toBe(false);expect(s.pending).toBe(3);expect(s.draftId).toBe(draft);expect(s.choices).toEqual(expect.arrayContaining(['drones','well']));expect(s.rerollsRemaining).toBe(0);
  await page.waitForTimeout(220);await page.locator('[data-upgrade=drones]').click();s=await page.evaluate(()=>window.__eventide!.snapshot()!);expect(Object.values(s.masteryBonus).reduce((a,b)=>a+b,0)).toBe(0);expect(s.pending).toBe(2);const xp=s.xp,budget={...s.masteryBonus};
  await page.locator('[data-action=begin-replacement]').click();await expect(page.locator('[data-module=pulsar]')).toHaveCount(0);await page.locator('[data-module=well]').click();await expect(page.locator('.panel')).toContainText('cấp 1');await page.keyboard.press('Escape');s=await page.evaluate(()=>window.__eventide!.snapshot()!);expect(s.xp).toBe(xp);expect(s.masteryBonus).toEqual(budget);expect(s.pending).toBe(2);
  await page.locator('[data-action=begin-replacement]').click();await page.locator('[data-module=well]').click();await page.waitForTimeout(220);await page.locator('[data-old=plasma]').click();s=await page.evaluate(()=>window.__eventide!.snapshot()!);expect(s.weaponMasteryReached).toBe(false);expect(s.modules).toEqual({well:1,quasar:5,drones:1});expect(s.masteryBonus).toEqual(budget);expect(s.pending).toBe(1);expect(errors).toEqual([]);
  writeFileSync(`${folder}/${width}-transaction.json`,JSON.stringify(s,null,2));
});
test('beta Quasar/mastery/phase2/gravity và event lặp: FX/listener/texture hữu hạn, không modifier rò',async({page})=>{
  await page.goto('./?perf=1');await page.waitForFunction(()=>!!window.__eventidePerf);const rows=[];const cdp=await page.context().newCDPSession(page);
  for(let i=0;i<7;i++){
    for(const name of ['radiation','chaos','tide','quasar'] as const){
      await page.evaluate(name=>window.__eventidePerf!.scenario(name),name);await page.waitForTimeout(180);const c=await page.evaluate(()=>window.__eventidePerf!.counters());expect(c.enemies).toBe(110);expect(c.projectiles).toBeLessThanOrEqual(160);expect(c.pulses).toBeLessThanOrEqual(1);expect(c.ionTraces).toBeLessThanOrEqual(4);expect(c.astronomyActive).toBeLessThanOrEqual(1);expect(c.masteryBP).toBe(2000);
      if(i===6)await page.screenshot({path:`${folder}/stress-${name}.png`});
    }
    await page.keyboard.press('Escape');await page.locator('[data-action=menu]').click();await cdp.send('HeapProfiler.collectGarbage');if(i>=2)rows.push({counts:await page.evaluate(()=>window.__eventidePerf!.counters()),dom:await cdp.send('Memory.getDOMCounters')});
  }
  expect(new Set(rows.map(r=>r.counts.textures)).size).toBe(1);expect(new Set(rows.map(r=>r.counts.sceneListeners)).size).toBe(1);expect(new Set(rows.map(r=>r.dom.jsEventListeners)).size).toBe(1);expect(rows.every(r=>r.counts.tweens===0&&r.counts.timers===0&&r.counts.astronomyActive===0)).toBe(true);writeFileSync('artifacts/v141/beta-lifecycle.json',JSON.stringify(rows,null,2));
});
test('beta cạn mastery/fullHP: phục hồi hữu hạn, XP queue giữ; blur/read không làm mới draft',async({page})=>{
  await start(page);await page.evaluate(()=>{const d=window.__eventide!;d.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{hull:5,armor:5},masteryBonus:{damage:2000,rate:0,hp:0,pickup:0,speed:0},pending:2,xp:17,nextSpawn:Infinity});d.advance(1/60);});await expect(page.locator('[data-upgrade=recover]')).toContainText('Tiếp tục');await expect(page.locator('[data-action=reroll]')).toBeDisabled();
  const before=await page.evaluate(()=>window.__eventide!.snapshot()!);await page.keyboard.press('b');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.keyboard.press('Escape');await expect(page.locator('[data-action=resume]')).toBeVisible();await page.locator('[data-action=resume]').click();const after=await page.evaluate(()=>window.__eventide!.snapshot()!);expect(after.draftId).toBe(before.draftId);expect(after.masteryBonus).toEqual(before.masteryBonus);await page.waitForTimeout(220);await page.locator('[data-upgrade=recover]').click();await page.waitForTimeout(220);await page.locator('[data-upgrade=recover]').click();const final=await page.evaluate(()=>window.__eventide!.snapshot()!);expect(final.pending).toBe(0);expect(final.xp).toBe(17);expect(final.modules).toEqual(before.modules);await expect(page.locator('.hud')).toBeVisible();
});
test('beta event warning/active/end, chaos pause, stat sources/cleanup/reset và High/Low geometry',async({page})=>{
  await start(page);const records=[];
  for(const [id,time] of [['radiation',209],['radiation',211],['chaos',350],['tide',466.5],['tide',469.5]] as const){
    await page.evaluate(({time,id})=>{const d=window.__eventide!,s=d.snapshot()!;d.patch({phase:'playing',pending:0,choices:[],time,modules:{quasar:5,plasma:5},player:{...s.player,x:id==='radiation'?900:1050,y:id==='radiation'?300:0,previousX:id==='radiation'?900:1050,previousY:id==='radiation'?300:0,protectedUntil:Infinity},pickups:[],loot:{...s.loot,cells:s.loot.cells.map(()=>null),ledgerCount:0,ledgerXP:0,created:0,collected:0},nextSpawn:Infinity,enemies:[]});d.spawn('drifter',id==='radiation'?1000:1150,id==='radiation'?300:0);d.advance(1/60);},{time,id});
    await expect(page.locator('#astronomy')).toBeVisible();await page.waitForTimeout(150);await page.screenshot({path:`${folder}/${id}-${time}-high.png`});records.push(await page.evaluate(()=>window.__eventide!.snapshot()));
    if(id==='chaos'){await page.keyboard.press('b');await expect(page.locator('.stats-table')).toContainText('sự kiện × 1,15');await page.keyboard.press('Escape');}
  }
  await page.evaluate(()=>{const d=window.__eventide!;d.seedSave({settings:{...d.save().settings,quality:'low',reducedEffects:true}});d.patch({time:469.5,phase:'playing'});d.advance(1/60);});await page.waitForTimeout(150);await page.screenshot({path:`${folder}/tide-low.png`});
  await page.keyboard.press('Escape');const frozen=await page.evaluate(()=>window.__eventide!.snapshot()!);await page.waitForTimeout(250);expect((await page.evaluate(()=>window.__eventide!.snapshot()!)).time).toBe(frozen.time);await page.locator('[data-action=resume]').click();
  await page.evaluate(()=>{const d=window.__eventide!;d.patch({time:510});d.advance(1/60);});await expect(page.locator('#astronomy')).toBeHidden();expect((await page.evaluate(()=>window.__eventide!.snapshot()!)).gravity).toBeUndefined();
  await page.keyboard.press('Escape');await page.locator('[data-action=restart]').click();const reset=await page.evaluate(()=>window.__eventide!.snapshot()!);expect(reset.astronomy.every(e=>e.phase==='scheduled')).toBe(true);expect(reset.masteryBonus.damage).toBe(0);writeFileSync(`${folder}/events-state.json`,JSON.stringify(records,null,2));
});
