import type { CharmDef } from './types';

export const straightScroll: CharmDef = {
  id: 'straight-scroll',
  name: 'ม้วนคาถาเรียงลำดับ',
  emoji: '📜',
  rarity: 'uncommon',
  cost: 6,
  description: 'ถ้าเล่น Straight: +100 Chips',
  hooks: {
    onHandScored: ({ hand }) =>
      hand === 'Straight' || hand === 'Straight Flush' ? { chips: 100 } : undefined,
  },
};

