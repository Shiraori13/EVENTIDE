import { SPACE_VISUALS as V } from '../config/presentation';
import type { RunState } from '../core/types';
/** Đỏ chỉ từ HP loss hợp lệ, ưu tiên hơn charge; trả tint trắng để giữ palette asset của từng Core. */
export function beaconFeedback(s: RunState, reduced: boolean): { tint: number; alpha: number; damaged: boolean } {
  const damaged = s.time >= s.beacon.lastHit && s.time - s.beacon.lastHit < V.beaconFlashSeconds;
  return { damaged, tint: damaged ? 0xff6969 : 0xffffff, alpha: reduced ? 1 : damaged ? 1 : 0.88 + 0.1 * Math.sin(s.time * Math.PI * 2 * V.beaconHz) };
}
