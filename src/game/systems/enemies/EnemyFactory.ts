import { BALANCE as B, ENEMY_SCALING } from '../../config/balance';
import { ASTRONOMY } from '../../config/events';
import { ENEMIES, type EnemyId } from '../../config/content';
import { isBoss } from '../../config/bosses';
import { bossRuntime } from '../bosses/state';
import type { Enemy, RunState, Vec } from '../../core/types';
import { minuteAt } from './ScalingSystem';
/** Boss giữ bảng phase riêng; quái mới dùng cùng minute curve của event. */
export function makeEnemy(s: RunState, kind: EnemyId, p: Vec, target: 'player' | 'beacon'): Enemy {
    const data = ENEMIES[kind];
    const minute = minuteAt(s.time), rate = isBoss(kind) ? { hp: 0, damage: 0 } : ENEMY_SCALING[kind];
    const eventFactor = !isBoss(kind) && s.astronomy.some(e => e.id === 'chaos' && e.phase === 'active') ? ASTRONOMY.chaosEnemy : 1;
    const hp = data.hp * (1 + rate.hp * minute) * eventFactor;
    const e: Enemy = { x: p.x, y: p.y, id: s.nextId++, kind, hp, maxHP: hp, baseHP: data.hp, baseDamage: data.damage, radius: data.radius, target, nextHit: s.time + (isBoss(kind) ? B.bossFirstRingDelay : 0), nextDroneHit: s.time, spawnedAt: s.time, speed: data.speed, damage: data.damage * (1 + rate.damage * minute) * eventFactor, ...(isBoss(kind) ? { bossPhase: 'phase1' as const } : {}) };
    if (isBoss(kind))
        bossRuntime(e);
    s.enemies.push(e);
    return e;
}
