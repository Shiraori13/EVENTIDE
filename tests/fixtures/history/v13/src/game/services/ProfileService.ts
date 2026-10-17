import { ACHIEVEMENTS, STAT_LIMITS } from '../config/progression';
import type { RunState } from '../core/types';
import type { SaveService } from './SaveService';
/** Commit delta death đã xác nhận; không cộng lại toàn bộ run khi result/retry ghi save. */
export class ProfileService {
  private seen = new WeakMap<RunState, number>();
  private nextFlush = new WeakMap<RunState, number>();
  private dirty = false;
  constructor(private save: SaveService, private notify: (names: string[]) => void) {}
  sync(s: RunState): void {
    const previous = this.seen.get(s) ?? 0, delta = Math.max(0, s.kills - previous); this.seen.set(s, s.kills);
    if (delta) {
      this.save.data.careerKills = Math.min(1_000_000_000, this.save.data.careerKills + delta); this.dirty = true;
      const milestones = ACHIEVEMENTS.filter(a => this.save.data.careerKills >= a.target && !this.save.data.unlockedAchievements.includes(a.id));
      if (milestones.length) { this.save.data.unlockedAchievements.push(...milestones.map(a => a.id)); this.notify(milestones.map(a => a.name)); this.flush(); }
    }
    if (s.phase !== 'playing' || s.time >= (this.nextFlush.get(s) ?? 0)) { this.flush(); this.nextFlush.set(s, s.time + STAT_LIMITS.autosaveSeconds); }
  }
  /** Lifecycle flush giữ RAM khi storage lỗi, retry snapshot không cộng delta lần nữa. */
  flush(): void { if (this.dirty && this.save.write()) this.dirty = false; }
}
