import type { RunState } from '../../engine/run';
import type { GameSpeed, PlayerStats } from '../../engine/storage';
import { CharmBar } from '../components/CharmBar';
import { HudSidebar } from '../components/HudSidebar';

interface Props {
  victory: boolean;
  run: RunState;
  stats: PlayerStats;
  speed: GameSpeed;
  onChangeSpeed: (s: GameSpeed) => void;
  onRestart: () => void;
  onEndless?: () => void;
}

export function EndScreen({
  victory,
  run,
  stats,
  speed,
  onChangeSpeed,
  onRestart,
  onEndless,
}: Props) {
  return (
    <div className="balatro-layout">
      <HudSidebar
        headerTitle={victory ? '🏆 ชัยชนะสูงสุด!' : '💀 จบรอบการเดิมพัน'}
        handLabel={victory ? 'ล้มเจ้าของบ่อนสำเร็จ' : 'วิญญาณถูกยึด'}
        money={run.money}
        run={run}
        speed={speed}
        onChangeSpeed={onChangeSpeed}
      />

      <main className="felt-arena center-screen">
        <div className="arcane-circle-watermark" aria-hidden="true" />
        <CharmBar charms={run.charms} />

        <div className="modal wide">
          <h2>{victory ? '🏆 คุณเอาชนะเจ้าของบ่อนได้!' : '💀 เกมจบ'}</h2>
          <p>{victory ? 'ผ่านครบทั้ง 8 ชั้นสำเร็จ!' : `พ่ายแพ้ที่ชั้น ${run.floor}`}</p>

          <table className="payout">
            <tbody>
              <tr><td>จำนวนครั้งที่ชนะบ่อนสะสม</td><td>{stats.victories}</td></tr>
              <tr><td>ชั้นสูงสุดที่เคยไปถึง</td><td>ชั้น {stats.highestFloor}</td></tr>
              <tr><td>แต้มสูงสุดต่อ 1 มือ</td><td>{stats.bestHandScore.toLocaleString()}</td></tr>
              <tr><td>จำนวนโต๊ะที่ชนะสะสม</td><td>{stats.tablesWon}</td></tr>
            </tbody>
          </table>

          <div className="buttons">
            {victory && onEndless && (
              <button className="btn play big-action" onClick={onEndless}>
                ♾️ เล่นต่อ Endless Mode (ชั้น {run.floor})
              </button>
            )}
            <button className="btn discard big-action" onClick={onRestart}>
              ↺ เริ่มรอบใหม่
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
