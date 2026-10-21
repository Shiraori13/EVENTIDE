import { BALANCE as B } from '../config/balance';
import type { RunState, Vec } from './types';
import { prepareChoices, chooseUpgrade, rerollChoices } from '../systems/ExperienceSystem';
import type { CharacterId } from '../config/progression';
import { calculateStats } from './stats';
import { movementStep, environmentStep } from '../systems/MovementSystem';
import { spawnStep, eventStep } from '../systems/SpawnSystem';
import { weaponStep } from '../systems/WeaponSystem';
import { combatStep } from '../systems/CombatSystem';
import { bossStep } from '../systems/bosses/BossSystem';
import { createLootState, dropXP } from '../systems/PickupSystem';
import { emptySalvage } from '../config/salvage';
import { emptyCareerMetrics } from '../config/achievements';
import { ASTRONOMY } from '../config/events';
import { radiationStep, cancelAstronomy } from '../systems/hazards/AstronomySystem';
import { tryFuseQuasar, type EvolutionResult } from '../systems/EvolutionSystem';
import { BOSS_RULES } from '../config/bosses';
import { emptyRunTelemetry, sampleRunTelemetry, snapshotRunReport } from './runReport';
import { coreHP } from '../config/beacon';
import { beginReplacement, cancelSwap, confirmSwap } from '../systems/ExperienceSystem';
export const beaconHP = coreHP;
export function createRun(core: number, characterId: CharacterId = 'nova'): RunState {
  const maxHP = beaconHP(core);
  const stats = calculateStats(characterId);
  const s: RunState = {
    telemetry:emptyRunTelemetry(),
    bossEvents:BOSS_RULES.schedule.map(e=>({...e,spawned:false})),bossZones:[],environmentHits:{},
    phase: 'playing', beforePause: 'playing', time: 0,
    characterId, draftId: 0, rerollsRemaining: 0, picks: 0,
    weaponMasteryReached: false, buildRevision: 0, masteryBonus: emptySalvage(), swapSelecting: false, nextQuasar: 0, enemyEventFactor: 1, astronomy: ASTRONOMY.schedule.map(e => ({ id: e.id, phase: 'scheduled', start: e.start, end: e.start + e.duration, nextTick: e.start })),
    coreLevel: core, minuteIndex: 0, metrics: emptyCareerMetrics(), metricRevision: 0, corruptionStreak: 0,
    salvage: { bonuses: emptySalvage(), items: [], rolls: 0, rolled: 0, dropped: 0, collected: 0, expired: 0, retired: 0, capHits: 0 },
    pulses: [], ionTraces: [], nextPulsar: 0, nextIon: 0,
    player: { x: 0, y: 110, hp: stats.maxHP, maxHP: stats.maxHP, angle: -Math.PI / 2, protectedUntil: 0, leechUntil: 0 },
    beacon: { hp: maxHP, maxHP, lastHit: -100 }, corruption: 0, level: 1, xp: 0, pending: 0, choices: [],
    modules: { plasma: 1 }, supports: {}, enemies: [], projectiles: [], pickups: [], loot: createLootState(), wells: [], effects: [],
    bossSpawned: false, bossDefeated: false, finalGravity: false,
    nextGravity: B.gravityFirst, nextSpawn: B.firstSpawn, nextPlasma: 0, nextWell: 0, kills: 0, nextId: 1,
    reward: 0, settled: false, reason: '', notice: 'Nova · Mang ánh sáng trở về', noticeUntil: 4, cues: [],
  };
  for (let i = 0; i < B.stardustClusters; i++) {
    const angle = i * Math.PI * 2 / B.stardustClusters;
    for (let j = 0; j < B.stardustPerCluster; j++) dropXP(s, { x: Math.cos(angle + j * 0.025) * (B.stardustRadius + j * B.stardustSpacing), y: Math.sin(angle + j * 0.025) * (B.stardustRadius + j * B.stardustSpacing) }, B.stardustXP);
  }
  return s;
}
export function finishRun(s: RunState, outcome: 'victory' | 'defeat', reason: string): void {
  // Cờ settled chống thưởng lặp khi render hoặc thao tác kết quả nhiều lần.
  if (s.settled) return;
  s.settled = true; s.phase = outcome; s.reason = reason;
  s.reward = Math.floor((s.time + 1e-7) / 60) + (outcome === 'victory' ? 5 : 0);
  s.report = snapshotRunReport(s, outcome);
  s.enemies = []; s.projectiles = []; s.wells = []; s.pulses = []; s.ionTraces = []; s.salvage.items = []; s.swapCandidate = undefined; s.gravity = undefined;
  s.bossZones=[]; for(const e of s.bossEvents)e.spawned=true; cancelAstronomy(s); s.swapSelecting = false; s.cues.push(outcome);
}
export function resolveOutcome(s: RunState): boolean {
  // Kiểm tra chết trước: hit chí mạng ở tick cuối phải được tính thua.
  if (s.player.hp <= 0 || s.beacon.hp <= 0) { finishRun(s, 'defeat', s.player.hp <= 0 && s.beacon.hp <= 0 ? 'Tàu Nova và Beacon cùng bị phá hủy trong một nhịp.' : s.player.hp <= 0 ? 'Tàu Nova đã bị phá hủy.' : 'Beacon đã tắt.'); return true; }
  if (s.time + 1e-7 >= B.duration) { s.time = B.duration; finishRun(s, 'victory', 'Beacon đã khôi phục vùng không gian này.'); return true; }
  return false;
}
/** Điều phối luật thuần, độc lập renderer. Mọi dt có đơn vị giây. */
export class GameSession {
  probe?: { beginStep(): void; mark(label: string): void };
  state: RunState;
  constructor(core = 0, public readonly rng: () => number = Math.random, characterId: CharacterId = 'nova') { this.state = createRun(core, characterId); }
  step(dt: number, input: Vec = { x: 0, y: 0 }): void {
    const s = this.state; if (s.phase !== 'playing') return;
    // Một thực thể hết HP không được hồi sinh bởi hồi máu ở đầu tick sau.
    if (s.player.hp <= 0 || s.beacon.hp <= 0) { resolveOutcome(s); return; }
    this.probe?.beginStep();
    // Lớp trình bày nội suy previous/current, không sửa vị trí authoritative của va chạm.
    s.player.previousX = s.player.x; s.player.previousY = s.player.y;
    for (const entity of s.enemies) { entity.previousX = entity.x; entity.previousY = entity.y; }
    for (const entity of s.projectiles) { entity.previousX = entity.x; entity.previousY = entity.y; }
    s.time = Math.min(B.duration, s.time + dt);
    eventStep(s, this.rng); spawnStep(s, this.rng); this.probe?.mark('spawnCPU');
    movementStep(s, input, dt); this.probe?.mark('movementGravityCPU'); environmentStep(s, dt); this.probe?.mark('pickupCPU');
    radiationStep(s, this.rng); weaponStep(s, this.rng); bossStep(s); this.probe?.mark('weaponsBossCPU'); combatStep(s, dt, this.rng); this.probe?.mark('combatCPU');
    sampleRunTelemetry(s, dt); this.probe?.mark('telemetryCPU');
    if (resolveOutcome(s)) return;
    if (s.pending) { s.cues.push('upgrade'); prepareChoices(s, this.rng); }
  }
  private resetInterpolation(): void {
    const s = this.state;
    s.player.previousX = s.player.x; s.player.previousY = s.player.y;
    for (const e of s.enemies) { e.previousX = e.x; e.previousY = e.y; }
    for (const p of s.projectiles) { p.previousX = p.x; p.previousY = p.y; }
  }
  pause(): void { const s = this.state; if (s.phase === 'playing' || s.phase === 'choosingUpgrade') { s.beforePause = s.phase; s.phase = 'paused'; this.resetInterpolation(); } }
  resume(): void { if (this.state.phase === 'paused') { this.resetInterpolation(); this.state.phase = this.state.beforePause; } }
  reroll(draftId = this.state.draftId): boolean { return rerollChoices(this.state, this.rng, draftId); }
  beginSwap(next?: import('../config/content').ModuleId, draftId = this.state.draftId): boolean { return beginReplacement(this.state, next, draftId); }
  evolve(): EvolutionResult { return tryFuseQuasar(this.state, this.rng); }
  fuse(): boolean { return this.evolve().ok; }
  cancelSwap(): void { cancelSwap(this.state); }
  swap(old: import('../config/content').ModuleId, draftId = this.state.draftId): boolean { return confirmSwap(this.state, old, this.rng, draftId); }
  choose(id: import('../config/content').ChoiceId, draftId = this.state.draftId): boolean {
    const changed = chooseUpgrade(this.state, id, this.rng, draftId);
    if (changed) this.resetInterpolation();
    return changed;
  }
}
