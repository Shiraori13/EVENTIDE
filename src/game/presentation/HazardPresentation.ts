import { BALANCE as B } from '../config/balance';
import type Phaser from 'phaser';
import type { RunState } from '../core/types';
import { currentAstronomy } from '../systems/hazards/AstronomySystem';
import { playerForce, tideStrength } from '../systems/hazards/forces';
import { ASTRONOMY as A } from '../config/events';
import { strokeArc } from './geometry';
/** Đọc vùng đã khóa từ simulation; mọi quality giữ biên/hatch/hướng, không phát sinh collider. */
export function drawHazardZones(g: Phaser.GameObjects.Graphics, s: RunState, visible: (x: number, y: number, r: number) => boolean, reducedMotion = false): void {
    const event = currentAstronomy(s), zones = [...(event?.id === 'radiation' ? (event.zones ?? []).map(z => ({ ...z, kind: 'solar', start: event.start, end: event.end })) : []), ...s.bossZones];
    for (const z of zones) {
        if (!visible(z.x, z.y, z.radius) || s.time >= z.end)
            continue;
        const active = s.time >= z.start, color = z.kind === 'maw' ? 0xb78ae3 : 0xffb46c;
        g.lineStyle(active ? 2.5 : 1.5, color, .8);
        for (let i = 0; i < 16; i++)
            strokeArc(g, z.x, z.y, z.radius, i * Math.PI / 8, i * Math.PI / 8 + Math.PI / 12);
        if (z.kind === 'solar') {
            g.fillStyle(color, active ? .055 : .02);
            g.fillCircle(z.x, z.y, z.radius);
            for (let i = 1; i < 8; i++) {
                const dy = -z.radius + i * z.radius / 4, w = Math.sqrt(z.radius * z.radius - dy * dy);
                g.lineStyle(1, color, .25);
                g.lineBetween(z.x - w, z.y + dy, z.x + w, z.y + dy);
            }
            g.lineStyle(2, color, .9);
            g.strokeTriangle(z.x, z.y - 14, z.x - 13, z.y + 10, z.x + 13, z.y + 10);
        }
        else {
            if (active && !reducedMotion)
                for (let i = 0; i < 6; i++) {
                    const outward = 'direction' in z && z.direction === -1, t = ((s.time - z.start) * .65 + i / 6) % 1, r = z.radius * (outward ? t : 1 - t), a = i * 2.399;
                    g.lineStyle(1.5, color, .65);
                    g.lineBetween(z.x + Math.cos(a) * r, z.y + Math.sin(a) * r, z.x + Math.cos(a) * (r + (outward ? -12 : 12)), z.y + Math.sin(a) * (r + (outward ? -12 : 12)));
                }
            g.fillStyle(0x030712, .9);
            g.fillCircle(z.x, z.y, 20);
            const outward = 'direction' in z && z.direction === -1;
            for (let i = 0; i < 8; i++) {
                const a = i * Math.PI / 4, r = z.radius * .65, sign = outward ? 1 : -1, x = z.x + Math.cos(a) * r, y = z.y + Math.sin(a) * r;
                g.lineStyle(2, color, .65);
                g.lineBetween(x, y, x + Math.cos(a) * 24 * sign, y + Math.sin(a) * 24 * sign);
                g.strokeTriangle(x + Math.cos(a) * 24 * sign, y + Math.sin(a) * 24 * sign, x + Math.cos(a) * 13 * sign - Math.sin(a) * 5, y + Math.sin(a) * 13 * sign + Math.cos(a) * 5, x + Math.cos(a) * 13 * sign + Math.sin(a) * 5, y + Math.sin(a) * 13 * sign - Math.cos(a) * 5);
            }
        }
    }
}
/** Nhãn ngoài tâm giao tranh, hướng theo vector thật; warning/ngoài camera không giả đang tác động. */
export function hazardLabel(s: RunState): string {
    const event = currentAstronomy(s), f = playerForce(s), force = Math.hypot(f.x, f.y), arrow = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][(Math.round(Math.atan2(f.y, f.x) / (Math.PI / 4)) + 8) % 8];
    if (event?.id === 'tide') {
        if (event.phase === 'warning')
            return `Thủy triều ${directionArrow((event.center?.x ?? 0) - s.player.x, (event.center?.y ?? 0) - s.player.y)} · CẢNH BÁO ${Math.ceil(event.start - s.time)}s`;
        const elapsed = s.time - event.start, remaining = A.tideCycle / 2 - elapsed % (A.tideCycle / 2), direction = tideStrength(s) >= 0 ? 'HÚT' : 'ĐẨY';
        const inside = event.center && Math.hypot(event.center.x - s.player.x, event.center.y - s.player.y) <= A.tideRadius;
        return `Thủy triều · ĐANG ${direction} · ${remaining <= A.tideCue ? 'SẮP ĐỔI NHỊP' : `đổi sau ${remaining.toFixed(1)}s`} · ${force > 0 ? `${arrow} ${Math.round(force)}u/s` : inside ? 'trong vùng · lực 0u/s' : `ngoài vùng ${directionArrow((event.center?.x ?? 0) - s.player.x, (event.center?.y ?? 0) - s.player.y)}`}`;
    }
    if (force > 0)
        return `Lực môi trường ${arrow} ${Math.round(force)}u/s · Ra ngoài biên để thoát`;
    const solar = s.bossZones.find(z => z.kind === 'solar' && s.time < z.end && Math.hypot(z.x - s.player.x, z.y - s.player.y) <= z.radius);
    if (solar)
        return s.time < solar.start ? `Solar Scar · RỜI VÙNG TRƯỚC ${(solar.start - s.time).toFixed(1)}s` : 'SOLAR SCAR · Đang trong vùng gây hại';
    const radiation = event?.id === 'radiation' && event.zones?.some(z => Math.hypot(z.x - s.player.x, z.y - s.player.y) <= z.radius);
    if (radiation)
        return event.phase === 'warning' ? `Phóng xạ · RỜI VÙNG TRƯỚC ${Math.ceil(event.start - s.time)}s` : 'PHÓNG XẠ · Đang trong vùng gây hại';
    if (s.gravity) {
        const g = s.gravity, r = g.source === 'tide' ? A.tideRadius : B.gravityRadius, d = Math.hypot(g.x - s.player.x, g.y - s.player.y);
        if (d < r + 500) {
            const a = Math.atan2(g.y - s.player.y, g.x - s.player.x), dir = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][(Math.round(a / (Math.PI / 4)) + 8) % 8];
            return `Hố đen môi trường ${dir} ${Math.round(d)}u · ${s.time < g.start ? 'CẢNH BÁO' : 'ĐANG HÚT'}`;
        }
    }
    return '';
}
const directionArrow = (x: number, y: number): string => ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][(Math.round(Math.atan2(y, x) / (Math.PI / 4)) + 8) % 8];
