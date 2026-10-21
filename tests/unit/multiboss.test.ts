import { describe, expect, it } from 'vitest';
import { GameSession, createRun, finishRun } from '../../src/game/core/GameSession';
import { seededRandom } from '../../src/game/core/math';
import { shipStats } from '../../src/game/core/stats';
import { BALANCE as B, ENEMY_SCALING } from '../../src/game/config/balance';
import { BOSSES, BOSS_RULES as C, isBoss, type BossId } from '../../src/game/config/bosses';
import { QUASAR, ION } from '../../src/game/config/content';
import { makeEnemy, minuteAt, minuteScalingStep, eventStep } from '../../src/game/systems/SpawnSystem';
import { bossStep } from '../../src/game/systems/bosses/BossSystem';
import { bossRuntime, reservedBullets } from '../../src/game/systems/bosses/state';
import { startAttack } from '../../src/game/systems/bosses/attacks';
import { clearBossAttacks } from '../../src/game/systems/bosses/BossLifecycle';
import { combatStep, hitEnemy, hitPlayer } from '../../src/game/systems/CombatSystem';
import { movementStep } from '../../src/game/systems/MovementSystem';
import { playerForce, pull, tideFlowTime } from '../../src/game/systems/hazards/forces';
import { astronomyStep, radiationStep } from '../../src/game/systems/hazards/AstronomySystem';
import { weaponStep } from '../../src/game/systems/WeaponSystem';
import { totalGroundXP } from '../../src/game/systems/PickupSystem';

describe('Boss scheduler / ownership / admission', () => {
  it('seeded, without replacement, idempotent và vượt cả hai mốc với boss cũ sống', () => {
    const run = () => {
      const s = createRun(0), rng = seededRandom(126);
      s.time = 537; eventStep(s, rng);
      const chosen = s.bossEvents[0].kind;
      eventStep(s, rng); expect(s.bossEvents[0].kind).toBe(chosen);
      expect(s.enemies).toHaveLength(0);
      s.time = 660.1; eventStep(s, rng); eventStep(s, rng);
      const bosses = s.enemies.filter(e => isBoss(e.kind));
      expect(bosses).toHaveLength(2); expect(new Set(bosses.map(e => e.kind)).size).toBe(2);
      expect(bosses.every(e => Math.hypot(e.x - s.player.x, e.y - s.player.y) >= B.spawnSafety)).toBe(true);
      expect(bosses.every(e => Math.hypot(e.x, e.y) >= B.spawnCoreSafety)).toBe(true);
      expect(bosses[1].maxHP).toBeCloseTo(BOSSES[bosses[1].kind as BossId].hp * .8);
      const hp = s.player.hp; bosses[0].x = s.player.x; bosses[0].y = s.player.y;
      combatStep(s, 0); expect(s.player.hp).toBe(hp);
      return s.bossEvents.map(e => e.kind);
    };
    expect(run()).toEqual(run());
  });

  it('hai beam không ghi đè; transition A chỉ thu hồi đòn A, B vẫn đánh', () => {
    const s = createRun(0);
    const bosses = [makeEnemy(s, 'elder', { x: 800, y: 0 }, 'player'), makeEnemy(s, 'elder', { x: 900, y: 300 }, 'player')];
    for (const e of bosses) Object.assign(bossRuntime(e), { readyAt: 0, spawnUntil: 0, actionIndex: 1 });
    bossStep(s); expect(bosses.every(e => e.boss?.beam?.ownerId === e.id)).toBe(true);
    const beamB = structuredClone(bosses[1].boss!.beam), countB = bosses[1].boss!.skillCount;
    hitEnemy(s, bosses[0], 1e9); expect(bosses[0].boss!.beam).toBeUndefined();
    expect(bosses[1].boss!.beam).toEqual(beamB);
    s.bossDefeated = true; s.time = 4; bossStep(s); s.time += C.recovery; bossStep(s);
    expect(bosses[1].boss!.skillCount).toBeGreaterThan(countB);
    expect(bosses[0].bossPhase).toBe('phase2');
  });

  for (const kind of Object.keys(BOSSES) as BossId[]) it(`${kind}: overkill, miễn transition, phase2 HP riêng, thưởng đúng một lần`, () => {
    const s = createRun(0), e = makeEnemy(s, kind, { x: 800, y: 0 }, 'player'), phase1 = e.maxHP;
    const xp = totalGroundXP(s);
    hitEnemy(s, e, 1e8); hitEnemy(s, e, 1e8);
    expect(e.bossPhase).toBe('transition'); expect(s.kills).toBe(0); expect(totalGroundXP(s)).toBe(xp);
    s.time = e.transitionEnd!; bossStep(s); expect(e.hp).toBeCloseTo(phase1 * .65);
    hitEnemy(s, e, 1e8); hitEnemy(s, e, 1e8);
    expect(s.kills).toBe(1); expect(s.metrics.bossKills).toBe(1); expect(s.salvage.rolls).toBe(1);
    expect(totalGroundXP(s)).toBe(xp + BOSSES[kind].xp);
  });

  it('budget đầy hoãn trước warning; reservation giữ nguyên cả hai loạt và khe', () => {
    const s = createRun(0), e = makeEnemy(s, 'gravemaw', { x: 800, y: 0 }, 'player');
    e.bossPhase = 'phase2'; Object.assign(e.boss!, { readyAt: 0, spawnUntil: 0, actionIndex: 1 });
    s.projectiles = Array.from({ length: 145 }, (_, i) => ({ id: 1000 + i, x: 0, y: 0, vx: 0, vy: 0, ttl: 10, damage: 1, blast: 0, hostile: false, radius: 1 }));
    bossStep(s); expect(e.boss!.attack).toBeUndefined(); expect(reservedBullets(s)).toBe(0);
    s.projectiles = []; s.time = C.retry; bossStep(s);
    const a = e.boss!.attack!; expect(a.kind).toBe('ring'); expect(reservedBullets(s)).toBe(28);
    s.time = a.fire; bossStep(s); const angles = s.projectiles.map(p => Math.atan2(p.vy, p.vx));
    expect(s.projectiles).toHaveLength(14); expect(reservedBullets(s)).toBe(14);
    s.time = a.fire + C.burstGap; bossStep(s);
    expect(s.projectiles).toHaveLength(28); expect(reservedBullets(s)).toBe(0);
    s.projectiles.slice(14).forEach((p,i)=>expect(Math.atan2(Math.sin(Math.atan2(p.vy,p.vx)-angles[i]),Math.cos(Math.atan2(p.vy,p.vx)-angles[i]))).toBeCloseTo(C.burstOffset));
    clearBossAttacks(s, e.id); combatStep(s, 0); expect(s.projectiles).toHaveLength(0);
  });

  it('Harrier khóa path, mỗi chặng có warning; swept contact không xuyên Beacon', () => {
    const s = createRun(0), e = makeEnemy(s, 'harrier', { x: 900, y: 0 }, 'player');
    s.player.x = 1100; s.player.y = 0; e.nextHit = 0; e.bossPhase = 'phase2';
    Object.assign(e.boss!, { readyAt: 0, spawnUntil: 0 }); bossStep(s);
    const a = e.boss!.attack!; expect(a.fire).toBeGreaterThanOrEqual(.9);
    s.time = a.lock; bossStep(s); const to = { ...a.to }, from = { x: e.x, y: e.y };
    s.player.y += 300; s.time += .1; movementStep(s, { x: 0, y: 0 }, .1); bossStep(s);
    expect(a.to).toEqual(to); expect({ x: e.x, y: e.y }).toEqual(from);
    s.player.x = 1040; s.player.y = 0; s.time = a.fire + C.dashSeconds * .8;
    e.previousX = e.x; e.previousY = e.y; movementStep(s, { x: 0, y: 0 }, C.dashSeconds * .8); combatStep(s, 0);
    expect(s.player.hp).toBeLessThan(100); expect(s.beacon.hp).toBe(300);
    s.time = a.end; bossStep(s); s.time += C.dashBreak; bossStep(s);
    const leg = e.boss!.attack!; expect(leg).not.toBe(a); expect(leg.kind).toBe('dash'); expect(leg.fire - s.time).toBeCloseTo(C.dashWarning);
    clearBossAttacks(s, e.id); expect(e.boss!.attack).toBeUndefined();
  });

  it('Helion tối đa hai vùng khóa vị trí; cleanup không đụng lịch thiên văn/owner khác', () => {
    const s = createRun(0), e = makeEnemy(s, 'helion', { x: 800, y: 0 }, 'player');
    e.bossPhase = 'phase2'; Object.assign(e.boss!, { readyAt: 0, spawnUntil: 0 }); bossStep(s);
    expect(s.bossZones).toHaveLength(2); expect(s.bossZones[1].start - s.bossZones[0].start).toBeCloseTo(C.solarStagger);
    const zones = structuredClone(s.bossZones); s.player.x += 400; s.time = .5; bossStep(s); expect(s.bossZones).toEqual(zones);
    expect(startAttack(s, e, 'scar', 0)).toBeUndefined();
    const other = makeEnemy(s, 'gravemaw', { x: -800, y: 0 }, 'player'); startAttack(s, other, 'maw', 0);
    const astronomy = structuredClone(s.astronomy); clearBossAttacks(s, e.id);
    expect(s.bossZones.map(z => z.ownerId)).toEqual([other.id]); expect(s.astronomy).toEqual(astronomy);
    finishRun(s, 'defeat', 'QA'); s.time = 700; eventStep(s, () => 0); bossStep(s);
    expect(s.enemies).toHaveLength(0); expect(s.bossZones).toHaveLength(0);
  });
});

describe('Hazard đo theo clock và vùng thật', () => {
  it('warning khóa vị trí, không lực/damage; core có lối thoát, cleanup ngay', () => {
    const s = createRun(0); s.player.x = 700; s.time = 207; astronomyStep(s);
    const event = s.astronomy[0], zones = structuredClone(event.zones!);
    Object.assign(s.player, zones[0]); radiationStep(s, () => 0); expect(s.player.hp).toBe(100);
    s.player.x += 200; s.time = 209; astronomyStep(s); expect(event.zones).toEqual(zones);
    expect(zones.every(z => Math.hypot(z.x, z.y) - z.radius > B.coreRadius)).toBe(true);
    s.time = 255; astronomyStep(s); expect(event.zones).toBeUndefined();
  });

  it('radiation độc lập contact, overlap mạnh nhất, honor miễn nhiễm thật, boss miễn %HP', () => {
    const g = new GameSession(), s = g.state; s.time = 210; s.player.x = 700; astronomyStep(s);
    const event = s.astronomy[0]; Object.assign(s.player, event.zones![0]); event.zones = [event.zones![0], { ...event.zones![0] }];
    s.supports.armor = 5; s.corruption = 50; hitPlayer(s, 10);
    const hp = s.player.hp; const e = makeEnemy(s, 'helion', s.player, 'player'), bossHP = e.hp;
    radiationStep(s, () => 0); expect(hp - s.player.hp).toBeCloseTo(7 * .8 * 1.2);
    radiationStep(s, () => 0); expect(hp - s.player.hp).toBeCloseTo(7 * .8 * 1.2); expect(e.hp).toBe(bossHP);
    g.pause(); const before = structuredClone(s); g.step(9); expect(s).toEqual(before); g.resume();
    s.time++; s.invulnerableUntil = s.time + 1; radiationStep(s, () => 0); expect(hp - s.player.hp).toBeCloseTo(7 * .8 * 1.2);
  });

  it('mép/tâm hữu hạn, quỹ đạo khác rõ, hút/đẩy và cap chung vẫn thoát', () => {
    const s = createRun(0); s.player.x = 700; s.player.y = 0; s.time = 462; astronomyStep(s);
    const e = s.astronomy.find(e => e.id === 'tide')!, center = { ...e.center! };
    s.player.x = center.x + 200; s.player.y = center.y;
    expect(playerForce(s)).toEqual({ x: 0, y: 0 }); s.time = 466.5; astronomyStep(s);
    const before = { ...s.player }; movementStep(s, { x: 0, y: 0 }, .1); expect(before.x - s.player.x).toBeGreaterThan(9);
    s.time = 469.5; expect(playerForce(s).x).toBeGreaterThan(0);
    expect(pull(center, center, 440, 140, true)).toEqual({ x: 0, y: 0 });
    expect(pull({ x: center.x + 440, y: center.y }, center, 440, 140, true)).toEqual({ x: 0, y: 0 });
    s.time = 467; const left = tideFlowTime(s); s.time = 469; const right = tideFlowTime(s); expect(left).toBeCloseTo(right);
    for (let i = 0; i < 3; i++) s.bossZones.push({ ...center, x: s.player.x - 10, id: i, ownerId: 999, kind: 'maw', radius: 200, start: 465, end: 500, force: 120, direction: 1, nextTick: 466, burstDone: false });
    s.time = 466.5; expect(Math.hypot(playerForce(s).x, playerForce(s).y)).toBeLessThanOrEqual(shipStats(s).moveSpeed * .78 + 1e-8);
    const oldX = s.player.x; movementStep(s, { x: 1, y: 0 }, .1); expect(s.player.x).toBeGreaterThan(oldX);
    s.time = 510; astronomyStep(s); expect(s.gravity).toBeUndefined(); expect(playerForce(s)).toEqual({ x: 0, y: 0 });
  });
});

describe('Scaling và Quasar envelope', () => {
  it('mốc phút tuyến tính, HP ratio/cooldown/target không reset; dead không hồi sinh', () => {
    const s = createRun(0), e = makeEnemy(s, 'drifter', { x: 800, y: 0 }, 'beacon');
    e.hp /= 2; e.nextHit = 90; const dead = makeEnemy(s, 'wisp', e, 'player'); dead.hp = 0;
    for (const [t, m] of [[59.99, 0], [60, 1], [60.01, 1], [540, 9], [660, 11]]) {
      s.time = t; minuteScalingStep(s); minuteScalingStep(s);
      expect(minuteAt(t)).toBe(m); expect(e.maxHP).toBeCloseTo(140 * (1 + ENEMY_SCALING.drifter.hp * m));
      expect(e.hp / e.maxHP).toBeCloseTo(.5); expect(e.nextHit).toBe(90); expect(e.target).toBe('beacon'); expect(dead.hp).toBe(0);
      const fresh = makeEnemy(s, 'drifter', e, 'player'); expect(fresh.maxHP).toBe(e.maxHP);
    }
  });

  it('Quasar beam/chain không vượt398 kể cả di chuyển; Ion độc lập giữ tầm cũ', () => {
    const s = createRun(0); s.modules = { quasar: 5 }; s.player.x = 0; s.player.y = 0;
    const enemies = [390, 398, 398.01, 510].map(x => { const e = makeEnemy(s, 'drifter', { x, y: 0 }, 'player'); e.hp = e.maxHP = 10000; return e; });
    weaponStep(s); s.time = QUASAR.duration / 2; weaponStep(s);
    expect(enemies[0].hp).toBeLessThan(10000); expect(enemies[1].hp).toBeLessThan(10000);
    expect(enemies.slice(2).every(e => e.hp === 10000)).toBe(true);
    expect(QUASAR.damage).toBe(220); expect(QUASAR.cooldown).toBe(1.6); expect(QUASAR.sweep).toBeCloseTo(Math.PI * 4 / 3);
    s.player.x = 150; s.nextQuasar = 0; s.time += 2; weaponStep(s); s.time += QUASAR.duration / 2; weaponStep(s);
    expect(enemies[3].hp).toBeLessThan(10000);
    expect(ION[4].range).toBeGreaterThan(398);
  });
});
