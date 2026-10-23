import { getDealerForFloor } from '../../engine/dealers';
import { FLOORS, STAGES, STAGE_NAME, targetFor, type RunState } from '../../engine/run';
import type { PlayerStats } from '../../engine/storage';
import { ArtSlot } from '../components/ArtSlot';
import { CharmBar } from '../components/CharmBar';

interface Props {
  run: RunState;
  stats: PlayerStats;
  onEnter: () => void;
  onResetRun: () => void;
}

export function FloorMap({ run, stats, onEnter, onResetRun }: Props) {
  const dealer = getDealerForFloor(run.floor);

  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <div className="blind-name">
            🎴 Hex &amp; Hold&apos;em · ชั้น {run.floor}
            {run.endless ? ' (♾️ Endless)' : ` / ${FLOORS}`}
          </div>
          <div className="stats-bar">
            🏆 ชนะ {stats.victories} · ชั้นสูงสุด {stats.highestFloor} · มือแรงสุด{' '}
            {stats.bestHandScore.toLocaleString()} แต้ม
          </div>
        </div>
        <div className="round-score">
          <span>เงิน</span>
          <strong>${run.money}</strong>
        </div>
      </header>

      <div className="stage-list">
        {STAGES.map((kind, i) => {
          const state = i < run.stage ? 'done' : i === run.stage ? 'current' : 'locked';
          const isBoss = kind === 'boss';
          return (
            <div key={kind} className={`stage ${state} ${isBoss ? 'boss-stage' : ''}`}>
              <div className="stage-title">
                {isBoss ? (
                  <>
                    <ArtSlot category="dealers" id={dealer.id} emoji={dealer.emoji} alt={dealer.name} />{' '}
                    {dealer.name}
                  </>
                ) : (
                  STAGE_NAME[kind]
                )}
              </div>
              {isBoss && <div className="stage-subtitle">{dealer.title}</div>}
              <div className="stage-target">เป้าหมาย {targetFor(run.floor, kind).toLocaleString()}</div>
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

      <div className="buttons">
        <button className="btn play" onClick={onEnter}>เข้าโต๊ะ</button>
        {(run.floor > 1 || run.stage > 0 || run.charms.length > 0) && (
          <button className="btn small" onClick={onResetRun}>เริ่มรอบใหม่</button>
        )}
      </div>
    </div>
  );
}
