import { BALANCE as B } from './balance';
/** Ngân sách trình bày, không thay spawn/damage/radius/loot hoặc clock. */
export const PRESENTATION = {
  spriteCap: 640, visualCullPadding: 100, maxActivePickupVisuals: 220,
  high: { stars: 16, ruins: 70, suctionParticles: 96, perGravity: 32, trail: 4, healthBars: 28 },
  low: { stars: 8, ruins: 28, suctionParticles: 32, perGravity: 12, trail: 2, healthBars: 12 },
} as const;
/** Compaction theo giây simulation; ledger có lưới hữu hạn theo map. */
export const PICKUP_CONFIG = { maxActive: B.pickupCap, mergeCellSize: 96, mergeRadius: 72, mergeInterval: 2, minMergeAge: 4, safetyPadding: 48, ledgerCellSize: 64 } as const;
