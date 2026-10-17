import { BALANCE as B, BOSS_PHASES as P } from '../config/balance';
import type { Enemy, RunState } from '../core/types';
import { ENEMIES } from '../config/content';
/** Projectile chụp nguồn/hướng tại fire rồi bay độc lập; chừa budget đạn tàu. */
function shoot(s: RunState, boss: Enemy, angle: number, damage: number): void {
  if (s.projectiles.length >= B.projectileCap - P.friendlyReserve) return;
  const x = boss.x + Math.cos(angle) * P.muzzleOffset, y = boss.y + Math.sin(angle) * P.muzzleOffset;
  s.projectiles.push({ x, y, previousX: x, previousY: y, id: s.nextId++, ownerId: boss.id, vx: Math.cos(angle) * B.bossBulletSpeed, vy: Math.sin(angle) * B.bossBulletSpeed, ttl: B.bossBulletTTL, damage, blast: 0, hostile: true, radius: 7 });
}
/** Simulation sở hữu aim→lock→fire→recover; nguồn tia luôn theo world position hiện tại. */
export function bossStep(s: RunState): void {
  const boss = s.enemies.find(e => e.kind === 'elder' && (e.hp > 0 || e.bossPhase === 'transition')); if (!boss) return;
  if (boss.bossPhase === 'transition') {
    if (s.time + 1e-9 < (boss.transitionEnd ?? Infinity)) return;
    boss.bossPhase = 'phase2'; boss.hp = boss.maxHP = B.bossHP * P.phase2HPRatio;
    boss.speed = B.bossSpeed * P.speedMultiplier; boss.damage = ENEMIES.elder.damage * P.damageMultiplier;
    s.bossPhase2At = s.time; s.bossRing = s.time + B.bossFirstRingDelay; s.bossBeam = s.time + B.bossFirstBeamDelay;
    s.notice = 'ELDER STAR · Giai đoạn 2 · Né loạt đạn hướng mục tiêu'; s.noticeUntil = s.time + 4;
  }
  const second = boss.bossPhase === 'phase2', rate = second ? P.rateMultiplier : 1, damage = second ? P.damageMultiplier : 1;
  if (s.beam && s.time > s.beam.end) s.beam = undefined;
  if (s.time >= s.bossRing && !s.beam) {
    s.bossRing = s.time + B.bossRingCooldown / rate;
    const count = second ? P.phase2RingCount : B.bossRingCount, gap = second ? P.phase2Gap : B.bossRingGap;
    const aim = Math.atan2(s.player.y - boss.y, s.player.x - boss.x), offset = second ? aim - Math.PI : s.time * B.bossRingRotation;
    for (let i = gap; i < count; i++) shoot(s, boss, offset + i * Math.PI * 2 / count, B.bossBulletDamage * damage);
    if (second) s.bossFan = s.time + P.fanDelay;
  }
  if (s.bossFan !== undefined && s.time >= s.bossFan && !s.beam) {
    const aim = Math.atan2(s.player.y - boss.y, s.player.x - boss.x);
    for (let i = 0; i < P.fanCount; i++) shoot(s, boss, aim + (i / (P.fanCount - 1) - 0.5) * P.fanSpread, B.bossBulletDamage * damage);
    s.bossFan = undefined;
  }
  if (s.time >= s.bossBeam && !s.beam && s.bossFan === undefined) {
    s.bossBeam = s.time + B.bossBeamCooldown / rate;
    const fire = s.time + B.bossBeamWarning;
    s.beam = { x: boss.x, y: boss.y, ownerId: boss.id, angle: Math.atan2(s.player.y - boss.y, s.player.x - boss.x), lock: fire - P.beamLockSeconds, locked: false, fire, end: fire + B.bossBeamDuration, damage: B.bossBeamDamage * damage };
  }
  const beam = s.beam;
  if (beam?.ownerId === boss.id) {
    if (!beam.locked) { beam.angle = Math.atan2(s.player.y - boss.y, s.player.x - boss.x); if (s.time >= (beam.lock ?? beam.fire)) beam.locked = true; }
    beam.x = boss.x + Math.cos(beam.angle) * P.muzzleOffset; beam.y = boss.y + Math.sin(beam.angle) * P.muzzleOffset;
  }
}
