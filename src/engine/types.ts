export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
/** 2-10, 11=J, 12=Q, 13=K, 14=A */
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export type HandType =
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush';

export interface HandResult {
  hand: HandType;
  /** ids of cards that take part in the hand and therefore score */
  scoringIds: string[];
}

/** One animated step of the scoring pipeline. Totals are running values AFTER the step. */
export interface ScoreStep {
  kind: 'hand' | 'card';
  label: string;
  cardId?: string;
  chips: number;
  mult: number;
  /** what this step added, for floating text */
  addChips?: number;
  addMult?: number;
}

export interface ScoreResult {
  hand: HandType;
  steps: ScoreStep[];
  chips: number;
  mult: number;
  total: number;
}

