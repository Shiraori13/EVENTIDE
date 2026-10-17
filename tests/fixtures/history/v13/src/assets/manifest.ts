export const ASSETS = {
  nova: 'player/nova', beacon: 'beacon/beacon', wisp: 'enemies/wisp', drifter: 'enemies/drifter', leech: 'enemies/leech', elder: 'enemies/elder',
  plasma: 'weapons/plasma', drones: 'weapons/drones', well: 'weapons/well', hull: 'ui/hull', magnet: 'ui/magnet', stardust: 'ui/stardust', pure: 'ui/pure', ruin: 'environment/ruin',
  shotPlasma: 'weapons/shot-plasma', shotSun: 'weapons/shot-sun', shotSupernova: 'weapons/shot-supernova', enemyBolt: 'weapons/enemy-bolt', stardustCluster: 'ui/stardust-cluster',
  power: 'ui/power', haste: 'ui/haste', engine: 'ui/engine', armor: 'ui/armor',
} as const;
export type AssetId = keyof typeof ASSETS;
export interface AssetEntry { id: AssetId; path: string; type: 'svg'; width: number; height: number; origin: readonly [number, number]; hitbox: string; source: string; license: string }
export const manifest: AssetEntry[] = (Object.keys(ASSETS) as AssetId[]).map(id => ({ id, path: `assets/images/${ASSETS[id]}.svg`, type: 'svg', width: id === 'elder' ? 128 : 64, height: id === 'elder' ? 128 : 64, origin: [0.5, 0.5], hitbox: id === 'nova' ? 'BALANCE.playerRadius' : ['wisp', 'drifter', 'leech', 'elder'].includes(id) ? `ENEMIES.${id}.radius` : 'Không tạo collision từ texture', source: 'EVENTIDE · scripts/generate-assets.mjs', license: 'CC0-1.0 · hình học nguyên bản' }));
export const assetURL = (id: AssetId): string => `${import.meta.env.BASE_URL}assets/images/${ASSETS[id]}.svg`;
export const fontManifest = [
  { id: 'font-sans', path: 'assets/fonts/NotoSans-Variable.ttf', source: 'https://github.com/google/fonts/tree/main/ofl/notosans', license: 'SIL OFL 1.1 · assets/fonts/NotoSans-OFL.txt', weights: '100–900', coverage: 'Latin + Vietnamese' },
  { id: 'font-serif', path: 'assets/fonts/NotoSerif-Variable.ttf', source: 'https://github.com/google/fonts/tree/main/ofl/notoserif', license: 'SIL OFL 1.1 · assets/fonts/NotoSerif-OFL.txt', weights: '100–900', coverage: 'Latin + Vietnamese' },
] as const;
