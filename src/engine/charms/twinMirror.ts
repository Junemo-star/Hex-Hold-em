import type { HandType } from '../types';
import type { CharmDef } from './types';

const CONTAINS_PAIR: HandType[] = ['Pair', 'Two Pair', 'Three of a Kind', 'Full House', 'Four of a Kind'];

export const twinMirror: CharmDef = {
  id: 'twin-mirror',
  name: 'กระจกแฝด',
  emoji: '👯',
  rarity: 'common',
  cost: 4,
  description: 'ถ้ามือมี Pair: +8 Mult',
  hooks: { onHandScored: ({ hand }) => (CONTAINS_PAIR.includes(hand) ? { mult: 8 } : undefined) },
};

