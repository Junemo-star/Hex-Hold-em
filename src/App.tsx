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
import { Cashout } from './ui/screens/Cashout';
import { EndScreen } from './ui/screens/EndScreen';
import { FloorMap } from './ui/screens/FloorMap';
import { Table } from './ui/screens/Table';

type Screen =
  | { name: 'map' }
  | { name: 'table'; attempt: number }
  | { name: 'cashout'; payout: Payout }
  | { name: 'end'; victory: boolean };

export function App() {
  const [run, setRun] = useState<RunState>(newRun);
  const [screen, setScreen] = useState<Screen>({ name: 'map' });
  const [attempt, setAttempt] = useState(0);

  function restart() {
    setRun(newRun());
    setScreen({ name: 'map' });
  }

  function enterTable() {
    setAttempt((a) => a + 1);
    setScreen({ name: 'table', attempt });
  }

  function finishTable(won: boolean, handsLeft: number) {
    if (!won) {
      setScreen({ name: 'end', victory: false });
      return;
    }
    const payout = payoutFor(run, handsLeft);
    setRun({ ...run, money: run.money + payout.total });
    setScreen({ name: 'cashout', payout });
  }

  function continueRun() {
    const next = advance(run);
    if (next.victory) {
      setScreen({ name: 'end', victory: true });
      return;
    }
    setRun(next.run);
    setScreen({ name: 'map' });
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
          onFinish={finishTable}
        />
      );
    }
    case 'cashout':
      return <Cashout payout={screen.payout} money={run.money} onContinue={continueRun} />;
    case 'end':
      return <EndScreen victory={screen.victory} floor={run.floor} onRestart={restart} />;
  }
}

