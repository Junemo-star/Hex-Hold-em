import type { Card, HandResult } from './types';

function isFlush(cards: Card[]): boolean {
  return cards.length === 5 && cards.every((c) => c.suit === cards[0].suit);
}

function isStraight(cards: Card[]): boolean {
  if (cards.length !== 5) return false;
  const ranks = new Set(cards.map((c) => c.rank));
  if (ranks.size !== 5) return false;
  const sorted = [...ranks].sort((a, b) => a - b);
  if (sorted[4] - sorted[0] === 4) return true;
  // Ace-low: A,2,3,4,5
  return sorted.join(',') === '2,3,4,5,14';
}

/** Evaluate 1-5 cards into a poker hand and the cards that score. */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length === 0) return { hand: 'High Card', scoringIds: [] };

  const byRank = new Map<number, Card[]>();
  for (const c of cards) {
    const group = byRank.get(c.rank) ?? [];
    group.push(c);
    byRank.set(c.rank, group);
  }
  const groups = [...byRank.values()].sort(
    (a, b) => b.length - a.length || b[0].rank - a[0].rank,
  );
  const counts = groups.map((g) => g.length);
  const ids = (cs: Card[]) => cs.map((c) => c.id);
  const allIds = ids(cards);

  const flush = isFlush(cards);
  const straight = isStraight(cards);

  if (straight && flush) return { hand: 'Straight Flush', scoringIds: allIds };
  if (counts[0] === 4) return { hand: 'Four of a Kind', scoringIds: ids(groups[0]) };
  if (counts[0] === 3 && counts[1] === 2) return { hand: 'Full House', scoringIds: allIds };
  if (flush) return { hand: 'Flush', scoringIds: allIds };
  if (straight) return { hand: 'Straight', scoringIds: allIds };
  if (counts[0] === 3) return { hand: 'Three of a Kind', scoringIds: ids(groups[0]) };
  if (counts[0] === 2 && counts[1] === 2) {
    return { hand: 'Two Pair', scoringIds: [...ids(groups[0]), ...ids(groups[1])] };
  }
  if (counts[0] === 2) return { hand: 'Pair', scoringIds: ids(groups[0]) };

  const highest = cards.reduce((best, c) => (c.rank > best.rank ? c : best));
  return { hand: 'High Card', scoringIds: [highest.id] };
}

