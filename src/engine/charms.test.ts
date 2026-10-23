import { describe, expect, it } from 'vitest';
import { CHARMS } from './charms';
import { scoreHand } from './scoring';
import { cards } from './testHelpers';

const charm = (defId: string, counter = 0) => ({ defId, counter });

describe('charm scoring', () => {
  it('registers all 36 charms', () => {
    expect(CHARMS).toHaveLength(36);
  });

  it('beer jug adds +4 mult', () => {
    // Pair 10+2+2=14 chips, mult 2+4=6 => 84
    expect(scoreHand(cards('2h 2d'), { charms: [charm('beer-jug')] }).total).toBe(84);
  });

  it('suit charms trigger per scoring card only', () => {
    // Pair of hearts + a spade kicker: +3 mult for each scoring heart = 2+6=8, chips 14
    const r = scoreHand(cards('2h 2h 9s'), { charms: [charm('fire-ring')] });
    expect(r.total).toBe(14 * 8);
  });

  it('order matters: +mult before xMult beats xMult before +mult', () => {
    const hand = cards('2h 2d 9c');
    const plusFirst = scoreHand(hand, { charms: [charm('beer-jug'), charm('moon-eye')] });
    const timesFirst = scoreHand(hand, { charms: [charm('moon-eye'), charm('beer-jug')] });
    expect(plusFirst.total).toBeGreaterThan(timesFirst.total);
  });

  it('crown multiplies per held king', () => {
    const r = scoreHand(cards('2h 2d'), { charms: [charm('crown')], held: cards('Kh Kd 3c') });
    // mult 2 -> 3 -> 4.5 ; chips 14
    expect(r.mult).toBe(4.5);
    expect(r.total).toBe(Math.floor(14 * 4.5));
  });

  it('gambler bones scales with discards left', () => {
    const r = scoreHand(cards('2h 2d'), { charms: [charm('gambler-bones')], discardsLeft: 2 });
    expect(r.chips).toBe(14 + 30);
  });

  it('ouroboros accumulates counter on high card', () => {
    const first = scoreHand(cards('2h 9c'), { charms: [charm('ouroboros')] });
    expect(first.charms[0].counter).toBe(1);
    const second = scoreHand(cards('2h 9c'), { charms: first.charms });
    expect(second.charms[0].counter).toBe(2);
    expect(second.mult).toBe(1 + 2);
    // a pair doesn't increase it but still pays out the stored mult
    const pair = scoreHand(cards('2h 2d'), { charms: second.charms });
    expect(pair.charms[0].counter).toBe(2);
    expect(pair.mult).toBe(2 + 2);
  });

  it('lucky coin pays for face cards', () => {
    const r = scoreHand(cards('Kh Kd 3c'), { charms: [charm('lucky-coin')] });
    expect(r.money).toBe(2);
  });

  it('supports new Phase 5 charms (odd-candle, even-goblet, blood-pact, philosopher-stone)', () => {
    const odd = scoreHand(cards('3h 3d'), { charms: [charm('odd-candle')] });
    // Pair base 10 + 3 + 3 + 25 + 25 = 66 chips
    expect(odd.chips).toBe(66);

    const even = scoreHand(cards('4h 4d'), { charms: [charm('even-goblet')] });
    // Pair base mult 2 + 4 + 4 = 10
    expect(even.mult).toBe(10);

    const pact = scoreHand(cards('4h 4d'), {
      charms: [charm('blood-pact'), charm('philosopher-stone')],
      discardsLeft: 0,
    });
    // mult 2 * 2 * 2 = 8, money +2
    expect(pact.mult).toBe(8);
    expect(pact.money).toBe(2);
  });
});

describe('boss curses in scoring', () => {
  it('disables a cursed suit from adding chips or triggering charms', () => {
    const r = scoreHand(cards('2h 2d'), {
      charms: [charm('fire-ring')],
      disabledSuit: 'hearts',
    });
    expect(r.chips).toBe(12);
    expect(r.mult).toBe(2);
  });

  it('nullifies banned hands completely', () => {
    const r = scoreHand(cards('2h 2d'), { bannedHands: ['Pair'] });
    expect(r.total).toBe(0);
    expect(r.nullified).toBe(true);
  });

  it('ignores sealed charm indices', () => {
    const r = scoreHand(cards('2h 2d'), {
      charms: [charm('beer-jug'), charm('twin-mirror')],
      sealedCharmIndices: [0],
    });
    expect(r.mult).toBe(10);
  });
});
