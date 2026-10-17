/** Đơn vị bp: 100 bp = 1%; tổng ngân sách của run, không phải trần mỗi stat. */
export const SALVAGE = { budgetBP: 2000, amountsBP: [50, 100], ttl: 30, blinkSeconds: 5, activeCap: 32, collectRadius: 16, visualCap: 32, stats: { damage: { name: 'hỏa lực', icon: 'power', capBP: 2000 }, rate: { name: 'nhịp bắn', icon: 'haste', capBP: 2000 }, hp: { name: 'HP', icon: 'hull', capBP: 2000 }, pickup: { name: 'bán kính nhặt', icon: 'magnet', capBP: 2000 }, speed: { name: 'tốc độ bay', icon: 'engine', capBP: 1000 } }, drops: { wisp: { base: 0.05, perMinute: 0, cap: 0.05 }, drifter: { base: 0.08, perMinute: 0.005, cap: 0.14 }, leech: { base: 0.07, perMinute: 0.004, cap: 0.12 }, elder: { base: 1, perMinute: 0, cap: 1 } } } as const;
export type SalvageStat = keyof typeof SALVAGE.stats;
export type SalvageBonuses = Record<SalvageStat, number>;
export const emptySalvage = (): SalvageBonuses => ({ damage: 0, rate: 0, hp: 0, pickup: 0, speed: 0 });
