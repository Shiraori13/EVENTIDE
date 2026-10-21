import type { Enemy, RunState, BossRuntime, Beam } from '../../core/types';
import { isBoss, BOSS_RULES as C } from '../../config/bosses';
export function bossRuntime(e: Enemy): BossRuntime {
    return e.boss ??= { readyAt: (e.spawnedAt ?? 0) + C.firstAttack, spawnUntil: (e.spawnedAt ?? 0) + C.spawnGrace, phase1HP: e.maxHP, actionIndex: 0, skillCount: 0, comboPending: 0 };
}
export const bossBeams = (s: RunState): Beam[] => s.enemies.flatMap(e => isBoss(e.kind) && e.boss?.beam ? [e.boss.beam] : []);
export const reservedBullets = (s: RunState): number => s.enemies.reduce((n, e) => n + (e.boss?.attack?.reserved ?? 0), 0);
