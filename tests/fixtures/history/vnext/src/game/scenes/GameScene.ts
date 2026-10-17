import Phaser from 'phaser';
import { GameSession, createRun } from '../core/GameSession';
import { GameClock } from '../core/GameClock';
import { seededRandom } from '../core/math';
import type { RunState } from '../core/types';
import { WorldRenderer } from '../presentation/WorldRenderer';
import { SaveService } from '../services/SaveService';
import { AudioService } from '../services/AudioService';
import { GameUI } from '../ui/GameUI';
import { installDebug } from '../debug/DebugController';
export class GameScene extends Phaser.Scene {
  private session?: GameSession;
  private clock = new GameClock();
  private worldView!: WorldRenderer;
  private ui!: GameUI;
  private save!: SaveService;
  private audio = new AudioService();
  private keys = new Set<string>();
  private lifecycle = new AbortController();
  private disposeDebug?: () => void;
  private paid = false;
  private menuState: RunState = createRun(0);
  private uiElapsed = 0;
  constructor() { super('World'); }
  create(): void {
    const testing = import.meta.env.DEV && new URLSearchParams(location.search).get('e2e') === '1';
    let storage: Storage | undefined; try { storage = window.localStorage; } catch { /* SaveService tiếp tục bằng RAM. */ }
    this.save = new SaveService(storage, testing ? 'eventide.e2e.v1' : 'eventide.save.v1');
    this.worldView = new WorldRenderer(this);
    this.ui = new GameUI(document.querySelector<HTMLElement>('#ui')!, this.save, {
      start: () => { this.session = new GameSession(this.save.data.coreLevel, testing ? seededRandom(42) : Math.random); this.paid = false; this.keys.clear(); this.clock.reset(); this.audio.unlock(); this.ui.render(this.session.state); },
      menu: () => { this.session = undefined; this.keys.clear(); this.clock.reset(); this.ui.menu(); },
      pause: () => this.pauseRun(), resume: () => { this.keys.clear(); this.clock.reset(); this.audio.unlock(); this.session?.resume(); if (this.session) this.ui.render(this.session.state); },
      choose: id => { if (this.session?.choose(id)) { this.keys.clear(); this.ui.render(this.session.state); } },
      settings: () => this.audio.unlock(),
    });
    this.ui.menu();
    window.addEventListener('keydown', this.keyDown, { signal: this.lifecycle.signal });
    window.addEventListener('keyup', this.keyUp, { signal: this.lifecycle.signal });
    window.addEventListener('blur', this.pauseRun, { signal: this.lifecycle.signal });
    document.addEventListener('visibilitychange', this.visibility, { signal: this.lifecycle.signal });
    if (testing) this.disposeDebug = installDebug(() => this.session, this.clock, this.save);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.dispose, this);
  }
  private keyDown = (e: KeyboardEvent): void => {
    if (this.session && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if (this.session?.state.phase === 'playing' && !(e.target instanceof HTMLInputElement)) this.keys.add(e.code);
  };
  private keyUp = (e: KeyboardEvent): void => { this.keys.delete(e.code); };
  private visibility = (): void => { if (document.hidden) this.pauseRun(); };
  private pauseRun = (): void => { this.keys.clear(); this.clock.reset(); this.session?.pause(); if (this.session) this.ui.render(this.session.state); this.audio.sync(this.save.data.settings, false, 0); };
  update(_time: number, delta: number): void {
    const s = this.session?.state;
    if (!s) { this.worldView.draw(this.menuState, true, this.save.data.settings.reducedEffects); this.audio.sync(this.save.data.settings, false, 0); return; }
    const input = { x: Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft')), y: Number(this.keys.has('KeyS') || this.keys.has('ArrowDown')) - Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) };
    this.clock.advance(delta / 1000, () => s.phase === 'playing', dt => this.session?.step(dt, input));
    if (s.settled && !this.paid) {
      this.paid = true; this.save.data.currency += s.reward;
      if (s.phase === 'victory') this.save.data.echo = true;
      this.save.write();
    }
    this.audio.sync(this.save.data.settings, s.phase !== 'paused', s.time, s.phase === 'playing');
    for (const cue of s.cues.splice(0)) {
      this.audio.cue(cue);
      if ((cue === 'hit' || cue === 'beacon') && this.save.data.settings.shake && !this.save.data.settings.reducedEffects) this.cameras.main.shake(80, 0.002);
    }
    this.worldView.draw(s, false, this.save.data.settings.reducedEffects);
    this.uiElapsed += delta;
    if (this.uiElapsed >= 80 || s.phase !== 'playing') { this.ui.render(s); this.uiElapsed = 0; }
  }
  private dispose(): void {
    // Mỗi owner tháo listener/DOM/audio của mình; state lượt không được tái dùng.
    this.lifecycle.abort(); this.disposeDebug?.(); this.ui.dispose(); this.worldView.dispose(); this.audio.dispose(); this.keys.clear(); this.session = undefined;
  }
}

