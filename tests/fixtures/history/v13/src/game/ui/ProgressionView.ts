import { assetURL, type AssetId } from '../../assets/manifest';
import { ACHIEVEMENTS, CHARACTERS, SUPPORTS } from '../config/progression';
import { UPGRADES, plasmaName, type ModuleId, type SupportId, type UpgradeId } from '../config/content';
import { calculateStats, shipStats, supportBonus, type ShipStats } from '../core/stats';
import type { RunState, SaveData } from '../core/types';
import { availableUpgrades, moduleDescription, numberText as n, upgradeDescription, upgradeLevel } from '../systems/ExperienceSystem';
const icon = (id: string): string => `<img class="content-icon" src="${assetURL(id as AssetId)}" alt="">`;
function statTable(s: ShipStats): string {
  const rows = [
    ['HP tối đa', `${s.baseHP} HP`, `+${n(s.hpBonus * 100)}%`, '—', `${n(s.maxHP)} HP`],
    ['Sát thương chung', '100% cơ bản', `+${n(s.damageBonus * 100)}%`, `Corruption ×${s.corruption}`, `${n(s.outgoing * 100)}%`],
    ['Tốc độ tấn công', '100%', `+${n(s.rateBonus * 100)}%`, 'Nhịp gốc ÷ hệ số tốc độ', `${n(s.attackRate * 100)}%`],
    ['Tốc độ bay', `${s.baseSpeed} u/s`, `+${n(s.speedBonus * 100)}%`, 'Lực môi trường tính riêng', `${n(s.moveSpeed)} u/s`],
    ['Bán kính nhặt', `${s.basePickup} u`, `+${n(s.pickupBonus * 100)}%`, 'Không hút XP bằng gravity', `${n(s.pickupRadius)} u`],
    ['Giảm sát thương', '0% giáp', `+${n(s.reduction * 100)} điểm %`, `Corruption ×${s.corruption}`, `${n(s.reduction * 100)}% giáp · nhận ${n(s.incoming * 100)}% ST`],
  ];
  return `<div class="table-scroll"><table class="stats-table"><caption>Chỉ số phi thuyền</caption><thead><tr><th>Chỉ số</th><th>Gốc</th><th>Hỗ trợ</th><th>Tạm thời / ghi chú</th><th>Hiệu lực</th></tr></thead><tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted">Sát thương từng module ở chi tiết; bonus hỗ trợ cộng trên chỉ số gốc và reset mỗi lượt. Beacon Core chỉ tăng HP Beacon.</p>`;
}
export function shipPanel(save: SaveData): string {
  const character = CHARACTERS[save.characterId];
  return `${icon(character.icon)}<h3>${character.name}</h3><p>${character.description}</p><p>Module khởi đầu: ${UPGRADES[character.starter].name}.</p>${statTable(calculateStats(save.characterId))}<button class="secondary" data-action="read-catalog">Danh mục nâng cấp</button>`;
}
export function buildPanel(s: RunState): string {
  const modules = (['plasma', 'drones', 'well'] as ModuleId[]).map(id => {
    const level = s.modules[id]; return `<article class="catalog-item">${level ? `${icon(UPGRADES[id].icon)}<h3>${id === 'plasma' ? plasmaName(level) : UPGRADES[id].name} · cấp ${level}</h3><p>${moduleDescription(id, level, shipStats(s))}</p>` : '<h3>Ô module trống</h3>'}</article>`;
  });
  const supports = (Object.keys(s.supports) as SupportId[]).filter(id => (s.supports[id] ?? 0) > 0);
  const slots = supports.map(id => `<article class="catalog-item">${icon(SUPPORTS[id].icon)}<h3>${SUPPORTS[id].name} · cấp ${s.supports[id]}</h3><p>Bonus ${n(supportBonus(s.supports, id) * 100)}% / trần ${SUPPORTS[id].cap * 100}%</p></article>`);
  while (slots.length < 2) slots.push('<article class="catalog-item"><h3>Ô hỗ trợ trống</h3><p>Có thể chọn một trong sáu loại hỗ trợ khi lên cấp.</p></article>');
  return `<p>${CHARACTERS[s.characterId].name} · Cấp ${s.level} · HP ${n(Math.max(0, s.player.hp))}/${n(s.player.maxHP)} · ${s.picks} lựa chọn đã nhận</p><h3>Ba ô module</h3><div class="catalog-grid">${modules.join('')}</div><h3>Hai ô hỗ trợ</h3><div class="catalog-grid">${slots.join('')}</div>${statTable(shipStats(s))}<div class="actions"><button class="secondary" data-action="read-catalog">Danh mục nâng cấp</button><button class="secondary" data-action="read-achievements">Thành tựu</button></div>`;
}
export function catalogPanel(s?: RunState): string {
  const valid = s ? availableUpgrades(s) : [], stats = s ? shipStats(s) : calculateStats();
  return `<p>Chỉ tra cứu. Module: ba ô; hỗ trợ: chọn tối đa hai loại. Không thể mua hoặc nhận thẻ tại đây.</p>${(['module', 'support'] as const).map(kind => `<h3>${kind === 'module' ? 'Module · Tiến hóa giữ cùng ô' : 'Hỗ trợ chỉ số · Bonus reset mỗi lượt'}</h3><div class="catalog-grid">${(Object.keys(UPGRADES) as UpgradeId[]).filter(id => UPGRADES[id].kind === kind).map(id => {
    const d = UPGRADES[id], level = s ? upgradeLevel(s, id) : 0;
    const status = !s ? '' : level >= d.max ? 'Đã đạt trần' : level > 0 ? 'Đã sở hữu' : valid.includes(id) ? 'Chưa sở hữu' : 'Không còn ô';
    return `<article class="catalog-item">${icon(d.icon)}<h4>${d.name}</h4><p>Cấp tối đa ${d.max}${status ? ` · ${status} · cấp ${level}` : ''}</p><ol>${Array.from({ length: d.max }, (_, i) => `<li>${kind === 'module' ? moduleDescription(id as ModuleId, i + 1, stats) : upgradeDescription(id, i)}</li>`).join('')}</ol></article>`;
  }).join('')}</div>`).join('')}`;
}
export function achievementsPanel(save: SaveData): string {
  return `<p>Tổng Hollowborn đã tiêu diệt: <strong id="career-total">${save.careerKills}</strong>. Bắt đầu theo dõi từ1.2; huy hiệu không cộng chỉ số hoặc tiền.</p><div class="catalog-grid">${ACHIEVEMENTS.map(a => `<article class="catalog-item ${save.unlockedAchievements.includes(a.id) ? 'unlocked' : ''}">${icon(a.icon)}<h3>${a.name}</h3><p>${save.unlockedAchievements.includes(a.id) ? 'Đã đạt' : 'Chưa đạt'} · ${Math.min(save.careerKills, a.target)} / ${a.target} quái</p><progress value="${Math.min(save.careerKills, a.target)}" max="${a.target}" aria-label="${a.name}"></progress><p>${a.description}</p></article>`).join('')}</div><p class="muted">Tự lưu tối đa mỗi5 giây mô phỏng và tại mốc/pause/kết quả/về menu. Crash có thể mất phần chưa flush; không resume lượt cũ.</p>`;
}
