/** Một vùng thông báo phụ, tối đa bốn nhóm; không timer/listener riêng từng toast. */
export class NotificationQueue {
  private queue:string[][]=[];private active:string[]=[];private until=0;
  add(names:string[]):void {
    const existing=new Set([...this.active,...this.queue.flat()]),fresh=[...new Set(names)].filter(n=>!existing.has(n));
    if(!fresh.length)return;
    if(this.queue.length>=4)this.queue[3]=[...new Set([...this.queue[3],...fresh])].slice(0,28);
    else this.queue.push(fresh.slice(0,28));
  }
  text(now:number,blocked:boolean):string {
    if(blocked)return '';
    if(now>=this.until||!this.active.length&&this.queue.length){this.active=this.queue.shift()??[];this.until=now+5000;}
    return this.active.length?`Thành tựu mới · ${this.active.slice(0,2).join(' · ')}${this.active.length>2?' · +'+(this.active.length-2)+' mục':''}`:'';
  }
  clear():void {this.queue=[];this.active=[];this.until=0;}
}
