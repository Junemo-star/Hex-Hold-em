import type { Payout } from '../../engine/run';

interface Props {
  payout: Payout;
  money: number;
  onContinue: () => void;
}

export function Cashout({ payout, money, onContinue }: Props) {
  return (
    <div className="screen center-screen">
      <div className="modal">
        <h2>ชนะโต๊ะนี้!</h2>
        <table className="payout">
          <tbody>
            <tr><td>รางวัลโต๊ะ</td><td>+${payout.base}</td></tr>
            <tr><td>Hands ที่เหลือ</td><td>+${payout.handsBonus}</td></tr>
            <tr><td>ดอกเบี้ย</td><td>+${payout.interest}</td></tr>
            <tr className="total"><td>รวม</td><td>+${payout.total}</td></tr>
          </tbody>
        </table>
        <p>เงินคงเหลือ <strong>${money}</strong></p>
        <p className="muted">(ร้านค้าจะมาใน Phase 3)</p>
        <button className="btn play" onClick={onContinue}>ไปต่อ</button>
      </div>
    </div>
  );
}

