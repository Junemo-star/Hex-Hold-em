import type { Card, Rank, Suit } from './types';

const S: Record<string, Suit> = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };

/** "Ah Kd 10s" -> cards (ids are unique per position) */
export function cards(spec: string): Card[] {
  return spec.split(' ').map((t, i) => {
    const suit = S[t.slice(-1)];
    const r = t.slice(0, -1);
    const rank = ({ J: 11, Q: 12, K: 13, A: 14 } as Record<string, number>)[r] ?? Number(r);
    return { id: `${i}-${r}${suit}`, rank: rank as Rank, suit };
  });
}

