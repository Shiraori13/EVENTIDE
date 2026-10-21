import type { GameSession } from '../core/GameSession';
import type { GameClock } from '../core/GameClock';
import type { RunState, SaveData, Vec, Beam } from '../core/types';
import type { SaveService } from '../services/SaveService';
import { addXP } from '../systems/ExperienceSystem';
import { hitEnemy } from '../systems/CombatSystem';
import { makeEnemy } from '../systems/SpawnSystem';
import type { EnemyId } from '../config/content';
import { isBoss } from '../config/bosses';
import { bossRuntime,bossBeams } from '../systems/bosses/state';
/** Tương thích chỉ QA cho fixture trước multi-boss; không có timer/beam toàn run trong simulation. */
export type DebugState=RunState&{beam?:Beam;bossRing?:number;bossBeam?:number;bossFan?:number;bossPhase2At?:number;bossDeathAt?:number};
export interface DebugAPI {
  snapshot(): DebugState | undefined; save(): SaveData; patch(patch: Partial<DebugState>): void;
  xp(value: number): void; advance(seconds: number, input?: Vec): void; frames(seconds: number, fps: number): void;
  seedSave(value: Partial<SaveData>): void;
  spawn(kind: EnemyId, x: number, y: number, target?: 'player' | 'beacon'): number | undefined;
  hit(id: number, damage: number): void;
}
declare global { interface Window { __eventide?: DebugAPI } }
/** Chỉ cài trong DEV + ?e2e=1. Namespace save riêng; không có cheat UI. */
export function installDebug(getSession: () => GameSession | undefined, clock: GameClock, save: SaveService): () => void {
  window.__eventide = {
    // Adapter QA cũ: aliases chỉ tồn tại trong snapshot test, không điều khiển runtime hai boss.
    snapshot: () => {const s=getSession()?.state;if(!s)return;const b=s.enemies.find(e=>isBoss(e.kind))?.boss;return structuredClone({...s,beam:bossBeams(s)[0],bossRing:b?.readyAt??Infinity,bossBeam:b?.readyAt??Infinity,bossPhase2At:b?.phase2At,bossDeathAt:b?.deathAt});}, save: () => structuredClone(save.data),
    patch: patch => { const s = getSession()?.state; if (!s)return;const {beam,bossRing,bossBeam,bossFan,...rest}=patch;Object.assign(s,rest);void bossFan;
      if(patch.bossSpawned)s.bossEvents.forEach(e=>e.spawned=true);
      let owner=beam?s.enemies.find(e=>e.id===beam.ownerId):s.enemies.find(e=>isBoss(e.kind)&&e.boss?.beam)??s.enemies.find(e=>isBoss(e.kind));
      if(beam&&!owner)owner=makeEnemy(s,'elder',{x:beam.x,y:beam.y},'player');
      if(owner){const b=bossRuntime(owner);if('beam'in patch){b.beam=beam;if(beam)b.attack={kind:'beam',...beam,lock:beam.lock??beam.fire-.25,locked:beam.locked??false,to:{x:0,y:0},angles:[],reserved:0,shots:0,combo:0};else b.attack=undefined;}
        if(bossRing!==undefined||bossBeam!==undefined){b.readyAt=Math.min(bossRing??Infinity,bossBeam??Infinity);b.actionIndex=(bossBeam??Infinity)<(bossRing??Infinity)?1:0;}}
    },
    xp: value => { const s = getSession()?.state; if (s) addXP(s, value); },
    advance: (seconds, input = { x: 0, y: 0 }) => { for (let i = 0; i < Math.round(seconds * 60); i++) getSession()?.step(1 / 60, input); },
    frames: (seconds, fps) => { for (let i = 0; i < seconds * fps; i++) clock.advance(1 / fps, () => getSession()?.state.phase === 'playing', dt => getSession()?.step(dt)); },
    seedSave: value => { Object.assign(save.data, value); save.write(); },
    spawn: (kind, x, y, target = 'player') => { const s = getSession()?.state; return s ? makeEnemy(s, kind, { x, y }, target).id : undefined; },
    hit: (id, damage) => { const s = getSession()?.state, e = s?.enemies.find(e => e.id === id); if (s && e) hitEnemy(s, e, damage); },
  };
  return () => { delete window.__eventide; };
}
