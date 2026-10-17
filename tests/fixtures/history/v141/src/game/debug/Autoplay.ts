import type { GameSession } from '../core/GameSession';
import type { RunState, Vec } from '../core/types';
import type { ModuleId, SupportId, ChoiceId } from '../config/content';
type BotState = Pick<RunState, 'player' | 'enemies' | 'pickups' | 'time' | 'beacon' | 'beam'>;
/** Chỉ QA; chọn trong draft thật, dùng reroll thật, không cấp thẻ hoặc tăng chỉ số. */
export function chooseBotUpgrade(game: GameSession, pair: readonly SupportId[] = ['hull', 'armor'], modules: readonly ModuleId[] = ['plasma', 'drones', 'well']): void {
  if (game.state.swapCandidate) {
    const owned = Object.keys(game.state.modules) as ModuleId[];
    const old = owned.find(id => !modules.includes(id)) ?? [...owned].sort((a, b) => modules.indexOf(b) - modules.indexOf(a))[0];
    game.swap(old); return;
  }
  const order: ChoiceId[] = [...modules, ...pair];
  let choice: ChoiceId | undefined = order.find(id => game.state.choices.includes(id));
  if (!choice && game.reroll()) choice = order.find(id => game.state.choices.includes(id));
  choice ??= game.state.choices[0];
  if (choice) game.choose(choice);
}
/** Input mỗi simulation step; không chỉnh vị trí hoặc HP để làm bot thắng. */
export function botInput(s: BotState, strategy = 'adaptive'): Vec {
  let tx = 0, ty = 110, best = Infinity, threat = false;
  if (strategy === 'beacon') return { x: 0, y: 0 };
  if (strategy === 'rim') return { x: Math.cos(s.time * 0.08) * 1550 - s.player.x, y: Math.sin(s.time * 0.08) * 1550 - s.player.y };
  for (const e of s.enemies) { const d = Math.hypot(e.x, e.y); if (e.target === 'beacon' && d < 430 && d < best) { best = d; tx = e.x; ty = e.y; threat = true; } }
  if (!threat) {
    best = Infinity;
    for (const p of s.pickups) { const d = Math.hypot(p.x - s.player.x, p.y - s.player.y); if (Math.hypot(p.x, p.y) < 1100 && d < best) { best = d; tx = p.x; ty = p.y; } }
    if (best === Infinity) for (const e of s.enemies) { const d = Math.hypot(e.x - s.player.x, e.y - s.player.y); if (d < best) { best = d; tx = e.x; ty = e.y; } }
    const boss = s.enemies.find(e => e.kind === 'elder' && e.hp > 0);
    if (boss) { const angle = Math.atan2(s.player.y - boss.y, s.player.x - boss.x) + 0.45; tx = boss.x + Math.cos(angle) * 150; ty = boss.y + Math.sin(angle) * 150; }
  }
  if (s.player.hp < 40) { tx = Math.cos(s.time * 0.3) * 260; ty = Math.sin(s.time * 0.3) * 260; }
  const close = s.enemies.find(e => Math.hypot(e.x - s.player.x, e.y - s.player.y) < (e.kind === 'elder' ? e.radius + 45 : 65));
  if (close) { const dx = s.player.x - close.x, dy = s.player.y - close.y, d = Math.hypot(dx, dy) || 1; tx = s.player.x + dx / d * 150; ty = s.player.y + dy / d * 150; }
  // Né telegraph thật bằng strafe; không sửa aim, damage hoặc vị trí tàu để thắng.
  if (s.beam && s.time >= s.beam.fire - 0.7 && s.time <= s.beam.end) { const a = s.beam.angle + Math.PI / 2; tx = s.player.x + Math.cos(a) * 300; ty = s.player.y + Math.sin(a) * 300; }
  return Math.hypot(tx - s.player.x, ty - s.player.y) < 8 ? { x: 0, y: 0 } : { x: tx - s.player.x, y: ty - s.player.y };
}
