import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const args = Object.fromEntries(process.argv.slice(2).map(x => x.replace(/^--/, '').split('=')));
const folder = args.folder ?? 'artifacts/v13/long-run'; mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-precise-memory-info'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }), records = [], errors = [];
page.on('pageerror', e => errors.push(e.message));
const start = performance.now();
let completed = false;
try {
  await page.goto(`${args.url ?? 'http://127.0.0.1:4192'}/?perf=1`); await page.waitForFunction(() => !!window.__eventidePerf);
  await page.getByRole('button', { name: 'Khởi hành' }).click();
  await page.evaluate(() => window.__eventidePerf.longRun());
  while (performance.now() - start < 30 * 60 * 1000) {
    await page.waitForTimeout(10000);
    const checkpoint = await page.evaluate(() => {
      const s = window.__eventide.snapshot(), counts = window.__eventidePerf.counters();
      return { time: s.time, phase: s.phase, level: s.level, kills: s.kills, hp: s.player.hp, beaconHP: s.beacon.hp, bossSpawned: s.bossSpawned, bossPhase2At: s.bossPhase2At, bossDeathAt: s.bossDeathAt, finalGravity: s.finalGravity, modules: s.modules, supports: s.supports, salvage: s.salvage, metrics: s.metrics, careerKills: window.__eventide.save().careerKills, profile: window.__eventide.save(), reward: s.reward, created: s.loot.created, collected: s.loot.collected, ground: s.pickups.reduce((n, p) => n + p.value, 0) + s.loot.cells.reduce((n, c) => n + (c?.value ?? 0), 0), counters: counts };
    });
    checkpoint.wallSeconds = (performance.now() - start) / 1000; records.push(checkpoint);
    writeFileSync(`${folder}/checkpoints.json`, JSON.stringify(records, null, 2));
    process.stdout.write(`long-run ${checkpoint.phase} ${checkpoint.time.toFixed(1)}s wall=${checkpoint.wallSeconds.toFixed(1)} HP=${checkpoint.hp.toFixed(1)} Beacon=${checkpoint.beaconHP} XP=${checkpoint.created}/${checkpoint.collected}/${checkpoint.ground}\n`);
    if (checkpoint.created !== checkpoint.collected + checkpoint.ground) throw new Error('XP conservation failed');
    if (checkpoint.phase === 'victory' || checkpoint.phase === 'defeat') {
      const report = await page.evaluate(() => window.__eventidePerf.report());
      writeFileSync(`${folder}/report.json`, JSON.stringify({ ...report, seed: 42, scenario: 'autoplay-standard', buildEntry: await page.locator('script[type=module]').getAttribute('src'), quality: 'high', buildVersion: '1.3', modulePreference: ['plasma','pulsar','ion'], supportPair: ['hull', 'armor'], checkpoints: records, errors }, null, 2));
      await page.screenshot({ path: `${folder}/result.png` });
      if (checkpoint.phase !== 'victory' || checkpoint.time !== 720 || checkpoint.reward !== 17) throw new Error('long-run did not win 720s with standard stats');
      if (errors.length) throw new Error('pageerrors during long-run');
      completed = true;
      break;
    }
  }
  if (!completed) throw new Error('long-run exceeded 30 minutes without a valid result');
} finally { await browser.close(); }
