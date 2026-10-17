import type { EnemyId, ModuleId, SupportId, UpgradeId } from '../config/content';
import type { CharacterId } from '../config/progression';
import type { CareerMetrics } from '../config/achievements';
import type { SalvageBonuses, SalvageStat } from '../config/salvage';
export interface Vec { x: number; y: number; previousX?: number; previousY?: number }
export type Phase = 'playing' | 'choosingUpgrade' | 'paused' | 'victory' | 'defeat';
export interface Enemy extends Vec {
  id: number; kind: EnemyId; hp: number; maxHP: number; radius: number;
  target: 'player' | 'beacon'; nextHit: number; nextDroneHit: number;
  speed?: number; damage?: number; baseHP?: number; baseDamage?: number; spawnedAt?: number; bossPhase?: 'phase1' | 'transition' | 'phase2' | 'dead'; transitionEnd?: number;
}
export interface Projectile extends Vec { id: number; vx: number; vy: number; ttl: number; damage: number; blast: number; hostile: boolean; radius: number; ownerId?: number; source?: ModuleId }
export interface SalvagePickup extends Vec { id: number; stat: SalvageStat; bp: number; sourceId: number; sourceKind: EnemyId; created: number; end: number; state: 'available' | 'attracted' | 'released' }
export interface SalvageState { bonuses: SalvageBonuses; items: SalvagePickup[]; rolls: number; rolled: number; dropped: number; collected: number; expired: number; retired: number; capHits: number; capAt?: number }
export interface Pulse { id: number; start: number; end: number; startAngle: number; swept: number; hitIds: Set<number>; damage: number; range: number; level: number }
export interface IonTrace { id: number; points: Vec[]; end: number; level: number }
export interface Pickup extends Vec { id: number; value: number; created: number; state: 'available' | 'attracted' }
export interface PickupCell extends Vec { value: number; minX: number; maxX: number; minY: number; maxY: number }
export interface LootState { cells: (PickupCell | null)[]; ledgerCount: number; ledgerXP: number; created: number; collected: number; nextMerge: number; lastForcedMerge: number }
export interface Well extends Vec { end: number; start?: number; radius: number; damage: number; force: number }
export interface Gravity extends Vec { start: number; end: number; final: boolean }
export interface Beam extends Vec { angle: number; fire: number; end: number; ownerId?: number; lock?: number; locked?: boolean; damage?: number }
export type Cue = 'shot' | 'hit' | 'pickup' | 'upgrade' | 'evolution' | 'beacon' | 'boss' | 'victory' | 'defeat';
export interface Effect extends Vec { id: number; radius: number; end: number; color: number }
export interface RunState {
  phase: Phase; beforePause: 'playing' | 'choosingUpgrade'; time: number;
  characterId: CharacterId; draftId: number; rerollsRemaining: number; picks: number;
  coreLevel: number; minuteIndex: number; salvage: SalvageState; metrics: CareerMetrics; metricRevision: number; corruptionStreak: number;
  swapCandidate?: ModuleId; pulses: Pulse[]; ionTraces: IonTrace[]; nextPulsar: number; nextIon: number;
  player: Vec & { hp: number; maxHP: number; angle: number; protectedUntil: number; leechUntil: number };
  beacon: { hp: number; maxHP: number; lastHit: number }; corruption: number;
  level: number; xp: number; pending: number; choices: UpgradeId[];
  modules: Partial<Record<ModuleId, number>>; supports: Partial<Record<SupportId, number>>;
  enemies: Enemy[]; projectiles: Projectile[]; pickups: Pickup[]; loot: LootState; wells: Well[]; effects: Effect[];
  gravity?: Gravity; beam?: Beam; bossSpawned: boolean; bossDefeated: boolean;
  bossRing: number; bossBeam: number; finalGravity: boolean; nextGravity: number;
  bossFan?: number; bossPhase2At?: number; bossDeathAt?: number;
  nextSpawn: number; nextPlasma: number; nextWell: number; kills: number;
  nextId: number; reward: number; settled: boolean; reason: string; notice: string; noticeUntil: number; cues: Cue[];
}
export interface Settings { muted: boolean; volume: number; reducedEffects: boolean; shake: boolean; quality: 'low' | 'high' }
export interface SaveData { saveVersion: 3; currency: number; coreLevel: number; echo: boolean; settings: Settings; characterId: CharacterId; careerKills: number; unlockedAchievements: string[]; metrics: CareerMetrics }
