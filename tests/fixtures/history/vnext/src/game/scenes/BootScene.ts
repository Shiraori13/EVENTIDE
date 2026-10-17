import Phaser from 'phaser';
import { manifest } from '../../assets/manifest';
import { createFallbacks } from '../../assets/proceduralTextures';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload(): void {
    this.load.on('progress', (value: number) => { const el = document.querySelector('.boot'); if (el) el.textContent = `Khởi động hải đăng… ${Math.round(value * 100)}%`; });
    this.load.on('loaderror', () => { const el = document.querySelector('.boot'); if (el) el.textContent = 'Một hình ảnh không tải được. Đang tạo hình thay thế…'; });
    for (const asset of manifest) this.load.svg(asset.id, `${import.meta.env.BASE_URL}${asset.path}`, { width: asset.width, height: asset.height });
  }
  create(): void { createFallbacks(this); this.scene.start('World'); }
}
