import { it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { GameSession } from '../fixtures/history/v13/src/game/core/GameSession';
import { makeEnemy } from '../fixtures/history/v13/src/game/systems/SpawnSystem';
import { GameSession as BeforeSession } from '../fixtures/history/v12/src/game/core/GameSession';
import { makeEnemy as beforeEnemy } from '../fixtures/history/v12/src/game/systems/SpawnSystem';
import type { EnemyId } from '../fixtures/history/v13/src/game/config/content';
import { shipStats } from '../fixtures/history/v13/src/game/core/stats';
import { botInput } from '../fixtures/history/v13/src/game/debug/Autoplay';
import { clearGroundXP } from '../fixtures/history/v13/src/game/systems/PickupSystem';
it('TTK tiếp cận ở đầu/giữa/cuối, HP enemy snapshot và damage thực', () => {
  const rows = [];
  for (const time of [0, 360, 660]) for (const kind of ['wisp', 'drifter', 'leech'] as EnemyId[]) for (const version of ['1.1', '1.2']) {
    const game = version === '1.1' ? new BeforeSession() : new GameSession(), s = game.state;
    s.time = time; s.nextSpawn = Infinity; s.bossSpawned = true; s.nextGravity = Infinity; s.finalGravity = true; s.pickups = [];
    s.modules = time === 0 ? { plasma: 1 } : time === 360 ? { plasma: 3, drones: 2, well: 1 } : { plasma: 5, drones: 5, well: 5 };
    // Fixture chỉ đo TTK: mục tiêu không gây damage, không là bằng chứng thắng full-run.
    const e = version === '1.1' ? beforeEnemy((game as BeforeSession).state, kind, { x: 350, y: 110 }, 'player') : makeEnemy((game as GameSession).state, kind, { x: 350, y: 110 }, 'player');
    const hp = e.hp; e.nextHit = Infinity;
    for (let step = 0; step < 3600 && e.hp > 0; step++) { game.step(1 / 60); s.cues.length = 0; }
    rows.push({ version, spawnTime: time, kind, hp, ttk: +(s.time - time).toFixed(3), modules: s.modules, supports: s.supports }); expect(e.hp).toBeLessThanOrEqual(0);
  }
  writeFileSync('artifacts/v12/ttk.json', JSON.stringify(rows, null, 2));
  const stats = shipStats(new GameSession().state); expect(stats.maxHP).toBe(100);
});
it('boss preset giữa màn: đo encounter hai phase bằng movement/né thật', () => {
  const rows = [];
  for (const pair of ['offense', 'defense', 'mobility']) {
    const game = new GameSession(), s = game.state; s.time = 300; s.player.x = 700; s.player.y = 0; s.player.hp = s.player.maxHP = 100000; s.beacon.hp = s.beacon.maxHP = 100000;
    s.nextSpawn = Infinity; s.bossSpawned = true; s.nextGravity = Infinity; s.modules = { plasma: 3, drones: 3, well: 3 };
    s.supports = pair === 'offense' ? { power: 2, haste: 2 } : pair === 'defense' ? { hull: 2, armor: 2 } : { engine: 2, magnet: 2 };
    clearGroundXP(s);
    makeEnemy(s, 'elder', { x: 850, y: 0 }, 'player'); s.bossRing = 303; s.bossBeam = 306;
    for (let frame = 0; frame < 240 * 60 && !s.bossDefeated; frame++) { game.step(1 / 60, botInput(s)); s.cues.length = 0; }
    rows.push({ pair, modules: s.modules, supports: s.supports, startTime: 300, phase2At: s.bossPhase2At, deathAt: s.bossDeathAt, encounterSeconds: s.bossDeathAt ? s.bossDeathAt - 300 : undefined, survived: s.player.hp > 0 });
    expect(s.bossDefeated).toBe(true);
  }
  writeFileSync('artifacts/v12/boss-mid-ttk.json', JSON.stringify(rows, null, 2));
});
