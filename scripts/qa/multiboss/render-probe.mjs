import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch(),rows=[];
try{
 for(const[label,port]of[['before',4200],['after',4201]]){
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  await context.addInitScript(()=>{
   localStorage.setItem('eventide.e2e.v1',JSON.stringify({saveVersion:3,settings:{muted:true,quality:'medium',shake:false}}));
   const p=window.__renderProbe={enabled:false,draws:0,vertices:0,switches:0,frames:[]};
   for(const type of[WebGLRenderingContext,WebGL2RenderingContext])for(const name of['drawElements','drawArrays','useProgram']){const original=type.prototype[name];type.prototype[name]=function(...args){if(p.enabled){if(name==='useProgram')p.switches++;else{p.draws++;p.vertices+=args[name==='drawArrays'?2:1];}}return original.apply(this,args);};}
   const sample=()=>{if(p.enabled&&p.frames.length<62)p.frames.push({draws:p.draws,vertices:p.vertices,switches:p.switches});p.draws=p.vertices=p.switches=0;requestAnimationFrame(sample);};requestAnimationFrame(sample);
  });
  const page=await context.newPage();await page.goto(`http://127.0.0.1:${port}/EVENTIDE/?perf=1`);await page.waitForFunction(()=>!!window.__eventidePerf);
  await page.evaluate(()=>{window.__eventidePerf.scenario('dense');window.__eventide.patch({phase:'paused'});});await page.waitForTimeout(500);await page.evaluate(()=>window.__renderProbe.enabled=true);await page.waitForFunction(()=>window.__renderProbe.frames.length===62);
  rows.push({label,entry:await page.locator('script[type=module]').getAttribute('src'),...await page.evaluate(()=>({frames:window.__renderProbe.frames.slice(2),counts:window.__eventidePerf.counters()}))});await context.close();
 }
 writeFileSync('artifacts/multiboss/render-probe.json',JSON.stringify({method:'Monkey-patch GL chỉ trong browser automation; dense cùng seed/Medium, pause snapshot để so draw/vertex, không phải benchmark FPS.',rows},null,2));for(const r of rows)console.log(r.label,r.frames[1]);
}finally{await browser.close();}
