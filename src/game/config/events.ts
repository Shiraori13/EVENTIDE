export type AstronomyId = 'radiation' | 'chaos' | 'tide';
export const ASTRONOMY = {
  warning: 3, radiationTick: 1, radiationShipDPS: 4, radiationEnemyFraction: 0.02, radiationEnemyCap: 10,
  chaosEnemy: 1.5, chaosOutgoing: 1.15, tideRadius: 420, tideForce: 90, tideCycle: 6,
  hatchLines: 9,
  schedule: [
    { id: 'radiation', start: 210, duration: 45, name: 'Vành đai bức xạ', icon: '☢', description: 'Vùng kẻ vạch: tàu −4 HP/s trước giáp; quái thường −2% HP/s (tối đa 10).' },
    { id: 'chaos', start: 330, duration: 90, name: 'Bùng nổ hỗn loạn', icon: '✹', description: 'Quái thường: HP/sát thương +50%; tàu: sát thương +15%.' },
    { id: 'tide', start: 465, duration: 45, name: 'Thủy triều trọng lực', icon: '↔', description: 'Trường hút rồi đẩy theo chu kỳ 6 giây; không kéo chiến lợi phẩm.' },
  ],
  zones: [{ x: 900, y: 300, radius: 180 }, { x: -900, y: -300, radius: 180 }],
  tideCenter: { x: 950, y: 0 },
} as const;
