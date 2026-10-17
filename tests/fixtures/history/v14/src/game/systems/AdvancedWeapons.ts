import { PULSAR, ION, WEAPON_VISUALS } from '../config/content';
import { attackInterval, shipStats } from '../core/stats';
import type { Enemy, RunState, Vec } from '../core/types';
import { distanceSquared } from '../core/math';
import { hitEnemy } from './CombatSystem';
const TAU = Math.PI * 2;
function nearestFrom(s: RunState, origin: Vec, range: number, visited?: Set<number>): Enemy | undefined {
  let target: Enemy | undefined, best = range * range;
  for (const e of s.enemies) { if (e.hp <= 0 || e.bossPhase === 'transition' || visited?.has(e.id)) continue; const d = distanceSquared(e, origin); if (d <= best) { best = d; target = e; } }
  return target;
}
/** Quét cả sector giữa hai tick; hit ID một lần/pulse, không phụ thuộc góc render/FPS. */
export function advancedWeaponStep(s: RunState, rng: () => number): void {
  const level = s.modules.pulsar;
  if (level && s.time + 1e-9 >= s.nextPulsar) {
    const d = PULSAR[level - 1];
    s.pulses.push({ id: s.nextId++, start: s.time, end: s.time + d.duration, startAngle: s.player.angle, swept: 0, hitIds: new Set<number>(), damage: d.damage, range: d.range, level });
    s.nextPulsar = s.time + attackInterval(d.cooldown, shipStats(s)); s.cues.push('shot');
  }
  for (const pulse of s.pulses) {
    const to = Math.min(TAU, Math.max(0, (s.time - pulse.start) / (pulse.end - pulse.start)) * TAU), from = pulse.swept;
    for (const e of s.enemies) {
      if (e.hp <= 0 || e.bossPhase === 'transition' || pulse.hitIds.has(e.id)) continue;
      const dx = e.x - s.player.x, dy = e.y - s.player.y, radius = Math.hypot(dx, dy);
      if (radius > pulse.range + e.radius) continue;
      const angle = ((Math.atan2(dy, dx) - pulse.startAngle) % TAU + TAU) % TAU;
      const margin = Math.asin(Math.min(1, (e.radius + WEAPON_VISUALS.pulsarHalfWidth) / Math.max(1, radius)));
      if (radius <= e.radius || [angle, angle - TAU, angle + TAU].some(a => a + margin >= from && a - margin <= to)) {
        pulse.hitIds.add(e.id); hitEnemy(s, e, pulse.damage, 'pulsar', rng);
      }
    }
    pulse.swept = to;
  }
  let write = 0; for (const pulse of s.pulses) if (pulse.end > s.time) s.pulses[write++] = pulse; s.pulses.length = write;
  const ionLevel = s.modules.ion;
  if (ionLevel && s.time + 1e-9 >= s.nextIon) {
    const d = ION[ionLevel - 1], target = nearestFrom(s, s.player, d.range);
    if (target) {
      const visited = new Set<number>(), points: Vec[] = [{ x: s.player.x, y: s.player.y }]; let next: Enemy | undefined = target;
      // Path/damage chốt trong tick; VFX chỉ giữ tọa độ, không giữ object pool hoặc retarget lúc render.
      for (let index = 0; next && index < d.targets; index++) {
        const current: Enemy = next; visited.add(current.id); points.push({ x: current.x, y: current.y });
        hitEnemy(s, current, d.damage * d.falloff ** index, 'ion', rng);
        next = nearestFrom(s, current, d.jumpRange, visited);
      }
      if (s.ionTraces.length >= WEAPON_VISUALS.ionTraceCap) s.ionTraces.shift();
      s.ionTraces.push({ id: s.nextId++, points, end: s.time + WEAPON_VISUALS.ionTraceSeconds, level: ionLevel });
      s.nextIon = s.time + attackInterval(d.cooldown, shipStats(s)); s.cues.push('shot');
    }
  }
  write = 0; for (const trace of s.ionTraces) if (trace.end > s.time) s.ionTraces[write++] = trace; s.ionTraces.length = write;
}
