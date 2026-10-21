import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
const args = Object.fromEntries(process.argv.slice(2).map(x => x.replace(/^--/, '').split('=')));
if (existsSync('artifacts/vnext/pause-measurements.flag')) { process.stderr.write('Measurements paused before starting another browser.\n'); process.exit(2); }
const label = args.label ?? 'baseline', url = args.url ?? 'http://127.0.0.1:4175', seconds = Number(args.seconds ?? 60), warmup = Number(args.warmup ?? 10), repeats = Number(args.repeats ?? 3);
const folder = `${args.root ?? "artifacts/vnext"}/${label}`; mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ headless: args.headed !== '1', args: ['--enable-precise-memory-info', ...(args.renderer === 'canvas' ? ['--disable-webgl'] : [])] });
const results = args.append === '1' ? JSON.parse(readFileSync(`${folder}/results.json`, 'utf8')) : [];
try {
  for (let repeat = 0; repeat < repeats; repeat++) for (const scenario of (args.scenarios?.split(',') ?? ['light', 'dense', 'xp', 'endgame'])) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await context.addInitScript(({quality,reducedMotion,quiet}) => {
      // Profile QA yên tĩnh giúp A/B không khác nhau vì onboarding/toast mới. Không đổi luật fixture.
      const badges=['kills-100','kills-500','kills-1000','kills-2500','kills-5000','drifters-50','leeches-50','run-kills-250','survive-180','survive-360','survive-600','victory-1','victory-5','beacon-healthy','ship-healthy','mini-sun','supernova','pulsar-hit','ion-hit','elder-final','elder-phase2','core-1','core-max','salvage-1','salvage-1000','salvage-2000','corruption-30','light-healing-50'];
      localStorage.setItem('eventide.e2e.v1', JSON.stringify({ saveVersion:quiet?3:1, currency:0,coreLevel:0,echo:false,unlockedAchievements:quiet?badges:[],settings:{muted:true,volume:0.35,reducedEffects:false,reducedMotion,shake:false,quality,tutorial:!quiet} }));
    }, {quality:args.quality ?? 'high',reducedMotion:args.motion==='reduce',quiet:args.quiet==='1'});
    const page = await context.newPage(), cdp = await context.newCDPSession(page); await cdp.send('Performance.enable');
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${url}/?perf=1`); await page.waitForFunction(() => !!window.__eventidePerf);
    await page.evaluate(name => window.__eventidePerf.scenario(name), scenario);
    if (args.pinned === '1') await page.evaluate(({ name, visible }) => {
      const debug = window.__eventide, state = debug.snapshot(), counts = { light: 18, dense: 100, xp: 220, endgame: 140, storm: 140, quasar: 140, radiation: 140, chaos: 140, tide: 140, duo:140 }, totals = { light: 90, dense: 500, xp: 12000, endgame: 700, storm: 700, quasar: 700, radiation: 700, chaos: 700, tide: 700, duo:700 };
      const count = counts[name], total = totals[name], base = Math.floor(total / count), extra = total % count;
      const pickups = Array.from({ length: count }, (_, i) => ({ id: state.nextId + i, x: visible ? -360 - (i * 73 % 80) : -1000 - (i * 73 % 600), y: visible ? 60 + (i * 29 % 100) : -400 + (i * 29 % 800), value: base + Number(i < extra), created: state.time - 10, state: 'available' }));
      const patch = { pickups, nextId: state.nextId + count };
      if (name === 'light') Object.assign(patch, { modules: { plasma: 1 }, supports: {}, wells: [], nextWell: Infinity, effects: [] });
      if (state.loot) patch.loot = { ...state.loot, cells: state.loot.cells.map(() => null), ledgerCount: 0, ledgerXP: 0, created: total, collected: 0 };
      debug.patch(patch);
    }, { name: scenario, visible: args.visible === '1' });
    await page.waitForTimeout(warmup * 1000); await page.evaluate(() => {
      window.__eventidePerf.reset();
      // rAF probe độc lập còn đo >100ms cho bundle baseline cũ chưa có trường này.
      window.__qaFrameProbe={samples:[],last:0,active:true};
      const tick=now=>{const p=window.__qaFrameProbe;if(!p.active)return;if(p.last&&p.samples.length<50000)p.samples.push(now-p.last);p.last=now;requestAnimationFrame(tick);};requestAnimationFrame(tick);
    });
    const start = await cdp.send('Performance.getMetrics');
    await page.waitForTimeout(seconds * 1000); const end = await cdp.send('Performance.getMetrics');
    const report = await page.evaluate(() => window.__eventidePerf.report());
    report.externalRAF=await page.evaluate(()=>{const p=window.__qaFrameProbe;p.active=false;const data=p.samples.sort((a,b)=>a-b);return{samples:data.length,p50:data[Math.floor(data.length*.5)],p95:data[Math.floor(data.length*.95)],over50:data.filter(x=>x>50).length,over100:data.filter(x=>x>100).length};});
    report.quietProfile=args.quiet==='1';report.reducedMotion=args.motion==='reduce';report.protocol = args.pinned === '1' ? args.visible === '1' ? 'pinned-visible-local-loot-v3' : 'pinned-local-loot-v2' : 'exploratory-v1';
    report.quality = args.quality ?? 'high'; report.shake = false; report.buildEntry = await page.locator('script[type=module]').getAttribute('src');
    if (args.pinned === '1' && report.counters.end.groundXP !== { light: 90, dense: 500, xp: 12000, endgame: 700, storm: 700, quasar: 700, radiation: 700, chaos: 700, tide: 700, duo:700 }[scenario]) throw new Error('Pinned ground XP changed');
    const heap = await cdp.send('Memory.getDOMCounters');
    results.push({ label, repeat: repeat + 1, seconds, warmup, reference: { platform: os.platform(), release: os.release(), cpu: os.cpus()[0]?.model, logicalCpus: os.cpus().length, memory: os.totalmem(), browser: browser.version(), refreshRate: 'headless rAF, not a physical display' }, ...report, cdp: { start: start.metrics, end: end.metrics, dom: heap }, errors });
    if (args.append === '1') {
      const latest = results.at(-1), prior = results.findIndex((r, index) => index < results.length - 1 && r.scenario === latest.scenario && r.repeat === latest.repeat);
      if (prior >= 0) { results[prior] = latest; results.pop(); }
    }
    writeFileSync(`${folder}/results.json`, JSON.stringify(results, null, 2));
    await page.screenshot({ path: `${folder}/${scenario}-${repeat + 1}.png` });
    process.stdout.write(`${label} ${scenario} #${repeat + 1} ${JSON.stringify(report.metrics.frame)}\n`);
    await context.close();
  }
} finally { await browser.close(); }
