const formatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
export const numberText = (value: number): string => formatter.format(value);
export const percentText = (ratio: number): string => `${numberText(ratio * 100)}%`;
export const unitText = (value: number, unit: string): string => `${numberText(value)} ${unit}`;
/** HP gear có phần lẻ: không ceil tới số nguyên vượt maxHP, chỉ làm tròn phần hiển thị. */
export const hpText = (current: number, maximum: number): string => `${numberText(Math.max(0, Math.min(maximum, Math.ceil(current * 100 - 1e-8) / 100)))}/${numberText(maximum)}`;
