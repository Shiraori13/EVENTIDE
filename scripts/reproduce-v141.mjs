import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder = 'artifacts/v141/reproduction'; mkdirSync(folder, {recursive:true});
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1280,height:720}});
  await page.goto((process.argv[2] ?? 'http://127.0.0.1:4194')+'/?e2e=1'); await page.locator('[data-action=start]').click();
  await page.evaluate(() => { const d=window.__eventide; d.patch({modules:{plasma:5,pulsar:5,ion:5},supports:{hull:1},pending:2,nextSpawn:Infinity,masteryBonus:{damage:1800,rate:0,hp:0,pickup:0,speed:0}}); d.advance(1/60); });
  await page.waitForTimeout(150); const draft=await page.evaluate(()=>window.__eventide.snapshot());
  await page.screenshot({path:`${folder}/early-mastery.png`}); await page.keyboard.press('Escape'); await page.keyboard.press('b');
  await page.locator('[data-action=ask-fusion]').click();
  const geometry=await page.locator('[data-action=confirm-fusion]').evaluate(el=>{const r=el.getBoundingClientRect(),sc=el.closest('.read-content'),c=sc.getBoundingClientRect();return{buttonTop:r.top,buttonBottom:r.bottom,scrollTop:sc.scrollTop,scrollHeight:sc.scrollHeight,clientHeight:sc.clientHeight,clipTop:c.top,clipBottom:c.bottom,inViewport:r.top>=c.top&&r.bottom<=c.bottom,focus:document.activeElement?.getAttribute('data-action')};});
  await page.screenshot({path:`${folder}/hidden-confirmation.png`}); const frozen=await page.evaluate(()=>window.__eventide.snapshot());
  // Click này auto-scroll để phân biệt commit hoạt động với xác nhận bị giấu.
  await page.locator('[data-action=confirm-fusion]').click(); const committed=await page.evaluate(()=>window.__eventide.snapshot());
  writeFileSync(`${folder}/baseline.json`,JSON.stringify({draft,geometry,frozen,committed},null,2));
  console.log(JSON.stringify({choices:draft.choices,supports:draft.supports,geometry,phase:committed.phase,modules:committed.modules,timeUnchanged:frozen.time===committed.time},null,2));
} finally { await browser.close(); }
