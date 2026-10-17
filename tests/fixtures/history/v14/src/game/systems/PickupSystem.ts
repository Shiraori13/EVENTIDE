import { BALANCE as B } from '../config/balance';
import { PICKUP_CONFIG as P } from '../config/presentation';
import type { LootState, Pickup, PickupCell, RunState, Vec } from '../core/types';
import { addXP } from './ExperienceSystem';
import { clamp } from '../core/math';
import { shipStats } from '../core/stats';
export const LEDGER_SIDE = Math.ceil(B.arenaRadius * 2 / P.ledgerCellSize);
export const LEDGER_CAPACITY = LEDGER_SIDE * LEDGER_SIDE;
export const createLootState = (): LootState => ({ cells: Array<PickupCell | null>(LEDGER_CAPACITY).fill(null), ledgerCount: 0, ledgerXP: 0, created: 0, collected: 0, nextMerge: P.mergeInterval, lastForcedMerge: -1 });
export const pickupRadius = (s: RunState): number => shipStats(s).pickupRadius;
export const cellAxis = (coordinate: number): number => clamp(Math.floor((coordinate + B.arenaRadius) / P.ledgerCellSize), 0, LEDGER_SIDE - 1);
const sqDistance = (a: Vec, b: Vec): number => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
/** Ledger hữu hạn theo map, anchor ổn định. Chỉ materialize khi toàn bounds nằm trong tầm hút. */
function toLedger(s: RunState, p: Vec, value: number): void {
  const index = cellAxis(p.y) * LEDGER_SIDE + cellAxis(p.x), existing = s.loot.cells[index];
  if (existing) {
    existing.value += value; existing.minX = Math.min(existing.minX, p.x); existing.maxX = Math.max(existing.maxX, p.x);
    existing.minY = Math.min(existing.minY, p.y); existing.maxY = Math.max(existing.maxY, p.y);
  } else { s.loot.cells[index] = { x: p.x, y: p.y, value, minX: p.x, maxX: p.x, minY: p.y, maxY: p.y }; s.loot.ledgerCount++; }
  s.loot.ledgerXP += value;
}
/** Không expiry/auto-award. Cap đầy vẫn ghi XP vào cell địa phương, không mảng overflow vô hạn. */
export function dropXP(s: RunState, p: Vec, value: number): void {
  if (!(value > 0)) return;
  s.loot.created += value;
  if (s.pickups.length >= P.maxActive && s.loot.lastForcedMerge !== s.time) { compactPickups(s); s.loot.lastForcedMerge = s.time; }
  if (s.pickups.length < P.maxActive) s.pickups.push({ id: s.nextId++, x: p.x, y: p.y, value, created: s.time, state: 'available' });
  else toLedger(s, p, value);
}
/** Hash cục bộ, tối đa 9 anchor/query; không pairwise O(n²) mỗi frame hoặc gộp orb homing. */
export function compactPickups(s: RunState): void {
  const anchors = new Map<string, Pickup>(), radius = pickupRadius(s) + P.mergeRadius + P.safetyPadding;
  const protectSquared = radius * radius, mergeSquared = P.mergeRadius * P.mergeRadius;
  for (const p of s.pickups) {
    if (p.state === 'attracted' || s.time - p.created < P.minMergeAge || sqDistance(p, s.player) <= protectSquared) continue;
    const cx = Math.floor(p.x / P.mergeCellSize), cy = Math.floor(p.y / P.mergeCellSize);
    let merged = false;
    for (let dy = -1; dy <= 1 && !merged; dy++) for (let dx = -1; dx <= 1 && !merged; dx++) {
      const other = anchors.get(`${cx + dx},${cy + dy}`);
      if (other && sqDistance(other, p) <= mergeSquared) { other.value += p.value; p.value = 0; merged = true; }
    }
    if (!merged && !anchors.has(`${cx},${cy}`)) anchors.set(`${cx},${cy}`, p);
  }
  let write = 0; for (const p of s.pickups) if (p.value > 0) s.pickups[write++] = p; s.pickups.length = write;
}
function makeSpaceNearPlayer(s: RunState): boolean {
  if (s.pickups.length < P.maxActive) return true;
  const protectedRadius = pickupRadius(s);
  let candidate = -1, farthest = protectedRadius * protectedRadius;
  for (let i = 0; i < s.pickups.length; i++) { const p = s.pickups[i], d = sqDistance(p, s.player); if (p.state !== 'attracted' && d > farthest) { farthest = d; candidate = i; } }
  if (candidate < 0) return false;
  const p = s.pickups[candidate]; toLedger(s, p, p.value); s.pickups.splice(candidate, 1); return true;
}
/** Broad phase ledger theo các cell quanh tàu; không quét cả 3249 cell mỗi tick. */
function materializeNearby(s: RunState, radius: number): void {
  if (!s.loot.ledgerCount) return;
  const x0 = cellAxis(s.player.x - radius), x1 = cellAxis(s.player.x + radius), y0 = cellAxis(s.player.y - radius), y1 = cellAxis(s.player.y + radius);
  let budget = 12;
  for (let y = y0; y <= y1 && budget > 0; y++) for (let x = x0; x <= x1 && budget > 0; x++) {
    const index = y * LEDGER_SIDE + x, cell = s.loot.cells[index]; if (!cell) continue;
    const dx = Math.max(Math.abs(s.player.x - cell.minX), Math.abs(s.player.x - cell.maxX));
    const dy = Math.max(Math.abs(s.player.y - cell.minY), Math.abs(s.player.y - cell.maxY));
    // Chặn free pickup: mọi vị trí gốc trong cell phải đã vào phạm vi, kể cả qua biên cell.
    if (dx * dx + dy * dy > radius * radius) continue;
    // Tách cell trước khi nhường slot: orb bị đẩy ra có thể thuộc chính cell này.
    // Nếu gộp nó vào cell sau phép kiểm tra bounds, XP ngoài tầm có thể bị thu miễn phí.
    s.loot.ledgerXP -= cell.value; s.loot.ledgerCount--; s.loot.cells[index] = null;
    if (!makeSpaceNearPlayer(s)) { s.loot.cells[index] = cell; s.loot.ledgerXP += cell.value; s.loot.ledgerCount++; continue; }
    s.pickups.push({ id: s.nextId++, x: cell.x, y: cell.y, value: cell.value, created: s.time, state: 'attracted' }); budget--;
  }
}
/** Thu/hút theo simulation time, ledger không có physics/tween. Một orb chỉ qua collected một lần. */
export function pickupStep(s: RunState, dt: number): void {
  if (s.time >= s.loot.nextMerge) { compactPickups(s); s.loot.nextMerge = s.time + P.mergeInterval; }
  const radius = pickupRadius(s), radiusSquared = radius * radius, move = B.pickupSpeed * dt;
  let write = 0;
  for (const p of s.pickups) {
    const d2 = sqDistance(p, s.player);
    if (d2 <= radiusSquared) {
      p.state = 'attracted'; const d = Math.sqrt(d2);
      if (d <= move + B.playerRadius) { s.loot.collected += p.value; addXP(s, p.value); if (!s.cues.includes('pickup')) s.cues.push('pickup'); continue; }
      p.x += (s.player.x - p.x) / d * move; p.y += (s.player.y - p.y) / d * move;
    } else p.state = 'available';
    s.pickups[write++] = p;
  }
  s.pickups.length = write;
  materializeNearby(s, radius);
}
export const totalGroundXP = (s: RunState): number => s.pickups.reduce((total, p) => total + p.value, 0) + s.loot.cells.reduce((total, c) => total + (c?.value ?? 0), 0);
/** Phục vụ QA/fixture; gameplay gọi khi khởi tạo RunState mới. */
export function clearGroundXP(s: RunState): void { s.pickups.length = 0; s.loot = createLootState(); }
