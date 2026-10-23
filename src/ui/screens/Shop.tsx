import { useState } from 'react';
import { MAX_POTIONS, moveCharm, type RunState } from '../../engine/run';
import { getPotion } from '../../engine/potions';
import {
  addChoice,
  buyItem,
  buyPack,
  describeItem,
  rerollCost,
  reroll,
  sellCharm,
  type PackChoice,
  type PackKind,
  type ShopState,
} from '../../engine/shop';
import { CardView } from '../components/CardView';
import { CharmBar } from '../components/CharmBar';

interface Props {
  run: RunState;
  shop: ShopState;
  onChange: (run: RunState, shop: ShopState) => void;
  onLeave: () => void;
}

const PACK_LABEL: Record<PackKind, string> = {
  charm: '🎁 ซองเครื่องราง',
  potion: '🧪 ซองยาเวท',
  scroll: '📚 ซองคัมภีร์',
  cards: '🃏 ซองไพ่',
};

export function Shop({ run, shop, onChange, onLeave }: Props) {
  const [message, setMessage] = useState('');
  const [pack, setPack] = useState<PackChoice[] | null>(null);

  function buy(i: number) {
    const r = buyItem(run, shop, i);
    if (!r.ok) return setMessage(r.reason);
    setMessage('');
    onChange(r.run, r.shop);
  }

  function openPackAt(i: number) {
    const r = buyPack(run, shop, i);
    if (!r.ok) return setMessage(r.reason);
    setMessage('');
    onChange(r.run, r.shop);
    setPack(r.choices);
  }

  function choose(choice: PackChoice) {
    const r = addChoice(run, choice);
    if (!r.ok) return setMessage(r.reason);
    setMessage('');
    onChange(r.run, shop);
    setPack(null);
  }

  function doReroll() {
    const r = reroll(run, shop);
    if (!r.ok) return setMessage(r.reason);
    setMessage('');
    onChange(r.run, r.shop);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <div className="blind-name">🛒 ร้านค้าพ่อค้าเวท</div>
        <div className="round-score"><span>เงิน</span><strong>${run.money}</strong></div>
      </header>

      <section>
        <h3 className="section-title">สินค้า</h3>
        <div className="shop-row">
          {shop.items.map((item, i) => {
            const d = describeItem(item.kind, item.defId);
            return (
              <div key={i} className={`shop-item ${item.sold ? 'sold' : ''}`}>
                <div className="shop-emoji">{d.emoji}</div>
                <div className="shop-name">{d.name}</div>
                <div className="shop-desc">{d.description}</div>
                <button className="btn play small-buy" disabled={item.sold} onClick={() => buy(i)}>
                  {item.sold ? 'ขายแล้ว' : `ซื้อ $${item.cost}`}
                </button>
              </div>
            );
          })}
          {shop.packs.map((offer, i) => (
            <div key={`p${i}`} className={`shop-item pack ${offer.sold ? 'sold' : ''}`}>
              <div className="shop-name">{PACK_LABEL[offer.kind]}</div>
              <div className="shop-desc">เปิดแล้วเลือก 1 จาก 3</div>
              <button className="btn play small-buy" disabled={offer.sold} onClick={() => openPackAt(i)}>
                {offer.sold ? 'ขายแล้ว' : `ซื้อ $${offer.cost}`}
              </button>
            </div>
          ))}
        </div>
        <div className="center">
          <button className="btn small" onClick={doReroll}>🎲 Reroll ${rerollCost(shop)}</button>
        </div>
      </section>

      {message && <div className="message">{message}</div>}

      <section>
        <h3 className="section-title">เครื่องรางของคุณ (ลำดับซ้าย→ขวามีผลต่อการคิดแต้ม)</h3>
        <CharmBar
          charms={run.charms}
          onMove={(i, dir) => onChange({ ...run, charms: moveCharm(run.charms, i, dir) }, shop)}
          onSell={(i) => onChange(sellCharm(run, i), shop)}
        />
      </section>

      <section className="owned-potions">
        ยา ({run.potions.length}/{MAX_POTIONS}):{' '}
        {run.potions.length === 0
          ? 'ไม่มี'
          : run.potions.map((id, i) => <span key={i} className="tag">{getPotion(id)?.emoji} {getPotion(id)?.name}</span>)}
      </section>

      <div className="center">
        <button className="btn play" onClick={onLeave}>ออกจากร้าน →</button>
      </div>

      {pack && (
        <div className="overlay">
          <div className="modal wide">
            <h2>เลือก 1 อย่าง</h2>
            <div className="shop-row">
              {pack.map((choice, i) => {
                if (choice.kind === 'card') {
                  return (
                    <div key={i} className="shop-item clickable" onClick={() => choose(choice)}>
                      <CardView card={choice.card} />
                      <div className="shop-desc">เพิ่มเข้าสำรับถาวร</div>
                    </div>
                  );
                }
                const d = describeItem(choice.kind, choice.defId);
                return (
                  <div key={i} className="shop-item clickable" onClick={() => choose(choice)}>
                    <div className="shop-emoji">{d.emoji}</div>
                    <div className="shop-name">{d.name}</div>
                    <div className="shop-desc">{d.description}</div>
                  </div>
                );
              })}
            </div>
            {message && <div className="message">{message}</div>}
            <button className="btn small" onClick={() => setPack(null)}>ข้าม</button>
          </div>
        </div>
      )}
    </div>
  );
}

