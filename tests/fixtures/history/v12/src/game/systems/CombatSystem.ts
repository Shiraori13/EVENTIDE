import { BALANCE as B } from '../config/balance';
import { ENEMIES } from '../config/content';
import type { Enemy, RunState, Vec } from '../core/types';
import { distanceSquared, segmentDistanceSquared } from '../core/math';
import { drainXP } from './ExperienceSystem';
import { dropXP } from './PickupSystem';
export { dropXP } from './PickupSystem';
/** Đánh giá buff tại lúc gây damage, không sửa base stat nên không nhân lặp. */
export const damageMultiplier = (s: RunState): number => s.corruption >= B.corruptionThreshold ? B.corruptionMultiplier : 1;
export function effect(s: RunState, p: Vec, radius: number, color: number): void {
  if (s.effects.length < B.effectCap) s.effects.push({ x: p.x, y: p.y, id: s.nextId++, radius, color, end: s.time + 0.4 });
}
export function hitEnemy(s: RunState, e: Enemy, baseDamage: number): void {
  if (e.hp <= 0) return;
  e.hp -= baseDamage * damageMultiplier(s);
  effect(s, e, e.radius + 5, 0xff80be);
  if (e.hp <= 0) {
    s.kills++; dropXP(s, e, ENEMIES[e.kind].xp);
    if (e.kind === 'elder') { s.bossDefeated = true; s.beam = undefined; s.notice = 'Elder Star tan rã · Tiếp tục bảo vệ Beacon'; s.noticeUntil = s.time + 5; }
  }
}
/** Cửa sổ bảo vệ toàn tàu chống nhiều hit cùng frame; Beacon dùng cooldown từng quái. */
export function hitPlayer(s: RunState, baseDamage: number): boolean {
  if (s.time + 1e-9 < s.player.protectedUntil) return false;
  s.player.hp -= baseDamage * damageMultiplier(s); s.player.protectedUntil = s.time + B.contactProtection;
  s.cues.push('hit'); effect(s, s.player, 32, 0xff7ca7); return true;
}
export function combatStep(s: RunState, dt: number): void {
  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    const target = e.target === 'beacon' ? { x: 0, y: 0 } : s.player;
    if (distanceSquared(e, target) <= (e.radius + (e.target === 'beacon' ? B.coreRadius : B.playerRadius)) ** 2 && s.time + 1e-9 >= e.nextHit) {
      e.nextHit = s.time + B.enemyContactCooldown;
      if (e.target === 'beacon') { s.beacon.hp -= ENEMIES[e.kind].damage; s.beacon.lastHit = s.time; s.cues.push('beacon'); }
      else if (hitPlayer(s, ENEMIES[e.kind].damage) && e.kind === 'leech') drainXP(s);
    }
  }
  for (const p of s.projectiles) {
    const fromX = p.x, fromY = p.y; p.x += p.vx * dt; p.y += p.vy * dt; p.ttl -= dt;
    if (p.hostile) {
      if (segmentDistanceSquared(s.player, fromX, fromY, p.x, p.y) <= (B.playerRadius + p.radius) ** 2) { hitPlayer(s, p.damage); p.ttl = 0; }
    } else {
      let hit: Enemy | undefined;
      for (const e of s.enemies) if (e.hp > 0 && segmentDistanceSquared(e, fromX, fromY, p.x, p.y) <= (e.radius + p.radius) ** 2) { hit = e; break; }
      if (hit) {
        // Va chạm hoặc nổ: mỗi mục tiêu nhận đúng một lần mỗi viên.
        if (p.blast > 0) { for (const e of s.enemies) if (e.hp > 0 && distanceSquared(e, hit) <= (p.blast + e.radius) ** 2) hitEnemy(s, e, p.damage); effect(s, hit, p.blast, p.blast > 100 ? 0xffdd8c : 0x7cffff); }
        else hitEnemy(s, hit, p.damage);
        p.ttl = 0;
      }
    }
  }
  if (s.beam && s.time >= s.beam.fire && s.time <= s.beam.end) {
    const endX = s.beam.x + Math.cos(s.beam.angle) * B.beamLength, endY = s.beam.y + Math.sin(s.beam.angle) * B.beamLength;
    if (segmentDistanceSquared(s.player, s.beam.x, s.beam.y, endX, endY) < (B.bossBeamWidth + B.playerRadius) ** 2) hitPlayer(s, B.bossBeamDamage);
  }
  let write = 0; for (const p of s.projectiles) if (p.ttl > 0) s.projectiles[write++] = p; s.projectiles.length = write;
  write = 0; for (const e of s.enemies) if (e.hp > 0) s.enemies[write++] = e; s.enemies.length = write;
  write = 0; for (const e of s.effects) if (e.end > s.time) s.effects[write++] = e; s.effects.length = write;
}
