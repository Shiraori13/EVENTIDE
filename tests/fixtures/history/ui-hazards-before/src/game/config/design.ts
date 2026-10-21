/** Token presentation dùng chung DOM/canvas; giây mô phỏng và thông số chiến đấu không nằm ở đây. */
export const COLORS = {
  bg:0x050914, deep:0x0b1426, panel:0x101d30, raised:0x17283d, line:0x354b62,
  ink:0xe8f0f4, muted:0xa8b9cc, cyan:0x7ddceb, gold:0xefcb83, violet:0x8063b5, danger:0xf47f86,
} as const;
export const MOTION = { hoverMS:140, panelMS:200, cardMS:220, hitSeconds:0.12, beaconPeriod:5, backgroundDrift:0.7, parallax:0.14 } as const;
export const ARC_BUDGET = { tolerance:0.35, maxSegments:128 } as const;
export const SPACE_BUDGETS = {
  low:{twinkle:3,dust:4,hz:6},medium:{twinkle:8,dust:10,hz:12},high:{twinkle:14,dust:18,hz:20},
} as const;
export function applyDesignTokens(root: HTMLElement): void {
  for(const [key,value] of Object.entries(COLORS))root.style.setProperty(`--${key}`,`#${value.toString(16).padStart(6,'0')}`);
  root.style.setProperty('--panel-raised','var(--raised)');root.style.setProperty('--pink','var(--violet)');
  root.style.setProperty('--motion-hover',`${MOTION.hoverMS}ms`);root.style.setProperty('--motion-panel',`${MOTION.panelMS}ms`);root.style.setProperty('--motion-card',`${MOTION.cardMS}ms`);
}
