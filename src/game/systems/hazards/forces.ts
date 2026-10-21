import { BALANCE as B } from '../../config/balance';
import { ASTRONOMY as A } from '../../config/events';
import { distance, unit } from '../../core/math';
import { shipStats } from '../../core/stats';
import type { RunState, Vec } from '../../core/types';
/** Vector u/s, liên tục tại mép; tại tâm0 không chia khoảng cách. */
export function pull(p: Vec, center: Vec, radius: number, strength: number, curved = false): Vec {
    const d = distance(p, center);
    if (d < .001 || d >= radius)
        return { x: 0, y: 0 };
    const u = unit(center.x - p.x, center.y - p.y), edge = 1 - d / radius, f = strength * (curved ? Math.sqrt(edge) : edge);
    return { x: u.x * f, y: u.y * f };
}
export function tideStrength(s: RunState): number { const e = s.astronomy.find(e => e.id === 'tide' && e.phase === 'active'); return e ? A.tideForce * Math.sin((s.time - e.start) * Math.PI * 2 / A.tideCycle) : 0; }
export function environmentForce(s: RunState, p: Vec): Vec {
    const g = s.gravity, f = g && s.time >= g.start && s.time < g.end ? pull(p, g, g.source === 'tide' ? A.tideRadius : B.gravityRadius, g.source === 'tide' ? tideStrength(s) : B.gravityForce, g.source === 'tide') : { x: 0, y: 0 };
    for (const z of s.bossZones)
        if (z.kind === 'maw' && s.time >= z.start && s.time < z.end) {
            const v = pull(p, z, z.radius, z.force * z.direction, true);
            f.x += v.x;
            f.y += v.y;
        }
    return f;
}
/** Tổng lực môi trường/boss dùng cap chung theo tốc độ thật; giữ ít nhất22% tốc để thoát ngược lực. */
export function playerForce(s: RunState): Vec { const f = environmentForce(s, s.player), max = shipStats(s).moveSpeed * A.shipForceRatio, d = Math.hypot(f.x, f.y); if (d > max) {
    f.x *= max / d;
    f.y *= max / d;
} return f; }
/** Tích phân của dấu lực sin: vệt đổi hướng liên tục ở mỗi nửa chu kỳ, không nhảy khi đổi dấu. */
export function tideFlowTime(s: RunState): number { const e = s.astronomy.find(e => e.id === 'tide' && e.phase === 'active'); return e ? A.tideCycle / (Math.PI * 2) * (1 - Math.cos((s.time - e.start) * Math.PI * 2 / A.tideCycle)) : 0; }
