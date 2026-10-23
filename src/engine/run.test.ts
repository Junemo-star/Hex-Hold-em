import { describe, expect, it } from 'vitest';
import { advance, newRun, payoutFor, targetFor } from './run';

describe('run progression', () => {
  it('scales targets by stage', () => {
    expect(targetFor(1, 'small')).toBe(300);
    expect(targetFor(1, 'big')).toBe(450);
    expect(targetFor(1, 'boss')).toBe(600);
    expect(targetFor(8, 'boss')).toBe(100000);
  });

  it('pays base + hands + capped interest + bonus', () => {
    const run = { ...newRun(), money: 12 };
    expect(payoutFor(run, 2)).toEqual({ base: 3, handsBonus: 2, interest: 2, bonus: 0, total: 7 });
    expect(payoutFor(run, 2, 5).total).toBe(12);
    expect(payoutFor({ ...run, money: 100 }, 0).interest).toBe(5);
  });

  it('advances through stages, floors and victory', () => {
    let { run } = advance(newRun());
    expect(run).toMatchObject({ floor: 1, stage: 1 });
    ({ run } = advance(run));
    ({ run } = advance(run));
    expect(run).toMatchObject({ floor: 2, stage: 0 });
    const last = { ...newRun(), floor: 8, stage: 2 };
    expect(advance(last).victory).toBe(true);
  });

  it('starts with a full 52 card deck', () => {
    expect(newRun().deck).toHaveLength(52);
  });
});
