import { getCharm } from '../../engine/charms';
import type { CharmInstance, Rarity } from '../../engine/charms/types';
import { MAX_CHARMS } from '../../engine/run';
import { sellPrice } from '../../engine/shop';
import { ArtSlot } from './ArtSlot';

interface Props {
  charms: CharmInstance[];
  activeIndex?: number | null;
  sealedIndices?: number[];
  onMove?: (index: number, dir: -1 | 1) => void;
  onSell?: (index: number) => void;
}

const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
};

export function CharmBar({
  charms,
  activeIndex = null,
  sealedIndices = [],
  onMove,
  onSell,
}: Props) {
  return (
    <div className="charm-rack">
      <div className="charm-rack-header">
        <span>🧿 เครื่องรางเวท ({charms.length}/{MAX_CHARMS})</span>
        <span className="charm-rack-hint">ลำดับซ้าย → ขวา คำนวณก่อน-หลัง</span>
      </div>
      <div className="charm-bar">
        {Array.from({ length: MAX_CHARMS }, (_, i) => {
          const inst = charms[i];
          const def = inst ? getCharm(inst.defId) : undefined;
          if (!inst || !def) {
            return (
              <div key={i} className="charm empty">
                <span className="empty-rune">◇</span>
                <span>ช่องว่าง</span>
              </div>
            );
          }
          const sealed = sealedIndices.includes(i);
          return (
            <div
              key={i}
              className={`charm ${def.rarity} ${activeIndex === i ? 'active' : ''} ${sealed ? 'sealed' : ''}`}
            >
              <span className={`rarity-dot ${def.rarity}`}>{RARITY_LABEL[def.rarity]}</span>
              <div className="charm-art-wrap">
                {sealed ? (
                  <span className="sealed-icon">⛓️</span>
                ) : (
                  <ArtSlot category="charms" id={def.id} emoji={def.emoji} alt={def.name} />
                )}
              </div>
              <div className="charm-name">{def.name}</div>
              {inst.counter > 0 && <div className="charm-counter">+{inst.counter}</div>}

              {/* Floating Balatro-style tooltip + controls */}
              <div className="charm-tooltip">
                <div className="tooltip-title">
                  {def.name} <span className={`rarity-tag ${def.rarity}`}>{RARITY_LABEL[def.rarity]}</span>
                </div>
                <div className="tooltip-desc">
                  {sealed ? '⚠️ ถูกปิดผนึกโดยคำสาปบอส! ไม่แสดงผลในขณะนี้' : def.description}
                </div>
                {(onMove || onSell) && (
                  <div className="charm-actions">
                    {onMove && (
                      <>
                        <button className="mini" disabled={i === 0} onClick={() => onMove(i, -1)} title="ย้ายไปซ้าย">
                          ◀
                        </button>
                        <button
                          className="mini"
                          disabled={i === charms.length - 1}
                          onClick={() => onMove(i, 1)}
                          title="ย้ายไปขวา"
                        >
                          ▶
                        </button>
                      </>
                    )}
                    {onSell && (
                      <button className="mini sell" onClick={() => onSell(i)}>
                        ขาย ${sellPrice(def.id)}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
