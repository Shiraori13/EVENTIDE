import { BALANCE as B } from './balance';
export type ModuleId = 'plasma' | 'drones' | 'well';
export type SupportId = 'hull' | 'magnet';
export type UpgradeId = ModuleId | SupportId;
export type EnemyId = 'wisp' | 'drifter' | 'leech' | 'elder';
export const ENEMIES = {
  wisp: { name: 'Static Wisp', hp: 22, speed: 64, damage: 5, xp: 2, radius: 13 },
  drifter: { name: 'Hollow Drifter', hp: 105, speed: 38, damage: 9, xp: 7, radius: 24 },
  leech: { name: 'Void Leech', hp: 36, speed: 105, damage: 6, xp: 4, radius: 16 },
  elder: { name: 'Elder Star', hp: B.bossHP, speed: B.bossSpeed, damage: 14, xp: B.bossXP, radius: B.bossRadius },
} as const;
export const UPGRADES: Record<UpgradeId, { name: string; max: number; kind: 'module' | 'support'; icon: string }> = {
  plasma: { name: 'Plasma Orb', max: 5, kind: 'module', icon: 'plasma' },
  drones: { name: 'Orbital Drones', max: 5, kind: 'module', icon: 'drones' },
  well: { name: 'Gravity Well', max: 5, kind: 'module', icon: 'well' },
  hull: { name: 'Giáp sinh học', max: 3, kind: 'support', icon: 'hull' },
  magnet: { name: 'Bộ thu Stardust', max: 3, kind: 'support', icon: 'magnet' },
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
