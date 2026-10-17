import { SALVAGE as C, type SalvageStat } from '../config/salvage';
import type { Enemy, RunState } from '../core/types';
import { shipStats } from '../core/stats';
import { distanceSquared } from '../core/math';
import { numberText } from '../ui/format';
export const salvageUsed = (s: RunState): number => Object.values(s.salvage.bonuses).reduce((n, bp) => n + bp, 0);
export const salvagePool = (s: RunState): SalvageStat[] => salvageUsed(s) >= C.budgetBP ? [] : (Object.keys(C.stats) as SalvageStat[]).filter(id => s.salvage.bonuses[id] < C.stats[id].capBP);
/** Chỉ gọi sau final death; cap32 bỏ drop mới và đếm rõ, không queue vô hạn/đổi thành XP. */
export function dropSalvage(s: RunState, e: Enemy, rng: () => number): void {
  const pool = salvagePool(s); if (!pool.length) return;
  const rate = C.drops[e.kind], chance = Math.min(rate.cap, rate.base + rate.perMinute * s.minuteIndex);
  s.salvage.rolls++;
  if (rng() >= chance) return;
  s.salvage.rolled++;
  if (s.salvage.items.length >= C.activeCap) { s.salvage.capHits++; return; }
  const stat = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))], bp = C.amountsBP[rng() < 0.5 ? 0 : 1];
  s.salvage.items.push({ id: s.nextId++, x: e.x, y: e.y, stat, bp, sourceId: e.id, sourceKind: e.kind, created: s.time, end: s.time + C.ttl, state: 'available' }); s.salvage.dropped++;
}
/** Collect xác thực lại hai cap bằng integer bp; chỉ phần thực nhận mới credit achievement/HP. */
export function collectSalvage(s: RunState, id: number): number {
  const p = s.salvage.items.find(item => item.id === id);
  if (!p || p.state === 'released' || p.end <= s.time || distanceSquared(p, s.player) > C.collectRadius ** 2) return 0;
  const beforeHP = shipStats(s).maxHP, applied = Math.max(0, Math.min(p.bp, C.stats[p.stat].capBP - s.salvage.bonuses[p.stat], C.budgetBP - salvageUsed(s)));
  p.state = 'released';
  if (!applied) return 0;
  s.salvage.bonuses[p.stat] += applied; s.salvage.collected++; s.metrics.salvageCollected++; s.metrics.salvageBudgetBP = salvageUsed(s); s.metricRevision++;
  if (p.stat === 'hp') { s.player.maxHP = shipStats(s).maxHP; s.player.hp = Math.min(s.player.maxHP, s.player.hp + s.player.maxHP - beforeHP); }
  if (s.salvage.capAt === undefined && salvageUsed(s) >= C.budgetBP) s.salvage.capAt = s.time;
  s.notice = `Trang bị thu hồi · +${numberText(applied / 100)}% ${C.stats[p.stat].name}`; s.noticeUntil = s.time + 2; s.cues.push('pickup');
  return applied;
}
export function salvageStep(s: RunState, dt: number): void {
  if (salvageUsed(s) >= C.budgetBP) { s.salvage.retired += s.salvage.items.filter(p => p.state !== 'released').length; s.salvage.items.length = 0; return; }
  const radius2 = shipStats(s).pickupRadius ** 2;
  for (const p of s.salvage.items) {
    if (p.state === 'released') continue;
    if (p.end <= s.time) { p.state = 'released'; s.salvage.expired++; continue; }
    if (s.salvage.bonuses[p.stat] >= C.stats[p.stat].capBP) { p.state = 'released'; s.salvage.retired++; continue; }
    let d2 = distanceSquared(p, s.player);
    if (p.state === 'attracted' || d2 <= radius2) {
      p.state = 'attracted'; const d = Math.sqrt(d2), factor = d > 0 ? Math.min(1, 450 * dt / d) : 0;
      p.x += (s.player.x - p.x) * factor; p.y += (s.player.y - p.y) * factor; d2 = distanceSquared(p, s.player);
    }
    if (d2 <= C.collectRadius ** 2) collectSalvage(s, p.id);
  }
  let write = 0; for (const p of s.salvage.items) if (p.state !== 'released') s.salvage.items[write++] = p; s.salvage.items.length = write;
  if (salvageUsed(s) >= C.budgetBP) { s.salvage.retired += s.salvage.items.length; s.salvage.items.length = 0; }
}
