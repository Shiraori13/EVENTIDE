import { botInput as autoplayInput, chooseBotUpgrade } from './Autoplay';
import Phaser from 'phaser';
import type { GameSession } from '../core/GameSession';
import { BALANCE as B, BOSS_PHASES, ENEMY_SCALING } from '../config/balance';
import { seededRandom } from '../core/math';
import { makeEnemy, minuteAt } from '../systems/SpawnSystem';
import { dropXP } from '../systems/CombatSystem';
import type { Vec } from '../core/types';
import { clearGroundXP } from '../systems/PickupSystem';
import { canvasTextStyle, loadFonts, normalizeText, VIETNAMESE_SAMPLE } from '../services/FontService';
export type Scenario = 'light' | 'dense' | 'xp' | 'endgame' | 'storm';
const SCENARIOS = { light: { enemies: 8, bullets: 12, drops: 18, time: 20 }, dense: { enemies: 110, bullets: 120, drops: 100, time: 400 }, xp: { enemies: 80, bullets: 80, drops: 2400, time: 400 }, endgame: { enemies: 110, bullets: 120, drops: 140, time: 635 }, storm: { enemies: 110, bullets: 120, drops: 140, time: 635 } } as const;
interface Measure { median: number; p95: number; p99: number; max: number; over33: number; over50: number; samples: number }
function summary(values: number[]): Measure {
  const data = [...values].sort((a, b) => a - b), at = (p: number): number => +(data[Math.min(data.length - 1, Math.floor(data.length * p))] ?? 0).toFixed(3);
  return { median: at(0.5), p95: at(0.95), p99: at(0.99), max: at(1), over33: data.filter(x => x > 33.3).length, over50: data.filter(x => x > 50).length, samples: data.length };
}
export interface PerfAPI { scenario(name: Scenario): void; longRun(): void; reset(): void; report(): ReturnType<PerfSampler['report']>; counters(): Record<string, number>; typography(): Promise<void>; clearTypography(): void; }
declare global { interface Window { __eventidePerf?: PerfAPI } }
/** Đo DEV/test bằng buffer hữu hạn, không tạo timer combat hoặc ghi save người chơi. */
export class PerfSampler {
  private samples: Record<string, number[]> = {};
  private last = 0; private currentStart = 0; private markTime = 0;
  private heap: number[] = []; private counts: Record<string, number> = {};
  private counterStart: Record<string, number> = {}; private counterEnd: Record<string, number> = {};
  private countFrames = 0; private overlay?: HTMLPreElement;
  private fixture?: Scenario; private fixtureStart = 0;
  private autoRun = false;
  private longTasks = 0; private observer?: PerformanceObserver;
  private fontSamples: Phaser.GameObjects.GameObject[] = [];
  constructor(private scene: Phaser.Scene, private getSession: () => GameSession | undefined, private newSession: (seed?: number) => GameSession, private rendererCounts: () => Record<string, number>) {
    if (new URLSearchParams(location.search).get('overlay') === '1') { this.overlay = document.createElement('pre'); this.overlay.id = 'perf-overlay'; this.overlay.style.cssText = 'position:fixed;left:8px;top:150px;z-index:1000;background:#061021ed;color:#b4f6e3;font:12px monospace;padding:10px;pointer-events:none'; document.body.append(this.overlay); }
    try { this.observer = new PerformanceObserver(list => { this.longTasks += list.getEntries().length; }); this.observer.observe({ type: 'longtask', buffered: false }); } catch { /* Trình duyệt có thể thiếu API này. */ }
    window.__eventidePerf = { scenario: name => this.loadScenario(name), longRun: () => this.longRun(), reset: () => this.reset(), report: () => this.report(), counters: () => this.readCounts(), typography: () => this.typography(), clearTypography: () => this.clearTypography() };
  }
  reset(): void { this.samples = {}; this.heap = []; this.counts = {}; this.countFrames = 0; this.counterStart = this.readCounts(); this.last = 0; this.longTasks = 0; }
  private add(key: string, value: number): void { const a = this.samples[key] ??= []; if (a.length < 50000) a.push(value); }
  beginFrame(): void { const now = performance.now(); if (this.last) this.add('frame', now - this.last); this.last = now; this.currentStart = now; }
  beginStep(): void { this.markTime = performance.now(); }
  mark(label: string): void { const now = performance.now(); this.add(label, now - this.markTime); this.markTime = now; }
  measure(label: string, start: number): void { this.add(label, performance.now() - start); }
  endFrame(): void {
    this.add('sceneCPU', performance.now() - this.currentStart);
    this.countFrames++; const counts = this.readCounts(); this.counterEnd = counts;
    for (const [key, value] of Object.entries(counts)) this.counts[key] = (this.counts[key] ?? 0) + value;
    if (this.countFrames % 60 === 0) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory; if (memory && this.heap.length < 2000) this.heap.push(memory.usedJSHeapSize);
      if (this.overlay) this.overlay.textContent = `DEV · ${this.fixture ?? 'đang chơi'}\n${JSON.stringify(counts, null, 1)}`;
    }
  }
  private readCounts(): Record<string, number> {
    const s = this.getSession()?.state;
    const timerEvents: unknown = Reflect.get(this.scene.time, '_active');
    return { enemies: s?.enemies.length ?? 0, projectiles: s?.projectiles.length ?? 0, pickupLogic: (s?.pickups.length ?? 0) + (s?.loot.ledgerCount ?? 0), pickupActive: s?.pickups.length ?? 0, ledgerCells: s?.loot.ledgerCount ?? 0, groundXP: (s?.pickups.reduce((n, p) => n + p.value, 0) ?? 0) + (s?.loot.ledgerXP ?? 0), lootCreated: s?.loot.created ?? 0, lootCollected: s?.loot.collected ?? 0, effects: s?.effects.length ?? 0, salvage: s?.salvage.items.length ?? 0, salvageCapHits: s?.salvage.capHits ?? 0, pulses: s?.pulses.length ?? 0, ionTraces: s?.ionTraces.length ?? 0, physicsBodies: 0, children: this.scene.children.length, textures: this.scene.textures.getTextureKeys().length, tweens: this.scene.tweens.getTweens().length, timers: Array.isArray(timerEvents) ? timerEvents.length : -1, sceneListeners: this.scene.events.eventNames().reduce((n, event) => n + this.scene.events.listenerCount(event), 0), ...this.rendererCounts() };
  }
  report() {
    const renderer = this.scene.game.renderer, canvas = this.scene.game.canvas;
    const gl = renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer ? renderer.gl : undefined;
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    const detail = ext && gl ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'không khả dụng';
    return { scenario: this.fixture, seed: 20261016, mode: import.meta.env.MODE, userAgent: navigator.userAgent, hardwareConcurrency: navigator.hardwareConcurrency, dpr: devicePixelRatio, viewport: [innerWidth, innerHeight], canvas: [canvas.width, canvas.height], renderer: gl ? 'WebGL' : 'Canvas', gpu: detail, metrics: Object.fromEntries(Object.entries(this.samples).map(([key, a]) => [key, summary(a)])), counters: { start: this.counterStart, end: this.counterEnd, average: Object.fromEntries(Object.entries(this.counts).map(([k, v]) => [k, +(v / Math.max(1, this.countFrames)).toFixed(2)])) }, heap: { samples: this.heap.length, start: this.heap[0], end: this.heap.at(-1), min: Math.min(...this.heap), max: Math.max(...this.heap) }, longTasks: this.longTasks, simulationSeconds: this.getSession()?.state.time, fixtureStart: this.fixtureStart };
  }
  loadScenario(name: Scenario): void {
    this.autoRun = false; this.fixture = name; const session = this.newSession(), s = session.state, data = SCENARIOS[name], rng = seededRandom(20261016);
    s.time = data.time; s.minuteIndex = minuteAt(s.time); this.fixtureStart = s.time; s.player.x = (name === 'endgame' || name === 'storm') ? 1050 : 0; s.player.y = (name === 'endgame' || name === 'storm') ? 350 : 110;
    s.player.hp = s.player.maxHP = 1e8; s.beacon.hp = s.beacon.maxHP = 1e8;
    s.modules = { plasma: 5, drones: 5, well: 5 }; s.supports = { power: 5, haste: 5 }; clearGroundXP(s);
    if (name === 'storm') { s.modules = { plasma: 5, pulsar: 5, ion: 5 }; s.salvage.bonuses.rate = 2000; }
    s.nextSpawn = Infinity; s.bossSpawned = true; s.finalGravity = (name === 'endgame' || name === 'storm'); s.nextGravity = Infinity;
    if ((name === 'endgame' || name === 'storm')) { const boss = makeEnemy(s, 'elder', { x: 1400, y: 220 }, 'player'); boss.bossPhase = 'phase2'; boss.speed = B.bossSpeed * BOSS_PHASES.speedMultiplier; boss.hp = boss.maxHP = 1e8; s.gravity = { ...B.finalGravityPosition, start: s.time + 2, end: 10000, final: true }; s.bossRing = s.time + 2; s.bossBeam = s.time + 3; }
    for (let i = 0; i < data.drops; i++) {
      const a = rng() * Math.PI * 2, r = 400 + rng() * 1200;
      dropXP(s, { x: Math.cos(a) * r, y: Math.sin(a) * r }, 5);
    }
    session.probe = this; this.afterSimulation(); this.reset();
  }
  input(): Vec | undefined {
    if (this.autoRun) return this.botInput();
    if (!this.fixture) return undefined;
    const t = (this.getSession()?.state.time ?? 0) - this.fixtureStart;
    return { x: Math.sin(t * 0.7), y: Math.cos(t * 0.9) };
  }
  stopScenario(): void { this.fixture = undefined; this.autoRun = false; const session = this.getSession(); if (session) session.probe = undefined; }
  private longRun(): void { this.stopScenario(); const session = this.newSession(42); this.autoRun = true; this.fixtureStart = 0; session.probe = this; this.reset(); }
  beforeSimulation(): void {
    const session = this.getSession(); if (!this.autoRun || !session) return;
    while (session.state.phase === 'choosingUpgrade') chooseBotUpgrade(session, ['hull', 'armor'], ['plasma', 'pulsar', 'ion']);
  }
  /** Bot QA đi thật bằng input vector qua clock bình thường; không tăng HP/XP/tốc độ hoặc nhảy time. */
  private botInput(): Vec | undefined { const s = this.getSession()?.state; return s ? autoplayInput(s) : undefined; }
  afterSimulation(): void {
    const s = this.getSession()?.state; if (!s || !this.fixture) return;
    const data = SCENARIOS[this.fixture];
    while (s.enemies.length < data.enemies) {
      const i = s.enemies.length, a = i * 2.399, r = 170 + (i % 7) * 48;
      const e = makeEnemy(s, i % 4 === 0 ? 'drifter' : i % 5 === 0 ? 'leech' : 'wisp', { x: s.player.x + Math.cos(a) * r, y: s.player.y + Math.sin(a) * r }, i % 4 === 0 ? 'beacon' : 'player'); e.hp = e.maxHP = 1e8;
      if (e.kind !== 'elder') e.baseHP = 1e8 / (1 + ENEMY_SCALING[e.kind].hp * minuteAt(s.time));
    }
    while (s.projectiles.length < data.bullets) {
      const i = s.projectiles.length, a = i * 2.399, r = 180 + (i % 11) * 30;
      s.projectiles.push({ id: s.nextId++, x: s.player.x + Math.cos(a) * r, y: s.player.y + Math.sin(a) * r, vx: Math.sin(a) * 80, vy: Math.cos(a) * 80, ttl: 10, damage: 12, blast: 0, hostile: i % 2 === 0, radius: 7 });
    }
  }
  private async typography(): Promise<void> {
    await loadFonts(); this.clearTypography();
    const width = this.scene.scale.width, height = this.scene.scale.height;
    this.fontSamples.push(this.scene.add.rectangle(0, 0, width, height, 0x081322).setOrigin(0).setScrollFactor(0).setDepth(100));
    for (const [i, title] of [false, true].entries()) {
      const text = this.scene.add.text(20 + width / 2 * i, 25, normalizeText(VIETNAMESE_SAMPLE), { ...canvasTextStyle(title), fontSize: '20px', lineSpacing: 12, wordWrap: { width: width / 2 - 45 } }).setScrollFactor(0).setDepth(101);
      this.fontSamples.push(text);
    }
  }
  private clearTypography(): void { for (const sample of this.fontSamples) sample.destroy(); this.fontSamples.length = 0; }
  dispose(): void { this.clearTypography(); this.observer?.disconnect(); this.overlay?.remove(); delete window.__eventidePerf; }
}
