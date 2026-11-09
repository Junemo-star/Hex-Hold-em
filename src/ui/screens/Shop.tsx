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
import type { GameSpeed } from '../../engine/storage';
import { ArtSlot } from '../components/ArtSlot';
import { CharmBar } from '../components/CharmBar';
import { HudSidebar } from '../components/HudSidebar';
import { playBlip } from '../fx/sound';

interface Props {
  run: RunState;
  shop: ShopState;
  speed: GameSpeed;
  onChangeSpeed: (s: GameSpeed) => void;
  onChange: (run: RunState, shop: ShopState) => void;
  onLeave: () => void;
}

export function Shop({ run, shop, speed, onChangeSpeed, onChange, onLeave }: Props) {
  const [message, setMessage] = useState('');
  const [merchantSpeech, setMerchantSpeech] = useState(
    'ยินดีต้อนรับสู่ร้านเครื่องรางลับ! เลือกชมของขลังก่อนขึ้นโต๊ะถัดไปสิ...',
  );
  const [pack, setPack] = useState<PackChoice[] | null>(null);

  function buy(i: number) {
    const r = buyItem(run, shop, i);
    if (!r.ok) {
      setMessage(r.reason);
      setMerchantSpeech(`ฮ่าๆ! ${r.reason}นะสหาย!`);
      return;
    }
    playBlip(6);
    setMessage('');
    setMerchantSpeech('ตาถึงมาก! เครื่องรางชิ้นนั้นจะต้องทำแต้มให้เจ้าได้มหาศาลแน่!');
    onChange(r.run, r.shop);
  }

  function openPackAt(i: number) {
    const r = buyPack(run, shop, i);
    if (!r.ok) {
      setMessage(r.reason);
      setMerchantSpeech(`เสียใจด้วย... ${r.reason}!`);
      return;
    }
    playBlip(8);
    setMessage('');
    setMerchantSpeech('มาดูกันว่าโชคชะตาจะสุ่มเครื่องรางชิ้นไหนมาให้เจ้า!');
    onChange(r.run, r.shop);
    setPack(r.choices);
  }

  function choose(choice: PackChoice) {
    const r = addChoice(run, choice);
    if (!r.ok) return setMessage(r.reason);
    playBlip(10);
    setMessage('');
    setMerchantSpeech('เป็นตัวเลือกที่ยอดเยี่ยม!');
    onChange(r.run, shop);
    setPack(null);
  }

  function doReroll() {
    const r = reroll(run, shop);
    if (!r.ok) {
      setMessage(r.reason);
      setMerchantSpeech('เหรียญทองไม่พอสำหรับหมุนเวียนสินค้าใหม่หรอกนะ!');
      return;
    }
    playBlip(4);
    setMessage('');
    setMerchantSpeech('กวาดของเก่าลงหม้อ! นี่คือเครื่องรางชุดใหม่สดๆ ร้อนๆ!');
    onChange(r.run, r.shop);
  }

  return (
    <div className="balatro-layout">
      <HudSidebar
        headerTitle="🛒 ร้านค้าพ่อค้าเวท"
        headerSubtitle="เลือกซื้อและจัดเรียงเครื่องราง"
        handLabel="พักเตรียมตัว"
        money={run.money}
        run={run}
        speed={speed}
        onChangeSpeed={onChangeSpeed}
      />

      <main className="felt-arena">
        <div className="arcane-circle-watermark" aria-hidden="true" />
        <div className="arcane-particles" aria-hidden="true" />

        <CharmBar
          charms={run.charms}
          onMove={(i, dir) => onChange({ ...run, charms: moveCharm(run.charms, i, dir) }, shop)}
          onSell={(i) => {
            setMerchantSpeech('รับซื้อคืนในราคาครึ่งหนึ่ง... ขอบใจสำหรับของดี!');
            onChange(sellCharm(run, i), shop);
          }}
        />

        {/* Merchant Banner */}
        <section className="dealer-banner merchant-banner">
          <div className="dealer-portrait-frame merchant-frame">
            <span className="art-slot-emoji">🧙‍♂️</span>
            <span className="dealer-floor-badge merchant-badge">SHOP</span>
          </div>
          <div className="dealer-info">
            <div className="dealer-header">
              <div>
                <span className="dealer-name">มาสเตอร์กริม</span>
                <span className="dealer-title"> · พ่อค้าเครื่องรางพเนจร</span>
              </div>
              <button className="btn small" onClick={doReroll}>
                🎲 Reroll สินค้า (${rerollCost(shop)})
              </button>
            </div>
            <div className="dealer-speech-bubble">
              <span className="quote-mark">“</span>
              {merchantSpeech}
              <span className="quote-mark">”</span>
            </div>
          </div>
        </section>

        {message && <div className="message">{message}</div>}

        <section>
          <div className="shop-row">
            {shop.items.map((item, i) => {
              const d = describeCharm(item.defId);
              return (
                <div
                  key={i}
                  style={{ animationDelay: `${i * 0.25}s` }}
                  className={`shop-item bobbing ${d.rarity} ${item.sold ? 'sold' : ''}`}
                >
                  <span className={`rarity-dot ${d.rarity}`}>{d.rarity}</span>
                  <div className="shop-emoji">
                    <ArtSlot
                      category="charms"
                      id={item.defId}
                      emoji={d.emoji}
                      alt={d.name}
                      rarity={d.rarity}
                    />
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
              <div
                key={`p${i}`}
                className={`shop-item bobbing pack ${offer.sold ? 'sold' : ''}`}
              >
                <span className="rarity-dot legendary">Pack</span>
                <div className="shop-emoji">🎁</div>
                <div className="shop-name">หีบสุ่มเครื่องราง</div>
                <div className="shop-desc">เปิดสุ่มเครื่องราง 3 ชิ้น เลือกเก็บเข้าตัวได้ 1 ชิ้น</div>
                <button
                  className="btn play small-buy"
                  disabled={offer.sold}
                  onClick={() => openPackAt(i)}
                >
                  {offer.sold ? 'เปิดแล้ว' : `เปิดหีบ $${offer.cost}`}
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer className="controls">
          <button className="btn play big-action" onClick={onLeave}>
            ออกจากร้านค้า →
          </button>
        </footer>
      </main>

      {pack && (
        <div className="overlay">
          <div className="modal wide">
            <h2>🎁 เลือกเครื่องราง 1 ชิ้นจากหีบ</h2>
            <div className="shop-row">
              {pack.map((choice, i) => {
                const d = describeCharm(choice.defId);
                return (
                  <div
                    key={i}
                    className={`shop-item clickable ${d.rarity}`}
                    onClick={() => choose(choice)}
                  >
                    <span className={`rarity-dot ${d.rarity}`}>{d.rarity}</span>
                    <div className="shop-emoji">
                      <ArtSlot
                        category="charms"
                        id={choice.defId}
                        emoji={d.emoji}
                        alt={d.name}
                        rarity={d.rarity}
                      />
                    </div>
                    <div className="shop-name">{d.name}</div>
                    <div className="shop-desc">{d.description}</div>
                  </div>
                );
              })}
            </div>
            {message && <div className="message">{message}</div>}
            <button className="btn small" onClick={() => setPack(null)}>
              ข้าม (ไม่รับ)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
