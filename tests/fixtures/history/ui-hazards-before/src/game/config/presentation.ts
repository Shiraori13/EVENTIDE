import { BALANCE as B } from './balance';
/** Ngân sách trình bày, không thay spawn/damage/radius/loot hoặc clock. */
export const PRESENTATION = {
  spriteCap: 640, visualCullPadding: 100, maxActivePickupVisuals: 220,
  high: { stars: 256, ruins: 70, suctionParticles: 96, perGravity: 32, trail: 4, healthBars: 28 },
  medium: { stars: 176, ruins: 42, suctionParticles: 48, perGravity: 18, trail: 3, healthBars: 20 },
  low: { stars: 112, ruins: 28, suctionParticles: 32, perGravity: 12, trail: 2, healthBars: 12 },
} as const;
export const SPACE_VISUALS = { backgroundSize: 1024, highClouds: 8, lowClouds: 3, highGalaxyDots: 300, lowGalaxyDots: 80, beaconHz: 0.2, beaconFlashSeconds: 0.12 } as const;
/** Compaction theo giây simulation; ledger có lưới hữu hạn theo map. */
export const PICKUP_CONFIG = { maxActive: B.pickupCap, mergeCellSize: 96, mergeRadius: 72, mergeInterval: 2, minMergeAge: 4, safetyPadding: 48, ledgerCellSize: 64 } as const;
