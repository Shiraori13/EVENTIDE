import { BALANCE as B } from '../config/balance';
import { ENEMIES } from '../config/content';
import { clamp, distance, insideLight, limitToArena, unit } from '../core/math';
import type { RunState, Vec } from '../core/types';
import { pickupStep } from './PickupSystem';
import { shipStats } from '../core/stats';
import { salvageStep } from './SalvageSystem';
import { isBoss,BOSS_RULES } from '../config/bosses';
import { pull,environmentForce,playerForce } from './hazards/forces';
export { pull } from './hazards/forces';
export function movementStep(s: RunState, input: Vec, dt: number): void {
  const v = unit(input.x, input.y), gravity = playerForce(s);
  const playerSpeed = shipStats(s).moveSpeed;
  s.player.x += (v.x * playerSpeed + gravity.x) * dt; s.player.y += (v.y * playerSpeed + gravity.y) * dt;
  if (v.x || v.y) s.player.angle = Math.atan2(v.y, v.x);
  limitToArena(s.player);
  for (const e of s.enemies) {
    if (e.bossPhase === 'transition' || e.hp <= 0) continue;
    const a=e.boss?.attack;if(isBoss(e.kind)&&a?.kind==='dash'&&a.locked&&s.time<a.fire)continue;if(isBoss(e.kind)&&a?.kind==='dash'&&s.time>=a.fire){const t=Math.min(1,(s.time-a.fire)/(a.end-a.fire));e.x=a.x+(a.to.x-a.x)*t;e.y=a.y+(a.to.y-a.y)*t;limitToArena(e,e.radius);continue;}
    const angle=Math.atan2(e.y-s.player.y,e.x-s.player.x)+BOSS_RULES.strafe;
    const target = isBoss(e.kind) ? { x:s.player.x+Math.cos(angle)*BOSS_RULES.standoff,y:s.player.y+Math.sin(angle)*BOSS_RULES.standoff } : e.target === 'beacon' ? { x: 0, y: 0 } : s.player;
    const dir = unit(target.x - e.x, target.y - e.y);
    const speed = (e.speed ?? ENEMIES[e.kind].speed) * (!isBoss(e.kind) && insideLight(e) ? B.lightSlow : 1);
    const f = environmentForce(s,e);
    for (const w of s.wells) { const force = pull(e, w, w.radius, w.force); f.x += force.x; f.y += force.y; }
    if(isBoss(e.kind)){f.x*=BOSS_RULES.forceResistance;f.y*=BOSS_RULES.forceResistance;}
    const magnitude = Math.hypot(f.x, f.y), factor = magnitude > B.totalPullCap ? B.totalPullCap / magnitude : 1;
    e.x += (dir.x * speed + f.x * factor) * dt; e.y += (dir.y * speed + f.y * factor) * dt;
    limitToArena(e, e.radius);
    if (isBoss(e.kind) && distance(e) < B.lightRadius + e.radius) { const u = unit(e.x || 1, e.y); e.x = u.x * (B.lightRadius + e.radius); e.y = u.y * (B.lightRadius + e.radius); }
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
