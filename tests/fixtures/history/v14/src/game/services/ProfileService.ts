import { STAT_LIMITS } from '../config/progression';
import { emptyCareerMetrics, unlockAchievements, type CareerMetrics } from '../config/achievements';
import type { RunState } from '../core/types';
import type { SaveService } from './SaveService';
/** Commit delta death đã xác nhận; không cộng lại toàn bộ run khi result/retry ghi save. */
export class ProfileService {
  private seen = new WeakMap<RunState, { kills: number; metrics: CareerMetrics; revision: number; second: number; phase: string; result: boolean }>();
  private nextFlush = new WeakMap<RunState, number>();
  private dirty = false;
  constructor(private save: SaveService, private notify: (names: string[]) => void) {}
  sync(s: RunState): void {
    let previous = this.seen.get(s);
    if (!previous) { previous = { kills: 0, metrics: emptyCareerMetrics(), revision: -1, second: -1, phase: '', result: false }; this.seen.set(s, previous); }
    const second = Math.floor(s.time + 1e-7);
    // Timer metrics tối đa một lần/giây; event revision và lifecycle vẫn commit ngay. Không scan28 điều kiện/frame.
    if (previous.kills === s.kills && previous.revision === s.metricRevision && previous.second === second && previous.phase === s.phase) return;
    const data = this.save.data, metrics = data.metrics;
    data.careerKills = Math.min(1_000_000_000, data.careerKills + Math.max(0, s.kills - previous.kills));
    const additive = ['drifterKills', 'leechKills', 'miniSun', 'supernova', 'pulsarHits', 'ionHits', 'bossKills', 'bossPhase2', 'salvageCollected', 'lightHealing'] as const;
    for (const key of additive) metrics[key] = Math.min(1_000_000_000, metrics[key] + Math.max(0, s.metrics[key] - previous.metrics[key]));
    metrics.bestKills = Math.max(metrics.bestKills, s.kills); metrics.survival = Math.max(metrics.survival, s.time);
    metrics.salvageBudgetBP = Math.max(metrics.salvageBudgetBP, s.metrics.salvageBudgetBP);
    metrics.corruptionSeconds = Math.max(metrics.corruptionSeconds, s.metrics.corruptionSeconds);
    // Một result hợp lệ chỉ credit một lần, cả khi storage lỗi/retry/menu lại cùng run.
    if (s.settled && !previous.result) {
      previous.result = true;
      if (s.phase === 'victory') { metrics.wins++; if (s.beacon.hp / s.beacon.maxHP >= 0.75) metrics.healthyBeaconWins++; if (s.player.hp / s.player.maxHP >= 0.5) metrics.healthyShipWins++; }
    }
    previous.kills = s.kills; previous.metrics = { ...s.metrics }; previous.revision = s.metricRevision; previous.second = second; previous.phase = s.phase; this.dirty = true;
    const fresh = unlockAchievements(data); if (fresh.length) { this.notify(fresh); this.flush(); }
    if (s.phase !== 'playing' || s.time >= (this.nextFlush.get(s) ?? 0)) { this.flush(); this.nextFlush.set(s, s.time + STAT_LIMITS.autosaveSeconds); }
  }
  /** Lifecycle flush giữ RAM khi storage lỗi, retry snapshot không cộng delta lần nữa. */
  flush(): void { if (this.dirty && this.save.write()) this.dirty = false; }
}
