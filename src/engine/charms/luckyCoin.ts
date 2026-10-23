import type { CharmDef } from './types';

export const luckyCoin: CharmDef = {
  id: 'lucky-coin',
  name: 'เหรียญโชคลาภ',
  emoji: '🪙',
  rarity: 'uncommon',
  cost: 6,
  description: 'ได้ $1 ทุกครั้งที่ไพ่ J/Q/K ถูกนับแต้ม',
  hooks: {
    onCardScored: ({ card }) => (card && card.rank >= 11 && card.rank <= 13 ? { money: 1 } : undefined),
  },
};

