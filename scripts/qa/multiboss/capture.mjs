import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const [url='http://127.0.0.1:4200/EVENTIDE/',label='before']=process.argv.slice(2),folder=`artifacts/multiboss/${label}/ui`;
mkdirSync(folder,{recursive:true});const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),rows=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'?perf=1');await page.locator('[data-action=start]').waitFor();
 const capture=async name=>{await page.waitForTimeout(250);rows.push({name,pseudo:await page.locator('.menu h1,.panel h2').evaluateAll(els=>els.map(el=>{const before=getComputedStyle(el,'::before'),after=getComputedStyle(el,'::after');return{owner:el.tagName,title:el.textContent,before:{content:before.content,width:before.width,height:before.height,border:before.border,position:before.position},after:{content:after.content,width:after.width,height:after.height,border:after.border,position:after.position}};}))});await page.screenshot({path:`${folder}/${name}.png`});};
 await capture('menu');await page.mouse.move(590,170);await capture('menu-mouse');await page.mouse.move(-10,-10);await page.keyboard.press('Tab');await capture('menu-keyboard');
 await page.locator('[data-action=read-achievements]').click();await capture('achievements');await page.keyboard.press('Escape');
 await page.locator('[data-action=start]').click();await page.keyboard.press('b');await capture('build');await page.keyboard.press('b');await page.evaluate(()=>window.__eventide.xp(15));await capture('draft');
 writeFileSync(`${folder}/owners.json`,JSON.stringify({url,entry:await page.locator('script[type=module]').getAttribute('src'),rows,errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
