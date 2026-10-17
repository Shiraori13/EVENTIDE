import { BALANCE as B } from './balance';
import { SUPPORTS, type SupportId } from './progression';
export type { SupportId } from './progression';
export type ModuleId = 'plasma' | 'drones' | 'well' | 'pulsar' | 'ion';
export type UpgradeId = ModuleId | SupportId;
export type EnemyId = 'wisp' | 'drifter' | 'leech' | 'elder';
export const ENEMIES = {
  wisp: { name: 'Static Wisp', hp: 28, speed: 70, damage: 6, xp: 2, radius: 13 },
  drifter: { name: 'Hollow Drifter', hp: 140, speed: 40, damage: 11, xp: 7, radius: 24 },
  leech: { name: 'Void Leech', hp: 44, speed: 112, damage: 7, xp: 4, radius: 16 },
  elder: { name: 'Elder Star', hp: B.bossHP, speed: B.bossSpeed, damage: 14, xp: B.bossXP, radius: B.bossRadius },
} as const;
export const UPGRADES: Record<UpgradeId, { name: string; max: number; kind: 'module' | 'support'; icon: string }> = {
  plasma: { name: 'Plasma Orb', max: 5, kind: 'module', icon: 'plasma' },
  drones: { name: 'Orbital Drones', max: 5, kind: 'module', icon: 'drones' },
  well: { name: 'Gravity Well', max: 5, kind: 'module', icon: 'well' },
  pulsar: { name: 'Pulsar Beam', max: 5, kind: 'module', icon: 'pulsar' },
  ion: { name: 'Ion Storm', max: 5, kind: 'module', icon: 'ion' },
  ...Object.fromEntries(Object.entries(SUPPORTS).map(([id, data]) => [id, { name: data.name, max: data.max, kind: 'support' as const, icon: data.icon }])) as Record<SupportId, { name: string; max: number; kind: 'support'; icon: string }>,
};
export const PLASMA = [
  { damage: 23, cooldown: 0.85, range: 470, speed: 470, ttl: 1.4, blast: 0 },
  { damage: 34, cooldown: 0.72, range: 500, speed: 490, ttl: 1.4, blast: 0 },
  { damage: 42, cooldown: 0.68, range: 520, speed: 500, ttl: 1.5, blast: 75 },
  { damage: 58, cooldown: 0.56, range: 550, speed: 520, ttl: 1.5, blast: 90 },
  { damage: 82, cooldown: 0.48, range: 590, speed: 540, ttl: 1.5, blast: 140 },
] as const;
export const DRONES = [
  { count: 2, damage: 14, radius: 78, cooldown: 0.5 },
  { count: 3, damage: 19, radius: 84, cooldown: 0.5 },
  { count: 4, damage: 24, radius: 90, cooldown: 0.45 },
  { count: 4, damage: 33, radius: 96, cooldown: 0.4 },
  { count: 5, damage: 42, radius: 105, cooldown: 0.35 },
] as const;
export const WELLS = [
  { damage: 40, radius: 120, force: 95, duration: 2, cooldown: 6, range: 500 },
  { damage: 58, radius: 140, force: 105, duration: 2, cooldown: 5.6, range: 520 },
  { damage: 80, radius: 160, force: 115, duration: 2.2, cooldown: 5.2, range: 540 },
  { damage: 105, radius: 180, force: 125, duration: 2.2, cooldown: 4.8, range: 560 },
  { damage: 140, radius: 205, force: 135, duration: 2.4, cooldown: 4.4, range: 590 },
] as const;
export const WAVES = [
  { at: 0, interval: 2.8, count: 3, drifter: 0, leech: 0 },
  { at: 180, interval: 2.6, count: 3, drifter: 0.30, leech: 0 },
  { at: 360, interval: 2.4, count: 4, drifter: 0.30, leech: 0.18 },
  { at: 540, interval: 2.2, count: 4, drifter: 0.35, leech: 0.20 },
] as const;
export function plasmaName(level: number): string { return level >= 5 ? 'Supernova' : level >= 3 ? 'Mini Sun' : 'Plasma Orb'; }
export const MODULE_IDS: readonly ModuleId[] = ['plasma', 'drones', 'well', 'pulsar', 'ion'];
export const PULSAR = [
  { damage: 42, range: 230, duration: 0.7, cooldown: 3.2 },
  { damage: 58, range: 255, duration: 0.7, cooldown: 2.9 },
  { damage: 78, range: 280, duration: 0.65, cooldown: 2.6 },
  { damage: 104, range: 310, duration: 0.65, cooldown: 2.25 },
  { damage: 132, range: 340, duration: 0.6, cooldown: 1.9 },
] as const;
export const ION = [
  { damage: 28, range: 400, jumpRange: 155, targets: 3, falloff: 0.8, cooldown: 2.8 },
  { damage: 42, range: 420, jumpRange: 170, targets: 3, falloff: 0.8, cooldown: 2.55 },
  { damage: 60, range: 440, jumpRange: 185, targets: 4, falloff: 0.82, cooldown: 2.3 },
  { damage: 84, range: 460, jumpRange: 200, targets: 5, falloff: 0.84, cooldown: 2.05 },
  { damage: 112, range: 480, jumpRange: 215, targets: 6, falloff: 0.85, cooldown: 1.8 },
] as const;
export const WEAPON_VISUALS = { pulsarHalfWidth: 5, ionTraceCap: 8, ionTraceSeconds: 0.24 } as const;
