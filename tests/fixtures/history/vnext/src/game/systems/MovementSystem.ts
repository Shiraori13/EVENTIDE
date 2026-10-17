import { BALANCE as B } from '../config/balance';
import { ENEMIES } from '../config/content';
import { clamp, distance, insideLight, limitToArena, unit } from '../core/math';
import type { RunState, Vec } from '../core/types';
import { addXP } from './ExperienceSystem';
/** Lực hút tính bằng unit/giây; tại tâm trả 0 để tránh chia 0/NaN. */
export function pull(p: Vec, center: Vec, radius: number, strength: number): Vec {
  const d = distance(p, center); if (d < 0.001 || d >= radius) return { x: 0, y: 0 };
  const v = unit(center.x - p.x, center.y - p.y); const f = strength * (1 - d / radius);
  return { x: v.x * f, y: v.y * f };
}
function environmentPull(s: RunState, p: Vec): Vec {
  return s.gravity && s.time >= s.gravity.start ? pull(p, s.gravity, B.gravityRadius, B.gravityForce) : { x: 0, y: 0 };
}
export function movementStep(s: RunState, input: Vec, dt: number): void {
  const v = unit(input.x, input.y), gravity = environmentPull(s, s.player);
  s.player.x += (v.x * B.playerSpeed + gravity.x) * dt; s.player.y += (v.y * B.playerSpeed + gravity.y) * dt;
  if (v.x || v.y) s.player.angle = Math.atan2(v.y, v.x);
  limitToArena(s.player);
  for (const e of s.enemies) {
    const target = e.kind === 'elder' ? { x: B.bossOrbitRadius * Math.cos(s.time * B.bossOrbitSpeed), y: B.bossOrbitRadius * Math.sin(s.time * B.bossOrbitSpeed) } : e.target === 'beacon' ? { x: 0, y: 0 } : s.player;
    const dir = unit(target.x - e.x, target.y - e.y);
    const speed = ENEMIES[e.kind].speed * (e.kind !== 'elder' && insideLight(e) ? B.lightSlow : 1);
    const f = environmentPull(s, e);
    for (const w of s.wells) { const force = pull(e, w, w.radius, w.force); f.x += force.x; f.y += force.y; }
    const magnitude = Math.hypot(f.x, f.y), factor = magnitude > B.totalPullCap ? B.totalPullCap / magnitude : 1;
    e.x += (dir.x * speed + f.x * factor) * dt; e.y += (dir.y * speed + f.y * factor) * dt;
    limitToArena(e, e.radius);
    if (e.kind === 'elder' && distance(e) < B.lightRadius + e.radius) { const u = unit(e.x || 1, e.y); e.x = u.x * (B.lightRadius + e.radius); e.y = u.y * (B.lightRadius + e.radius); }
  }
}
export function environmentStep(s: RunState, dt: number): void {
  const inside = insideLight(s.player);
  s.corruption = clamp(s.corruption + (inside ? -B.corruptionFall : B.corruptionRise) * dt, 0, 100);
  if (inside) s.player.hp = Math.min(s.player.maxHP, s.player.hp + B.healing * dt);
  const radius = B.pickupRadius + (s.supports.magnet ?? 0) * B.pickupBonus;
  s.pickups = s.pickups.filter(p => {
    const d = distance(p, s.player);
    if (d > radius) return true;
    const move = B.pickupSpeed * dt;
    if (d <= move + B.playerRadius) { addXP(s, p.value); if (!s.cues.includes('pickup')) s.cues.push('pickup'); return false; }
    const dir = unit(s.player.x - p.x, s.player.y - p.y); p.x += dir.x * move; p.y += dir.y * move; return true;
  });
}
