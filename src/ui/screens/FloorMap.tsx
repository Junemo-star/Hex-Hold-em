import { getDealerForFloor } from '../../engine/dealers';
import {
  FLOORS,
  moveCharm,
  STAGES,
  STAGE_NAME,
  stageKind,
  targetFor,
  type RunState,
} from '../../engine/run';
import { sellCharm } from '../../engine/shop';
import type { GameSpeed, PlayerStats } from '../../engine/storage';
import { ArtSlot } from '../components/ArtSlot';
import { CharmBar } from '../components/CharmBar';
import { HudSidebar } from '../components/HudSidebar';

interface Props {
  run: RunState;
  stats: PlayerStats;
  speed: GameSpeed;
  onChangeSpeed: (s: GameSpeed) => void;
  onChangeRun: (run: RunState) => void;
  onEnter: () => void;
  onResetRun: () => void;
}

export function FloorMap({
  run,
  stats,
  speed,
  onChangeSpeed,
  onChangeRun,
  onEnter,
  onResetRun,
}: Props) {
  const dealer = getDealerForFloor(run.floor);
  const currentKind = stageKind(run);

  return (
    <div className="balatro-layout">
      <HudSidebar
        headerTitle={`ชั้นที่ ${run.floor}${run.endless ? ' (♾️ Endless)' : ` / ${FLOORS}`}`}
        headerSubtitle="เลือกเตรียมเครื่องรางก่อนเข้าโต๊ะ"
        isBoss={currentKind === 'boss'}
        targetScore={targetFor(run.floor, currentKind)}
        handLabel={STAGE_NAME[currentKind]}
        money={run.money}
        run={run}
        speed={speed}
        onChangeSpeed={onChangeSpeed}
      />

      <main className="felt-arena">
        <div className="arcane-circle-watermark" aria-hidden="true" />
        <div className="arcane-particles" aria-hidden="true" />

        <CharmBar
          charms={run.charms}
          onMove={(i, dir) => onChangeRun({ ...run, charms: moveCharm(run.charms, i, dir) })}
          onSell={(i) => onChangeRun(sellCharm(run, i))}
        />

        <div className="map-header-banner">
          <div className="blind-name">
            🗺️ แผนผังโต๊ะพนัน · ชั้นที่ {run.floor}
          </div>
          <div className="stats-bar">
            🏆 ชนะบ่อน {stats.victories} ครั้ง · ชั้นสูงสุด {stats.highestFloor} · มือแรงสุด{' '}
            {stats.bestHandScore.toLocaleString()} แต้ม
          </div>
        </div>

        <div className="stage-list">
          {STAGES.map((kind, i) => {
            const state = i < run.stage ? 'done' : i === run.stage ? 'current' : 'locked';
            const isBoss = kind === 'boss';
            return (
              <div key={kind} className={`stage ${state} ${isBoss ? 'boss-stage' : ''}`}>
                <div className="stage-badge">
                  {state === 'done' ? '✔ ผ่านแล้ว' : state === 'current' ? '🔥 โต๊ะถัดไป' : '🔒 รอปลดล็อก'}
                </div>
                {isBoss && (
                  <div className="boss-map-portrait">
                    <ArtSlot category="dealers" id={dealer.id} emoji={dealer.emoji} alt={dealer.name} />
                  </div>
                )}
                <div className="stage-title">{isBoss ? dealer.name : STAGE_NAME[kind]}</div>
                {isBoss && <div className="stage-subtitle">{dealer.title}</div>}
                <div className="stage-target">
                  เป้าหมาย {targetFor(run.floor, kind).toLocaleString()}
                </div>
                {isBoss && (
                  <div className="stage-curse">
                    ☠️ <strong>{dealer.curseName}:</strong> {dealer.curseDescription}
                  </div>
                )}
                {state === 'current' && (
                  <button className="btn play big-action" onClick={onEnter}>
                    ▶ เข้าโต๊ะนี้
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <footer className="controls">
          <div className="buttons">
            <button className="btn play big-action" onClick={onEnter}>
              🎴 เข้าสู่ {STAGE_NAME[currentKind]} →
            </button>
            {(run.floor > 1 || run.stage > 0 || run.charms.length > 0) && (
              <button className="btn small" onClick={onResetRun}>
                ↺ เริ่มรอบใหม่
              </button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
