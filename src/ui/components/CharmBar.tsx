import { useState } from 'react';
import { getCharm } from '../../engine/charms';
import type { CharmInstance, Rarity } from '../../engine/charms/types';
import { MAX_CHARMS } from '../../engine/run';
import { sellPrice } from '../../engine/shop';
import { ArtSlot } from './ArtSlot';
import type { CardFloater } from './CardView';

interface Props {
  charms: CharmInstance[];
  activeIndex?: number | null;
  sealedIndices?: number[];
  charmFloater?: ({ index: number } & CardFloater) | null;
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
  charmFloater = null,
  onMove,
  onSell,
}: Props) {
  const [pinnedIdx, setPinnedIdx] = useState<number | null>(null);

  return (
    <div className="charm-rack">
      <div className="charm-rack-header">
        <span>🧿 เครื่องรางเวท ({charms.length}/{MAX_CHARMS})</span>
        <span className="charm-rack-hint">ลำดับซ้าย → ขวา คำนวณก่อน-หลัง (ชี้เมาส์หรือคลิกเพื่อย้าย/ขาย)</span>
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
          const popup = charmFloater && charmFloater.index === i ? charmFloater : null;
          const isPinned = pinnedIdx === i;

          // Show dynamic preview for Blueprint / Brainstorm
          let copyNote = '';
          if (def.copyTarget === 'right') {
            const target = charms[i + 1] ? getCharm(charms[i + 1].defId) : undefined;
            copyNote = target ? ` (กำลังคัดลอก: ${target.name})` : ' (ไม่มีเครื่องรางทางขวา)';
          } else if (def.copyTarget === 'leftmost') {
            const target = i > 0 && charms[0] ? getCharm(charms[0].defId) : undefined;
            copyNote = target ? ` (กำลังคัดลอก: ${target.name})` : ' (ตัวเองอยู่ซ้ายสุดแล้ว)';
          }

          return (
            <div
              key={i}
              style={{ animationDelay: `${i * 0.35}s` }}
              onClick={() => setPinnedIdx((prev) => (prev === i ? null : i))}
              className={`charm bobbing ${def.rarity} ${activeIndex === i ? 'active' : ''} ${sealed ? 'sealed' : ''} ${isPinned ? 'pinned' : ''}`}
            >
              {popup && (
                <span className={`charm-popup ${popup.kind}`}>{popup.text}</span>
              )}
              <span className={`rarity-dot ${def.rarity}`}>{RARITY_LABEL[def.rarity]}</span>
              <div className="charm-art-wrap">
                {sealed ? (
                  <span className="sealed-icon">⛓️</span>
                ) : (
                  <ArtSlot
                    category="charms"
                    id={def.id}
                    emoji={def.emoji}
                    alt={def.name}
                    rarity={def.rarity}
                  />
                )}
              </div>
              <div className="charm-name">{def.name}</div>
              {inst.counter > 0 && <div className="charm-counter">+{inst.counter}</div>}

              {/* Floating Balatro-style tooltip + controls with seamless hover bridge */}
              <div className="charm-tooltip" onClick={(e) => e.stopPropagation()}>
                <div className="tooltip-title">
                  {def.name} <span className={`rarity-tag ${def.rarity}`}>{RARITY_LABEL[def.rarity]}</span>
                </div>
                <div className="tooltip-desc">
                  {sealed
                    ? '⚠️ ถูกปิดผนึกโดยคำสาปบอส! ไม่แสดงผลในขณะนี้'
                    : `${def.description}${copyNote}`}
                </div>
                {(onMove || onSell) && (
                  <div className="charm-actions">
                    {onMove && (
                      <>
                        <button
                          className="mini"
                          disabled={i === 0}
                          onClick={() => {
                            if (isPinned) setPinnedIdx(i - 1);
                            onMove(i, -1);
                          }}
                          title="ย้ายไปซ้าย"
                        >
                          ◀
                        </button>
                        <button
                          className="mini"
                          disabled={i === charms.length - 1}
                          onClick={() => {
                            if (isPinned) setPinnedIdx(i + 1);
                            onMove(i, 1);
                          }}
                          title="ย้ายไปขวา"
                        >
                          ▶
                        </button>
                      </>
                    )}
                    {onSell && (
                      <button
                        className="mini sell"
                        onClick={() => {
                          setPinnedIdx(null);
                          onSell(i);
                        }}
                      >
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
