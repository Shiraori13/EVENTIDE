import { BOSS_PHASES as P } from '../config/balance';
import type { Enemy, RunState } from '../core/types';
/** Ownership dọn đúng đòn của boss, không xóa đạn/XP của người chơi. */
export function clearBossAttacks(s: RunState, ownerId: number): void {
  // Đánh dấu rồi compact cuối combat: an toàn cả khi transition diễn ra giữa vòng duyệt đạn.
  for (const p of s.projectiles) if (p.ownerId === ownerId) p.ttl = 0;
  if (s.beam?.ownerId === ownerId) s.beam = undefined;
  s.bossFan = undefined;
}
/** Phase1 chết chỉ mở transition miễn damage; overkill không xuyên HP phase2. */
export function beginBossTransition(s: RunState, boss: Enemy): void {
  s.metrics.bossPhase2 = 1; s.metricRevision++;
  boss.bossPhase = 'transition'; boss.hp = 0; boss.transitionEnd = s.time + P.transitionSeconds;
  clearBossAttacks(s, boss.id); s.bossRing = Infinity; s.bossBeam = Infinity;
  s.notice = 'ELDER STAR · Giai đoạn 2'; s.noticeUntil = boss.transitionEnd + 2; s.cues.push('boss');
}
