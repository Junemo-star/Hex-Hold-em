import { useEffect, useState } from 'react';
import type { RunState } from '../../engine/run';
import type { GameSpeed } from '../../engine/storage';
import { RunInfoModal } from './RunInfoModal';

/** Smoothly interpolates an integer towards `target` over ~280ms. */
export function useRollingNumber(target: number): number {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (display === target) return;
    const start = display;
    const diff = target - start;
    const duration = 280;
    const t0 = performance.now();
    let raf = 0;

    function tick(now: number) {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

interface Props {
  headerTitle: string;
  headerSubtitle?: string;
  isBoss?: boolean;
  targetScore?: number;
  currentScore?: number;
  handLabel?: string;
  chips?: number;
  mult?: number;
  popping?: boolean;
  overdrive?: boolean;
  handsLeft?: number;
  discardsLeft?: number;
  money: number;
  run: RunState;
  deckCount?: number;
  speed: GameSpeed;
  onChangeSpeed: (s: GameSpeed) => void;
}

export function HudSidebar({
  headerTitle,
  headerSubtitle,
  isBoss = false,
  targetScore,
  currentScore = 0,
  handLabel = 'พร้อมเดิมพัน',
  chips = 0,
  mult = 0,
  popping = false,
  overdrive = false,
  handsLeft = 4,
  discardsLeft = 3,
  money,
  run,
  deckCount,
  speed,
  onChangeSpeed,
}: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const rollingScore = useRollingNumber(currentScore);
  const progressPct =
    targetScore && targetScore > 0
      ? Math.min(100, Math.round((currentScore / targetScore) * 100))
      : 0;

  return (
    <>
      <aside className="hud-sidebar">
        <div className={`hud-blind-card ${isBoss ? 'is-boss' : ''}`}>
          <div className="hud-blind-header">{headerTitle}</div>
          {targetScore !== undefined ? (
            <>
              <div className="hud-target-label">เป้าหมายแต้มขั้นต่ำ</div>
              <div className="hud-target-value">{targetScore.toLocaleString()}</div>
              <div className="hud-progress-track">
                <div className="hud-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </>
          ) : (
            headerSubtitle && <div className="hud-target-label">{headerSubtitle}</div>
          )}
        </div>

        <div className="hud-round-score">
          <span className="hud-label">แต้มสะสม</span>
          <strong className="hud-score-num">{rollingScore.toLocaleString()}</strong>
        </div>

        <section className={`scorebox ${overdrive ? 'overdrive' : ''}`}>
          <div className="hand-name">{handLabel}</div>
          <div className={`formula ${popping ? 'pop' : ''}`}>
            <span className="chips">{chips.toLocaleString()}</span>
            <span className="times">×</span>
            <span className="mult">{mult.toLocaleString()}</span>
          </div>
          {overdrive && <div className="overdrive-tag">🔥 OVERDRIVE!</div>}
        </section>

        <div className="hud-stats-grid">
          <div className="hud-stat-box hands">
            <span className="hud-stat-label">Hands</span>
            <strong className="hud-stat-val">{handsLeft}</strong>
          </div>
          <div className="hud-stat-box discards">
            <span className="hud-stat-label">Discards</span>
            <strong className="hud-stat-val">{discardsLeft}</strong>
          </div>
          <div className="hud-stat-box money">
            <span className="hud-stat-label">เงินทุน</span>
            <strong className="hud-stat-val">${money}</strong>
          </div>
          <div className="hud-stat-box floor">
            <span className="hud-stat-label">ชั้น / สำรับ</span>
            <strong className="hud-stat-val">
              {run.floor}
              {run.endless ? '♾️' : '/8'} · 🃏{deckCount ?? run.deck.length}
            </strong>
          </div>
        </div>

        <button className="btn small info-btn" onClick={() => setShowInfo(true)}>
          📖 ตารางมือไพ่ &amp; สำรับ
        </button>

        <div className="hud-Subcontrols">
          <div className="speed">
            <span className="sub-label">ความเร็ว</span>
            {([1, 2, 4] as const).map((s) => (
              <button
                key={s}
                className={`btn small ${speed === s ? 'active-pill' : ''}`}
                disabled={speed === s}
                onClick={() => onChangeSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </aside>

      {showInfo && <RunInfoModal deck={run.deck} onClose={() => setShowInfo(false)} />}
    </>
  );
}
