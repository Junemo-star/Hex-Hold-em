import { describe, expect, it } from 'vitest';
import { newRun } from './run';
import { addChoice, buyItem, buyPack, generateShop, reroll, sellCharm, type ShopState } from './shop';

const fixedShop = (): ShopState => ({
  items: [
    { defId: 'beer-jug', cost: 4, sold: false },
    { defId: 'twin-mirror', cost: 4, sold: false },
    { defId: 'fire-ring', cost: 4, sold: false },
  ],
  packs: [{ cost: 4, sold: false }],
  rerolls: 0,
});

describe('shop (charms only)', () => {
  it('generates 3 charm items and 1 charm pack', () => {
    const shop = generateShop();
    expect(shop.items).toHaveLength(3);
    expect(shop.packs).toHaveLength(1);
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
      const r = addChoice(run, { defId: 'beer-jug' });
      if (!r.ok) throw new Error(r.reason);
      run = r.run;
    }
    expect(addChoice(run, { defId: 'beer-jug' }).ok).toBe(false);
  });

  it('sells a charm for half price', () => {
    const run = { ...newRun(), money: 0, charms: [{ defId: 'beer-jug', counter: 0 }] };
    const sold = sellCharm(run, 0);
    expect(sold.money).toBe(2);
    expect(sold.charms).toHaveLength(0);
  });

  it('charm pack offers 3 charm choices; rerolls cost more each time', () => {
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
