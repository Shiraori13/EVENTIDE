import { it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { GameSession } from '../../src/game/core/GameSession';
import { GameSession as BeforeGame } from '../fixtures/history/ui-hazards-before/src/game/core/GameSession';
import { makeEnemy as beforeEnemy } from '../fixtures/history/ui-hazards-before/src/game/systems/SpawnSystem';
import { chooseBotUpgrade as beforeChoose } from '../fixtures/history/ui-hazards-before/src/game/debug/Autoplay';
import { canFuseQuasar as beforeFuse } from '../fixtures/history/ui-hazards-before/src/game/systems/EvolutionSystem';
import { clearGroundXP } from '../../src/game/systems/PickupSystem';
import { seededRandom } from '../../src/game/core/math';
import { botInput, chooseBotUpgrade } from '../../src/game/debug/Autoplay';
import { canFuseQuasar } from '../../src/game/systems/EvolutionSystem';
import { makeEnemy } from '../../src/game/systems/SpawnSystem';
import { isBoss, BOSSES, type BossId } from '../../src/game/config/bosses';
import { shipStats } from '../../src/game/core/stats';
import type { SupportId } from '../../src/game/config/content';
import { movementStep } from '../../src/game/systems/MovementSystem';
import { movementStep as beforeMove } from '../fixtures/history/ui-hazards-before/src/game/systems/MovementSystem';
import { astronomyStep, radiationStep } from '../../src/game/systems/hazards/AstronomySystem';
import { astronomyStep as beforeAstronomy, radiationStep as beforeRadiation } from '../fixtures/history/ui-hazards-before/src/game/systems/AstronomySystem';

const builds: Record<string, SupportId[]> = { attack: ['power', 'haste'], defense: ['hull', 'armor'], mobility: ['engine', 'magnet'] };
// Bài cân bằng tái chạy không ghi đè báo cáo phát hành cũ; mỗi tác vụ có thể chọn output riêng.
const folder = process.env.EVENTIDE_BALANCE_ROOT ?? 'artifacts/balance-regression';
mkdirSync(folder, { recursive: true });
const enabled = process.env.EVENTIDE_BALANCE === '1';

it.skipIf(!enabled)('A/B natural seed/build policy; không cấp XP/HP/time trong lượt', () => {
  const rows = [];
  for (const version of ['before', 'after']) for (const seed of [7, 42]) for (const [build, pair] of Object.entries(builds)) for (const fusion of [false, true]) {
    const g = version === 'before' ? new BeforeGame(0, seededRandom(seed)) : new GameSession(0, seededRandom(seed)), s = g.state;
    const checkpoints:({at:number}&Record<string,unknown>)[] = [], bosses:({id:number;kind:string;at:number})[] = [], seen = new Set<number>(); let hazardSeconds = 0, peakEnemies = 0, peakProjectiles = 0, hpDamage = 0, lastHP = s.player.hp, fusionAt: number | undefined;
    for (let f = 0; f < 43210 && !s.settled; f++) {
      while (s.phase === 'choosingUpgrade') {
        if (g instanceof GameSession) { if (fusion && canFuseQuasar(g.state)) { g.fuse(); fusionAt = s.time; } chooseBotUpgrade(g, pair, ['plasma', 'pulsar', 'ion']); }
        else { if (fusion && beforeFuse(g.state)) { g.fuse(); fusionAt = s.time; } beforeChoose(g, pair, ['plasma', 'pulsar', 'ion']); }
      }
      g.step(1 / 60, botInput(s)); s.cues.length = 0;
      hpDamage += Math.max(0, lastHP - s.player.hp); lastHP = s.player.hp;
      if (g instanceof GameSession && g.state.astronomy.some(e => e.phase === 'active' && (e.zones?.some(z => Math.hypot(z.x - s.player.x, z.y - s.player.y) <= z.radius) || (e.center && Math.hypot(e.center.x - s.player.x, e.center.y - s.player.y) < 440)))) hazardSeconds += 1 / 60;
      peakEnemies = Math.max(peakEnemies, s.enemies.length); peakProjectiles = Math.max(peakProjectiles, s.projectiles.length);
      for (const e of s.enemies) if (isBoss(e.kind) && !seen.has(e.id)) { seen.add(e.id); bosses.push({ id: e.id, kind: e.kind, at: s.time }); }
      for (const t of [180, 360, 540, 660]) if (s.time >= t && !checkpoints.some(c => c.at === t)) checkpoints.push({ at: t, hp: s.player.hp, beacon: s.beacon.hp, level: s.level, kills: s.kills, enemies: s.enemies.length, modules: { ...s.modules }, supports: { ...s.supports }, liveBosses: s.enemies.filter(e => isBoss(e.kind)).map(e => ({ kind: e.kind, hp: e.hp, phase: e.bossPhase })) });
    }
    expect(s.settled).toBe(true); expect(Number.isFinite(s.player.x)).toBe(true);
    rows.push({ version, seed, build, fusion, fusionAt, end: s.phase, time: s.time, hp: s.player.hp, beacon: s.beacon.hp, hpDamage, hazardSeconds: version === 'after' ? hazardSeconds : null, peakEnemies, peakProjectiles, bosses, checkpoints, modules: s.modules, supports: s.supports });
  }
  writeFileSync(`${folder}/natural.json`, JSON.stringify({ method: 'Tăng tốc fixed60Hz, cùng seed/policy/build mong muốn; draft/drop thật. Không tăng HP/XP/thời gian. Hazard occupancy baseline chưa instrument: null.', rows }, null, 2));
}, 120000);

it.skipIf(!enabled)('TTK tất cả boss, hai lịch, ba build ±evolution; baseline Elder cùng fixture', () => {
  const rows = [];
  for (const version of ['before', 'after']) for (const kind of (version === 'before' ? ['elder'] : Object.keys(BOSSES)) as BossId[]) for (const at of [540, 660]) for (const [build, pair] of Object.entries(builds)) for (const fusion of [false, true]) {
    const g = version === 'before' ? new BeforeGame(0, seededRandom(77)) : new GameSession(0, seededRandom(77)), s = g.state;
    s.time = at; s.nextSpawn = Infinity; s.nextGravity = Infinity; s.finalGravity = true; s.bossSpawned = true; s.astronomy.forEach(e => e.phase = 'completed');
    s.player.x = 500; s.player.y = 0; s.modules = fusion ? { plasma: 5, quasar: 5 } : { plasma: 5, pulsar: 5, ion: 5 }; s.supports = Object.fromEntries(pair.map(id => [id, 5]));
    const maxHP = g instanceof GameSession ? shipStats(g.state).maxHP : build === 'defense' ? 150 : 100; s.player.hp = s.player.maxHP = maxHP;
    if (g instanceof GameSession) { g.state.bossEvents.forEach(e => e.spawned = true); clearGroundXP(g.state); }
    else { s.pickups = []; s.loot.cells.fill(null); s.loot.ledgerCount = s.loot.ledgerXP = 0; }
    const boss = g instanceof GameSession ? makeEnemy(g.state, kind, { x: 850, y: 0 }, 'player') : beforeEnemy(g.state, 'elder', { x: 850, y: 0 }, 'player');
    if (g instanceof GameSession && at === 660) { boss.hp *= .8; boss.maxHP = boss.hp; g.state.enemies.find(e=>e.id===boss.id)!.boss!.phase1HP = boss.hp; }
    let phase2At: number | undefined, deathAt: number | undefined, firstDamage: number | undefined, damage = 0, lastHP = s.player.hp, skills = 0;
    const phase1HP = boss.hp;
    for (let f = 0; f < 120 * 60 && !s.settled && boss.bossPhase !== 'dead'; f++) {
      if (s.phase === 'choosingUpgrade') { s.phase = 'playing'; s.pending = 0; s.choices = []; }
      g.step(1 / 60, botInput(s)); s.cues.length = 0;
      damage += Math.max(0, lastHP - s.player.hp); lastHP = s.player.hp;
      if (boss.hp < phase1HP && firstDamage === undefined) firstDamage = s.time;
      if (boss.bossPhase === 'phase2' && phase2At === undefined) phase2At = s.time;
      if (String(boss.bossPhase) === 'dead') deathAt = s.time;
      if ('boss' in boss) skills = boss.boss?.skillCount ?? 0;
    }
    rows.push({ version, kind, at, build, fusion, phase1HP, ttk: deathAt === undefined ? null : deathAt - at, firstDamage: firstDamage === undefined ? null : firstDamage - at, phase2: phase2At === undefined ? null : phase2At - at, phase: boss.bossPhase, end: s.phase, seconds: s.time - at, shipDamage: damage, hp: s.player.hp, beacon: s.beacon.hp, skills });
  }
  writeFileSync(`${folder}/boss-ttk.json`, JSON.stringify({ method: 'Fixture build cấp5, không gear/mastery/wave, HP thật, bot input; spawn350u, không bất tử. secondHP×.8 chỉ after. Kết thúc720s như game.', rows }, null, 2));
}, 120000);

it.skipIf(!enabled)('ba cặp boss + hazard; phase độc lập và trần object', () => {
  const rows = [];
  for (const pair of [['elder', 'gravemaw'], ['helion', 'harrier'], ['gravemaw', 'helion']] as BossId[][]) {
    const g = new GameSession(0, seededRandom(42)), s = g.state; s.time = 660; s.bossEvents.forEach(e => e.spawned = true); s.nextSpawn = Infinity; s.nextGravity = Infinity; s.finalGravity = true;
    s.player.x = 850; s.player.y = 0; s.modules = { plasma: 5, quasar: 5, drones: 5 }; s.supports = { hull: 5, armor: 5 }; s.player.hp = s.player.maxHP = 150; clearGroundXP(s);
    s.gravity = { x: 1100, y: 100, start: 662, end: 720, final: true };
    const bosses = pair.map((id, i) => makeEnemy(s, id, { x: 1100, y: i * 250 }, 'player')); let peakProjectiles = 0, peakZones = 0;
    for (let f = 0; f < 3601 && !s.settled; f++) {
      while (s.phase === 'choosingUpgrade') chooseBotUpgrade(g, ['hull', 'armor'], ['plasma', 'quasar', 'drones']);
      g.step(1 / 60, botInput(s)); s.cues.length = 0;
      peakProjectiles = Math.max(peakProjectiles, s.projectiles.length); peakZones = Math.max(peakZones, s.bossZones.length);
    }
    expect(peakProjectiles).toBeLessThanOrEqual(160); expect(peakZones).toBeLessThanOrEqual(6);
    rows.push({ pair, phase: s.phase, seconds: s.time - 660, hp: s.player.hp, beacon: s.beacon.hp, peakProjectiles, peakZones, bosses: bosses.map(e => ({ kind: e.kind, phase: e.bossPhase, hp: e.hp, skills: e.boss?.skillCount })) });
  }
  writeFileSync(`${folder}/pairs.json`, JSON.stringify(rows, null, 2));
}, 60000);

it.skipIf(!enabled)('đo hazard A/B và tốc độ dọn quái phút3/6/9/11', () => {
  const forces = [], radiation = [], clearance = [];
  for (const version of ['off', 'before', 'after']) {
    const g = version === 'before' ? new BeforeGame(0, seededRandom(77)) : new GameSession(0, seededRandom(77)), s = g.state;
    s.time = 466.5; s.player.x = 1050; s.player.y = 0;
    if (g instanceof GameSession) { const event = g.state.astronomy.find(e => e.id === 'tide')!; event.center = { x: 950, y: 0 }; astronomyStep(g.state); }
    else beforeAstronomy(g.state);
    if (version === 'off') s.gravity = undefined;
    let escape: number | undefined; const trajectory:({t:number;x:number})[]=[];
    for (let i = 0; i < 5 * 60; i++) {
      s.time += 1 / 60;
      if (g instanceof GameSession) movementStep(g.state, { x: 1, y: 0 }, 1 / 60); else beforeMove(g.state, { x: 1, y: 0 }, 1 / 60);
      if((i+1)%30===0)trajectory.push({t:(i+1)/60,x:s.player.x});
      if (s.player.x >= 1390 && escape === undefined) escape = s.time - 466.5;
    }
    forces.push({ version, escape440Seconds: escape, trajectory, xAfter5s: s.player.x, moved: s.player.x - 1050 });
  }
  for (const version of ['before', 'after']) for (const [build, pair] of Object.entries(builds)) {
    const g = version === 'before' ? new BeforeGame(0) : new GameSession(0), s = g.state;
    s.time = 210; s.supports = Object.fromEntries(pair.map(id => [id, 5])); s.corruption = 50;
    if (g instanceof GameSession) { astronomyStep(g.state); Object.assign(s.player, g.state.astronomy[0].zones![0]); }
    else { beforeAstronomy(g.state); s.player.x = 900; s.player.y = 300; }
    const hp = s.player.hp;
    for (let i = 0; i < 7 * 60; i++) { s.time = 210 + i / 60; if (g instanceof GameSession) radiationStep(g.state, () => 0); else beforeRadiation(g.state, () => 0); }
    radiation.push({ version, build, seconds: 7, hpLost: hp - s.player.hp, modifiers: { armor: build === 'defense' ? .8 : 1, corruption: 1.2 }, method: 'Đứng trong vùng, không heal/contact; Corruption50 cố định; timer simulation.' });
  }
  for (const version of ['before', 'after']) for (const at of [180, 360, 540, 660]) for (const build of ['weak', 'medium', 'evolved']) {
    const g = version === 'before' ? new BeforeGame(0, seededRandom(77)) : new GameSession(0, seededRandom(77)), s = g.state;
    s.time = at; s.nextSpawn = Infinity; s.nextGravity = Infinity; s.finalGravity = true; s.bossSpawned = true; s.astronomy = []; s.player.x = 0; s.player.y = 0;
    s.modules = build === 'evolved' ? { plasma: 5, quasar: 5 } : build === 'medium' ? { plasma: 3, pulsar: 3, ion: 3 } : { plasma: 1, pulsar: 1, ion: 1 };
    if (g instanceof GameSession) { g.state.bossEvents.forEach(e => e.spawned = true); clearGroundXP(g.state); } else { s.pickups = []; s.loot.cells.fill(null); s.loot.ledgerCount = s.loot.ledgerXP = 0; }
    const targets = Array.from({ length: 20 }, (_, i) => {
      const p = { x: Math.cos(i * 2.399) * 160, y: Math.sin(i * 2.399) * 160 }, e = g instanceof GameSession ? makeEnemy(g.state, 'drifter', p, 'player') : beforeEnemy(g.state, 'drifter', p, 'player'); e.speed = 0; e.damage = 0; return e;
    });
    for (let i = 0; i < 45 * 60 && !s.settled && targets.some(e => e.hp > 0); i++) { s.phase = 'playing'; s.pending = 0; g.step(1 / 60); s.cues.length = 0; }
    clearance.push({ version, at, build, seconds: s.time - at, remaining: targets.filter(e => e.hp > 0).length, method: '20Drifter đứng yên r160, không wave/events/gear/support; tối đa45s; chỉ dùng để so tốc độ dọn, không chứng minh né.' });
  }
  writeFileSync(`${folder}/hazard-clearance.json`, JSON.stringify({ forces, radiation, clearance }, null, 2));
  expect(forces.every(r => Number.isFinite(r.xAfter5s))).toBe(true);
}, 60000);
