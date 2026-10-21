import { chromium } from '@playwright/test';
import { mkdirSync,writeFileSync } from 'node:fs';
const folder='artifacts/next-beta/rendered-run';mkdirSync(folder,{recursive:true});
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});
await context.addInitScript(()=>localStorage.setItem('eventide.e2e.v1',JSON.stringify({saveVersion:3,settings:{muted:true,quality:'medium',reducedMotion:false,shake:false}})));
const page=await context.newPage(),errors=[],rows=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto('http://127.0.0.1:4301/EVENTIDE/?perf=1');await page.waitForFunction(()=>!!window.__eventidePerf);
 const entry=await page.locator('script[type=module]').getAttribute('src');
 await page.evaluate(()=>window.__eventidePerf.longRun(42,true));const started=Date.now();let lastMinute=-1;
 while(Date.now()-started<25*60*1000){
  await page.waitForTimeout(1000);const row=await page.evaluate(()=>{const s=window.__eventide.snapshot();return{time:s.time,phase:s.phase,hp:s.player.hp,beacon:s.beacon.hp,level:s.level,kills:s.kills,modules:s.modules,supports:s.supports,bosses:s.enemies.filter(e=>e.boss).map(e=>({id:e.id,kind:e.kind,phase:e.bossPhase,hp:e.hp})),zones:s.bossZones.length,telemetry:s.telemetry,settled:s.settled};});
  rows.push(row);writeFileSync(`${folder}/progress.json`,JSON.stringify({entry,wallSeconds:(Date.now()-started)/1000,latest:row,errors},null,2));
  const minute=Math.floor(row.time/60);if(minute>lastMinute||row.settled){lastMinute=minute;await page.screenshot({path:`${folder}/${minute.toString().padStart(2,'0')}-${row.phase}.png`});process.stdout.write(`Rendered: ${row.time.toFixed(1)}s ${row.phase} HP=${row.hp.toFixed(2)}, Beacon=${row.beacon}\n`);}
  if(row.settled)break;
 }
 const snapshot=await page.evaluate(()=>window.__eventide.snapshot()),counts=await page.evaluate(()=>window.__eventidePerf.counters());
 writeFileSync(`${folder}/result.json`,JSON.stringify({method:'Bot QA seed42/defense/fusion, clock bình thường, render toàn lượt; không patch HP/XP/time. Có thể cùng lúc kiểm thử UI; không dùng lượt này để chứng nhận FPS/input latency hoặc chơi tay.',entry,wallSeconds:(Date.now()-started)/1000,rows,snapshot,counts,errors},null,2));
 if(errors.length||!snapshot.settled||snapshot.time!==720)throw Error(`Chưa đủ720s: ${snapshot.phase} ${snapshot.time}; errors=${errors.length}`);
}finally{await context.close();await browser.close();}
