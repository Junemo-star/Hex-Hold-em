import type { CharmDef } from './types';

export const crown: CharmDef = {
  id: 'crown',
  name: 'มงกุฎจอมเวท',
  emoji: '👑',
  rarity: 'legendary',
  cost: 20,
  description: '×1.5 Mult ต่อไพ่ K ที่ค้างในมือ',
  hooks: { onHeldInHand: ({ card }) => (card?.rank === 13 ? { xMult: 1.5 } : undefined) },
};

