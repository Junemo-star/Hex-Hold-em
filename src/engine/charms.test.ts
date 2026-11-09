import { describe, expect, it } from 'vitest';
import { CHARMS } from './charms';
import { scoreHand } from './scoring';
import { cards } from './testHelpers';

const charm = (defId: string, counter = 0) => ({ defId, counter });

describe('charm scoring', () => {
  it('registers all 50 charms', () => {
    expect(CHARMS).toHaveLength(50);
  });

  it('beer jug adds +4 mult', () => {
    expect(scoreHand(cards('2h 2d'), { charms: [charm('beer-jug')] }).total).toBe(84);
  });

  it('suit charms trigger per scoring card only', () => {
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
    const pair = scoreHand(cards('2h 2d'), { charms: second.charms });
    expect(pair.charms[0].counter).toBe(2);
    expect(pair.mult).toBe(2 + 2);
  });

  it('lucky coin pays for face cards', () => {
    const r = scoreHand(cards('Kh Kd 3c'), { charms: [charm('lucky-coin')] });
    expect(r.money).toBe(2);
  });

  it('supports Phase 5 charms (odd-candle, even-goblet, blood-pact, philosopher-stone)', () => {
    const odd = scoreHand(cards('3h 3d'), { charms: [charm('odd-candle')] });
    expect(odd.chips).toBe(66);

    const even = scoreHand(cards('4h 4d'), { charms: [charm('even-goblet')] });
    expect(even.mult).toBe(10);

    const pact = scoreHand(cards('4h 4d'), {
      charms: [charm('blood-pact'), charm('philosopher-stone')],
      discardsLeft: 0,
    });
    expect(pact.mult).toBe(8);
    expect(pact.money).toBe(2);
  });

  it('supports Balatro meta charms (abstract-grimoire, void-stencil, golden-bull, blackboard-rune)', () => {
    // abstract-grimoire: +3 mult per charm held (2 charms = +6 mult)
    const abs = scoreHand(cards('2h 2d'), {
      charms: [charm('abstract-grimoire'), charm('beer-jug')],
    });
    expect(abs.mult).toBe(2 + 6 + 4);

    // void-stencil alone (1 charm -> 4 empty slots -> x5 mult)
    const stencil = scoreHand(cards('2h 2d'), { charms: [charm('void-stencil')] });
    expect(stencil.mult).toBe(2 * 5);

    // golden-bull with $20 -> +40 chips
    const bull = scoreHand(cards('2h 2d'), { charms: [charm('golden-bull')], money: 20 });
    expect(bull.chips).toBe(14 + 40);

    // blackboard-rune with all black held cards -> x3 mult
    const bb = scoreHand(cards('2h 2d'), {
      charms: [charm('blackboard-rune')],
      held: cards('3s 9c Ks'),
    });
    expect(bb.mult).toBe(6);
  });

  it('supports Blueprint (mimic-slime) and Brainstorm (echo-skull) copying', () => {
    // mimic-slime copies beer-jug to its right (+4 mult twice), echo-skull copies leftmost (mimic-slime -> beer-jug, +4 mult a 3rd time)
    const r = scoreHand(cards('2h 2d'), {
      charms: [charm('mimic-slime'), charm('beer-jug'), charm('echo-skull')],
    });
    expect(r.mult).toBe(2 + 4 + 4 + 4);
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
