/** Rotation là presentation-only; chênh góc đi cung ngắn và damping theo simulation render delta. */
export function dampAngle(current: number, target: number, dt: number): number { const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current)); return current + difference * (1 - Math.exp(-14 * Math.max(0, dt))); }
export class ShipPresentation {
  angle = -Math.PI / 2; thrust = 0; bank = 0; private time = -1;
  reset(angle: number, time: number): void { this.angle = angle; this.time = time; this.thrust = 0; this.bank=0; }
  update(target: number, moving: boolean, time: number, reduced=false): void {
    const dt=Math.max(0,Math.min(.1,time-this.time)),turn=Math.atan2(Math.sin(target-this.angle),Math.cos(target-this.angle));this.time=time;
    // Không dịch sprite khỏi tọa độ va chạm; nghiêng tối đa0,12rad, chỉ thay pose.
    this.bank=reduced?0:this.bank+(Math.max(-.12,Math.min(.12,turn*.15))-this.bank)*(1-Math.exp(-10*dt));
    this.angle=reduced?target:dampAngle(this.angle,target,dt);this.thrust+=((moving?1:0)-this.thrust)*(1-Math.exp(-20*dt));
  }
}
