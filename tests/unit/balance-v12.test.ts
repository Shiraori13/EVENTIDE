import { it, expect } from 'vitest';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { GameSession } from '../fixtures/history/v13/src/game/core/GameSession';
import { GameSession as OldSession } from '../fixtures/history/v12/src/game/core/GameSession';
import { botInput, chooseBotUpgrade } from '../fixtures/history/v13/src/game/debug/Autoplay';
import { seededRandom } from '../fixtures/history/v13/src/game/core/math';
import type { SupportId } from '../fixtures/history/v13/src/game/config/content';
import { BALANCE, ENEMY_SCALING } from '../fixtures/history/v13/src/game/config/balance';
import { SUPPORTS } from '../fixtures/history/v13/src/game/config/progression';
it('playtest seeded:1.1 đối chứng và1.2 ba cặp support qua draft thật', () => {
  const rows = [];
  for (const seed of [7, 42, 104]) {
    for (const pair of [['power', 'haste'], ['hull', 'armor'], ['engine', 'magnet']] as SupportId[][]) {
      const game = new GameSession(0, seededRandom(seed)), s = game.state, milestones = []; let next = 180, firstShipHit: number | undefined, firstBeaconHit: number | undefined;
      for (let frame = 0; frame < 720 * 60 + 10 && !s.settled; frame++) {
        while (s.phase === 'choosingUpgrade') chooseBotUpgrade(game, pair);
        const hp = s.player.hp; game.step(1 / 60, botInput(s)); s.cues.length = 0;
        if (s.player.hp < hp && firstShipHit === undefined) firstShipHit = s.time;
        if (s.beacon.hp < s.beacon.maxHP && firstBeaconHit === undefined) firstBeaconHit = s.time;
        if (s.time >= next) { milestones.push({ time: s.time, hp: s.player.hp, beacon: s.beacon.hp, level: s.level, modules: { ...s.modules }, supports: { ...s.supports }, enemies: s.enemies.length }); next += 180; }
      }
      rows.push({ version: '1.2', seed, pair, phase: s.phase, seconds: s.time, hp: s.player.hp, beacon: s.beacon.hp, level: s.level, kills: s.kills, modules: s.modules, supports: s.supports, bossPhase2At: s.bossPhase2At, bossDeathAt: s.bossDeathAt, firstShipHit, firstBeaconHit, milestones, config: { bossHP: BALANCE.bossHP, power: SUPPORTS.power, haste: SUPPORTS.haste, enemyScaling: ENEMY_SCALING } });
      expect(s.settled).toBe(true); expect(Object.keys(s.supports).length).toBeLessThanOrEqual(2);
    }
  }
  for (const strategy of ['beacon', 'rim', 'adaptive']) {
    const game = new OldSession(0, seededRandom(42)), s = game.state;
    for (let f = 0; f < 43210 && !s.settled; f++) {
      while (s.phase === 'choosingUpgrade') game.choose((['plasma', 'drones', 'well', 'magnet', 'hull'] as const).find(id => s.choices.includes(id)) ?? s.choices[0]);
      game.step(1 / 60, botInput(s, strategy)); s.cues.length = 0;
    }
    rows.push({ version: '1.1', seed: 42, strategy, phase: s.phase, seconds: s.time, hp: s.player.hp, beacon: s.beacon.hp, level: s.level, kills: s.kills });
  }
  mkdirSync('artifacts/v12/balance-attempts', { recursive: true }); const name = `iteration-${readdirSync('artifacts/v12/balance-attempts').length + 1}.json`;
  writeFileSync(`artifacts/v12/balance-attempts/${name}`, JSON.stringify(rows, null, 2)); writeFileSync('artifacts/v12/balance-playtest.json', JSON.stringify(rows, null, 2));
}, 60000);
