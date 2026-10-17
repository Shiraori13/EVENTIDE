/** Rotation là presentation-only; chênh góc đi cung ngắn và damping theo simulation render delta. */
export function dampAngle(current: number, target: number, dt: number): number { const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current)); return current + difference * (1 - Math.exp(-14 * Math.max(0, dt))); }
export class ShipPresentation {
  angle = -Math.PI / 2; thrust = 0; private time = -1;
  reset(angle: number, time: number): void { this.angle = angle; this.time = time; this.thrust = 0; }
  update(target: number, moving: boolean, time: number): void { const dt = Math.max(0, Math.min(0.1, time - this.time)); this.time = time; this.angle = dampAngle(this.angle, target, dt); this.thrust += ((moving ? 1 : 0) - this.thrust) * (1 - Math.exp(-20 * dt)); }
}
