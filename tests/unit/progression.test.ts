import { describe, expect, it } from 'vitest';
import { GameSession, createRun, resolveOutcome } from '../../src/game/core/GameSession';
import { calculateStats, shipStats, attackInterval } from '../../src/game/core/stats';
import { ACHIEVEMENTS } from '../../src/game/config/progression';
import { BALANCE as B, BOSS_PHASES as P } from '../../src/game/config/balance';
import { availableUpgrades, addXP, prepareChoices, chooseUpgrade, rerollChoices } from '../../src/game/systems/ExperienceSystem';
import { makeEnemy } from '../../src/game/systems/SpawnSystem';
import { combatStep, hitEnemy, hitPlayer } from '../../src/game/systems/CombatSystem';
import { weaponStep } from '../../src/game/systems/WeaponSystem';
import { bossStep } from '../../src/game/systems/BossSystem';
import { seededRandom } from '../../src/game/core/math';
import { SaveService, validateSave, type StorageLike } from '../../src/game/services/SaveService';
import { ProfileService } from '../../src/game/services/ProfileService';
import { clearGroundXP, totalGroundXP } from '../../src/game/systems/PickupSystem';
import { writeFileSync } from 'node:fs';
describe('Stats nguồn chung và draft1.2', () => {
  it('bonus cộng base/cap riêng, Core không buff tàu; rate không phải CDR', () => {
    const a = calculateStats('nova', { power: 5, haste: 5, hull: 5, engine: 5, magnet: 5, armor: 5 }, 50);
    expect(a.maxHP).toBe(150); expect(a.moveSpeed).toBe(250); expect(a.pickupRadius).toBe(127.5); expect(a.reduction).toBe(0.2);
    expect(a.outgoing).toBeCloseTo(1.68); expect(a.incoming).toBeCloseTo(0.96); expect(attackInterval(0.9, a)).toBeCloseTo(0.9 / 1.4);
    expect(attackInterval(0.9, { ...a, attackRate: 1.5 })).toBeCloseTo(0.6);
    expect(calculateStats('nova', { power: 999, engine: 999, armor: 999 }).damageBonus).toBe(0.4);
    expect(createRun(3).player.maxHP).toBe(100); expect(createRun(3).beacon.maxHP).toBe(390);
  });
  it('Hull chỉ cộng đúng HP tăng thêm, không hồi đầy', () => {
    const s = createRun(0); s.player.hp = 60;
    for (let i = 0; i < 5; i++) { s.pending = 1; s.phase = 'choosingUpgrade'; s.choices = ['hull']; chooseUpgrade(s, 'hull', Math.random); }
    expect(s.player.hp).toBe(110); expect(s.player.maxHP).toBe(150); expect(shipStats(s).maxHP).toBe(150);
  });
  it('damage tính tại hit cho cả ba module, armor không giảm Beacon hoặc Leech', () => {
    const s = createRun(0); s.supports = { power: 5, armor: 5 }; s.corruption = 50; s.xp = 9;
    const enemy = makeEnemy(s, 'drifter', s.player, 'player'); enemy.hp = 1000;
    hitEnemy(s, enemy, 10); expect(enemy.hp).toBeCloseTo(983.2);
    hitPlayer(s, 10); expect(s.player.hp).toBeCloseTo(90.4);
    const beacon = makeEnemy(s, 'drifter', { x: 0, y: 0 }, 'beacon'); combatStep(s, 0); expect(s.beacon.hp).toBe(300 - beacon.damage!);
    s.player.protectedUntil = 0; makeEnemy(s, 'leech', s.player, 'player'); combatStep(s, 0); expect(s.xp).toBe(5);
  });
  it('rate áp một lần cho Plasma/Well/drone; không rút duration Well', () => {
    const s = createRun(0); s.supports.haste = 5; s.modules = { plasma: 1, drones: 1, well: 1 };
    const e = makeEnemy(s, 'drifter', { x: 78, y: 110 }, 'player'); e.hp = 1000;
    weaponStep(s); expect(s.nextPlasma).toBeCloseTo(0.85 / 1.4); expect(s.nextWell).toBeCloseTo(6 / 1.4); expect(e.nextDroneHit).toBeCloseTo(0.5 / 1.4); expect(s.wells[0].end).toBe(2);
  });
  it('Plasma/Well đang tồn tại đọc power tại hit; drone cũng nhân đúng một lần', () => {
    for (const kind of ['plasma', 'drones', 'well'] as const) {
      const s = createRun(0); s.corruption = 50;
      s.modules = kind === 'plasma' ? { plasma: 1 } : kind === 'drones' ? { plasma: 1, drones: 1 } : { plasma: 1, well: 1 };
      if (kind !== 'plasma') s.nextPlasma = Infinity;
      const e = makeEnemy(s, 'drifter', { x: kind === 'drones' ? 78 : 100, y: 110 }, 'player'); e.hp = 1000;
      if (kind === 'drones') s.supports.power = 5;
      weaponStep(s);
      if (kind === 'plasma') { s.supports.power = 5; combatStep(s, 0.2); }
      if (kind === 'well') { s.supports.power = 5; s.time = 2; weaponStep(s); }
      const base = kind === 'plasma' ? 23 : kind === 'drones' ? 14 : 40;
      expect(1000 - e.hp).toBeCloseTo(base * 1.4 * 1.2);
    }
  });
  it('lọc trần/slot và đại diện hai nhóm, reroll thay toàn bộ khi đủ pool', () => {
    const s = createRun(0); s.pending = 1; const rng = seededRandom(7); prepareChoices(s, rng); const ids = [...s.choices], id = s.draftId;
    expect(ids.some(x => ['plasma', 'drones', 'well'].includes(x))).toBe(true); expect(ids.some(x => !['plasma', 'drones', 'well', 'pulsar', 'ion'].includes(x))).toBe(true);
    const before = { hp: s.player.hp, pending: s.pending, picks: s.picks, level: s.level };
    expect(rerollChoices(s, rng, id)).toBe(true); expect(s.choices.every(x => !ids.includes(x))).toBe(true); expect(rerollChoices(s, rng, id)).toBe(false);
    expect({ hp: s.player.hp, pending: s.pending, picks: s.picks, level: s.level }).toEqual(before);
    s.supports = { hull: 5, armor: 2 }; expect(availableUpgrades(s).filter(x => !['plasma', 'drones', 'well', 'pulsar', 'ion'].includes(x))).toEqual(['armor']);
  });
  it('multi-level giữ draft/reroll, stale action không được chọn draft tiếp', () => {
    const g = new GameSession(0, seededRandom(12)), s = g.state; addXP(s, 50); prepareChoices(s, g.rng); const id = s.draftId;
    g.reroll(id); const choices = [...s.choices]; g.pause(); g.resume(); expect(s.rerollsRemaining).toBe(0); expect(s.choices).toEqual(choices);
    expect(g.choose(s.choices[0], id)).toBe(true); expect(s.pending).toBe(2); expect(s.draftId).toBe(id + 1); expect(s.rerollsRemaining).toBe(1);
    expect(g.choose(s.choices[0], id)).toBe(false); expect(g.reroll(id)).toBe(false); expect(s.xp).toBe(2);
  });
  it('ít pool/rỗng không sinh thẻ giả hoặc heal lặp qua reroll', () => {
    const s = createRun(0); s.modules = { plasma: 5, drones: 5, well: 5 }; s.supports = { hull: 5, armor: 4 }; s.pending = 1; prepareChoices(s, Math.random);
    expect(s.choices).toEqual(['armor']); rerollChoices(s, Math.random); expect(s.choices).toEqual(['armor']);
    chooseUpgrade(s, 'armor', Math.random); s.masteryBonus.damage=2000; s.player.hp = 60; s.pending = 2; prepareChoices(s, Math.random); expect(s.player.hp).toBe(60); chooseUpgrade(s,'recover',Math.random); chooseUpgrade(s,'recover',Math.random); expect(s.player.hp).toBe(80); prepareChoices(s, Math.random); expect(s.player.hp).toBe(80); expect(s.phase).toBe('playing');
  });
});
describe('Boss hai phase và ownership', () => {
  it('spawn tại mốc540 không chồng tàu đứng đúng điểm boss và có grace đòn đầu', () => {
    const game = new GameSession(0, seededRandom(42)), s = game.state; s.time = 539.99; s.player.x = B.bossStart.x; s.player.y = B.bossStart.y; s.nextSpawn = Infinity; s.nextPlasma = Infinity;
    game.step(B.step); const boss = s.enemies.find(e => e.kind === 'elder')!;
    expect(Math.hypot(boss.x - s.player.x, boss.y - s.player.y)).toBeGreaterThan(B.spawnSafety); expect(boss.nextHit - s.time).toBeCloseTo(B.bossFirstRingDelay); expect(s.player.hp).toBe(100);
  });
  it('overkill/đòn cùng tick không xuyên transition hoặc thưởng nhiều lần', () => {
    const g = new GameSession(), s = g.state, boss = makeEnemy(s, 'elder', { x: 800, y: 0 }, 'player'), xp = totalGroundXP(s);
    s.bossRing = 0; bossStep(s); expect(s.projectiles.length).toBeGreaterThan(0);
    hitEnemy(s, boss, 1e9); hitEnemy(s, boss, 1e9); expect(boss.bossPhase).toBe('transition'); expect(s.kills).toBe(0); expect(totalGroundXP(s)).toBe(xp);
    combatStep(s, 0); expect(s.enemies).toContain(boss); expect(s.projectiles).toHaveLength(0); expect(s.beam).toBeUndefined();
    g.pause(); const snapshot = structuredClone(s); g.step(9); expect(s).toEqual(snapshot); g.resume();
    s.time = P.transitionSeconds; bossStep(s); expect(boss.bossPhase).toBe('phase2'); expect(boss.hp).toBe(B.bossHP * P.phase2HPRatio);
    const speed = boss.speed; bossStep(s); expect(boss.speed).toBe(speed);
    hitEnemy(s, boss, 1e9); hitEnemy(s, boss, 1e9); expect(s.kills).toBe(1); expect(s.bossDefeated).toBe(true); expect(totalGroundXP(s)).toBe(xp + B.bossXP);
    combatStep(s, 0); expect(s.enemies).not.toContain(boss);
  });
  it('nguồn đi theo boss, hướng aim thay đổi rồi khóa; collider fire khớp và recover sạch', () => {
    const s = createRun(0), boss = makeEnemy(s, 'elder', { x: 800, y: 100 }, 'player'); s.bossBeam = 0; s.bossRing = Infinity;
    bossStep(s); const first = s.beam!.angle; boss.x += 100; s.player.y += 200; s.time = 0.5; bossStep(s);
    expect(s.beam!.angle).not.toBe(first); expect(s.beam!.x).toBeCloseTo(boss.x + Math.cos(s.beam!.angle) * P.muzzleOffset);
    s.time = s.beam!.lock!; bossStep(s); const locked = s.beam!.angle; boss.y += 80; s.player.y += 300; s.time = s.beam!.fire; bossStep(s); expect(s.beam!.angle).toBe(locked);
    const beam = s.beam!; s.player.x = beam.x + Math.cos(locked) * 400; s.player.y = beam.y + Math.sin(locked) * 400; combatStep(s, 0); expect(s.player.hp).toBe(100-B.bossBeamDamage);
    s.time = beam.end + 0.01; bossStep(s); expect(s.beam).toBeUndefined(); s.player.protectedUntil = 0; combatStep(s, 0); expect(s.player.hp).toBe(100-B.bossBeamDamage);
  });
  it('đạn phát từ boss rồi độc lập, phase2 có fan hữu hạn và giữ thắng720/defeat ưu tiên', () => {
    const s = createRun(0), boss = makeEnemy(s, 'elder', { x: 800, y: 100 }, 'player'); boss.bossPhase = 'phase2'; s.bossRing = 0; s.bossBeam = Infinity;
    bossStep(s); const p = s.projectiles[0], old = { x: p.x, y: p.y }; boss.x += 100; expect(p.x).toBe(old.x);
    s.time = P.fanDelay; bossStep(s); expect(s.projectiles.length).toBe(BOSS_BULLETS); expect(s.projectiles.every(p => p.ownerId === boss.id)).toBe(true);
    s.time = 720; resolveOutcome(s); expect(s.phase).toBe('victory'); const d = createRun(0); d.time = 720; d.player.hp = 0; resolveOutcome(d); expect(d.phase).toBe('defeat');
  });
  it('snapshot scale không hồi HP/nhân stat theo frame, despawn không kill', () => {
    const s = createRun(0); s.time = 360; const e = makeEnemy(s, 'drifter', { x: 1200, y: 0 }, 'beacon'), hp = e.hp; e.hp -= 10; s.time = 700;
    combatStep(s, 0); expect(e.hp).toBe(hp - 10); expect(s.kills).toBe(0); expect(e.speed).toBeCloseTo(40);
    s.enemies = []; expect(s.kills).toBe(0);
  });
  it('stress phase2/110 quái/haste40% vẫn bắn thật và không vượt budget', () => {
    const g = new GameSession(0, seededRandom(42)), s = g.state; s.time = 635; s.player.x = 1050; s.player.y = 350; s.player.hp = s.player.maxHP = 1e8; s.beacon.hp = s.beacon.maxHP = 1e8; s.bossSpawned = true; s.nextSpawn = Infinity;
    s.modules = { plasma: 5, drones: 5, well: 5 }; s.supports = { power: 5, haste: 5 };
    clearGroundXP(s);
    const boss = makeEnemy(s, 'elder', { x: 1400, y: 220 }, 'player'); boss.bossPhase = 'phase2'; boss.hp = boss.maxHP = 1e8; s.bossRing = 635.1; s.bossBeam = 638;
    for (let i = 0; i < 110; i++) { const e = makeEnemy(s, i % 3 === 0 ? 'drifter' : 'wisp', { x: 1050 + Math.cos(i) * 280, y: 350 + Math.sin(i) * 280 }, 'player'); e.hp = e.maxHP = 1e8; e.baseHP = 1e8 / (1 + (e.kind === 'drifter' ? 0.08 : 0.05) * 10); }
    let peakProjectiles = 0, peakWells = 0, shots = 0;
    for (let frame = 0; frame < 60 * 60; frame++) { g.step(1 / 60, { x: Math.sin(s.time), y: Math.cos(s.time) }); peakProjectiles = Math.max(peakProjectiles, s.projectiles.length); peakWells = Math.max(peakWells, s.wells.length); shots += s.cues.filter(c => c === 'shot').length; s.cues.length = 0; }
    expect(shots).toBeGreaterThan(100); expect(peakProjectiles).toBeLessThan(B.projectileCap); expect(peakWells).toBeLessThanOrEqual(2); expect(s.loot.created).toBe(s.loot.collected + totalGroundXP(s));
    writeFileSync('artifacts/v13/regression-stress.json', JSON.stringify({ seconds: 60, fixture: 'HP1e8,110 thường+boss phase2, power5/haste5', shots, peakProjectiles, peakWells, enemies: s.enemies.length, effects: s.effects.length }, null, 2));
  });
});
const BOSS_BULLETS = P.phase2RingCount - P.phase2Gap + P.fanCount;
describe('Profile/migration và retry', () => {
  it('migrate v1 giữ tiền/Core/Echo/settings, không bịa kill; v2 resolve mốc theo career', () => {
    const migrated = validateSave({ saveVersion: 1, currency: 77, coreLevel: 3, echo: true, careerKills: 9999, settings: { muted: true, quality: 'low', volume: 0.6 } });
    expect(migrated.saveVersion).toBe(3); expect(migrated.currency).toBe(77); expect(migrated.coreLevel).toBe(3); expect(migrated.echo).toBe(true); expect(migrated.careerKills).toBe(0); expect(migrated.settings.quality).toBe('low');
    expect(validateSave({ saveVersion: 2, careerKills: 2500, unlockedAchievements: ['forged'] }).unlockedAchievements).toEqual(ACHIEVEMENTS.filter(a => a.metric === 'careerKills' && a.target <= 2500).map(a => a.id));
  });
  it('death một lần, milestone nhiều mốc, retry/result/pause không cộng lại', () => {
    let stored = '', writes = 0, fail = true; const storage: StorageLike = { getItem: () => stored || null, setItem: (_, text) => { writes++; if (fail) throw Error('blocked'); stored = text; } };
    const save = new SaveService(storage), messages: string[][] = [], profile = new ProfileService(save, names => messages.push(names)), s = createRun(0);
    s.kills = 1000; profile.sync(s); expect(save.data.careerKills).toBe(1000); expect(messages[0]).toHaveLength(4); const tries = writes;
    profile.sync(s); expect(writes).toBe(tries); fail = false; profile.flush(); profile.flush(); expect(save.data.careerKills).toBe(1000);
    s.phase = 'victory'; profile.sync(s); expect(new SaveService(storage).data.careerKills).toBe(1000); expect(messages).toHaveLength(1); expect(save.data.currency).toBe(0);
    const next = createRun(0); next.kills = 3; profile.sync(next); profile.flush(); expect(new SaveService(storage).data.careerKills).toBe(1003);
  });
});
