export const ASSETS = {
  nova: 'player/nova', beacon: 'beacon/beacon', wisp: 'enemies/wisp', drifter: 'enemies/drifter', leech: 'enemies/leech', elder: 'enemies/elder',
  plasma: 'weapons/plasma', drones: 'weapons/drones', well: 'weapons/well', hull: 'ui/hull', magnet: 'ui/magnet', stardust: 'ui/stardust', pure: 'ui/pure', ruin: 'environment/ruin',
} as const;
export type AssetId = keyof typeof ASSETS;
export interface AssetEntry { id: AssetId; path: string; type: 'svg'; width: number; height: number; source: string; license: string }
export const manifest: AssetEntry[] = (Object.keys(ASSETS) as AssetId[]).map(id => ({ id, path: `assets/images/${ASSETS[id]}.svg`, type: 'svg', width: 64, height: 64, source: 'EVENTIDE · scripts/generate-assets.mjs', license: 'CC0-1.0 · hình học nguyên bản' }));
export const assetURL = (id: AssetId): string => `${import.meta.env.BASE_URL}assets/images/${ASSETS[id]}.svg`;
