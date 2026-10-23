import { useEffect, useState } from 'react';
import { getDealerForFloor } from './engine/dealers';
import {
  advance,
  newRun,
  payoutFor,
  stageKind,
  STAGE_NAME,
  targetFor,
  type Payout,
  type RunState,
} from './engine/run';
import { generateShop, type ShopState } from './engine/shop';
import {
  loadSavedRun,
  loadSpeed,
  loadStats,
  saveRun,
  saveSpeed,
  updateStats,
  type GameSpeed,
  type PlayerStats,
} from './engine/storage';
import { Cashout } from './ui/screens/Cashout';
import { EndScreen } from './ui/screens/EndScreen';
import { FloorMap } from './ui/screens/FloorMap';
import { Shop } from './ui/screens/Shop';
import { Table, type TableResult } from './ui/screens/Table';

type Screen =
  | { name: 'map' }
  | { name: 'table'; attempt: number }
  | { name: 'cashout'; payout: Payout }
  | { name: 'shop' }
  | { name: 'end'; victory: boolean };

export function App() {
  const [run, setRun] = useState<RunState>(() => loadSavedRun() ?? newRun());
  const [stats, setStats] = useState<PlayerStats>(() => loadStats());
  const [speed, setSpeed] = useState<GameSpeed>(() => loadSpeed());
  const [screen, setScreen] = useState<Screen>({ name: 'map' });
  const [shop, setShop] = useState<ShopState>(() => generateShop());
  const [attempt, setAttempt] = useState(0);

  function handleChangeSpeed(nextSpeed: GameSpeed) {
    setSpeed(nextSpeed);
    saveSpeed(nextSpeed);
  }

  useEffect(() => {
    if (screen.name !== 'end' || screen.victory) {
      saveRun(run);
    }
  }, [run, screen]);

  function restart() {
    const fresh = newRun();
    saveRun(fresh);
    setRun(fresh);
    setStats(updateStats((s) => ({ ...s, runsPlayed: s.runsPlayed + 1 })));
    setScreen({ name: 'map' });
  }

  function enterTable() {
    setAttempt((a) => a + 1);
    setScreen({ name: 'table', attempt });
  }

  function finishTable(result: TableResult) {
    setStats(
      updateStats((s) => ({
        ...s,
        highestFloor: Math.max(s.highestFloor, run.floor),
        bestHandScore: Math.max(s.bestHandScore, result.bestHand),
        tablesWon: result.won ? s.tablesWon + 1 : s.tablesWon,
      })),
    );

    if (!result.won) {
      saveRun(null);
      setScreen({ name: 'end', victory: false });
      return;
    }
    const payout = payoutFor(run, result.handsLeft, result.bonusMoney);
    setRun({
      ...run,
      money: Math.max(0, run.money + payout.total),
      charms: result.charms,
    });
    setScreen({ name: 'cashout', payout });
  }

  /** After cashout: beating the floor 8 boss shows Victory (with Endless option), otherwise visit the shop. */
  function leaveCashout() {
    const next = advance(run);
    setRun(next.run);
    setStats(
      updateStats((s) => ({
        ...s,
        victories: next.victory ? s.victories + 1 : s.victories,
        highestFloor: Math.max(s.highestFloor, next.run.floor),
      })),
    );
    if (next.victory) {
      setScreen({ name: 'end', victory: true });
      return;
    }
    setShop(generateShop());
    setScreen({ name: 'shop' });
  }

  function continueEndless() {
    setShop(generateShop());
    setScreen({ name: 'shop' });
  }

  switch (screen.name) {
    case 'map':
      return <FloorMap run={run} stats={stats} onEnter={enterTable} onResetRun={restart} />;
    case 'table': {
      const kind = stageKind(run);
      const dealer = kind === 'boss' ? getDealerForFloor(run.floor) : undefined;
      return (
        <Table
          key={screen.attempt}
          title={
            dealer
              ? `${dealer.emoji} ${dealer.name} · ชั้น ${run.floor}`
              : `${STAGE_NAME[kind]} · ชั้น ${run.floor}`
          }
          target={targetFor(run.floor, kind)}
          run={run}
          dealer={dealer}
          speed={speed}
          onChangeSpeed={handleChangeSpeed}
          onFinish={finishTable}
        />
      );
    }
    case 'cashout':
      return <Cashout payout={screen.payout} money={run.money} onContinue={leaveCashout} />;
    case 'shop':
      return (
        <Shop
          run={run}
          shop={shop}
          onChange={(r, s) => {
            setRun(r);
            setShop(s);
          }}
          onLeave={() => setScreen({ name: 'map' })}
        />
      );
    case 'end':
      return (
        <EndScreen
          victory={screen.victory}
          floor={run.floor}
          stats={stats}
          onRestart={restart}
          onEndless={screen.victory ? continueEndless : undefined}
        />
      );
  }
}
