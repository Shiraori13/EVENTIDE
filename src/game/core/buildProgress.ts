import { UPGRADES } from '../config/content';
import { STAT_LIMITS, SUPPORTS } from '../config/progression';
import type { RunState } from './types';
interface SlotProgress { occupied: number; maxed: number; required: number; valid: boolean }
function countSlots(value: unknown, definitions: Record<string, {max: number}>, required: number): SlotProgress {
  const result = {occupied:0, maxed:0, required, valid:true};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {...result,valid:false};
  for (const [id, level] of Object.entries(value)) {
    const def = Object.hasOwn(definitions,id) ? definitions[id] : undefined;
    if (!def || !Number.isInteger(def.max) || def.max <= 0 || !Number.isInteger(level) || level < 1 || level > def.max) { result.valid=false; continue; }
    result.occupied++; if (level === def.max) result.maxed++;
  }
  result.valid &&= result.occupied <= required;
  return result;
}
/** Đếm cả yêu cầu ô trống: ba module và hai hỗ trợ đã chọn đều phải đủ/max, không every trên tập đã filter. */
export function getBasicBuildProgress(s: Pick<RunState,'modules'|'supports'>) {
  const modules=countSlots(s.modules,Object.fromEntries(Object.entries(UPGRADES).filter(([,d])=>d?.kind==='module')),STAT_LIMITS.moduleSlots);
  const supports=countSlots(s.supports,SUPPORTS,STAT_LIMITS.supportSlots);
  return {modules,supports,complete:modules.valid && supports.valid && modules.maxed===modules.required && supports.maxed===supports.required};
}
export const isBasicBuildComplete = (s: Pick<RunState,'modules'|'supports'>): boolean => getBasicBuildProgress(s).complete;
