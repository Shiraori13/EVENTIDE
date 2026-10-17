import { BALANCE as B } from './balance';
export const CHARACTERS = { nova: { name: 'Nova', icon: 'nova', description: 'Lightkeeper lái tàu cứu hộ cũ, mang ánh sáng trở về. Vùng sáng hồi 1 HP mỗi giây.', starter: 'plasma', hp: B.playerHP, speed: B.playerSpeed, pickup: B.pickupRadius } } as const;
export type CharacterId = keyof typeof CHARACTERS;
/** Bonus cộng trên base; armor dùng điểm phần trăm, không nhân lãi kép. */
export const SUPPORTS = {
  power: { name: 'Lõi hỏa lực', stat: 'damage', increment: 0.08, cap: 0.4, max: 5, icon: 'power' },
  haste: { name: 'Bộ tăng nhịp', stat: 'rate', increment: 0.08, cap: 0.4, max: 5, icon: 'haste' },
  hull: { name: 'Gia cố thân tàu', stat: 'hp', increment: 0.1, cap: 0.5, max: 5, icon: 'hull' },
  engine: { name: 'Động cơ hiệu chỉnh', stat: 'speed', increment: 0.05, cap: 0.25, max: 5, icon: 'engine' },
  magnet: { name: 'Bộ thu bụi sao', stat: 'pickup', increment: 0.1, cap: 0.5, max: 5, icon: 'magnet' },
  armor: { name: 'Giáp phân tán', stat: 'armor', increment: 0.04, cap: 0.2, max: 5, icon: 'armor' },
} as const;
export type SupportId = keyof typeof SUPPORTS;
export const STAT_LIMITS = { minAttackInterval: 0.12, moduleSlots: 3, supportSlots: 2, autosaveSeconds: 5 } as const;
export { ACHIEVEMENTS } from './achievements';
