import { useState } from 'react';
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
  const [run, setRun] = useState<RunState>(newRun);
  const [screen, setScreen] = useState<Screen>({ name: 'map' });
  const [shop, setShop] = useState<ShopState>(() => generateShop());
  const [attempt, setAttempt] = useState(0);

  function restart() {
    setRun(newRun());
    setScreen({ name: 'map' });
  }

  function enterTable() {
    setAttempt((a) => a + 1);
    setScreen({ name: 'table', attempt });
  }

  function finishTable(result: TableResult) {
    if (!result.won) {
      setScreen({ name: 'end', victory: false });
      return;
    }
    const payout = payoutFor(run, result.handsLeft, result.bonusMoney);
    setRun({
      ...run,
      money: run.money + payout.total,
      deck: result.deck,
      charms: result.charms,
      potions: result.potions,
    });
    setScreen({ name: 'cashout', payout });
  }

  /** After cashout: beating the floor 8 boss ends the game, otherwise visit the shop. */
  function leaveCashout() {
    const next = advance(run);
    if (next.victory) {
      setScreen({ name: 'end', victory: true });
      return;
    }
    setRun(next.run);
    setShop(generateShop());
    setScreen({ name: 'shop' });
  }

  switch (screen.name) {
    case 'map':
      return <FloorMap run={run} onEnter={enterTable} />;
    case 'table': {
      const kind = stageKind(run);
      return (
        <Table
          key={screen.attempt}
          title={`${STAGE_NAME[kind]} · ชั้น ${run.floor}`}
          target={targetFor(run.floor, kind)}
          run={run}
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
      return <EndScreen victory={screen.victory} floor={run.floor} onRestart={restart} />;
  }
}
