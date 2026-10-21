import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder='artifacts/multiboss/interaction';mkdirSync(folder,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:folder,size:{width:1280,height:720}}});
await context.addInitScript(()=>localStorage.setItem('eventide.e2e.v1',JSON.stringify({saveVersion:3,currency:0,settings:{muted:true,quality:'medium',shake:false,reducedMotion:false}})));
const page=await context.newPage(),rows=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
const sample=async label=>rows.push({label,...await page.evaluate(()=>{const s=window.__eventide.snapshot();return{time:s.time,phase:s.phase,player:s.player,beacon:s.beacon,bosses:s.enemies.filter(e=>e.boss),zones:s.bossZones,gravity:s.gravity,astronomy:s.astronomy};})});
const hold=async(key,seconds,label)=>{await page.keyboard.down(key);for(let i=0;i<seconds*2;i++){await page.waitForTimeout(500);await sample(label);}await page.keyboard.up(key);};
try{
 await page.goto('http://127.0.0.1:4201/EVENTIDE/?e2e=1');await page.locator('[data-action=start]').click();
 await page.evaluate(()=>{const d=window.__eventide,s=d.snapshot();d.patch({time:207,nextSpawn:Infinity,nextPlasma:Infinity,pickups:[],player:{...s.player,x:700,y:0}});d.advance(.02);});
 await sample('radiation-warning');await page.screenshot({path:`${folder}/radiation-warning.png`});await page.waitForTimeout(3100);
 for(let i=0;i<6;i++){await page.waitForTimeout(1000);await sample('radiation-standing');}
 await page.screenshot({path:`${folder}/radiation-active.png`});await hold('s',2,'radiation-exit-S');
 await page.evaluate(()=>{const d=window.__eventide,s=d.snapshot();d.patch({time:462,player:{...s.player,x:700,y:0,hp:100,maxHP:100},enemies:[],bossZones:[],gravity:undefined});d.advance(.02);});
 await sample('tide-warning');await page.waitForTimeout(3100);await hold('d',2,'tide-inward-D');await hold('w',2,'tide-turn-W');await page.screenshot({path:`${folder}/tide-outward.png`});await hold('a',2,'tide-outward-A');
 await page.evaluate(()=>{const d=window.__eventide,s=d.snapshot();d.patch({time:665,phase:'playing',player:{...s.player,x:850,y:100,hp:150,maxHP:150},modules:{plasma:5,quasar:5},supports:{hull:5,armor:5},bossSpawned:true,bossZones:[],enemies:[],gravity:{x:1100,y:300,start:666,end:720,final:true},finalGravity:true,nextPlasma:665});d.spawn('helion',1150,100);d.spawn('harrier',850,-180);d.advance(.02);});
 await page.screenshot({path:`${folder}/duo-visible.png`});await hold('w',2,'duo-W');await hold('d',2,'duo-D');await hold('s',2,'duo-S');await hold('a',2,'duo-A');
 await page.keyboard.press('b');await sample('build-paused');await page.screenshot({path:`${folder}/paused-build.png`});await page.waitForTimeout(1000);await page.keyboard.press('Escape');await hold('d',2,'duo-resumed');
 writeFileSync(`${folder}/state.json`,JSON.stringify({method:'Fixture QA khởi tạo bằng debug; chuyển động bằng Playwright keyboard.down/up thật, clock/render thời gian thực; không phải playtest do người điều khiển.',entry:await page.locator('script[type=module]').getAttribute('src'),rows,errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await context.close();await browser.close();}
