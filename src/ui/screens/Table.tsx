import { useEffect, useMemo, useRef, useState } from 'react';
import type { CharmInstance } from '../../engine/charms/types';
import { draw, shuffle, sortCards } from '../../engine/deck';
import { evaluateHand } from '../../engine/handEval';
import { getPotion } from '../../engine/potions';
import { MAX_POTIONS, moveCharm, type RunState } from '../../engine/run';
import { handBaseAtLevel, scoreHand } from '../../engine/scoring';
import type { Card, ScoreResult, ScoreStep } from '../../engine/types';
import { CardView } from '../components/CardView';
import { CharmBar } from '../components/CharmBar';
import { playBlip } from '../fx/sound';

const HAND_SIZE = 8;
const MAX_SELECT = 5;
const START_HANDS = 4;
const START_DISCARDS = 3;
const GOLD_PAY = 3;

export interface TableResult {
  won: boolean;
  handsLeft: number;
  /** money earned at the table: charms + gold cards held at the end */
  bonusMoney: number;
  /** master deck after potions and burned cards */
  deck: Card[];
  charms: CharmInstance[];
  potions: string[];
}

interface TableProps {
  title: string;
  target: number;
  run: RunState;
  onFinish: (result: TableResult) => void;
}

type Phase = 'idle' | 'scoring' | 'won' | 'lost';
type Floater = { key: number; text: string; kind: 'chips' | 'mult' | 'money'; x: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Table({ title, target, run, onFinish }: TableProps) {
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [masterDeck, setMasterDeck] = useState<Card[]>(run.deck);
  const [charms, setCharms] = useState<CharmInstance[]>(run.charms);
  const [potions, setPotions] = useState<string[]>(run.potions);
  const [selected, setSelected] = useState<string[]>([]);
  const [handsLeft, setHandsLeft] = useState(START_HANDS);
  const [discardsLeft, setDiscardsLeft] = useState(START_DISCARDS);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sortBy, setSortBy] = useState<'rank' | 'suit'>('rank');
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [live, setLive] = useState<{ chips: number; mult: number; label: string } | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [activeCharm, setActiveCharm] = useState<number | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const floatKey = useRef(0);
  const bonusRef = useRef(0);

  useEffect(() => {
    const { drawn, rest } = draw(shuffle(run.deck), HAND_SIZE);
    setDrawPile(rest);
    setHand(sortCards(drawn, 'rank'));
    bonusRef.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHand((h) => sortCards(h, sortBy));
  }, [sortBy]);

  const selectedCards = useMemo(() => hand.filter((c) => selected.includes(c.id)), [hand, selected]);
  const preview = useMemo(() => {
    if (selectedCards.length === 0) return null;
    const { hand: type } = evaluateHand(selectedCards);
    return { type, ...handBaseAtLevel(type, run.handLevels) };
  }, [selectedCards, run.handLevels]);

  function toggle(id: string) {
    if (phase !== 'idle') return;
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX_SELECT ? [...s, id] : s,
    );
  }

  /** Remove used cards from hand and refill from the draw pile. */
  function refill(removeIds: string[]) {
    const remaining = hand.filter((c) => !removeIds.includes(c.id));
    const { drawn, rest } = draw(drawPile, HAND_SIZE - remaining.length);
    setDrawPile(rest);
    setHand(sortCards([...remaining, ...drawn], sortBy));
    setSelected([]);
  }

  function discard() {
    if (phase !== 'idle' || selected.length === 0 || discardsLeft === 0) return;
    setDiscardsLeft((d) => d - 1);
    refill(selected);
  }

  function pushFloater(text: string, kind: Floater['kind'], x: number) {
    const key = floatKey.current++;
    setFloaters((f) => [...f, { key, text, kind, x }]);
    setTimeout(() => setFloaters((f) => f.filter((fl) => fl.key !== key)), 900);
  }

  function showFloaters(step: ScoreStep) {
    const items: Array<[string, Floater['kind']]> = [];
    if (step.addChips) items.push([`+${step.addChips}`, 'chips']);
    if (step.addMult) items.push([`+${step.addMult} Mult`, 'mult']);
    if (step.xMult) items.push([`X${step.xMult}`, 'mult']);
    if (step.money) items.push([`+$${step.money}`, 'money']);
    items.forEach(([text, kind], i) => pushFloater(text, kind, (i - (items.length - 1) / 2) * 110));
  }

  async function play() {
    if (phase !== 'idle' || selected.length === 0 || handsLeft === 0) return;
    const played = selectedCards;
    const heldCards = hand.filter((c) => !selected.includes(c.id));
    const result: ScoreResult = scoreHand(played, {
      levels: run.handLevels,
      charms,
      held: heldCards,
      discardsLeft,
      handsLeft,
    });
    setPhase('scoring');

    let pitch = 0;
    for (const step of result.steps) {
      setLive({ chips: step.chips, mult: step.mult, label: result.hand });
      setActiveCard(step.cardId ?? null);
      setActiveCharm(step.charmIndex ?? null);
      showFloaters(step);
      playBlip(pitch++);
      await sleep(450 / speedRef.current);
    }
    setActiveCard(null);
    setActiveCharm(null);
    setLive({ chips: result.chips, mult: result.mult, label: result.hand });
    await sleep(350 / speedRef.current);

    setCharms(result.charms);
    bonusRef.current += result.money;
    if (result.burned.length > 0) {
      setMasterDeck((m) => m.filter((c) => !result.burned.includes(c.id)));
    }

    const newScore = score + result.total;
    setScore(newScore);
    const newHands = handsLeft - 1;
    setHandsLeft(newHands);
    await sleep(500 / speedRef.current);

    if (newScore >= target) {
      bonusRef.current += heldCards.filter((c) => c.enhancement === 'gold').length * GOLD_PAY;
      setPhase('won');
      return;
    }
    if (newHands === 0) {
      setPhase('lost');
      return;
    }
    refill(played.map((c) => c.id));
    setLive(null);
    setPhase('idle');
  }

  function canUsePotion(id: string): boolean {
    const def = getPotion(id);
    return (
      phase === 'idle' &&
      !!def &&
      selectedCards.length >= def.minTargets &&
      selectedCards.length <= def.maxTargets
    );
  }

  function usePotion(index: number) {
    const def = getPotion(potions[index]);
    if (!def || !canUsePotion(def.id)) return;
    const targets = selectedCards;
    const newHand = def.apply(hand, targets);
    const { drawn, rest } = draw(drawPile, Math.max(0, HAND_SIZE - newHand.length));
    setHand(sortCards([...newHand, ...drawn], sortBy));
    setDrawPile(rest);
    setMasterDeck((m) => def.apply(m, targets));
    setPotions((p) => p.filter((_, i) => i !== index));
    setSelected([]);
  }

  function finish() {
    onFinish({
      won: phase === 'won',
      handsLeft,
      bonusMoney: bonusRef.current,
      deck: masterDeck,
      charms,
      potions,
    });
  }

  const shown = live ?? (preview ? { chips: preview.chips, mult: preview.mult, label: preview.type } : null);
  const canAct = phase === 'idle' && selected.length > 0;

  return (
    <div className="table">
      <header className="topbar">
        <div className="blind">
          <div className="blind-name">{title}</div>
          <div className="blind-target">เป้าหมาย <strong>{target}</strong></div>
        </div>
        <div className="round-score">
          <span>แต้มรวม</span>
          <strong>{score}</strong>
        </div>
      </header>

      <CharmBar
        charms={charms}
        activeIndex={activeCharm}
        onMove={phase === 'idle' ? (i, dir) => setCharms((c) => moveCharm(c, i, dir)) : undefined}
      />

      <section className="scorebox">
        <div className="hand-name">{shown?.label ?? 'เลือกไพ่เพื่อเล่น'}</div>
        <div className="formula">
          <span className="chips">{shown?.chips ?? 0}</span>
          <span className="times">×</span>
          <span className="mult">{shown?.mult ?? 0}</span>
        </div>
        <div className="floaters">
          {floaters.map((f) => (
            <span key={f.key} className={`floater ${f.kind}`} style={{ marginLeft: f.x }}>
              {f.text}
            </span>
          ))}
        </div>
      </section>

      <section className="hand">
        {hand.map((c) => (
          <CardView
            key={c.id}
            card={c}
            selected={selected.includes(c.id)}
            active={activeCard === c.id}
            onClick={() => toggle(c.id)}
          />
        ))}
      </section>

      <footer className="controls">
        <div className="counters">
          <div className="counter hands">Hands <strong>{handsLeft}</strong></div>
          <div className="counter discards">Discards <strong>{discardsLeft}</strong></div>
          <div className="counter deck">สำรับ <strong>{drawPile.length}</strong></div>
        </div>
        <div className="potions">
          {Array.from({ length: MAX_POTIONS }, (_, i) => {
            const def = potions[i] ? getPotion(potions[i]) : undefined;
            if (!def) return <div key={i} className="potion empty">ช่องยา</div>;
            return (
              <button
                key={i}
                className="potion"
                disabled={!canUsePotion(def.id)}
                title={def.description}
                onClick={() => usePotion(i)}
              >
                <span className="potion-emoji">{def.emoji}</span>
                <span className="potion-name">{def.name}</span>
                <span className="potion-desc">{def.description}</span>
              </button>
            );
          })}
        </div>
        <div className="buttons">
          <button className="btn play" disabled={!canAct || handsLeft === 0} onClick={play}>
            Play Hand
          </button>
          <button className="btn discard" disabled={!canAct || discardsLeft === 0} onClick={discard}>
            Discard
          </button>
          <div className="sort">
            <button className="btn small" onClick={() => setSortBy('rank')} disabled={sortBy === 'rank'}>เรียงแต้ม</button>
            <button className="btn small" onClick={() => setSortBy('suit')} disabled={sortBy === 'suit'}>เรียงดอก</button>
          </div>
          <div className="speed">
            {([1, 2, 4] as const).map((s) => (
              <button key={s} className="btn small" disabled={speed === s} onClick={() => setSpeed(s)}>{s}x</button>
            ))}
          </div>
        </div>
      </footer>

      {(phase === 'won' || phase === 'lost') && (
        <div className="overlay">
          <div className="modal">
            <h2>{phase === 'won' ? 'ชนะโต๊ะนี้!' : 'แพ้แล้ว...'}</h2>
            <p>แต้มสุดท้าย {score} / {target}</p>
            <button className="btn play" onClick={finish}>
              {phase === 'won' ? 'รับเงิน' : 'ต่อไป'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
