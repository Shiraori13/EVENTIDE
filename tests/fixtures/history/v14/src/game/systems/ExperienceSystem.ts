import { BALANCE as B } from '../config/balance';
import { DRONES, PLASMA, UPGRADES, WELLS, PULSAR, ION, plasmaName, type UpgradeId, type ModuleId, type SupportId } from '../config/content';
import { SUPPORTS, STAT_LIMITS } from '../config/progression';
import { attackInterval, calculateStats, shipStats, supportBonus, type ShipStats } from '../core/stats';
import type { RunState } from '../core/types';
import { clearModuleAttacks } from './ModuleLifecycle';
import { numberText, unitText } from '../ui/format';
export { numberText } from '../ui/format';
export const xpRequired = (level: number): number => B.xpBase + (level - 1) * B.xpGrowth;
/** Giữ XP dư; mỗi pending là một draft độc lập, không một lần mở DOM. */
export function addXP(s: RunState, value: number): void { s.xp += value; while (s.xp >= xpRequired(s.level)) { s.xp -= xpRequired(s.level); s.level++; s.pending++; } }
export function drainXP(s: RunState): void { s.xp = Math.max(0, s.xp - B.leechXP); s.player.leechUntil = s.time + B.leechLatch; }
export function upgradeLevel(s: RunState, id: UpgradeId): number { return UPGRADES[id].kind === 'module' ? s.modules[id as ModuleId] ?? 0 : s.supports[id as SupportId] ?? 0; }
/** Lọc trước: loại đạt trần/không còn ô không thể lọt vào reroll hay catalog status. */
export function availableUpgrades(s: RunState): UpgradeId[] {
  return (Object.keys(UPGRADES) as UpgradeId[]).filter(id => {
    const d = UPGRADES[id], level = upgradeLevel(s, id), used = Object.values(d.kind === 'module' ? s.modules : s.supports).filter(n => n && n > 0).length;
    return level < d.max && (d.kind === 'module' || level > 0 || used < STAT_LIMITS.supportSlots);
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
  s.swapCandidate = undefined;
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
  if (s.phase !== 'choosingUpgrade' || s.swapCandidate || draftId !== s.draftId || s.rerollsRemaining !== 1) return false;
  s.rerollsRemaining = 0; s.choices = draft(s, rng, s.choices); return true;
}
export function chooseUpgrade(s: RunState, id: UpgradeId, rng: () => number, draftId = s.draftId): boolean {
  if (s.phase !== 'choosingUpgrade' || s.swapCandidate || draftId !== s.draftId || !s.choices.includes(id) || !availableUpgrades(s).includes(id)) return false;
  if (UPGRADES[id].kind === 'module' && !s.modules[id as ModuleId] && Object.values(s.modules).filter(Boolean).length >= STAT_LIMITS.moduleSlots) { s.swapCandidate = id as ModuleId; return true; }
  const beforeHP = shipStats(s).maxHP, level = upgradeLevel(s, id) + 1;
  // Plasma tiến hóa cùng slot; support thay nguồn bonus, không nhân effective stat cũ.
  if (UPGRADES[id].kind === 'module') s.modules[id as ModuleId] = level; else s.supports[id as SupportId] = level;
  if (id === 'plasma' && level >= 3 && !s.metrics.miniSun) { s.metrics.miniSun = 1; s.metricRevision++; }
  if (id === 'plasma' && level >= 5 && !s.metrics.supernova) { s.metrics.supernova = 1; s.metricRevision++; }
  if (id === 'hull') { s.player.maxHP = shipStats(s).maxHP; s.player.hp = Math.min(s.player.maxHP, s.player.hp + s.player.maxHP - beforeHP); }
  s.picks++; s.cues.push(id === 'plasma' && (level === 3 || level === 5) ? 'evolution' : 'upgrade');
  s.notice = id === 'plasma' ? `Tiến hóa · ${plasmaName(level)}` : `${UPGRADES[id].name} · cấp ${level}`;
  s.noticeUntil = s.time + 3; s.pending--; prepareChoices(s, rng); return true;
}
/** Hủy chỉ bỏ bước chọn ô; không thay thẻ, XP, pending hoặc ngân sách reroll. */
export function cancelSwap(s: RunState): void { s.swapCandidate = undefined; }
/** Giao dịch theo draft/slot: chỉ ô thay về1, guard chặn double action và giữ các nguồn stat khác. */
export function confirmSwap(s: RunState, old: ModuleId, rng: () => number, draftId = s.draftId): boolean {
  const next = s.swapCandidate;
  if (s.phase !== 'choosingUpgrade' || draftId !== s.draftId || !next || next === old || !s.modules[old] || s.modules[next] || !s.choices.includes(next) || !availableUpgrades(s).includes(next)) return false;
  clearModuleAttacks(s, old); s.modules = Object.fromEntries(Object.entries(s.modules).map(([id, level]) => id === old ? [next, 1] : [id, level]));
  // Chờ đủ một cadence đầu tiên: cancel/confirm không tạo burst miễn phí.
  const stats = shipStats(s);
  if (next === 'plasma') s.nextPlasma = s.time + attackInterval(PLASMA[0].cooldown, stats);
  if (next === 'well') s.nextWell = s.time + attackInterval(WELLS[0].cooldown, stats);
  if (next === 'pulsar') s.nextPulsar = s.time + attackInterval(PULSAR[0].cooldown, stats);
  if (next === 'ion') s.nextIon = s.time + attackInterval(ION[0].cooldown, stats);
  if (next === 'drones') for (const e of s.enemies) e.nextDroneHit = s.time + attackInterval(DRONES[0].cooldown, stats);
  s.picks++; s.pending--; s.cues.push('upgrade'); s.notice = `${UPGRADES[old].name} → ${UPGRADES[next].name} · cấp 1`; s.noticeUntil = s.time + 3;
  prepareChoices(s, rng); return true;
}
/** Formatter chung cho catalog/build/tooltip; interval là giây thực sau rate. */
export function moduleDescription(id: ModuleId, level: number, stats: ShipStats = calculateStats()): string {
  const damage = (n: number): string => numberText(n * stats.outgoing), interval = (n: number): string => numberText(attackInterval(n, stats));
  if (id === 'plasma') { const d = PLASMA[level - 1]; return `${plasmaName(level)} · ${damage(d.damage)} sát thương · nhịp ${interval(d.cooldown)} giây · tầm ${d.range} u${d.blast ? ` · nổ ${d.blast} u, một hit/mục tiêu` : ''}`; }
  if (id === 'drones') { const d = DRONES[level - 1]; return `${d.count} drone · ${damage(d.damage)} sát thương/mục tiêu/${interval(d.cooldown)} giây · quỹ đạo ${d.radius} u`; }
  if (id === 'pulsar') { const d = PULSAR[level - 1]; return `Quét 360° · ${damage(d.damage)} sát thương · tầm ${unitText(d.range, 'u')} · quét ${unitText(d.duration, 'giây')} · nhịp ${interval(d.cooldown)} giây · một hit/mục tiêu/pulse`; }
  if (id === 'ion') { const d = ION[level - 1]; return `${damage(d.damage)} sát thương đầu · tối đa ${d.targets} mục tiêu · mỗi bước ×${numberText(d.falloff)} · tầm ${unitText(d.range, 'u')}, chuyền ${unitText(d.jumpRange, 'u')} · nhịp ${interval(d.cooldown)} giây`; }
  const d = WELLS[level - 1]; return `Hút quái ${unitText(d.duration, 'giây')} · nổ ${damage(d.damage)} · vùng ${unitText(d.radius, 'u')} · nhịp ${interval(d.cooldown)} giây`;
}
export function upgradeDescription(id: UpgradeId, level: number, s?: RunState): string {
  if (UPGRADES[id].kind === 'module') return moduleDescription(id as ModuleId, Math.min(UPGRADES[id].max, level + 1), s ? shipStats(s) : undefined);
  const support = id as SupportId, d = SUPPORTS[support], current = s?.supports ?? { [id]: level };
  const before = calculateStats(s?.characterId, current, s?.corruption, s?.salvage.bonuses), after = calculateStats(s?.characterId, { ...current, [id]: Math.min(d.max, level + 1) }, s?.corruption, s?.salvage.bonuses);
  const key = { power: 'outgoing', haste: 'attackRate', hull: 'maxHP', engine: 'moveSpeed', magnet: 'pickupRadius', armor: 'reduction' } as const;
  const percent = id === 'power' || id === 'haste' || id === 'armor', unit = id === 'hull' ? 'HP' : id === 'engine' ? 'u/s' : id === 'magnet' ? 'u' : '%';
  return `${numberText(before[key[support]] * (percent ? 100 : 1))} → ${numberText(after[key[support]] * (percent ? 100 : 1))} ${unit} · hỗ trợ ${numberText(supportBonus({ ...current, [id]: level + 1 }, support) * 100)}%/${d.cap * 100}% · mỗi cấp +${d.increment * 100}${id === 'armor' ? ' điểm %' : '% base'}${id === 'haste' ? ' · interval ÷ rate' : ''}`;
}
