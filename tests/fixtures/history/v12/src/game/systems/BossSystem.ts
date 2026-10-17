import { BALANCE as B } from '../config/balance';
import type { RunState } from '../core/types';
/** Tia khóa hướng lúc báo trước, không bám theo tàu trong giai đoạn gây damage. */
export function bossStep(s: RunState): void {
  const boss = s.enemies.find(e => e.kind === 'elder' && e.hp > 0); if (!boss) return;
  if (s.time >= s.bossRing) {
    s.bossRing = s.time + B.bossRingCooldown;
    const offset = s.time * B.bossRingRotation;
    for (let i = B.bossRingGap; i < B.bossRingCount; i++) {
      if (s.projectiles.length >= B.projectileCap) break;
      const a = offset + i * Math.PI * 2 / B.bossRingCount;
      s.projectiles.push({ x: boss.x, y: boss.y, id: s.nextId++, vx: Math.cos(a) * B.bossBulletSpeed, vy: Math.sin(a) * B.bossBulletSpeed, ttl: B.bossBulletTTL, damage: B.bossBulletDamage, blast: 0, hostile: true, radius: 7 });
    }
  }
  if (s.time >= s.bossBeam) {
    s.bossBeam = s.time + B.bossBeamCooldown;
    s.beam = { x: boss.x, y: boss.y, angle: Math.atan2(s.player.y - boss.y, s.player.x - boss.x), fire: s.time + B.bossBeamWarning, end: s.time + B.bossBeamWarning + B.bossBeamDuration };
  }
  if (s.beam && s.time > s.beam.end) s.beam = undefined;
}
