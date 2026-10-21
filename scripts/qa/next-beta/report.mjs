import { readFileSync,writeFileSync,statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root='artifacts/next-beta',read=path=>JSON.parse(readFileSync(path,'utf8'));
const provenance=read(`${root}/final-provenance.json`);
for(const[path,digest]of Object.entries(provenance.source))assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),digest,path);
const labels=['before-final','after-final','after-reverse','before-reverse','duo-low','duo-reduced'];
const rows=Object.fromEntries(labels.map(label=>[label,read(`${root}/${label}/results.json`)]));
const run=read(`${root}/rendered-run/result.json`),e2e=read(`${root}/e2e-verification.json`),audit=read(`${root}/audit.json`);
assert.equal(run.snapshot.time,720);assert.equal(run.errors.length,0);assert.equal(e2e.unresolved.length,0);assert.equal(e2e.verifiedCount,66);
for(const[label,items]of Object.entries(rows))for(const row of items){assert.equal(row.errors.length,0);assert.ok(row.buildEntry.endsWith(label.startsWith('before')?'index-CtKeK4qU.js':'index-D3jAI-Sl.js'));}
const frame=r=>r.metrics.frame,fmt=v=>Number(v).toFixed(1),all=Object.values(rows).flat(),reference=rows['after-final'][0];
const lines=[
 '# Hiệu năng UX/stability local · 2026-10-21',
 '',
 'Nguồn hiện hành: [báo cáo thay đổi](next-beta-ux-report.md), [status](status.md). Giữ [số đo multi-boss trước](history/performance/performance-ui-hazards-multiboss.md); không dùng chúng để chứng nhận bản mới.',
 '',
 '## Protocol và nguồn đo',
 '',
 `${reference.reference.platform} ${reference.reference.release}; ${reference.reference.cpu}; Node${provenance.node}; Chromium${reference.reference.browser}. ${reference.gpu}. Đây là **software rendering**, không GPU vật lý. Viewport1280×720/DPR1, seed20261016, pinned-local-loot-v2, shake=false. Mỗi case context mới/warm5s/sample30s; chạy tuần tự sau khi đóng browser test/full-run/clip. Một lượt AB và đối chứng BA cho dense/duo. Low/reduced là stress riêng, không đổi gameplay.`,
 '',
 `Baseline **index-CtKeK4qU.js**, bản sau **index-D3jAI-Sl.js**, production riêng **index-sBaUOfj7.js**, CSS **index-C3KVvyY1.css**. Source hash xác minh từ final-provenance.json trước xuất báo cáo. Fixture stress có HP/level cố định và refill entity; không dùng nó làm kết quả cân bằng. Các natural run ở phần riêng.`,
 '',
 'Profile benchmark quiet=1: tutorial tắt/các badge test đã đánh dấu, để queue onboarding/thành tựu không khác nhau giữa A/B; chỉ trong save test của fixture. Gameplay/hit geometry/damage/dt giữ nguyên. p50/p95 bên dưới là interval thực giữa beginFrame của Phaser (performance.now), **không** là sceneCPU hoặc bot FPS. >50 dùng cùng samples này. Cột >100 là rAF probe độc lập, cùng probe cho cả bundle baseline chưa có trường over100; mẫu/số đếm rAF và Phaser có thể khác. Raw còn p99/max/over100 mới/long tasks/heap/CDP.',
 '',
 '| Lượt / cảnh | p50 ms | p95 ms | >50 ms / N Phaser | >100 ms / N rAF |',
 '|---|---:|---:|---:|---:|',
 ...all.map(r=>`|${r.label} / ${r.scenario}|${fmt(frame(r).median)}|${fmt(frame(r).p95)}|${frame(r).over50}/${frame(r).samples}|${r.externalRAF.over100}/${r.externalRAF.samples}|`),
 '',
 '## Chi phí CPU và object',
 '',
 '| Cảnh sau / mode | Simulation p95 ms | Render prep p95 ms | DOM p95 ms | Telemetry p95 ms | Enemy / boss / projectile cuối | Sprite pool / textures |',
 '|---|---:|---:|---:|---:|---|---|',
 ...[...rows['after-final'],...rows['duo-low'],...rows['duo-reduced']].map(r=>{const c=r.counters.end;return `|${r.scenario} / ${r.quality}${r.reducedMotion?' reduced':''}|${fmt(r.metrics.simulationCPU.p95)}|${fmt(r.metrics.renderPreparationCPU.p95)}|${fmt(r.metrics.uiCPU.p95)}|${fmt(r.metrics.telemetryCPU?.p95??0)}|${c.enemies} / ${c.bossCount} / ${c.projectiles}|${c.spriteCapacity} / ${c.textures}|`;}),
 '',
 'Giữ pool/culling/cache/ledger/polyline/adaptive decoration. Baseline chưa chứng minh collision/lookup là bottleneck, nên không thêm spatial index hoặc sửa dt/wave/damage. Simulation/render preparation/DOM được đo riêng; phần còn lại của interval còn có GPU/driver/raster/scheduling, không tự coi hiệu số là GPU time chính xác. SwiftShader và độ phân giải làm giới hạn phép đo này. Không cam kết60FPS/input latency/GPU thật từ số headless.',
 '',
 rows['after-final'].every(r=>frame(r).p95<=20)?'Các cảnh Vừa trong lượt chính đạt p95≤20ms ở môi trường này; chưa chứng nhận mọi máy hoặc GPU vật lý.':'**Chưa đạt mục tiêu p95≤20ms ở tất cả cảnh Vừa.** Dense p95 tăng1,6ms ở AB và0,8ms ở BA; giữ số thật, không gọi nâng cấp UX là tăng FPS đã chứng minh. Chưa cô lập nguyên nhân riêng phần tăng tail; CPU nhỏ không cho phép tự quy toàn bộ phần còn lại cho GPU. AB/BA cho thấy độ biến thiên giữa lượt, không suy quan hệ nhân quả từ một mẫu đẹp.',
 '',
 `QA app ${(statSync(`${root}/before-build/assets/index-CtKeK4qU.js`).size/1000).toFixed(2)}→${(statSync(`${root}/after-build/assets/index-D3jAI-Sl.js`).size/1000).toFixed(2)}kB minified; production ${(statSync('dist/assets/index-sBaUOfj7.js').size/1000).toFixed(2)}kB. Phaser chunk1208,06kB vẫn cảnh báo>500kB; dependency/lockfile giữ nguyên. Không dùng bundle QA để phát hành.`,
 '',
 '## Chạy dài, lifecycle và gameplay',
 '',
 `Bot42/defense/fusion chạy **720s render thật** bằng clock thường: ${run.snapshot.phase}, wall${fmt(run.wallSeconds)}s, HP${fmt(run.snapshot.player.hp)}, Beacon${fmt(run.snapshot.beacon.hp)}, level${run.snapshot.level}, kills${run.snapshot.kills}, pageerror0. Có chạy song song hồi quy UI nên **không dùng lượt này đo FPS**. Không patch HP/XP/time trong natural run. Source/bundle và mẫu xấp xỉ1s ở rendered-run/result.json. Đây không phải chơi tay.`,
 '',
 `Audit: ${audit.stable.length}file luật/render/lockfile,${audit.assetsUnchanged}file public,${audit.historicalFixtures+audit.additionalHistoricalFixtures}fixture lịch sử giữ hash. Lifecycle mở/đóng28panel và7vòng lượt/menu có GC/CDP được E2E xác minh; raw tại regression/lifecycle.json, không suy từ một snapshot rằng mọi leak đã hết. E2E lượt đầy đủ${e2e.suiteStats.expected}/66pass;${e2e.suiteStats.unexpected}case chờ chuỗi layout Quasar cũ, sau cập nhật assertion chạy lại${e2e.rerunStats.expected}/${e2e.rerunStats.expected}pass trên cùng app bundle. Tổng66case được xác minh, không gọi lần đầu là66pass. Unit153 gồm4opt-in, production2smoke (kiểm tra API audio, chưa nghe).`,
 '',
 'Same-seed UX baseline/sau:12cặp (seed7/42 ×3build ±fusion) bằng nhau, mỗi phía7thắng/5thua; bot tăng tốc, không đo FPS. TTK/force/radiation/pairs hiện hành chạy lại trong unit opt-in, raw balance-regression; nguồn before của các bài lịch sử là baseline multi-boss cũ, không phải baseline UX. Không retune luật để ép thắng.',
 '',
 'Raw frame: artifacts/next-beta/{before-final,after-final,after-reverse,before-reverse,duo-low,duo-reduced}/results.json. Script: scripts/qa/next-beta/performance.mjs; cần preview4300 baseline/4301 current. Ảnh cuối mỗi workload đi kèm raw; UI trước/sau và WebM riêng. Chưa kiểm chứng GPU vật lý, native zoom/input-to-photon, Firefox/Safari, soak20–30phút hoặc người chơi/nghe âm thanh thực tế.'
];
writeFileSync('docs/performance-report.md',lines.join('\n')+'\n');
writeFileSync(`${root}/verification.json`,JSON.stringify({provenance: {qa:provenance.qa,production:provenance.production},e2e,renderedRun:{time:run.snapshot.time,phase:run.snapshot.phase,wallSeconds:run.wallSeconds,errors:run.errors},frame:all.map(r=>({label:r.label,scenario:r.scenario,frame:frame(r),raf:r.externalRAF,counters:r.counters.end})),audit},null,2));
process.stdout.write('Đã xuất report từ raw cuối,66E2E/720s/source hash đã xác minh.\n');
