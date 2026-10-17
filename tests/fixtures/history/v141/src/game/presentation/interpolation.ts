import type { Vec } from '../core/types';
/** Nội suy hình ảnh một bước cố định; kết quả không được ghi ngược vào vị trí collision. */
export const renderX = (p: Vec, alpha: number): number => (p.previousX ?? p.x) + (p.x - (p.previousX ?? p.x)) * alpha;
export const renderY = (p: Vec, alpha: number): number => (p.previousY ?? p.y) + (p.y - (p.previousY ?? p.y)) * alpha;
