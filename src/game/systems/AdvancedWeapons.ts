import { PULSAR, ION, QUASAR, WEAPON_VISUALS } from '../config/content';
import { attackInterval, shipStats } from '../core/stats';
import type { Enemy, RunState, Vec } from '../core/types';
import { distanceSquared } from '../core/math';
import { hitEnemy } from './CombatSystem';
const TAU = Math.PI * 2;
function nearestFrom(s: RunState, origin: Vec, range: number, visited?: Set<number>, envelope?: {origin:Vec;range:number}): Enemy | undefined {
  let target: Enemy | undefined, best = range * range;
  for (const e of s.enemies) { if (e.hp <= 0 || e.bossPhase === 'transition' || visited?.has(e.id)) continue; if(envelope&&distanceSquared(e,envelope.origin)>envelope.range**2)continue; const d = distanceSquared(e, origin); if (d <= best) { best = d; target = e; } }
  return target;
}
/** Quét cả sector giữa hai tick; hit ID một lần/pulse, không phụ thuộc góc render/FPS. */
export function advancedWeaponStep(s: RunState, rng: () => number): void {
  if (s.modules.quasar && s.time + 1e-9 >= s.nextQuasar) {
    const target = nearestFrom(s, s.player, QUASAR.range);
    if (target) {
      const angle = Math.atan2(target.y - s.player.y, target.x - s.player.x);
      s.pulses.push({ id: s.nextId++, start: s.time, end: s.time + QUASAR.duration, startAngle: angle - QUASAR.sweep / 2, swept: 0, hitIds: new Set<number>(), damage: QUASAR.damage, range: QUASAR.range, level: 5, source: 'quasar' });
      s.nextQuasar = s.time + attackInterval(QUASAR.cooldown, shipStats(s)); s.cues.push('shot');
    }
  }
  const level = s.modules.pulsar;
  if (level && s.time + 1e-9 >= s.nextPulsar) {
    const d = PULSAR[level - 1];
    s.pulses.push({ id: s.nextId++, start: s.time, end: s.time + d.duration, startAngle: s.player.angle, swept: 0, hitIds: new Set<number>(), damage: d.damage, range: d.range, level });
    s.nextPulsar = s.time + attackInterval(d.cooldown, shipStats(s)); s.cues.push('shot');
  }
  for (const pulse of s.pulses) {
    const sweep = pulse.source === 'quasar' ? QUASAR.sweep : TAU;
    const to = Math.min(sweep, Math.max(0, (s.time - pulse.start) / (pulse.end - pulse.start)) * sweep), from = pulse.swept;
    for (const e of s.enemies) {
      if (e.hp <= 0 || e.bossPhase === 'transition' || pulse.hitIds.has(e.id)) continue;
      const dx = e.x - s.player.x, dy = e.y - s.player.y, radius = Math.hypot(dx, dy);
      if (radius > pulse.range + (pulse.source==='quasar'?0:e.radius)) continue;
      const angle = ((Math.atan2(dy, dx) - pulse.startAngle) % TAU + TAU) % TAU;
      const margin = Math.asin(Math.min(1, (e.radius + (pulse.source === 'quasar' ? QUASAR.halfWidth : WEAPON_VISUALS.pulsarHalfWidth)) / Math.max(1, radius)));
      if (radius <= e.radius || [angle, angle - TAU, angle + TAU].some(a => a + margin >= from && a - margin <= to)) {
        pulse.hitIds.add(e.id); hitEnemy(s, e, pulse.damage, pulse.source ?? 'pulsar', rng);
        // Cùng visited cho beam/tia phụ: không back-chain hoặc thêm hit khi beam quét tới sau đó.
        if (pulse.source === 'quasar' && !pulse.chainDone) {
          pulse.chainDone = true; const points: Vec[] = [{ x: e.x, y: e.y }]; let origin: Vec = e;
          for (let index = 0; index < QUASAR.chainTargets; index++) {
            const next = nearestFrom(s, origin, QUASAR.jumpRange, pulse.hitIds,{origin:s.player,range:pulse.range}); if (!next) break;
            pulse.hitIds.add(next.id); points.push({ x: next.x, y: next.y });
            hitEnemy(s, next, pulse.damage * QUASAR.chainFraction * QUASAR.falloff ** index, 'quasar', rng); origin = next;
          }
          if (points.length > 1) { if (s.ionTraces.filter(t => t.source === 'quasar').length >= QUASAR.traceCap) { const index = s.ionTraces.findIndex(t => t.source === 'quasar'); s.ionTraces.splice(index,1); } s.ionTraces.push({ id: s.nextId++, points, end: s.time + WEAPON_VISUALS.ionTraceSeconds, level: 5, source: 'quasar' }); }
        }
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
