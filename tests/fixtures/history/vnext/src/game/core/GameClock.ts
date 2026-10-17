import { BALANCE as B } from '../config/balance';
/** Một clock fixed-step; bỏ phần thời gian quá dài để không bù khi quay lại tab. */
export class GameClock {
  private accumulator = 0;
  reset(): void { this.accumulator = 0; }
  advance(deltaSeconds: number, playing: () => boolean, step: (dt: number) => void): void {
    if (!playing()) { this.reset(); return; }
    this.accumulator += Math.min(Math.max(0, deltaSeconds), B.maxFrame);
    let steps = 0;
    while (this.accumulator + 1e-10 >= B.step && steps++ < B.maxSteps) {
      this.accumulator -= B.step; step(B.step);
      if (!playing()) { this.reset(); break; }
    }
  }
}
