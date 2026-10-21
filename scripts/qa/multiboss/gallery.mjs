import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder='artifacts/multiboss/gallery';mkdirSync(folder,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1280,height:720}}),rows=[];
try{
 for(const kind of ['elder','gravemaw','helion','harrier'])for(const phase of ['phase1','phase2']){
  await page.goto('http://127.0.0.1:4201/EVENTIDE/?e2e=1');await page.locator('[data-action=start]').click();
  await page.evaluate(({kind,phase})=>{const d=window.__eventide,s=d.snapshot();d.patch({time:550,phase:'playing',bossSpawned:true,astronomy:[],enemies:[],bossZones:[],projectiles:[],pickups:[],player:{...s.player,x:700,y:0},nextSpawn:Infinity,nextGravity:Infinity,nextPlasma:Infinity,finalGravity:true});const id=d.spawn(kind,1000,0),next=d.snapshot(),boss=next.enemies.find(e=>e.id===id);boss.bossPhase=phase;if(phase==='phase2')boss.hp=boss.maxHP=boss.maxHP*.65;Object.assign(boss.boss,{readyAt:550,spawnUntil:0,actionIndex:kind==='elder'?1:0});d.patch({enemies:next.enemies});d.advance(.02);},{kind,phase});
  await page.waitForTimeout(150);await page.screenshot({path:`${folder}/${kind}-${phase}.png`});rows.push({kind,phase,state:await page.evaluate(()=>window.__eventide.snapshot())});
 }
 writeFileSync(`${folder}/states.json`,JSON.stringify({method:'Gallery fixture dựng phase để review silhouette/telegraph ở clock thường; không giả là chuyển phase tự nhiên. Transition thực được test riêng.',rows},null,2));
}finally{await browser.close();}
