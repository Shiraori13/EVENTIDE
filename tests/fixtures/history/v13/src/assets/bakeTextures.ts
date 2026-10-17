import Phaser from 'phaser';
import { manifest } from './manifest';
import { seededRandom } from '../game/core/math';
/** Gom sprite nhỏ vào một atlas khi boot, giảm texture switch; không sinh lại khi đổi quality. */
export function bakeTextures(scene: Phaser.Scene): void {
  const atlas = scene.textures.createCanvas('world-atlas', 1024, Math.ceil(manifest.length / 8) * 128);
  if (atlas) {
    for (let i = 0; i < manifest.length; i++) {
      const entry = manifest[i], x = i % 8 * 128, y = Math.floor(i / 8) * 128;
      atlas.context.drawImage(scene.textures.get(entry.id).getSourceImage() as HTMLImageElement, x, y, entry.width, entry.height); atlas.add(entry.id, 0, x, y, entry.width, entry.height);
    }
    atlas.refresh();
  }
  for (const [quality, count] of [['high', 16], ['low', 8]] as const) {
    const stars = scene.textures.createCanvas(`stars-${quality}`, 512, 512); if (!stars) continue;
    const rng = seededRandom(777), ctx = stars.context;
    for (let i = 0; i < count; i++) { ctx.fillStyle = i % 7 ? '#6b839d99' : '#d1dfefcc'; ctx.beginPath(); ctx.arc(rng() * 512, rng() * 512, i % 7 ? 0.8 : 1.5, 0, Math.PI * 2); ctx.fill(); } stars.refresh();
  }
  const light = scene.textures.createCanvas('light-disc', 1024, 1024);
  if (light) {
    const ctx = light.context; ctx.fillStyle = '#48b7c706'; ctx.strokeStyle = '#b9a36c55'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(512, 512, 510, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const radius of [289, 153]) { ctx.strokeStyle = '#3b5e7538'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(512, 512, radius, 0, Math.PI * 2); ctx.stroke(); } light.refresh();
  }
}
