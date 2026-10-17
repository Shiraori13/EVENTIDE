import Phaser from 'phaser';
import { BALANCE as B } from '../config/balance';
import { seededRandom } from '../core/math';
import type { RunState } from '../core/types';
import { dronePositions } from '../systems/WeaponSystem';
/** Phaser chỉ trình bày RunState; sprite tái sử dụng theo ID, không chứa luật gameplay. */
export class WorldRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private sprites = new Map<string, Phaser.GameObjects.Image>();
  private used = new Set<string>();
  constructor(private scene: Phaser.Scene) {
    const rng = seededRandom(777), backdrop = scene.add.graphics().setDepth(-10);
    for (let i = 0; i < 1700; i++) {
      backdrop.fillStyle(i % 11 === 0 ? 0xb0d2ee : 0x69829e, 0.14 + rng() * 0.55);
      backdrop.fillCircle((rng() - 0.5) * 5200, (rng() - 0.5) * 5200, rng() > 0.97 ? 2 : 0.7);
    }
    for (let i = 0; i < 70; i++) {
      const a = rng() * Math.PI * 2, radius = 260 + rng() * 1500;
      scene.add.image(Math.cos(a) * radius, Math.sin(a) * radius, 'ruin').setAlpha(0.6).setRotation(rng() * 7).setScale(0.6 + rng()).setDepth(-9);
    }
    this.graphics = scene.add.graphics().setDepth(-1);
  }
  private sprite(key: string, asset: string, x: number, y: number, size: number, rotation = 0, alpha = 1): void {
    this.used.add(key);
    let img = this.sprites.get(key);
    if (!img) { img = this.scene.add.image(x, y, asset); this.sprites.set(key, img); }
    img.setTexture(asset).setPosition(x, y).setDisplaySize(size, size).setRotation(rotation).setAlpha(alpha);
  }
  draw(s: RunState, menu = false, reduced = false): void {
    const g = this.graphics; g.clear(); this.used.clear();
    this.scene.cameras.main.centerOn(menu ? -330 : s.player.x, menu ? -30 : s.player.y);
    g.fillStyle(0x48b7c7, 0.022); g.fillCircle(0, 0, B.lightRadius);
    g.lineStyle(1.5, 0xb9a36c, 0.28); g.strokeCircle(0, 0, B.lightRadius);
    g.lineStyle(1, 0x3b5e75, 0.2); g.strokeCircle(0, 0, 340); g.strokeCircle(0, 0, 180);
    g.lineStyle(2, 0xa7739c, 0.5); g.strokeCircle(0, 0, B.arenaRadius);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.lineStyle(1, 0x658294, 0.18); g.lineBetween(Math.cos(a) * 70, Math.sin(a) * 70, Math.cos(a) * 130, Math.sin(a) * 130); }
    const pulse = reduced ? 1 : 1 + Math.sin(s.time * 2) * 0.08;
    for (let i = 3; i > 0; i--) { g.fillStyle(0xffce76, 0.018); g.fillCircle(0, 0, (50 + i * 32) * pulse); }
    g.lineStyle(3, 0xffd281, 0.8); g.beginPath(); g.arc(0, 0, 63, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (menu ? 0.76 : s.time / B.duration)); g.strokePath();
    this.sprite('beacon', 'beacon', 0, 0, 92, s.time * 0.05);
    if (menu) {
      this.sprite('nova', 'nova', -130, 160, 43, -0.5);
    } else {
      for (const p of s.pickups) this.sprite(`xp${p.id}`, 'stardust', p.x, p.y, p.value > 20 ? 18 : 11, Math.PI / 6, 0.9);
      for (const w of s.wells) {
        g.fillStyle(0x53e0c8, 0.05); g.fillCircle(w.x, w.y, w.radius); g.lineStyle(2, 0x70efd5, 0.7); g.strokeCircle(w.x, w.y, w.radius);
        this.sprite(`well${w.end}`, 'well', w.x, w.y, 42, s.time);
      }
      if (s.gravity) {
        const v = s.gravity, warning = s.time < v.start;
        g.lineStyle(warning ? 2 : 1, warning ? 0xe8b887 : 0xb286d9, warning ? 0.85 : 0.4); g.strokeCircle(v.x, v.y, B.gravityRadius);
        g.fillStyle(0x8b56b7, 0.07); g.fillCircle(v.x, v.y, B.gravityRadius);
        for (let i = 0; i < 3; i++) { g.lineStyle(2, 0xac73d4, warning ? 0.15 : 0.5); g.strokeEllipse(v.x, v.y, 70 + i * 45, 30 + i * 30); }
        if (!warning) { g.fillStyle(0x030613); g.fillCircle(v.x, v.y, 28); }
      }
      for (const e of s.enemies) {
        this.sprite(`enemy${e.id}`, e.kind, e.x, e.y, e.radius * 2.6, e.kind === 'elder' ? s.time * 0.15 : Math.atan2(s.player.y - e.y, s.player.x - e.x));
        if (e.target === 'beacon') { g.lineStyle(2, 0xffd28a, 0.95); g.strokeTriangle(e.x, e.y - e.radius - 13, e.x - 5, e.y - e.radius - 6, e.x + 5, e.y - e.radius - 6); }
        if (e.hp < e.maxHP && e.kind !== 'elder') { g.fillStyle(0x392744); g.fillRect(e.x - 16, e.y + e.radius + 5, 32, 3); g.fillStyle(0xf9a1c9); g.fillRect(e.x - 16, e.y + e.radius + 5, 32 * Math.max(0, e.hp / e.maxHP), 3); }
      }
      for (const p of s.projectiles) {
        if (p.hostile) { g.fillStyle(0xf28faa); g.lineStyle(1.5, 0xffefdf); g.fillTriangle(p.x, p.y - 7, p.x - 6, p.y + 6, p.x + 6, p.y + 6); g.strokeTriangle(p.x, p.y - 7, p.x - 6, p.y + 6, p.x + 6, p.y + 6); }
        else { g.fillStyle(p.blast > 100 ? 0xffdb8d : 0x8cf4ff); g.fillCircle(p.x, p.y, p.radius); }
      }
      for (const [i, p] of dronePositions(s).entries()) this.sprite(`drone${i}`, 'drones', p.x, p.y, 30, s.time * 2);
      if (s.beam) {
        const b = s.beam, active = s.time >= b.fire;
        g.lineStyle(active ? B.bossBeamWidth * 2 : 2, active ? 0xffd2cc : 0xef91b4, active ? 0.65 : 0.9);
        g.lineBetween(b.x, b.y, b.x + Math.cos(b.angle) * B.beamLength, b.y + Math.sin(b.angle) * B.beamLength);
      }
      if (s.corruption >= 50) { g.lineStyle(2, 0xef86d6, 0.5); g.strokeCircle(s.player.x, s.player.y, 27); }
      this.sprite('nova', 'nova', s.player.x, s.player.y, 43, s.player.angle, s.time < s.player.protectedUntil && !reduced ? 0.5 + Math.sin(s.time * 35) * 0.3 : 1);
      if (s.player.leechUntil > s.time) { g.lineStyle(3, 0xf67fbd); g.strokeCircle(s.player.x, s.player.y, 22); }
      if (!reduced) for (const e of s.effects) { g.lineStyle(2, e.color, (e.end - s.time) / 0.4); g.strokeCircle(e.x, e.y, e.radius * (1 - (e.end - s.time) / 0.5)); }
      if (s.phase === 'victory') { g.lineStyle(8, 0xffdc9e, 0.45); g.strokeCircle(0, 0, 360); g.fillStyle(0x72e4cb, 0.08); g.fillCircle(0, 0, B.lightRadius); }
    }
    for (const [key, sprite] of this.sprites) if (!this.used.has(key)) { sprite.destroy(); this.sprites.delete(key); }
  }
  dispose(): void { for (const sprite of this.sprites.values()) sprite.destroy(); this.sprites.clear(); }
}
