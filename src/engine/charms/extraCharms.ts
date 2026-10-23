import type { HandType } from '../types';
import type { CharmDef } from './types';

const CONTAINS_PAIR: HandType[] = [
  'Pair',
  'Two Pair',
  'Three of a Kind',
  'Full House',
  'Four of a Kind',
];
const CONTAINS_TRIPS: HandType[] = ['Three of a Kind', 'Full House', 'Four of a Kind'];

export const jesterHat: CharmDef = {
  id: 'jester-hat',
  name: 'หมวกตัวตลกเวท',
  emoji: '🃏',
  rarity: 'common',
  cost: 4,
  description: '+40 Chips',
  hooks: { onHandScored: () => ({ chips: 40 }) },
};

export const oddCandle: CharmDef = {
  id: 'odd-candle',
  name: 'เทียนคี่อาถรรพ์',
  emoji: '🕯️',
  rarity: 'common',
  cost: 4,
  description: 'ไพ่เลขคี่ (A, 3, 5, 7, 9) ที่นับแต้ม +25 Chips',
  hooks: {
    onCardScored: ({ card }) => {
      if (!card) return undefined;
      const isOdd = card.rank === 14 || (card.rank <= 9 && card.rank % 2 === 1);
      return isOdd ? { chips: 25 } : undefined;
    },
  },
};

export const evenGoblet: CharmDef = {
  id: 'even-goblet',
  name: 'ถ้วยคู่ต้องมนตร์',
  emoji: '🍷',
  rarity: 'common',
  cost: 4,
  description: 'ไพ่เลขคู่ (2, 4, 6, 8, 10) ที่นับแต้ม +4 Mult',
  hooks: {
    onCardScored: ({ card }) => {
      if (!card) return undefined;
      return card.rank <= 10 && card.rank % 2 === 0 ? { mult: 4 } : undefined;
    },
  },
};

export const trinityAmulet: CharmDef = {
  id: 'trinity-amulet',
  name: 'ตะกรุดตรีเอกานุภาพ',
  emoji: '☘️',
  rarity: 'common',
  cost: 5,
  description: 'ถ้ามือมี Three of a Kind: +12 Mult',
  hooks: {
    onHandScored: ({ hand }) => (CONTAINS_TRIPS.includes(hand) ? { mult: 12 } : undefined),
  },
};

export const copperRing: CharmDef = {
  id: 'copper-ring',
  name: 'แหวนทองแดง',
  emoji: '🥉',
  rarity: 'common',
  cost: 4,
  description: 'ไพ่แต้มต่ำ (2, 3, 4, 5) ที่นับแต้ม +20 Chips และ +2 Mult',
  hooks: {
    onCardScored: ({ card }) =>
      card && card.rank >= 2 && card.rank <= 5 ? { chips: 20, mult: 2 } : undefined,
  },
};

export const twoPairGloves: CharmDef = {
  id: 'two-pair-gloves',
  name: 'ถุงมือคู่แฝด',
  emoji: '🧤',
  rarity: 'common',
  cost: 5,
  description: 'ถ้าเล่น Two Pair หรือ Full House: +50 Chips และ +6 Mult',
  hooks: {
    onHandScored: ({ hand }) =>
      hand === 'Two Pair' || hand === 'Full House' ? { chips: 50, mult: 6 } : undefined,
  },
};

export const soloMask: CharmDef = {
  id: 'solo-mask',
  name: 'หน้ากากผู้โดดเดี่ยว',
  emoji: '🎭',
  rarity: 'common',
  cost: 5,
  description: 'ถ้าเล่นไพ่เพียง 1 ใบ: +50 Chips และ +10 Mult',
  hooks: {
    onHandScored: ({ played }) => (played.length === 1 ? { chips: 50, mult: 10 } : undefined),
  },
};

export const fullHandBanner: CharmDef = {
  id: 'full-hand-banner',
  name: 'ธงรบเต็มทัพ',
  emoji: '🚩',
  rarity: 'common',
  cost: 5,
  description: 'ถ้าเล่นไพ่ครบ 5 ใบ: +60 Chips',
  hooks: {
    onHandScored: ({ played }) => (played.length === 5 ? { chips: 60 } : undefined),
  },
};

export const flushPrism: CharmDef = {
  id: 'flush-prism',
  name: 'ปริซึมสายรุ้ง',
  emoji: '🌈',
  rarity: 'uncommon',
  cost: 6,
  description: 'ถ้าเล่น Flush: +80 Chips และ +10 Mult',
  hooks: {
    onHandScored: ({ hand }) =>
      hand === 'Flush' || hand === 'Straight Flush' ? { chips: 80, mult: 10 } : undefined,
  },
};

export const royalDagger: CharmDef = {
  id: 'royal-dagger',
  name: 'กริชราชวงศ์',
  emoji: '🗡️',
  rarity: 'uncommon',
  cost: 6,
  description: 'ไพ่ J, Q, K ที่นับแต้ม +20 Chips และ +2 Mult',
  hooks: {
    onCardScored: ({ card }) =>
      card && card.rank >= 11 && card.rank <= 13 ? { chips: 20, mult: 2 } : undefined,
  },
};

export const scholarQuill: CharmDef = {
  id: 'scholar-quill',
  name: 'ปากกาขนนกนักปราชญ์',
  emoji: '🪶',
  rarity: 'uncommon',
  cost: 6,
  description: 'ไพ่ A ที่นับแต้ม +30 Chips และ +4 Mult',
  hooks: {
    onCardScored: ({ card }) => (card?.rank === 14 ? { chips: 30, mult: 4 } : undefined),
  },
};

export const ironShield: CharmDef = {
  id: 'iron-shield',
  name: 'โล่เหล็กผู้พิทักษ์',
  emoji: '🛡️',
  rarity: 'uncommon',
  cost: 6,
  description: '+15 Chips ต่อไพ่แต่ละใบที่ค้างในมือ',
  hooks: {
    onHeldInHand: () => ({ chips: 15 }),
  },
};

export const sevenClover: CharmDef = {
  id: 'seven-clover',
  name: 'ใบโคลเวอร์เจ็ดแฉก',
  emoji: '🍀',
  rarity: 'uncommon',
  cost: 6,
  description: 'ไพ่เลข 7 ที่นับแต้ม +77 Chips และ +7 Mult',
  hooks: {
    onCardScored: ({ card }) => (card?.rank === 7 ? { chips: 77, mult: 7 } : undefined),
  },
};

export const midasHand: CharmDef = {
  id: 'midas-hand',
  name: 'หัตถ์ไมดาส',
  emoji: '✋',
  rarity: 'uncommon',
  cost: 6,
  description: 'ได้ +$2 ทุกครั้งที่ไพ่ A ถูกนับแต้ม',
  hooks: {
    onCardScored: ({ card }) => (card?.rank === 14 ? { money: 2 } : undefined),
  },
};

export const sniperMonocle: CharmDef = {
  id: 'sniper-monocle',
  name: 'แว่นตาเดียวแม่นปืน',
  emoji: '🧐',
  rarity: 'uncommon',
  cost: 6,
  description: 'ถ้าเล่น High Card: +80 Chips และ +8 Mult',
  hooks: {
    onHandScored: ({ hand }) => (hand === 'High Card' ? { chips: 80, mult: 8 } : undefined),
  },
};

export const fullHouseCauldron: CharmDef = {
  id: 'full-house-cauldron',
  name: 'หม้อต้มฟูลเฮาส์',
  emoji: '🍲',
  rarity: 'uncommon',
  cost: 7,
  description: 'ถ้าเล่น Full House: ×2 Mult',
  hooks: {
    onHandScored: ({ hand }) => (hand === 'Full House' ? { xMult: 2 } : undefined),
  },
};

export const lastHourglass: CharmDef = {
  id: 'last-hourglass',
  name: 'นาฬิกาทรายสุดท้าย',
  emoji: '⏳',
  rarity: 'rare',
  cost: 8,
  description: '×2.5 Mult เมื่อเล่นในมือสุดท้ายของโต๊ะ (เหลือ Hands = 1)',
  hooks: {
    onHandScored: ({ handsLeft }) => (handsLeft === 1 ? { xMult: 2.5 } : undefined),
  },
};

export const bloodPact: CharmDef = {
  id: 'blood-pact',
  name: 'สัญญาโลหิต',
  emoji: '🩸',
  rarity: 'rare',
  cost: 8,
  description: '×2 Mult ถ้าเหลือ Discard = 0',
  hooks: {
    onHandScored: ({ discardsLeft }) => (discardsLeft === 0 ? { xMult: 2 } : undefined),
  },
};

export const bloodChalice: CharmDef = {
  id: 'blood-chalice',
  name: 'จอกโลหิตนิรันดร์',
  emoji: '🏺',
  rarity: 'rare',
  cost: 9,
  description: 'ทุกครั้งที่เล่น Flush สะสม +3 Mult ถาวร (ให้ Mult ที่สะสมไว้ทุกมือ)',
  hooks: {
    onHandScored: ({ hand, counter }) => {
      const isFlush = hand === 'Flush' || hand === 'Straight Flush';
      const next = counter + (isFlush ? 3 : 0);
      return next > 0 ? { mult: next, counter: next } : undefined;
    },
  },
};

export const pairAnvil: CharmDef = {
  id: 'pair-anvil',
  name: 'ทั่งตีเหล็กคู่',
  emoji: '🔨',
  rarity: 'rare',
  cost: 8,
  description: 'ทุกครั้งที่เล่นมือที่มี Pair สะสม +15 Chips ถาวร (ให้ Chips ที่สะสมไว้ทุกมือ)',
  hooks: {
    onHandScored: ({ hand, counter }) => {
      const next = counter + (CONTAINS_PAIR.includes(hand) ? 15 : 0);
      return next > 0 ? { chips: next, counter: next } : undefined;
    },
  },
};

export const assassinCloak: CharmDef = {
  id: 'assassin-cloak',
  name: 'ผ้าคลุมนักฆ่า',
  emoji: '🥷',
  rarity: 'rare',
  cost: 8,
  description: '×2 Mult ถ้าเล่นไพ่ไม่เกิน 2 ใบ',
  hooks: {
    onHandScored: ({ played }) => (played.length <= 2 ? { xMult: 2 } : undefined),
  },
};

export const fourHorsemen: CharmDef = {
  id: 'four-horsemen',
  name: 'ตราจตุรอาชา',
  emoji: '🐎',
  rarity: 'rare',
  cost: 9,
  description: 'ถ้าเล่น Four of a Kind: ×3.5 Mult',
  hooks: {
    onHandScored: ({ hand }) => (hand === 'Four of a Kind' ? { xMult: 3.5 } : undefined),
  },
};

export const philosopherStone: CharmDef = {
  id: 'philosopher-stone',
  name: 'ศิลาอาถรรพ์',
  emoji: '🔮',
  rarity: 'legendary',
  cost: 20,
  description: '×2 Mult ทุกมือ และรับเงิน +$2 ทุกครั้งที่เล่นมือ',
  hooks: {
    onHandScored: () => ({ xMult: 2, money: 2 }),
  },
};

export const archmageStaff: CharmDef = {
  id: 'archmage-staff',
  name: 'คทาจอมมหาเวท',
  emoji: '🪄',
  rarity: 'legendary',
  cost: 20,
  description: 'ไพ่ทุกใบที่ถูกนับแต้ม ×1.25 Mult',
  hooks: {
    onCardScored: () => ({ xMult: 1.25 }),
  },
};
