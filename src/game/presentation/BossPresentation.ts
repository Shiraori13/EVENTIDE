import type Phaser from 'phaser';
import type { RunState, Beam } from '../core/types';
import { isBoss, BOSSES, BOSS_RULES as R } from '../config/bosses';
import { BALANCE as B } from '../config/balance';
import { renderX, renderY } from './interpolation';
import { strokeArc } from './geometry';
/** Tối đa một dư ảnh mỗi owner; transition/death dọn ngay, không dùng beam cấp run. */
export class BossPresentation {
    private tails = new Map<number, Beam>();
    afterglow = 0;
    reset(): void { this.tails.clear(); this.afterglow = 0; }
    cached(): number { return this.tails.size; }
    draw(g: Phaser.GameObjects.Graphics, s: RunState, alpha: number, time: number, reduced: boolean): void {
        this.afterglow = 0;
        for (const [id, tail] of this.tails) {
            const e = s.enemies.find(e => e.id === id);
            if (!e || e.bossPhase === 'transition' || e.bossPhase === 'dead' || (!e.boss?.beam && s.time < tail.end) || time >= tail.end + .12)
                this.tails.delete(id);
        }
        for (const boss of s.enemies) {
            if (!isBoss(boss.kind))
                continue;
            const beam = boss.boss?.beam, a = boss.boss?.attack, color = BOSSES[boss.kind].color;
            if (boss.kind === 'gravemaw') {
                // Hàm mở theo warning rồi khép khi thu hồi; chỉ trang trí, không nới radius va chạm.
                const x=renderX(boss,alpha),y=renderY(boss,alpha),open=reduced ? .2 : a?.kind==='maw' ? s.time<a.fire ? 1-Math.min(1,(a.fire-s.time)/R.zoneWarning) : Math.max(0,(a.end-s.time)/(a.end-a.fire)) : .2;
                g.lineStyle(2,color,.65);
                for(const side of [0,Math.PI])strokeArc(g,x,y,boss.radius+10,side-.7-open*.35,side+.7+open*.35);
            }
            if (beam) {
                const x = beam.x + renderX(boss, alpha) - boss.x, y = beam.y + renderY(boss, alpha) - boss.y, active = s.time >= beam.fire, nx = -Math.sin(beam.angle) * B.bossBeamWidth, ny = Math.cos(beam.angle) * B.bossBeamWidth, ex = x + Math.cos(beam.angle) * B.beamLength, ey = y + Math.sin(beam.angle) * B.beamLength, c = active ? 0xffe4d7 : beam.locked ? 0xefcb83 : 0xf47f86;
                if (active)
                    this.tails.set(boss.id, { ...beam, x, y });
                g.lineStyle(active ? B.bossBeamWidth * 2 : 2, c, active ? .3 : .75);
                g.lineBetween(x, y, ex, ey);
                g.lineStyle(2, c, .8);
                for (const side of [-1, 1])
                    g.lineBetween(x + nx * side, y + ny * side, ex + nx * side, ey + ny * side);
            }
            else {
                const tail = this.tails.get(boss.id);
                if (tail && time >= tail.end && !reduced) {
                    this.afterglow++;
                    g.lineStyle(1, 0xf47f86, (1 - (time - tail.end) / .12) * .25);
                    g.lineBetween(tail.x, tail.y, tail.x + Math.cos(tail.angle) * B.beamLength, tail.y + Math.sin(tail.angle) * B.beamLength);
                }
            }
            if (!a || a.kind === 'beam' || a.kind === 'maw' || a.kind === 'scar')
                continue;
            if (a.kind === 'dash') {
                g.lineStyle(s.time < a.fire ? 2 : 1, a.locked ? 0xefcb83 : color, .8);
                const dx = a.to.x - a.x, dy = a.to.y - a.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d * boss.radius, ny = dx / d * boss.radius;
                for (const side of [-1, 1])
                    g.lineBetween(a.x + nx * side, a.y + ny * side, a.to.x + nx * side, a.to.y + ny * side);
                g.strokeCircle(a.to.x, a.to.y, boss.radius);
            }
            else if (s.time < a.fire) {
                const r = a.kind === 'ring' ? 85 : 220;
                g.lineStyle(1, a.locked ? 0xefcb83 : color, .5);
                for (const offset of a.burstOffset?[0,a.burstOffset]:[0])for (const baseAngle of a.angles){
                    const angle=baseAngle+offset;g.lineBetween(boss.x + Math.cos(angle) * (boss.radius + 5), boss.y + Math.sin(angle) * (boss.radius + 5), boss.x + Math.cos(angle) * r, boss.y + Math.sin(angle) * r);}
            }
        }
    }
}
