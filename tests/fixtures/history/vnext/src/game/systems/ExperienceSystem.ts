import { BALANCE as B } from '../config/balance';
import { DRONES, PLASMA, UPGRADES, WELLS, plasmaName, type UpgradeId, type ModuleId, type SupportId } from '../config/content';
import type { RunState } from '../core/types';
export const xpRequired = (level: number): number => B.xpBase + (level - 1) * B.xpGrowth;
/** Giữ XP dư và xếp hàng từng lựa chọn, kể cả một pickup tăng nhiều cấp. */
export function addXP(s: RunState, value: number): void {
  s.xp += value;
  while (s.xp >= xpRequired(s.level)) { s.xp -= xpRequired(s.level); s.level++; s.pending++; }
}
export function drainXP(s: RunState): void { s.xp = Math.max(0, s.xp - B.leechXP); s.player.leechUntil = s.time + B.leechLatch; }
export function upgradeLevel(s: RunState, id: UpgradeId): number {
  return UPGRADES[id].kind === 'module' ? s.modules[id as ModuleId] ?? 0 : s.supports[id as SupportId] ?? 0;
}
/** Lọc trước khi xáo trộn: không trùng ID, quá cấp hoặc vượt số ô. */
export function availableUpgrades(s: RunState): UpgradeId[] {
  return (Object.keys(UPGRADES) as UpgradeId[]).filter(id => {
    const item = UPGRADES[id], level = upgradeLevel(s, id);
    const used = Object.keys(item.kind === 'module' ? s.modules : s.supports).length;
    return level < item.max && (level > 0 || used < (item.kind === 'module' ? 3 : 2));
  });
}
export function prepareChoices(s: RunState, rng: () => number): void {
  while (s.pending > 0) {
    const pool = availableUpgrades(s);
    if (!pool.length) {
      s.player.hp = Math.min(s.player.maxHP, s.player.hp + B.fallbackHeal); s.pending--;
      s.notice = 'Mọi thiết bị đã tối đa · Hồi 10 HP'; s.noticeUntil = s.time + 3; continue;
    }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    s.choices = pool.slice(0, 3); s.phase = 'choosingUpgrade'; return;
  }
  s.choices = []; s.phase = 'playing';
}
export function chooseUpgrade(s: RunState, id: UpgradeId, rng: () => number): boolean {
  if (s.phase !== 'choosingUpgrade' || !s.choices.includes(id)) return false;
  const level = upgradeLevel(s, id) + 1;
  // Tiến hóa thay chỉ số và hình thái cùng ID plasma, không thêm module/ô mới.
  if (UPGRADES[id].kind === 'module') s.modules[id as ModuleId] = level;
  else s.supports[id as SupportId] = level;
  if (id === 'hull') { s.player.maxHP += B.healthBonus; s.player.hp += B.healthBonus; }
  s.cues.push(id === 'plasma' && (level === 3 || level === 5) ? 'evolution' : 'upgrade');
  s.notice = id === 'plasma' ? `Tiến hóa · ${plasmaName(level)}` : `${UPGRADES[id].name} · cấp ${level}`;
  s.noticeUntil = s.time + 3; s.pending--; prepareChoices(s, rng); return true;
}
export function upgradeDescription(id: UpgradeId, level: number): string {
  const old = Math.max(0, level - 1);
  if (id === 'plasma') { const n = PLASMA[Math.min(level, 4)], p = PLASMA[old]; return `${plasmaName(level + 1)} · sát thương ${p.damage} → ${n.damage} · nhịp ${n.cooldown}s${n.blast ? ` · nổ ${n.blast}u (mỗi mục tiêu một lần)` : ''}`; }
  if (id === 'drones') { const n = DRONES[Math.min(level, 4)]; return `${n.count} drone · ${n.damage} sát thương · quỹ đạo ${n.radius}u · mỗi mục tiêu/${n.cooldown}s`; }
  if (id === 'well') { const n = WELLS[Math.min(level, 4)]; return `Hút quái ${n.duration}s · nổ ${n.damage} · vùng ${n.radius}u · nhịp ${n.cooldown}s`; }
  return id === 'hull' ? `+${B.healthBonus} HP tối đa và HP hiện tại` : `+${B.pickupBonus}u bán kính nhặt · ${B.pickupRadius + (level + 1) * B.pickupBonus}u sau nâng cấp`;
}
