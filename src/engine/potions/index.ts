import type { Card, Rank } from '../types';

export interface PotionDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  minTargets: number;
  maxTargets: number;
  /** Returns a transformed copy of `cards`; `targets` are the selected cards in left-to-right order. */
  apply(cards: Card[], targets: Card[]): Card[];
}

function mapTargets(cards: Card[], targets: Card[], fn: (c: Card) => Card): Card[] {
  const ids = new Set(targets.map((t) => t.id));
  return cards.map((c) => (ids.has(c.id) ? fn(c) : c));
}

/** Registry: to add a potion, define it here. */
export const POTIONS: PotionDef[] = [
  {
    id: 'dye',
    name: 'ยาย้อมดอก',
    emoji: '🎨',
    description: 'เลือก 2-3 ใบ เปลี่ยนทั้งหมดเป็นดอกของใบซ้ายสุด',
    cost: 3,
    minTargets: 2,
    maxTargets: 3,
    apply: (cards, targets) => mapTargets(cards, targets, (c) => ({ ...c, suit: targets[0].suit })),
  },
  {
    id: 'growth',
    name: 'ยาเติบโต',
    emoji: '🌱',
    description: 'เลือก 1-2 ใบ แต้ม +1 (สูงสุด A)',
    cost: 3,
    minTargets: 1,
    maxTargets: 2,
    apply: (cards, targets) =>
      mapTargets(cards, targets, (c) => ({ ...c, rank: Math.min(14, c.rank + 1) as Rank })),
  },
  {
    id: 'dissolve',
    name: 'ยาสลาย',
    emoji: '💥',
    description: 'เลือก 1-2 ใบ ทำลายไพ่ถาวร',
    cost: 3,
    minTargets: 1,
    maxTargets: 2,
    apply: (cards, targets) => {
      const ids = new Set(targets.map((t) => t.id));
      return cards.filter((c) => !ids.has(c.id));
    },
  },
  {
    id: 'gold',
    name: 'ยาทอง',
    emoji: '🪙',
    description: 'เลือก 1 ใบ ให้เป็นไพ่ทอง (+$3 ถ้าค้างในมือตอนชนะโต๊ะ)',
    cost: 3,
    minTargets: 1,
    maxTargets: 1,
    apply: (cards, targets) => mapTargets(cards, targets, (c) => ({ ...c, enhancement: 'gold' })),
  },
  {
    id: 'flame',
    name: 'ยาเพลิง',
    emoji: '🔥',
    description: 'เลือก 1 ใบ ให้เป็นไพ่เพลิง (×2 Mult เมื่อนับแต้ม แต่ 25% ไหม้หาย)',
    cost: 3,
    minTargets: 1,
    maxTargets: 1,
    apply: (cards, targets) => mapTargets(cards, targets, (c) => ({ ...c, enhancement: 'fire' })),
  },
];

const BY_ID = new Map(POTIONS.map((p) => [p.id, p]));

export function getPotion(id: string): PotionDef | undefined {
  return BY_ID.get(id);
}

