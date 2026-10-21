import { BALANCE as B, BOSS_PHASES as P } from '../../config/balance';
import { BOSS_RULES as C } from '../../config/bosses';
import type { Enemy, RunState, BossAttack, BossSkill, Vec } from '../../core/types';
import { segmentDistanceSquared, limitToArena } from '../../core/math';
import { reservedBullets } from './state';
import { hazardPosition } from '../hazards/placement';
/** Admission trước telegraph; friendly fire cũng trừ reservation, không hiện một pattern rồi cắt đạn. */
export function canReserve(s: RunState, count: number): boolean { return s.projectiles.length + reservedBullets(s) + count <= B.projectileCap - P.friendlyReserve; }
export function dashTarget(boss: Enemy, angle: number): Vec {
    let to = { x: boss.x + Math.cos(angle) * C.dashDistance, y: boss.y + Math.sin(angle) * C.dashDistance };
    if (segmentDistanceSquared({ x: 0, y: 0 }, boss.x, boss.y, to.x, to.y) < (B.coreRadius + boss.radius + C.coreDashMargin) ** 2) {
        angle = Math.atan2(boss.y, boss.x) + Math.PI / 2;
        to = { x: boss.x + Math.cos(angle) * C.dashDistance, y: boss.y + Math.sin(angle) * C.dashDistance };
    }
    limitToArena(to, boss.radius);
    return to;
}
export function startAttack(s: RunState, boss: Enemy, kind: BossSkill, combo: number): BossAttack | undefined {
    const second = boss.bossPhase === 'phase2', warning = kind === 'beam' ? B.bossBeamWarning : kind === 'dash' ? C.dashWarning : kind === 'scar' || kind === 'maw' ? C.zoneWarning : C.fanWarning;
    const angle = Math.atan2(s.player.y - boss.y, s.player.x - boss.x), angles: number[] = [];
    if (kind === 'ring') {
        const count = C.ringCount[second ? 1 : 0], gap = C.ringGap[second ? 1 : 0], offset = angle + (boss.boss?.actionIndex ?? 0) * C.ringRotation;
        for (let i = gap; i < count; i++)
            angles.push(offset + i * Math.PI * 2 / count);
    }
    if (kind === 'fan') {
        const count = C.fanCount[second ? 1 : 0], spread = C.fanSpread[second ? 1 : 0];
        for (let i = 0; i < count; i++)
            if (i !== Math.floor(count / 2))
                angles.push(angle + (i / (count - 1) - .5) * spread);
    }
    const bursts = second && (kind === 'ring' || kind === 'fan') ? 2 : 1, reserved = angles.length * bursts;
    if (!canReserve(s, reserved))
        return;
    const zoneCount = kind === 'scar' ? (second ? 2 : 1) : kind === 'maw' ? 1 : 0;
    if (zoneCount && (s.bossZones.length + zoneCount > C.zoneCap || s.bossZones.filter(z => z.ownerId === boss.id).length + zoneCount > C.perOwnerZones))
        return;
    const fire = s.time + warning, duration = kind === 'beam' ? B.bossBeamDuration : kind === 'dash' ? C.dashSeconds : kind === 'maw' ? C.mawSeconds : kind === 'scar' ? C.solarSeconds + (second ? C.solarStagger : 0) : (bursts === 2 ? C.burstGap : 0) + C.burstRecovery;
    const attack: BossAttack = { kind, x: boss.x, y: boss.y, angle, fire, end: fire + duration, lock: fire - C.lock, locked: false, to: dashTarget(boss, angle), angles, reserved, burstOffset:bursts===2?C.burstOffset:0, shots: 0, combo };
    if (zoneCount)
        for (let i = 0; i < zoneCount; i++) {
            const radius = kind === 'maw' ? C.mawRadius : C.solarRadius, center = hazardPosition(s.player, radius, i === 1 ? C.solarSpread : 0), start = fire + i * C.solarStagger;
            s.bossZones.push({ ...center, id: s.nextId++, ownerId: boss.id, kind: kind === 'maw' ? 'maw' : 'solar', radius, start, end: start + (kind === 'maw' ? C.mawSeconds : C.solarSeconds), force: C.mawForce, direction: second ? -1 : 1, nextTick: start + 1, burstDone: false });
        }
    return attack;
}
export function firePattern(s: RunState, boss: Enemy, a: BossAttack): void {
    const second = boss.bossPhase === 'phase2', bursts = second ? 2 : 1;
    if (!a.angles.length || a.shots >= bursts || s.time < a.fire + a.shots * C.burstGap)
        return;
    // Loạt hai lệch nhẹ trong pattern đã báo; giao của hai khe vẫn đủ tàu đi qua.
    for (const baseAngle of a.angles) {
        const angle=baseAngle+a.shots*(a.burstOffset??0);
        const x = boss.x + Math.cos(angle) * P.muzzleOffset, y = boss.y + Math.sin(angle) * P.muzzleOffset;
        s.projectiles.push({ id: s.nextId++, x, y, previousX: x, previousY: y, vx: Math.cos(angle) * B.bossBulletSpeed, vy: Math.sin(angle) * B.bossBulletSpeed, ttl: B.bossBulletTTL, damage: B.bossBulletDamage * (second ? P.damageMultiplier : 1), radius: 7, blast: 0, hostile: true, ownerId: boss.id });
    }
    a.reserved -= a.angles.length;
    a.shots++;
}
