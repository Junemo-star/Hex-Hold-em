import type { Card, HandType } from '../types';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

/** What a charm hook contributes to the score. */
export interface Effect {
  chips?: number;
  mult?: number;
  xMult?: number;
  money?: number;
  /** sets the charm's persistent counter */
  counter?: number;
}

export interface HookCtx {
  hand: HandType;
  played: Card[];
  /** played cards that are part of the poker hand */
  scoring: Card[];
  /** cards still held in hand while scoring */
  held: Card[];
  /** the card being scored (onCardScored) or held (onHeldInHand) */
  card?: Card;
  discardsLeft: number;
  handsLeft: number;
  counter: number;
  /** Balatro-style meta context */
  charmCount: number;
  emptyCharmSlots: number;
  money: number;
  deckRemaining: number;
}

export interface CharmDef {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  cost: number;
  description: string;
  /** Blueprint ('right') or Brainstorm ('leftmost') copy mechanic */
  copyTarget?: 'right' | 'leftmost';
  hooks: Partial<{
    onCardScored(ctx: HookCtx): Effect | void;
    onHeldInHand(ctx: HookCtx): Effect | void;
    onHandScored(ctx: HookCtx): Effect | void;
  }>;
}

export interface CharmInstance {
  defId: string;
  counter: number;
}
