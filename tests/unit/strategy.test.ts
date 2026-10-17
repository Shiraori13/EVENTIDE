import { it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { GameSession } from '../../src/game/core/GameSession';
import { distance, seededRandom, unit } from '../../src/game/core/math';
import { botInput, chooseBotUpgrade } from '../../src/game/debug/Autoplay';
it('khảo sát ba chiến thuật với HP, XP và spawn chuẩn', () => {
  const results = [];
  for (const strategy of ['beacon', 'rim', 'adaptive']) {
    const game = new GameSession(0, seededRandom(42)), s = game.state;
    for (let frame = 0; frame < 720 * 60 + 100 && !s.settled; frame++) {
      while (s.phase === 'choosingUpgrade') {
        chooseBotUpgrade(game);
      }
      let target = { x: 0, y: 110 };
      if (strategy === 'rim') target = { x: Math.cos(s.time * 0.08) * 1550, y: Math.sin(s.time * 0.08) * 1550 };
      if (strategy === 'adaptive') {
        const threat = s.enemies.filter(e => e.target === 'beacon' && distance(e) < 430).sort((a, b) => distance(a) - distance(b))[0];
        const pickup = [...s.pickups].filter(p => distance(p) < 1100).sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
        if (threat) target = threat;
        else if (pickup) target = pickup;
        else { const enemy = [...s.enemies].sort((a, b) => distance(a, s.player) - distance(b, s.player))[0]; if (enemy) target = enemy; }
        if (s.player.hp < 40) target = { x: Math.cos(s.time * 0.3) * 260, y: Math.sin(s.time * 0.3) * 260 };
        const close = s.enemies.filter(e => distance(e, s.player) < 65);
        if (close.length) { const nearest = close[0], away = unit(s.player.x - nearest.x, s.player.y - nearest.y); target = { x: s.player.x + away.x * 150, y: s.player.y + away.y * 150 }; }
      }
      const input = strategy === 'adaptive' ? botInput(s) : distance(target, s.player) < 8 ? { x: 0, y: 0 } : { x: target.x - s.player.x, y: target.y - s.player.y };
      game.step(1 / 60, input); s.cues.length = 0;
    }
    results.push({ strategy, seed: 42, phase: s.phase, seconds: +s.time.toFixed(3), beaconHP: +s.beacon.hp.toFixed(2), playerHP: +s.player.hp.toFixed(2), level: s.level, kills: s.kills, modules: s.modules, reward: s.reward });
    expect(s.settled).toBe(true);
    expect(['victory','defeat']).toContain(s.phase); expect(s.reward).toBe(Math.floor((s.time+1e-7)/60)+(s.phase==='victory'?5:0)); if(s.phase==='victory')expect(s.time).toBe(720);
  }
  mkdirSync('artifacts/v141', { recursive: true }); writeFileSync('artifacts/v141/strategies.json', JSON.stringify(results, null, 2));
}, 20000);
