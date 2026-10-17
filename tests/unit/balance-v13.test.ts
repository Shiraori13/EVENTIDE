import { it, expect } from 'vitest';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { GameSession } from '../fixtures/history/v14/src/game/core/GameSession';
import { GameSession as Baseline } from '../fixtures/history/v13/src/game/core/GameSession';
import { botInput, chooseBotUpgrade } from '../fixtures/history/v14/src/game/debug/Autoplay';
import { chooseBotUpgrade as baselineChoice } from '../fixtures/history/v13/src/game/debug/Autoplay';
import { seededRandom } from '../fixtures/history/v14/src/game/core/math';
import { makeEnemy } from '../fixtures/history/v14/src/game/systems/SpawnSystem';
import { ENEMIES, MODULE_IDS, PULSAR, ION, type ModuleId, type SupportId } from '../fixtures/history/v14/src/game/config/content';
import { BALANCE, ENEMY_SCALING } from '../fixtures/history/v14/src/game/config/balance';
import { SALVAGE } from '../fixtures/history/v14/src/game/config/salvage';
import { shipStats } from '../fixtures/history/v14/src/game/core/stats';
import { salvageUsed } from '../fixtures/history/v14/src/game/systems/SalvageSystem';
import { clearGroundXP, totalGroundXP } from '../fixtures/history/v14/src/game/systems/PickupSystem';

it('1.3 natural draft/drop playtest, ba cặp support/hai loadout và seed; không tăng HP/XP', () => {
  const rows = [];
  for (const seed of [7, 42, 104]) for (const pair of [['power', 'haste'], ['hull', 'armor'], ['engine', 'magnet']] as SupportId[][]) for (const modules of [['plasma', 'drones', 'well'], ['plasma', 'pulsar', 'ion']] as ModuleId[][]) {
    const g = new GameSession(0, seededRandom(seed)), s = g.state, checkpoints = []; let next = 180, firstHit: number | undefined, firstBeacon: number | undefined, swaps = 0;
    for (let frame = 0; frame < 43210 && !s.settled; frame++) {
      while (s.phase === 'choosingUpgrade') { const candidate = s.swapCandidate; chooseBotUpgrade(g, pair, modules); if (candidate && !s.swapCandidate) swaps++; }
      const hp = s.player.hp; g.step(1 / 60, botInput(s)); s.cues.length = 0;
      if (s.player.hp < hp && firstHit === undefined) firstHit = s.time;
      if (s.beacon.hp < s.beacon.maxHP && firstBeacon === undefined) firstBeacon = s.time;
      if (s.time >= next) { checkpoints.push({ time: s.time, level: s.level, hp: s.player.hp, beacon: s.beacon.hp, kills: s.kills, salvageBP: salvageUsed(s), drops: s.salvage.dropped, collected: s.salvage.collected, modules: { ...s.modules }, supports: { ...s.supports }, stats: shipStats(s) }); next += 180; }
    }
    expect(s.settled).toBe(true); expect(salvageUsed(s)).toBeLessThanOrEqual(2000); expect(s.loot.created).toBe(s.loot.collected + totalGroundXP(s));
    rows.push({ version: '1.3', seed, pair, desiredModules: modules, phase: s.phase, seconds: s.time, level: s.level, kills: s.kills, hp: s.player.hp, beacon: s.beacon.hp, firstHit, firstBeacon, bossPhase2At: s.bossPhase2At, bossDeathAt: s.bossDeathAt, swaps, modules: s.modules, supports: s.supports, salvage: s.salvage, stats: shipStats(s), xpCreated: s.loot.created, xpCollected: s.loot.collected, groundXP: totalGroundXP(s), checkpoints });
  }
  for (const strategy of ['beacon', 'rim', 'adaptive']) { const g = new Baseline(0, seededRandom(42)), s = g.state; for (let f = 0; f < 43210 && !s.settled; f++) { while (s.phase === 'choosingUpgrade') baselineChoice(g); g.step(1 / 60, botInput(s, strategy)); s.cues.length = 0; } rows.push({ version: '1.2', seed: 42, strategy, phase: s.phase, seconds: s.time, level: s.level, kills: s.kills, hp: s.player.hp, beacon: s.beacon.hp }); }
  mkdirSync('artifacts/v13/balance-attempts', { recursive: true }); const file = `iteration-${readdirSync('artifacts/v13/balance-attempts').length + 1}.json`;
  const report = { method: 'Fast-forward60Hz, draft/reroll/swap/drop tự nhiên; bot không sửa HP/time/XP. Desired loadout là ưu tiên, thẻ khác có thể được chọn nếu reroll không ra.', config: { enemy: ENEMIES, scaling: ENEMY_SCALING, salvage: SALVAGE, bossHP: BALANCE.bossHP, pulsar: PULSAR, ion: ION }, rows };
  writeFileSync(`artifacts/v13/balance-attempts/${file}`, JSON.stringify(report, null, 2)); writeFileSync('artifacts/v13/balance-playtest.json', JSON.stringify(report, null, 2));
}, 120000);
it('1.3 cùng cấp/đầu tư: TTK tĩnh từng phút, clear đàn quanh tàu và boss hai phase', () => {
  const rows = [];
  for (const time of [0, 300, 660]) for (const id of MODULE_IDS) {
    const level = time === 0 ? 1 : time === 300 ? 3 : 5, g = new GameSession(0, seededRandom(77)), s = g.state; s.time = time; s.nextSpawn = Infinity; s.bossSpawned = true; s.nextGravity = Infinity; s.modules = { [id]: level }; s.player.protectedUntil = Infinity; clearGroundXP(s);
    const e = makeEnemy(s, 'drifter', { x: 100, y: 110 }, 'player'); e.speed = 0; e.damage = 0; const hp = e.hp;
    for (let f = 0; f < 60 * 60 && e.hp > 0; f++) { g.step(1 / 60); s.cues.length = 0; }
    rows.push({ kind: 'single-drifter', module: id, level, minute: time / 60, enemyHP: hp, ttk: s.time - time, dead: e.hp <= 0 });
  }
  for (const id of ['plasma', 'pulsar', 'ion'] as const) for (const scenario of ['cluster', 'line', 'boss'] as const) {
    const g = new GameSession(0, seededRandom(77)), s = g.state; s.modules = { [id]: 5 }; s.nextSpawn = Infinity; s.nextGravity = Infinity; s.bossSpawned = true; s.player.protectedUntil = Infinity; clearGroundXP(s);
    if (scenario === 'boss') { s.player.x = 500; s.player.y = 0; }
    const targets = scenario === 'boss' ? [makeEnemy(s, 'elder', { x: 700, y: 0 }, 'player')] : scenario === 'line' ? Array.from({ length: 5 }, (_, i) => { const e = makeEnemy(s, 'drifter', { x: 100 + i * 200, y: 110 }, 'player'); e.hp = e.maxHP = 10000; e.baseHP = 10000; return e; }) : Array.from({ length: 20 }, (_, i) => makeEnemy(s, 'drifter', { x: Math.cos(i * 2.399) * 150, y: 110 + Math.sin(i * 2.399) * 150 }, 'player'));
    for (const e of targets) { e.speed = 0; e.damage = 0; }
    const originalHP = targets.reduce((n, e) => n + e.hp, 0);
    for (let f = 0; f < (scenario === 'line' ? 10 : 600) * 60 && !targets.every(e => e.kind === 'elder' ? e.bossPhase === 'dead' : e.hp <= 0); f++) { if (s.phase === 'choosingUpgrade') { s.pending = 0; s.phase = 'playing'; s.choices = []; } clearGroundXP(s); for (const e of targets) e.speed = 0; g.step(1 / 60); s.cues.length = 0; }
    rows.push({ kind: scenario, damage: scenario === 'boss' ? undefined : originalHP - targets.reduce((n, e) => n + Math.max(0, e.hp), 0), targetsHit: targets.filter(e => e.hp < e.maxHP).length, module: id, level: 5, ttk: s.time, kills: s.kills, bossPhase2At: s.bossPhase2At, bossDeathAt: s.bossDeathAt, complete: targets.every(e => e.kind === 'elder' ? e.bossPhase === 'dead' : e.hp <= 0) });
  }
  writeFileSync('artifacts/v13/weapon-comparison.json', JSON.stringify({ config: { pulsar: PULSAR, ion: ION }, method: 'Fixture TTK: vị trí cố định100u(single)/150u(cluster,boss), không wave/damage tàu; một module, không support/gear. ClearXP để không nhận cấp. Không phải natural win proof.', rows }, null, 2));
  expect(rows.every(r => r.ttk >= 0 && Number.isFinite(r.ttk))).toBe(true);
}, 60000);
