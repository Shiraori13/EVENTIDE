import { buildOverview } from './BuildView';
import { assetURL, type AssetId } from '../../assets/manifest';
import { ACHIEVEMENTS, CHARACTERS } from '../config/progression';
import { achievementValue } from '../config/achievements';
import { emptySalvage, type SalvageBonuses, type SalvageStat } from '../config/salvage';
import { UPGRADES, MODULE_ROLES, moduleName, type ModuleId, type SupportId, type UpgradeId } from '../config/content';
import { calculateStats, shipStats, supportBonus, type ShipStats } from '../core/stats';
import type { RunState, SaveData } from '../core/types';
import { moduleDescription, upgradeDescription, upgradeLevel } from '../systems/ExperienceSystem';
import { numberText as n, percentText as pct } from './format';
import { BALANCE as B } from '../config/balance';
import { coreHP, appearanceForCoreLevel } from '../config/beacon';
const icon = (id: string): string => `<img class="content-icon" src="${assetURL(id as AssetId)}" alt="">`;
function statTable(s: ShipStats, supports: Partial<Record<SupportId, number>> = {}, gear: SalvageBonuses = emptySalvage(), mastery: SalvageBonuses = emptySalvage()): string {
  const bonus = (id: SupportId): string => `+${pct(supportBonus(supports, id))}`, salvage = (id: SalvageStat): string => `+${n(gear[id] / 100)}%`;
  const rows = [
    ['HP tối đa', `${n(s.baseHP)} HP`, bonus('hull'), salvage('hp'), '—', `${n(s.maxHP)} HP`],
    ['Sát thương chung', '100%', bonus('power'), salvage('damage'), `Corruption × ${n(s.corruption)} · sự kiện × ${n(s.eventOutgoing)}`, `${pct(s.outgoing)}`],
    ['Tốc độ tấn công', '100%', bonus('haste'), salvage('rate'), 'Nhịp gốc ÷ hệ số tốc độ', pct(s.attackRate)],
    ['Tốc độ bay', `${n(s.baseSpeed)} u/s`, bonus('engine'), salvage('speed'), 'Lực môi trường tính riêng', `${n(s.moveSpeed)} u/s`],
    ['Bán kính nhặt', `${n(s.basePickup)} u`, bonus('magnet'), salvage('pickup'), 'Gravity không hút XP', `${n(s.pickupRadius)} u`],
    ['Giảm sát thương', '0%', bonus('armor'), '—', `Corruption × ${n(s.corruption)}`, `${pct(s.reduction)} giáp · nhận ${pct(s.incoming)} ST`],
  ];
  const keys = ['hp','damage','rate','speed','pickup'] as const; rows.forEach((r,i) => r.splice(4,0,i < keys.length ? `+${n(mastery[keys[i]]/100)}%` : '—'));
  return `<div class="table-scroll"><table class="stats-table"><caption>Chỉ số phi thuyền</caption><thead><tr>${['Chỉ số', 'Gốc', 'Hỗ trợ', 'Trang bị', 'Mastery', 'Tạm thời / ghi chú', 'Hiệu lực'].map(v => `<th>${v}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted">Hỗ trợ, trang bị và mastery cộng trên chỉ số gốc, reset mỗi lượt. Beacon Core chỉ tăng HP Beacon.</p>`;
}
export function shipPanel(save: SaveData): string {
  const character = CHARACTERS[save.characterId];
  return `${icon(character.icon)}<h3>${character.name}</h3><p>${character.description}</p><p>Module khởi đầu: ${UPGRADES[character.starter].name}.</p>${statTable(calculateStats(save.characterId))}<button class="secondary" data-action="read-catalog">Danh mục nâng cấp</button>`;
}
export function buildPanel(s: RunState): string {
  return buildOverview(s,statTable(shipStats(s),s.supports,s.salvage.bonuses,s.masteryBonus));
}
export function catalogPanel(s?: RunState): string {
  const stats = s ? shipStats(s) : calculateStats();
  const groups = ['Vũ khí chính','Vũ khí phụ','Vũ khí bổ sung','Hỗ trợ chỉ số'];
  return '<p>Ba ô module, không ép mỗi vai trò một ô. Hai ô hỗ trợ là chỉ số riêng. Thay vũ khí chỉ qua nút chủ động trong draft.</p><p>Concept: Plasma → Mini Sun (3) → Supernova (5); Pulsar 5 + Ion 5 → Quasar 5. Mở rộng beta: Drones 5 → Orbital Bastion; Well 5 → Singularity Well. Giữ ID, cấp và ô.</p>' + groups.map(group => '<h3>' + group + '</h3><div class="catalog-grid">' + (Object.keys(UPGRADES) as UpgradeId[]).filter(id => UPGRADES[id].kind === 'support' ? group === 'Hỗ trợ chỉ số' : MODULE_ROLES[id as ModuleId] === group).map(id => {
    const d = UPGRADES[id], level = s ? upgradeLevel(s,id) : 0, fused = id === 'quasar';
    return '<article class="catalog-item">' + icon(d.icon) + '<h4>' + d.name + '</h4><p>' + (fused ? 'Chỉ hợp nhất Pulsar 5 + Ion 5, tạo cấp 5 ngay.' : 'Tối đa cấp 5') + (s ? ' · đang sở hữu cấp ' + level + (level===d.max?' · Đã tối đa':level>0?' · Đang phát triển':fused?' · Chưa đủ điều kiện':' · Chưa lắp') : '') + '</p><ol>' + (fused ? [5] : [1,2,3,4,5]).map(n => '<li>' + (d.kind === 'module' ? moduleName(id as ModuleId,n) + ': ' + moduleDescription(id as ModuleId,n,stats) : upgradeDescription(id,n-1)) + '</li>').join('') + '</ol></article>';
  }).join('') + '</div>').join('');
}
export type AchievementFilter = 'all' | 'unlocked' | 'locked';
export function achievementsPanel(save: SaveData, filter: AchievementFilter = 'all', group = 'all'): string {
  const groups = [...new Set(ACHIEVEMENTS.map(a => a.group))], unlocked = save.unlockedAchievements;
  const visible = ACHIEVEMENTS.filter(a => (filter === 'all' || unlocked.includes(a.id) === (filter === 'unlocked')) && (group === 'all' || a.group === group));
  return `<p>Tổng Hollowborn: <strong id="career-total">${n(save.careerKills)}</strong> · ${unlocked.length} / ${ACHIEVEMENTS.length} huy hiệu. Huy hiệu không cộng chỉ số hoặc tiền.</p><p class="muted">Tiến trình được lưu trên trình duyệt này. Các mục mới bắt đầu theo dõi từ 1.3.</p><div class="achievement-filters" aria-label="Lọc thành tựu">${([['all', 'Tất cả'], ['unlocked', 'Đã đạt'], ['locked', 'Chưa đạt']] as const).map(([id, label]) => `<button class="secondary" data-action="achievement-filter" data-filter="${id}" aria-pressed="${filter === id}">${label}</button>`).join('')}<label>Nhóm <select aria-label="Nhóm thành tựu" data-achievement-group><option value="all">Tất cả nhóm</option>${groups.map(g => `<option ${group === g ? 'selected' : ''}>${g}</option>`).join('')}</select></label></div><p>${visible.length} thành tựu đang hiển thị</p>${groups.filter(g => visible.some(a => a.group === g)).map(g => `<h3>${g}</h3><div class="achievement-grid">${visible.filter(a => a.group === g).map(a => {
    const value = Math.min(achievementValue(save, a.metric), a.target), scale = a.metric === 'salvageBudgetBP' ? 100 : 1, achieved = unlocked.includes(a.id);
    return `<article class="achievement-card ${achieved ? 'unlocked' : ''}"><div class="achievement-title">${icon(a.icon)}<h4>${a.name}</h4></div><p>${achieved ? 'Đã đạt' : 'Chưa đạt'} · ${n(value / scale)} / ${n(a.target / scale)} ${a.unit}</p><progress value="${value}" max="${a.target}" aria-label="${a.name}"></progress><p class="muted">${a.description}</p></article>`;
  }).join('')}</div>`).join('')}`;
}
/** Preview là view model thuần; purchase dùng expectedLevel tại action để chặn stale/double click. */
export function beaconPanel(save: SaveData): string {
  const level = save.coreLevel, cost = B.corePrices[level], next = cost === undefined ? level : level + 1, currentHP = coreHP(level), afterHP = coreHP(next);
  const model = (value: number, label: string): string => `<figure class="beacon-model"><figcaption>${label} · cấp ${value}</figcaption><img src="${assetURL(appearanceForCoreLevel(value))}" alt="Beacon cấp ${value}"><span>${n(coreHP(value))} HP</span></figure>`;
  const rows = [
    ['Cấp Core / bonus HP', `${level} / ${B.corePrices.length} · +${pct(B.coreHPBonus * level)}`, next === level ? 'Đã tối đa' : `${next} / ${B.corePrices.length} · +${pct(B.coreHPBonus * next)}`],
    ['HP cơ bản', `${n(B.beaconHP)} HP`, 'Không đổi'],
    ['HP tối đa', `${n(currentHP)} HP`, next === level ? 'Đã tối đa' : `${n(afterHP)} HP (+${n(afterHP - currentHP)})`],
    ['Bán kính vùng sáng', `${n(B.lightRadius)} u`, 'Không đổi'],
    ['Sạc đầy', `${n(B.duration)} giây · ${n(100 / B.duration)}%/giây`, 'Không đổi'],
    ['Hồi cho tàu trong sáng', `${n(B.healing)} HP/giây`, 'Không đổi'],
    ['Giảm tốc quái thường', pct(1 - B.lightSlow), 'Không đổi'],
    ['Beacon tự hồi', 'Không có', 'Không đổi'],
  ];
  return `<div class="core-header"><p>Cấp ${level} / ${B.corePrices.length}</p><p class="currency">${icon('pure')} Ví: <strong id="core-wallet">${n(save.currency)}</strong> Stardust tinh khiết</p></div><div class="beacon-models">${model(level, next === level ? 'Model hoàn thiện' : 'Hiện tại')}${next === level ? '' : model(next, 'Sau nâng cấp')}</div><div class="table-scroll"><table class="stats-table"><caption>Chỉ áp dụng từ lượt chơi mới</caption><thead><tr><th>Chỉ số Beacon</th><th>Hiện tại</th><th>Sau nâng cấp</th></tr></thead><tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export function beaconAffordability(save: SaveData): string {
  const cost = B.corePrices[save.coreLevel], current = coreHP(save.coreLevel);
  return cost === undefined ? 'Beacon Core đã đạt cấp tối đa.' : `${n(current)} → ${n(coreHP(save.coreLevel + 1))} HP (+${n(coreHP(save.coreLevel + 1) - current)}) · ${n(save.currency)} / ${n(cost)} tinh khiết${save.currency < cost ? ` · còn thiếu ${n(cost - save.currency)}` : ' · đủ để nâng cấp'}`;
}
