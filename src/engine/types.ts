import type { CharmInstance } from './charms/types';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
/** 2-10, 11=J, 12=Q, 13=K, 14=A */
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export type Enhancement = 'gold' | 'fire';

export interface Card {
  /** Stable identity. Does not change when a potion alters suit/rank. */
  id: string;
  rank: Rank;
  suit: Suit;
  enhancement?: Enhancement;
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

/** One animated step of the scoring pipeline. chips/mult are running totals AFTER the step. */
export interface ScoreStep {
  kind: 'hand' | 'card' | 'charm';
  label: string;
  cardId?: string;
  charmIndex?: number;
  chips: number;
  mult: number;
  /** what this step added, for floating text */
  addChips?: number;
  addMult?: number;
  xMult?: number;
  money?: number;
}

export interface ScoreResult {
  hand: HandType;
  steps: ScoreStep[];
  chips: number;
  mult: number;
  total: number;
  /** money earned during scoring (e.g. Lucky Coin) */
  money: number;
  /** charms with their updated persistent counters */
  charms: CharmInstance[];
  /** ids of cards that burned up after scoring */
  burned: string[];
}
