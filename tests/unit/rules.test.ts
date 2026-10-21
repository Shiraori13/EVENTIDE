import { isBoss } from '../../src/game/config/bosses';
import { bossRuntime } from '../../src/game/systems/bosses/state';
import { describe, expect, it } from 'vitest';
import { GameSession, beaconHP, createRun, finishRun, resolveOutcome } from '../../src/game/core/GameSession';
import { GameClock } from '../../src/game/core/GameClock';
import { BALANCE as B } from '../../src/game/config/balance';
import { PLASMA, type UpgradeId } from '../../src/game/config/content';
import { distance, insideLight, seededRandom } from '../../src/game/core/math';
import { environmentStep, movementStep, pull } from '../../src/game/systems/MovementSystem';
import { addXP, availableUpgrades, chooseUpgrade, drainXP, prepareChoices, xpRequired } from '../../src/game/systems/ExperienceSystem';
import { combatStep, damageMultiplier, dropXP, hitEnemy } from '../../src/game/systems/CombatSystem';
import { dronePositions, weaponStep } from '../../src/game/systems/WeaponSystem';
import { eventStep, makeEnemy } from '../../src/game/systems/SpawnSystem';
import { bossStep } from '../../src/game/systems/bosses/BossSystem';
import { totalGroundXP } from '../../src/game/systems/PickupSystem';
import { SaveService, defaultSave, validateSave, type StorageLike } from '../../src/game/services/SaveService';
describe('Vùng sáng và Corruption', () => {
  it('biên sáng nhất quán; hồi máu clamp; 15s ngoài rồi về dưới ngưỡng', () => {
    const s = createRun(0); s.player.x = B.lightRadius; s.player.y = 0;
    expect(insideLight(s.player)).toBe(true); s.player.hp = 99.5; environmentStep(s, 1); expect(s.player.hp).toBe(100);
    s.player.x += 0.001; environmentStep(s, 15); expect(s.corruption).toBe(60);
    s.player.x = 0; environmentStep(s, 1.26); expect(s.corruption).toBeLessThan(50);
    environmentStep(s, 100); expect(s.corruption).toBe(0); s.player.x = 700; environmentStep(s, 100); expect(s.corruption).toBe(100);
  });
  it('49.9/50: buff không nhân lặp, không tăng damage Beacon', () => {
    const s = createRun(0); s.corruption = 49.9; expect(damageMultiplier(s)).toBe(1); s.corruption = 50;
    const e = makeEnemy(s, 'drifter', { x: 0, y: 0 }, 'beacon'); e.hp = 1000;
    hitEnemy(s, e, 10); hitEnemy(s, e, 10); expect(e.hp).toBe(976);
    combatStep(s, B.step); expect(s.beacon.hp).toBe(289);
  });
  it('đường chéo chuẩn hóa và slow tính từ base stat', () => {
    const a = createRun(0), b = createRun(0); a.player.x = 1000; b.player.x = 1000;
    const oldA = { ...a.player }, oldB = { ...b.player }; movementStep(a, { x: 1, y: 0 }, 1); movementStep(b, { x: 1, y: 1 }, 1);
    expect(distance(a.player, oldA)).toBeCloseTo(distance(b.player, oldB));
    const e = makeEnemy(a, 'wisp', { x: 300, y: 0 }, 'beacon');
    movementStep(a, { x: 0, y: 0 }, 1); const x = e.x; movementStep(a, { x: 0, y: 0 }, 1); expect(x - e.x).toBeCloseTo(70 * 0.8);
  });
});
describe('XP, nâng cấp và module', () => {
  it('giữ dư nhiều cấp; Leech chỉ trừ tiến độ hiện tại', () => {
    const s = createRun(0); addXP(s, 50); expect(s.level).toBe(4); expect(s.pending).toBe(3); expect(s.xp).toBe(2);
    drainXP(s); expect(s.xp).toBe(0); expect(s.level).toBe(4); expect(s.modules).toEqual({ plasma: 1 });
    prepareChoices(s, seededRandom(4)); expect(s.phase).toBe('choosingUpgrade');
    chooseUpgrade(s, s.choices[0], seededRandom(2)); expect(s.pending).toBe(2); expect(s.phase).toBe('choosingUpgrade');
  });
  it('pool ít hơn ba và rỗng, hồi máu không tạo modal rỗng', () => {
    const s = createRun(0); s.modules = { plasma: 5, drones: 5, well: 5 }; s.supports = { hull: 5, magnet: 4 };
    s.pending = 1; prepareChoices(s, Math.random); expect(s.choices).toEqual(['magnet']);
    chooseUpgrade(s, 'magnet', Math.random); expect(availableUpgrades(s)).toEqual([]);
    s.masteryBonus.damage=2000; s.player.hp = 95; addXP(s, xpRequired(s.level)); prepareChoices(s, Math.random);
    expect(s.player.hp).toBe(95); expect(s.choices).toEqual(['recover']); chooseUpgrade(s,'recover',Math.random); expect(s.player.hp).toBe(105); expect(s.phase).toBe('playing'); expect(s.pending).toBe(0);
  });
  it('lựa chọn không trùng hoặc vượt trần; HP tăng cùng lượng', () => {
    const s = createRun(0); s.pending = 2; prepareChoices(s, seededRandom(1));
    expect(new Set(s.choices).size).toBe(s.choices.length);
    s.choices = ['hull']; s.player.hp = 40; chooseUpgrade(s, 'hull', Math.random);
    expect(s.player.hp).toBe(50); expect(s.player.maxHP).toBe(110);
  });
  it('Plasma cấp 3/5 giữ một ô; nổ chỉ gây một hit cho mục tiêu chính', () => {
    const s = createRun(0);
    for (let n = 2; n <= 5; n++) { s.pending = 1; s.phase = 'choosingUpgrade'; s.choices = ['plasma']; chooseUpgrade(s, 'plasma', Math.random); expect(Object.keys(s.modules)).toHaveLength(1); }
    expect(PLASMA[2].blast).toBeGreaterThan(0); expect(PLASMA[4].blast).toBeGreaterThan(PLASMA[2].blast);
    const e = makeEnemy(s, 'drifter', { x: 100, y: 110 }, 'player');
    weaponStep(s); combatStep(s, 0.15); expect(e.hp).toBe(140 - 82);
  });
  it('gộp pickup ở cap giữ toàn bộ XP', () => {
    const s = createRun(0); s.pickups = [];
    for (let i = 0; i < B.pickupCap + 40; i++) dropXP(s, { x: i, y: 0 }, 7);
    expect(s.pickups.length).toBeLessThanOrEqual(B.pickupCap); expect(totalGroundXP(s)).toBe((B.pickupCap + 40) * 7);
  });
});
describe('Clock, cooldown, sự kiện và kết quả', () => {
  function contact(fps: number): number {
    const session = new GameSession(0, seededRandom(1)), s = session.state, clock = new GameClock();
    s.nextSpawn = Infinity; s.nextPlasma = Infinity; s.player.x = 1000; s.player.hp = 10000; s.player.maxHP = 10000;
    makeEnemy(s, 'drifter', s.player, 'player');
    for (let i = 0; i < fps * 5; i++) clock.advance(1 / fps, () => true, dt => session.step(dt));
    return 10000 - s.player.hp;
  }
  it('damage va chạm tương đương ở 30/60/144 FPS qua fixed-step', () => { expect(contact(30)).toBeCloseTo(contact(60), 8); expect(contact(144)).toBeCloseTo(contact(60), 8); });
  function droneDamage(fps: number): number {
    const session = new GameSession(), s = session.state, clock = new GameClock(); s.modules.drones = 1;
    const e = makeEnemy(s, 'drifter', dronePositions(s)[0], 'player'); e.hp = 10000;
    for (let i = 0; i < fps * 5; i++) clock.advance(1 / fps, () => true, dt => { s.time += dt; const p = dronePositions(s)[0]; e.x = p.x; e.y = p.y; weaponStep(s); });
    return 10000 - e.hp;
  }
  it('damage drone độc lập FPS với sai số 1e-8', () => { expect(droneDamage(30)).toBeCloseTo(droneDamage(60), 8); expect(droneDamage(144)).toBeCloseTo(droneDamage(60), 8); });
  it('pause đóng băng toàn state và resume nâng cấp không bỏ qua', () => {
    const game = new GameSession(), s = game.state; game.pause(); const before = structuredClone(s); game.step(30); expect(s).toEqual(before);
    game.resume(); addXP(s, 12); game.step(B.step); expect(s.phase).toBe('choosingUpgrade');
    game.pause(); game.resume(); expect(s.phase).toBe('choosingUpgrade');
    const clock = new GameClock(); clock.advance(1000, () => true, dt => { s.time += dt; }); expect(s.time).toBeLessThan(0.12);
  });
  it('boss/hố đen vượt mốc vẫn một lần, không sinh vùng khác sau 630', () => {
    const s = createRun(0); s.time = 541; eventStep(s, Math.random); eventStep(s, Math.random);
    expect(s.enemies.filter(e => isBoss(e.kind))).toHaveLength(1);
    s.time = 631; eventStep(s, Math.random); const final = s.gravity; expect(final?.final).toBe(true);
    s.time = 700; eventStep(s, Math.random); expect(s.gravity).toBe(final);
    expect(pull({ x: 0, y: 0 }, { x: 0, y: 0 }, 100, 70)).toEqual({ x: 0, y: 0 });
  });
  it('boss có slot ngoài cap, chết không tự thắng', () => {
    const s = createRun(0); for (let i = 0; i < B.enemyCap; i++) makeEnemy(s, 'wisp', { x: 1000, y: 0 }, 'player');
    s.time = 540; eventStep(s, Math.random); const boss = s.enemies.find(e => isBoss(e.kind))!;
    hitEnemy(s, boss, 10000); expect(s.phase).toBe('playing'); expect(s.bossDefeated).toBe(false); expect(boss.bossPhase).toBe('transition');
  });
  it('hit cuối ưu tiên defeat; đủ sạc thắng dù boss còn sống; trả thưởng 17 một lần', () => {
    const s = createRun(0); s.time = 720; s.player.hp = 0; resolveOutcome(s); expect(s.phase).toBe('defeat');
    const win = createRun(0); win.time = 720; makeEnemy(win, 'elder', { x: 900, y: 0 }, 'player'); resolveOutcome(win);
    expect(win.phase).toBe('victory'); expect(win.reward).toBe(17); finishRun(win, 'defeat', 'duplicate'); expect(win.reward).toBe(17); expect(win.phase).toBe('victory');
  });
  it('lượt mới không giữ XP, Corruption, cooldown hoặc thực thể cũ', () => {
    const game = new GameSession(); game.state.corruption = 99; game.state.xp = 9; game.state.nextPlasma = 800;
    const next = new GameSession(); expect(next.state.corruption).toBe(0); expect(next.state.xp).toBe(0); expect(next.state.nextPlasma).toBe(0); expect(next.state.enemies).toEqual([]);
  });
  it('damage chí mạng trong step cuối có ưu tiên hơn sạc đủ', () => {
    const game = new GameSession(), s = game.state; s.time = 719.99;
    s.player.x = 1000; s.player.y = 0; s.player.hp = 3; s.nextPlasma = Infinity;
    makeEnemy(s, 'wisp', s.player, 'player'); game.step(B.step);
    expect(s.phase).toBe('defeat'); expect(s.reward).toBe(12);
  });
  it('tia boss giữ hướng báo trước, không damage trước giờ bắn', () => {
    const s = createRun(0); s.time = 550;
    const boss = makeEnemy(s, 'elder', { x: 800, y: 0 }, 'player'); s.player.x = 0; s.player.y = 0; Object.assign(bossRuntime(boss), {readyAt:s.time,spawnUntil:0,actionIndex:1});
    bossStep(s); const angle = boss.boss!.beam!.angle; combatStep(s, 0); expect(s.player.hp).toBe(100);
    s.player.y = 100; s.time = 551; bossStep(s); expect(boss.boss!.beam!.angle).not.toBe(angle);
    s.time = boss.boss!.beam!.lock!; bossStep(s); const locked = boss.boss!.beam!.angle;
    s.player.y = 0; s.time += 0.05; bossStep(s); expect(boss.boss!.beam!.angle).toBe(locked);
    s.player.x = boss.boss!.beam!.x + Math.cos(locked) * 500; s.player.y = boss.boss!.beam!.y + Math.sin(locked) * 500;
    s.time = boss.boss!.beam!.fire; combatStep(s, 0); expect(s.player.hp).toBe(100-B.bossBeamDamage); expect(boss.hp).toBe(B.bossHP);
  });
  it('HP bằng 0 đầu tick không được hồi sinh bởi vùng sáng', () => {
    const game = new GameSession(); game.state.player.hp = 0; game.step(B.step); expect(game.state.phase).toBe('defeat');
  });
});
describe('Save và kinh tế', () => {
  it('validate dữ liệu hỏng/phiên bản/range/NaN', () => {
    expect(validateSave(null)).toEqual(defaultSave()); expect(validateSave({ saveVersion: 99, currency: 100 })).toEqual(defaultSave());
    const s = validateSave({ saveVersion: 1, currency: -10, coreLevel: 44, echo: 'true', settings: { volume: NaN } });
    expect(s.currency).toBe(0); expect(s.coreLevel).toBe(3); expect(s.echo).toBe(false); expect(s.settings.volume).toBe(0.35);
  });
  it('JSON hỏng và storage bị chặn vẫn chơi bằng RAM', () => {
    const bad: StorageLike = { getItem: () => '{broken', setItem: () => { throw new Error('blocked'); } };
    const save = new SaveService(bad); expect(save.data).toEqual(defaultSave()); save.data.currency = 100; save.write(); expect(save.warning).not.toBe(''); expect(save.buyCore()).toBe(true);
  });
  it('core mua đúng giá/HP, không vượt cấp hoặc âm tiền', () => {
    const save = new SaveService(undefined); expect(save.buyCore()).toBe(false); save.data.currency = 60;
    expect([0, 1, 2, 3].map(beaconHP)).toEqual([300, 330, 360, 390]);
    for (let i = 0; i < 3; i++) expect(save.buyCore()).toBe(true);
    expect(save.data.currency).toBe(0); expect(save.buyCore()).toBe(false);
  });
});
describe('Mô phỏng chiến thuật ở tốc độ tăng tốc', () => {
  it('ghi nhận đứng tại Beacon và đi săn ngoài rìa (không buff bất tử)', () => {
    const results: string[] = [];
    for (const strategy of ['beacon', 'rim']) {
      const game = new GameSession(0, seededRandom(42)), s = game.state;
      for (let frame = 0; frame < 720 * 60 && !s.settled; frame++) {
        if (s.phase === 'choosingUpgrade') { const order: UpgradeId[] = ['plasma', 'drones', 'well', 'hull', 'magnet']; game.choose(order.find(id => s.choices.includes(id)) ?? s.choices[0]); }
        const input = strategy === 'beacon' ? { x: 0, y: 0 } : { x: Math.cos(s.time * 0.08) * 1550 - s.player.x, y: Math.sin(s.time * 0.08) * 1550 - s.player.y };
        game.step(B.step, input); s.cues.length = 0;
      }
      results.push(`${strategy}: ${s.phase} ${s.time.toFixed(1)}s, Beacon ${s.beacon.hp.toFixed(1)}, tàu ${s.player.hp.toFixed(1)}, cấp ${s.level}`);
      expect(s.settled).toBe(true); expect(s.phase).toBe('defeat');
    }
    console.info(results.join('\n'));
  });
  it('đủ 720s qua tất cả hệ thống với fixture HP lớn, giữ boss sống và trao đúng 17', () => {
    const game = new GameSession(0, seededRandom(7)), s = game.state;
    s.player.hp = s.player.maxHP = 100000; s.player.protectedUntil = Infinity; s.beacon.hp = s.beacon.maxHP = 100000000;
    const order: UpgradeId[] = ['plasma', 'drones', 'well', 'power', 'haste'];
    for (let frame = 0; frame < 720 * 60 + 100 && !s.settled; frame++) {
      while (s.phase === 'choosingUpgrade') { if (s.swapCandidate) game.swap(Object.keys(s.modules).at(-1) as import('../../src/game/config/content').ModuleId); else game.choose(order.find(id => s.choices.includes(id)) ?? s.choices[0]); }
      game.step(B.step, { x: Math.cos(s.time * 0.1), y: Math.sin(s.time * 0.1) }); s.cues.length = 0;
      expect(Number.isFinite(s.player.x)).toBe(true);
    }
    expect(s.time, JSON.stringify({ phase: s.phase, hp: s.player.hp, beacon: s.beacon.hp, reason: s.reason, pending: s.pending, swap: s.swapCandidate })).toBe(720); expect(s.phase).toBe('victory'); expect(s.reward).toBe(17); expect(s.bossSpawned).toBe(true); expect(s.finalGravity).toBe(true);
  }, 20000);
});
