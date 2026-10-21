import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const [url='http://127.0.0.1:4196/EVENTIDE',label='before']=process.argv.slice(2),folder=`artifacts/visual-identity/${label}/visual`;
mkdirSync(folder,{recursive:true});const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(url+'/?perf=1');await page.locator('[data-action=start]').waitFor();await page.screenshot({path:`${folder}/menu.png`});
 await page.locator('[data-action=core]').click();await page.screenshot({path:`${folder}/core.png`});await page.locator('[data-action=back]').click();
 await page.locator('[data-action=start]').click();await page.waitForTimeout(800);await page.screenshot({path:`${folder}/early.png`});
 await page.evaluate(()=>window.__eventidePerf.scenario('dense'));await page.waitForTimeout(180);await page.screenshot({path:`${folder}/dense.png`});
 await page.keyboard.press('b');await page.screenshot({path:`${folder}/build.png`});await page.keyboard.press('b');
 await page.evaluate(()=>{const d=window.__eventide;d.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{hull:1},pending:2,phase:'playing',nextSpawn:Infinity});d.advance(1/60);});await page.waitForTimeout(100);await page.screenshot({path:`${folder}/draft.png`});
 const counts=await page.evaluate(()=>window.__eventidePerf.counters());
 await page.keyboard.press('Escape');await page.locator('[data-action=menu]').click();await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${folder}/menu-390.png`});
 const entry=await page.locator('script[type=module]').getAttribute('src');writeFileSync(`${folder}/capture.json`,JSON.stringify({url,label,entry,viewport:[1280,720],counts,errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
