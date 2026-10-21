import { BALANCE as B } from '../../config/balance';
import type { Vec } from '../../core/types';
/** Tâm chốt lúc warning, chừa lõi/biên và đường vòng; không bám theo tàu khi active. */
export function hazardPosition(player: Vec, radius: number, offset = 0): Vec {
    const angle = Math.atan2(player.y, player.x || 1) + offset;
    const distance = Math.max(radius + B.coreRadius + 100, Math.min(B.arenaRadius - radius - 100, Math.hypot(player.x, player.y) + 60));
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
}
