import type { Card, Rank, Suit } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${suit}-${rank}`, rank, suit });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle, returns a new array. */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Draw up to n cards from the top of the deck. */
export function draw(deck: Card[], n: number): { drawn: Card[]; rest: Card[] } {
  return { drawn: deck.slice(0, n), rest: deck.slice(n) };
}

export function rankLabel(rank: Rank): string {
  switch (rank) {
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    case 14: return 'A';
    default: return String(rank);
  }
}

export const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export function sortCards(cards: Card[], by: 'rank' | 'suit'): Card[] {
  const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
  return cards.slice().sort((a, b) => {
    if (by === 'rank') return b.rank - a.rank || suitOrder[a.suit] - suitOrder[b.suit];
    return suitOrder[a.suit] - suitOrder[b.suit] || b.rank - a.rank;
  });
}

