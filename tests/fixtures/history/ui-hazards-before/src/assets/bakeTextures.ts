import Phaser from 'phaser';
import { manifest } from './manifest';
import { seededRandom } from '../game/core/math';
import { PRESENTATION as P, SPACE_VISUALS as V } from '../game/config/presentation';
import { COLORS as C } from '../game/config/design';
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
  // Gộp tinh vân/galaxy/sao vào một tile opaque: tránh ba lớp alpha lớn gây overdraw trên software renderer.
  for (const [quality, count] of [['high', P.high.stars], ['medium',P.medium.stars], ['low', P.low.stars]] as const) {
    const size = V.backgroundSize, stars = scene.textures.createCanvas(`stars-${quality}`, size, size); if (!stars) continue;
    const ctx = stars.context, rng = seededRandom(1401);ctx.fillStyle='#050914';ctx.fillRect(0,0,size,size);
    // Các ellipse mờ wrap cả hai trục: nền liền mạch, không mép gradient/đầu nét Bézier khi camera pan.
    for(let i=0;i<28;i++){
      const a=i/27*Math.PI*1.35,x=620+Math.cos(a)*300,y=520+Math.sin(a)*290;
      for(const ox of[-size,0,size])for(const oy of[-size,0,size]){
        ctx.save();ctx.translate(x+ox,y+oy);ctx.rotate(a+.4);ctx.scale(1,.45);
        const gradient=ctx.createRadialGradient(0,0,0,0,0,180);gradient.addColorStop(0,i%3?'#8063b509':'#386f950c');gradient.addColorStop(.45,'#355f7e05');gradient.addColorStop(1,'#05091400');
        ctx.fillStyle=gradient;ctx.fillRect(-180,-180,360,360);ctx.restore();
      }
    }
    const clouds = quality === 'high' ? V.highClouds : quality==='medium'?5:V.lowClouds;
    for (let i = 0; i < clouds; i++) {
      const x = rng()*size, y=rng()*size, radius=180+rng()*100;
      // Wrap các bản sao tại biên ngay lúc bake để pan qua tile không có seam.
      for (const ox of [-size,0,size]) for (const oy of [-size,0,size]) {
        const gradient = ctx.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,radius);
        gradient.addColorStop(0,i%2?'#8063b52d':'#386f9525'); gradient.addColorStop(1,'#080e2000');ctx.fillStyle=gradient;ctx.fillRect(x+ox-radius,y+oy-radius,radius*2,radius*2);
      }
    }
    const dots = quality === 'high' ? V.highGalaxyDots : quality==='medium'?180:V.lowGalaxyDots;
    for (let i=0;i<dots;i++) { const a=i*0.14, r=5+i*0.52;ctx.fillStyle='#b0a2dd28';ctx.fillRect(size*0.68+Math.cos(a)*r,size*0.48+Math.sin(a)*r*0.32,1,1); }
    const starRng=seededRandom(777);
    for (let i=0;i<count;i++) {ctx.fillStyle=i%7?'#6b839d66':'#bcc6de88';ctx.fillRect(starRng()*size,starRng()*size,i%7?0.8:1.3,i%7?0.8:1.3);}stars.refresh();
  }
  const light = scene.textures.createCanvas('light-disc', 1024, 1024);
  if (light) {
    const ctx = light.context; ctx.fillStyle = '#efcb8306'; ctx.strokeStyle = `#${C.gold.toString(16)}50`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(512, 512, 510, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const radius of [289, 153]) { ctx.strokeStyle = '#3b5e7538'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(512, 512, radius, 0, Math.PI * 2); ctx.stroke(); } light.refresh();
  }
}
