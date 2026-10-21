import { BALANCE as B, BOSS_PHASES as P } from '../../config/balance';
import { BOSSES, BOSS_RULES as C, isBoss } from '../../config/bosses';
import type { RunState, BossSkill } from '../../core/types';
import { bossRuntime } from './state';
import { startAttack, firePattern, dashTarget } from './attacks';
/** Mỗi instance một máy trạng thái; không catch-up skill hoặc dùng cờ final death của boss khác. */
export function bossStep(s: RunState): void {
    if (s.phase !== 'playing')
        return;
    s.bossZones = s.bossZones.filter(z => z.end > s.time);
    for (const boss of s.enemies) {
        if (!isBoss(boss.kind) || boss.bossPhase === 'dead')
            continue;
        const b = bossRuntime(boss), definition = BOSSES[boss.kind];
        if (boss.bossPhase === 'transition') {
            if (s.time < (boss.transitionEnd ?? Infinity))
                continue;
            boss.bossPhase = 'phase2';
            boss.hp = boss.maxHP = b.phase1HP * P.phase2HPRatio;
            boss.speed = definition.speed * P.speedMultiplier;
            boss.damage = definition.damage * P.damageMultiplier;
            b.phase2At = s.time;
            b.readyAt = s.time + C.phaseReady;
            b.actionIndex = 0;
        }
        if (boss.hp <= 0)
            continue;
        const second = boss.bossPhase === 'phase2';
        let a = b.attack;
        if (a && s.time >= a.end) {
            b.beam = undefined;
            b.attack = undefined;
            if (a.kind === 'dash' && a.combo > 0) {
                b.comboPending = a.combo;
                b.readyAt = s.time + C.dashBreak;
            }
            else
                b.readyAt = Math.max(b.readyAt, s.time + C.recovery);
            a = undefined;
        }
        if (!a && s.time >= b.readyAt && s.time >= b.spawnUntil) {
            const sequence: BossSkill[] = boss.kind === 'elder' ? ['ring', 'beam'] : boss.kind === 'gravemaw' ? ['maw', 'ring', 'maw'] : boss.kind === 'helion' ? ['scar', 'fan'] : ['dash', 'fan'];
            const kind = b.comboPending ? 'dash' : sequence[b.actionIndex % sequence.length], combo = b.comboPending ? 0 : second && kind === 'dash' ? 1 : 0;
            const created = startAttack(s, boss, kind, combo);
            if (!created) {
                b.readyAt = s.time + C.retry;
                continue;
            }
            if (!b.comboPending) {
                b.actionIndex++;
                b.skillCount++;
            }
            b.comboPending = 0;
            b.readyAt = s.time + definition.cadence[second ? 1 : 0];
            b.attack = a = created;
        }
        if (!a)
            continue;
        if (!a.locked) {
            // Aim có dự đoán tối đa80u; sau lock không sửa góc/path đã báo.
            const lead = a.kind === 'fan' ? C.predictionCap : 0, px = s.player.x + Math.cos(s.player.angle) * lead, py = s.player.y + Math.sin(s.player.angle) * lead;
            const angle = Math.atan2(py - boss.y, px - boss.x), delta = angle - a.angle;
            if (a.kind === 'fan')
                a.angles = a.angles.map(v => v + delta);
            if (a.kind === 'beam' || a.kind === 'fan' || a.kind === 'dash')
                a.angle = angle;
            if (a.kind === 'dash') {
                a.x = boss.x;
                a.y = boss.y;
                a.to = dashTarget(boss, angle);
            }
            if (s.time >= a.lock)
                a.locked = true;
        }
        if (a.kind === 'beam')
            b.beam = { ownerId: boss.id, x: boss.x + Math.cos(a.angle) * P.muzzleOffset, y: boss.y + Math.sin(a.angle) * P.muzzleOffset, angle: a.angle, fire: a.fire, end: a.end, lock: a.lock, locked: a.locked, damage: B.bossBeamDamage * (second ? P.damageMultiplier : 1) };
        firePattern(s, boss, a);
    }
}
