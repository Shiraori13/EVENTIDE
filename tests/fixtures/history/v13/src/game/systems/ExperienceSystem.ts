import { BALANCE as B } from '../config/balance';
import { DRONES, PLASMA, UPGRADES, WELLS, plasmaName, type UpgradeId, type ModuleId, type SupportId } from '../config/content';
import { SUPPORTS, STAT_LIMITS } from '../config/progression';
import { attackInterval, calculateStats, shipStats, supportBonus, type ShipStats } from '../core/stats';
import type { RunState } from '../core/types';
export const xpRequired = (level: number): number => B.xpBase + (level - 1) * B.xpGrowth;
/** Giữ XP dư; mỗi pending là một draft độc lập, không một lần mở DOM. */
export function addXP(s: RunState, value: number): void { s.xp += value; while (s.xp >= xpRequired(s.level)) { s.xp -= xpRequired(s.level); s.level++; s.pending++; } }
export function drainXP(s: RunState): void { s.xp = Math.max(0, s.xp - B.leechXP); s.player.leechUntil = s.time + B.leechLatch; }
export function upgradeLevel(s: RunState, id: UpgradeId): number { return UPGRADES[id].kind === 'module' ? s.modules[id as ModuleId] ?? 0 : s.supports[id as SupportId] ?? 0; }
/** Lọc trước: loại đạt trần/không còn ô không thể lọt vào reroll hay catalog status. */
export function availableUpgrades(s: RunState): UpgradeId[] {
  return (Object.keys(UPGRADES) as UpgradeId[]).filter(id => {
    const d = UPGRADES[id], level = upgradeLevel(s, id), used = Object.values(d.kind === 'module' ? s.modules : s.supports).filter(n => n && n > 0).length;
    return level < d.max && (level > 0 || used < (d.kind === 'module' ? STAT_LIMITS.moduleSlots : STAT_LIMITS.supportSlots));
  });
}
function shuffled(ids: UpgradeId[], rng: () => number): UpgradeId[] { const result = [...ids]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
function draft(s: RunState, rng: () => number, old: UpgradeId[] = []): UpgradeId[] {
  const pool = shuffled(availableUpgrades(s), rng), fresh = pool.filter(id => !old.includes(id));
  const candidates = fresh.length >= 3 ? fresh : [...fresh, ...pool.filter(id => old.includes(id))];
  const result: UpgradeId[] = [];
  // Đại diện hai nhóm trước khi điền; ưu tiên thay toàn bộ nếu đủ thẻ mới.
  for (const kind of ['module', 'support']) { const id = candidates.find(x => UPGRADES[x].kind === kind); if (id) result.push(id); }
  for (const id of candidates) if (!result.includes(id) && result.length < 3) result.push(id);
  return result;
}
export function prepareChoices(s: RunState, rng: () => number): void {
  while (s.pending > 0) {
    if (!availableUpgrades(s).length) {
      s.player.hp = Math.min(s.player.maxHP, s.player.hp + B.fallbackHeal); s.pending--; s.rerollsRemaining = 0;
      s.notice = 'Mọi thiết bị đã tối đa · Hồi 10 HP'; s.noticeUntil = s.time + 3; continue;
    }
    s.draftId++; s.rerollsRemaining = 1; s.choices = draft(s, rng); s.phase = 'choosingUpgrade'; return;
  }
  s.choices = []; s.rerollsRemaining = 0; s.phase = 'playing';
}
/** Draft ID chặn click cũ sau khi pending đã chuyển sang draft kế tiếp. */
export function rerollChoices(s: RunState, rng: () => number, draftId = s.draftId): boolean {
  if (s.phase !== 'choosingUpgrade' || draftId !== s.draftId || s.rerollsRemaining !== 1) return false;
  s.rerollsRemaining = 0; s.choices = draft(s, rng, s.choices); return true;
}
export function chooseUpgrade(s: RunState, id: UpgradeId, rng: () => number, draftId = s.draftId): boolean {
  if (s.phase !== 'choosingUpgrade' || draftId !== s.draftId || !s.choices.includes(id) || !availableUpgrades(s).includes(id)) return false;
  const beforeHP = shipStats(s).maxHP, level = upgradeLevel(s, id) + 1;
  // Plasma tiến hóa cùng slot; support thay nguồn bonus, không nhân effective stat cũ.
  if (UPGRADES[id].kind === 'module') s.modules[id as ModuleId] = level; else s.supports[id as SupportId] = level;
  if (id === 'hull') { s.player.maxHP = shipStats(s).maxHP; s.player.hp = Math.min(s.player.maxHP, s.player.hp + s.player.maxHP - beforeHP); }
  s.picks++; s.cues.push(id === 'plasma' && (level === 3 || level === 5) ? 'evolution' : 'upgrade');
  s.notice = id === 'plasma' ? `Tiến hóa · ${plasmaName(level)}` : `${UPGRADES[id].name} · cấp ${level}`;
  s.noticeUntil = s.time + 3; s.pending--; prepareChoices(s, rng); return true;
}
export const numberText = (n: number): string => Number(n.toFixed(2)).toString();
/** Formatter chung cho catalog/build/tooltip; interval là giây thực sau rate. */
export function moduleDescription(id: ModuleId, level: number, stats: ShipStats = calculateStats()): string {
  const damage = (n: number): string => numberText(n * stats.outgoing), interval = (n: number): string => numberText(attackInterval(n, stats));
  if (id === 'plasma') { const d = PLASMA[level - 1]; return `${plasmaName(level)} · ${damage(d.damage)} sát thương · nhịp ${interval(d.cooldown)}s · tầm ${d.range}u${d.blast ? ` · nổ ${d.blast}u, một hit/mục tiêu` : ''}`; }
  if (id === 'drones') { const d = DRONES[level - 1]; return `${d.count} drone · ${damage(d.damage)} sát thương/mục tiêu/${interval(d.cooldown)}s · quỹ đạo ${d.radius}u`; }
  const d = WELLS[level - 1]; return `Hút quái ${d.duration}s · nổ ${damage(d.damage)} · vùng ${d.radius}u · nhịp ${interval(d.cooldown)}s`;
}
export function upgradeDescription(id: UpgradeId, level: number, s?: RunState): string {
  if (UPGRADES[id].kind === 'module') return moduleDescription(id as ModuleId, Math.min(UPGRADES[id].max, level + 1), s ? shipStats(s) : undefined);
  const support = id as SupportId, d = SUPPORTS[support], current = s?.supports ?? { [id]: level };
  const before = calculateStats(s?.characterId, current, s?.corruption), after = calculateStats(s?.characterId, { ...current, [id]: Math.min(d.max, level + 1) }, s?.corruption);
  const key = { power: 'outgoing', haste: 'attackRate', hull: 'maxHP', engine: 'moveSpeed', magnet: 'pickupRadius', armor: 'reduction' } as const;
  const percent = id === 'power' || id === 'haste' || id === 'armor', unit = id === 'hull' ? 'HP' : id === 'engine' ? 'u/s' : id === 'magnet' ? 'u' : '%';
  return `${numberText(before[key[support]] * (percent ? 100 : 1))} → ${numberText(after[key[support]] * (percent ? 100 : 1))}${unit} · hỗ trợ ${numberText(supportBonus({ ...current, [id]: level + 1 }, support) * 100)}%/${d.cap * 100}% · mỗi cấp +${d.increment * 100}${id === 'armor' ? ' điểm %' : '% base'}${id === 'haste' ? ' · interval ÷ rate' : ''}`;
}
