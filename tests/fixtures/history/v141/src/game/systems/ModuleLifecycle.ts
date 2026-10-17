import type { RunState } from '../core/types';
import type { ModuleId } from '../config/content';
/** Swap kết thúc attack thuộc module cũ, giữ XP/địch/loot và damage đã resolve. */
export function clearModuleAttacks(s: RunState, id: ModuleId): void {
  if (id === 'plasma') s.projectiles = s.projectiles.filter(p => p.hostile || (p.source ?? 'plasma') !== id);
  if (id === 'well') s.wells.length = 0;
  if (id === 'pulsar' || id === 'quasar') s.pulses = s.pulses.filter(p => (p.source ?? 'pulsar') !== id);
  if (id === 'ion' || id === 'quasar') s.ionTraces = s.ionTraces.filter(p => (p.source ?? 'ion') !== id);
  if (id === 'drones') for (const e of s.enemies) e.nextDroneHit = s.time;
}
