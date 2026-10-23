import { evaluateHand } from './handEval';
import type { Card, HandType, ScoreResult, ScoreStep } from './types';

interface HandBase {
  chips: number;
  mult: number;
  perLevelChips: number;
  perLevelMult: number;
}

export const HAND_BASE: Record<HandType, HandBase> = {
  'High Card': { chips: 5, mult: 1, perLevelChips: 10, perLevelMult: 1 },
  'Pair': { chips: 10, mult: 2, perLevelChips: 15, perLevelMult: 1 },
  'Two Pair': { chips: 20, mult: 2, perLevelChips: 20, perLevelMult: 1 },
  'Three of a Kind': { chips: 30, mult: 3, perLevelChips: 20, perLevelMult: 2 },
  'Straight': { chips: 30, mult: 4, perLevelChips: 30, perLevelMult: 3 },
  'Flush': { chips: 35, mult: 4, perLevelChips: 15, perLevelMult: 2 },
  'Full House': { chips: 40, mult: 4, perLevelChips: 25, perLevelMult: 2 },
  'Four of a Kind': { chips: 60, mult: 7, perLevelChips: 30, perLevelMult: 3 },
  'Straight Flush': { chips: 100, mult: 8, perLevelChips: 40, perLevelMult: 4 },
};

export type HandLevels = Partial<Record<HandType, number>>;

export function handBaseAtLevel(hand: HandType, levels: HandLevels = {}) {
  const base = HAND_BASE[hand];
  const lv = (levels[hand] ?? 1) - 1;
  return {
    chips: base.chips + base.perLevelChips * lv,
    mult: base.mult + base.perLevelMult * lv,
  };
}

export function cardChips(card: Card): number {
  if (card.rank === 14) return 11;
  if (card.rank >= 11) return 10;
  return card.rank;
}

/**
 * Pure scoring pipeline. Returns the list of steps for the UI to animate
 * plus the final total. Cards are scored left to right (order as given).
 */
export function scoreHand(played: Card[], levels: HandLevels = {}): ScoreResult {
  const { hand, scoringIds } = evaluateHand(played);
  const base = handBaseAtLevel(hand, levels);

  let chips = base.chips;
  let mult = base.mult;
  const steps: ScoreStep[] = [
    { kind: 'hand', label: hand, chips, mult, addChips: base.chips, addMult: base.mult },
  ];

  const scoring = new Set(scoringIds);
  for (const card of played) {
    if (!scoring.has(card.id)) continue;
    const add = cardChips(card);
    chips += add;
    steps.push({ kind: 'card', label: `+${add}`, cardId: card.id, chips, mult, addChips: add });
  }

  return { hand, steps, chips, mult, total: chips * mult };
}

