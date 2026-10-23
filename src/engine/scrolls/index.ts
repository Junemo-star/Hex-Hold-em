import { HAND_BASE } from '../scoring';
import type { HandType } from '../types';

export interface ScrollDef {
  id: string;
  hand: HandType;
  name: string;
  emoji: string;
  description: string;
  cost: number;
}

/** One scroll per poker hand; reading it levels that hand up. */
export const SCROLLS: ScrollDef[] = (Object.keys(HAND_BASE) as HandType[]).map((hand) => ({
  id: `scroll-${hand}`,
  hand,
  name: `คัมภีร์ ${hand}`,
  emoji: '📖',
  description: `อัพเลเวล ${hand}: +${HAND_BASE[hand].perLevelChips} Chips, +${HAND_BASE[hand].perLevelMult} Mult`,
  cost: 4,
}));

const BY_ID = new Map(SCROLLS.map((s) => [s.id, s]));

export function getScroll(id: string): ScrollDef | undefined {
  return BY_ID.get(id);
}

