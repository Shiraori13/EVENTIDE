import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const partial = process.argv.includes('--partial');
const read = name => JSON.parse(readFileSync(`artifacts/v13/${name}`, 'utf8'));
const n = x => x === undefined ? '—' : new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(x);
const replace = (file, marker, body) => { const source = readFileSync(file, 'utf8'), pattern = new RegExp(`<!-- ${marker}_START -->[\\s\\S]*?<!-- ${marker}_END -->`); if (!pattern.test(source)) throw Error(`Missing marker ${marker}`); writeFileSync(file, source.replace(pattern, `<!-- ${marker}_START -->\n${body}\n<!-- ${marker}_END -->`)); };
const balance = read('balance-playtest.json'), natural = balance.rows.filter(r => r.version === '1.3');
if (natural.length !== 18 || balance.config.ion.at(-1).damage !== 112 || balance.config.bossHP !== 6000) throw Error('Incomplete/stale playtest');
const used = row => Object.values(row.salvage.bonuses).reduce((sum, bp) => sum + bp, 0);
if (natural.some(r => used(r) > 2000 || r.salvage.bonuses.speed > 1000 || r.xpCreated !== r.xpCollected + r.groundXP)) throw Error('Playtest invariant');
let table = '| Seed | Ưu tiên module | Hỗ trợ | Kết quả / giây | Cấp / kill | HP tàu / Beacon | Drop / nhặt / bp | Cap lúc / capHits | Phase2 / final từ 540s |\n|---|---|---|---|---|---|---|---|---|\n';
for (const r of natural) table += `|${r.seed}|${r.desiredModules.join('+')}|${r.pair.join('+')}|${r.phase} / ${n(r.seconds)}|${r.level} / ${r.kills}|${n(r.hp)} / ${n(r.beacon)}|${r.salvage.dropped} / ${r.salvage.collected} / ${used(r)}|${n(r.salvage.capAt)} / ${r.salvage.capHits}|${n(r.bossPhase2At === undefined ? undefined : r.bossPhase2At - 540)} / ${n(r.bossDeathAt === undefined ? undefined : r.bossDeathAt - 540)}|\n`;
table += `\n${natural.filter(r => r.phase === 'victory').length}/18 ca bot thắng; không suy tỷ lệ thắng người chơi. Cap trang bị ở ${n(Math.min(...natural.map(r=>r.salvage.capAt)))}–${n(Math.max(...natural.map(r=>r.salvage.capAt)))} giây; max capHits=${Math.max(...natural.map(r=>r.salvage.capHits))}. Tất cả core0/HP100/Beacon300/Plasma1, không grant XP/gear/support/module; lựa chọn qua draft/reroll/swap thật. Ưu tiên loadout không bảo đảm mỗi thẻ đúng ý, cuối run có thể đổi ô vì pool thật. Dấu — là chưa hạ boss/chưa chuyển phase trước kết thúc. Checkpoint 180/360/540/720, stats/drop/HP/XP chi tiết trong JSON.\n\n`;
const weapons = read('weapon-comparison.json');
table += '| Fixture | Module / cấp | Phút / HP mục tiêu | TTK / complete | Damage 10s / targets hit (line) |\n|---|---|---|---|---|\n';
for (const r of weapons.rows) table += `|${r.kind}|${r.module} / ${r.level}|${n(r.minute)} / ${n(r.enemyHP)}|${n(r.ttk)} / ${r.complete ?? r.dead}|${r.kind === 'line' ? `${n(r.damage)} / ${r.targetsHit}` : '—'}|\n`;
replace('docs/history/balance/balance-v1.3.md', 'BALANCE13', table);
let perf = 'Chưa có đủ cặp đo cuối.\n';
let after;
if (existsSync('artifacts/v13/after/results.json')) {
  const before = read('before/results.json'); after = read('after/results.json');
  perf = '| Cảnh | p50/p95/p99 ms 1.2→1.3 | >33,3ms / >50ms 1.2→1.3 | Quái / đạn mean 1.2→1.3 | Pickup logic / visual 1.2→1.3 | Heap đầu→cuối MiB 1.2 / 1.3 |\n|---|---|---|---|---|---|\n';
  const cpu = [];
  for (const a of before) {
    const b = after.find(r => r.scenario === a.scenario && r.repeat === a.repeat); if (!b) throw Error('Missing A/B pair');
    for (const r of [a, b]) if (r.errors.length || r.renderer !== 'WebGL' || r.dpr !== 1 || r.canvas.join('x') !== '1280x720' || r.quality !== 'high' || r.seed !== 20261016 || r.counters.end.groundXP !== ({ dense: 500, endgame: 700 }[r.scenario])) throw Error('Invalid sample');
    const frame = r => [r.metrics.frame.median, r.metrics.frame.p95, r.metrics.frame.p99].map(n).join('/');
    const spikes = r => `${r.metrics.frame.over33}/${r.metrics.frame.over50}`, actors = r => `${n(r.counters.average.enemies)}/${n(r.counters.average.projectiles)}`;
    const loot = r => `${n(r.counters.average.pickupLogic)}/${n(r.counters.average.pickupVisuals)}`, heap = r => `${n(r.heap.start/1048576)}→${n(r.heap.end/1048576)}`;
    perf += `|${a.scenario} #${a.repeat}|${frame(a)}→${frame(b)}|${spikes(a)}→${spikes(b)}|${actors(a)}→${actors(b)}|${loot(a)}→${loot(b)}|${heap(a)} / ${heap(b)}|\n`;
    cpu.push(`|${a.scenario}|${['sceneCPU','combatCPU','pickupCPU','spawnCPU','movementGravityCPU','weaponsBossCPU','renderPreparationCPU','uiCPU'].map(k=>`${n(a.metrics[k]?.p95)}→${n(b.metrics[k]?.p95)}`).join('|')}|`);
  }
  perf += `\nCPU p95 ms, Scene/render/UI theo frame, systems theo fixed step:\n\n| Cảnh | Scene | Combat | Pickup | Spawn | Move/Gravity | Weapons/Boss | Render prep | UI |\n|---|---|---|---|---|---|---|---|---|\n${cpu.join('\n')}\n\nBuild 1.2 ${before[0].buildEntry}, build 1.3 ${after[0].buildEntry}. Một lượt/cảnh, không suy regression ổn định hoặc 60FPS từ A/B này.\n`;
} else if (!partial) throw Error('No final A/B');
if (existsSync('artifacts/v13/storm/results.json')) {
  const storm = read('storm/results.json')[0]; if (storm.errors.length || storm.counters.end.projectiles > 160 || storm.counters.end.pulses > 1 || storm.counters.end.ionTraces > 8) throw Error('Storm failed');
  perf += `\nStorm 1.3: p50/p95/p99=${n(storm.metrics.frame.median)}/${n(storm.metrics.frame.p95)}/${n(storm.metrics.frame.p99)}ms, >50=${storm.metrics.frame.over50}/${storm.metrics.frame.samples}; mean quái/đạn=${n(storm.counters.average.enemies)}/${n(storm.counters.average.projectiles)}, pulse=${n(storm.counters.average.pulses)}, Ion trace=${n(storm.counters.average.ionTraces)}. Workload mới, không có before1.2 tương đương.\n`;
} else if (!partial) throw Error('No storm sample');
replace('docs/history/performance/performance-v1.3.md', 'PERF13', perf);
if (existsSync('artifacts/v13/lifecycle.json')) {
  const lifecycle = read('lifecycle.json'), c = lifecycle.counters;
  if (c.length < 5 || new Set(c.map(r=>r.textures)).size !== 1 || new Set(c.map(r=>r.sceneListeners)).size !== 1 || new Set(lifecycle.domAfterGC.map(r=>r.jsEventListeners)).size !== 1 || c.some(r=>r.spriteCapacity>640||r.timers||r.tweens||r.physicsBodies)) throw Error('Lifecycle failed');
  const storm = read('storm-lifecycle.json'); if (storm.length !== 5 || new Set(storm.map(r=>r.textures)).size !== 1 || new Set(storm.map(r=>r.sceneListeners)).size !== 1 || storm.some(r=>r.spriteCapacity>640||r.pulses>1||r.ionTraces>8)) throw Error('Storm lifecycle failed');
  replace('docs/history/performance/performance-v1.3.md', 'LIFE13', `Hai warm-up +5 lượt tương đương: textures=${c.map(r=>r.textures).join('/')}, scene listeners=${c.map(r=>r.sceneListeners).join('/')}, pool=${c.map(r=>r.spriteCapacity).join('/')}, DOM listeners sau GC=${lifecycle.domAfterGC.map(r=>r.jsEventListeners).join('/')}. Timer/tween/body=0, backing sao1280×720; resize1366×768 pass. Storm riêng 5 lượt: pool=${storm.map(r=>r.spriteCapacity).join('/')}, textures=${storm.map(r=>r.textures).join('/')}, pulses≤1/Ion traces≤8. Plateau tại workload này, không chứng minh mọi leak đều hết.`);
} else if (!partial) throw Error('No lifecycle');
if (existsSync('artifacts/v13/long-run/report.json')) {
  const long = read('long-run/report.json'), last = long.checkpoints.at(-1);
  if (!after || long.buildEntry !== after[0].buildEntry || long.errors.length || last.phase !== 'victory' || last.time !== 720 || last.reward !== 17 || last.careerKills !== last.kills || !last.bossSpawned || last.bossPhase2At === undefined || !last.finalGravity || long.checkpoints.some(c=>c.created!==c.collected+c.ground)) throw Error('Long run failed/hash mismatch');
  if (last.profile.saveVersion !== 3 || last.profile.currency !== 17 || last.profile.metrics.wins !== 1 || !last.profile.echo || last.profile.metrics.drifterKills !== last.metrics.drifterKills || last.profile.metrics.leechKills !== last.metrics.leechKills || last.profile.metrics.bossKills !== last.metrics.bossKills) throw Error('Final profile credit mismatch');
  if (new Set(last.profile.unlockedAchievements).size !== last.profile.unlockedAchievements.length || ['victory-1','salvage-2000','pulsar-hit','ion-hit','elder-phase2'].some(id=>!last.profile.unlockedAchievements.includes(id)) || (last.bossDeathAt !== undefined && !last.profile.unlockedAchievements.includes('elder-final'))) throw Error('Achievement credit mismatch');
  const gear = Object.values(last.salvage.bonuses).reduce((a,b)=>a+b,0), f = long.metrics.frame;
  replace('docs/history/performance/performance-v1.3.md', 'LONG13', `Render đủ 720s simulation / ${n(last.wallSeconds)} giây wall, seed42/core0, draft thật ưu tiên Hull+Armor và Plasma/Pulsar/Ion. Victory / cấp ${last.level} / kills ${last.kills}/+${last.reward} Stardust; HP tàu ${n(last.hp)}, Beacon ${n(last.beaconHP)}. Boss phase2 tại ${n(last.bossPhase2At)}s, final death ${n(last.bossDeathAt)}s, final gravity=${last.finalGravity}. Career ${last.careerKills}, không cộng lại result.\n\nTrang bị ${n(gear/100)}%/20%, drops ${last.salvage.dropped}, nhặt ${last.salvage.collected}, cap lúc ${n(last.salvage.capAt)}s, capHits ${last.salvage.capHits}. XP tạo ${last.created}=thu${last.collected}+map${last.ground}, đúng ở mọi checkpoint10s. Frame p50/p95/p99=${n(f.median)}/${n(f.p95)}/${n(f.p99)}ms, >33,3=${f.over33}, >50=${f.over50}/${f.samples}. Errors=0, textures ${long.counters.end.textures}, scene listeners ${long.counters.end.sceneListeners}, pool ${long.counters.end.spriteCapacity}. Build ${long.buildEntry} khớp A/B sau; đây là headless autoplay có render clock thường, không fast-forward hoặc chơi tay.`);
} else { if (!partial) throw Error('No completed final long run'); replace('docs/history/performance/performance-v1.3.md', 'LONG13', 'Lượt render cuối chưa hoàn thành; chưa tính pass.'); }
console.log('Updated1.3 reports from validated measured artifacts'+(partial?' (partial, long run not certified)':''));
