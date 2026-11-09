import type { Payout, RunState } from '../../engine/run';
import type { GameSpeed } from '../../engine/storage';
import { CharmBar } from '../components/CharmBar';
import { HudSidebar } from '../components/HudSidebar';

interface Props {
  payout: Payout;
  run: RunState;
  speed: GameSpeed;
  onChangeSpeed: (s: GameSpeed) => void;
  onContinue: () => void;
}

export function Cashout({ payout, run, speed, onChangeSpeed, onContinue }: Props) {
  return (
    <div className="balatro-layout">
      <HudSidebar
        headerTitle="💰 สรุปรางวัลประจำโต๊ะ"
        handLabel="ชนะการเดิมพัน!"
        money={run.money}
        run={run}
        speed={speed}
        onChangeSpeed={onChangeSpeed}
      />

      <main className="felt-arena center-screen">
        <div className="arcane-circle-watermark" aria-hidden="true" />
        <CharmBar charms={run.charms} />

        <div className="modal">
          <h2>✨ ชนะโต๊ะพนัน!</h2>
          <table className="payout">
            <tbody>
              <tr><td>รางวัลพื้นฐานของโต๊ะ</td><td>+${payout.base}</td></tr>
              <tr><td>โบนัส Hands ที่เหลือ</td><td>+${payout.handsBonus}</td></tr>
              <tr><td>ดอกเบี้ยสะสม ($1 ต่อทุก $5)</td><td>+${payout.interest}</td></tr>
              {payout.bonus !== 0 && (
                <tr>
                  <td>โบนัสเครื่องราง / คำสาปในโต๊ะ</td>
                  <td>{payout.bonus > 0 ? `+$${payout.bonus}` : `-$${Math.abs(payout.bonus)}`}</td>
                </tr>
              )}
              <tr className="total"><td>รับเงินรวมทั้งสิ้น</td><td>+${payout.total}</td></tr>
            </tbody>
          </table>
          <p className="final-score-line">
            เงินทุนปัจจุบัน <strong>${run.money}</strong>
          </p>
          <button className="btn play big-action" onClick={onContinue}>
            🛒 ไปยังร้านค้าเครื่องราง →
          </button>
        </div>
      </main>
    </div>
  );
}
