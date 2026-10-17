import { it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { GameSession as BeforeSession } from '../fixtures/history/vnext/src/game/core/GameSession';
import { dropXP as beforeDropXP } from '../fixtures/history/vnext/src/game/systems/CombatSystem';
import { GameSession as HistoricalSession } from '../fixtures/history/v12/src/game/core/GameSession';
import { GameSession } from '../../src/game/core/GameSession';
import { seededRandom } from '../../src/game/core/math';
import { clearGroundXP, dropXP } from '../../src/game/systems/PickupSystem';
it('lịch sử1.1: combat 720s giống MVP trước VNext, không áp cân bằng1.2 vào đối chứng cũ', () => {
  const before = new BeforeSession(0, seededRandom(42)), after = new HistoricalSession(0, seededRandom(42));
  for (const s of [before.state, after.state]) {
    s.pickups.length = 0; s.player.hp = s.player.maxHP = 100000; s.beacon.hp = s.beacon.maxHP = 100000;
    s.modules = { plasma: 5, drones: 5, well: 5 }; s.supports = { hull: 3, magnet: 3 };
  }
  let first: unknown;
  for (let tick = 0; tick < 720 * 60; tick++) {
    const input = { x: Math.cos(tick / 600), y: Math.sin(tick / 600) };
    before.step(1 / 60, input); after.step(1 / 60, input);
    const a = before.state, b = after.state;
    if (a.kills !== b.kills || Math.abs(a.player.hp - b.player.hp) > 1e-7 || a.beacon.hp !== b.beacon.hp || a.phase !== b.phase) {
      first = { tick, before: { time: a.time, kills: a.kills, hp: a.player.hp, beacon: a.beacon.hp, phase: a.phase }, after: { time: b.time, kills: b.kills, hp: b.player.hp, beacon: b.beacon.hp, phase: b.phase } }; break;
    }
    // Tách ảnh hưởng representation XP khỏi so sánh combat: không thu XP ở cả hai fixture.
    a.pickups.length = 0; b.pickups.length = 0; a.cues.length = 0; b.cues.length = 0;
  }
  writeFileSync('artifacts/vnext/combat-parity.json', JSON.stringify(first ?? { identicalThroughSeconds: 720, seed: 42, sameXPInputs: true, outcome: after.state.phase }, null, 2));
  expect(first).toBeUndefined(); expect(after.state.phase).toBe('victory');
}, 20000);
it('sửa cap cũ chuyển drop gần tàu tới orb xa; giá trị vẫn giữ nhưng vị trí nay cục bộ', () => {
  const before = new BeforeSession(), after = new GameSession(); before.state.pickups.length = 0; clearGroundXP(after.state);
  for (let i = 0; i < 220; i++) { beforeDropXP(before.state, { x: 1000 + i / 10, y: 1000 }, 1); dropXP(after.state, { x: 1000 + i / 10, y: 1000 }, 1); }
  beforeDropXP(before.state, before.state.player, 7); dropXP(after.state, after.state.player, 7);
  before.state.nextSpawn = Infinity; after.state.nextSpawn = Infinity;
  for (let i = 0; i < 60; i++) { before.step(1 / 60); after.step(1 / 60); }
  expect(before.state.xp).toBe(0); expect(after.state.xp).toBe(7);
});
