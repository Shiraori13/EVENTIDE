/** Các khoảng cách là world unit, thời gian là giây mô phỏng. */
export const BALANCE = {
  duration: 720, step: 1 / 60, maxFrame: 0.1, maxSteps: 6,
  arenaRadius: 1800, lightRadius: 600, coreRadius: 44, playerRadius: 15,
  playerSpeed: 200, playerHP: 100, beaconHP: 300, healing: 1,
  corruptionRise: 4, corruptionFall: 8, corruptionThreshold: 50, corruptionMultiplier: 1.2,
  contactProtection: 0.6, enemyContactCooldown: 1, lightSlow: 0.8,
  pickupRadius: 85, pickupSpeed: 450,
  xpBase: 10, xpGrowth: 6, fallbackHeal: 10, leechXP: 4,
  spawnSafety: 400, spawnCoreSafety: 680, spawnAttempts: 18,
  spawnEdgeMargin: 40, beaconTargetShare: 0.25, firstSpawn: 2,
  stardustClusters: 12, stardustPerCluster: 3, stardustXP: 5, stardustRadius: 760, stardustSpacing: 25,
  droneAngularSpeed: 2, droneHitRadius: 13, leechLatch: 0.5,
  enemyCap: 110, projectileCap: 160, pickupCap: 220, effectCap: 64,
  gravityFirst: 120, gravityPeriod: 90, gravityLifetime: 17, gravityWarning: 2,
  gravityRadius: 310, gravityForce: 70, totalPullCap: 155, finalGravityTime: 630,
  gravitySiteRadius: 1250, gravitySiteCount: 5, finalGravityPosition: { x: 1320, y: 440 },
  bossHP: 10000, bossRadius: 55, bossSpeed: 32,
  bossBulletSpeed: 110, bossBulletDamage: 13.2, bossBulletTTL: 10,
  bossBeamWarning: 1.8, bossBeamDuration: 0.5, bossBeamWidth: 25,
  bossContactDamage: 15.4, bossBeamDamage: 27.5, bossXP: 120,
  bossOrbitRadius: 850, bossStart: { x: 850, y: -650 },
  bossFirstRingDelay: 3, beamLength: 4000,
  corePrices: [10, 20, 30], coreHPBonus: 0.1,
} as const;
/** Tuyến tính từ base theo phút hoàn tất; không tăng speed hoặc hit frequency. */
export const ENEMY_SCALING = { maxMinute: 11, wisp: { hp: 0.10, damage: 0.07 }, drifter: { hp: 0.14, damage: 0.09 }, leech: { hp: 0.16, damage: 0.10 } } as const;
/** Chu kỳ phase2 không rút ngắn thời gian cảnh báo hoặc contact protection. */
export const BOSS_PHASES = { transitionSeconds: 1.25, phase2HPRatio: 0.65, speedMultiplier: 1.18, damageMultiplier: 1.08, muzzleOffset: 30, friendlyReserve: 12 } as const;
