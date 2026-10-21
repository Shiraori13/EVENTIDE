import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
// Probe chỉ trong browser automation, không cài vào source game hoặc bundle production.
const browser=await chromium.launch(),rows=[];
try{
 for(const [label,port]of[['baseline',4196],['pre-batching',4198],['final',4197]])for(const scenario of['dense','endgame']){
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  await context.addInitScript(()=>{
   const p=window.__renderProbe={draws:0,switches:0,vertices:0,enabled:false,frames:[]};
   for(const type of[WebGLRenderingContext,WebGL2RenderingContext])for(const name of['drawElements','drawArrays','useProgram']){
    const original=type.prototype[name];type.prototype[name]=function(...args){if(p.enabled){if(name==='useProgram')p.switches++;else{p.draws++;p.vertices+=args[name==='drawArrays'?2:1];}}return original.apply(this,args);};
   }
   const sample=()=>{if(p.enabled&&p.frames.length<120)p.frames.push({draws:p.draws,switches:p.switches,vertices:p.vertices});p.draws=p.switches=p.vertices=0;requestAnimationFrame(sample);};requestAnimationFrame(sample);
  });
  const page=await context.newPage();await page.goto(`http://127.0.0.1:${port}/EVENTIDE/?perf=1`);await page.waitForFunction(()=>!!window.__eventidePerf);
  await page.evaluate(name=>{window.__eventidePerf.scenario(name);window.__eventide.patch({phase:'paused'});},scenario);await page.waitForTimeout(200);
  await page.evaluate(()=>{window.__renderProbe.enabled=true;});await page.waitForTimeout(1200);
  const row=await page.evaluate(()=>({probe:window.__renderProbe.frames.slice(2),counters:window.__eventidePerf.counters(),state:window.__eventide.snapshot().time,quality:window.__eventide.save().settings.quality})),entry=await page.locator('script[type=module]').getAttribute('src');rows.push({label,scenario,entry,...row});await context.close();
 }
 writeFileSync('artifacts/visual-identity/batches.json',JSON.stringify(rows,null,2));
 for(const row of rows){const median=key=>row.probe.map(v=>v[key]).sort((a,b)=>a-b)[Math.floor(row.probe.length/2)];console.log(`${row.label} ${row.scenario} draws=${median('draws')} switches=${median('switches')} vertices=${median('vertices')}`);}
}finally{await browser.close();}
