import { BALANCE as B, ENEMY_SCALING } from '../config/balance';
import { ENEMIES, WAVES, type EnemyId } from '../config/content';
import { distance, unit } from '../core/math';
import type { Enemy, RunState, Vec } from '../core/types';
/** Snapshot stat lúc sinh; boss có grace contact đến hết delay đợt đầu (giây simulation). */
export function makeEnemy(s: RunState, kind: EnemyId, p: Vec, target: 'player' | 'beacon'): Enemy {
  const data = ENEMIES[kind];
  const progress = kind === 'elder' ? 0 : Math.min(1, Math.max(0, s.time / B.duration));
  const hp = data.hp * (1 + ENEMY_SCALING.hpGrowth * progress);
  const e: Enemy = { x: p.x, y: p.y, id: s.nextId++, kind, hp, maxHP: hp, radius: data.radius, target, nextHit: s.time + (kind === 'elder' ? B.bossFirstRingDelay : 0), nextDroneHit: s.time, spawnedAt: s.time, speed: data.speed * (1 + ENEMY_SCALING.speedGrowth * progress), damage: data.damage * (1 + ENEMY_SCALING.damageGrowth * progress), ...(kind === 'elder' ? { bossPhase: 'phase1' as const } : {}) };
  s.enemies.push(e); return e;
}
/** Spawn có số lần thử hữu hạn; thất bại hoãn sang nhịp kế tiếp. */
export function spawnStep(s: RunState, rng: () => number): void {
  if (s.time + 1e-9 < s.nextSpawn) return;
  const wave = [...WAVES].reverse().find(w => s.time >= w.at) ?? WAVES[0];
  s.nextSpawn = s.time + wave.interval;
  for (let i = 0; i < wave.count && s.enemies.filter(e => e.kind !== 'elder').length < B.enemyCap; i++) {
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
  if (!s.bossSpawned && s.time >= B.bossTime) {
    s.bossSpawned = true;
    // Boss có slot riêng ngoài cap quái thường.
    // Điểm mặc định có thể đang có tàu: dùng phía đối diện, vẫn ngoài vùng sáng và trong map.
    const opposite = unit(-s.player.x || 1, -s.player.y);
    const position = distance(B.bossStart, s.player) >= B.spawnSafety ? B.bossStart : { x: opposite.x * B.bossOrbitRadius, y: opposite.y * B.bossOrbitRadius };
    makeEnemy(s, 'elder', position, 'player');
    s.bossRing = s.time + B.bossFirstRingDelay; s.bossBeam = s.time + B.bossFirstBeamDelay;
    s.notice = 'CẢNH BÁO · ELDER STAR ĐANG ĐẾN'; s.noticeUntil = s.time + 6; s.cues.push('boss');
  }
  if (!s.finalGravity && s.time >= B.finalGravityTime) {
    s.finalGravity = true; s.gravity = { ...B.finalGravityPosition, start: s.time + B.gravityWarning, end: B.duration + 1, final: true };
    s.notice = 'Hố đen cuối màn · Rời khỏi vòng cảnh báo'; s.noticeUntil = s.time + 5;
  }
  if (!s.finalGravity && s.time >= s.nextGravity) {
    const angle = Math.floor(rng() * B.gravitySiteCount) * Math.PI * 2 / B.gravitySiteCount;
    s.gravity = { x: Math.cos(angle) * B.gravitySiteRadius, y: Math.sin(angle) * B.gravitySiteRadius, start: s.time + B.gravityWarning, end: s.time + B.gravityLifetime, final: false };
    s.nextGravity += B.gravityPeriod;
  }
  if (s.gravity && s.time >= s.gravity.end) s.gravity = undefined;
}
