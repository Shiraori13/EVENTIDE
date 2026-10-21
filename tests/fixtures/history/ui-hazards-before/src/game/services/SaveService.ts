import type { SaveData } from '../core/types';
import { clamp } from '../core/math';
import { BALANCE as B } from '../config/balance';
import { ACHIEVEMENTS, CHARACTERS, type CharacterId } from '../config/progression';
import { emptyCareerMetrics, unlockAchievements, type CareerMetrics } from '../config/achievements';
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }
export const defaultSave = (): SaveData => ({ saveVersion: 3, currency: 0, coreLevel: 0, echo: false, characterId: 'nova', careerKills: 0, unlockedAchievements: [], metrics: emptyCareerMetrics(), settings: { muted: false, volume: 0.35, reducedEffects: false, reducedMotion: false, shake: true, quality: 'medium' } });
const finite = (n: unknown, fallback: number): number => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
/** Dữ liệu ngoài app không đáng tin: kiểm tra type/version rồi clamp từng trường. */
export function validateSave(raw: unknown): SaveData {
  const d = defaultSave(); if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>; if (r.saveVersion !== 1 && r.saveVersion !== 2 && r.saveVersion !== 3) return d;
  if (typeof r.characterId === 'string' && Object.hasOwn(CHARACTERS, r.characterId)) d.characterId = r.characterId as CharacterId;
  // V1 không có career total: bắt đầu từ0, không suy kill từ tiền/Echo. Key storage giữ nguyên.
  if (r.saveVersion !== 1) d.careerKills = Math.floor(clamp(finite(r.careerKills, 0), 0, 1_000_000_000));
  // Metrics mới bắt đầu từ0 nếu save cũ không có nguồn thật; giữ ID đã mở, không suy win/heal từ Echo/tiền.
  if (r.saveVersion === 3 && r.metrics && typeof r.metrics === 'object') for (const key of Object.keys(d.metrics) as (keyof CareerMetrics)[]) {
    const cap = key === 'salvageBudgetBP' ? 2000 : key === 'survival' || key === 'corruptionSeconds' ? B.duration : 1_000_000_000;
    const value = clamp(finite(Reflect.get(r.metrics, key), 0), 0, cap);
    d.metrics[key] = ['survival', 'corruptionSeconds', 'lightHealing'].includes(key) ? value : Math.floor(value);
  }
  const validIDs = new Set(ACHIEVEMENTS.map(a => a.id));
  d.unlockedAchievements = Array.isArray(r.unlockedAchievements) ? [...new Set(r.unlockedAchievements.filter((id): id is string => typeof id === 'string' && validIDs.has(id) && (r.saveVersion === 3 || id.startsWith('kills-'))))] : [];
  d.currency = Math.floor(clamp(finite(r.currency, 0), 0, 1_000_000));
  d.coreLevel = Math.floor(clamp(finite(r.coreLevel, 0), 0, B.corePrices.length)); d.echo = r.echo === true;
  if (r.settings && typeof r.settings === 'object') {
    const v = r.settings as Record<string, unknown>;
    // Giữ lựa chọn cũ: reducedEffects là fallback cho motion, quality thiếu ở save cũ vẫn Cao như trước.
    d.settings = { muted: v.muted === true, volume: clamp(finite(v.volume, 0.35), 0, 1), reducedEffects: v.reducedEffects === true, reducedMotion: typeof v.reducedMotion==='boolean'?v.reducedMotion:v.reducedEffects===true, shake: typeof v.shake === 'boolean' ? v.shake : true, quality: v.quality === 'low' ? 'low' : v.quality === 'medium' ? 'medium' : 'high' };
  }
  unlockAchievements(d); return d;
}
/** Chỉ lưu meta; không có checkpoint hoặc trả thưởng khi reload. Lỗi storage giữ dữ liệu RAM. */
export class SaveService {
  data = defaultSave(); warning = '';
  constructor(private storage: StorageLike | undefined, readonly key = 'eventide.save.v1') {
    if (!storage) this.warning = 'Trình duyệt chặn lưu dữ liệu. Tiến triển hiện chỉ giữ trong phiên này.';
    try { const raw: unknown = JSON.parse(storage?.getItem(key) ?? 'null'); this.data = validateSave(raw);
      if (!raw && typeof matchMedia==='function') this.data.settings.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (raw && typeof raw === 'object' && [1, 2].includes(Reflect.get(raw, 'saveVersion') as number)) this.write(); }
    catch { this.warning = 'Không đọc được dữ liệu lưu; đang dùng dữ liệu an toàn trong bộ nhớ.'; }
  }
  write(): boolean {
    try { if (!this.storage) throw new Error('storage unavailable'); this.storage.setItem(this.key, JSON.stringify(this.data)); this.warning = ''; return true; }
    catch { this.warning = 'Không thể lưu vào trình duyệt. Tiến triển hiện chỉ giữ trong phiên này.'; return false; }
  }
  buyCore(expectedLevel = this.data.coreLevel): boolean {
    if (expectedLevel !== this.data.coreLevel) return false;
    const cost = B.corePrices[this.data.coreLevel];
    if (cost === undefined || this.data.currency < cost) return false;
    this.data.currency -= cost; this.data.coreLevel++; unlockAchievements(this.data); this.write(); return true;
  }
  reset(): void { this.data = defaultSave(); this.write(); }
}
