import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const dir='artifacts/v14/visual';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch();
try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4194/?e2e=1');await page.locator('[data-action=start]').click();
  await page.evaluate(()=>{const d=window.__eventide,s=d.snapshot();d.patch({time:211,nextSpawn:Infinity,player:{...s.player,x:900,y:300},pickups:[],loot:{...s.loot,cells:s.loot.cells.map(()=>null),ledgerXP:0,ledgerCount:0,created:0,collected:0}});d.advance(1/60);});
  await page.locator('#astronomy').waitFor({state:'visible'});await page.locator('#profile-toast').waitFor({state:'visible'});
  const indicator=await page.locator('#astronomy').boundingBox(),toast=await page.locator('#profile-toast').boundingBox();
  const overlap=indicator.x<toast.x+toast.width&&indicator.x+indicator.width>toast.x&&indicator.y<toast.y+toast.height&&indicator.y+indicator.height>toast.y;
  if(overlap)throw Error('Toast overlaps event indicator');await page.screenshot({path:`${dir}/toast-event-clear.png`});
  await page.reload();await page.waitForFunction(()=>!!window.__eventide);await page.evaluate(()=>window.__eventide.seedSave({coreLevel:3}));await page.locator('[data-action=start]').click();
  await page.evaluate(()=>{const d=window.__eventide;d.patch({nextSpawn:Infinity,modules:{}});d.spawn('wisp',0,0,'beacon');d.advance(1/60);d.patch({phase:'paused'});});
  await page.addStyleTag({content:'.overlay,#profile-toast{display:none!important}'});await page.waitForTimeout(100);
  const damaged=await page.evaluate(()=>window.__eventide.snapshot());if(damaged.beacon.hp>=damaged.beacon.maxHP)throw Error('Beacon did not actually take damage');
  await page.screenshot({path:`${dir}/beacon-damage-core3.png`});
  await page.evaluate(()=>{const d=window.__eventide,s=d.snapshot();d.patch({time:s.time+0.3});});await page.waitForTimeout(100);await page.screenshot({path:`${dir}/beacon-restored-core3.png`});
  const entry=await page.locator('script[type=module]').getAttribute('src');if(errors.length)throw Error(errors.join('\n'));
  writeFileSync('artifacts/v14/visual-qa-final.json',JSON.stringify({entry,indicator,toast,overlap,beaconDamage:{hp:damaged.beacon.hp,maxHP:damaged.beacon.maxHP,lastHit:damaged.beacon.lastHit,time:damaged.time},errors},null,2));
  console.log(JSON.stringify({entry,overlap,beaconLostHP:damaged.beacon.maxHP-damaged.beacon.hp,errors}));
}finally{await browser.close();}
