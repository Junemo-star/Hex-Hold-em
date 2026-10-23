import type { CharmDef } from './types';

export const moonEye: CharmDef = {
  id: 'moon-eye',
  name: 'ดวงตาจันทรา',
  emoji: '🌙',
  rarity: 'rare',
  cost: 8,
  description: '×3 Mult ถ้าเล่นไพ่พอดี 3 ใบ',
  hooks: { onHandScored: ({ played }) => (played.length === 3 ? { xMult: 3 } : undefined) },
};

