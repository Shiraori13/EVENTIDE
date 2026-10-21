import { ENEMY_SCALING } from '../../config/balance';
import { ASTRONOMY } from '../../config/events';
import { ENEMIES } from '../../config/content';
import { isBoss } from '../../config/bosses';
import type { RunState } from '../../core/types';
export const minuteAt = (seconds: number): number => Math.max(0, Math.min(ENEMY_SCALING.maxMinute, Math.floor((seconds + 1e-7) / 60)));
/** Event một lần khi đổi phút, tính từ base và giữ HP ratio/cooldown/target; dead không hồi sinh. */
export function minuteScalingStep(s: RunState): void {
    const minute = minuteAt(s.time), eventFactor = s.astronomy.some(e => e.id === 'chaos' && e.phase === 'active') ? ASTRONOMY.chaosEnemy : 1;
    if (minute === s.minuteIndex && eventFactor === s.enemyEventFactor)
        return;
    const minuteChanged = minute !== s.minuteIndex;
    s.enemyEventFactor = eventFactor;
    s.minuteIndex = minute;
    for (const e of s.enemies) {
        if (isBoss(e.kind) || e.hp <= 0)
            continue;
        const rate = ENEMY_SCALING[e.kind], ratio = e.hp / e.maxHP;
        e.maxHP = (e.baseHP ?? ENEMIES[e.kind].hp) * (1 + rate.hp * minute) * eventFactor;
        e.hp = e.maxHP * ratio;
        e.damage = (e.baseDamage ?? ENEMIES[e.kind].damage) * (1 + rate.damage * minute) * eventFactor;
    }
    if (!minuteChanged)
        return;
    s.notice = `Phút ${minute + 1} — Hollowborn mạnh hơn`;
    s.noticeUntil = s.time + 3;
}
