import { BALANCE as B } from './balance';
export type AstronomyId = 'radiation' | 'chaos' | 'tide';
export const ASTRONOMY = {
  warning: 3, radiationTick: 1, radiationShipDPS: 7, radiationEnemyFraction: 0.02, radiationEnemyCap: 10,
  chaosEnemy: 1.5, chaosOutgoing: 1.15, tideRadius: 440, tideForce: B.playerSpeed * 0.7, tideCycle: 6, tideCue: 0.7, shipForceRatio: 0.78,
  radiationRadius:190, radiationSpread:.85, hatchLines: 9,
  schedule: [
    { id: 'radiation', start: 210, duration: 45, name: 'Vành đai bức xạ', icon: '☢', description: 'Vùng kẻ vạch: tàu −7 HP/s trước giáp; quái thường −2% HP/s (tối đa 10).' },
    { id: 'chaos', start: 330, duration: 90, name: 'Bùng nổ hỗn loạn', icon: '✹', description: 'Quái thường: HP/sát thương +50%; tàu: sát thương +15%.' },
    { id: 'tide', start: 465, duration: 45, name: 'Thủy triều trọng lực', icon: '↔', description: 'Trường hút rồi đẩy theo chu kỳ 6 giây; không kéo chiến lợi phẩm.' },
  ],
} as const;
