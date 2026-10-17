import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(`artifacts/v12/${p}`, 'utf8'));
const n = value => value === undefined ? '—' : Number(value.toFixed(2));
const replace = (path, marker, content) => { let text = readFileSync(path,'utf8'); const pattern = new RegExp(`<!-- ${marker}_START -->[\\s\\S]*?<!-- ${marker}_END -->`); if (!pattern.test(text)) throw Error(`Missing marker ${marker}`); text = text.replace(pattern, `<!-- ${marker}_START -->\n${content}\n<!-- ${marker}_END -->`); writeFileSync(path,text); };
const profiles = read('balance-playtest.json').filter(r=>r.version === '1.2');
if (profiles.some(r=>r.config.bossHP !== 6000)) throw Error('Stale balance run');
let balance = '| Seed | Hỗ trợ qua draft thật | Kết quả / giây | Cấp / kills | HP tàu / Beacon cuối | Chuyển phase2 / boss chết (từ540s) | Hit tàu / Beacon đầu tiên |\n|---|---|---|---|---|---|---|\n';
for (const r of profiles) balance += `|${r.seed}|${r.pair.join('+')}|${r.phase}/${n(r.seconds)}|${r.level}/${r.kills}|${n(r.hp)}/${n(r.beacon)}|${n(r.bossPhase2At === undefined ? undefined : r.bossPhase2At - 540)}/${n(r.bossDeathAt === undefined ? undefined : r.bossDeathAt - 540)}|${n(r.firstShipHit)}/${n(r.firstBeaconHit)}|\n`;
balance += '\nKhông suy tỷ lệ thắng dân số từ9 lượt bot. Dấu — ở boss nghĩa chưa hạ trước kết thúc/thua, không suy boss chết theo timer. Tất cả run bắt đầu core0, HP100/Beacon300/Plasma1, không grant support/module; có dùng reroll thật. Các snapshot180/360/540/720 và level/module/support cụ thể nằm trong balance-playtest.json.\n\nTTK mục tiêu đơn (khoảng cách350u, enemy tiến lại, trong vùng sáng, không support, cùng module base; damage mục tiêu tắt để cô lập TTK):\n\n| Time spawn / quái | HP1.1→1.2 | TTK1.1→1.2 (s) |\n|---|---|---|\n';
const ttk = read('ttk.json');
for (const r of ttk.filter(r=>r.version==='1.1')) { const after = ttk.find(a=>a.version==='1.2'&&a.spawnTime===r.spawnTime&&a.kind===r.kind); balance += `|${r.spawnTime}/${r.kind}|${n(r.hp)}→${n(after.hp)}|${r.ttk}→${after.ttk}|\n`; }
balance += '\nModule preset: t0 Plasma1; t360 Plasma3/Drones2/Well1; t660 cả ba cấp5. Đây là fixture công thức/tiếp cận, không gọi là lên cấp tự nhiên.\n\nBoss giữa màn riêng: Plasma3/Drones3/Well3, support cặp cấp2, không wave/pickup, bot di chuyển/né thật; HP tàu/Beacon100000 chỉ để đo TTK, không chứng minh thắng với HP chuẩn.\n\n| Cặp | Encounter hai phase (s) | Phase2 / final death (simulation time, bắt đầu300s) |\n|---|---|---|\n';
for (const r of read('boss-mid-ttk.json')) balance += `|${r.pair}|${n(r.encounterSeconds)}|${n(r.phase2At)}/${n(r.deathAt)}|\n`;
replace('docs/balance-v1.2.md','BALANCE',balance);
if (existsSync('artifacts/v12/before/results.json') && existsSync('artifacts/v12/after/results.json')) {
 const before = read('before/results.json'), after = read('after/results.json');
 let table = '| Cảnh | Build / seed | p50/p95/p99 ms trước→sau | >33.3 / >50ms trước→sau | Quái/đạn mean trước→sau | Pickup logic/visual mean trước→sau | Heap đầu→cuối MiB trước→sau |\n|---|---|---|---|---|---|---|\n';
 const cpuRows = [], conclusions = [];
 for (const a of before) {
   const b = after.find(r=>r.scenario===a.scenario&&r.repeat===a.repeat); if (!b) throw Error('Missing pair');
   for (const r of [a,b]) if (r.errors.length||r.renderer!=='WebGL'||r.canvas.join('x')!=='1280x720'||r.dpr!==1||r.quality!=='high'||r.seed!==20261016||r.counters.end.groundXP!==({dense:500,endgame:700}[r.scenario])) throw Error('Invalid sample');
   const frames = r => `${r.metrics.frame.median}/${r.metrics.frame.p95}/${r.metrics.frame.p99}`;
   const spikes = r => `${r.metrics.frame.over33}/${r.metrics.frame.over50}`;
   const actors = r => `${r.counters.average.enemies}/${r.counters.average.projectiles}`;
   const loot = r => `${r.counters.average.pickupLogic}/${r.counters.average.pickupVisuals}`;
   const heap = r => `${n(r.heap.start/1048576)}→${n(r.heap.end/1048576)}`;
   table += `|${a.scenario} #${a.repeat}|${a.buildEntry}→${b.buildEntry}/20261016|${frames(a)}→${frames(b)}|${spikes(a)}→${spikes(b)}|${actors(a)}→${actors(b)}|${loot(a)}→${loot(b)}|${heap(a)} / ${heap(b)}|\n`;
   const phases = ['sceneCPU','combatCPU','pickupCPU','spawnCPU','movementGravityCPU','weaponsBossCPU','renderPreparationCPU','uiCPU'];
   cpuRows.push(`|${a.scenario}|${phases.map(key=>`${n(a.metrics[key]?.p95)}→${n(b.metrics[key]?.p95)}`).join('|')}|`);
   conclusions.push(`${a.scenario}: p95 ${a.metrics.frame.p95}→${b.metrics.frame.p95}ms, >50ms ${a.metrics.frame.over50}→${b.metrics.frame.over50}`);
 }
 table += `\nCPU p95 (ms; Scene/render/UI theo frame, system theo fixed step):\n\n| Cảnh | Scene | Combat | Pickup | Spawn | Move/Gravity | Weapons/Boss | Render prep | UI |\n|---|---|---|---|---|---|---|---|---|\n${cpuRows.join('\n')}\n\n${conclusions.join('; ')}. Mẫu một lượt/workload phase2 khác, không suy tỷ lệ regression ổn định hoặc60FPS; mục tiêu p95≈20ms chưa đạt. Số0.0 ở độ phân giải0.1ms không có nghĩa zero work.\n`;
 replace('docs/performance-report.md','PERF12',table);
}
if (existsSync('artifacts/v12/lifecycle.json')) {
 const r=read('lifecycle.json'), c=r.counters;
 if(c.length<5||new Set(c.map(x=>x.sceneListeners)).size!==1||new Set(c.map(x=>x.textures)).size!==1||new Set(r.domAfterGC.map(x=>x.jsEventListeners)).size!==1||c.some(x=>x.spriteCapacity>640||x.tweens||x.timers||x.physicsBodies)) throw Error('Lifecycle not stable');
 replace('docs/performance-report.md','LIFECYCLE12',`Hai lượt warm-up + ${c.length} lượt tương đương: scene listeners=${c.map(x=>x.sceneListeners).join('/')}, textures=${c.map(x=>x.textures).join('/')}, pool capacity=${c.map(x=>x.spriteCapacity).join('/')}, DOM listeners sauGC=${r.domAfterGC.map(x=>x.jsEventListeners).join('/')}. Timer/tween/body0; backing sao1280×720. Raw lifecycle.json; đây là plateau ở workload này, không bằng chứng mọi leak không tồn tại.`);
}
if (process.argv.includes('--partial')) {
 replace('docs/performance-report.md','LONG12','Lượt cuối bundle DW48mbSI đang render ở clock thường. Mẫu cũ đã giữ tại long-run-pre-spawn-fix; chưa dùng nó thay số của bản cuối.');
} else if (existsSync('artifacts/v12/long-run/report.json')) {
 const r=read('long-run/report.json'), last=r.checkpoints.at(-1), frame=r.metrics.frame;
 if (existsSync('artifacts/v12/after/results.json') && read('after/results.json').some(sample=>sample.buildEntry!==r.buildEntry)) throw Error('Stale long-run build: rerun before reporting final bundle');
 if(last.time!==720||last.phase!=='victory'||last.reward!==17||r.errors.length||!last.bossPhase2At||r.checkpoints.some(c=>c.created!==c.collected+c.ground)||last.careerKills!==last.kills) throw Error('Long run invariant failed');
 replace('docs/performance-report.md','LONG12',`Đã render đủ720s simulation/${n(last.wallSeconds)}s wall, seed42/core0, draft thật ưu tiên Hull+Armor, không grant HP/module/XP. Victory/cấp${last.level}/kills${last.kills}/reward${last.reward}; HP tàu${n(last.hp)}, Beacon${n(last.beaconHP)}. Boss chuyển phase2 ở${n(last.bossPhase2At)}s, final death ở${n(last.bossDeathAt)}s, final gravity=${last.finalGravity}. Career total=${last.careerKills}, không cộng lại tại result.\n\nFrame p50/p95/p99=${frame.median}/${frame.p95}/${frame.p99}ms; >50ms=${frame.over50}/${frame.samples}. Pageerrors=${r.errors.length}. XP tạo${last.created}=đã thu${last.collected}+map${last.ground}, đúng ở mọi checkpoint10s. Pool cuối${last.counters.spriteCapacity}, textures${last.counters.textures}, scene listeners${last.counters.sceneListeners}. Raw/ảnh trong artifacts/v12/long-run. Đây là autoplay headless có render/audio ở clock thường, không chơi tay hoặc fast-forward.`);
}
process.stdout.write(process.argv.includes('--partial') ? 'Updated partial report; final long-run still pending.\n' : 'Updated v1.2 reports from measured artifacts.\n');
