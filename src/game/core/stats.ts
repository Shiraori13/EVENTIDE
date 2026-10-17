import { CHARACTERS, SUPPORTS, STAT_LIMITS, type CharacterId, type SupportId } from '../config/progression';
import { BALANCE as B } from '../config/balance';
import type { RunState } from './types';
import { emptySalvage, SALVAGE, type SalvageBonuses } from '../config/salvage';
import { MASTERY } from '../config/mastery';
import { ASTRONOMY } from '../config/events';
export interface ShipStats { baseHP: number; baseSpeed: number; basePickup: number; maxHP: number; moveSpeed: number; pickupRadius: number; damageBonus: number; rateBonus: number; hpBonus: number; speedBonus: number; pickupBonus: number; reduction: number; corruption: number; eventOutgoing: number; outgoing: number; incoming: number; attackRate: number }
export function supportBonus(supports: Partial<Record<SupportId, number>>, id: SupportId): number { const d = SUPPORTS[id]; return Math.max(0, Math.min(d.cap, (supports[id] ?? 0) * d.increment)); }
/** Nguồn duy nhất cho runtime/menu/catalog. Không cộng Beacon Core vào HP phi thuyền. */
export function calculateStats(characterId: CharacterId = 'nova', supports: Partial<Record<SupportId, number>> = {}, corruption = 0, salvage: SalvageBonuses = emptySalvage(), mastery: SalvageBonuses = emptySalvage(), eventOutgoing = 1): ShipStats {
  // Nguồn trang bị đã validate integer bp tại collect; clamp riêng, không nhân trên effective stat cũ.
  const gear = (id: keyof SalvageBonuses): number => Math.max(0, Math.min(SALVAGE.stats[id].capBP, salvage[id])) / 10000 + Math.max(0, Math.min(MASTERY.caps[id], mastery[id])) / 10000;
  const base = CHARACTERS[characterId], hpBonus = supportBonus(supports, 'hull') + gear('hp'), speedBonus = supportBonus(supports, 'engine') + gear('speed'), pickupBonus = supportBonus(supports, 'magnet') + gear('pickup');
  const damageBonus = supportBonus(supports, 'power') + gear('damage'), rateBonus = supportBonus(supports, 'haste') + gear('rate'), reduction = supportBonus(supports, 'armor');
  const modifier = corruption >= B.corruptionThreshold ? B.corruptionMultiplier : 1;
  return { baseHP: base.hp, baseSpeed: base.speed, basePickup: base.pickup, maxHP: Math.round(base.hp * (1 + hpBonus) * 1000) / 1000, moveSpeed: base.speed * (1 + speedBonus), pickupRadius: base.pickup * (1 + pickupBonus), damageBonus, rateBonus, hpBonus, speedBonus, pickupBonus, reduction, corruption: modifier, eventOutgoing, outgoing: (1 + damageBonus) * modifier * eventOutgoing, incoming: (1 - reduction) * modifier, attackRate: 1 + rateBonus };
}
const cache = new WeakMap<RunState, { key: string; stats: ShipStats }>();
/** Cache chỉ derived stats theo nguồn; không lưu bền hoặc scan tooltip mỗi frame. */
export function shipStats(s: RunState): ShipStats {
  const gear = s.salvage.bonuses;
  const event = s.astronomy.some(e => e.id === 'chaos' && e.phase === 'active') ? ASTRONOMY.chaosOutgoing : 1;
  const key = `${s.characterId}:${s.supports.power ?? 0},${s.supports.haste ?? 0},${s.supports.hull ?? 0},${s.supports.engine ?? 0},${s.supports.magnet ?? 0},${s.supports.armor ?? 0}:${gear.damage},${gear.rate},${gear.hp},${gear.pickup},${gear.speed}:${Object.values(s.masteryBonus).join(',')}:${event}:${s.corruption >= B.corruptionThreshold}`;
  const saved = cache.get(s); if (saved?.key === key) return saved.stats;
  const stats = calculateStats(s.characterId, s.supports, s.corruption, gear, s.masteryBonus, event); cache.set(s, { key, stats }); return stats;
}
export const attackInterval = (baseSeconds: number, stats: ShipStats): number => Math.max(STAT_LIMITS.minAttackInterval, baseSeconds / stats.attackRate);
