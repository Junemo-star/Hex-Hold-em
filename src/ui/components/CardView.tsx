import { rankLabel, SUIT_SYMBOL } from '../../engine/deck';
import type { Card } from '../../engine/types';

interface Props {
  card: Card;
  selected: boolean;
  active: boolean;
  onClick: () => void;
}

export function CardView({ card, selected, active, onClick }: Props) {
  const red = card.suit === 'hearts' || card.suit === 'diamonds';
  const cls = ['card', red ? 'red' : 'black', selected ? 'selected' : '', active ? 'active' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} onClick={onClick}>
      <span className="corner">
        {rankLabel(card.rank)}
        <br />
        {SUIT_SYMBOL[card.suit]}
      </span>
      <span className="pip">{SUIT_SYMBOL[card.suit]}</span>
    </button>
  );
}

