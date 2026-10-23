import type { CharmDef } from './types';

export const ouroboros: CharmDef = {
  id: 'ouroboros',
  name: 'งูกินหาง',
  emoji: '🐍',
  rarity: 'rare',
  cost: 8,
  description: 'ทุกครั้งที่เล่น High Card สะสม +1 Mult ถาวร (ให้ Mult ที่สะสมไว้ทุกมือ)',
  hooks: {
    onHandScored: ({ hand, counter }) => {
      const next = counter + (hand === 'High Card' ? 1 : 0);
      return next > 0 ? { mult: next, counter: next } : undefined;
    },
  },
};

