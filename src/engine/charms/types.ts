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
  /** the card being scored (onCardScored) or held (onHeldInHand) */
  card?: Card;
  discardsLeft: number;
  handsLeft: number;
  counter: number;
}

export interface CharmDef {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  cost: number;
  description: string;
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

