import { useState, type MouseEvent } from 'react';
import { rankLabel, SUIT_SYMBOL } from '../../engine/deck';
import type { Card } from '../../engine/types';

interface Props {
  card: Card;
  selected?: boolean;
  active?: boolean;
  disabledSuit?: boolean;
  onClick?: () => void;
}

export function CardView({
  card,
  selected = false,
  active = false,
  disabledSuit = false,
  onClick,
}: Props) {
  const [tilt, setTilt] = useState<{ rx: number; ry: number } | null>(null);
  const red = card.suit === 'hearts' || card.suit === 'diamonds';
  const cls = [
    'card',
    card.faceDown ? 'facedown' : red ? 'red' : 'black',
    disabledSuit ? 'cursed-card' : '',
    selected ? 'selected' : '',
    active ? 'active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  function handleMove(e: MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 22, ry: x * 22 });
  }

  function handleLeave() {
    setTilt(null);
  }

  const liftY = active ? -42 : selected ? -26 : tilt ? -10 : 0;
  const scale = active ? 1.12 : tilt ? 1.04 : 1;
  const style = tilt
    ? {
        transform: `perspective(500px) translateY(${liftY}px) rotateX(${tilt.rx.toFixed(1)}deg) rotateY(${tilt.ry.toFixed(1)}deg) scale(${scale})`,
      }
    : undefined;

  if (card.faceDown) {
    return (
      <button
        className={cls}
        style={style}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
        title="ไพ่ถูกหมอกบังตา (พลิกคว่ำ)"
      >
        <span className="pip">🌫️</span>
      </button>
    );
  }

  return (
    <button
      className={cls}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      <span className="corner">
        {rankLabel(card.rank)}
        <br />
        {SUIT_SYMBOL[card.suit]}
      </span>
      <span className="pip">{SUIT_SYMBOL[card.suit]}</span>
      {disabledSuit && <span className="badge">🚫</span>}
    </button>
  );
}
