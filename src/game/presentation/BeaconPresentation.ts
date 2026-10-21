import type Phaser from 'phaser';
import type { RunState, Settings } from '../core/types';
import { COLORS as C, MOTION } from '../config/design';
import { BALANCE as B } from '../config/balance';
import { strokeArc } from './geometry';
/** Vòng tiến độ đọc time thật; vòng phụ/luồng năng lượng chỉ là hình, không làm charge/heal/damage. */
export function drawBeacon(g:Phaser.GameObjects.Graphics,s:RunState,time:number,menu:boolean,reduced:boolean,quality:Settings['quality']):void{
  const critical=!menu&&s.beacon.hp/s.beacon.maxHP<=0.25,damaged=!menu&&s.time-s.beacon.lastHit<MOTION.hitSeconds;
  const color=damaged||critical?C.danger:C.gold,scale=menu?1.6:1,progress=menu?0.76:s.time/B.duration;
  for(const [index,radius]of[63,77,91].entries()){
    const angle=reduced?0:time*(index%2?-.035:.025),segments=index===0?8:4;
    for(let i=0;i<segments;i++){const a=angle+i*Math.PI*2/segments;g.lineStyle(index===0?2:1,color,index===0?.7:.22);strokeArc(g,0,0,radius*scale,a,a+Math.PI*2/segments*.65);}
  }
  g.lineStyle(3,color,.95);strokeArc(g,0,0,63*scale,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);
  const count=reduced?0:quality==='low'?2:quality==='medium'?4:6;
  for(let i=0;i<count;i++){const phase=(time*.12+i/count)%1,a=i*2.399+phase*.45,r=(103-phase*64)*scale;g.fillStyle(C.gold,.15+phase*.45);g.fillCircle(Math.cos(a)*r,Math.sin(a)*r,1.4);}
  if(critical){for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3,x=Math.cos(a)*106,y=Math.sin(a)*106;g.lineStyle(2,C.danger,.95);g.strokeTriangle(x,y-7,x-6,y+5,x+6,y+5);}}
}
