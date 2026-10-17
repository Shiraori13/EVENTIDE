import type { Vec } from './types';
import { BALANCE as B } from '../config/balance';
export const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));
export const distance = (a: Vec, b: Vec = { x: 0, y: 0 }): number => Math.hypot(a.x - b.x, a.y - b.y);
/** Biên thuộc vùng sáng; mọi system dùng đúng hàm này. */
export const insideLight = (p: Vec): boolean => distance(p) <= B.lightRadius;
export function unit(x: number, y: number): Vec { const d = Math.hypot(x, y); return d > 0.00001 ? { x: x / d, y: y / d } : { x: 0, y: 0 }; }
export function limitToArena(p: Vec, radius = B.playerRadius as number): void {
  const d = distance(p); if (d > B.arenaRadius - radius) { const k = (B.arenaRadius - radius) / d; p.x *= k; p.y *= k; }
}
export function segmentDistance(p: Vec, a: Vec, b: Vec): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return distance(p, { x: a.x + dx * t, y: a.y + dy * t });
}
/** RNG tái lập cho kiểm thử; bản chơi thường truyền Math.random. */
export function seededRandom(seed: number): () => number {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
