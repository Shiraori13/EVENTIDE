import Phaser from 'phaser';
import type { Settings } from '../core/types';
import { seededRandom } from '../core/math';
import { COLORS as C, MOTION, SPACE_BUDGETS } from '../config/design';
/** Một tile opaque và một Graphics hữu hạn. Không texture/gradient/particle owner mới trong frame. */
export class SpaceBackdrop {
  private tile: Phaser.GameObjects.TileSprite;
  private accents: Phaser.GameObjects.Graphics;
  private last=-1;private quality:Settings['quality']='high';private reduced=false;
  private stars=Array.from({length:18},(_,i)=>{const r=seededRandom(875+i);return{x:r(),y:r(),phase:r()*Math.PI*2};});
  constructor(scene:Phaser.Scene){this.tile=scene.add.tileSprite(0,0,scene.scale.width,scene.scale.height,'stars-high').setOrigin(0).setScrollFactor(0).setDepth(-10);
    this.accents=scene.add.graphics().setScrollFactor(0).setDepth(-9.5);}
  draw(camera:Phaser.Cameras.Scene2D.Camera,time:number,quality:Settings['quality'],reduced:boolean,moving:boolean,dense:boolean):void{
    const changed=this.quality!==quality||this.reduced!==reduced||this.tile.width!==camera.width||this.tile.height!==camera.height;
    if(this.quality!==quality){this.quality=quality;this.tile.setTexture(`stars-${quality}`);}this.reduced=reduced;
    if(this.tile.width!==camera.width||this.tile.height!==camera.height)this.tile.setSize(camera.width,camera.height);
    // Camera giữ nguyên luật. Parallax chỉ thay texture position; giảm motion dùng background cố định theo camera.
    const tx=camera.scrollX*(reduced?1:MOTION.parallax)+(reduced?0:time*MOTION.backgroundDrift),ty=camera.scrollY*(reduced?1:0.1)+(reduced?0:time*0.17);
    // Setter đánh dấu dirty cả khi giá trị giống nhau: tránh Canvas fallback redraw toàn tile khi pause.
    if(this.tile.tilePositionX!==tx)this.tile.tilePositionX=tx;if(this.tile.tilePositionY!==ty)this.tile.tilePositionY=ty;
    const budget=SPACE_BUDGETS[quality];if(!changed&&time>=this.last&&time-this.last<1/budget.hz)return;this.last=time;
    const g=this.accents;g.clear();if(reduced)return;
    const count=dense?Math.min(3,budget.twinkle):budget.twinkle;
    for(let i=0;i<count;i++){const s=this.stars[i],x=((s.x*camera.width-camera.scrollX*0.025)%camera.width+camera.width)%camera.width,y=((s.y*camera.height-camera.scrollY*0.025)%camera.height+camera.height)%camera.height;g.fillStyle(C.ink,0.1+0.12*(0.5+0.5*Math.sin(time*0.45+s.phase)));g.fillRect(x,y,1.1,1.1);}
    if(!moving||dense)return;
    for(let i=0;i<budget.dust;i++){const s=this.stars[i],x=((s.x*camera.width-camera.scrollX*0.38)%camera.width+camera.width)%camera.width,y=((s.y*camera.height-camera.scrollY*0.38)%camera.height+camera.height)%camera.height;g.lineStyle(1,C.cyan,0.10);g.lineBetween(x,y,x+2.5,y+0.7);}
  }
  counts(){return{starCanvasWidth:this.tile.canvas?.width??0,starCanvasHeight:this.tile.canvas?.height??0,backgroundObjects:2};}
  dispose():void{this.tile.destroy();this.accents.destroy();}
}
