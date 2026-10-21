import { ASSETS } from '../../assets/manifest';
import { QUASAR, UPGRADES } from '../config/content';
import type { RunState } from '../core/types';
import { attackInterval, shipStats } from '../core/stats';
import { advancedWeaponStep } from './AdvancedWeapons';
import { refreshDraftAfterFusion } from './ExperienceSystem';
export interface EvolutionResult { ok: boolean; reason: string }
export interface PreparedQuasar { id: 'quasar'; level: number; nextAttack: number }
const busy = new WeakSet<RunState>();
/** Recipe không phụ thuộc mastery/support; pause/draft là context quản lý build, không cần tick. */
export function quasarEligibility(s: RunState): EvolutionResult {
  const reason = s.settled || !['paused','choosingUpgrade'].includes(s.phase) ? 'Chỉ tiến hóa trong Balo hoặc lựa chọn của lượt đang tạm dừng.'
    : busy.has(s) ? 'Đang xử lý tiến hóa.' : s.swapSelecting ? 'Hãy hủy thao tác thay vũ khí trước khi tiến hóa.'
    : s.modules.quasar ? 'Đã hợp nhất · Quasar cấp 5.'
    : s.modules.pulsar !== 5 || s.modules.ion !== 5 ? 'Cần Pulsar Beam cấp 5 và Ion Storm cấp 5.'
    : !UPGRADES.quasar || UPGRADES.quasar.kind !== 'module' || UPGRADES.quasar.max !== 5 || !ASSETS.quasar || typeof advancedWeaponStep !== 'function' || ![QUASAR.damage,QUASAR.cooldown,QUASAR.duration].every(n=>Number.isFinite(n)&&n>0) ? 'Vũ khí tiến hóa chưa sẵn sàng. Nguyên liệu được giữ nguyên.' : '';
  return {ok:!reason,reason};
}
export const canFuseQuasar = (s: RunState): boolean => quasarEligibility(s).ok;
/** Chuẩn bị toàn bộ output/cleanup/draft trước commit. Không tạo resource engine; behavior hiện hành tạo attack khi resume. */
export function tryFuseQuasar(s: RunState, rng: () => number, prepare: () => PreparedQuasar = () => ({id:'quasar',level:5,nextAttack:s.time+attackInterval(QUASAR.cooldown,shipStats(s))})): EvolutionResult {
  const eligible=quasarEligibility(s); if (!eligible.ok) return eligible;
  busy.add(s);
  try {
    const output=prepare();
    if (output?.id !== 'quasar' || output.level !== UPGRADES.quasar.max || !Number.isFinite(output.nextAttack) || output.nextAttack < s.time) throw new Error('Invalid Quasar output');
    const modules: RunState['modules']={}; let inserted=false;
    for (const [id,level] of Object.entries(s.modules)) {
      if (id==='pulsar'||id==='ion') { if (!inserted) { modules[output.id]=output.level; inserted=true; } }
      else modules[id as keyof typeof modules]=level;
    }
    // Giữ damage đã resolve; chỉ dọn owner nguồn cũ. Không đụng enemy, XP, support, gear hoặc clock.
    const staged: RunState={...s,modules,nextQuasar:output.nextAttack,
      pulses:s.pulses.filter(p=>(p.source??'pulsar')!=='pulsar'),
      ionTraces:s.ionTraces.filter(t=>(t.source??'ion')!=='ion'),buildRevision:s.buildRevision+1};
    refreshDraftAfterFusion(staged,rng);
    s.modules=staged.modules;s.pulses=staged.pulses;s.ionTraces=staged.ionTraces;s.nextQuasar=staged.nextQuasar;
    s.choices=staged.choices;s.weaponMasteryReached=staged.weaponMasteryReached;s.buildRevision=staged.buildRevision;
    s.notice='Đã tiến hóa · Quasar Cannon cấp 5';s.noticeUntil=s.time+4;s.cues.push('evolution');
    return {ok:true,reason:s.notice};
  } catch (error) {
    if (import.meta.env.DEV || import.meta.env.MODE==='benchmark') console.error('[evolution] Prepare failed; sources retained',error);
    return {ok:false,reason:'Không thể chuẩn bị Quasar. Nguyên liệu và lượt chọn được giữ nguyên.'};
  } finally { busy.delete(s); }
}
export const fuseQuasar = (s: RunState, rng: () => number): boolean => tryFuseQuasar(s,rng).ok;
