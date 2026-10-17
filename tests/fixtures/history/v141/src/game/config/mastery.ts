import { emptySalvage, type SalvageBonuses, type SalvageStat } from './salvage';
export type MasteryId = `mastery-${SalvageStat}`;
export const MASTERY = { stepBP: 200, budgetBP: 2000, caps: { damage: 2000, rate: 2000, hp: 2000, pickup: 2000, speed: 1000 } } as const;
export const MASTERY_IDS: MasteryId[] = ['mastery-damage', 'mastery-rate', 'mastery-hp', 'mastery-pickup', 'mastery-speed'];
export const masteryStat = (id: MasteryId): SalvageStat => id.slice(8) as SalvageStat;
export const masteryUsed = (bonus: SalvageBonuses): number => Object.values(bonus).reduce((a, b) => a + b, 0);
export const emptyMastery = emptySalvage;
