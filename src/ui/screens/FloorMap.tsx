import { getDealerForFloor } from '../../engine/dealers';
import { FLOORS, STAGES, STAGE_NAME, targetFor, type RunState } from '../../engine/run';
import { CharmBar } from '../components/CharmBar';

interface Props {
  run: RunState;
  onEnter: () => void;
}

export function FloorMap({ run, onEnter }: Props) {
  const dealer = getDealerForFloor(run.floor);

  return (
    <div className="screen">
      <header className="topbar">
        <div className="blind-name">บ่อนเวทมนตร์ · ชั้น {run.floor} / {FLOORS}</div>
        <div className="round-score"><span>เงิน</span><strong>${run.money}</strong></div>
      </header>

      <div className="stage-list">
        {STAGES.map((kind, i) => {
          const state = i < run.stage ? 'done' : i === run.stage ? 'current' : 'locked';
          const isBoss = kind === 'boss';
          return (
            <div key={kind} className={`stage ${state} ${isBoss ? 'boss-stage' : ''}`}>
              <div className="stage-title">
                {isBoss ? `${dealer.emoji} ${dealer.name}` : STAGE_NAME[kind]}
              </div>
              {isBoss && <div className="stage-subtitle">{dealer.title}</div>}
              <div className="stage-target">เป้าหมาย {targetFor(run.floor, kind)}</div>
              {isBoss && (
                <div className="stage-curse">
                  ☠️ <strong>{dealer.curseName}:</strong> {dealer.curseDescription}
                </div>
              )}
              <div className="stage-state">
                {state === 'done' ? '✔ ผ่านแล้ว' : state === 'current' ? 'ถึงตาคุณ' : '🔒'}
              </div>
            </div>
          );
        })}
      </div>

      <section>
        <h3 className="section-title">เครื่องรางของคุณ</h3>
        <CharmBar charms={run.charms} />
      </section>

      <div className="center">
        <button className="btn play" onClick={onEnter}>เข้าโต๊ะ</button>
      </div>
    </div>
  );
}
