import { BOSS_PHASES as P } from '../../config/balance';
import type { Enemy, RunState } from '../../core/types';
import { bossRuntime } from './state';
/** Ownership dọn đúng đòn của boss, không xóa đạn/XP của người chơi. */
export function clearBossAttacks(s: RunState, ownerId: number): void {
    // Đánh dấu rồi compact cuối combat: an toàn cả khi transition diễn ra giữa vòng duyệt đạn.
    for (const p of s.projectiles)
        if (p.ownerId === ownerId)
            p.ttl = 0;
    const boss = s.enemies.find(e => e.id === ownerId);
    if (boss?.boss) {
        boss.boss.attack = undefined;
        boss.boss.beam = undefined;
        boss.boss.comboPending = 0;
    }
    s.bossZones = s.bossZones.filter(z => z.ownerId !== ownerId);
}
/** Phase1 chết chỉ mở transition miễn damage; overkill không xuyên HP phase2. */
export function beginBossTransition(s: RunState, boss: Enemy): void {
    s.metrics.bossPhase2 = 1;
    s.metricRevision++;
    boss.bossPhase = 'transition';
    boss.hp = 0;
    boss.transitionEnd = s.time + P.transitionSeconds;
    const state = bossRuntime(boss);
    clearBossAttacks(s, boss.id);
    state.readyAt = Infinity;
    s.notice = 'Boss · Giai đoạn 2';
    s.noticeUntil = boss.transitionEnd + 2;
    s.cues.push('boss');
}
