import { useState, type MouseEvent } from 'react';
import { cardChips } from '../../engine/scoring';
import { rankLabel, SUIT_SYMBOL } from '../../engine/deck';
import type { Card } from '../../engine/types';

export interface CardFloater {
  text: string;
  kind: 'chips' | 'mult' | 'money' | 'curse';
}

interface Props {
  card: Card;
  selected?: boolean;
  active?: boolean;
  disabledSuit?: boolean;
  /** True when card is played on center stage but not part of scoring hand */
  dimmed?: boolean;
  /** Used to fan cards in a natural hand arc */
  index?: number;
  total?: number;
  floater?: CardFloater | null;
  onClick?: () => void;
}

const SUIT_NAME_TH: Record<Card['suit'], string> = {
  hearts: 'โพแดง (♥)',
  diamonds: 'ข้าวหลามตัด (♦)',
  clubs: 'ดอกจิก (♣)',
  spades: 'โพดำ (♠)',
};

const COURT_CROWN: Partial<Record<Card['rank'], string>> = {
  11: '⚔️',
  12: '🌹',
  13: '👑',
  14: '✦',
};

export function CardView({
  card,
  selected = false,
  active = false,
  disabledSuit = false,
  dimmed = false,
  index = 0,
  total = 1,
  floater = null,
  onClick,
}: Props) {
  const [tilt, setTilt] = useState<{ rx: number; ry: number } | null>(null);
  const red = card.suit === 'hearts' || card.suit === 'diamonds';
  const isRoyal = card.rank >= 11;
  const cls = [
    'card',
    card.faceDown ? 'facedown' : red ? 'red' : 'black',
    `suit-${card.suit}`,
    isRoyal ? 'royal-card' : '',
    disabledSuit ? 'cursed-card' : '',
    dimmed ? 'dimmed-card' : '',
    selected ? 'selected' : '',
    active ? 'active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  function handleMove(e: MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 24, ry: x * 24 });
  }

  function handleLeave() {
    setTilt(null);
  }

  // Fan geometry: gentle arc so cards never cover each other's rank numbers
  const mid = (total - 1) / 2;
  const offset = total > 1 ? index - mid : 0;
  const fanAngle = offset * 1.6;
  const fanArcY = Math.abs(offset) * Math.abs(offset) * 1.1;

  const baseLiftY = active ? -32 : selected ? -30 : tilt ? -12 : fanArcY;
  const scale = active ? 1.15 : selected ? 1.05 : tilt ? 1.06 : 1;
  const rotZ = active || selected ? 0 : fanAngle;

  const transform = tilt
    ? `perspective(560px) translateY(${baseLiftY.toFixed(1)}px) rotateZ(${(rotZ * 0.4).toFixed(1)}deg) rotateX(${tilt.rx.toFixed(1)}deg) rotateY(${tilt.ry.toFixed(1)}deg) scale(${scale})`
    : `perspective(560px) translateY(${baseLiftY.toFixed(1)}px) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale})`;

  const rLabel = rankLabel(card.rank);
  const sSymbol = SUIT_SYMBOL[card.suit];
  const chipsVal = cardChips(card);
  const crown = COURT_CROWN[card.rank];

  if (card.faceDown) {
    return (
      <button
        className={cls}
        style={{ transform, zIndex: selected || active ? 20 : index + 1 }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
        title="ไพ่ถูกหมอกบังตา (พลิกคว่ำ)"
      >
        <div className="card-back-pattern">
          <span className="pip">🌫️</span>
        </div>
      </button>
    );
  }

  return (
    <button
      className={cls}
      style={{ transform, zIndex: active ? 35 : selected ? 20 : tilt ? 25 : index + 1 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      title={`${rLabel} ${SUIT_NAME_TH[card.suit]} (+${chipsVal} Chips)`}
    >
      {floater && (
        <span className={`card-popup ${floater.kind}`}>{floater.text}</span>
      )}
      <div className="card-inner-frame">
        <span className="corner top-left">
          <span className="corner-rank">{rLabel}</span>
          <span className="corner-suit">{sSymbol}</span>
        </span>
        <span className="pip">
          {crown && <span className="royal-emblem">{crown}</span>}
          <span>{sSymbol}</span>
        </span>
        <span className="corner bottom-right">
          <span className="corner-rank">{rLabel}</span>
          <span className="corner-suit">{sSymbol}</span>
        </span>
      </div>
      <span className="card-chip-hint">+{chipsVal}</span>
      {disabledSuit && <span className="badge">🚫</span>}
    </button>
  );
}
