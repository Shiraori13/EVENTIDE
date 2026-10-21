import { readFileSync, writeFileSync, statSync } from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const sets=Object.fromEntries(['before-final','after-final','before-control','after-control','duo-final'].map(label=>[label,read(`artifacts/multiboss/${label}/results.json`)]));
const pair=(side,name)=>[sets[`${side}-final`].find(r=>r.scenario===name),sets[`${side}-control`].find(r=>r.scenario===name)];
const values=(rows,key)=>rows.map(r=>r.metrics.frame[key]).join(' / ');
const table=['| Cảnh | Bản | p50 ms | p95 ms | p99 ms | >50ms / số frame |','|---|---|---|---|---|---|'];
for(const scenario of ['dense','endgame'])for(const side of ['before','after']){const rows=pair(side,scenario);table.push(`|${scenario}|${side}|${values(rows,'median')}|${values(rows,'p95')}|${values(rows,'p99')}|${rows.map(r=>`${r.metrics.frame.over50}/${r.metrics.frame.samples}`).join(' / ')}|`);}
const duo=sets['duo-final'][0],probe=read('artifacts/multiboss/render-probe.json'),med=(r,key)=>r.frames.map(f=>f[key]).sort((a,b)=>a-b)[Math.floor(r.frames.length/2)],reference=sets['before-final'][0].reference;
const bundle=sets['after-final'][0].buildEntry,baseline=sets['before-final'][0].buildEntry;
const rows=Object.values(sets).flat(),same=r=>r.buildEntry===baseline||r.buildEntry===bundle;
if(!rows.every(same)||rows.some(r=>r.errors.length))throw Error('Entry drift or pageerror');
const heap=r=>`${(r.heap.min/1048576).toFixed(1)}–${(r.heap.max/1048576).toFixed(1)}`;
const text=`# Hiệu năng bản local UI / hazards / multi-boss

Nguồn đo cuối: [báo cáo tổng hợp](ui-hazards-multiboss-report.md). Trước là ${baseline}; sau là ${bundle}; production riêng index-BYdXBxam.js đã smoke2/2, không hooks. Không dùng benchmark build để phát hành.

## Protocol và provenance

Windows ${reference.release}, ${reference.cpu}, Chromium ${reference.browser},1280×720/DPR1,WebGL SwiftShader (software), quality **Medium cả hai**, shake=false,seed20261016,pinned-local-loot-v2. Mỗi case warm5s/sample30s, browser context mới, không unit/build/browser khác cùng chạy. Lượt đầu before→after; đối chứng đảo after→before; mỗi cột hai số theo lượt đầu/đảo thứ tự. Không bỏ mẫu xấu hoặc suy FPS từ SceneCPU/bot. Refresh headless rAF không phải màn hình vật lý.

${table.join('\n')}

Lượt đầu cho p95 sau cao hơn; lượt đối chứng đổi chiều. Dense trước43,6–54,8ms, sau40,3–48,1ms; dao động giữa lượt lớn, **chưa đủ chứng minh tăng hoặc giảm FPS ổn định**. Giữ tất cả raw, không lấy riêng lượt đẹp. Endgame còn thay nhịp/AI/beam theo yêu cầu gameplay nên không là workload hoàn toàn đồng nhất. Code giữ các tối ưu nền opaque/tile viewport/polyline/pool/culling/ledger/adaptive decoration, audit hash riêng; đó không phải bằng chứng60FPS.

## Đông quái + hai boss + hazard

Duo mới112enemy (110thường+Elder+Helion phase2),120projectile fixture refill có tôn trọng reservation, final gravity và Solar Scar, cùng Medium/seed/viewport. HP1e8 và build max để giữ workload, **không phải playtest cân bằng**. p50/p95/p99=${duo.metrics.frame.median}/${duo.metrics.frame.p95}/${duo.metrics.frame.p99}ms, >50ms=${duo.metrics.frame.over50}/${duo.metrics.frame.samples}, max=${duo.metrics.frame.max}ms, pageerror0. Không có baseline hai boss AI tương đương vì code trước chỉ update boss đầu.

Counter trung bình duo: enemy${duo.counters.average.enemies}, projectile${duo.counters.average.projectiles}, zone${duo.counters.average.bossZones}, reservation${duo.counters.average.reservedBullets}, boss beam${duo.counters.average.bossBeams}. Đây là trung bình, không giả là peak; cap160projectile/6zone và cleanup được kiểm tra riêng bằng unit/E2E. SceneCPU p95=${duo.metrics.sceneCPU.p95}ms, renderPreparationCPU p95=${duo.metrics.renderPreparationCPU.p95}ms; không dùng hai số đó thay GPU/frame time.

## Probe, tài nguyên và giới hạn

Probe GL test-only trên dense paused snapshot, cùng seed/Medium: ${probe.rows.map(r=>`${r.label}: draw${med(r,'draws')}/program${med(r,'switches')}/vertex${med(r,'vertices')}`).join('; ')}. Probe này chỉ so commands/vertex, không chứng minh bottleneck GPU hoặc nguyên nhân dao động. SceneCPU giữa các case khoảng1–2ms p95; khoảng cách lớn với frame cho thấy phải đo đường render/host tiếp, không có bằng chứng đủ để quy riêng atlas hoặc GPU vật lý.

Textures38→41 do3asset boss; atlas32frame1024×512→35frame1024×640 (+0,5MiB RGBA thô cho atlas, không tính texture SVG nguồn). Ba tile background1024² giữ nguyên. JS heap sampled: before dense${pair('before','dense').map(heap).join(' / ')}MiB; after dense${pair('after','dense').map(heap).join(' / ')}MiB; duo${heap(duo)}MiB. Không gọi heap sample là retained memory hoặc GPU memory.

Lifecycle duo7lượt,2warmup+5mẫu sauGC: texture41/scene listener48/DOM listener176/nodes543/pool254 giữ plateau; timer/tween và boss/beam/zone/reservation về0 ởmenu. Không chứng minh mọi leak đều hết. Root raw [duo lifecycle](../artifacts/multiboss/duo-lifecycle.json).

Benchmark app trước${(statSync('artifacts/multiboss/before-build'+baseline.replace('/EVENTIDE','')).size/1000).toFixed(2)}KB→sau${(statSync('artifacts/multiboss/after-build'+bundle.replace('/EVENTIDE','')).size/1000).toFixed(2)}KB minified; production130,12KB/gzip45,96KB, CSS29,46KB và Phaser1208,06KB/gzip332,17KB. Cảnh báo chunk Phaser>500KB còn, không đổi dependency. Production smoke xác nhận base/asset/font/offline sau load và không hooks.

Raw: artifacts/multiboss/{before-final,after-final,before-control,after-control,duo-final}/results.json, render-probe.json; ảnh cuối mỗi scenario cùng thư mục. Script tái hiện: scripts/qa/multiboss/{performance,control,render-probe}.mjs, xem [scripts](../scripts/README.md). Baseline build frozen4200/current4201, chạy tuần tự. Nguồn, script và hash nhận diện bundle được giữ; không xóa lượt đầu.

Chưa đo GPU vật lý/native input latency/native zoom/Firefox/Safari/soak20–30phút hoặc lượt render đủ720s của bản này; đã có nhiều lượt **mô phỏng tăng tốc720s** và clip keyboard clock thường riêng. Không đạt/chưa chứng nhận60FPS trên SwiftShader. Đánh giá người thật/audio còn mở, không giấu như tính năng backlog.

Hồ sơ cũ: [visual identity](visual-identity-report.md), [hotfix1.4.1](history/performance/performance-v1.4.1.md), [beta1.4](history/performance/performance-v1.4.md).
`;
writeFileSync('docs/performance-report.md',text);
