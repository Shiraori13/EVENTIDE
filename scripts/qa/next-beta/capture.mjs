import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const [url='http://127.0.0.1:4300/EVENTIDE/',label='before']=process.argv.slice(2),dir=`artifacts/next-beta/${label}/ui`;
mkdirSync(dir,{recursive:true});const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'?perf=1');await page.locator('[data-action=start]').waitFor();
 const shot=async name=>{await page.waitForTimeout(200);await page.screenshot({path:`${dir}/${name}.png`});};
 await shot('menu');await page.locator('[data-action=core-wallet]').click();await shot('core');await page.keyboard.press('Escape');
 await page.locator('[data-action=start]').click();await shot('hud');await page.keyboard.press('b');await shot('build');await page.keyboard.press('b');
 await page.keyboard.press('Escape');await page.evaluate(()=>{const d=window.__eventide,s=d.snapshot();d.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{hull:5,armor:4},nextSpawn:Infinity});});
 await page.keyboard.press('b');await page.locator('[data-action=ask-fusion]').click();await shot('evolution-confirm');await page.locator('[data-action=cancel-fusion]').click();await page.keyboard.press('b');await page.locator('[data-action=resume]').click();
 await page.evaluate(()=>window.__eventide.xp(15));await page.locator('.upgrade-panel').waitFor();await shot('draft');await page.waitForTimeout(250);await page.keyboard.press('1');
 await page.evaluate(()=>window.__eventide.patch({time:720}));await page.locator('[data-action=restart]').waitFor();await shot('results');
 writeFileSync(`${dir}/capture.json`,JSON.stringify({url,entry:await page.locator('script[type=module]').getAttribute('src'),errors},null,2));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
