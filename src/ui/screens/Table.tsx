import { useEffect, useMemo, useRef, useState } from 'react';
import { createDeck, draw, shuffle, sortCards } from '../../engine/deck';
import { evaluateHand } from '../../engine/handEval';
import { handBaseAtLevel, scoreHand } from '../../engine/scoring';
import type { Card, ScoreResult } from '../../engine/types';
import { CardView } from '../components/CardView';
import { playBlip } from '../fx/sound';

const HAND_SIZE = 8;
const MAX_SELECT = 5;
const START_HANDS = 4;
const START_DISCARDS = 3;

interface TableProps {
  title: string;
  target: number;
  onFinish: (won: boolean, handsLeft: number) => void;
}

type Phase = 'idle' | 'scoring' | 'won' | 'lost';
type Floater = { key: number; text: string; kind: 'chips' | 'mult' };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Table({ title, target, onFinish }: TableProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [handsLeft, setHandsLeft] = useState(START_HANDS);
  const [discardsLeft, setDiscardsLeft] = useState(START_DISCARDS);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sortBy, setSortBy] = useState<'rank' | 'suit'>('rank');
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [live, setLive] = useState<{ chips: number; mult: number; label: string } | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const floatKey = useRef(0);

  function newRound() {
    const shuffled = shuffle(createDeck());
    const { drawn, rest } = draw(shuffled, HAND_SIZE);
    setDeck(rest);
    setHand(sortCards(drawn, sortBy));
    setSelected([]);
    setHandsLeft(START_HANDS);
    setDiscardsLeft(START_DISCARDS);
    setScore(0);
    setLive(null);
    setPhase('idle');
  }

  useEffect(newRound, []);

  useEffect(() => {
    setHand((h) => sortCards(h, sortBy));
  }, [sortBy]);

  const selectedCards = useMemo(() => hand.filter((c) => selected.includes(c.id)), [hand, selected]);
  const preview = useMemo(() => {
    if (selectedCards.length === 0) return null;
    const { hand: type } = evaluateHand(selectedCards);
    return { type, ...handBaseAtLevel(type) };
  }, [selectedCards]);

  function toggle(id: string) {
    if (phase !== 'idle') return;
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX_SELECT ? [...s, id] : s,
    );
  }

  /** Remove used cards from hand and refill from deck. */
  function refill(removeIds: string[]) {
    const remaining = hand.filter((c) => !removeIds.includes(c.id));
    const { drawn, rest } = draw(deck, HAND_SIZE - remaining.length);
    setDeck(rest);
    setHand(sortCards([...remaining, ...drawn], sortBy));
    setSelected([]);
    return remaining.length + drawn.length;
  }

  function discard() {
    if (phase !== 'idle' || selected.length === 0 || discardsLeft === 0) return;
    setDiscardsLeft((d) => d - 1);
    refill(selected);
  }

  async function play() {
    if (phase !== 'idle' || selected.length === 0 || handsLeft === 0) return;
    const played = selectedCards;
    const result: ScoreResult = scoreHand(played);
    setPhase('scoring');

    let pitch = 0;
    for (const step of result.steps) {
      setLive({ chips: step.chips, mult: step.mult, label: step.kind === 'hand' ? step.label : live?.label ?? result.hand });
      setActiveCard(step.cardId ?? null);
      if (step.cardId && step.addChips) pushFloater(`+${step.addChips}`, 'chips');
      playBlip(pitch++);
      await sleep(450 / speedRef.current);
    }
    setActiveCard(null);
    setLive({ chips: result.chips, mult: result.mult, label: result.hand });
    await sleep(350 / speedRef.current);

    const newScore = score + result.total;
    setScore(newScore);
    const newHands = handsLeft - 1;
    setHandsLeft(newHands);
    await sleep(500 / speedRef.current);

    if (newScore >= target) {
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

  function pushFloater(text: string, kind: Floater['kind']) {
    const key = floatKey.current++;
    setFloaters((f) => [...f, { key, text, kind }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.key !== key)), 900);
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

      <section className="scorebox">
        <div className="hand-name">{shown?.label ?? 'เลือกไพ่เพื่อเล่น'}</div>
        <div className="formula">
          <span className="chips">{shown?.chips ?? 0}</span>
          <span className="times">×</span>
          <span className="mult">{shown?.mult ?? 0}</span>
        </div>
        <div className="floaters">
          {floaters.map((f) => (
            <span key={f.key} className={`floater ${f.kind}`}>{f.text}</span>
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
          <div className="counter deck">สำรับ <strong>{deck.length}</strong></div>
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
            <button className="btn play" onClick={() => onFinish(phase === 'won', handsLeft)}>
              {phase === 'won' ? 'รับเงิน' : 'ต่อไป'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

