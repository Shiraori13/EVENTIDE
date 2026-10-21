import { BOSSES, isBoss, BOSS_RULES } from '../../config/bosses';
import { BALANCE as B } from '../../config/balance';
import { distance } from '../../core/math';
import type { RunState, Vec } from '../../core/types';
import { makeEnemy } from '../enemies/EnemyFactory';
import { bossRuntime } from './state';
/** Chọn vị trí an toàn hữu hạn, gần đường tàu thay vì buộc đuổi boss ngoài tầm cả màn. */
function spawnPosition(s: RunState, index: number): Vec {
    const angle = Math.atan2(s.player.y, s.player.x) + index * Math.PI;
    for (let i = 0; i < B.spawnAttempts; i++) {
        const a = angle + i * Math.PI * 2 / B.spawnAttempts, p = { x: s.player.x + Math.cos(a) * BOSS_RULES.spawnDistance, y: s.player.y + Math.sin(a) * BOSS_RULES.spawnDistance };
        if (distance(p) < B.spawnCoreSafety || distance(p) > B.arenaRadius - 100 || s.enemies.some(e => isBoss(e.kind) && distance(p, e) < 200))
            continue;
        return p;
    }
    const a = angle + Math.PI;
    return { x: Math.cos(a) * B.bossOrbitRadius, y: Math.sin(a) * B.bossOrbitRadius };
}
/** Warning chọn RNG một lần; mọi mốc độc lập, không khóa bởi boss cũ còn sống. */
export function bossScheduleStep(s: RunState, rng: () => number): void {
    // Scheduler idempotent: chọn ở warning, mỗi mốc một boss kể cả boss cũ còn sống.
    for (const [index, event] of s.bossEvents.entries()) {
        if (event.spawned || s.time < event.at - BOSS_RULES.warning)
            continue;
        if (!event.kind) {
            const used = s.bossEvents.map(e => e.kind), pool = (Object.keys(BOSSES)).filter(id => !used.includes(id as keyof typeof BOSSES)) as (keyof typeof BOSSES)[];
            event.kind = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
            s.notice = 'CẢNH BÁO · ' + BOSSES[event.kind].name;
            s.noticeUntil = event.at;
            s.cues.push('boss');
        }
        if (s.time < event.at)
            continue;
        event.spawned = true;
        s.bossSpawned = true;
        const pos = spawnPosition(s, index);
        const e = makeEnemy(s, event.kind, pos, 'player');
        e.hp = e.maxHP = e.maxHP * event.hpScale;
        const b = bossRuntime(e);
        b.phase1HP = e.maxHP;
        b.readyAt += index * BOSS_RULES.overlapOffset;
    }
}
