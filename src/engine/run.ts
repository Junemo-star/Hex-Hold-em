import type { CharmInstance } from './charms/types';
import { createDeck } from './deck';
import type { Card } from './types';

export const FLOORS = 8;
export type StageKind = 'small' | 'big' | 'boss';
export const STAGES: StageKind[] = ['small', 'big', 'boss'];

const BASE_TARGETS = [300, 800, 2000, 5000, 11000, 20000, 35000, 50000];
const STAGE_MULT: Record<StageKind, number> = { small: 1, big: 1.5, boss: 2 };
const STAGE_PAY: Record<StageKind, number> = { small: 3, big: 4, boss: 5 };
export const STAGE_NAME: Record<StageKind, string> = {
  small: 'โต๊ะเล็ก',
  big: 'โต๊ะใหญ่',
  boss: 'เจ้ามือบอส',
};

export const START_MONEY = 4;
export const MAX_CHARMS = 5;

export interface RunState {
  /** 1..FLOORS (or 9+ in Endless Mode) */
  floor: number;
  /** 0..2 index into STAGES */
  stage: number;
  money: number;
  deck: Card[];
  charms: CharmInstance[];
  /** true once the player has cleared Floor 8 and entered Endless Mode */
  endless?: boolean;
}

export interface Payout {
  base: number;
  handsBonus: number;
  interest: number;
  /** extra money earned at the table (e.g. Lucky Coin charm) */
  bonus: number;
  total: number;
}

export function newRun(): RunState {
  return {
    floor: 1,
    stage: 0,
    money: START_MONEY,
    deck: createDeck(),
    charms: [],
    endless: false,
  };
}

export function stageKind(run: RunState): StageKind {
  return STAGES[run.stage];
}

export function targetFor(floor: number, kind: StageKind): number {
  const base =
    floor <= BASE_TARGETS.length
      ? BASE_TARGETS[floor - 1]
      : Math.round(BASE_TARGETS[BASE_TARGETS.length - 1] * Math.pow(1.85, floor - BASE_TARGETS.length));
  return Math.round(base * STAGE_MULT[kind]);
}

/** Money earned for beating a table: base + $1 per hand left + $1 per $5 held (max $5) + bonus. */
export function payoutFor(run: RunState, handsLeft: number, bonus = 0): Payout {
  const base = STAGE_PAY[stageKind(run)];
  const handsBonus = handsLeft;
  const interest = Math.min(5, Math.floor(run.money / 5));
  return { base, handsBonus, interest, bonus, total: base + handsBonus + interest + bonus };
}

/**
 * Advance to the next table.
 * `victory` is true right when beating the Floor 8 boss for the first time;
 * `run` still advances to Floor 9 so the player can opt into Endless Mode.
 */
export function advance(run: RunState): { run: RunState; victory: boolean } {
  if (run.stage < STAGES.length - 1) {
    return { run: { ...run, stage: run.stage + 1 }, victory: false };
  }
  const justBeatFloor8 = run.floor === FLOORS && !run.endless;
  return {
    run: {
      ...run,
      floor: run.floor + 1,
      stage: 0,
      endless: run.endless || justBeatFloor8,
    },
    victory: justBeatFloor8,
  };
}

/** Swap the charm at index i with its neighbour (order matters for scoring). */
export function moveCharm(charms: CharmInstance[], i: number, dir: -1 | 1): CharmInstance[] {
  const j = i + dir;
  if (j < 0 || j >= charms.length) return charms;
  const next = charms.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
