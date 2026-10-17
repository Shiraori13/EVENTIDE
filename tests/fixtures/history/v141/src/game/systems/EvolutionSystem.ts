import { QUASAR } from '../config/content';
import type { RunState } from '../core/types';
import { attackInterval, shipStats } from '../core/stats';
import { clearModuleAttacks } from './ModuleLifecycle';
import { refreshMastery, refreshDraftAfterFusion } from './ExperienceSystem';
export const canFuseQuasar = (s: RunState): boolean => !s.settled && s.modules.pulsar === 5 && s.modules.ion === 5 && !s.modules.quasar;
/** Giao dịch atomic: chốt mastery trước giải phóng ô; không tiêu draft/XP/reroll hoặc trả lại damage. */
export function fuseQuasar(s: RunState, rng: () => number): boolean {
  if (!canFuseQuasar(s) || s.phase === 'playing' || s.swapSelecting) return false;
  refreshMastery(s); clearModuleAttacks(s, 'pulsar'); clearModuleAttacks(s, 'ion');
  const modules: RunState['modules'] = {}; let inserted = false;
  for (const [id, level] of Object.entries(s.modules)) {
    if (id === 'pulsar' || id === 'ion') { if (!inserted) { modules.quasar = 5; inserted = true; } }
    else modules[id as keyof typeof modules] = level;
  }
  s.modules = modules; s.nextQuasar = s.time + attackInterval(QUASAR.cooldown, shipStats(s));
  refreshDraftAfterFusion(s, rng); s.notice = 'Tiến hóa · Quasar Cannon'; s.noticeUntil = s.time + 4; s.cues.push('evolution'); return true;
}
