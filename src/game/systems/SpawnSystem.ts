import { astronomyStep, currentAstronomy } from './hazards/AstronomySystem';
import { BALANCE as B } from '../config/balance';
import { WAVES } from '../config/content';
import { distance } from '../core/math';
import type { RunState } from '../core/types';
import { isBoss } from '../config/bosses';
import { makeEnemy } from './enemies/EnemyFactory';
import { minuteScalingStep } from './enemies/ScalingSystem';
import { bossScheduleStep } from './bosses/BossScheduler';
export { makeEnemy } from './enemies/EnemyFactory';
export { minuteAt, minuteScalingStep } from './enemies/ScalingSystem';
/** Spawn có số lần thử hữu hạn; thất bại hoãn sang nhịp kế tiếp. */
export function spawnStep(s: RunState, rng: () => number): void {
  if (s.time + 1e-9 < s.nextSpawn) return;
  const wave = [...WAVES].reverse().find(w => s.time >= w.at) ?? WAVES[0];
  s.nextSpawn = s.time + wave.interval;
  for (let i = 0; i < wave.count && s.enemies.filter(e => !isBoss(e.kind)).length < B.enemyCap; i++) {
    const r = rng(); const kind = r < wave.leech ? 'leech' : r < wave.leech + wave.drifter ? 'drifter' : 'wisp';
    for (let attempt = 0; attempt < B.spawnAttempts; attempt++) {
      const a = rng() * Math.PI * 2, radius = B.spawnCoreSafety + rng() * (B.arenaRadius - B.spawnCoreSafety - B.spawnEdgeMargin);
      const p = { x: Math.cos(a) * radius, y: Math.sin(a) * radius };
      if (distance(p, s.player) < B.spawnSafety) continue;
      // Leeches chỉ săn tàu; điều chỉnh xác suất các loại còn lại để tổng ~25%.
      const target = kind !== 'leech' && rng() < B.beaconTargetShare / (1 - wave.leech) ? 'beacon' : 'player';
      makeEnemy(s, kind, p, target); break;
    }
  }
}
/** Các event dùng cờ và >=: không bỏ mốc khi bước mô phỏng vượt qua thời điểm. */
export function eventStep(s: RunState, rng: () => number): void {
  if(s.phase!=='playing')return;
  astronomyStep(s); minuteScalingStep(s);
  // Dọn field đã hết trước nhánh skip/return khi test nhảy qua nhiều mốc lịch.
  if (s.gravity && s.time >= s.gravity.end) s.gravity = undefined;
  bossScheduleStep(s,rng);
  if (!s.finalGravity && s.time >= B.finalGravityTime) {
    s.finalGravity = true; s.gravity = { ...B.finalGravityPosition, start: B.finalGravityTime + B.gravityWarning, end: B.duration + 1, final: true };
    s.notice = 'Hố đen cuối màn · Rời khỏi vòng cảnh báo'; s.noticeUntil = s.time + 5;
  }
  if (!s.finalGravity && s.time >= s.nextGravity) {
    const scheduled = s.nextGravity + Math.floor((s.time - s.nextGravity) / B.gravityPeriod) * B.gravityPeriod;
    s.nextGravity = scheduled + B.gravityPeriod;
    if (currentAstronomy(s) || s.time >= scheduled + B.gravityLifetime) return;
    const angle = Math.floor(rng() * B.gravitySiteCount) * Math.PI * 2 / B.gravitySiteCount;
    s.gravity = { x: Math.cos(angle) * B.gravitySiteRadius, y: Math.sin(angle) * B.gravitySiteRadius, start: scheduled + B.gravityWarning, end: scheduled + B.gravityLifetime, final: false };

  }
  if (s.gravity && s.time >= s.gravity.end) s.gravity = undefined;
}
