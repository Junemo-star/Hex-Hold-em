import { getCharm } from './charms';
import type { CharmInstance, Effect } from './charms/types';
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

export interface ScoreContext {
  levels?: HandLevels;
  charms?: CharmInstance[];
  /** cards still in hand when the hand is played (for onHeldInHand) */
  held?: Card[];
  discardsLeft?: number;
  handsLeft?: number;
  rng?: () => number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

type StepMeta = Pick<ScoreStep, 'kind' | 'label'> & Partial<Pick<ScoreStep, 'cardId' | 'charmIndex'>>;

/**
 * Pure scoring pipeline. Order: base hand -> each scoring card left to right
 * (chips, fire, charm onCardScored) -> held cards (onHeldInHand) -> charms left
 * to right (onHandScored). Returns the steps for the UI to animate plus the total.
 */
export function scoreHand(played: Card[], ctx: ScoreContext = {}): ScoreResult {
  const { levels = {}, held = [], discardsLeft = 0, handsLeft = 0, rng = Math.random } = ctx;
  const charms = (ctx.charms ?? []).map((c) => ({ ...c }));
  const { hand, scoringIds } = evaluateHand(played);
  const base = handBaseAtLevel(hand, levels);
  const scoringSet = new Set(scoringIds);
  const scoring = played.filter((c) => scoringSet.has(c.id));

  let chips = 0;
  let mult = 0;
  let money = 0;
  const steps: ScoreStep[] = [];
  const burned: string[] = [];

  const push = (meta: StepMeta, e: Effect) => {
    if (e.chips) chips += e.chips;
    if (e.mult) mult += e.mult;
    if (e.xMult) mult = round2(mult * e.xMult);
    if (e.money) money += e.money;
    steps.push({
      ...meta,
      chips,
      mult,
      addChips: e.chips,
      addMult: e.mult,
      xMult: e.xMult,
      money: e.money,
    });
  };

  const fireHook = (hook: 'onCardScored' | 'onHeldInHand' | 'onHandScored', card?: Card) => {
    charms.forEach((inst, i) => {
      const def = getCharm(inst.defId);
      const fn = def?.hooks[hook];
      if (!def || !fn) return;
      const e = fn({ hand, played, scoring, card, discardsLeft, handsLeft, counter: inst.counter });
      if (!e) return;
      if (e.counter !== undefined) inst.counter = e.counter;
      if (e.chips || e.mult || e.xMult || e.money) {
        push({ kind: 'charm', label: def.name, charmIndex: i, cardId: card?.id }, e);
      }
    });
  };

  push({ kind: 'hand', label: hand }, { chips: base.chips, mult: base.mult });

  for (const card of scoring) {
    const add = cardChips(card);
    push({ kind: 'card', label: `+${add}`, cardId: card.id }, { chips: add });
    if (card.enhancement === 'fire') {
      push({ kind: 'card', label: 'ไพ่เพลิง', cardId: card.id }, { xMult: 2 });
      if (rng() < 0.25) burned.push(card.id);
    }
    fireHook('onCardScored', card);
  }

  for (const card of held) fireHook('onHeldInHand', card);
  fireHook('onHandScored');

  return { hand, steps, chips, mult, total: Math.floor(chips * mult), money, charms, burned };
}
