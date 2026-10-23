import { CHARMS, getCharm } from './charms';
import { RANKS, shuffle, SUITS } from './deck';
import { getPotion, POTIONS } from './potions';
import { MAX_CHARMS, MAX_POTIONS, type RunState } from './run';
import { getScroll, SCROLLS } from './scrolls';
import type { Card } from './types';

export type ItemKind = 'charm' | 'potion' | 'scroll';
export type PackKind = ItemKind | 'cards';
type Rng = () => number;

export interface ShopItem {
  kind: ItemKind;
  defId: string;
  cost: number;
  sold: boolean;
}
export interface PackOffer {
  kind: PackKind;
  cost: number;
  sold: boolean;
}
export interface ShopState {
  items: ShopItem[];
  packs: PackOffer[];
  rerolls: number;
}
export type PackChoice = { kind: ItemKind; defId: string } | { kind: 'card'; card: Card };

export type RunResult = { ok: true; run: RunState } | { ok: false; reason: string };
export type ShopResult = { ok: true; run: RunState; shop: ShopState } | { ok: false; reason: string };
export type PackResult =
  | { ok: true; run: RunState; shop: ShopState; choices: PackChoice[] }
  | { ok: false; reason: string };

const REROLL_BASE = 5;
const PACK_COST = 4;

function pick<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

export function rerollCost(shop: ShopState): number {
  return REROLL_BASE + shop.rerolls;
}

export function itemCost(kind: ItemKind, defId: string): number {
  if (kind === 'charm') return getCharm(defId)?.cost ?? 0;
  if (kind === 'potion') return getPotion(defId)?.cost ?? 0;
  return getScroll(defId)?.cost ?? 0;
}

export function describeItem(kind: ItemKind, defId: string) {
  const def = kind === 'charm' ? getCharm(defId) : kind === 'potion' ? getPotion(defId) : getScroll(defId);
  return {
    name: def?.name ?? defId,
    emoji: def?.emoji ?? '❓',
    description: def?.description ?? '',
  };
}

function rollCharmId(rng: Rng): string {
  const r = rng() * 100;
  const rarity = r < 70 ? 'common' : r < 95 ? 'uncommon' : r < 99 ? 'rare' : 'legendary';
  const pool = CHARMS.filter((c) => c.rarity === rarity);
  return pick(pool.length ? pool : CHARMS, rng).id;
}

function rollItem(rng: Rng): ShopItem {
  const r = rng();
  const kind: ItemKind = r < 0.6 ? 'charm' : r < 0.8 ? 'potion' : 'scroll';
  const defId =
    kind === 'charm' ? rollCharmId(rng) : kind === 'potion' ? pick(POTIONS, rng).id : pick(SCROLLS, rng).id;
  return { kind, defId, cost: itemCost(kind, defId), sold: false };
}

export function generateShop(rng: Rng = Math.random): ShopState {
  const kinds: PackKind[] = shuffle<PackKind>(['charm', 'potion', 'scroll', 'cards'], rng).slice(0, 2);
  return {
    items: [rollItem(rng), rollItem(rng)],
    packs: kinds.map((kind) => ({ kind, cost: PACK_COST, sold: false })),
    rerolls: 0,
  };
}

export function openPack(kind: PackKind, rng: Rng = Math.random): PackChoice[] {
  if (kind === 'cards') {
    return Array.from({ length: 3 }, (_, i) => ({
      kind: 'card' as const,
      card: {
        id: `pack-${Math.floor(rng() * 1e9)}-${i}`,
        rank: pick(RANKS, rng),
        suit: pick(SUITS, rng),
      },
    }));
  }
  const pool: { id: string }[] = kind === 'charm' ? CHARMS : kind === 'potion' ? POTIONS : SCROLLS;
  return shuffle(pool, rng)
    .slice(0, 3)
    .map((d) => ({ kind, defId: d.id }));
}

/** Add a bought/picked item to the run, or explain why it can't be. */
export function addChoice(run: RunState, choice: PackChoice): RunResult {
  if (choice.kind === 'card') return { ok: true, run: { ...run, deck: [...run.deck, choice.card] } };
  if (choice.kind === 'charm') {
    if (run.charms.length >= MAX_CHARMS) return { ok: false, reason: 'ช่องเครื่องรางเต็ม — ขายชิ้นเก่าก่อน' };
    return { ok: true, run: { ...run, charms: [...run.charms, { defId: choice.defId, counter: 0 }] } };
  }
  if (choice.kind === 'potion') {
    if (run.potions.length >= MAX_POTIONS) return { ok: false, reason: 'ช่องยาเต็ม' };
    return { ok: true, run: { ...run, potions: [...run.potions, choice.defId] } };
  }
  const scroll = getScroll(choice.defId);
  if (!scroll) return { ok: false, reason: 'ไม่พบคัมภีร์' };
  const level = run.handLevels[scroll.hand] ?? 1;
  return { ok: true, run: { ...run, handLevels: { ...run.handLevels, [scroll.hand]: level + 1 } } };
}

export function buyItem(run: RunState, shop: ShopState, index: number): ShopResult {
  const item = shop.items[index];
  if (!item || item.sold) return { ok: false, reason: 'ขายไปแล้ว' };
  if (run.money < item.cost) return { ok: false, reason: 'เงินไม่พอ' };
  const added = addChoice(run, { kind: item.kind, defId: item.defId });
  if (!added.ok) return added;
  const items = shop.items.map((it, i) => (i === index ? { ...it, sold: true } : it));
  return { ok: true, run: { ...added.run, money: run.money - item.cost }, shop: { ...shop, items } };
}

export function buyPack(run: RunState, shop: ShopState, index: number, rng: Rng = Math.random): PackResult {
  const offer = shop.packs[index];
  if (!offer || offer.sold) return { ok: false, reason: 'ขายไปแล้ว' };
  if (run.money < offer.cost) return { ok: false, reason: 'เงินไม่พอ' };
  const packs = shop.packs.map((p, i) => (i === index ? { ...p, sold: true } : p));
  return {
    ok: true,
    run: { ...run, money: run.money - offer.cost },
    shop: { ...shop, packs },
    choices: openPack(offer.kind, rng),
  };
}

export function reroll(run: RunState, shop: ShopState, rng: Rng = Math.random): ShopResult {
  const cost = rerollCost(shop);
  if (run.money < cost) return { ok: false, reason: 'เงินไม่พอ' };
  return {
    ok: true,
    run: { ...run, money: run.money - cost },
    shop: { ...shop, items: [rollItem(rng), rollItem(rng)], rerolls: shop.rerolls + 1 },
  };
}

export function sellPrice(defId: string): number {
  return Math.floor((getCharm(defId)?.cost ?? 0) / 2);
}

export function sellCharm(run: RunState, index: number): RunState {
  const charm = run.charms[index];
  if (!charm) return run;
  return {
    ...run,
    money: run.money + sellPrice(charm.defId),
    charms: run.charms.filter((_, i) => i !== index),
  };
}
