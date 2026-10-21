import { ASTRONOMY as A } from '../config/events';
import type { RunState, AstronomyEvent } from '../core/types';
import { distanceSquared } from '../core/math';
import { hitEnemy, hitPlayer } from './CombatSystem';
export const currentAstronomy = (s: RunState): AstronomyEvent | undefined => s.astronomy.find(e => e.phase === 'warning' || e.phase === 'active');
/** Resolve theo thời điểm hiện tại: fast-forward không replay hazard đã hết. Chỉ một owner warning/active. */
export function astronomyStep(s: RunState): void {
  let owner: AstronomyEvent | undefined;
  for (const e of s.astronomy) {
    if (e.phase === 'cancelled') continue;
    const old = e.phase;
    const phase = s.time + 1e-7 >= e.end ? 'completed' : s.time + 1e-7 >= e.start ? 'active' : s.time + 1e-7 >= e.start - A.warning ? 'warning' : 'scheduled';
    if ((phase === 'warning' || phase === 'active') && owner) { e.phase = 'cancelled'; continue; }
    if (phase === 'completed' && (old === 'active' || old === 'warning')) {
      e.phase = 'ending';
      if (e.id === 'tide' && s.gravity?.source === 'tide') s.gravity = undefined;
    }
    e.phase = phase;
    if (phase === 'warning' || phase === 'active') owner = e;
    if (old === phase) continue;
    const d = A.schedule.find(d => d.id === e.id)!;
    if (phase === 'warning') { s.notice = `${d.icon} Sắp đến: ${d.name}`; s.noticeUntil = e.start; s.cues.push('boss'); }
    if (phase === 'active') { e.nextTick = s.time; s.notice = `${d.icon} ${d.name} · ${d.description}`; s.noticeUntil = s.time + 4; }
    if (phase === 'completed' && (old === 'active' || old === 'warning')) { s.notice = `${d.name} đã kết thúc`; s.noticeUntil = s.time + 3; }
  }
  if (owner) {
    // Event lớn thu hồi gravity thường; mốc thường bị bỏ chứ không tích thành queue.
    if (owner.id === 'tide' && s.gravity?.source !== 'tide') s.gravity = { ...A.tideCenter, start: owner.start, end: owner.end, final: false, source: 'tide' };
    else if (owner.id !== 'tide' && s.gravity && !s.gravity.final) s.gravity = undefined;
  } else if (s.gravity?.source === 'tide') s.gravity = undefined;
}
export function tideStrength(s: RunState): number { const e = s.astronomy.find(e => e.id === 'tide' && e.phase === 'active'); return e ? A.tideForce * Math.sin((s.time - e.start) * Math.PI * 2 / A.tideCycle) : 0; }
/** Environmental final hit cùng dead guard/loot/kill; %HP không nhận bonus damage tàu. */
export function radiationStep(s: RunState, rng: () => number): void {
  const e = s.astronomy.find(e => e.id === 'radiation' && e.phase === 'active'); if (!e || s.time + 1e-7 < e.nextTick) return;
  e.nextTick = s.time + A.radiationTick;
  const inside = (p: {x:number;y:number}): boolean => A.zones.some(z => distanceSquared(p,z) <= z.radius ** 2);
  if (inside(s.player)) hitPlayer(s, A.radiationShipDPS * A.radiationTick);
  for (const enemy of s.enemies) if (enemy.kind !== 'elder' && enemy.hp > 0 && inside(enemy)) hitEnemy(s, enemy, Math.min(A.radiationEnemyCap, enemy.maxHP * A.radiationEnemyFraction) * A.radiationTick, 'radiation', rng);
}
/** Result/restart không mang modifier hoặc field sang lượt mới. Ending là bước cleanup đồng bộ. */
export function cancelAstronomy(s: RunState): void { for (const e of s.astronomy) if (e.phase !== 'completed') { e.phase = 'ending'; e.phase = 'cancelled'; } s.enemyEventFactor = 1; if (s.gravity?.source === 'tide') s.gravity = undefined; }
