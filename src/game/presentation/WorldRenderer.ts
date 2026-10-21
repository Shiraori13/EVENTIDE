import { BossPresentation } from './BossPresentation';
import { drawHazardZones } from './HazardPresentation';
import { isBoss } from '../config/bosses';
import { SpaceBackdrop } from './SpaceBackdrop';
import { strokeArc } from './geometry';
import { drawBeacon } from './BeaconPresentation';
import { COLORS as C } from '../config/design';
import Phaser from 'phaser';
import { BALANCE as B, BOSS_PHASES } from '../config/balance';
import { PRESENTATION as P } from '../config/presentation';
import { seededRandom } from '../core/math';
import type { RunState, Vec, Settings, Gravity } from '../core/types';
import { DRONES, QUASAR, WEAPON_VISUALS } from '../config/content';
import { ASTRONOMY as A } from '../config/events';
import { playerForce } from '../systems/hazards/forces';
import { tideFlowTime } from '../systems/hazards/forces';
import { tideStrength } from '../systems/hazards/AstronomySystem';
import { beaconFeedback } from './BeaconFeedback';
import { SpritePool } from './SpritePool';
import { cellAxis, LEDGER_SIDE, pickupRadius } from '../systems/PickupSystem';
import { renderX, renderY } from './interpolation';
import { appearanceForCoreLevel } from '../config/beacon';
import { ShipPresentation } from './ShipPresentation';
import { SALVAGE } from '../config/salvage';
/** Chỉ trình bày; simulation sở hữu vị trí va chạm, thời gian, lực hút và damage. */
export class WorldRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private staticWorld: Phaser.GameObjects.Graphics;
  private pool: SpritePool;
  private backdrop: SpaceBackdrop; private hazards: Phaser.GameObjects.Graphics;
  private lastVisualStamp=-1;private lastReduced=false;private lastMotion=false;private lastPlayerHP=0;private shipHitUntil=0;
  private ruins: Phaser.GameObjects.Image[] = [];
  private quality: Settings['quality'] = 'high';
  private bounds = { left: 0, right: 0, top: 0, bottom: 0 };
  private pickupVisuals = 0; private particles = 0;
  private lastState?: RunState; private lastTime = -1; private lastPhase = ''; private lastWidth = 0; private lastHeight = 0;
  private lastBuildRevision = -1;
  private crowded=false;private crowdedUntil=0;
  private ruinBudget:number=P.high.ruins;
  private bossView=new BossPresentation();
  private light: Phaser.GameObjects.Image;
  private previousGravity?: Gravity; private fade?: { x: number; y: number; end: number };
  private ship = new ShipPresentation();
  constructor(private scene: Phaser.Scene) {
    this.pool = new SpritePool(scene);
    // TileSprite có backing canvas bằng size truyền vào cả khi WebGL: chỉ cấp theo viewport.
    this.backdrop=new SpaceBackdrop(scene);this.hazards=scene.add.graphics().setDepth(5);
    const rng = seededRandom(777);
    for (let i = 0; i < P.high.ruins; i++) {
      const a = rng() * Math.PI * 2, r = 260 + rng() * 1500;
      this.ruins.push(scene.add.image(Math.cos(a) * r, Math.sin(a) * r, 'world-atlas', 'ruin').setAlpha(0.55).setRotation(rng() * 7).setScale(0.6 + rng()).setDepth(-9));
    }
    this.light=scene.add.image(0, 0, 'light-disc').setDisplaySize(B.lightRadius * 2, B.lightRadius * 2).setDepth(-8);
    this.staticWorld = scene.add.graphics().setDepth(-7);
    this.staticWorld.lineStyle(2, 0xa7739c, 0.5); this.staticWorld.strokeCircle(0, 0, B.arenaRadius);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; this.staticWorld.lineStyle(1, 0x658294, 0.18); this.staticWorld.lineBetween(Math.cos(a) * 70, Math.sin(a) * 70, Math.cos(a) * 130, Math.sin(a) * 130); }
    this.graphics = scene.add.graphics().setDepth(2);
  }
  private visible(x: number, y: number, radius = 30): boolean {
    return x + radius >= this.bounds.left && x - radius <= this.bounds.right && y + radius >= this.bounds.top && y - radius <= this.bounds.bottom;
  }
  private sprite(key: string, asset: string, x: number, y: number, size: number, rotation = 0, alpha = 1, tint = 0xffffff, depth = 1, aspect=1): void {
    if (this.visible(x, y, size)) this.pool.draw(key, asset, x, y, size, rotation, alpha, tint, depth,aspect);
  }
  private applyQuality(quality: Settings['quality']): void {
    if (quality === this.quality) return; this.quality = quality;
    this.lastTime = -1;
  }
  /** Cùng alpha cho tàu/camera/quái/đạn, không lerp hai lần hoặc làm trễ input qua smoothing. */
  draw(s: RunState, menu = false, reduced = false, quality: Settings['quality'] = 'high', alpha = 1, presentationTime=0, reducedMotion=false): void {
    this.applyQuality(quality);
    const camera = this.scene.cameras.main;
    if (s !== this.lastState) { this.previousGravity = undefined; this.fade = undefined;this.bossView.reset(); this.ship.reset(s.player.angle, s.time);this.lastPlayerHP=s.player.hp;this.shipHitUntil=0;this.crowded=false;this.crowdedUntil=0; }
    const frozen=menu||s.phase!=='playing';if(frozen)alpha=1;
    const px=menu?-130:renderX(s.player,alpha),py=menu?160:renderY(s.player,alpha);
    const time=menu?presentationTime:s.phase==='playing'?Math.max(0,s.time-B.step*(1-alpha)):s.time;
    const moving=Math.hypot(s.player.x-(s.player.previousX??s.player.x),s.player.y-(s.player.previousY??s.player.y))>.01;
    camera.centerOn(menu?-330:px,menu?-30:py);
    // Hysteresis: giảm decoration trước khi đông, chờ2s và ngưỡng thấp hơn mới trả lại, không nhấp quality.
    if(s.enemies.length>75||s.projectiles.length>110){this.crowded=true;this.crowdedUntil=time+2;}
    else if(time>=this.crowdedUntil&&s.enemies.length<50&&s.projectiles.length<80)this.crowded=false;
    const dense=this.crowded;
    const ruins=dense?P.low.ruins:P[quality].ruins;if(this.ruinBudget!==ruins){this.ruinBudget=ruins;this.ruins.forEach((image,i)=>image.setVisible(i<ruins));}
    this.backdrop.draw(camera,time,quality,reducedMotion||reduced,moving&&!frozen,dense);
    const visualStamp=menu&&!reducedMotion&&!reduced?Math.floor(presentationTime*12):0;
    // Pause giữ toàn bộ world/VFX. Menu dùng clock trình bày sẵn có, không tick luật game.
    if(frozen&&this.lastState===s&&this.lastTime===s.time&&this.lastPhase===s.phase&&this.lastBuildRevision===s.buildRevision&&this.lastWidth===camera.width&&this.lastHeight===camera.height&&this.lastVisualStamp===visualStamp&&this.lastReduced===reduced&&this.lastMotion===reducedMotion)return;
    this.lastVisualStamp=visualStamp;this.lastReduced=reduced;this.lastMotion=reducedMotion;
    this.lastBuildRevision=s.buildRevision;this.lastState=s;this.lastTime=s.time;this.lastPhase=s.phase;this.lastWidth=camera.width;this.lastHeight=camera.height;
    const cx = menu ? -330 : px, cy = menu ? -30 : py, padding = P.visualCullPadding;
    this.bounds.left = cx - camera.width / 2 - padding; this.bounds.right = cx + camera.width / 2 + padding;
    this.bounds.top = cy - camera.height / 2 - padding; this.bounds.bottom = cy + camera.height / 2 + padding;
    const g = this.graphics; g.clear();this.hazards.clear(); this.pool.begin(); this.pickupVisuals = 0; this.particles = 0;
    const tier=reduced||dense?'low':quality,budget=P[tier];
    if (this.visible(0, 0, 150)) {
      drawBeacon(g,s,time,menu,reduced||reducedMotion,tier);
      const feedback=beaconFeedback(s,reduced||reducedMotion);
      this.sprite('beacon',appearanceForCoreLevel(s.coreLevel),0,0,menu?142:92,0,feedback.alpha,feedback.tint);

    }
    if (!menu) {
      drawHazardZones(g,s,(x,y,r)=>this.visible(x,y,r),reducedMotion);
      const force=playerForce(s),magnitude=Math.hypot(force.x,force.y);
      if(magnitude>.1){const ux=force.x/magnitude,uy=force.y/magnitude,ax=px+ux*38,ay=py+uy*38;g.lineStyle(2,0xb78ae3,.9);g.lineBetween(px+ux*22,py+uy*22,ax,ay);g.strokeTriangle(ax,ay,ax-ux*7-uy*4,ay-uy*7+ux*4,ax-ux*7+uy*4,ay-uy*7-ux*4);}
      this.drawPickups(s, time);
      for (let index = 0; index < Math.min(s.salvage.items.length, SALVAGE.visualCap); index++) {
        const item = s.salvage.items[index];
        const alpha = item.end - s.time < SALVAGE.blinkSeconds ? 0.5 + Math.sin(time * 12) * 0.3 : 1;
        this.sprite(`salvage${item.id}`, 'salvage', item.x, item.y, 25, 0, alpha);
      }
      for (let i = 0; i < s.wells.length; i++) {
        const w = s.wells[i]; if (!this.visible(w.x, w.y, w.radius)) continue;
        this.drawGravity(w.x, w.y, w.radius, reducedMotion?0:time, false, false, Math.max(0, Math.min(1, (s.time - (w.start ?? w.end - 2)) / (w.end - (w.start ?? w.end - 2)))), budget);
        this.sprite(`well${i}`, s.modules.well === 5 ? 'singularity' : 'well', w.x, w.y, s.modules.well === 5 ? 40 : 31, -time * 0.6, 0.95);
      }
      if (this.previousGravity && this.previousGravity !== s.gravity) this.fade = { x: this.previousGravity.x, y: this.previousGravity.y, end: s.time + 0.6 };
      this.previousGravity = s.gravity;
      if (s.gravity && this.visible(s.gravity.x, s.gravity.y, s.gravity.source === 'tide' ? A.tideRadius : B.gravityRadius)) {
        const v = s.gravity, warning = s.time < v.start;
        this.drawGravity(v.x, v.y, v.source === 'tide' ? A.tideRadius : B.gravityRadius, reducedMotion?0:v.source === 'tide' ? tideFlowTime(s) : time, true, warning, warning ? 1 - (v.start - s.time) / (v.source === 'tide' ? A.warning : B.gravityWarning) : 1, budget);
        if (v.source === 'tide') {
          const outward = tideStrength(s) < 0; g.lineStyle(3,0xb6cfff,0.85);
          for (let i = 0; i < 8; i++) { const a = i*Math.PI/4, r = A.tideRadius*0.65, x=v.x+Math.cos(a)*r, y=v.y+Math.sin(a)*r, sign=outward?1:-1;
            g.lineBetween(x,y,x+Math.cos(a)*28*sign,y+Math.sin(a)*28*sign); for (const side of [-1,1]) g.lineBetween(x+Math.cos(a)*28*sign,y+Math.sin(a)*28*sign,x+Math.cos(a)*15*sign-Math.sin(a)*7*side,y+Math.sin(a)*15*sign+Math.cos(a)*7*side);
          }
        }
        this.sprite('environment', 'well', v.x, v.y, 42, -time * 0.2, warning ? 0.5 : 1, warning ? 0xffd097 : 0xe59ddd, -1);
      }
      if (this.fade && s.time < this.fade.end && this.visible(this.fade.x, this.fade.y, B.gravityRadius)) { g.lineStyle(2, 0xbc8bca, (this.fade.end - s.time) * 0.6); g.strokeCircle(this.fade.x, this.fade.y, B.gravityRadius); }
      let bars = 0;
      for (const e of s.enemies) {
        const x = renderX(e, alpha), y = renderY(e, alpha); if (!this.visible(x, y, e.radius + 15)) continue;
        const target = e.target === 'beacon' ? { x: 0, y: 0 } : s.player;
        const dash = e.kind === 'harrier' && e.boss?.attack?.kind === 'dash' ? e.boss.attack : undefined;
        const facing = dash ? Math.atan2(dash.to.y-dash.y,dash.to.x-dash.x) : e.kind === 'harrier' ? Math.atan2(target.y-e.y,target.x-e.x) : e.kind === 'gravemaw' ? 0 : isBoss(e.kind) ? reducedMotion ? 0 : time * 0.15 : Math.atan2(target.y - e.y, target.x - e.x) + (e.kind === 'leech' && !reduced ? Math.sin(time * 7 + e.id) * 0.06 : 0);
        this.sprite(`enemy${e.id}`, e.kind, x, y, e.radius * 2.6, facing, e.bossPhase === 'transition' ? 0.55 : 1, e.bossPhase === 'phase2' ? 0xffc080 : 0xffffff);
        if (e.bossPhase === 'transition') { const progress = 1 - Math.max(0, (e.transitionEnd ?? s.time) - s.time) / BOSS_PHASES.transitionSeconds; g.lineStyle(3, 0xffd18e, 0.9); g.strokeCircle(x, y, e.radius + 20 + progress * 35); }
        if (e.target === 'beacon') { g.lineStyle(2, 0xffd28a); g.strokeTriangle(x, y - e.radius - 13, x - 5, y - e.radius - 6, x + 5, y - e.radius - 6); }
        if (e.hp < e.maxHP && !isBoss(e.kind) && bars++ < budget.healthBars) {
          g.fillStyle(0x392744); g.fillRect(x - 16, y + e.radius + 5, 32, 3); g.fillStyle(0xf9a1c9); g.fillRect(x - 16, y + e.radius + 5, 32 * Math.max(0, e.hp / e.maxHP), 3);
        }
      }
      for (const p of s.projectiles) {
        const x = renderX(p, alpha), y = renderY(p, alpha), asset = p.hostile ? 'enemyBolt' : p.blast > 100 ? 'shotSupernova' : p.blast ? 'shotSun' : 'shotPlasma';
        this.sprite(`projectile${p.id}`, asset, x, y, p.hostile ? 17 : p.blast ? 26 : 20, Math.atan2(p.vy, p.vx), 1, 0xffffff, 3);
      }
      const droneLevel = s.modules.drones;
      if (droneLevel) {
        const d = DRONES[droneLevel - 1];
        for (let i = 0; i < d.count; i++) { const angle = time * B.droneAngularSpeed + i * Math.PI * 2 / d.count; this.sprite(`drone${i}`, droneLevel === 5 ? 'bastion' : 'drones', px + Math.cos(angle) * d.radius, py + Math.sin(angle) * d.radius, droneLevel === 5 ? 35 : 30, angle); }
      }
      this.bossView.draw(this.hazards,s,alpha,time,reducedMotion);
      // Beam thân thiện cyan có tầm hữu hạn; boss hồng/amber. Nguồn dùng cùng px/py của tàu/camera.
      for (const pulse of s.pulses) {
        const quasar = pulse.source === 'quasar', color = quasar ? 0xb5ffd1 : 0x53d4eb;
        const angle = pulse.startAngle + Math.max(0, Math.min(1, (time - pulse.start) / (pulse.end - pulse.start))) * (quasar ? QUASAR.sweep : Math.PI * 2);
        const x = px + Math.cos(angle) * pulse.range, y = py + Math.sin(angle) * pulse.range;
        g.lineStyle(1, 0x6cddeb, 0.18); g.strokeCircle(px, py, pulse.range);
        g.lineStyle((quasar ? QUASAR.halfWidth : WEAPON_VISUALS.pulsarHalfWidth)*2, color, 0.4); g.lineBetween(px, py, x, y);
        g.lineStyle(2, 0xe0ffff, 0.95); g.lineBetween(px, py, x, y);
        g.fillStyle(0xc8ffff, 0.85); g.fillCircle(px, py, 4); g.fillCircle(x, y, 4 + pulse.level * 0.4);
        g.lineStyle(2, 0x78e9f1, 0.5); strokeArc(g,px,py,pulse.range,Math.max(pulse.startAngle,angle-.45),angle);
      }
      for (const trace of s.ionTraces) {
        const life = Math.max(0, (trace.end - time) / 0.24);
        for (let i = 1; i < trace.points.length; i++) {
          const from = trace.points[i - 1], to = trace.points[i], dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy) || 1;
          let x = from.x, y = from.y;
          for (let j = 1; j <= 5; j++) { const offset = j === 5 ? 0 : (j % 2 ? 1 : -1) * (5 + trace.level); const nx = from.x + dx * j / 5 - dy / length * offset, ny = from.y + dy * j / 5 + dx / length * offset;
            g.lineStyle(4, 0x9695ff, life * 0.45); g.lineBetween(x, y, nx, ny); g.lineStyle(1.4, 0xf0e7ff, life); g.lineBetween(x, y, nx, ny); x = nx; y = ny; }
          g.fillStyle(0xc9beff, life * 0.7); g.fillCircle(to.x, to.y, 4);
        }
      }
      if (s.corruption >= 50) { g.lineStyle(2, 0xef86d6, 0.6); g.strokeCircle(px, py, 27); }
      this.ship.update(s.player.angle,moving&&s.phase==='playing',time,reducedMotion);
      if(this.ship.thrust>.02){const count=reducedMotion?1:budget.trail;
        for(let i=1;i<=count;i++){const length=18+i*(5+this.ship.thrust*3),x=px-Math.cos(this.ship.angle)*length,y=py-Math.sin(this.ship.angle)*length;
          g.lineStyle(Math.max(1,4-i*.65),i===1?C.gold:C.cyan,this.ship.thrust*.65/i);g.lineBetween(x,y,x-Math.cos(this.ship.angle)*8,y-Math.sin(this.ship.angle)*8);}
      }
      if(s.player.hp<this.lastPlayerHP)this.shipHitUntil=time+.12;this.lastPlayerHP=s.player.hp;
      const hit=time<this.shipHitUntil;
      this.sprite('nova','nova',px,py,43,this.ship.angle+this.ship.bank*.25,1,hit?C.danger:0xffffff,3,1-Math.abs(this.ship.bank));
      if(hit){g.lineStyle(2,C.danger,.95);for(const side of[-1,1]){g.lineBetween(px+side*25,py-12,px+side*25,py+12);}}
      if (s.player.leechUntil > s.time) { g.lineStyle(3, 0xf67fbd); g.strokeCircle(px, py, 22); }
      if (!reduced) for (const e of s.effects) if (this.visible(e.x, e.y, e.radius)) {
        const life = Math.max(0, (e.end - s.time) / 0.4); g.lineStyle(2, e.color, life * 0.7); g.strokeCircle(e.x, e.y, e.radius * (1 - life * 0.8));
        if (e.radius > 60) { g.lineStyle(1, e.color, life * 0.25); g.strokeCircle(e.x, e.y, e.radius); }
      }
      if (s.phase === 'victory') { g.lineStyle(8, 0xffdc9e, 0.45); g.strokeCircle(0, 0, B.lightRadius); }
    } else this.sprite('nova', 'nova', px, py, 43, -0.5);
    this.pool.end();
  }
  /** Radius luôn là world unit từ gameplay; các hạt chỉ mô tả hướng, không làm damage/lực. */
  private drawGravity(x: number, y: number, radius: number, time: number, environment: boolean, warning: boolean, progress: number, budget: typeof P.high | typeof P.medium | typeof P.low): void {
    const g = this.graphics, color = environment ? warning ? 0xf2bf85 : 0xd48dc9 : 0x78e7e2;
    g.lineStyle(warning ? 2 : 1.5, color, 0.7);
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; strokeArc(g,x,y,radius,a,a+Math.PI/12); }
    g.lineStyle(2, color, 0.85);strokeArc(g,x,y,radius*(environment?.14:.22),-Math.PI/2,-Math.PI/2+progress*Math.PI*2);
    if (warning) { g.lineStyle(1, color, 0.5); g.strokeCircle(x, y, 18 + (1 - progress) * 38); return; }
    g.fillStyle(0x030915, 0.9); g.fillCircle(x, y, environment ? 22 : 14);
    g.lineStyle(2, color, 0.75); g.strokeEllipse(x, y, environment ? 95 : 65, environment ? 40 : 27);
    const count = Math.min(budget.perGravity, budget.suctionParticles - this.particles);
    for (let i = 0; i < count; i++) {
      const phase = ((time * 0.42 + i / Math.max(1, count)) % 1 + 1) % 1, r = radius * (1 - phase), a = i * 2.399 + time * 0.7 + phase * 4;
      const nextR = Math.max(10, r - 16), nextA = a + 0.16;
      g.lineStyle(1.3, color, 0.25 + phase * 0.55); g.lineBetween(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(nextA) * nextR, y + Math.sin(nextA) * nextR);
    }
    this.particles += count;
  }
  private drawPickups(s: RunState, time: number): void {
    const max = P.maxActivePickupVisuals - 1, radius = pickupRadius(s) + 70, r2 = radius * radius;
    let overflow = 0;
    const draw = (key: string, p: Vec, value: number): void => {
      if (!this.visible(p.x, p.y, 20)) return;
      if (this.pickupVisuals >= max) { if ((p.x - s.player.x) ** 2 + (p.y - s.player.y) ** 2 <= r2) overflow += value; return; }
      this.sprite(key, value >= 15 ? 'stardustCluster' : 'stardust', p.x, p.y, value >= 60 ? 24 : value >= 15 ? 18 : 12, Math.PI / 6, 0.9 + Math.sin(time * 2 + p.x) * 0.06); this.pickupVisuals++;
    };
    // Ưu tiên marker ledger gần tàu trước orb xa; logic thu thập không phụ thuộc culling/budget.
    if (s.loot?.ledgerCount) {
      const x0 = cellAxis(this.bounds.left), x1 = cellAxis(this.bounds.right), y0 = cellAxis(this.bounds.top), y1 = cellAxis(this.bounds.bottom);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const index = y * LEDGER_SIDE + x, cell = s.loot.cells[index]; if (cell) draw(`cell${index}`, cell, cell.value); }
    }
    for (const p of s.pickups) if ((p.x - s.player.x) ** 2 + (p.y - s.player.y) ** 2 <= r2) draw(`xp${p.id}`, p, p.value);
    for (const p of s.pickups) if ((p.x - s.player.x) ** 2 + (p.y - s.player.y) ** 2 > r2) draw(`xp${p.id}`, p, p.value);
    if (overflow) { this.sprite('nearby-xp', 'stardustCluster', s.player.x + 25, s.player.y + 25, 22); this.pickupVisuals++; }
  }
  debugCounts(): Record<string, number> { return { pickupVisuals: this.pickupVisuals, spriteCapacity: this.pool.capacity, spriteActive: this.pool.active, suctionParticles: this.particles,ruinBudget:this.ruinBudget,beamAfterglow:this.bossView.afterglow,beamTailCached:this.bossView.cached(), ...this.backdrop.counts() }; }
  dispose(): void { this.pool.dispose(); this.graphics.destroy(); this.staticWorld.destroy(); this.backdrop.dispose();this.hazards.destroy();this.light.destroy();this.bossView.reset(); for (const image of this.ruins) image.destroy(); this.ruins.length = 0; }
}
