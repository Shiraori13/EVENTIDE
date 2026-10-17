import { BALANCE as B } from './balance';
const APPEARANCES = ['beacon', 'beacon1', 'beacon2', 'beacon3'] as const;
/** Menu preview thuần; run đọc coreLevel đã chốt lúc tạo, không đọc profile đang đổi. */
export const appearanceForCoreLevel = (level: number): typeof APPEARANCES[number] => APPEARANCES[Math.max(0, Math.min(B.corePrices.length, Math.floor(level)))];
export const coreHP = (level: number): number => Math.round(B.beaconHP * (1 + B.coreHPBonus * level));
