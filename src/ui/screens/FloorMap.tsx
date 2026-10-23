import { FLOORS, STAGES, STAGE_NAME, targetFor, type RunState } from '../../engine/run';

interface Props {
  run: RunState;
  onEnter: () => void;
}

export function FloorMap({ run, onEnter }: Props) {
  return (
    <div className="screen">
      <header className="topbar">
        <div className="blind-name">บ่อนเวทมนตร์ · ชั้น {run.floor} / {FLOORS}</div>
        <div className="round-score"><span>เงิน</span><strong>${run.money}</strong></div>
      </header>

      <div className="stage-list">
        {STAGES.map((kind, i) => {
          const state = i < run.stage ? 'done' : i === run.stage ? 'current' : 'locked';
          return (
            <div key={kind} className={`stage ${state}`}>
              <div className="stage-title">{STAGE_NAME[kind]}</div>
              <div className="stage-target">เป้าหมาย {targetFor(run.floor, kind)}</div>
              <div className="stage-state">
                {state === 'done' ? '✔ ผ่านแล้ว' : state === 'current' ? 'ถึงตาคุณ' : '🔒'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="center">
        <button className="btn play" onClick={onEnter}>เข้าโต๊ะ</button>
      </div>
    </div>
  );
}

