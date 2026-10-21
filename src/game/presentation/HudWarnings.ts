import type { RunState } from '../core/types';
export type DangerLevel = 'normal' | 'warning' | 'critical';
export const WARNING_THRESHOLDS = { critical:.25, criticalExit:.32, warning:.5, warningExit:.58, corruptionWarning:40, corruptionExit:35 } as const;
function healthLevel(ratio:number, previous:DangerLevel):DangerLevel {
  const t=WARNING_THRESHOLDS;
  if(ratio<=t.critical || previous==='critical'&&ratio<t.criticalExit)return 'critical';
  if(ratio<=t.warning || previous!=='normal'&&ratio<t.warningExit)return 'warning';
  return 'normal';
}
/** Hysteresis chỉ đổi cảnh báo trình bày; buff Corruption vẫn theo đúng threshold gameplay. */
export class HudWarnings {
  ship:DangerLevel='normal';beacon:DangerLevel='normal';corruption=false;
  update(s:RunState):void {
    this.ship=healthLevel(s.player.hp/s.player.maxHP,this.ship);
    this.beacon=healthLevel(s.beacon.hp/s.beacon.maxHP,this.beacon);
    if(this.beacon==='normal'&&s.time-s.beacon.lastHit<2)this.beacon='warning';
    this.corruption=s.corruption>=(this.corruption?WARNING_THRESHOLDS.corruptionExit:WARNING_THRESHOLDS.corruptionWarning);
  }
}
/** Không đưa hướng dẫn/toast lên khi đang né đòn boss hoặc có nguy cơ tức thời. */
export function urgentSituation(s:RunState):boolean {
  return s.player.hp/s.player.maxHP<=.32 || s.beacon.hp/s.beacon.maxHP<=.32 || s.time-s.beacon.lastHit<2 ||
    s.enemies.some(e=>e.hp>0&&(!!e.boss?.attack||!!e.boss?.beam||Math.hypot(e.x-s.player.x,e.y-s.player.y)<e.radius+75)) ||
    s.bossZones.some(z=>s.time<z.end&&Math.hypot(z.x-s.player.x,z.y-s.player.y)<=z.radius+40) ||
    s.astronomy.some(e=>e.phase==='warning'||e.phase==='active'&&e.id==='radiation'&&e.zones?.some(z=>Math.hypot(z.x-s.player.x,z.y-s.player.y)<=z.radius+40)) ||
    !!(s.gravity&&s.time>=s.gravity.start&&Math.hypot(s.player.x-s.gravity.x,s.player.y-s.gravity.y)<500);
}
