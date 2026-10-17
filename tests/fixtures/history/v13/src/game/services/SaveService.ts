import type { SaveData } from '../core/types';
import { clamp } from '../core/math';
import { BALANCE as B } from '../config/balance';
import { ACHIEVEMENTS, CHARACTERS, type CharacterId } from '../config/progression';
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }
export const defaultSave = (): SaveData => ({ saveVersion: 2, currency: 0, coreLevel: 0, echo: false, characterId: 'nova', careerKills: 0, unlockedAchievements: [], settings: { muted: false, volume: 0.35, reducedEffects: false, shake: true, quality: 'high' } });
const finite = (n: unknown, fallback: number): number => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
/** Dữ liệu ngoài app không đáng tin: kiểm tra type/version rồi clamp từng trường. */
export function validateSave(raw: unknown): SaveData {
  const d = defaultSave(); if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>; if (r.saveVersion !== 1 && r.saveVersion !== 2) return d;
  if (typeof r.characterId === 'string' && Object.hasOwn(CHARACTERS, r.characterId)) d.characterId = r.characterId as CharacterId;
  // V1 không có career total: bắt đầu từ0, không suy kill từ tiền/Echo. Key storage giữ nguyên.
  if (r.saveVersion === 2) d.careerKills = Math.floor(clamp(finite(r.careerKills, 0), 0, 1_000_000_000));
  d.unlockedAchievements = ACHIEVEMENTS.filter(a => d.careerKills >= a.target).map(a => a.id);
  d.currency = Math.floor(clamp(finite(r.currency, 0), 0, 1_000_000));
  d.coreLevel = Math.floor(clamp(finite(r.coreLevel, 0), 0, 3)); d.echo = r.echo === true;
  if (r.settings && typeof r.settings === 'object') {
    const v = r.settings as Record<string, unknown>;
    d.settings = { muted: v.muted === true, volume: clamp(finite(v.volume, 0.35), 0, 1), reducedEffects: v.reducedEffects === true, shake: typeof v.shake === 'boolean' ? v.shake : true, quality: v.quality === 'low' ? 'low' : 'high' };
  }
  return d;
}
/** Chỉ lưu meta; không có checkpoint hoặc trả thưởng khi reload. Lỗi storage giữ dữ liệu RAM. */
export class SaveService {
  data = defaultSave(); warning = '';
  constructor(private storage: StorageLike | undefined, readonly key = 'eventide.save.v1') {
    if (!storage) this.warning = 'Trình duyệt chặn lưu dữ liệu. Tiến triển hiện chỉ giữ trong phiên này.';
    try { const raw: unknown = JSON.parse(storage?.getItem(key) ?? 'null'); this.data = validateSave(raw); if (raw && typeof raw === 'object' && Reflect.get(raw, 'saveVersion') === 1) this.write(); }
    catch { this.warning = 'Không đọc được dữ liệu lưu; đang dùng dữ liệu an toàn trong bộ nhớ.'; }
  }
  write(): boolean {
    try { if (!this.storage) throw new Error('storage unavailable'); this.storage.setItem(this.key, JSON.stringify(this.data)); this.warning = ''; return true; }
    catch { this.warning = 'Không thể lưu vào trình duyệt. Tiến triển hiện chỉ giữ trong phiên này.'; return false; }
  }
  buyCore(): boolean {
    const cost = B.corePrices[this.data.coreLevel];
    if (cost === undefined || this.data.currency < cost) return false;
    this.data.currency -= cost; this.data.coreLevel++; this.write(); return true;
  }
  reset(): void { this.data = defaultSave(); this.write(); }
}
