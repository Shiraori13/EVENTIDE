import { describe, expect, it } from 'vitest';
import { GameSession, createRun } from '../../src/game/core/GameSession';
import { BALANCE as B } from '../../src/game/config/balance';
import { PICKUP_CONFIG as P } from '../../src/game/config/presentation';
import { LEDGER_CAPACITY, LEDGER_SIDE, clearGroundXP, compactPickups, dropXP, pickupStep, totalGroundXP } from '../../src/game/systems/PickupSystem';
import type { RunState } from '../../src/game/core/types';
import { seededRandom, segmentDistanceSquared } from '../../src/game/core/math';
import { validateSave } from '../../src/game/services/SaveService';
import { renderX, renderY } from '../../src/game/presentation/interpolation';
import { GameClock } from '../../src/game/core/GameClock';
import { normalizeText, VIETNAMESE_SAMPLE } from '../../src/game/services/FontService';
import { addXP, prepareChoices } from '../../src/game/systems/ExperienceSystem';
const empty = (): RunState => { const s = createRun(0); clearGroundXP(s); return s; };
const invariant = (s: RunState): void => {
  expect(s.loot.created).toBe(s.loot.collected + totalGroundXP(s));
  expect(s.pickups.length).toBeLessThanOrEqual(P.maxActive); expect(s.loot.cells).toHaveLength(LEDGER_CAPACITY);
  expect(s.loot.cells.filter(Boolean)).toHaveLength(s.loot.ledgerCount);
  expect(s.loot.cells.reduce((n, c) => n + (c?.value ?? 0), 0)).toBe(s.loot.ledgerXP);
};
const ticks = (s: RunState, seconds: number): void => { for (let i = 0; i < seconds * 60; i++) { s.time += B.step; pickupStep(s, B.step); } };
describe('XP cục bộ hữu hạn và bảo toàn giá trị', () => {
  it('sổ loot gồm Stardust đặt sẵn, không dùng XP tiến độ làm số đã thu', () => {
    const s = createRun(0); expect(s.loot.created).toBe(180); invariant(s);
    s.player.x = s.pickups[0].x; s.player.y = s.pickups[0].y; ticks(s, 1); expect(s.loot.collected).toBeGreaterThan(0); invariant(s);
    s.xp = 0; invariant(s);
  });
  it('gộp orb cũ qua ranh cell, giữ anchor và loại trừ orb homing', () => {
    const s = empty(); dropXP(s, { x: 575, y: 500 }, 5); dropXP(s, { x: 578, y: 500 }, 7); dropXP(s, { x: 580, y: 500 }, 3);
    s.pickups[2].state = 'attracted'; s.time = 10; compactPickups(s);
    expect(s.pickups).toHaveLength(2); expect(s.pickups[0].value).toBe(12); expect(s.pickups[0].x).toBe(575); expect(s.pickups[1].value).toBe(3); invariant(s);
  });
  it('không merge vùng sát biên nhặt thành XP miễn phí', () => {
    const s = empty(); s.player.x = 0; s.player.y = 0;
    dropXP(s, { x: 80, y: 0 }, 1); dropXP(s, { x: 88, y: 0 }, 5); s.time = 20; compactPickups(s);
    expect(s.pickups).toHaveLength(2); pickupStep(s, 0); expect(s.loot.collected).toBe(0); invariant(s);
  });
  it('cap đầy, tất cả drop xa nhau, ledger có trần cố định thay vì overflow lịch sử', () => {
    const s = empty(), rng = seededRandom(40);
    for (let i = 0; i < 20000; i++) dropXP(s, { x: (rng() - 0.5) * 3500, y: (rng() - 0.5) * 3500 }, 3);
    expect(totalGroundXP(s)).toBe(60000); expect(s.loot.ledgerCount).toBeGreaterThan(1000); expect(s.loot.ledgerCount).toBeLessThanOrEqual(LEDGER_CAPACITY); invariant(s);
    s.time = 10000; compactPickups(s); expect(totalGroundXP(s)).toBe(60000); invariant(s);
  });
  it('ledger không kéo điểm ngoài tầm vào trong; materialize có chỗ khi tàu tới', () => {
    const s = empty(); s.player.x = 0; s.player.y = 0;
    for (let i = 0; i < P.maxActive; i++) dropXP(s, { x: -1000 - i / 10, y: -1000 }, 1);
    dropXP(s, { x: 84, y: 0 }, 5); dropXP(s, { x: 90, y: 0 }, 7);
    pickupStep(s, 0); expect(s.loot.collected).toBe(0); expect(s.loot.ledgerXP).toBe(12);
    s.player.x = 5; ticks(s, 1); expect(s.loot.collected).toBe(12); invariant(s);
    ticks(s, 1); expect(s.loot.collected).toBe(12); invariant(s);
  });
  it('drop→merge→magnet→collect cùng tick không thưởng hai lần', () => {
    const s = empty(); s.player.x = 800; s.player.y = 0; s.time = 20;
    dropXP(s, s.player, 60); compactPickups(s); pickupStep(s, B.step); pickupStep(s, B.step);
    expect(s.loot.collected).toBe(60); expect(totalGroundXP(s)).toBe(0); expect(s.level).toBe(4); expect(s.pending).toBe(3); invariant(s);
  });
  it('nhường slot vào cùng cell không đổi value/bounds của cell vừa kiểm tra', () => {
    const s = empty(); s.player.x = s.player.y = 0;
    for (let i = 0; i < P.maxActive; i++) dropXP(s, { x: 119, y: 119 }, 1);
    dropXP(s, { x: 56, y: 56 }, 7); expect(s.loot.ledgerXP).toBe(7);
    ticks(s, 0.5); expect(s.loot.collected).toBe(7); expect(totalGroundXP(s)).toBe(220); invariant(s);
  });
  it('cap toàn orb available sát ngoài tầm vẫn nhường slot cho XP ở cạnh tàu', () => {
    const s = empty(); s.player.x = s.player.y = 0;
    for (let i = 0; i < P.maxActive; i++) dropXP(s, { x: 100, y: 0 }, 1);
    dropXP(s, { x: 5, y: 0 }, 7); ticks(s, 0.25);
    expect(s.loot.collected).toBe(7); expect(totalGroundXP(s)).toBe(220); invariant(s);
  });
  it('rời camera rồi quay lại vẫn thu đúng, không hết tuổi', () => {
    const s = empty(); for (let i = 0; i < 1000; i++) dropXP(s, { x: 1000 + i % 8, y: 1000 + i % 9 }, 2);
    s.time = 2000; compactPickups(s); invariant(s); expect(s.loot.collected).toBe(0);
    s.player.x = s.player.y = 1004; ticks(s, 2); expect(s.loot.collected).toBe(2000); invariant(s);
  });
  it('pause giữ nguyên ledger/merge/homing, chơi lại tạo sổ mới', () => {
    const g = new GameSession(); for (let i = 0; i < 1000; i++) dropXP(g.state, { x: 1500, y: 0 }, 1);
    g.pause(); const before = structuredClone(g.state); g.step(100); expect(g.state).toEqual(before);
    const next = new GameSession(); expect(next.state.loot.created).toBe(180); expect(next.state.loot.collected).toBe(0); expect(next.state.loot.cells).toHaveLength(LEDGER_SIDE ** 2); invariant(next.state);
  });
});
describe('Presentation giữ luật và save cũ', () => {
  it('saveVersion1 không có quality giữ nguyên tiền/core/Echo/settings', () => {
    const old = { saveVersion: 1, currency: 47, coreLevel: 2, echo: true, settings: { muted: true, volume: 0.7, reducedEffects: true, shake: false } };
    const saved = validateSave(old); expect(saved.currency).toBe(47); expect(saved.coreLevel).toBe(2); expect(saved.echo).toBe(true);
    expect(saved.settings).toEqual({ ...old.settings, reducedMotion:true, quality: 'high', tutorial:true }); expect(validateSave({ ...old, settings: { ...old.settings, quality: 'low' } }).settings.quality).toBe('low');
  });
  it('alpha nội suy hình ảnh, không sửa world position hoặc tạo bù thời gian', () => {
    const p = { x: 10, y: 20, previousX: 6, previousY: 16 }; expect(renderX(p, 0.5)).toBe(8); expect(renderY(p, 0.5)).toBe(18); expect(p.x).toBe(10);
    const clock = new GameClock(); let steps = 0; clock.advance(B.step * 1.5, () => true, () => steps++); expect(steps).toBe(1); expect(clock.alpha).toBeCloseTo(0.5); clock.reset(); expect(clock.alpha).toBe(0);
    const game = new GameSession(); game.step(B.step, { x: 1, y: 0 }); game.pause(); game.resume(); expect(renderX(game.state.player, 0)).toBe(game.state.player.x);
    game.step(B.step, { x: 1, y: 0 }); addXP(game.state, 12); prepareChoices(game.state, game.rng); game.choose(game.state.choices[0]); expect(renderX(game.state.player, 0)).toBe(game.state.player.x);
  });
  it('đoạn quét không mất collision tại ranh hoặc đoạn dài', () => {
    expect(segmentDistanceSquared({ x: 50, y: 10 }, 0, 0, 100, 0)).toBe(100);
    expect(segmentDistanceSquared({ x: 130, y: 0 }, 0, 0, 100, 0)).toBe(900);
    expect(segmentDistanceSquared({ x: 0, y: 0 }, 0, 0, 0, 0)).toBe(0);
  });
  it('chuẩn hóa NFC giữ dấu, không tách code unit; đủ chuỗi QA', () => {
    expect(normalizeText('Giữ lấy khoảnh khắc.'.normalize('NFD'))).toBe('Giữ lấy khoảnh khắc.');
    expect(VIETNAMESE_SAMPLE).toBe(VIETNAMESE_SAMPLE.normalize('NFC')); expect(VIETNAMESE_SAMPLE).toContain('Ắ Ằ Ẳ Ẵ Ặ'); expect(VIETNAMESE_SAMPLE).toContain('ớ ờ ở ỡ ợ');
  });
});
