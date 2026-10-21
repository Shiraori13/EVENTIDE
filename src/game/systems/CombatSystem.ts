import { isBoss } from '../config/bosses';
import { bossRuntime,bossBeams } from './bosses/state';
import { BALANCE as B } from '../config/balance';
import { ENEMIES, type ModuleId } from '../config/content';
import type { Enemy, RunState, Vec } from '../core/types';
import { distanceSquared, segmentDistanceSquared } from '../core/math';
import { drainXP } from './ExperienceSystem';
import { dropXP } from './PickupSystem';
import { shipStats } from '../core/stats';
import { beginBossTransition, clearBossAttacks } from './bosses/BossLifecycle';
import { dropSalvage } from './SalvageSystem';
import { recordIncoming, recordOutgoing, type DamageSource } from '../core/runReport';
export { dropXP } from './PickupSystem';
/** Đánh giá buff tại lúc gây damage, không sửa base stat nên không nhân lặp. */
export const damageMultiplier = (s: RunState): number => s.corruption >= B.corruptionThreshold ? B.corruptionMultiplier : 1;
export function effect(s: RunState, p: Vec, radius: number, color: number): void {
  if (s.effects.length < B.effectCap) s.effects.push({ x: p.x, y: p.y, id: s.nextId++, radius, color, end: s.time + 0.4 });
}
export function hitEnemy(s: RunState, e: Enemy, baseDamage: number, source: ModuleId | 'radiation' = 'plasma', rng: () => number = Math.random): void {
  if (e.hp <= 0 || e.bossPhase === 'transition' || e.bossPhase === 'dead') return;
  if (!(baseDamage > 0)) return;
  // Mọi vũ khí tính support + Corruption tại hit, kể cả viên đã tồn tại trước upgrade.
  const damage = baseDamage * (source === 'radiation' ? 1 : shipStats(s).outgoing);
  recordOutgoing(s, source, e.hp, damage); e.hp -= damage;
  if (source === 'pulsar' && !s.metrics.pulsarHits) { s.metrics.pulsarHits = 1; s.metricRevision++; }
  if (source === 'ion' && !s.metrics.ionHits) { s.metrics.ionHits = 1; s.metricRevision++; }
  effect(s, e, e.radius + 5, 0xff80be);
  if (e.hp <= 0) {
    if (isBoss(e.kind) && e.bossPhase !== 'phase2') { beginBossTransition(s, e); return; }
    s.kills++; s.metricRevision++; dropXP(s, e, ENEMIES[e.kind].xp); dropSalvage(s, e, rng);
    if (e.kind === 'drifter') s.metrics.drifterKills++;
    if (e.kind === 'leech') s.metrics.leechKills++;
    if (isBoss(e.kind)) s.metrics.bossKills++;
    if (isBoss(e.kind)) { e.bossPhase = 'dead'; bossRuntime(e).deathAt=s.time; s.bossDefeated = true; clearBossAttacks(s, e.id); s.notice = 'Boss tan rã · Tiếp tục bảo vệ Beacon'; s.noticeUntil = s.time + 5; }
  }
}
/** Cửa sổ bảo vệ toàn tàu chống nhiều hit cùng frame; Beacon dùng cooldown từng quái. */
export function hitPlayer(s: RunState, baseDamage: number, source: DamageSource = {kind:'unknown',channel:'contact'}): boolean {
  if (!(baseDamage > 0)) return false;
  if (s.time + 1e-9 < s.player.protectedUntil || s.time<(s.invulnerableUntil??0)) return false;
  const damage=baseDamage*shipStats(s).incoming;
  recordIncoming(s,'ship',s.player.hp,damage,source);
  s.player.hp -= damage; s.player.protectedUntil = s.time + B.contactProtection;
  s.cues.push('hit'); effect(s, s.player, 32, 0xff7ca7); return true;
}
/** Timer theo loại môi trường, không vô tình miễn radiation vì vừa contact; chỉ miễn nhiễm thật chặn tất cả. */
export function hitEnvironment(s:RunState,damage:number,source:string,interval:number,ownerId?:number):boolean {
  if (!(damage > 0)) return false;
  if(s.time<(s.invulnerableUntil??0)||s.time+1e-7<(s.environmentHits[source]??0))return false;
  s.environmentHits[source]=s.time+interval;
  const actual=damage*shipStats(s).incoming;
  recordIncoming(s,'ship',s.player.hp,actual,{kind:ownerId===undefined?'radiation':'helion',channel:source==='solar-burst'?'solar-burst':'radiation',ownerId});
  s.player.hp-=actual;s.cues.push('hit');effect(s,s.player,28,0xffbb66);return true;
}
export function combatStep(s: RunState, dt: number, rng: () => number = Math.random): void {
  for (const e of s.enemies) {
    if (e.hp <= 0 || e.bossPhase==='transition' || s.time<(e.boss?.spawnUntil??-Infinity)) continue;
    const target = e.target === 'beacon' ? { x: 0, y: 0 } : s.player;
    const swept=e.boss?.attack?.kind==='dash'&&s.time>=e.boss.attack.fire&&segmentDistanceSquared({x:0,y:0},(e.previousX??e.x)-(s.player.previousX??s.player.x),(e.previousY??e.y)-(s.player.previousY??s.player.y),e.x-s.player.x,e.y-s.player.y)<=(e.radius+B.playerRadius)**2;
    if ((swept||distanceSquared(e, target) <= (e.radius + (e.target === 'beacon' ? B.coreRadius : B.playerRadius)) ** 2) && s.time + 1e-9 >= e.nextHit) {
      e.nextHit = s.time + B.enemyContactCooldown;
      const source:DamageSource={kind:e.kind,channel:'contact',ownerId:isBoss(e.kind)?e.id:undefined};
      if (e.target === 'beacon') { const damage = e.damage ?? ENEMIES[e.kind].damage; if (damage > 0) { recordIncoming(s,'beacon',s.beacon.hp,damage,source);s.beacon.hp -= damage; s.beacon.lastHit = s.time; s.cues.push('beacon'); } }
      else if (hitPlayer(s, e.damage ?? ENEMIES[e.kind].damage,source) && e.kind === 'leech') drainXP(s);
    }
  }
  for (const p of s.projectiles) {
    if (p.ttl <= 0) continue;
    const fromX = p.x, fromY = p.y; p.x += p.vx * dt; p.y += p.vy * dt; p.ttl -= dt;
    if (p.hostile) {
      if (segmentDistanceSquared(s.player, fromX, fromY, p.x, p.y) <= (B.playerRadius + p.radius) ** 2) { hitPlayer(s, p.damage,{kind:s.enemies.find(e=>e.id===p.ownerId)?.kind??'unknown',channel:'projectile',ownerId:p.ownerId}); p.ttl = 0; }
    } else {
      let hit: Enemy | undefined;
      for (const e of s.enemies) if (e.hp > 0 && segmentDistanceSquared(e, fromX, fromY, p.x, p.y) <= (e.radius + p.radius) ** 2) { hit = e; break; }
      if (hit) {
        // Va chạm hoặc nổ: mỗi mục tiêu nhận đúng một lần mỗi viên.
        if (p.blast > 0) { for (const e of s.enemies) if (e.hp > 0 && distanceSquared(e, hit) <= (p.blast + e.radius) ** 2) hitEnemy(s, e, p.damage, p.source, rng); effect(s, hit, p.blast, p.blast > 100 ? 0xffdd8c : 0x7cffff); }
        else hitEnemy(s, hit, p.damage, p.source, rng);
        p.ttl = 0;
      }
    }
  }
  for(const beam of bossBeams(s))if(s.time>=beam.fire&&s.time<=beam.end){const x=beam.x+Math.cos(beam.angle)*B.beamLength,y=beam.y+Math.sin(beam.angle)*B.beamLength;if(segmentDistanceSquared(s.player,beam.x,beam.y,x,y)<(B.bossBeamWidth+B.playerRadius)**2)hitPlayer(s,beam.damage??B.bossBeamDamage,{kind:s.enemies.find(e=>e.id===beam.ownerId)?.kind??'unknown',channel:'beam',ownerId:beam.ownerId});}
  let write = 0; for (const p of s.projectiles) if (p.ttl > 0) s.projectiles[write++] = p; s.projectiles.length = write;
  write = 0; for (const e of s.enemies) if (e.hp > 0 || e.bossPhase === 'transition') s.enemies[write++] = e; s.enemies.length = write;
  write = 0; for (const e of s.effects) if (e.end > s.time) s.effects[write++] = e; s.effects.length = write;
}
