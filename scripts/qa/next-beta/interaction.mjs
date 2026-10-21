import { chromium } from '@playwright/test';
import { mkdirSync,writeFileSync } from 'node:fs';
const folder='artifacts/next-beta/interaction';mkdirSync(folder,{recursive:true});
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:folder,size:{width:1280,height:720}}});
await context.addInitScript(()=>localStorage.setItem('eventide.e2e.v1',JSON.stringify({saveVersion:3,settings:{muted:true,quality:'medium',shake:false}})));
const page=await context.newPage(),rows=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
async function sample(label){rows.push({label,...await page.evaluate(()=>{const s=window.__eventide.snapshot();return{time:s.time,phase:s.phase,x:s.player.x,y:s.player.y,hp:s.player.hp,beacon:s.beacon.hp,seen:window.__eventide.save().tutorialSeen};})});}
async function hold(key,seconds){await page.keyboard.down(key);for(let i=0;i<seconds*2;i++){await page.waitForTimeout(500);await sample(key);}await page.keyboard.up(key);}
try{
 await page.goto('http://127.0.0.1:4301/EVENTIDE/?perf=1');await page.locator('[data-action=start]').click();await hold('d',4);if(await page.locator('.upgrade-panel').isVisible()){await page.waitForTimeout(200);await page.keyboard.press('1');}await hold('a',2);await page.keyboard.press('b');await sample('build-paused');await page.waitForTimeout(700);await page.keyboard.press('Escape');await hold('w',1);
 await page.evaluate(()=>{const d=window.__eventide,s=d.snapshot();d.patch({phase:'playing',pending:0,choices:[],rerollsRemaining:0,swapSelecting:false,time:665,nextSpawn:Infinity,nextPlasma:665,modules:{plasma:5,quasar:5},supports:{hull:5,armor:5},enemies:[],projectiles:[],bossZones:[],pickups:[],astronomy:[],bossSpawned:true,player:{...s.player,x:850,y:100,hp:150,maxHP:150},gravity:{x:1100,y:300,start:666,end:720,final:true},finalGravity:true});d.spawn('helion',1150,100);d.spawn('harrier',850,-180);});
 await hold('w',2);await hold('d',2);await hold('s',2);await hold('a',2);await page.screenshot({path:`${folder}/duo.png`});await page.keyboard.press('b');await sample('duo-build-paused');await page.waitForTimeout(700);await page.keyboard.press('Escape');await hold('d',1);
 writeFileSync(`${folder}/state.json`,JSON.stringify({method:'Đầu lượt đi bằng Playwright keyboard thật; cảnh cuối khởi tạo fixture hai boss+gravity rồi input/clock/render bình thường. Không phải người chơi hoặc đo latency.',entry:await page.locator('script[type=module]').getAttribute('src'),rows,errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await context.close();await browser.close();}
