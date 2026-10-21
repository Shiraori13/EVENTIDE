import type { GameSession } from '../core/GameSession';
import type { GameClock } from '../core/GameClock';
import type { RunState, SaveData, Vec } from '../core/types';
import type { SaveService } from '../services/SaveService';
import { addXP } from '../systems/ExperienceSystem';
import { hitEnemy } from '../systems/CombatSystem';
import { makeEnemy } from '../systems/SpawnSystem';
import type { EnemyId } from '../config/content';
export interface DebugAPI {
  snapshot(): RunState | undefined; save(): SaveData; patch(patch: Partial<RunState>): void;
  xp(value: number): void; advance(seconds: number, input?: Vec): void; frames(seconds: number, fps: number): void;
  seedSave(value: Partial<SaveData>): void;
  spawn(kind: EnemyId, x: number, y: number, target?: 'player' | 'beacon'): number | undefined;
  hit(id: number, damage: number): void;
}
declare global { interface Window { __eventide?: DebugAPI } }
/** Chỉ cài trong DEV + ?e2e=1. Namespace save riêng; không có cheat UI. */
export function installDebug(getSession: () => GameSession | undefined, clock: GameClock, save: SaveService): () => void {
  window.__eventide = {
    snapshot: () => structuredClone(getSession()?.state), save: () => structuredClone(save.data),
    patch: patch => { const s = getSession()?.state; if (s) Object.assign(s, patch); },
    xp: value => { const s = getSession()?.state; if (s) addXP(s, value); },
    advance: (seconds, input = { x: 0, y: 0 }) => { for (let i = 0; i < Math.round(seconds * 60); i++) getSession()?.step(1 / 60, input); },
    frames: (seconds, fps) => { for (let i = 0; i < seconds * fps; i++) clock.advance(1 / fps, () => getSession()?.state.phase === 'playing', dt => getSession()?.step(dt)); },
    seedSave: value => { Object.assign(save.data, value); save.write(); },
    spawn: (kind, x, y, target = 'player') => { const s = getSession()?.state; return s ? makeEnemy(s, kind, { x, y }, target).id : undefined; },
    hit: (id, damage) => { const s = getSession()?.state, e = s?.enemies.find(e => e.id === id); if (s && e) hitEnemy(s, e, damage); },
  };
  return () => { delete window.__eventide; };
}
