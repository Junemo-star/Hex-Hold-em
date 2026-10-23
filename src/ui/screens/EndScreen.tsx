import type { PlayerStats } from '../../engine/storage';

interface Props {
  victory: boolean;
  floor: number;
  stats: PlayerStats;
  onRestart: () => void;
  onEndless?: () => void;
}

export function EndScreen({ victory, floor, stats, onRestart, onEndless }: Props) {
  return (
    <div className="screen center-screen">
      <div className="modal wide">
        <h2>{victory ? '🏆 คุณเอาชนะเจ้าของบ่อนได้!' : '💀 เกมจบ'}</h2>
        <p>{victory ? 'ผ่านครบทั้ง 8 ชั้นสำเร็จ!' : `พ่ายแพ้ที่ชั้น ${floor}`}</p>

        <table className="payout">
          <tbody>
            <tr><td>จำนวนครั้งที่ชนะบ่อน</td><td>{stats.victories}</td></tr>
            <tr><td>ชั้นสูงสุดที่ไปถึง</td><td>ชั้น {stats.highestFloor}</td></tr>
            <tr><td>แต้มสูงสุดต่อ 1 มือ</td><td>{stats.bestHandScore.toLocaleString()}</td></tr>
            <tr><td>จำนวนโต๊ะที่ชนะสะสม</td><td>{stats.tablesWon}</td></tr>
          </tbody>
        </table>

        <div className="buttons">
          {victory && onEndless && (
            <button className="btn play" onClick={onEndless}>
              ♾️ เล่นต่อ Endless Mode (ชั้น {floor})
            </button>
          )}
          <button className="btn discard" onClick={onRestart}>
            เริ่มรอบใหม่
          </button>
        </div>
      </div>
    </div>
  );
}
