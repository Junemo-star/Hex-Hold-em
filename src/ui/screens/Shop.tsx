import { useState } from 'react';
import { moveCharm, type RunState } from '../../engine/run';
import {
  addChoice,
  buyItem,
  buyPack,
  describeCharm,
  rerollCost,
  reroll,
  sellCharm,
  type PackChoice,
  type ShopState,
} from '../../engine/shop';
import { ArtSlot } from '../components/ArtSlot';
import { CharmBar } from '../components/CharmBar';

interface Props {
  run: RunState;
  shop: ShopState;
  onChange: (run: RunState, shop: ShopState) => void;
  onLeave: () => void;
}

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
        <div className="blind-name">🛒 ร้านค้าเครื่องรางเวท</div>
        <div className="round-score"><span>เงิน</span><strong>${run.money}</strong></div>
      </header>

      <section>
        <h3 className="section-title">เครื่องรางวางขาย</h3>
        <div className="shop-row">
          {shop.items.map((item, i) => {
            const d = describeCharm(item.defId);
            return (
              <div key={i} className={`shop-item ${d.rarity} ${item.sold ? 'sold' : ''}`}>
                <div className="shop-emoji">
                  <ArtSlot category="charms" id={item.defId} emoji={d.emoji} alt={d.name} />
                </div>
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
              <div className="shop-emoji">🎁</div>
              <div className="shop-name">ซองสุ่มเครื่องราง</div>
              <div className="shop-desc">เปิดสุ่มเครื่องราง 3 ชิ้น เลือกเก็บ 1 ชิ้น</div>
              <button className="btn play small-buy" disabled={offer.sold} onClick={() => openPackAt(i)}>
                {offer.sold ? 'ขายแล้ว' : `ซื้อ $${offer.cost}`}
              </button>
            </div>
          ))}
        </div>
        <div className="center" style={{ marginTop: 12 }}>
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

      <div className="center">
        <button className="btn play" onClick={onLeave}>ออกจากร้าน →</button>
      </div>

      {pack && (
        <div className="overlay">
          <div className="modal wide">
            <h2>เลือกเครื่องราง 1 ชิ้น</h2>
            <div className="shop-row">
              {pack.map((choice, i) => {
                const d = describeCharm(choice.defId);
                return (
                  <div key={i} className={`shop-item clickable ${d.rarity}`} onClick={() => choose(choice)}>
                    <div className="shop-emoji">
                      <ArtSlot category="charms" id={choice.defId} emoji={d.emoji} alt={d.name} />
                    </div>
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
