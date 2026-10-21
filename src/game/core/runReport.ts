import type { EnemyId, ModuleId, SupportId } from '../config/content';
import type { RunState } from './types';
import { BALANCE as B } from '../config/balance';
import { distance } from './math';
import { playerForce } from '../systems/hazards/forces';

export interface DamageSource { kind: EnemyId | 'radiation' | 'unknown'; channel: 'contact' | 'projectile' | 'beam' | 'radiation' | 'solar-burst'; ownerId?: number }
export interface DamageEntry { source: DamageSource; hp: number }
export interface RunTelemetry {
  incoming: { ship: Record<string, DamageEntry>; beacon: Record<string, DamageEntry> };
  outgoing: Partial<Record<ModuleId | 'radiation', number>>;
  fatal: { ship?: DamageSource; beacon?: DamageSource };
  hazardSeconds: number; corruptionSeconds: number; farSeconds: number; beaconDamageFar: number;
}
export interface RunReport {
  outcome: 'victory' | 'defeat'; cause: 'completed' | 'ship' | 'beacon' | 'both'; time: number; level: number; kills: number; reward: number;
  modules: Partial<Record<ModuleId, number>>; supports: Partial<Record<SupportId, number>>; telemetry: RunTelemetry;
}
export const emptyRunTelemetry = (): RunTelemetry => ({ incoming: { ship: {}, beacon: {} }, outgoing: {}, fatal: {}, hazardSeconds: 0, corruptionSeconds: 0, farSeconds: 0, beaconDamageFar: 0 });

/** Sau giảm trừ/miễn nhiễm, trước trừ HP. Chỉ ghi HP thật; hit sau khi chết không đổi fatal. */
export function recordIncoming(s: RunState, target: 'ship' | 'beacon', before: number, damage: number, source: DamageSource): void {
  if (s.settled || !(before > 0) || !(damage > 0)) return;
  const actual = Math.min(before, damage), entries = s.telemetry.incoming[target];
  const key = `${source.kind}:${source.channel}:${source.ownerId ?? ''}`;
  // Hai boss/run và ba loại quái tạo tập nhỏ; giữ trần cả khi fixture sai.
  const slot = key in entries || Object.keys(entries).length < 32 ? key : 'other';
  const entry = entries[slot] ??= { source: slot === 'other' ? { kind: 'unknown', channel: source.channel } : { ...source }, hp: 0 };
  entry.hp += actual;
  if (target === 'beacon' && distance(s.player) > B.lightRadius) s.telemetry.beaconDamageFar += actual;
  if (damage >= before && !s.telemetry.fatal[target]) s.telemetry.fatal[target] = { ...source };
}
/** Tổng damage là HP mất, không phải DPS; phase1 overkill không xuyên phase2. */
export function recordOutgoing(s: RunState, source: ModuleId | 'radiation', before: number, damage: number): void {
  if (!s.settled && before > 0 && damage > 0) s.telemetry.outgoing[source] = (s.telemetry.outgoing[source] ?? 0) + Math.min(before, damage);
}
export function sampleRunTelemetry(s: RunState, dt: number): void {
  if (s.corruption >= B.corruptionThreshold) s.telemetry.corruptionSeconds += dt;
  if (distance(s.player) > B.lightRadius) s.telemetry.farSeconds += dt;
  const radiation = s.astronomy.some(e => e.id === 'radiation' && e.phase === 'active' && e.zones?.some(z => Math.hypot(s.player.x-z.x,s.player.y-z.y)<=z.radius));
  const solar = s.bossZones.some(z => z.kind === 'solar' && s.time >= z.start && s.time < z.end && Math.hypot(s.player.x-z.x,s.player.y-z.y)<=z.radius);
  const force = playerForce(s);
  if (radiation || solar || Math.hypot(force.x,force.y)>0) s.telemetry.hazardSeconds += dt;
}
function freeze<T>(value: T): T { if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); } return value; }
/** Snapshot trước cleanup owner/entity. Kết quả độc lập, đóng băng sau settlement. */
export function snapshotRunReport(s: RunState, outcome: 'victory' | 'defeat'): RunReport {
  return freeze({ outcome, cause: outcome === 'victory' ? 'completed' : s.player.hp <= 0 && s.beacon.hp <= 0 ? 'both' : s.player.hp <= 0 ? 'ship' : 'beacon', time:s.time, level:s.level, kills:s.kills, reward:s.reward,
    modules:{...s.modules}, supports:{...s.supports}, telemetry:structuredClone(s.telemetry) });
}
