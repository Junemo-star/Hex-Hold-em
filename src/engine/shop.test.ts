import { describe, expect, it } from 'vitest';
import { getPotion } from './potions';
import { newRun } from './run';
import { addChoice, buyItem, buyPack, generateShop, reroll, sellCharm, type ShopState } from './shop';
import { cards } from './testHelpers';

const fixedShop = (): ShopState => ({
  items: [
    { kind: 'charm', defId: 'beer-jug', cost: 4, sold: false },
    { kind: 'scroll', defId: 'scroll-Pair', cost: 4, sold: false },
  ],
  packs: [{ kind: 'cards', cost: 4, sold: false }],
  rerolls: 0,
});

describe('shop', () => {
  it('generates 2 items and 2 packs', () => {
    const shop = generateShop();
    expect(shop.items).toHaveLength(2);
    expect(shop.packs).toHaveLength(2);
  });

  it('buys a charm and deducts money', () => {
    const r = buyItem({ ...newRun(), money: 10 }, fixedShop(), 0);
    if (!r.ok) throw new Error(r.reason);
    expect(r.run.money).toBe(6);
    expect(r.run.charms).toEqual([{ defId: 'beer-jug', counter: 0 }]);
    expect(r.shop.items[0].sold).toBe(true);
  });

  it('refuses when poor or sold out', () => {
    expect(buyItem({ ...newRun(), money: 1 }, fixedShop(), 0).ok).toBe(false);
    const bought = buyItem({ ...newRun(), money: 10 }, fixedShop(), 0);
    if (!bought.ok) throw new Error('setup failed');
    expect(buyItem(bought.run, bought.shop, 0).ok).toBe(false);
  });

  it('refuses a 6th charm', () => {
    let run = { ...newRun(), money: 100 };
    for (let i = 0; i < 5; i++) {
      const r = addChoice(run, { kind: 'charm', defId: 'beer-jug' });
      if (!r.ok) throw new Error(r.reason);
      run = r.run;
    }
    expect(addChoice(run, { kind: 'charm', defId: 'beer-jug' }).ok).toBe(false);
  });

  it('a scroll levels up its hand', () => {
    const r = buyItem({ ...newRun(), money: 10 }, fixedShop(), 1);
    if (!r.ok) throw new Error(r.reason);
    expect(r.run.handLevels.Pair).toBe(2);
  });

  it('sells a charm for half price', () => {
    const run = { ...newRun(), money: 0, charms: [{ defId: 'beer-jug', counter: 0 }] };
    const sold = sellCharm(run, 0);
    expect(sold.money).toBe(2);
    expect(sold.charms).toHaveLength(0);
  });

  it('packs offer 3 choices; rerolls cost more each time', () => {
    const p = buyPack({ ...newRun(), money: 10 }, fixedShop(), 0);
    if (!p.ok) throw new Error(p.reason);
    expect(p.choices).toHaveLength(3);
    expect(p.run.money).toBe(6);

    const r1 = reroll({ ...newRun(), money: 20 }, fixedShop());
    if (!r1.ok) throw new Error(r1.reason);
    expect(r1.run.money).toBe(15);
    const r2 = reroll(r1.run, r1.shop);
    if (!r2.ok) throw new Error(r2.reason);
    expect(r2.run.money).toBe(9);
  });
});

describe('potions', () => {
  it('dye recolours to the leftmost target suit', () => {
    const hand = cards('2h 5s 9c');
    const out = getPotion('dye')!.apply(hand, [hand[0], hand[1]]);
    expect(out.map((c) => c.suit)).toEqual(['hearts', 'hearts', 'clubs']);
  });

  it('growth caps at ace; dissolve removes; gold/flame enhance', () => {
    const hand = cards('Ah 5s');
    expect(getPotion('growth')!.apply(hand, [hand[0], hand[1]]).map((c) => c.rank)).toEqual([14, 6]);
    expect(getPotion('dissolve')!.apply(hand, [hand[0]])).toHaveLength(1);
    expect(getPotion('gold')!.apply(hand, [hand[1]])[1].enhancement).toBe('gold');
    expect(getPotion('flame')!.apply(hand, [hand[1]])[1].enhancement).toBe('fire');
  });
});

