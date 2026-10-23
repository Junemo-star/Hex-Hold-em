import type { Suit } from '../types';
import type { CharmDef } from './types';

function suitCharm(id: string, name: string, emoji: string, suit: Suit, symbol: string): CharmDef {
  return {
    id,
    name,
    emoji,
    rarity: 'common',
    cost: 4,
    description: `ไพ่ ${symbol} ที่นับแต้ม +3 Mult`,
    hooks: { onCardScored: ({ card }) => (card?.suit === suit ? { mult: 3 } : undefined) },
  };
}

export const fireRing = suitCharm('fire-ring', 'แหวนเพลิง', '🔥', 'hearts', '♥');
export const waterPendant = suitCharm('water-pendant', 'จี้หยดน้ำ', '💧', 'spades', '♠');
export const elderBranch = suitCharm('elder-branch', 'กิ่งไม้ผู้เฒ่า', '🌿', 'clubs', '♣');
export const earthCrystal = suitCharm('earth-crystal', 'คริสตัลดิน', '💎', 'diamonds', '♦');

