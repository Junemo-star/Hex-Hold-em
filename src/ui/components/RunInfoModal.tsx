import { HAND_BASE } from '../../engine/scoring';
import { SUITS, SUIT_SYMBOL } from '../../engine/deck';
import type { Card, HandType } from '../../engine/types';

interface Props {
  deck: Card[];
  onClose: () => void;
}

const HAND_EXAMPLES: Record<HandType, string> = {
  'Straight Flush': 'ไพ่เรียงกัน 5 ใบ และดอกเดียวกันทั้งหมด (เช่น 5♥ 6♥ 7♥ 8♥ 9♥)',
  'Four of a Kind': 'ไพ่แต้มเดียวกัน 4 ใบ (เช่น K♠ K♥ K♦ K♣)',
  'Full House': 'ตอง 3 ใบ + คู่ 2 ใบ (เช่น Q♠ Q♥ Q♦ 9♣ 9♠)',
  'Flush': 'ไพ่ดอกเดียวกัน 5 ใบ ไม่จำเป็นต้องเรียงแต้ม',
  'Straight': 'ไพ่แต้มเรียงต่อกัน 5 ใบ ดอกใดก็ได้ (A นับเป็นต่ำสุด A-2-3-4-5 หรือสูงสุด 10-J-Q-K-A ได้)',
  'Three of a Kind': 'ไพ่แต้มเดียวกัน 3 ใบ (เช่น 8♠ 8♥ 8♦)',
  'Two Pair': 'ไพ่คู่ 2 คู่คนละแต้ม (เช่น J♠ J♥ 4♦ 4♣)',
  'Pair': 'ไพ่แต้มเดียวกัน 2 ใบ (เช่น 10♠ 10♥)',
  'High Card': 'ไม่เข้าชุดใดเลย นับเฉพาะไพ่ใบที่แต้มสูงที่สุด 1 ใบ',
};

const ORDERED_HANDS: HandType[] = [
  'Straight Flush',
  'Four of a Kind',
  'Full House',
  'Flush',
  'Straight',
  'Three of a Kind',
  'Two Pair',
  'Pair',
  'High Card',
];

export function RunInfoModal({ deck, onClose }: Props) {
  const suitCounts = SUITS.map((s) => ({
    suit: s,
    symbol: SUIT_SYMBOL[s],
    count: deck.filter((c) => c.suit === s).length,
  }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <h2>📖 คู่มือแต้มมือโป๊กเกอร์ &amp; สำรับไพ่</h2>
          <button className="btn small" onClick={onClose}>✖ ปิด</button>
        </div>

        <div className="deck-summary-row">
          <span>สำรับทั้งหมด <strong>{deck.length}</strong> ใบ:</span>
          {suitCounts.map((sc) => (
            <span key={sc.suit} className={`suit-pill suit-${sc.suit}`}>
              {sc.symbol} {sc.count}
            </span>
          ))}
        </div>

        <table className="hand-guide-table">
          <thead>
            <tr>
              <th>ชื่อมือ (Poker Hand)</th>
              <th>แต้มเริ่มต้น (Chips × Mult)</th>
              <th>คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            {ORDERED_HANDS.map((h) => {
              const base = HAND_BASE[h];
              return (
                <tr key={h}>
                  <td className="hand-guide-name">{h}</td>
                  <td>
                    <span className="mini-chips">{base.chips}</span>
                    <span className="mini-times">×</span>
                    <span className="mini-mult">{base.mult}</span>
                  </td>
                  <td className="hand-guide-desc">{HAND_EXAMPLES[h]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
