import { BALANCE as B } from './balance';
export type BossId = 'elder' | 'gravemaw' | 'helion' | 'harrier';
export interface BossDefinition {
    name: string;
    hp: number;
    speed: number;
    damage: number;
    xp: number;
    radius: number;
    cadence: readonly [
        number,
        number
    ];
    color: number;
}
/** HP khởi đầu để đo TTK; boss11:00 có multiplier riêng, không ăn scaling quái thường. */
export const BOSSES: Record<BossId, BossDefinition> = {
    elder: { name: 'Elder Star', hp: B.bossHP, speed: B.bossSpeed, damage: B.bossContactDamage, xp: B.bossXP, radius: B.bossRadius, cadence: [2.8, 1.9], color: 0xef90b8 },
    gravemaw: { name: 'Gravemaw · Hàm Hố Đen', hp: 9800, speed: 42, damage: 15, xp: 120, radius: 56, cadence: [2.8, 1.9], color: 0xbe92ed },
    helion: { name: 'Helion Remnant · Tàn Dư Nhật Miện', hp: 9200, speed: 38, damage: 14, xp: 120, radius: 53, cadence: [2.5, 1.7], color: 0xffa16b },
    harrier: { name: 'Void Harrier · Kẻ Săn Hư Không', hp: 9000, speed: 65, damage: 16, xp: 120, radius: 45, cadence: [2.4, 1.6], color: 0x91b2ed },
};
export const isBoss = (kind: string): kind is BossId => Object.hasOwn(BOSSES, kind);
export const BOSS_RULES = { spawnDistance: 480, warning: 3, spawnGrace: 1.2, firstAttack: 3, overlapOffset: .4, recovery: .3, lock: .25,
    ringWarning: 1, fanWarning: 1, zoneWarning: 1.1, dashWarning: .95, dashSeconds: .45, dashDistance: 280, dashBreak: .35,
    retry: .2, phaseReady: 1, burstGap: .65, burstOffset: .08, burstRecovery: .15, solarStagger: .45, solarSpread: .30, solarBurstCooldown: .6,
    ringCount: [15, 18], ringGap: [3, 4], ringRotation: .33, fanCount: [7, 9], fanSpread: [.85, 1.3], strafe: .03, forceResistance: .35, coreDashMargin: 45,
    zoneCap: 6, perOwnerZones: 2, solarRadius: 135, solarBurst: 12, solarDPS: 5, solarSeconds: 2.2,
    mawRadius: 200, mawForce: 120, mawSeconds: 2, predictionCap: 80, standoff: 260,
    schedule: [{ at: 540, hpScale: 1 }, { at: 660, hpScale: .8 }],
} as const;
