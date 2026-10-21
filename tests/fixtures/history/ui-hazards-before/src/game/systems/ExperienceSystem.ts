import { BALANCE as B } from '../config/balance';
import { DRONES, PLASMA, UPGRADES, WELLS, PULSAR, ION, QUASAR, MODULE_IDS, moduleName, plasmaName, type ChoiceId, type UpgradeId, type ModuleId, type SupportId } from '../config/content';
import { SUPPORTS, STAT_LIMITS } from '../config/progression';
import { MASTERY, MASTERY_IDS, masteryStat, masteryUsed, type MasteryId } from '../config/mastery';
import { SALVAGE } from '../config/salvage';
import { attackInterval, calculateStats, shipStats, supportBonus, type ShipStats } from '../core/stats';
import type { RunState } from '../core/types';
import { isBasicBuildComplete } from '../core/buildProgress';
import { clearModuleAttacks } from './ModuleLifecycle';
import { numberText, unitText } from '../ui/format';
export { numberText } from '../ui/format';
export const xpRequired = (level: number): number => B.xpBase + (level - 1) * B.xpGrowth;
/** XP dư và mỗi pending là một giao dịch độc lập. */
export function addXP(s: RunState, value: number): void { s.xp += value; while (s.xp >= xpRequired(s.level)) { s.xp -= xpRequired(s.level); s.level++; s.pending++; } }
export function drainXP(s: RunState): void { s.xp = Math.max(0, s.xp - B.leechXP); s.player.leechUntil = s.time + B.leechLatch; }
export const isMastery = (id: ChoiceId): id is MasteryId => id.startsWith('mastery-');
export type DraftAction = 'acquire' | 'level' | 'support' | 'mastery' | 'recover';
export function actionKind(s: RunState, id: ChoiceId): DraftAction { return id === 'recover' ? 'recover' : isMastery(id) ? 'mastery' : UPGRADES[id].kind === 'support' ? 'support' : s.modules[id as ModuleId] ? 'level' : 'acquire'; }
export function upgradeLevel(s: RunState, id: ChoiceId): number { return id === 'recover' ? 0 : isMastery(id) ? s.masteryBonus[masteryStat(id)] / MASTERY.stepBP : UPGRADES[id].kind === 'module' ? s.modules[id as ModuleId] ?? 0 : s.supports[id as SupportId] ?? 0; }
/** Snapshot tương thích debug cũ, không latch: slot đổi phải tính lại; bonus/budget đã kiếm luôn giữ. */
export function refreshMastery(s: RunState): void { s.weaponMasteryReached = isBasicBuildComplete(s); }
/** Replacement có action riêng; tuyệt đối không dùng làm fallback của draft/reroll. */
export function availableUpgrades(s: RunState): UpgradeId[] {
  if (isBasicBuildComplete(s)) return [];
  return (Object.keys(UPGRADES) as UpgradeId[]).filter(id => {
    if (id === 'quasar' || (s.modules.quasar && (id === 'pulsar' || id === 'ion'))) return false;
    const d = UPGRADES[id], level = upgradeLevel(s, id), used = Object.values(d.kind === 'module' ? s.modules : s.supports).filter(Boolean).length;
    return level < d.max && (level > 0 || used < (d.kind === 'module' ? STAT_LIMITS.moduleSlots : STAT_LIMITS.supportSlots));
  });
}
export function availableChoices(s: RunState): ChoiceId[] {
  if (!isBasicBuildComplete(s)) {
    const normal = availableUpgrades(s);
    if (normal.length) return normal;
    // Lỗi config không được giả thành mastery hay khóa người chơi; chỉ báo dev khi dựng/refresh draft.
    return ['recover'];
  }
  const remaining = MASTERY.budgetBP - masteryUsed(s.masteryBonus);
  const stats = MASTERY_IDS.filter(id => remaining >= MASTERY.stepBP && s.masteryBonus[masteryStat(id)] + MASTERY.stepBP <= MASTERY.caps[masteryStat(id)]);
  return stats.length ? stats : ['recover'];
}
export function availableReplacements(s: RunState): ModuleId[] { return MODULE_IDS.filter(id => id !== 'quasar' && !s.modules[id] && !(s.modules.quasar && (id === 'pulsar' || id === 'ion'))); }
function draft(s: RunState, rng: () => number, old: ChoiceId[] = []): ChoiceId[] {
  const pool = [...availableChoices(s)]; for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const fresh = pool.filter(id => !old.includes(id)), candidates = fresh.length >= 3 ? fresh : [...fresh, ...pool.filter(id => old.includes(id))], result: ChoiceId[] = [];
  for (const kind of ['module', 'support']) { const id = candidates.find(x => x !== 'recover' && !isMastery(x) && UPGRADES[x].kind === kind); if (id) result.push(id); }
  for (const id of candidates) if (!result.includes(id) && result.length < 3) result.push(id);
  return result;
}
export function prepareChoices(s: RunState, rng: () => number): void {
  s.swapCandidate = undefined; s.swapSelecting = false; refreshMastery(s);
  if (s.pending > 0) { s.draftId++; s.choices = draft(s, rng); reportEmptyBasePool(s); s.rerollsRemaining = s.choices[0] === 'recover' ? 0 : 1; s.phase = 'choosingUpgrade'; return; }
  s.choices = []; s.rerollsRemaining = 0; s.phase = 'playing';
}
function reportEmptyBasePool(s: RunState): void {
  if (!isBasicBuildComplete(s) && s.choices[0] === 'recover') {
    s.notice = 'Chưa thể tạo nâng cấp cơ sở. Có thể tiếp tục an toàn.'; s.noticeUntil=s.time+4;
    if (import.meta.env.DEV || import.meta.env.MODE === 'benchmark') console.error('[draft] Base incomplete with empty eligible pool',s.modules,s.supports);
  }
}
/** Mutation chỉ làm mới thẻ từ state vừa commit, không đổi draft ID/XP queue/ngân sách reroll. */
export function refreshDraftAfterFusion(s: RunState, rng: () => number): void {
  refreshMastery(s); if (!s.pending || !s.choices.length) return;
  const valid=availableChoices(s);
  if (s.choices.some(id=>!valid.includes(id))) { s.choices=draft(s,rng); reportEmptyBasePool(s); }
}
export function rerollReason(s: RunState): string {
  if (!s.rerollsRemaining) return 'Đã dùng lượt đổi hoặc chỉ có phục hồi.';
  return availableChoices(s).some(id=>!s.choices.includes(id)) ? '' : 'Không còn lựa chọn khác trong pool hợp lệ.';
}
export function rerollChoices(s: RunState, rng: () => number, draftId = s.draftId): boolean {
  if (s.phase !== 'choosingUpgrade' || s.swapSelecting || draftId !== s.draftId) return false;
  if (s.choices.some(id=>!availableChoices(s).includes(id))) {
    refreshDraftAfterFusion(s,rng);s.notice='Build đã đổi; lựa chọn đã được cập nhật, chưa tiêu lượt.';s.noticeUntil=s.time+4;return false;
  }
  if (rerollReason(s)) return false;
  s.rerollsRemaining = 0; s.choices = draft(s, rng, s.choices); return true;
}
export function chooseUpgrade(s: RunState, id: ChoiceId, rng: () => number, draftId = s.draftId): boolean {
  if (s.phase !== 'choosingUpgrade' || s.swapSelecting || draftId !== s.draftId || !s.choices.includes(id)) return false;
  if (!availableChoices(s).includes(id)) {
    refreshDraftAfterFusion(s,rng); s.notice='Build đã đổi; lựa chọn đã được cập nhật, chưa tiêu lượt.'; s.noticeUntil=s.time+4; return false;
  }
  const beforeHP = shipStats(s).maxHP;
  if (id === 'recover') { s.player.hp = Math.min(s.player.maxHP, s.player.hp + B.fallbackHeal); s.notice = 'Phục hồi / tiếp tục'; }
  else if (isMastery(id)) {
    // 2%=200bp. Cap riêng và tổng ngân sách; không nhân trên effective hoặc chạm nguồn khác.
    s.masteryBonus[masteryStat(id)] += MASTERY.stepBP; s.notice = choiceName(s, id);
  } else {
    const level = upgradeLevel(s, id) + 1;
    if (UPGRADES[id].kind === 'module') s.modules[id as ModuleId] = level; else s.supports[id as SupportId] = level;
    if (id === 'plasma' && level >= 3 && !s.metrics.miniSun) { s.metrics.miniSun = 1; s.metricRevision++; }
    if (id === 'plasma' && level >= 5 && !s.metrics.supernova) { s.metrics.supernova = 1; s.metricRevision++; }
    s.notice = UPGRADES[id].kind === 'module' ? moduleName(id as ModuleId, level) : UPGRADES[id].name;
  }
  s.player.maxHP = shipStats(s).maxHP; s.player.hp = Math.min(s.player.maxHP, s.player.hp + Math.max(0, s.player.maxHP - beforeHP));
  s.buildRevision++; s.picks++; s.cues.push(id === 'plasma' && [3,5].includes(s.modules.plasma ?? 0) ? 'evolution' : 'upgrade');
  s.noticeUntil = s.time + 3; s.pending--; prepareChoices(s, rng); return true;
}
export function beginReplacement(s: RunState, next?: ModuleId, draftId = s.draftId): boolean {
  if (s.phase !== 'choosingUpgrade' || draftId !== s.draftId || !s.pending || !Object.values(s.modules).some(Boolean) || (next && !availableReplacements(s).includes(next))) return false;
  s.swapSelecting = true; s.swapCandidate = next; return true;
}
export function cancelSwap(s: RunState): void { s.swapCandidate = undefined; s.swapSelecting = false; }
/** Giao dịch chủ động mất một pending; bonus/budget mastery giữ nguyên khi mở lại progression. */
export function confirmSwap(s: RunState, old: ModuleId, rng: () => number, draftId = s.draftId): boolean {
  const next = s.swapCandidate;
  if (s.phase !== 'choosingUpgrade' || !s.swapSelecting || draftId !== s.draftId || !s.pending || !next || !s.modules[old] || !availableReplacements(s).includes(next)) return false;
  clearModuleAttacks(s, old); s.modules = Object.fromEntries(Object.entries(s.modules).map(([id, level]) => id === old ? [next, 1] : [id, level])); s.buildRevision++; refreshMastery(s);
  const stats = shipStats(s);
  if (next === 'plasma') s.nextPlasma = s.time + attackInterval(PLASMA[0].cooldown, stats);
  if (next === 'well') s.nextWell = s.time + attackInterval(WELLS[0].cooldown, stats);
  if (next === 'pulsar') s.nextPulsar = s.time + attackInterval(PULSAR[0].cooldown, stats);
  if (next === 'ion') s.nextIon = s.time + attackInterval(ION[0].cooldown, stats);
  if (next === 'drones') for (const e of s.enemies) e.nextDroneHit = s.time + attackInterval(DRONES[0].cooldown, stats);
  s.picks++; s.pending--; s.cues.push('upgrade'); s.notice = UPGRADES[old].name + ' → ' + UPGRADES[next].name + ' · cấp 1'; s.noticeUntil = s.time + 3;
  prepareChoices(s, rng); return true;
}
export function choiceName(s: RunState, id: ChoiceId): string { return id === 'recover' ? (s.player.hp < s.player.maxHP ? 'Hồi tối đa 10 HP' : 'Tiếp tục · không penalty') : isMastery(id) ? SALVAGE.stats[masteryStat(id)].name + ' +2%' : UPGRADES[id].kind === 'module' ? moduleName(id as ModuleId, Math.min(5, upgradeLevel(s,id)+1)) : UPGRADES[id].name; }
export function choiceIcon(id: ChoiceId): string { return id === 'recover' ? 'hull' : isMastery(id) ? ({damage:'power',rate:'haste',hp:'hull',pickup:'magnet',speed:'engine'} as const)[masteryStat(id)] : UPGRADES[id].icon; }
export function choiceDescription(s: RunState, id: ChoiceId): string {
  if (id === 'recover') return 'Hồi ' + numberText(Math.min(B.fallbackHeal, s.player.maxHP - s.player.hp)) + ' HP. Tiêu đúng một lựa chọn; giữ XP dư và các level đang chờ.';
  if (!isMastery(id)) return upgradeDescription(id, upgradeLevel(s,id),s);
  const stat = masteryStat(id), before = shipStats(s), after = calculateStats(s.characterId,s.supports,s.corruption,s.salvage.bonuses,{...s.masteryBonus,[stat]:s.masteryBonus[stat]+MASTERY.stepBP},before.eventOutgoing);
  const key = {damage:'outgoing',rate:'attackRate',hp:'maxHP',pickup:'pickupRadius',speed:'moveSpeed'} as const;
  return numberText(before[key[stat]]) + ' → ' + numberText(after[key[stat]]) + (stat === 'hp' ? ' HP' : stat === 'speed' ? ' u/s' : stat === 'pickup' ? ' u' : ' × gốc') + ' · mastery ' + numberText(s.masteryBonus[stat]/100) + ' → ' + numberText((s.masteryBonus[stat]+MASTERY.stepBP)/100) + '% / ' + MASTERY.caps[stat]/100 + '% · ngân sách ' + masteryUsed(s.masteryBonus)/100 + ' → ' + (masteryUsed(s.masteryBonus)+MASTERY.stepBP)/100 + '% / 20%';
}

/** Formatter chung cho catalog/build/tooltip; interval là giây thực sau rate. */
export function moduleDescription(id: ModuleId, level: number, stats: ShipStats = calculateStats()): string {
  const damage = (n: number): string => numberText(n * stats.outgoing), interval = (n: number): string => numberText(attackInterval(n, stats));
  if (id === 'quasar') return 'Quét 240° · ' + damage(QUASAR.damage) + ' sát thương · tầm ' + QUASAR.range + ' u · ' + numberText(QUASAR.duration) + ' giây · nhịp ' + interval(QUASAR.cooldown) + ' giây · một hit/mục tiêu; tối đa ' + QUASAR.chainTargets + ' tia phụ ×' + numberText(QUASAR.chainFraction) + ', mỗi bước ×' + numberText(QUASAR.falloff) + '; không đánh lại mục tiêu trong pulse.';
  if (id === 'plasma') { const d = PLASMA[level - 1]; return `${plasmaName(level)} · ${damage(d.damage)} sát thương · nhịp ${interval(d.cooldown)} giây · tầm ${d.range} u${d.blast ? ` · nổ ${d.blast} u, một hit/mục tiêu` : ''}`; }
  if (id === 'drones') { const d = DRONES[level - 1]; return `${d.count} drone · ${damage(d.damage)} sát thương/mục tiêu/${interval(d.cooldown)} giây · quỹ đạo ${d.radius} u`; }
  if (id === 'pulsar') { const d = PULSAR[level - 1]; return `Quét 360° · ${damage(d.damage)} sát thương · tầm ${unitText(d.range, 'u')} · quét ${unitText(d.duration, 'giây')} · nhịp ${interval(d.cooldown)} giây · một hit/mục tiêu/pulse`; }
  if (id === 'ion') { const d = ION[level - 1]; return `${damage(d.damage)} sát thương đầu · tối đa ${d.targets} mục tiêu · mỗi bước ×${numberText(d.falloff)} · tầm ${unitText(d.range, 'u')}, chuyền ${unitText(d.jumpRange, 'u')} · nhịp ${interval(d.cooldown)} giây`; }
  const d = WELLS[level - 1]; return `Hút quái ${unitText(d.duration, 'giây')} · nổ ${damage(d.damage)} · vùng ${unitText(d.radius, 'u')} · nhịp ${interval(d.cooldown)} giây`;
}
export function upgradeDescription(id: UpgradeId, level: number, s?: RunState): string {
  if (UPGRADES[id].kind === 'module') return moduleDescription(id as ModuleId, Math.min(UPGRADES[id].max, level + 1), s ? shipStats(s) : undefined);
  const support = id as SupportId, d = SUPPORTS[support], current = s?.supports ?? { [id]: level };
  const before = calculateStats(s?.characterId, current, s?.corruption, s?.salvage.bonuses, s?.masteryBonus, s ? shipStats(s).eventOutgoing : 1), after = calculateStats(s?.characterId, { ...current, [id]: Math.min(d.max, level + 1) }, s?.corruption, s?.salvage.bonuses, s?.masteryBonus, s ? shipStats(s).eventOutgoing : 1);
  const key = { power: 'outgoing', haste: 'attackRate', hull: 'maxHP', engine: 'moveSpeed', magnet: 'pickupRadius', armor: 'reduction' } as const;
  const percent = id === 'power' || id === 'haste' || id === 'armor', unit = id === 'hull' ? 'HP' : id === 'engine' ? 'u/s' : id === 'magnet' ? 'u' : '%';
  return `${numberText(before[key[support]] * (percent ? 100 : 1))} → ${numberText(after[key[support]] * (percent ? 100 : 1))} ${unit} · hỗ trợ ${numberText(supportBonus({ ...current, [id]: level + 1 }, support) * 100)}%/${d.cap * 100}% · mỗi cấp +${d.increment * 100}${id === 'armor' ? ' điểm %' : '% base'}${id === 'haste' ? ' · interval ÷ rate' : ''}`;
}
