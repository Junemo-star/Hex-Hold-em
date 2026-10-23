import type { CharmDef } from './types';

export const gamblerBones: CharmDef = {
  id: 'gambler-bones',
  name: 'กระดูกนักพนัน',
  emoji: '🦴',
  rarity: 'uncommon',
  cost: 6,
  description: '+15 Chips ต่อ Discard ที่เหลือ',
  hooks: {
    onHandScored: ({ discardsLeft }) => (discardsLeft > 0 ? { chips: 15 * discardsLeft } : undefined),
  },
};

