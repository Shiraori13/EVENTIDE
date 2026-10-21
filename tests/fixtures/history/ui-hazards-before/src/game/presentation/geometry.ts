import type Phaser from 'phaser';
import { ARC_BUDGET } from '../config/design';
/** Số đoạn theo sai số dây cung (world unit); cap cho đầu vào lớn, không phụ thuộc FPS. */
export function arcSegments(radius:number,angle:number):number {
  if(radius<=0||angle===0)return 0;
  const step=2*Math.acos(Math.max(-1,Math.min(1,1-ARC_BUDGET.tolerance/radius)));
  return Math.max(1,Math.min(ARC_BUDGET.maxSegments,Math.ceil(Math.abs(angle)/step)));
}
/** Phaser3 ARC chia100đoạn kể cả cung ngắn. Polyline giữ endpoint/radius thật, giảm vertex mà không phóng vùng nguy hiểm. */
export function strokeArc(g:Phaser.GameObjects.Graphics,x:number,y:number,radius:number,start:number,end:number):void {
  const count=arcSegments(radius,end-start);if(!count)return;
  g.beginPath();g.moveTo(x+Math.cos(start)*radius,y+Math.sin(start)*radius);
  for(let i=1;i<=count;i++){const angle=start+(end-start)*i/count;g.lineTo(x+Math.cos(angle)*radius,y+Math.sin(angle)*radius);}
  g.strokePath();
}
