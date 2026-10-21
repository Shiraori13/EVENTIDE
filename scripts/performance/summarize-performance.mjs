import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const fmt = n => Number(n).toFixed(1);
const before = [1, 2, 3].flatMap(i => read(`artifacts/vnext/before-controlled-${i}/results.json`));
const after = [1, 2, 3].flatMap(i => read(`artifacts/vnext/after-controlled-${i}/results.json`));
if (before.length !== 12 || after.length !== 12) throw new Error('Need 3 complete repetitions for each build');
if (new Set(after.map(x => x.buildEntry)).size !== 1) throw new Error('After measurements include more than one build; rerun the affected rows');
if (new Set(before.map(x => x.buildEntry)).size !== 1) throw new Error('Baseline measurements include more than one build');
for (const r of [...before, ...after]) {
  if (r.seconds !== 60 || r.warmup !== 10 || r.seed !== 20261016 || r.quality !== 'high' || r.dpr !== 1 || r.viewport.join('x') !== '1280x720' || r.canvas.join('x') !== '1280x720' || r.renderer !== 'WebGL' || r.errors.length || !r.metrics.frame.samples) throw new Error(`Invalid controlled sample: ${r.label}/${r.scenario}`);
}
for (const r of after) if (r.counters.end.starCanvasWidth !== 1280 || r.counters.end.starCanvasHeight !== 720) throw new Error('Background canvas regression');
const rows = [], cpu = [], browserCPU = [], summary = [];
for (const [scenario, total] of Object.entries({ light: 90, dense: 500, xp: 12000, endgame: 700 })) {
  const a = before.filter(r => r.scenario === scenario), b = after.filter(r => r.scenario === scenario);
  for (const r of [...a, ...b]) if (r.protocol !== 'pinned-local-loot-v2' || r.counters.start.groundXP !== total || r.counters.end.groundXP !== total) throw new Error(`Invalid XP protocol: ${scenario}`);
  const metric = (list, key) => median(list.map(r => r.metrics.frame[key]));
  const counts = list => `${median(list.map(r => r.counters.average.enemies))}/${fmt(median(list.map(r => r.counters.average.projectiles)))}/${fmt(median(list.map(r => r.counters.average.pickupLogic)))}/${fmt(median(list.map(r => r.counters.average.pickupVisuals)))}`;
  const stats = list => `${fmt(metric(list, 'median'))} / ${fmt(metric(list, 'p95'))} / ${fmt(metric(list, 'p99'))}`;
  const heap = list => `${fmt(median(list.map(r => r.heap.start)) / 1048576)}→${fmt(median(list.map(r => r.heap.end)) / 1048576)}MiB`;
  rows.push(`| ${scenario} | MVP →1.1 /20261016 | High/DPR1/1280×720/WebGL SwiftShader | ${counts(a)} → ${counts(b)} | ${stats(a)} → ${stats(b)} | ${metric(a, 'over50')} → ${metric(b, 'over50')} | ${heap(a)} → ${heap(b)} | XP map=${total} cả hai |`);
  cpu.push(`| ${scenario} | ${fmt(median(a.map(r => r.metrics.sceneCPU.p95)))} → ${fmt(median(b.map(r => r.metrics.sceneCPU.p95)))} | ${fmt(median(a.map(r => r.metrics.pickupCPU.p95)))} → ${fmt(median(b.map(r => r.metrics.pickupCPU.p95)))} | ${fmt(median(a.map(r => r.metrics.combatCPU.p95)))} → ${fmt(median(b.map(r => r.metrics.combatCPU.p95)))} |`);
  const duration = (list, name) => fmt(median(list.map(r => r.cdp.end.find(m => m.name === name).value - r.cdp.start.find(m => m.name === name).value)));
  browserCPU.push(`| ${scenario} | ${duration(a, 'ScriptDuration')} → ${duration(b, 'ScriptDuration')} | ${duration(a, 'LayoutDuration')} → ${duration(b, 'LayoutDuration')} | ${duration(a, 'TaskDuration')} → ${duration(b, 'TaskDuration')} |`);
  summary.push({ scenario, before: { p50: metric(a, 'median'), p95: metric(a, 'p95'), p99: metric(a, 'p99'), over50: metric(a, 'over50') }, after: { p50: metric(b, 'median'), p95: metric(b, 'p95'), p99: metric(b, 'p99'), over50: metric(b, 'over50') }, p95ReductionPercent: +(100 * (1 - metric(b, 'p95') / metric(a, 'p95'))).toFixed(1) });
}
let section = `| Scenario | Build/seed | Quality/DPR/viewport | Quái/đạn/pickup logic/visual (mean mỗi lượt, median3) | p50/p95/p99 frame ms | Frames >50ms/60s | Heap đầu→cuối (bao gồm probe) | Ghi chú |\n|---|---|---|---|---|---|---|---|\n${rows.join('\n')}\n\n| CPU p95 (ms) | Scene/frame | Pickup/step | Combat/step |\n|---|---|---|---|\n${cpu.join('\n')}\n\nScene/frame có số fixed step khác nhau giữa build chậm/nhanh; không gọi tỷ lệ đó là speedup thuật toán độc lập. Heap bao gồm buffers/cache/GC, không dùng riêng bảng này kết luận hết leak.\n`;
if (existsSync('artifacts/vnext/after-low/results.json')) {
  section += '\nLow riêng (1×60s, khác budget presentation):\n\n| Scenario | p50/p95/p99 ms | >50ms | Quái/đạn |\n|---|---|---|---|\n';
  for (const r of read('artifacts/vnext/after-low/results.json')) section += `| ${r.scenario} | ${r.metrics.frame.median}/${r.metrics.frame.p95}/${r.metrics.frame.p99} | ${r.metrics.frame.over50} | ${r.counters.average.enemies}/${r.counters.average.projectiles} |\n`;
}
section += `\nCDP duration delta trong cửa sổ60s (giây, median3), bao gồm đường script của Phaser sau Scene.update:\n\n| Scenario | ScriptDuration trước→sau | LayoutDuration trước→sau | TaskDuration trước→sau |\n|---|---|---|---|\n${browserCPU.join('\n')}\n\nTaskDuration không phải GPU time; phần ngoài Script/Layout còn engine native, render/driver và công việc khác. Độ chính xác hiển thị0.1s, không coi0.0 là không có layout.\n`;
const reportPath = 'docs/history/performance/performance-v1.1.md'; let document = readFileSync(reportPath, 'utf8');
document = document.replace(/<!-- CONTROLLED_RESULTS_START -->[\s\S]*?<!-- CONTROLLED_RESULTS_END -->/, `<!-- CONTROLLED_RESULTS_START -->\n${section}\n<!-- CONTROLLED_RESULTS_END -->`);
if (existsSync('artifacts/vnext/long-run/report.json')) {
  const r = read('artifacts/vnext/long-run/report.json'), last = r.checkpoints.at(-1), f = r.metrics.frame;
  const result = `Đã render đủ **${last.time}s simulation**, ${fmt(last.wallSeconds)}s wall (gồm boot/checkpoint), bot seed42/stats chuẩn, phase=${last.phase}, reward=${last.reward}, level${last.level}, kills${last.kills}. Không fast-forward, không tăng HP/XP; input đi qua GameClock bình thường. Boss/final gravity flags=${last.bossSpawned}/${last.finalGravity}.\n\nFrame toàn lượt: p50=${f.median}ms/p95=${f.p95}ms/p99=${f.p99}ms, >50ms=${f.over50}/${f.samples} mẫu. Errors=${r.errors.length}. XP created=${last.created}, collected=${last.collected}, ground=${last.ground}; invariant đúng tại mọi checkpoint10s. Dữ liệu/ảnh kết quả ở artifacts/vnext/long-run. Đây là autoplay headless có render/audio, không phải người chơi tay hoặc input-to-photon. Không có soak20–30 phút liên tục trong cùng run.\n`;
  if (last.phase !== 'victory' || last.time !== 720 || r.errors.length) throw new Error('Long run did not pass');
  document = document.replace(/<!-- LONG_RUN_START -->[\s\S]*?<!-- LONG_RUN_END -->/, `<!-- LONG_RUN_START -->\n${result}\n<!-- LONG_RUN_END -->`);
}
writeFileSync(reportPath, document); writeFileSync('artifacts/vnext/summary.json', JSON.stringify(summary, null, 2));
process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
