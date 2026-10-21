import { ASTRONOMY as A } from '../../config/events';
import { BOSS_RULES as C, isBoss } from '../../config/bosses';
import type { RunState, AstronomyEvent } from '../../core/types';
import { distanceSquared } from '../../core/math';
import { hitEnemy, hitEnvironment } from '../CombatSystem';
import { hazardPosition } from './placement';
export { tideStrength } from './forces';
export const currentAstronomy = (s: RunState): AstronomyEvent | undefined => s.astronomy.find(e => e.phase === 'warning' || e.phase === 'active');
/** Chốt vị trí đúng một lần ở warning, resolve theo clock thật, không replay event đã hết. */
export function astronomyStep(s: RunState): void {
    let owner: AstronomyEvent | undefined;
    for (const e of s.astronomy) {
        if (e.phase === 'cancelled')
            continue;
        const old = e.phase, phase = s.time + 1e-7 >= e.end ? 'completed' : s.time + 1e-7 >= e.start ? 'active' : s.time + 1e-7 >= e.start - A.warning ? 'warning' : 'scheduled';
        if ((phase === 'warning' || phase === 'active') && owner) {
            e.phase = 'cancelled';
            continue;
        }
        e.phase = phase;
        if (phase === 'warning' || phase === 'active') {
            owner = e;
            if (e.id === 'radiation' && !e.zones)
                e.zones = [0, A.radiationSpread].map(offset => ({ ...hazardPosition(s.player, A.radiationRadius, offset), radius: A.radiationRadius }));
            if (e.id === 'tide' && !e.center)
                e.center = hazardPosition(s.player, A.tideRadius);
        }
        if (phase === 'completed') {
            e.zones = undefined;
            e.center = undefined;
            if (e.id === 'tide' && s.gravity?.source === 'tide')
                s.gravity = undefined;
        }
        if (old === phase)
            continue;
        const d = A.schedule.find(d => d.id === e.id)!;
        if (phase === 'warning') {
            s.notice = `${d.icon} Sắp đến: ${d.name}`;
            s.noticeUntil = e.start;
            s.cues.push('boss');
        }
        if (phase === 'active') {
            e.nextTick = s.time;
            s.notice = `${d.icon} ${d.name} · ${d.description}`;
            s.noticeUntil = s.time + 4;
        }
        if (phase === 'completed' && (old === 'active' || old === 'warning')) {
            s.notice = d.name + ' đã kết thúc';
            s.noticeUntil = s.time + 3;
        }
    }
    if (owner) {
        if (owner.id === 'tide' && s.gravity?.source !== 'tide')
            s.gravity = { ...owner.center!, start: owner.start, end: owner.end, final: false, source: 'tide' };
        else if (owner.id !== 'tide' && s.gravity && !s.gravity.final)
            s.gravity = undefined;
    }
    else if (s.gravity?.source === 'tide')
        s.gravity = undefined;
}
/** Một nguồn radiation mạnh nhất khi chồng vùng; timer nguồn độc lập contact nhưng tôn trọng invulnerability thật. */
export function radiationStep(s: RunState, rng: () => number): void {
    const e = s.astronomy.find(e => e.id === 'radiation' && e.phase === 'active'), inside = (p: {
        x: number;
        y: number;
    }) => e?.zones?.some(z => distanceSquared(p, z) <= z.radius ** 2) ?? false;
    let dps = e && inside(s.player) ? A.radiationShipDPS : 0, burst = 0;
    let dpsOwner:number|undefined, burstOwner:number|undefined;
    for (const z of s.bossZones)
        if (z.kind === 'solar' && s.time >= z.start && s.time < z.end) {
            const within = distanceSquared(s.player, z) <= z.radius ** 2;
            if (within && C.solarDPS>dps) { dps=C.solarDPS;dpsOwner=z.ownerId; }
            if (!z.burstDone) {
                z.burstDone = true;
                if (within && C.solarBurst>burst) { burst=C.solarBurst;burstOwner=z.ownerId; }
            }
        }
    if (burst)
        hitEnvironment(s, burst, 'solar-burst', C.solarBurstCooldown,burstOwner);
    if (dps)
        hitEnvironment(s, dps, 'radiation', A.radiationTick,dpsOwner);
    if (!e || s.time + 1e-7 < e.nextTick)
        return;
    e.nextTick = s.time + A.radiationTick;
    for (const enemy of s.enemies)
        if (!isBoss(enemy.kind) && enemy.hp > 0 && inside(enemy))
            hitEnemy(s, enemy, Math.min(A.radiationEnemyCap, enemy.maxHP * A.radiationEnemyFraction) * A.radiationTick, 'radiation', rng);
}
export function cancelAstronomy(s: RunState): void { for (const e of s.astronomy) {
    if (e.phase !== 'completed')
        e.phase = 'cancelled';
    e.zones = undefined;
    e.center = undefined;
} s.enemyEventFactor = 1; if (s.gravity?.source === 'tide')
    s.gravity = undefined; }
