import { getCharm } from './charms';
import type { CharmDef, CharmInstance, Effect } from './charms/types';
import { evaluateHand } from './handEval';
import { MAX_CHARMS } from './run';
import type { Card, HandType, ScoreResult, ScoreStep, Suit } from './types';

interface HandBase {
  chips: number;
  mult: number;
}

export const HAND_BASE: Record<HandType, HandBase> = {
  'High Card': { chips: 5, mult: 1 },
  'Pair': { chips: 10, mult: 2 },
  'Two Pair': { chips: 20, mult: 2 },
  'Three of a Kind': { chips: 30, mult: 3 },
  'Straight': { chips: 30, mult: 4 },
  'Flush': { chips: 35, mult: 4 },
  'Full House': { chips: 40, mult: 4 },
  'Four of a Kind': { chips: 60, mult: 7 },
  'Straight Flush': { chips: 100, mult: 8 },
};

export function handBase(hand: HandType): HandBase {
  return HAND_BASE[hand];
}

export function cardChips(card: Card): number {
  if (card.rank === 14) return 11;
  if (card.rank >= 11) return 10;
  return card.rank;
}

export interface ScoreContext {
  charms?: CharmInstance[];
  /** cards still in hand when the hand is played (for onHeldInHand) */
  held?: Card[];
  discardsLeft?: number;
  handsLeft?: number;
  /** player's current money & remaining draw pile for Balatro meta charms */
  money?: number;
  deckRemaining?: number;
  /** Boss curse modifiers */
  disabledSuit?: Suit;
  bannedHands?: HandType[];
  sealedCharmIndices?: number[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

type StepMeta = Pick<ScoreStep, 'kind' | 'label'> & Partial<Pick<ScoreStep, 'cardId' | 'charmIndex'>>;

/** Resolve Blueprint ('right') or Brainstorm ('leftmost') copy targets up to 2 hops. */
function resolveCharmDef(
  charms: CharmInstance[],
  index: number,
  sealedSet: Set<number>,
): { def: CharmDef; targetIndex: number } | undefined {
  let currIdx = index;
  for (let hop = 0; hop < 3; hop++) {
    if (sealedSet.has(currIdx)) return undefined;
    const inst = charms[currIdx];
    if (!inst) return undefined;
    const def = getCharm(inst.defId);
    if (!def) return undefined;
    if (!def.copyTarget) return { def, targetIndex: currIdx };
    const nextIdx = def.copyTarget === 'right' ? currIdx + 1 : 0;
    if (nextIdx === currIdx || nextIdx >= charms.length) return undefined;
    currIdx = nextIdx;
  }
  return undefined;
}

/**
 * Pure scoring pipeline. Order: base hand -> each scoring card left to right
 * (chips, charm onCardScored) -> held cards (onHeldInHand) -> charms left
 * to right (onHandScored). Respects boss curses (banned hands, disabled suit, sealed charms).
 */
export function scoreHand(played: Card[], ctx: ScoreContext = {}): ScoreResult {
  const {
    held = [],
    discardsLeft = 0,
    handsLeft = 0,
    money: startMoney = 0,
    deckRemaining = 44,
    disabledSuit,
    bannedHands = [],
    sealedCharmIndices = [],
  } = ctx;
  const charms = (ctx.charms ?? []).map((c) => ({ ...c }));
  const charmCount = charms.length;
  const emptyCharmSlots = Math.max(0, MAX_CHARMS - charmCount);
  const { hand, scoringIds } = evaluateHand(played);
  const base = handBase(hand);
  const scoringSet = new Set(scoringIds);
  const scoring = played.filter((c) => scoringSet.has(c.id) && c.suit !== disabledSuit);
  const sealedSet = new Set(sealedCharmIndices);

  if (bannedHands.includes(hand)) {
    return {
      hand,
      steps: [{ kind: 'curse', label: `คำสาป! มือ ${hand} ถูกห้าม (0 แต้ม)`, chips: 0, mult: 0 }],
      chips: 0,
      mult: 0,
      total: 0,
      money: 0,
      charms,
      nullified: true,
    };
  }

  let chips = 0;
  let mult = 0;
  let money = 0;
  const steps: ScoreStep[] = [];

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
      if (sealedSet.has(i)) return;
      const originDef = getCharm(inst.defId);
      const resolved = resolveCharmDef(charms, i, sealedSet);
      if (!originDef || !resolved) return;
      const { def, targetIndex } = resolved;
      const fn = def.hooks[hook];
      if (!fn) return;
      const targetInst = charms[targetIndex];
      const e = fn({
        hand,
        played,
        scoring,
        held,
        card,
        discardsLeft,
        handsLeft,
        counter: targetInst.counter,
        charmCount,
        emptyCharmSlots,
        money: startMoney + money,
        deckRemaining,
      });
      if (!e) return;
      if (e.counter !== undefined && targetIndex === i) {
        inst.counter = e.counter;
      }
      if (e.chips || e.mult || e.xMult || e.money) {
        push({ kind: 'charm', label: originDef.name, charmIndex: i, cardId: card?.id }, e);
      }
    });
  };

  push({ kind: 'hand', label: hand }, { chips: base.chips, mult: base.mult });

  for (const card of played) {
    if (!scoringSet.has(card.id)) continue;
    if (card.suit === disabledSuit) {
      steps.push({
        kind: 'curse',
        label: 'ไพ่ถูกสาป!',
        cardId: card.id,
        chips,
        mult,
      });
      continue;
    }
    const add = cardChips(card);
    push({ kind: 'card', label: `+${add}`, cardId: card.id }, { chips: add });
    fireHook('onCardScored', card);
  }

  for (const card of held) fireHook('onHeldInHand', card);
  fireHook('onHandScored');

  return { hand, steps, chips, mult, total: Math.floor(chips * mult), money, charms };
}
