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

export interface RunState {
  /** 1..FLOORS */
  floor: number;
  /** 0..2 index into STAGES */
  stage: number;
  money: number;
}

export interface Payout {
  base: number;
  handsBonus: number;
  interest: number;
  total: number;
}

export function newRun(): RunState {
  return { floor: 1, stage: 0, money: START_MONEY };
}

export function stageKind(run: RunState): StageKind {
  return STAGES[run.stage];
}

export function targetFor(floor: number, kind: StageKind): number {
  return Math.round(BASE_TARGETS[floor - 1] * STAGE_MULT[kind]);
}

/** Money earned for beating a table: base + $1 per hand left + $1 per $5 held (max $5). */
export function payoutFor(run: RunState, handsLeft: number): Payout {
  const base = STAGE_PAY[stageKind(run)];
  const handsBonus = handsLeft;
  const interest = Math.min(5, Math.floor(run.money / 5));
  return { base, handsBonus, interest, total: base + handsBonus + interest };
}

/** Advance to the next table. `victory` is true after beating the floor 8 boss. */
export function advance(run: RunState): { run: RunState; victory: boolean } {
  if (run.stage < STAGES.length - 1) return { run: { ...run, stage: run.stage + 1 }, victory: false };
  if (run.floor >= FLOORS) return { run, victory: true };
  return { run: { ...run, floor: run.floor + 1, stage: 0 }, victory: false };
}

