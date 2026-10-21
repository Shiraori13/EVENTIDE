import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder='artifacts/visual-identity/after/motion';mkdirSync(folder,{recursive:true});
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:folder,size:{width:1280,height:720}}});
try{
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4197/EVENTIDE/?perf=1');await page.locator('[data-action=start]').waitFor();await page.waitForTimeout(2500);await page.locator('[data-action=start]').click();
 for(const keys of[['w','d'],['a'],['s','d'],[]]){for(const key of keys)await page.keyboard.down(key);await page.waitForTimeout(950);for(const key of keys)await page.keyboard.up(key);}
 await page.evaluate(()=>window.__eventidePerf.scenario('endgame'));await page.waitForTimeout(4500);await page.keyboard.press('b');await page.waitForTimeout(800);await page.keyboard.press('b');
 await page.keyboard.press('Escape');await page.evaluate(()=>window.__eventide.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{hull:5,armor:5}}));await page.keyboard.press('b');await page.locator('[data-action=ask-fusion]').click();await page.waitForTimeout(700);await page.locator('[data-action=confirm-fusion]').click();await page.waitForTimeout(900);await page.keyboard.press('b');await page.locator('[data-action=resume]').click();await page.waitForTimeout(3000);
 const entry=await page.locator('script[type=module]').getAttribute('src');writeFileSync(`${folder}/recording.json`,JSON.stringify({url:page.url(),entry,quality:'medium (new test profile)',automation:'real keyboard/click; dense fixture + max sources patch test-only',errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await context.close();await browser.close();}
