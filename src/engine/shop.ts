import { CHARMS, getCharm } from './charms';
import { shuffle } from './deck';
import { MAX_CHARMS, type RunState } from './run';

type Rng = () => number;

export interface ShopItem {
  defId: string;
  cost: number;
  sold: boolean;
}
export interface PackOffer {
  cost: number;
  sold: boolean;
}
export interface ShopState {
  items: ShopItem[];
  packs: PackOffer[];
  rerolls: number;
}
export interface PackChoice {
  defId: string;
}

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

export function itemCost(defId: string): number {
  return getCharm(defId)?.cost ?? 0;
}

export function describeCharm(defId: string) {
  const def = getCharm(defId);
  return {
    name: def?.name ?? defId,
    emoji: def?.emoji ?? '❓',
    description: def?.description ?? '',
    rarity: def?.rarity ?? 'common',
  };
}

function rollCharmId(rng: Rng): string {
  const r = rng() * 100;
  const rarity = r < 70 ? 'common' : r < 95 ? 'uncommon' : r < 99 ? 'rare' : 'legendary';
  const pool = CHARMS.filter((c) => c.rarity === rarity);
  return pick(pool.length ? pool : CHARMS, rng).id;
}

function rollItem(rng: Rng): ShopItem {
  const defId = rollCharmId(rng);
  return { defId, cost: itemCost(defId), sold: false };
}

export function generateShop(rng: Rng = Math.random): ShopState {
  return {
    items: [rollItem(rng), rollItem(rng), rollItem(rng)],
    packs: [{ cost: PACK_COST, sold: false }],
    rerolls: 0,
  };
}

export function openCharmPack(rng: Rng = Math.random): PackChoice[] {
  return shuffle(CHARMS, rng)
    .slice(0, 3)
    .map((d) => ({ defId: d.id }));
}

/** Add a bought/picked charm to the run, or explain why it can't be. */
export function addChoice(run: RunState, choice: PackChoice): RunResult {
  if (run.charms.length >= MAX_CHARMS) {
    return { ok: false, reason: 'ช่องเครื่องรางเต็ม — ขายชิ้นเก่าก่อน' };
  }
  return { ok: true, run: { ...run, charms: [...run.charms, { defId: choice.defId, counter: 0 }] } };
}

export function buyItem(run: RunState, shop: ShopState, index: number): ShopResult {
  const item = shop.items[index];
  if (!item || item.sold) return { ok: false, reason: 'ขายไปแล้ว' };
  if (run.money < item.cost) return { ok: false, reason: 'เงินไม่พอ' };
  const added = addChoice(run, { defId: item.defId });
  if (!added.ok) return added;
  const items = shop.items.map((it, i) => (i === index ? { ...it, sold: true } : it));
  return { ok: true, run: { ...added.run, money: run.money - item.cost }, shop: { ...shop, items } };
}

export function buyPack(run: RunState, shop: ShopState, index: number, rng: Rng = Math.random): PackResult {
  const offer = shop.packs[index];
  if (!offer || offer.sold) return { ok: false, reason: 'ขายไปแล้ว' };
  if (run.money < offer.cost) return { ok: false, reason: 'เงินไม่พอ' };
  if (run.charms.length >= MAX_CHARMS) return { ok: false, reason: 'ช่องเครื่องรางเต็ม — ขายชิ้นเก่าก่อน' };
  const packs = shop.packs.map((p, i) => (i === index ? { ...p, sold: true } : p));
  return {
    ok: true,
    run: { ...run, money: run.money - offer.cost },
    shop: { ...shop, packs },
    choices: openCharmPack(rng),
  };
}

export function reroll(run: RunState, shop: ShopState, rng: Rng = Math.random): ShopResult {
  const cost = rerollCost(shop);
  if (run.money < cost) return { ok: false, reason: 'เงินไม่พอ' };
  return {
    ok: true,
    run: { ...run, money: run.money - cost },
    shop: { ...shop, items: [rollItem(rng), rollItem(rng), rollItem(rng)], rerolls: shop.rerolls + 1 },
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
