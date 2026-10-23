import { describe, expect, it } from 'vitest';
import { evaluateHand } from './handEval';
import { scoreHand } from './scoring';
import type { Card, Rank, Suit } from './types';

const S: Record<string, Suit> = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
/** "Ah Kd 10s" -> cards */
function cards(spec: string): Card[] {
  return spec.split(' ').map((t, i) => {
    const suit = S[t.slice(-1)];
    const r = t.slice(0, -1);
    const rank = ({ J: 11, Q: 12, K: 13, A: 14 } as Record<string, number>)[r] ?? Number(r);
    return { id: `${i}-${r}${suit}`, rank: rank as Rank, suit };
  });
}

describe('evaluateHand', () => {
  it('detects hand types', () => {
    expect(evaluateHand(cards('2h 5d 9c')).hand).toBe('High Card');
    expect(evaluateHand(cards('2h 2d 9c')).hand).toBe('Pair');
    expect(evaluateHand(cards('2h 2d 9c 9s')).hand).toBe('Two Pair');
    expect(evaluateHand(cards('2h 2d 2c')).hand).toBe('Three of a Kind');
    expect(evaluateHand(cards('3h 4d 5c 6s 7h')).hand).toBe('Straight');
    expect(evaluateHand(cards('Ah 2d 3c 4s 5h')).hand).toBe('Straight');
    expect(evaluateHand(cards('10h Jd Qc Ks Ah')).hand).toBe('Straight');
    expect(evaluateHand(cards('2h 5h 9h Jh Kh')).hand).toBe('Flush');
    expect(evaluateHand(cards('2h 2d 2c 9s 9h')).hand).toBe('Full House');
    expect(evaluateHand(cards('7h 7d 7c 7s 2h')).hand).toBe('Four of a Kind');
    expect(evaluateHand(cards('5h 6h 7h 8h 9h')).hand).toBe('Straight Flush');
  });

  it('does not wrap straights around the ace', () => {
    expect(evaluateHand(cards('Qh Kd Ac 2s 3h')).hand).toBe('High Card');
  });

  it('only scores cards in the hand', () => {
    const r = evaluateHand(cards('2h 2d 9c Ks'));
    expect(r.hand).toBe('Pair');
    expect(r.scoringIds).toHaveLength(2);
    expect(evaluateHand(cards('2h 9c Ks')).scoringIds).toHaveLength(1);
  });
});

describe('scoreHand', () => {
  it('computes chips x mult', () => {
    // Pair base 10 chips x2 mult, + 2 + 2 chips => 14 x 2 = 28
    const r = scoreHand(cards('2h 2d 9c Ks'));
    expect(r.total).toBe(28);
    expect(r.steps[0].kind).toBe('hand');
    expect(r.steps).toHaveLength(3);
  });

  it('applies hand levels', () => {
    // Pair lvl 2: 25 chips x3 mult, + 4 = 29 x 3 = 87
    expect(scoreHand(cards('2h 2d'), { Pair: 2 }).total).toBe(87);
  });
});

