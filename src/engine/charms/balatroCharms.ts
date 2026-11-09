import type { CharmDef } from './types';

const FIBONACCI_RANKS = new Set([14, 2, 3, 5, 8]);

/** 14 Balatro-inspired Meta & Gimmick Charms (bringing total to 50) */

export const abstractGrimoire: CharmDef = {
  id: 'abstract-grimoire',
  name: 'คัมภีร์รวมมนตรา',
  emoji: '📚',
  rarity: 'common',
  cost: 4,
  description: '+3 Mult ต่อจำนวนเครื่องรางทุกชิ้นที่ถืออยู่ตอนนี้',
  hooks: {
    onHandScored: ({ charmCount }) => (charmCount > 0 ? { mult: 3 * charmCount } : undefined),
  },
};

export const azureSpirit: CharmDef = {
  id: 'azure-spirit',
  name: 'ภูตครามเฝ้าสำรับ',
  emoji: '👻',
  rarity: 'common',
  cost: 5,
  description: '+2 Chips ต่อไพ่แต่ละใบที่ยังเหลืออยู่ในสำรับจั่ว',
  hooks: {
    onHandScored: ({ deckRemaining }) =>
      deckRemaining > 0 ? { chips: 2 * deckRemaining } : undefined,
  },
};

export const halfJester: CharmDef = {
  id: 'half-jester',
  name: 'ตัวตลกครึ่งซีก',
  emoji: '🎪',
  rarity: 'common',
  cost: 5,
  description: '+20 Mult ถ้าเล่นไพ่ไม่เกิน 3 ใบ',
  hooks: {
    onHandScored: ({ played }) => (played.length <= 3 ? { mult: 20 } : undefined),
  },
};

export const misprintTome: CharmDef = {
  id: 'misprint-tome',
  name: 'ตำราอาคมเพี้ยน',
  emoji: '👾',
  rarity: 'common',
  cost: 4,
  description: 'สุ่มบวก +1 ถึง +23 Mult ทุกครั้งที่เล่นมือ',
  hooks: {
    onHandScored: () => ({ mult: 1 + Math.floor(Math.random() * 23) }),
  },
};

export const goldenBull: CharmDef = {
  id: 'golden-bull',
  name: 'กระทิงทองคำ',
  emoji: '🐂',
  rarity: 'uncommon',
  cost: 6,
  description: '+2 Chips ต่อเงินทุกๆ $1 ที่มีอยู่ตอนนี้',
  hooks: {
    onHandScored: ({ money }) => (money > 0 ? { chips: 2 * money } : undefined),
  },
};

export const goldenBoots: CharmDef = {
  id: 'golden-boots',
  name: 'รองเท้าบูทเศรษฐี',
  emoji: '👢',
  rarity: 'uncommon',
  cost: 7,
  description: '+2 Mult ต่อเงินทุกๆ $5 ที่มีอยู่ตอนนี้',
  hooks: {
    onHandScored: ({ money }) => {
      const stacks = Math.floor(money / 5);
      return stacks > 0 ? { mult: 2 * stacks } : undefined;
    },
  },
};

export const voidErosion: CharmDef = {
  id: 'void-erosion',
  name: 'หลุมดำกลืนสำรับ',
  emoji: '🕳️',
  rarity: 'uncommon',
  cost: 6,
  description: '+2 Mult ต่อไพ่ทุกใบที่ถูกจั่วออกจากสำรับไปแล้วในโต๊ะนี้',
  hooks: {
    onHandScored: ({ deckRemaining }) => {
      const used = Math.max(0, 52 - deckRemaining);
      return used > 0 ? { mult: 2 * used } : undefined;
    },
  },
};

export const fibonacciSpiral: CharmDef = {
  id: 'fibonacci-spiral',
  name: 'หอยสังข์ฟีโบนัชชี',
  emoji: '🐚',
  rarity: 'uncommon',
  cost: 7,
  description: 'ไพ่เลขลำดับฟีโบนัชชี (A, 2, 3, 5, 8) ที่นับแต้ม +8 Mult',
  hooks: {
    onCardScored: ({ card }) =>
      card && FIBONACCI_RANKS.has(card.rank) ? { mult: 8 } : undefined,
  },
};

export const supernovaOrb: CharmDef = {
  id: 'supernova-orb',
  name: 'กางเกงสำรองนักพนัน',
  emoji: '👖',
  rarity: 'uncommon',
  cost: 6,
  description: 'ทุกครั้งที่เล่น Two Pair สะสม +2 Mult ถาวร (ให้ Mult ที่สะสมไว้ทุกมือ)',
  hooks: {
    onHandScored: ({ hand, counter }) => {
      const next = counter + (hand === 'Two Pair' || hand === 'Full House' ? 2 : 0);
      return next > 0 ? { mult: next, counter: next } : undefined;
    },
  },
};

export const smileyMask: CharmDef = {
  id: 'smiley-mask',
  name: 'หน้ากากยิ้มแสยะ',
  emoji: '😄',
  rarity: 'uncommon',
  cost: 6,
  description: 'ไพ่ J, Q, K ที่นับแต้ม +5 Mult',
  hooks: {
    onCardScored: ({ card }) =>
      card && card.rank >= 11 && card.rank <= 13 ? { mult: 5 } : undefined,
  },
};

export const voidStencil: CharmDef = {
  id: 'void-stencil',
  name: 'กรอบอาคมว่างเปล่า',
  emoji: '🖼️',
  rarity: 'rare',
  cost: 8,
  description: '×1 Mult บวกเพิ่มอีก ×1 Mult ต่อช่องเครื่องรางที่ว่างอยู่ (ถือชิ้นเดียว = ×5 Mult!)',
  hooks: {
    onHandScored: ({ emptyCharmSlots }) => ({ xMult: 1 + emptyCharmSlots }),
  },
};

export const blackboardRune: CharmDef = {
  id: 'blackboard-rune',
  name: 'กระดานชนวนทมิฬ',
  emoji: '⬛',
  rarity: 'rare',
  cost: 8,
  description: '×3 Mult ถ้าไพ่ที่ค้างในมือทุกใบเป็นดอกสีดำ (♠ หรือ ♣)',
  hooks: {
    onHandScored: ({ held }) =>
      held.length > 0 && held.every((c) => c.suit === 'spades' || c.suit === 'clubs')
        ? { xMult: 3 }
        : undefined,
  },
};

export const mimicSlime: CharmDef = {
  id: 'mimic-slime',
  name: 'พิมพ์เขียวจำแลง (Blueprint)',
  emoji: '🗺️',
  rarity: 'rare',
  cost: 10,
  description: 'คัดลอกความสามารถของเครื่องรางที่อยู่ติดกันทางขวา (▶)',
  copyTarget: 'right',
  hooks: {},
};

export const echoSkull: CharmDef = {
  id: 'echo-skull',
  name: 'กะโหลกสะท้อนจิต (Brainstorm)',
  emoji: '🧠',
  rarity: 'rare',
  cost: 10,
  description: 'คัดลอกความสามารถของเครื่องรางช่องซ้ายสุด (◀สุด)',
  copyTarget: 'leftmost',
  hooks: {},
};
