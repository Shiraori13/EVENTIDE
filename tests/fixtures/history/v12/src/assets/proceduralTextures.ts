import Phaser from 'phaser';
import { manifest } from './manifest';
/** Fallback có chủ đích cho file thiếu; hitbox luôn do config quyết định. */
export function createFallbacks(scene: Phaser.Scene): void {
  for (const entry of manifest) if (!scene.textures.exists(entry.id)) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.lineStyle(3, entry.id === 'beacon' ? 0xffd681 : 0x76e8ee); g.strokeRect(12, 12, 40, 40); g.lineBetween(12, 12, 52, 52);
    g.generateTexture(entry.id, 64, 64); g.destroy();
  }
}
