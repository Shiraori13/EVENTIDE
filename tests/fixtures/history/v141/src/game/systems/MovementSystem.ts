import { BALANCE as B } from '../config/balance';
import { ENEMIES } from '../config/content';
import { clamp, distance, insideLight, limitToArena, unit } from '../core/math';
import type { RunState, Vec } from '../core/types';
import { pickupStep } from './PickupSystem';
import { shipStats } from '../core/stats';
import { salvageStep } from './SalvageSystem';
import { ASTRONOMY } from '../config/events';
import { tideStrength } from './AstronomySystem';
/** Lực hút tính bằng unit/giây; tại tâm trả 0 để tránh chia 0/NaN. */
export function pull(p: Vec, center: Vec, radius: number, strength: number): Vec {
  const d = distance(p, center); if (d < 0.001 || d >= radius) return { x: 0, y: 0 };
  const v = unit(center.x - p.x, center.y - p.y); const f = strength * (1 - d / radius);
  return { x: v.x * f, y: v.y * f };
}
function environmentPull(s: RunState, p: Vec): Vec {
  return s.gravity && s.time >= s.gravity.start ? pull(p, s.gravity, s.gravity.source === 'tide' ? ASTRONOMY.tideRadius : B.gravityRadius, s.gravity.source === 'tide' ? tideStrength(s) : B.gravityForce) : { x: 0, y: 0 };
}
export function movementStep(s: RunState, input: Vec, dt: number): void {
  const v = unit(input.x, input.y), gravity = environmentPull(s, s.player);
  const playerSpeed = shipStats(s).moveSpeed;
  s.player.x += (v.x * playerSpeed + gravity.x) * dt; s.player.y += (v.y * playerSpeed + gravity.y) * dt;
  if (v.x || v.y) s.player.angle = Math.atan2(v.y, v.x);
  limitToArena(s.player);
  for (const e of s.enemies) {
    if (e.bossPhase === 'transition' || e.hp <= 0) continue;
    const target = e.kind === 'elder' ? { x: B.bossOrbitRadius * Math.cos(s.time * B.bossOrbitSpeed), y: B.bossOrbitRadius * Math.sin(s.time * B.bossOrbitSpeed) } : e.target === 'beacon' ? { x: 0, y: 0 } : s.player;
    const dir = unit(target.x - e.x, target.y - e.y);
    const speed = (e.speed ?? ENEMIES[e.kind].speed) * (e.kind !== 'elder' && insideLight(e) ? B.lightSlow : 1);
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
  if (inside) { const before = s.player.hp; s.player.hp = Math.min(s.player.maxHP, s.player.hp + B.healing * dt); s.metrics.lightHealing += Math.max(0, s.player.hp - before); }
  // Chỉ simulation playing gọi hệ này; dưới50 reset chuỗi, không cộng wall time/pause.
  s.corruptionStreak = s.corruption >= B.corruptionThreshold ? s.corruptionStreak + dt : 0;
  s.metrics.corruptionSeconds = Math.max(s.metrics.corruptionSeconds, s.corruptionStreak);
  pickupStep(s, dt);
  salvageStep(s, dt);
}
