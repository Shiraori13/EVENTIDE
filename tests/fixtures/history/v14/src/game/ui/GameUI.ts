import { assetURL, type AssetId } from '../../assets/manifest';
import { BALANCE as B } from '../config/balance';
import { UPGRADES, plasmaName, type ModuleId, type SupportId, type UpgradeId } from '../config/content';
import type { RunState } from '../core/types';
import { distance } from '../core/math';
import { upgradeDescription, upgradeLevel, xpRequired } from '../systems/ExperienceSystem';
import type { SaveService } from '../services/SaveService';
import { normalizeText } from '../services/FontService';
import { shipPanel, buildPanel, catalogPanel, achievementsPanel, beaconPanel, beaconAffordability, type AchievementFilter } from './ProgressionView';
import { CHARACTERS, ACHIEVEMENTS } from '../config/progression';
import { numberText as n, hpText } from './format';
export interface UIActions { start(): void; menu(): void; pause(): void; resume(): void; choose(id: UpgradeId, draftId: number): void; swap(old: ModuleId, draftId: number): void; cancelSwap(): void; reroll(draftId: number): void; settings(): void }
const image = (id: AssetId, alt = ''): string => `<img src="${assetURL(id)}" alt="${alt}">`;
export const formatTime = (seconds: number): string => `${Math.floor((seconds + 1e-6) / 60).toString().padStart(2, '0')}:${Math.floor((seconds + 1e-6) % 60).toString().padStart(2, '0')}`;
const ECHO = 'Ngày rời cảng, mẹ đưa tôi một hạt giống. “Đừng trồng khi còn tối”, bà nói. Tôi đã mang nó qua mười bảy khoảng không không tên. Hôm nay, trong ánh vàng đầu tiên của Beacon, tôi nhìn thấy một vệt xanh bé nhỏ. Hóa ra, có những thứ vẫn nhớ cách bắt đầu.';
/** Sở hữu overlay và listener bằng AbortController. HUD cập nhật trường, không dựng DOM mỗi frame. */
export class GameUI {
  private listeners = new AbortController();
  private screen = '';
  private hudNodes = new Map<string, HTMLElement>();
  private loadoutKey = '';
  private state?: RunState;
  private nextChoiceInput = 0;
  private readStack: ('ship' | 'build' | 'catalog' | 'achievements')[] = [];
  private autoResumeRead = false;
  private toast = ''; private toastUntil = 0;
  private achievementFilter: AchievementFilter = 'all'; private achievementGroup = 'all'; private nextPurchaseInput = 0;
  constructor(private root: HTMLElement, private save: SaveService, private actions: UIActions) {
    root.addEventListener('click', this.onClick, { signal: this.listeners.signal });
    root.addEventListener('change', this.onChange, { signal: this.listeners.signal });
    window.addEventListener('keydown', this.onKey, { signal: this.listeners.signal });
  }
  private setScreen(key: string, html: string): void {
    this.screen = key; this.hudNodes.clear(); this.loadoutKey = '';
    this.root.innerHTML = normalizeText(html) + '<div id="profile-toast" class="profile-toast" role="status" aria-live="polite" hidden></div><div class="storage-warning" role="status"></div>';
    this.root.querySelectorAll<HTMLElement>('[id]').forEach(el => this.hudNodes.set(el.id, el));
    const warning = this.root.querySelector('.storage-warning'); if (warning) warning.textContent = this.save.warning;
    this.root.querySelector<HTMLElement>('.panel button:not(:disabled), .menu .primary')?.focus({ preventScroll: true });
  }
  menu(): void {
    this.state = undefined;
    this.readStack = []; this.autoResumeRead = false;
    this.setScreen('menu', `<section class="menu"><div class="brand">${image('beacon')} LIGHTKEEPER INITIATIVE <span> / </span> 001</div><div class="menu-body"><div class="eyebrow">Tín hiệu cuối cùng giữa hư vô</div><h1>EVENTIDE</h1><div class="subtitle">Thủy Triều Hư Không</div><div class="rule"></div><div class="tagline">Khi mọi ngôi sao đã tắt,<br>hãy là ánh sáng cuối cùng.</div><p class="description">Hư Vô đã nuốt chửng các nền văn minh. Bạn là ${CHARACTERS[this.save.data.characterId].name}, người giữ hải đăng. Bay vào bóng tối, thu hồi sức mạnh và bảo vệ ánh sáng trong 12 phút.</p><div class="launch"><button class="primary" data-action="start">Khởi hành <span aria-hidden="true">↗</span></button><span>${CHARACTERS[this.save.data.characterId].name.toUpperCase()} / TÀN TÍCH NGÂN HÀ<br>12 PHÚT · SINH TỒN ĐƠN</span></div><nav class="menu-nav" aria-label="Menu"><button class="text-btn" data-action="read-ship">Phi thuyền</button><button class="text-btn" data-action="read-achievements">Thành tựu</button><button class="text-btn" data-action="read-catalog">Danh mục nâng cấp</button><button class="text-btn" data-action="help">Hướng dẫn</button><button class="text-btn" data-action="core">Beacon Core</button><button class="text-btn" data-action="echo">Echo</button><button class="text-btn" data-action="settings">Cài đặt</button></nav></div><aside class="sector"><span class="eyebrow">Khu vực 01 / Mất tín hiệu</span><b>Tàn Tích Ngân Hà</b><p>Một nguồn sáng nhỏ.<br>Một cơ hội để bắt đầu lại.</p></aside><footer class="footer"><span>LOCAL · SINGLE PLAYER · v1.3</span><span class="currency">${image('pure')} ${this.save.data.currency} Stardust tinh khiết</span><span>WASD DI CHUYỂN / TỰ ĐỘNG CHIẾN ĐẤU</span></footer></section>`);
  }
  private modal(key: string, title: string, body: string, actions = '<button class="secondary" data-action="back">Trở về</button>'): void {
    this.setScreen(key, `<div class="overlay"><section class="panel" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="eyebrow">EVENTIDE / LIGHTKEEPER</div><h2 id="modal-title">${title}</h2>${body}<div class="actions">${actions}</div></section></div>`);
  }
  private hudHTML(): string {
    return `<section class="hud" aria-label="Thông tin lượt chơi"><div class="hud-top"><div class="hud-card"><div class="row"><span>${CHARACTERS[this.state?.characterId ?? this.save.data.characterId].name.toUpperCase()} / TÀU CỨU HỘ</span><span id="ship-hp"></span></div><div class="bar"><i id="ship-bar"></i></div></div><div class="charge"><small>BEACON / <span id="charge"></span> SẠC</small><div class="time" id="time"></div></div><div><div class="hud-actions"><button class="icon-btn" data-action="read-build">Build hiện tại · B</button><button class="icon-btn" data-action="mute" id="mute-button">Âm thanh</button><button class="icon-btn" data-action="pause" aria-label="Tạm dừng">Ⅱ Esc</button></div><div class="hud-card"><div class="row"><span>BEACON</span><span id="beacon-hp"></span></div><div class="bar beacon-bar"><i id="beacon-bar"></i></div></div></div></div><div class="boss" id="boss" hidden><span id="boss-phase">ELDER STAR</span><div class="bar"><i id="boss-bar"></i></div></div><div class="alert" id="beacon-alert" hidden>△ Beacon đang bị tấn công · Quay về bảo vệ!</div><div class="notice" id="notice" role="status"></div><div class="beacon-direction" id="direction" hidden></div><div class="hud-bottom"><div><div class="xp-wrap"><div class="row"><span id="level"></span><span id="xp"></span></div><div class="bar"><i id="xp-bar"></i></div></div><span class="eyebrow">Module / Hỗ trợ</span><div class="loadout" id="loadout"></div></div><div class="corruption hud-card"><div class="row"><span>CORRUPTION</span><span id="corruption"></span></div><div class="bar corruption-bar"><i id="corruption-bar"></i></div><p id="corruption-effect"></p></div></div></section>`;
  }
  render(s: RunState): void {
    this.state = s;
    this.renderToast();
    if (this.readStack.length) return;
    const key = s.phase === 'choosingUpgrade' ? `upgrade:${s.draftId}:${s.rerollsRemaining}:${s.swapCandidate ?? ''}` : s.phase;
    if (this.screen !== key) {
      if (s.phase === 'playing') this.setScreen(key, this.hudHTML());
      if (s.phase === 'choosingUpgrade' && s.swapCandidate) {
        this.nextChoiceInput = performance.now() + 180;
        this.modal(key, 'Chọn ô vũ khí muốn thay', `<p>${UPGRADES[s.swapCandidate].name} sẽ bắt đầu ở <strong>cấp 1</strong>. Vũ khí cũ mất cấp và tiến hóa; các ô khác, XP, hỗ trợ và trang bị giữ nguyên.</p><div class="swap-grid">${(Object.entries(s.modules) as [ModuleId, number][]).filter(([, level]) => level > 0).map(([old, level], index) => `<button class="secondary" data-action="confirm-swap" data-old="${old}" data-draft="${s.draftId}">Ô ${index + 1}: ${old === 'plasma' ? plasmaName(level) : UPGRADES[old].name} cấp ${level} → ${UPGRADES[s.swapCandidate!].name} cấp 1</button>`).join('')}</div>`, '<button class="secondary" data-action="cancel-swap">Hủy · trở về cùng lựa chọn</button>');
      }
      if (s.phase === 'choosingUpgrade' && !s.swapCandidate) {
        this.nextChoiceInput = performance.now() + 180;
        this.setScreen(key, `<div class="overlay"><section class="panel upgrade-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="eyebrow">Stardust thu hồi / Cấp ${s.level}</div><h2 id="modal-title">Một tia sáng mạnh hơn.</h2><p>Chọn một nâng cấp. Mô phỏng đang dừng.${s.pending > 1 ? ` Còn ${s.pending} lựa chọn đang chờ.` : ''}</p><div class="upgrade-grid">${s.choices.map((id, i) => { const n = upgradeLevel(s, id); return `<button class="upgrade-card" data-upgrade="${id}" data-draft="${s.draftId}"><span class="key">${i + 1}</span>${image(UPGRADES[id].icon as AssetId)}<span class="level">${UPGRADES[id].kind === 'module' ? (!n && Object.values(s.modules).filter(Boolean).length >= 3 ? 'THAY VŨ KHÍ' : 'MODULE') : 'HỖ TRỢ'} · CẤP ${n} → ${n + 1}</span><strong>${id === 'plasma' ? plasmaName(n + 1) : UPGRADES[id].name}</strong><p>${upgradeDescription(id, n, s)}</p></button>`; }).join('')}</div><div class="actions"><button class="secondary" data-action="reroll" data-draft="${s.draftId}" ${s.rerollsRemaining ? "" : "disabled"}>Đổi lựa chọn ${s.rerollsRemaining}/1</button><button class="secondary" data-action="read-build">Build hiện tại · B</button></div><p class="muted">Một lần đổi miễn phí mỗi lượt chọn; không tăng chỉ số. Click hoặc 1 / 2 / 3 · Esc để tạm dừng</p></section></div>`);
      }
      if (s.phase === 'paused') this.modal(key, 'Giữ lấy khoảnh khắc.', '<p>Mọi quy luật mô phỏng đang dừng. Bạn phải chủ động tiếp tục khi trở về tab.</p><p>Bắt đầu lại hoặc về menu sẽ bỏ lượt hiện tại và <strong>không nhận thưởng</strong>.</p>', '<button class="primary" data-action="resume">Tiếp tục</button><button class="secondary" data-action="read-achievements">Thành tựu</button><button class="secondary" data-action="restart">Chơi lại</button><button class="secondary" data-action="menu">Về menu</button>');
      if (s.phase === 'victory' || s.phase === 'defeat') this.modal(key, s.phase === 'victory' ? 'Ánh sáng đã trở về.' : 'Một nguồn sáng đã tắt.', `<p>${s.reason}</p><div class="result-grid"><div><b>${formatTime(s.time)}</b><small>Thời gian sống</small></div><div><b>${s.kills}</b><small>Hollowborn tiêu diệt</small></div><div><b>${s.level}</b><small>Cấp đạt được</small></div></div><p class="currency">${image('pure')} +${s.reward} Stardust tinh khiết · Đã nhận một lần</p>${s.phase === 'victory' ? `<p>Echo đã được bảo tồn. Bạn có thể đọc lại trong menu.</p><p class="echo">${ECHO}</p>` : '<p>Mỗi chuyến đi để lại một cơ hội. Nâng Beacon Core và thử một cấu hình module mới.</p>'}`, '<button class="primary" data-action="restart">Chơi lại</button><button class="secondary" data-action="menu">Về menu</button>');
    }
    if (s.phase !== 'playing') return;
    const text = (id: string, value: string): void => { const el = this.hudNodes.get(id); const normalized = normalizeText(value); if (el && el.textContent !== normalized) el.textContent = normalized; };
    const bar = (id: string, value: number): void => { const el = this.hudNodes.get(id); if (el) { const width = `${Math.max(0, Math.min(100, value * 100))}%`; if (el.style.width !== width) el.style.width = width; } };
    const hidden = (id: string, value: boolean): void => { const el = this.hudNodes.get(id); if (el && el.hidden !== value) el.hidden = value; };
    text('ship-hp', hpText(s.player.hp, s.player.maxHP)); bar('ship-bar', s.player.hp / s.player.maxHP);
    text('beacon-hp', `${Math.max(0, Math.ceil(s.beacon.hp))}/${s.beacon.maxHP}`); bar('beacon-bar', s.beacon.hp / s.beacon.maxHP);
    text('time', formatTime(s.time)); text('charge', `${n(s.time / B.duration * 100)}%`);
    text('level', `CẤP ${s.level}`); text('xp', `${Math.floor(s.xp)} / ${xpRequired(s.level)} XP`); bar('xp-bar', s.xp / xpRequired(s.level));
    text('corruption', `${Math.floor(s.corruption)} / 100`); bar('corruption-bar', s.corruption / 100);
    text('corruption-effect', s.corruption >= 50 ? 'BẤT ỔN · Gây +20% / nhận +20% sát thương' : 'Ổn định · Ngoài sáng +4/s / Trong sáng −8/s');
    text('mute-button', this.save.data.settings.muted ? 'Âm: Tắt' : 'Âm: Bật');
    hidden('beacon-alert', s.time - s.beacon.lastHit >= 2);
    text('notice', s.noticeUntil > s.time ? s.notice : '');
    const d = distance(s.player), angle = Math.atan2(-s.player.y, -s.player.x);
    hidden('direction', Math.abs(s.player.x) < window.innerWidth / 2 - 80 && Math.abs(s.player.y) < window.innerHeight / 2 - 150);
    text('direction', `${['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][(Math.round(angle / (Math.PI / 4)) + 8) % 8]} Beacon · ${Math.round(d)}u`);
    const boss = s.enemies.find(e => e.kind === 'elder'); hidden('boss', !boss); if (boss) { bar('boss-bar', boss.hp / boss.maxHP); text('boss-phase', boss.bossPhase === 'transition' ? 'Giai đoạn 2 · Đang chuyển pha' : `ELDER STAR · Giai đoạn ${boss.bossPhase === 'phase2' ? 2 : 1}`); }
    const keyLoadout = [...Object.entries(s.modules).flat(), ...Object.entries(s.supports).flat()].join(',');
    if (this.loadoutKey === keyLoadout) return;
    this.loadoutKey = keyLoadout;
    const loadout = this.hudNodes.get('loadout');
    const supportSlots: { id: UpgradeId; n: number | undefined }[] = (Object.keys(s.supports) as SupportId[]).filter(id => (s.supports[id] ?? 0) > 0).map(id => ({ id, n: s.supports[id] }));
    while (supportSlots.length < 2) supportSlots.push({ id: 'hull', n: undefined });
    const moduleSlots: { id: UpgradeId; n: number | undefined }[] = (Object.entries(s.modules) as [ModuleId, number][]).filter(([, level]) => level > 0).map(([id, level]) => ({ id, n: level }));
    while (moduleSlots.length < 3) moduleSlots.push({ id: 'plasma', n: undefined });
    const html = [...moduleSlots, ...supportSlots].map(({ id, n }) => n ? `<div class="slot" title="${id === 'plasma' ? plasmaName(n) : UPGRADES[id].name} · cấp ${n}">${image(UPGRADES[id].icon as AssetId)}<small>${n}</small></div>` : '<div class="slot empty" title="Ô trống">+</div>').join('');
    if (loadout && loadout.innerHTML !== html) loadout.innerHTML = html;
  }
  private showHelp(): void {
    this.modal('help', 'Giữ hải đăng qua đêm dài.', `<div class="instructions"><div class="instruction"><b>WASD / Phím mũi tên</b>Bay bằng bàn phím, thả phím để dừng. Module tự ngắm và chiến đấu.</div><div class="instruction"><b>12 phút bảo vệ Beacon</b>Sạc tự tăng. Tàu hoặc Beacon hết HP là thua; không cần giết boss để thắng.</div><div class="instruction"><b>Ra ngoài tìm Stardust</b>Thu các cụm sáng bên ngoài. XP mở lựa chọn nâng cấp bằng click hoặc 1/2/3.</div><div class="instruction"><b>Corruption là đánh đổi</b>Ngoài sáng +4/s, trong sáng −8/s. Từ 50: gây và nhận sát thương đều tăng 20%.</div><div class="instruction"><b>Trở về vùng sáng</b>Hồi 1 HP/s; quái thường chậm 20%. Tam giác vàng đánh dấu quái đang nhắm Beacon.</div><div class="instruction"><b>Esc / Chuyển tab</b>Dừng toàn bộ mô phỏng. Tia boss có báo trước, trọng lực môi trường có vòng tím.</div></div><p>Stardust là XP của lượt. Stardust tinh khiết là tiền lâu dài: mỗi phút sống +1, thắng +5. Plasma cấp 3 → Mini Sun, cấp 5 → Supernova. Pulsar quét vòng; Ion chuyền sét qua bầy. Khi đủ ba ô, thẻ vũ khí mới cho chọn ô thay về cấp 1. Trang bị thu hồi tự lắp khi nhặt, tổng trần 20% mỗi lượt.</p>`);
  }
  private showCore(): void {
    const d = this.save.data, cost = B.corePrices[d.coreLevel];
    this.modal('core', 'Beacon Core', `<div class="read-content">${beaconPanel(d)}</div>`, `<p class="core-cost-line" id="core-afford">${beaconAffordability(d)}</p>${cost === undefined ? '' : `<button class="primary" data-action="buy" data-level="${d.coreLevel}" ${d.currency < cost ? 'disabled' : ''}>Nâng cấp · ${n(cost)}</button>`}<button class="secondary" data-action="back">Trở về</button>`);
    this.root.querySelector('.panel')?.classList.add('core-panel');
  }
  private showSettings(): void {
    const s = this.save.data.settings;
    this.modal('settings', 'Cài đặt', `<label class="setting">Chất lượng hình ảnh<select aria-label="Chất lượng hình ảnh" data-setting="quality"><option value="high" ${s.quality === 'high' ? 'selected' : ''}>Cao</option><option value="low" ${s.quality === 'low' ? 'selected' : ''}>Thấp</option></select></label><label class="setting">Tắt âm thanh<input data-setting="muted" type="checkbox" ${s.muted ? 'checked' : ''}></label><label class="setting">Âm lượng<input aria-label="Âm lượng" data-setting="volume" type="range" min="0" max="1" step="0.05" value="${s.volume}"></label><label class="setting">Giảm hiệu ứng<input data-setting="reducedEffects" type="checkbox" ${s.reducedEffects ? 'checked' : ''}></label><label class="setting">Rung khi trúng đòn<input data-setting="shake" type="checkbox" ${s.shake ? 'checked' : ''}></label><p>Tiến triển được lưu trên trình duyệt này. Reload không tiếp tục lượt đang chơi.</p><button class="text-btn danger" data-action="reset">Xóa tiến triển…</button>`);
  }
  private onClick = (event: MouseEvent): void => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button'); if (!button || button.disabled) return;
    const id = button.dataset.upgrade as UpgradeId | undefined;
    if (id) { if (performance.now() >= this.nextChoiceInput && !this.readStack.length) this.actions.choose(id, Number(button.dataset.draft)); return; }
    const action = button.dataset.action;
    if (action === 'confirm-swap') { if (performance.now() >= this.nextChoiceInput) this.actions.swap(button.dataset.old as ModuleId, Number(button.dataset.draft)); return; }
    if (action === 'cancel-swap') { this.actions.cancelSwap(); return; }
    if (action === 'achievement-filter') { this.achievementFilter = button.dataset.filter as AchievementFilter; this.renderRead(); this.root.querySelector<HTMLElement>(`[data-filter=${this.achievementFilter}]`)?.focus({ preventScroll: true }); return; }
    if (action?.startsWith('read-')) { const key = action.slice(5); if (key === 'back') this.closeRead(); else if (key === 'ship' || key === 'build' || key === 'catalog' || key === 'achievements') this.openRead(key); return; }
    if (action === 'reroll') { this.actions.reroll(Number(button.dataset.draft)); return; }
    if (action === 'start' || action === 'restart') this.actions.start();
    if (action === 'menu' || action === 'back') this.actions.menu();
    if (action === 'pause') this.actions.pause(); if (action === 'resume') this.actions.resume();
    if (action === 'help') this.showHelp(); if (action === 'core') this.showCore();
    if (action === 'buy' && performance.now() >= this.nextPurchaseInput) {
      const before = [...this.save.data.unlockedAchievements];
      let names: string[] = [];
      if (this.save.buyCore(Number(button.dataset.level))) { this.nextPurchaseInput = performance.now() + 300; names = ACHIEVEMENTS.filter(a => !before.includes(a.id) && this.save.data.unlockedAchievements.includes(a.id)).map(a => a.name); }
      this.showCore(); this.root.querySelector<HTMLElement>('[data-action=buy]:not(:disabled), [data-action=back]')?.focus({ preventScroll: true });
      if (names.length) this.notifyAchievements(names);
    }
    if (action === 'echo') this.modal('echo', 'Echo 001 · Hạt giống', this.save.data.echo ? `<p class="echo">${ECHO}</p>` : '<p>Ký ức này còn nằm trong bóng tối. Hoàn thành một lượt chiến thắng để bảo tồn Echo đầu tiên.</p>');
    if (action === 'settings') this.showSettings();
    if (action === 'mute') { this.save.data.settings.muted = !this.save.data.settings.muted; this.save.write(); this.actions.settings(); }
    if (action === 'reset') this.modal('confirm-reset', 'Xóa tiến triển?', '<p>Tiền, Beacon Core, Echo, tổng quái đã tiêu diệt, thành tựu và cài đặt sẽ trở về ban đầu. Hành động này không thể hoàn tác.</p>', '<button class="secondary" data-action="settings">Hủy</button><button class="primary" data-action="confirm-reset">Xác nhận xóa</button>');
    if (action === 'confirm-reset') { this.save.reset(); this.actions.settings(); this.menu(); }
  };
  private onChange = (event: Event): void => {
    const el = event.target as HTMLInputElement, key = el.dataset.setting;
    if (el.hasAttribute('data-achievement-group')) { this.achievementGroup = el.value; this.renderRead(); this.root.querySelector<HTMLElement>('[data-achievement-group]')?.focus({ preventScroll: true }); return; }
    if (key === 'volume') this.save.data.settings.volume = Number(el.value);
    if (key === 'quality') this.save.data.settings.quality = el.value === 'low' ? 'low' : 'high';
    if (key === 'muted' || key === 'reducedEffects' || key === 'shake') this.save.data.settings[key] = el.checked;
    if (key) { this.save.write(); this.actions.settings(); }
  };
  private onKey = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    if ((e.code === 'KeyB' || e.code === 'Escape') && this.readStack.length) { this.closeRead(); e.preventDefault(); return; }
    if (e.code === 'Escape' && this.state?.swapCandidate && this.state.phase === 'choosingUpgrade') { this.actions.cancelSwap(); e.preventDefault(); return; }
    if (e.code === 'KeyB' && this.state && !(e.target instanceof HTMLInputElement)) { this.openRead('build'); e.preventDefault(); return; }
    if (e.code === 'Escape' && this.state) { if (this.state.phase === 'paused') this.actions.resume(); else this.actions.pause(); e.preventDefault(); }
    else if (e.code === 'Escape' && this.screen !== 'menu') { this.menu(); e.preventDefault(); }
    if (/^[123]$/.test(e.key) && this.state?.phase === 'choosingUpgrade' && !this.state.swapCandidate && !this.readStack.length && performance.now() >= this.nextChoiceInput) { const id = this.state.choices[Number(e.key) - 1]; if (id) this.actions.choose(id, this.state.draftId); }
    if (e.code === 'Tab') {
      const dialog = this.root.querySelector('[role=dialog]'); if (!dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),input,select'));
      const first = controls[0], last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  };
  /** Blur/ẩn tab là lý do pause riêng: đóng panel không được tự resume sau đó. */
  requireManualResume(): void { this.autoResumeRead = false; }
  private openRead(key: 'ship' | 'build' | 'catalog' | 'achievements'): void {
    if (!this.readStack.length) {
      this.autoResumeRead = this.state?.phase === 'playing';
      if (this.autoResumeRead) this.actions.pause();
    }
    if (this.readStack.at(-1) !== key) this.readStack.push(key);
    this.renderRead();
  }
  private renderRead(): void {
    const key = this.readStack.at(-1); if (!key) return;
    const body = key === 'ship' ? shipPanel(this.save.data) : key === 'build' && this.state ? buildPanel(this.state) : key === 'achievements' ? achievementsPanel(this.save.data, this.achievementFilter, this.achievementGroup) : catalogPanel(this.state);
    const title = key === 'ship' ? 'Phi thuyền' : key === 'build' ? 'Build hiện tại' : key === 'achievements' ? 'Thành tựu' : 'Danh mục nâng cấp';
    this.modal(`read:${key}`, title, `<div class="read-content">${body}</div>`, '<button class="secondary" data-action="read-back">Trở về</button>');
    this.root.querySelector('.panel')?.classList.add('read-panel');
    this.root.querySelector<HTMLElement>('.panel > .actions [data-action=read-back]')?.focus({ preventScroll: true });
  }
  private closeRead(): void {
    this.readStack.pop(); if (this.readStack.length) { this.renderRead(); return; }
    const resume = this.autoResumeRead; this.autoResumeRead = false; this.screen = '';
    if (resume && this.state?.phase === 'paused') this.actions.resume();
    else if (this.state) this.render(this.state); else this.menu();
    this.root.querySelector<HTMLElement>('[data-action=read-build], .upgrade-card, [data-action=resume], [data-action=read-ship]')?.focus({ preventScroll: true });
  }
  /** Một toast hữu hạn, không emitter/timer/listener cho từng kill. Wall time chỉ dành UI. */
  notifyAchievements(names: string[]): void { this.toast = `Thành tựu mới · ${names.slice(0, 5).join(' · ')}`; this.toastUntil = performance.now() + 5000; this.renderToast(); }
  updateTransientUI(): void { this.renderToast(); }
  private renderToast(): void { const node = this.hudNodes.get('profile-toast'); if (!node) return; const text = performance.now() < this.toastUntil ? this.toast : ''; if (node.textContent !== text) node.textContent = text; if (node.hidden !== !text) node.hidden = !text; }
  dispose(): void { this.listeners.abort(); this.root.innerHTML = ''; }
}
