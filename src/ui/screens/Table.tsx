import { useEffect, useMemo, useRef, useState } from 'react';
import type { CharmInstance } from '../../engine/charms/types';
import type { DealerDef } from '../../engine/dealers';
import { draw, shuffle, sortCards } from '../../engine/deck';
import { evaluateHand } from '../../engine/handEval';
import { moveCharm, type RunState } from '../../engine/run';
import { handBase, scoreHand } from '../../engine/scoring';
import type { Card, HandType, ScoreResult, ScoreStep } from '../../engine/types';
import { CardView } from '../components/CardView';
import { CharmBar } from '../components/CharmBar';
import { DealerBanner } from '../components/DealerBanner';
import { playBlip, playCurseSound, playVictorySound } from '../fx/sound';

const BASE_HAND_SIZE = 8;
const MAX_SELECT = 5;
const START_HANDS = 4;
const START_DISCARDS = 3;

export interface TableResult {
  won: boolean;
  handsLeft: number;
  /** net money change at the table (Lucky Coin minus Baron Crimson's discard tax) */
  bonusMoney: number;
  charms: CharmInstance[];
}

interface TableProps {
  title: string;
  target: number;
  run: RunState;
  dealer?: DealerDef;
  onFinish: (result: TableResult) => void;
}

type Phase = 'idle' | 'scoring' | 'won' | 'lost';
type Floater = { key: number; text: string; kind: 'chips' | 'mult' | 'money' | 'curse'; x: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function maybeFlipOneCard(cards: Card[], active: boolean): Card[] {
  const cleared = cards.map((c) => ({ ...c, faceDown: false }));
  if (!active || cleared.length === 0) return cleared;
  const idx = Math.floor(Math.random() * cleared.length);
  return cleared.map((c, i) => (i === idx ? { ...c, faceDown: true } : c));
}

export function Table({ title, target: initialTarget, run, dealer, onFinish }: TableProps) {
  const handSize = BASE_HAND_SIZE + (dealer?.handSizeDelta ?? 0);
  const [currentTarget, setCurrentTarget] = useState(initialTarget);
  const [bossPhase, setBossPhase] = useState<1 | 2>(1);
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [charms, setCharms] = useState<CharmInstance[]>(run.charms);
  const [selected, setSelected] = useState<string[]>([]);
  const [handsLeft, setHandsLeft] = useState(START_HANDS);
  const [handsPlayed, setHandsPlayed] = useState(0);
  const [playedHandTypes, setPlayedHandTypes] = useState<HandType[]>([]);
  const [discardsLeft, setDiscardsLeft] = useState(START_DISCARDS);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sortBy, setSortBy] = useState<'rank' | 'suit'>('rank');
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [live, setLive] = useState<{ chips: number; mult: number; label: string } | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [activeCharm, setActiveCharm] = useState<number | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [speech, setSpeech] = useState<string>(dealer?.dialogue.intro ?? '');
  const [shaking, setShaking] = useState(false);
  const [popping, setPopping] = useState(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const floatKey = useRef(0);
  const bonusRef = useRef(0);

  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 380);
  }

  function triggerPop() {
    setPopping(true);
    setTimeout(() => setPopping(false), 220);
  }

  // Derived active boss curses
  const disabledSuit =
    dealer?.disabledSuitAfterHand2 && handsPlayed >= 2 ? dealer.disabledSuitAfterHand2 : undefined;
  const sealedIndices =
    dealer?.sealLeftCharmAfterHand2 && handsPlayed >= 2 && charms.length > 0 ? [0] : [];
  const bannedHands: HandType[] = useMemo(() => {
    const list: HandType[] = [];
    if (dealer?.bannedHand) list.push(dealer.bannedHand);
    if (dealer?.noRepeatHandsAndTwoPhase) list.push(...playedHandTypes);
    return list;
  }, [dealer, playedHandTypes]);
  const curseActive =
    Boolean(disabledSuit) ||
    sealedIndices.length > 0 ||
    Boolean(dealer?.handSizeDelta) ||
    Boolean(dealer?.discardCost) ||
    Boolean(dealer?.bannedHand) ||
    Boolean(dealer?.shuffleCharmsEachHand && handsPlayed > 0) ||
    Boolean(dealer?.flipCardAfterHand1 && handsPlayed >= 1) ||
    Boolean(dealer?.noRepeatHandsAndTwoPhase && (playedHandTypes.length > 0 || bossPhase === 2));

  useEffect(() => {
    const { drawn, rest } = draw(shuffle(run.deck), handSize);
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
    if (selectedCards.some((c) => c.faceDown)) {
      return { type: '??? (ไพ่คว่ำ)' as string, chips: 0, mult: 0 };
    }
    const { hand: type } = evaluateHand(selectedCards);
    if (bannedHands.includes(type)) {
      return { type: `${type} (ถูกห้าม!)`, chips: 0, mult: 0 };
    }
    return { type, ...handBase(type) };
  }, [selectedCards, bannedHands]);

  function toggle(id: string) {
    if (phase !== 'idle') return;
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX_SELECT ? [...s, id] : s,
    );
  }

  /** Remove used cards from hand and refill from the draw pile. */
  function refill(removeIds: string[], nextHandsPlayed: number) {
    const remaining = hand.filter((c) => !removeIds.includes(c.id));
    const { drawn, rest } = draw(drawPile, handSize - remaining.length);
    setDrawPile(rest);
    const sorted = sortCards([...remaining, ...drawn], sortBy);
    const shouldFlip = Boolean(dealer?.flipCardAfterHand1 && nextHandsPlayed >= 1);
    setHand(maybeFlipOneCard(sorted, shouldFlip));
    setSelected([]);
  }

  function discard() {
    if (phase !== 'idle' || selected.length === 0 || discardsLeft === 0) return;
    setDiscardsLeft((d) => d - 1);
    if (dealer?.discardCost) {
      bonusRef.current = Math.max(-run.money, bonusRef.current - dealer.discardCost);
      setSpeech(dealer.dialogue.curse);
      pushFloater(`-$${dealer.discardCost}`, 'curse', 0);
      playCurseSound();
      triggerShake();
    }
    refill(selected, handsPlayed);
  }

  function pushFloater(text: string, kind: Floater['kind'], x: number) {
    const key = floatKey.current++;
    setFloaters((f) => [...f, { key, text, kind, x }]);
    setTimeout(() => setFloaters((f) => f.filter((fl) => fl.key !== key)), 900);
  }

  function showFloaters(step: ScoreStep) {
    if (step.kind === 'curse') {
      pushFloater(step.label, 'curse', 0);
      return;
    }
    const items: Array<[string, Floater['kind']]> = [];
    if (step.addChips) items.push([`+${step.addChips}`, 'chips']);
    if (step.addMult) items.push([`+${step.addMult} Mult`, 'mult']);
    if (step.xMult) items.push([`X${step.xMult}`, 'mult']);
    if (step.money) items.push([`+$${step.money}`, 'money']);
    items.forEach(([text, kind], i) => pushFloater(text, kind, (i - (items.length - 1) / 2) * 110));
  }

  async function play() {
    if (phase !== 'idle' || selected.length === 0 || handsLeft === 0) return;
    const played = selectedCards.map((c) => ({ ...c, faceDown: false }));
    setHand((h) => h.map((c) => (selected.includes(c.id) ? { ...c, faceDown: false } : c)));
    const heldCards = hand.filter((c) => !selected.includes(c.id));

    const result: ScoreResult = scoreHand(played, {
      charms,
      held: heldCards,
      discardsLeft,
      handsLeft,
      disabledSuit,
      bannedHands,
      sealedCharmIndices: sealedIndices,
    });
    setPhase('scoring');

    if (result.nullified && dealer) {
      setSpeech(dealer.dialogue.curse);
      playCurseSound();
      triggerShake();
    }

    let pitch = 0;
    for (const step of result.steps) {
      setLive({ chips: step.chips, mult: step.mult, label: result.hand });
      setActiveCard(step.cardId ?? null);
      setActiveCharm(step.charmIndex ?? null);
      showFloaters(step);
      triggerPop();
      if (step.xMult && step.xMult >= 2) triggerShake();
      if (step.kind === 'curse') {
        playCurseSound();
      } else {
        playBlip(pitch++);
      }
      await sleep(450 / speedRef.current);
    }
    setActiveCard(null);
    setActiveCharm(null);
    setLive({ chips: result.chips, mult: result.mult, label: result.hand });
    if (result.total >= currentTarget * 0.4) triggerShake();
    await sleep(350 / speedRef.current);

    let nextCharms = result.charms;
    if (dealer?.shuffleCharmsEachHand && nextCharms.length > 1) {
      nextCharms = shuffle(nextCharms);
      setSpeech(dealer.dialogue.curse);
      playCurseSound();
    }
    setCharms(nextCharms);
    bonusRef.current += result.money;

    const newScore = score + result.total;
    setScore(newScore);
    const nextHandsPlayed = handsPlayed + 1;
    setHandsPlayed(nextHandsPlayed);
    if (!playedHandTypes.includes(result.hand)) {
      setPlayedHandTypes((prev) => [...prev, result.hand]);
    }

    if (dealer && result.total >= currentTarget * 0.5 && !result.nullified) {
      setSpeech(dealer.dialogue.bigScore);
    }

    if (
      dealer &&
      ((dealer.disabledSuitAfterHand2 && nextHandsPlayed === 2) ||
        (dealer.sealLeftCharmAfterHand2 && nextHandsPlayed === 2) ||
        (dealer.flipCardAfterHand1 && nextHandsPlayed === 1))
    ) {
      setSpeech(dealer.dialogue.curse);
      playCurseSound();
    }

    let newHands = handsLeft - 1;
    let activeTarget = currentTarget;

    if (newScore >= activeTarget && dealer?.noRepeatHandsAndTwoPhase && bossPhase === 1) {
      activeTarget = Math.round(activeTarget * 1.5);
      setCurrentTarget(activeTarget);
      setBossPhase(2);
      newHands += 2;
      setSpeech(dealer.dialogue.curse);
      playCurseSound();
      triggerShake();
      pushFloater('Phase 2! เป้าหมาย +50% (+2 Hands)', 'curse', 0);
    }

    setHandsLeft(newHands);
    await sleep(500 / speedRef.current);

    if (newScore >= activeTarget) {
      if (dealer) setSpeech(dealer.dialogue.playerWin);
      playVictorySound();
      setPhase('won');
      return;
    }
    if (newHands === 0) {
      if (dealer) setSpeech(dealer.dialogue.playerLose);
      playCurseSound();
      setPhase('lost');
      return;
    }
    refill(played.map((c) => c.id), nextHandsPlayed);
    setLive(null);
    setPhase('idle');
  }

  function finish() {
    onFinish({
      won: phase === 'won',
      handsLeft,
      bonusMoney: bonusRef.current,
      charms,
    });
  }

  const shown = live ?? (preview ? { chips: preview.chips, mult: preview.mult, label: preview.type } : null);
  const canAct = phase === 'idle' && selected.length > 0;

  const extraStatus = useMemo(() => {
    if (!dealer) return undefined;
    const parts: string[] = [];
    if (disabledSuit) parts.push('ไพ่ ♥ ถูกสาป (ไม่นับแต้ม)');
    if (sealedIndices.length > 0) parts.push('เครื่องรางช่องซ้ายสุดถูกผนึก');
    if (bannedHands.length > 0) parts.push(`มือต้องห้าม: ${bannedHands.join(', ')}`);
    if (bossPhase === 2) parts.push('🔥 ร่างที่ 2 ของเจ้าของบ่อน!');
    return parts.join(' · ') || undefined;
  }, [dealer, disabledSuit, sealedIndices, bannedHands, bossPhase]);

  return (
    <div className={`table ${shaking ? 'screen-shake' : ''}`}>
      <header className="topbar">
        <div className="blind">
          <div className="blind-name">{title}</div>
          <div className="blind-target">เป้าหมาย <strong>{currentTarget}</strong></div>
        </div>
        <div className="round-score">
          <span>แต้มรวม</span>
          <strong>{score}</strong>
        </div>
      </header>

      {dealer && (
        <DealerBanner
          dealer={dealer}
          speech={speech}
          curseActive={curseActive}
          extraStatus={extraStatus}
        />
      )}

      <CharmBar
        charms={charms}
        activeIndex={activeCharm}
        sealedIndices={sealedIndices}
        onMove={phase === 'idle' ? (i, dir) => setCharms((c) => moveCharm(c, i, dir)) : undefined}
      />

      <section className="scorebox">
        <div className="hand-name">{shown?.label ?? 'เลือกไพ่เพื่อเล่น'}</div>
        <div className={`formula ${popping ? 'pop' : ''}`}>
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
            disabledSuit={Boolean(disabledSuit && c.suit === disabledSuit)}
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
        <div className="buttons">
          <button className="btn play" disabled={!canAct || handsLeft === 0} onClick={play}>
            Play Hand
          </button>
          <button className="btn discard" disabled={!canAct || discardsLeft === 0} onClick={discard}>
            Discard{dealer?.discardCost ? ` (-$${dealer.discardCost})` : ''}
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
            {dealer && <p className="dealer-quote">“{speech}”</p>}
            <p>แต้มสุดท้าย {score} / {currentTarget}</p>
            <button className="btn play" onClick={finish}>
              {phase === 'won' ? 'รับเงิน' : 'ต่อไป'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
