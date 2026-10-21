import { describe, it, expect } from 'vitest';
import { createRun, GameSession, resolveOutcome } from '../../src/game/core/GameSession';
import { ENEMIES, PULSAR, ION, MODULE_IDS } from '../../src/game/config/content';
import { BALANCE as B, ENEMY_SCALING } from '../../src/game/config/balance';
import { SALVAGE, type SalvageStat } from '../../src/game/config/salvage';
import { ACHIEVEMENTS, achievementValue } from '../../src/game/config/achievements';
import { shipStats, attackInterval } from '../../src/game/core/stats';
import { minuteAt, minuteScalingStep, makeEnemy } from '../../src/game/systems/SpawnSystem';
import { hitEnemy } from '../../src/game/systems/CombatSystem';
import { weaponStep } from '../../src/game/systems/WeaponSystem';
import { environmentStep } from '../../src/game/systems/MovementSystem';
import { chooseUpgrade, availableUpgrades, prepareChoices, moduleDescription } from '../../src/game/systems/ExperienceSystem';
import { collectSalvage, dropSalvage, salvageStep, salvageUsed } from '../../src/game/systems/SalvageSystem';
import { seededRandom } from '../../src/game/core/math';
import { SaveService, validateSave, type StorageLike } from '../../src/game/services/SaveService';
import { ProfileService } from '../../src/game/services/ProfileService';
import { clearGroundXP, totalGroundXP } from '../../src/game/systems/PickupSystem';
import { dampAngle, ShipPresentation } from '../../src/game/presentation/ShipPresentation';
import { coreHP, appearanceForCoreLevel } from '../../src/game/config/beacon';
import { numberText, percentText, hpText } from '../../src/game/ui/format';
import type { RunState } from '../../src/game/core/types';
import { GameClock } from '../../src/game/core/GameClock';

const pickup = (s: RunState, stat: SalvageStat, bp = 100, x = s.player.x): number => { const id = s.nextId++; s.salvage.items.push({ id, x, y: s.player.y, stat, bp, created: s.time, end: s.time + 30, state: 'available', sourceId: 999, sourceKind: 'wisp' }); return id; };
const memory = (): StorageLike => { let value: string | null = null; return { getItem: () => value, setItem: (_, next) => { value = next; } }; };
describe('Minute scaling từ base, event idempotent', () => {
  it('biên59.999/60/119.999/120/660/720 đúng phút và không tăng speed', () => {
    expect([59.999, 60, 119.999, 120, 660, 720].map(minuteAt)).toEqual([0, 1, 1, 2, 11, 11]);
    for (const time of [0, 60, 120, 300, 660, 720]) for (const kind of ['wisp', 'drifter', 'leech'] as const) {
      const s = createRun(0); s.time = time; const e = makeEnemy(s, kind, { x: 1000, y: 0 }, 'beacon'), rate = ENEMY_SCALING[kind];
      expect(e.maxHP).toBeCloseTo(ENEMIES[kind].hp * (1 + rate.hp * minuteAt(time))); expect(e.damage).toBeCloseTo(ENEMIES[kind].damage * (1 + rate.damage * minuteAt(time))); expect(e.speed).toBe(ENEMIES[kind].speed);
    }
    const s = createRun(0); s.time = 300; const d = makeEnemy(s, 'drifter', s.player, 'beacon'); expect(d.maxHP).toBeCloseTo(140 * 1.7); expect(d.damage).toBeCloseTo(11 * 1.45);
  });
  it('HP ratio/target/cooldown giữ, dead không hồi sinh, skip nhiều mốc không lãi kép', () => {
    const s = createRun(0), e = makeEnemy(s, 'wisp', s.player, 'beacon'), dead = makeEnemy(s, 'leech', s.player, 'player'), boss = makeEnemy(s, 'elder', { x: 900, y: 0 }, 'player');
    e.hp = e.maxHP * 0.3; e.nextHit = 88; e.nextDroneHit = 90; dead.hp = 0;
    s.time = 60; minuteScalingStep(s); expect(e.hp / e.maxHP).toBeCloseTo(0.3); const hp = e.hp; minuteScalingStep(s); expect(e.hp).toBe(hp);
    s.time = 660; minuteScalingStep(s); expect(e.maxHP).toBeCloseTo(28 * 2.10); expect(e.hp / e.maxHP).toBeCloseTo(0.3); expect(e.target).toBe('beacon'); expect(e.nextHit).toBe(88); expect(e.nextDroneHit).toBe(90); expect(dead.hp).toBe(0); expect(boss.maxHP).toBe(B.bossHP);
  });
  it('pause dừng minute/TTL/Corruption/survival và không buff phút12', () => {
    const g = new GameSession(); g.state.time = 59.99; pickup(g.state, 'damage'); g.pause(); const old = structuredClone(g.state); g.step(180); expect(g.state).toEqual(old); g.resume(); g.step(1 / 60); expect(g.state.minuteIndex).toBe(1);
    g.state.time = 719.99; g.state.player.protectedUntil = Infinity; g.state.nextSpawn = Infinity; g.step(1 / 60); expect(g.state.phase).toBe('victory'); expect(g.state.minuteIndex).toBe(11);
  });
});
describe('Salvage bp, drop ownership và nguồn stat additive', () => {
  it('collect thật một lần, clamp budget và HP đúng delta, không credit actual heal', () => {
    const s = createRun(0); s.player.hp = 60; s.supports.hull = 5; s.player.maxHP = 150; s.salvage.bonuses.damage = 1975;
    const id = pickup(s, 'hp'); expect(collectSalvage(s, id)).toBe(25); expect(collectSalvage(s, id)).toBe(0); expect(salvageUsed(s)).toBe(2000); expect(s.player.maxHP).toBeCloseTo(150.25); expect(s.player.hp).toBeCloseTo(60.25); expect(s.metrics.lightHealing).toBe(0); expect(s.metrics.salvageCollected).toBe(1);
    salvageStep(s, 0); expect(s.salvage.items).toHaveLength(0);
  });
  it('0.5%=50bp, cap speed10%, statpool không có armor, full budget không roll', () => {
    const s = createRun(0); expect(collectSalvage(s, pickup(s, 'damage', 50))).toBe(50); expect(shipStats(s).outgoing).toBeCloseTo(1.005);
    s.salvage.bonuses.speed = 975; expect(collectSalvage(s, pickup(s, 'speed', 100))).toBe(25); expect(s.salvage.bonuses.speed).toBe(1000);
    const rng = seededRandom(88), e = makeEnemy(s, 'elder', s.player, 'player'); for (let i = 0; i < 20; i++) dropSalvage(s, e, rng);
    expect(s.salvage.items.filter(p => p.state !== 'released').every(p => ['damage', 'rate', 'hp', 'pickup'].includes(p.stat))).toBe(true);
    s.salvage.bonuses.damage = 1000; const rolls = s.salvage.rolls; dropSalvage(s, e, rng); expect(s.salvage.rolls).toBe(rolls);
  });
  it('support+gear cộng trên base, damage/rate/HP và Corruption không nhân lặp', () => {
    const s = createRun(3); s.supports = { power: 5, haste: 5 }; s.corruption = 50; s.salvage.bonuses.damage = 1000; s.salvage.bonuses.rate = 1000;
    const stats = shipStats(s); expect(stats.outgoing).toBeCloseTo(1.5 * 1.2); expect(stats.attackRate).toBe(1.5); expect(attackInterval(0.9, stats)).toBeCloseTo(0.6); expect(s.beacon.maxHP).toBe(390);
    const e = makeEnemy(s, 'drifter', s.player, 'player'); e.hp = 1000; hitEnemy(s, e, 10); expect(e.hp).toBeCloseTo(982);
    s.supports = { engine: 5, hull: 5 }; s.salvage.bonuses = { damage: 0, rate: 0, hp: 1000, pickup: 0, speed: 1000 }; expect(shipStats(s).moveSpeed).toBe(270); expect(shipStats(s).maxHP).toBe(160);
  });
  it('distance/TTL/pending/cap validate collect; EXP không expiry hoặc mất giá trị', () => {
    const s = createRun(0), xp = totalGroundXP(s); const far = pickup(s, 'damage', 100, 1000); expect(collectSalvage(s, far)).toBe(0); s.time = 30; salvageStep(s, 0); expect(s.salvage.items).toHaveLength(0); expect(s.salvage.expired).toBe(1); expect(totalGroundXP(s)).toBe(xp);
    const id = pickup(s, 'damage'); s.salvage.bonuses.damage = 2000; expect(collectSalvage(s, id)).toBe(0); expect(s.salvage.bonuses.damage).toBe(2000); expect(s.metrics.salvageCollected).toBe(0);
    salvageStep(s, 0); s.salvage.bonuses.damage = 0;
    for (let i = 0; i < SALVAGE.activeCap; i++) pickup(s, 'hp'); const boss = makeEnemy(s, 'elder', s.player, 'player'); dropSalvage(s, boss, () => 0); expect(s.salvage.capHits).toBe(1); expect(s.salvage.items.length).toBe(SALVAGE.activeCap);
    expect(createRun(0).salvage.bonuses).toEqual({ damage: 0, rate: 0, hp: 0, pickup: 0, speed: 0 });
  });
  it('RNG seed tái lập loại/amount và boundary probability đúng config, không suy tỷ lệ từ ít mẫu', () => {
    const generate = (): string => { const s = createRun(0), rng = seededRandom(123), e = makeEnemy(s, 'wisp', s.player, 'player'); for (let i = 0; i < 500; i++) { dropSalvage(s, e, rng); if (s.salvage.items.length > 20) s.salvage.items.length = 0; } return JSON.stringify(s.salvage); };
    expect(generate()).toBe(generate());
    const s = createRun(0); s.minuteIndex = 5; const d = makeEnemy(s, 'drifter', s.player, 'player'); dropSalvage(s, d, () => 0.1049); expect(s.salvage.items).toHaveLength(1); dropSalvage(s, d, () => 0.1051); expect(s.salvage.items).toHaveLength(1);
  });
  it('phase1 không kill/drop, phase2 final drop bảo đảm một lần; despawn không roll', () => {
    const s = createRun(0), boss = makeEnemy(s, 'elder', s.player, 'player'), xp = totalGroundXP(s); hitEnemy(s, boss, 1e9, 'ion', () => 0); expect(s.kills).toBe(0); expect(s.salvage.rolls).toBe(0); expect(totalGroundXP(s)).toBe(xp); expect(s.metrics.bossPhase2).toBe(1);
    boss.bossPhase = 'phase2'; boss.hp = 10; hitEnemy(s, boss, 1e9, 'pulsar', () => 0); hitEnemy(s, boss, 1e9, 'pulsar', () => 0); expect(s.kills).toBe(1); expect(s.salvage.items).toHaveLength(1); expect(s.metrics.bossKills).toBe(1); expect(totalGroundXP(s)).toBe(xp + B.bossXP); s.enemies = []; expect(s.salvage.rolls).toBe(1);
  });
});
describe('Pulsar/Ion/swap có behavior riêng và ownership', () => {
  it('damage hai vũ khí mới tương đương30/60/144FPS qua simulation clock', () => {
    const damage = (fps: number): number => { const g = new GameSession(), s = g.state, clock = new GameClock(); s.modules = { pulsar: 5, ion: 5 }; s.nextSpawn = Infinity; const e = makeEnemy(s, 'drifter', { x: 100, y: 110 }, 'player'); e.hp = 100000; e.speed = 0; e.damage = 0; for (let i = 0; i < 5 * fps; i++) clock.advance(1 / fps, () => s.phase === 'playing', dt => g.step(dt)); return 100000 - e.hp; };
    expect(damage(30)).toBeCloseTo(damage(60), 8); expect(damage(144)).toBeCloseTo(damage(60), 8);
  });
  it('Pulsar full sector không miss qua tick lớn; một hit/pulse và source theo tàu', () => {
    const run = (steps: number): number[] => { const s = createRun(0); clearGroundXP(s); s.modules = { pulsar: 1 }; s.player.angle = 0;
      const es = [0, 1, 2, 3, 4, 5].map(a => { const e = makeEnemy(s, 'drifter', { x: Math.cos(a) * 150, y: s.player.y + Math.sin(a) * 150 }, 'player'); e.hp = 10000; return e; });
      weaponStep(s); for (let i = 1; i <= steps; i++) { s.time = PULSAR[0].duration * i / steps; weaponStep(s); } weaponStep(s); return es.map(e => 10000 - e.hp); };
    expect(run(1)).toEqual(run(42)); expect(run(1)).toEqual(Array(6).fill(PULSAR[0].damage));
    const s = createRun(0); s.modules = { pulsar: 1 }; s.player.angle = 0; weaponStep(s); s.player.x = 1000; const e = makeEnemy(s, 'drifter', { x: 1100, y: 110 }, 'player'); e.hp = 1000; s.time = 0.35; weaponStep(s); expect(e.hp).toBe(958); expect(s.metrics.pulsarHits).toBe(1);
  });
  it('Ion visited/số target/falloff/range đúng, path immutable không trỏ pooled enemy', () => {
    const s = createRun(0); s.modules = { ion: 1 }; const es = [100, 200, 300, 400].map(x => { const e = makeEnemy(s, 'drifter', { x, y: 110 }, 'player'); e.hp = 1000; return e; });
    weaponStep(s); expect(es.map(e => 1000 - e.hp)).toEqual([28, 28 * 0.8, 28 * 0.8 ** 2, 0].map(n => expect.closeTo(n)));
    expect(s.ionTraces[0].points).toHaveLength(4); const path = structuredClone(s.ionTraces[0].points); es[0].x = 9999; es[0].hp = 0; s.time = 0.1; weaponStep(s); expect(s.ionTraces[0].points).toEqual(path); expect(s.metrics.ionHits).toBe(1);
    s.time = 0.3; weaponStep(s); expect(s.ionTraces).toHaveLength(0);
  });
  it('hai vũ khí áp damage/rate nguồn chung một lần; max rate không chồng pulse vô hạn', () => {
    for (const id of ['pulsar', 'ion'] as const) {
      const s = createRun(0); s.modules = { [id]: 5 }; s.supports = { power: 5, haste: 5 }; s.salvage.bonuses.damage = 1000; s.salvage.bonuses.rate = 1000; s.corruption = 50; s.player.angle = 0;
      const e = makeEnemy(s, 'elder', { x: 100, y: 110 }, 'player'); e.hp = 10000; weaponStep(s);
      expect(10000 - e.hp).toBeCloseTo((id === 'pulsar' ? PULSAR[4].damage : ION[4].damage) * 1.5 * 1.2);
      expect(id === 'pulsar' ? s.nextPulsar : s.nextIon).toBeCloseTo((id === 'pulsar' ? PULSAR[4].cooldown : ION[4].cooldown) / 1.5);
    }
    for (let level = 1; level <= 5; level++) expect(PULSAR[level - 1].cooldown / 1.6).toBeGreaterThan(PULSAR[level - 1].duration);
  });
  it('full slot không draft thay; action chủ động, cancel giữ budget; commit chỉ đổi slot và cleanup attack cũ', () => {
    const g = new GameSession(0, seededRandom(7)), s = g.state; s.modules = { plasma: 5, drones: 3, well: 2 }; s.supports = { haste: 2, power: 3 }; s.salvage.bonuses.damage = 750; s.level = 19; s.xp = 12; s.pending = 2; prepareChoices(s, g.rng); s.choices = ['ion', 'pulsar', 'plasma']; s.rerollsRemaining = 0;
    const draft = s.draftId; expect(availableUpgrades(s)).not.toContain('ion'); expect(g.choose('ion', draft)).toBe(false); const refreshed=[...s.choices]; expect(refreshed).not.toContain('ion'); expect(g.beginSwap('ion',draft)).toBe(true); expect(s.pending).toBe(2); expect(s.swapCandidate).toBe('ion'); expect(g.reroll()).toBe(false);
    g.cancelSwap(); expect(s.choices).toEqual(refreshed); expect(s.rerollsRemaining).toBe(0); expect(s.xp).toBe(12);
    makeEnemy(s, 'drifter', { x: 100, y: 110 }, 'player'); weaponStep(s); expect(s.projectiles.length).toBeGreaterThan(0); const xp = totalGroundXP(s);
    g.beginSwap('ion', draft); expect(g.swap('plasma', draft)).toBe(true); expect(Object.entries(s.modules)).toEqual([['ion', 1], ['drones', 3], ['well', 2]]); expect(s.projectiles.filter(p => !p.hostile)).toHaveLength(0); expect(s.wells.length).toBeGreaterThan(0); expect(totalGroundXP(s)).toBe(xp); expect(s.supports).toEqual({ haste: 2, power: 3 }); expect(s.salvage.bonuses.damage).toBe(750); expect(s.level).toBe(19); expect(s.xp).toBe(12); expect(s.pending).toBe(1); expect(s.nextIon).toBeGreaterThan(s.time); expect(g.swap('drones', draft)).toBe(false);
    s.choices = ['plasma']; g.beginSwap('plasma'); g.swap('ion'); expect(s.modules.plasma).toBe(1); expect(s.modules.ion).toBeUndefined();
  });
  it('đổi Well/Pulsar/Ion dọn persistent state đúng owner, same weapon không duplicate', () => {
    for (const old of ['well', 'pulsar', 'ion'] as const) {
      const g = new GameSession(0, seededRandom(1)), s = g.state; s.modules = { plasma: 2, drones: 2, [old]: 3 }; makeEnemy(s, 'drifter', { x: 100, y: 110 }, 'player'); weaponStep(s);
      s.pending = 1; prepareChoices(s, g.rng); const next = old === 'ion' ? 'pulsar' : 'ion'; s.choices = [next]; g.beginSwap(next); expect(g.swap(next)).toBe(false); expect(g.swap(old)).toBe(true);
      expect(s.modules.plasma).toBe(2); expect(s.modules.drones).toBe(2); expect(s.wells.length + s.pulses.length + s.ionTraces.length).toBe(0);
    }
  });
});
describe('28 achievement credits/migration và Beacon transaction', () => {
  it('đúng28 stableIDs, năm mốc cũ; v2 không invent win/heal/typedkill, giữ unlocked/core/Echo/settings', () => {
    expect(ACHIEVEMENTS).toHaveLength(28); expect(new Set(ACHIEVEMENTS.map(a => a.id)).size).toBe(28); expect(ACHIEVEMENTS.slice(0, 5).map(a => a.id)).toEqual([100, 500, 1000, 2500, 5000].map(n => `kills-${n}`));
    const d = validateSave({ saveVersion: 2, currency: 77, coreLevel: 3, echo: true, careerKills: 1046, unlockedAchievements: ['kills-100', 'kills-500', 'kills-1000'], settings: { muted: true, quality: 'low', volume: 0.7 } });
    expect(d.saveVersion).toBe(3); expect(d.currency).toBe(77); expect(d.coreLevel).toBe(3); expect(d.echo).toBe(true); expect(d.settings.quality).toBe('low'); expect(d.metrics.wins).toBe(0); expect(d.metrics.lightHealing).toBe(0); expect(d.metrics.drifterKills).toBe(0); expect(d.careerKills).toBe(1046); expect(d.unlockedAchievements).toContain('kills-1000'); expect(d.unlockedAchievements).toContain('core-max');
  });
  it('typed death/multi-run best/event evolution/Pulsar/Ion/phase2/final thật được credit đúng', () => {
    const save = new SaveService(memory()), profile = new ProfileService(save, () => {}), s = createRun(0);
    for (let i = 0; i < 50; i++) for (const kind of ['drifter', 'leech'] as const) { const e = makeEnemy(s, kind, s.player, 'player'); hitEnemy(s, e, 1e6, 'ion', () => 1); hitEnemy(s, e, 1e6, 'ion', () => 1); }
    for (let i = 0; i < 150; i++) { const e = makeEnemy(s, 'wisp', s.player, 'player'); hitEnemy(s, e, 1e6, 'pulsar', () => 1); }
    for (let level = 2; level <= 5; level++) { s.phase = 'choosingUpgrade'; s.pending = 1; s.choices = ['plasma']; chooseUpgrade(s, 'plasma', Math.random); }
    const boss = makeEnemy(s, 'elder', { x: 900, y: 0 }, 'player'); hitEnemy(s, boss, 1e9); profile.sync(s); expect(save.data.unlockedAchievements).toContain('elder-phase2'); expect(save.data.metrics.bossKills).toBe(0);
    boss.bossPhase = 'phase2'; boss.hp = 1; hitEnemy(s, boss, 1e9); profile.sync(s); profile.sync(s);
    for (const id of ['drifters-50', 'leeches-50', 'run-kills-250', 'mini-sun', 'supernova', 'ion-hit', 'pulsar-hit', 'elder-final']) expect(save.data.unlockedAchievements).toContain(id);
    expect(save.data.careerKills).toBe(251); expect(save.data.metrics.bestKills).toBe(251); const next = createRun(0); next.kills = 100; profile.sync(next); expect(save.data.metrics.bestKills).toBe(251);
  });
  it('heal chỉ actual light, Corruption30 liên tục reset; pause không tăng metrics', () => {
    const save = new SaveService(memory()), profile = new ProfileService(save, () => {}), g = new GameSession(), s = g.state; s.nextSpawn = Infinity;
    environmentStep(s, 100); expect(s.metrics.lightHealing).toBe(0); s.player.hp = 50; environmentStep(s, 60); expect(s.metrics.lightHealing).toBe(50); profile.sync(s); expect(save.data.unlockedAchievements).toContain('light-healing-50');
    s.player.x = 800; s.corruption = 50; for (let i = 0; i < 29 * 60; i++) environmentStep(s, 1 / 60); expect(s.metrics.corruptionSeconds).toBeCloseTo(29); s.player.x = 0; s.corruption = 50; environmentStep(s, 1 / 60); expect(s.corruptionStreak).toBe(0);
    s.player.x = 800; s.corruption = 50; g.pause(); g.step(100); expect(s.metrics.corruptionSeconds).toBeCloseTo(29); g.resume(); for (let i = 0; i < 30 * 60; i++) { s.time += 1 / 60; environmentStep(s, 1 / 60); } profile.sync(s); expect(save.data.unlockedAchievements).toContain('corruption-30');
  });
  it('survival/bestGear/wins và tỷ lệ HP chỉ credit một lần cho mỗi kết quả', () => {
    const store = memory(), save = new SaveService(store), profile = new ProfileService(save, () => {});
    for (let run = 0; run < 5; run++) { const s = createRun(0); for (let i = 0; i < 20; i++) collectSalvage(s, pickup(s, 'damage')); s.time = 720; resolveOutcome(s); profile.sync(s); profile.sync(s); profile.flush(); }
    expect(save.data.metrics.wins).toBe(5); expect(save.data.metrics.salvageCollected).toBe(100); expect(save.data.metrics.salvageBudgetBP).toBe(2000); expect(save.data.metrics.healthyBeaconWins).toBe(5); expect(save.data.metrics.healthyShipWins).toBe(5);
    for (const a of ACHIEVEMENTS.filter(a => ['survival', 'wins', 'healthyBeaconWins', 'healthyShipWins', 'salvageCollected', 'salvageBudgetBP'].includes(a.metric))) expect(save.data.unlockedAchievements).toContain(a.id);
    const loaded = new SaveService(store); expect(loaded.data.unlockedAchievements).toEqual(save.data.unlockedAchievements); expect(loaded.data.metrics.wins).toBe(5); expect(save.data.currency).toBe(0);
    const lose = createRun(0); lose.time = 720; lose.player.hp = 0; resolveOutcome(lose); profile.sync(lose); expect(save.data.metrics.wins).toBe(5);
  });
  it('purchase expectedLevel guard/snapshot, RAM khi ghi lỗi; preview thuần/menu-world dùng cùng registry', () => {
    const save = new SaveService(memory()); save.data.coreLevel = 2; save.data.currency = 21; expect(save.buyCore(2)).toBe(false); expect(coreHP(2)).toBe(360); expect(coreHP(3)).toBe(390); expect(new Set([0, 1, 2, 3].map(appearanceForCoreLevel)).size).toBe(4);
    const active = createRun(2); save.data.currency = 60; expect(save.buyCore(2)).toBe(true); expect(save.buyCore(2)).toBe(false); expect(save.data.currency).toBe(30); expect(save.data.coreLevel).toBe(3); expect(active.beacon.maxHP).toBe(360); expect(active.coreLevel).toBe(2); expect(createRun(save.data.coreLevel).beacon.maxHP).toBe(390); expect(save.buyCore(3)).toBe(false); expect(save.data.unlockedAchievements).toContain('core-max');
    const blocked = new SaveService({ getItem: () => null, setItem: () => { throw Error('blocked'); } }); blocked.data.currency = 10; expect(blocked.buyCore(0)).toBe(true); expect(blocked.data.coreLevel).toBe(1); expect(blocked.data.currency).toBe(0); expect(blocked.buyCore(0)).toBe(false); expect(blocked.warning).not.toBe('');
  });
  it('trạng thái save3 lỗi được sanitize; UI formatter Việt và mọi module có tooltip', () => {
    const d = validateSave({ saveVersion: 3, metrics: { wins: -1, lightHealing: NaN, bossKills: Infinity }, unlockedAchievements: ['forged'], careerKills: 5000 }); expect(d.metrics.wins).toBe(0); expect(d.metrics.lightHealing).toBe(0); expect(d.unlockedAchievements).not.toContain('forged'); expect(achievementValue(d, 'careerKills')).toBe(5000);
    expect(numberText(1046)).toBe('1.046'); expect(percentText(0.005)).toBe('0,5%'); for (const id of MODULE_IDS) for (let level = 1; level <= 5; level++) expect(moduleDescription(id, level)).not.toContain('undefined');
    expect(hpText(100.5, 100.5)).toBe('100,5/100,5'); expect(hpText(99.127, 100.5)).toBe('99,13/100,5'); expect(hpText(-2, 100.5)).toBe('0/100,5');
  });
});
describe('Ship animation không đổi authoritative physics', () => {
  it('shortest angle179→−179, damping60/120 tương đương và giữ hướng khi dừng', () => {
    const radians = Math.PI / 180; const next = dampAngle(179 * radians, -179 * radians, 1 / 60); expect(next).toBeGreaterThan(179 * radians); expect(next - 179 * radians).toBeLessThan(2 * radians);
    const at = (hz: number): number => { const p = new ShipPresentation(); p.reset(0, 0); for (let i = 1; i <= hz; i++) p.update(Math.PI / 2, true, i / hz); p.update(Math.PI / 2, false, 2); return p.angle; }; expect(at(60)).toBeCloseTo(at(120), 6);
    const g = new GameSession(), s = g.state; s.nextSpawn = Infinity; g.step(1, { x: 1, y: 1 }); const old = { x: s.player.x, y: s.player.y }; g.step(1, { x: 0, y: 0 }); expect(s.player.x).toBe(old.x); expect(s.player.y).toBe(old.y);
  });
});
