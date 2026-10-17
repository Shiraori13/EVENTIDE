import type { EnemyId, ModuleId, SupportId, UpgradeId } from '../config/content';
export interface Vec { x: number; y: number }
export type Phase = 'playing' | 'choosingUpgrade' | 'paused' | 'victory' | 'defeat';
export interface Enemy extends Vec {
  id: number; kind: EnemyId; hp: number; maxHP: number; radius: number;
  target: 'player' | 'beacon'; nextHit: number; nextDroneHit: number;
}
export interface Projectile extends Vec { id: number; vx: number; vy: number; ttl: number; damage: number; blast: number; hostile: boolean; radius: number }
export interface Pickup extends Vec { id: number; value: number }
export interface Well extends Vec { end: number; radius: number; damage: number; force: number }
export interface Gravity extends Vec { start: number; end: number; final: boolean }
export interface Beam extends Vec { angle: number; fire: number; end: number }
export type Cue = 'shot' | 'hit' | 'pickup' | 'upgrade' | 'evolution' | 'beacon' | 'boss' | 'victory' | 'defeat';
export interface Effect extends Vec { id: number; radius: number; end: number; color: number }
export interface RunState {
  phase: Phase; beforePause: 'playing' | 'choosingUpgrade'; time: number;
  player: Vec & { hp: number; maxHP: number; angle: number; protectedUntil: number; leechUntil: number };
  beacon: { hp: number; maxHP: number; lastHit: number }; corruption: number;
  level: number; xp: number; pending: number; choices: UpgradeId[];
  modules: Partial<Record<ModuleId, number>>; supports: Partial<Record<SupportId, number>>;
  enemies: Enemy[]; projectiles: Projectile[]; pickups: Pickup[]; wells: Well[]; effects: Effect[];
  gravity?: Gravity; beam?: Beam; bossSpawned: boolean; bossDefeated: boolean;
  bossRing: number; bossBeam: number; finalGravity: boolean; nextGravity: number;
  nextSpawn: number; nextPlasma: number; nextWell: number; kills: number;
  nextId: number; reward: number; settled: boolean; reason: string; notice: string; noticeUntil: number; cues: Cue[];
}
export interface Settings { muted: boolean; volume: number; reducedEffects: boolean; shake: boolean }
export interface SaveData { saveVersion: 1; currency: number; coreLevel: number; echo: boolean; settings: Settings }
