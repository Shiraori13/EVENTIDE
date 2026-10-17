import { BALANCE as B } from '../config/balance';
import { DRONES, PLASMA, WELLS } from '../config/content';
import { distance } from '../core/math';
import type { Enemy, RunState, Vec } from '../core/types';
import { effect, hitEnemy } from './CombatSystem';
import { attackInterval, shipStats } from '../core/stats';
import { advancedWeaponStep } from './AdvancedWeapons';
function nearest(s: RunState, range: number): Enemy | undefined {
  let found: Enemy | undefined, best = range;
  for (const e of s.enemies) { const d = distance(e, s.player); if (e.hp > 0 && d <= best) { found = e; best = d; } }
  return found;
}
export function dronePositions(s: RunState): Vec[] {
  const level = s.modules.drones ?? 0; if (!level) return [];
  const data = DRONES[level - 1];
  return Array.from({ length: data.count }, (_, i) => ({ x: s.player.x + Math.cos(s.time * B.droneAngularSpeed + i * Math.PI * 2 / data.count) * data.radius, y: s.player.y + Math.sin(s.time * B.droneAngularSpeed + i * Math.PI * 2 / data.count) * data.radius }));
}
/** Vũ khí chỉ dùng simulation time; cooldown drone lưu theo mục tiêu, không theo frame. */
export function weaponStep(s: RunState, rng: () => number = Math.random): void {
  const stats = shipStats(s);
  const plasma = PLASMA[(s.modules.plasma ?? 0) - 1];
  if (plasma && s.time + 1e-9 >= s.nextPlasma && s.projectiles.length < B.projectileCap) {
    const target = nearest(s, plasma.range);
    if (target) {
      const a = Math.atan2(target.y - s.player.y, target.x - s.player.x);
      s.projectiles.push({ x: s.player.x, y: s.player.y, previousX: s.player.x, previousY: s.player.y, id: s.nextId++, source: 'plasma', vx: Math.cos(a) * plasma.speed, vy: Math.sin(a) * plasma.speed, ttl: plasma.ttl, damage: plasma.damage, blast: plasma.blast, hostile: false, radius: plasma.blast ? 9 : 5 });
      s.nextPlasma = s.time + attackInterval(plasma.cooldown, stats); s.cues.push('shot');
    }
  }
  const drones = s.modules.drones;
  if (drones) {
    const data = DRONES[drones - 1], positions = dronePositions(s);
    for (const e of s.enemies) if (e.hp > 0 && s.time + 1e-9 >= e.nextDroneHit && positions.some(p => distance(p, e) < e.radius + B.droneHitRadius)) {
      hitEnemy(s, e, data.damage, 'drones', rng); e.nextDroneHit = s.time + attackInterval(data.cooldown, stats);
    }
  }
  const level = s.modules.well;
  if (level && s.time + 1e-9 >= s.nextWell) {
    const data = WELLS[level - 1], target = nearest(s, data.range);
    if (target) { s.wells.push({ x: target.x, y: target.y, start: s.time, end: s.time + data.duration, radius: data.radius, force: data.force, damage: data.damage }); s.nextWell = s.time + attackInterval(data.cooldown, stats); }
  }
  s.wells = s.wells.filter(w => {
    if (s.time < w.end) return true;
    for (const e of s.enemies) if (e.hp > 0 && distance(e, w) <= w.radius + e.radius) hitEnemy(s, e, w.damage, 'well', rng);
    effect(s, w, w.radius, 0x65f6df); return false;
  });
  advancedWeaponStep(s, rng);
}
