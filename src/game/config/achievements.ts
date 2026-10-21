import { BALANCE as B } from './balance';
import type { SaveData } from '../core/types';
export interface CareerMetrics { drifterKills: number; leechKills: number; bestKills: number; survival: number; wins: number; healthyBeaconWins: number; healthyShipWins: number; miniSun: number; supernova: number; pulsarHits: number; ionHits: number; bossKills: number; bossPhase2: number; salvageCollected: number; salvageBudgetBP: number; corruptionSeconds: number; lightHealing: number }
export type AchievementMetric = keyof CareerMetrics | 'careerKills' | 'coreLevel';
export const emptyCareerMetrics = (): CareerMetrics => ({ drifterKills: 0, leechKills: 0, bestKills: 0, survival: 0, wins: 0, healthyBeaconWins: 0, healthyShipWins: 0, miniSun: 0, supernova: 0, pulsarHits: 0, ionHits: 0, bossKills: 0, bossPhase2: 0, salvageCollected: 0, salvageBudgetBP: 0, corruptionSeconds: 0, lightHealing: 0 });
interface Achievement { id: string; code: string; name: string; target: number; icon: string; metric: AchievementMetric; group: string; unit: string; description: string }
const definition = (code: string, id: string, name: string, metric: AchievementMetric, target: number, group: string, unit: string, icon: string, description: string): Achievement => ({ code, id, name, metric, target, group, unit, icon, description });
export const ACHIEVEMENTS: readonly Achievement[] = [
  ...([100, 500, 1000, 2500, 5000] as const).map((target, i) => definition(`A0${i + 1}`, `kills-${target}`, ['Tia sáng đầu tiên', 'Người giữ quỹ đạo', 'Lá chắn ngân hà', 'Bình minh xa', 'Ánh sáng bất diệt'][i], 'careerKills', target, 'Chiến đấu', 'quái', ['beacon', 'nova', 'drones', 'well', 'elder'][i], `Tiêu diệt ${target.toLocaleString('vi-VN')} Hollowborn trong hồ sơ.`)),
  definition('A06', 'drifters-50', 'Dọn đường phế tích', 'drifterKills', 50, 'Chiến đấu', 'Drifter', 'drifter', 'Tiêu diệt tổng cộng 50 Hollow Drifters.'),
  definition('A07', 'leeches-50', 'Cắt đuôi ký sinh', 'leechKills', 50, 'Chiến đấu', 'Leech', 'leech', 'Tiêu diệt tổng cộng 50 Void Leeches.'),
  definition('A08', 'run-kills-250', 'Một mình chống bầy', 'bestKills', 250, 'Chiến đấu', 'quái / lượt', 'drones', 'Tiêu diệt 250 quái trong một lượt.'),
  definition('A09', 'survive-180', 'Qua vùng tối', 'survival', 180, 'Sinh tồn', 'giây', 'nova', 'Sống 3 phút trong một lượt.'),
  definition('A10', 'survive-360', 'Giữ vững tín hiệu', 'survival', 360, 'Sinh tồn', 'giây', 'beacon', 'Sống 6 phút trong một lượt.'),
  definition('A11', 'survive-600', 'Trước giờ bình minh', 'survival', 600, 'Sinh tồn', 'giây', 'beacon', 'Sống 10 phút trong một lượt.'),
  definition('A12', 'victory-1', 'Thắp lại vì sao', 'wins', 1, 'Hải đăng', 'chiến thắng', 'beacon', 'Hoàn thành một chiến thắng.'),
  definition('A13', 'victory-5', 'Người giữ năm ngọn sáng', 'wins', 5, 'Hải đăng', 'chiến thắng', 'beacon', 'Hoàn thành 5 chiến thắng.'),
  definition('A14', 'beacon-healthy', 'Hải đăng nguyên vẹn', 'healthyBeaconWins', 1, 'Hải đăng', 'lần', 'beacon', 'Thắng với Beacon còn ít nhất 75% HP.'),
  definition('A15', 'ship-healthy', 'Trở về bình an', 'healthyShipWins', 1, 'Sinh tồn', 'lần', 'hull', 'Thắng với tàu còn ít nhất 50% HP.'),
  definition('A16', 'mini-sun', 'Mặt trời bỏ túi', 'miniSun', 1, 'Vũ khí', 'lần', 'shotSun', 'Đạt Plasma cấp 3: Mini Sun.'),
  definition('A17', 'supernova', 'Bùng nổ siêu tân tinh', 'supernova', 1, 'Vũ khí', 'lần', 'shotSupernova', 'Đạt Plasma cấp 5: Supernova.'),
  definition('A18', 'pulsar-hit', 'Nhịp đập Pulsar', 'pulsarHits', 1, 'Vũ khí', 'lần', 'pulsar', 'Gây sát thương bằng Pulsar Beam.'),
  definition('A19', 'ion-hit', 'Sấm giữa hư không', 'ionHits', 1, 'Vũ khí', 'lần', 'ion', 'Gây sát thương bằng Ion Storm.'),
  definition('A20', 'elder-final', 'Kẻ hạ sao chết', 'bossKills', 1, 'Chiến đấu', 'lần', 'elder', 'Hạ một boss sau giai đoạn 2.'),
  definition('A21', 'elder-phase2', 'Đối mặt cơn thịnh nộ', 'bossPhase2', 1, 'Chiến đấu', 'lần', 'elder', 'Đưa một boss vào giai đoạn 2.'),
  definition('A22', 'core-1', 'Gia cố nguồn sáng', 'coreLevel', 1, 'Hải đăng', 'cấp', 'beacon', 'Nâng Beacon Core lên cấp 1.'),
  definition('A23', 'core-max', 'Lõi sáng hoàn thiện', 'coreLevel', B.corePrices.length, 'Hải đăng', 'cấp', 'beacon', 'Hoàn thiện Beacon Core.'),
  definition('A24', 'salvage-1', 'Công nghệ nhặt lại', 'salvageCollected', 1, 'Thu hồi', 'mảnh', 'salvage', 'Nhặt một mảnh trang bị và nhận bonus.'),
  definition('A25', 'salvage-1000', 'Phi thuyền cải tiến', 'salvageBudgetBP', 1000, 'Thu hồi', '%', 'salvage', 'Đạt 10% tổng bonus trang bị trong một lượt.'),
  definition('A26', 'salvage-2000', 'Tận dụng từng mảnh', 'salvageBudgetBP', 2000, 'Thu hồi', '%', 'salvage', 'Đạt trần 20% tổng bonus trang bị trong một lượt.'),
  definition('A27', 'corruption-30', 'Bước cùng Hư Vô', 'corruptionSeconds', 30, 'Sinh tồn', 'giây', 'well', 'Giữ Corruption từ 50 liên tục 30 giây.'),
  definition('A28', 'light-healing-50', 'Hồi sinh trong ánh sáng', 'lightHealing', 50, 'Sinh tồn', 'HP', 'hull', 'Hồi thực tế tổng cộng 50 HP từ vùng sáng.'),
];
export const achievementValue = (s: SaveData, metric: AchievementMetric): number => metric === 'careerKills' ? s.careerKills : metric === 'coreLevel' ? s.coreLevel : s.metrics[metric];
/** Đánh giá khi có credit/timer/purchase; load chỉ khôi phục trạng thái, không gửi toast. */
export function unlockAchievements(s: SaveData): string[] { const fresh = ACHIEVEMENTS.filter(a => achievementValue(s, a.metric) + 1e-7 >= a.target && !s.unlockedAchievements.includes(a.id)); s.unlockedAchievements.push(...fresh.map(a => a.id)); return fresh.map(a => a.name); }
