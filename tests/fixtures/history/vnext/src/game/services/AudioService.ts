import type { Cue, Settings } from '../core/types';
/** Âm thanh tổng hợp nguyên bản. Clock âm thanh không tác động simulation; không có timer ngoài scene. */
export class AudioService {
  private context?: AudioContext;
  private master?: GainNode;
  private ambientGain?: GainNode;
  private ambient: OscillatorNode[] = [];
  private lastCue = new Map<Cue, number>();
  unlock(): void {
    try {
      if (!this.context) {
        this.context = new AudioContext(); this.master = this.context.createGain(); this.master.connect(this.context.destination);
        this.ambientGain = this.context.createGain(); this.ambientGain.connect(this.master);
        for (const frequency of [55, 82.41, 110.3]) {
          const osc = this.context.createOscillator(), gain = this.context.createGain();
          osc.type = 'sine'; osc.frequency.value = frequency; gain.gain.value = 0.035;
          osc.connect(gain); gain.connect(this.ambientGain); osc.start(); this.ambient.push(osc);
        }
      }
    } catch { /* Thiếu thiết bị âm thanh không được chặn game. */ }
  }
  sync(settings: Settings, active: boolean, time: number, ambient = true): void {
    const ctx = this.context; if (!ctx || !this.master) return;
    this.master.gain.value = settings.muted ? 0 : settings.volume;
    if (this.ambientGain) this.ambientGain.gain.value = ambient ? 1 : 0;
    if (active) { if (ctx.state === 'suspended') void ctx.resume().catch(() => {}); }
    else if (ctx.state === 'running') void ctx.suspend().catch(() => {});
    const pulse = 0.8 + Math.sin(time * (time > 540 ? 3 : 1.2)) * 0.15;
    this.ambient.forEach((osc, i) => { osc.frequency.value = [55, 82.41, 110.3][i] * pulse; });
  }
  cue(cue: Cue): void {
    const ctx = this.context; if (!ctx || !this.master || ctx.state !== 'running') return;
    const now = ctx.currentTime; if (now - (this.lastCue.get(cue) ?? -10) < (cue === 'shot' ? 0.12 : 0.08)) return;
    this.lastCue.set(cue, now);
    const frequencies: Record<Cue, number> = { shot: 420, hit: 90, pickup: 900, upgrade: 660, evolution: 880, beacon: 145, boss: 65, victory: 1046, defeat: 130 };
    try {
      const osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type = cue === 'shot' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(frequencies[cue], now); osc.frequency.exponentialRampToValueAtTime(frequencies[cue] * (cue === 'defeat' ? 0.3 : 1.6), now + 0.16);
      gain.gain.setValueAtTime(0.13, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain); gain.connect(this.master); osc.start(); osc.stop(now + 0.23);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    } catch { /* Thiết bị biến mất chỉ làm game mất âm thanh. */ }
  }
  dispose(): void { for (const osc of this.ambient) osc.stop(); this.ambient = []; void this.context?.close().catch(() => {}); this.context = undefined; }
}
