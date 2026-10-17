import Phaser from 'phaser';
import { PRESENTATION as P } from '../config/presentation';
/** Pool thuần hình ảnh, không physics/listener/tween. Mỗi frame reset đầy đủ trước tái sử dụng. */
export class SpritePool {
  private images: Phaser.GameObjects.Image[] = [];
  private cursor = 0;
  constructor(private scene: Phaser.Scene) {}
  begin(): void { this.cursor = 0; }
  draw(key: string, asset: string, x: number, y: number, size: number, rotation = 0, alpha = 1, tint = 0xffffff, depth = 1): void {
    if (this.cursor >= P.spriteCap) return;
    let image = this.images[this.cursor];
    if (!image) { image = this.scene.add.image(0, 0, 'world-atlas', asset); this.images.push(image); }
    // Không giữ owner/value/TTL trên image: authoritative state không nằm trong pool.
    image.name = key; image.setActive(true).setVisible(true).setTexture('world-atlas', asset).setOrigin(0.5).setPosition(x, y).setDisplaySize(size, size).setRotation(rotation).setAlpha(alpha).setTint(tint).setDepth(depth);
    this.cursor++;
  }
  end(): void { for (let i = this.cursor; i < this.images.length; i++) this.images[i].setActive(false).setVisible(false); }
  get capacity(): number { return this.images.length; }
  get active(): number { return this.cursor; }
  dispose(): void { for (const image of this.images) image.destroy(); this.images.length = 0; }
}
