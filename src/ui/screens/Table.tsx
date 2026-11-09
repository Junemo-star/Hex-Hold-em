import { useEffect, useMemo, useRef, useState } from 'react';
import type { CharmInstance } from '../../engine/charms/types';
import type { DealerDef } from '../../engine/dealers';
import { draw, shuffle, sortCards } from '../../engine/deck';
import { evaluateHand } from '../../engine/handEval';
import { moveCharm, type RunState } from '../../engine/run';
import { handBase, scoreHand } from '../../engine/scoring';
import type { GameSpeed } from '../../engine/storage';
import type { Card, HandType, ScoreResult, ScoreStep } from '../../engine/types';
import { CardView, type CardFloater } from '../components/CardView';
import { CharmBar } from '../components/CharmBar';
import { DealerBanner } from '../components/DealerBanner';
import { HudSidebar } from '../components/HudSidebar';
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
  bestHand: number;
}

interface TableProps {
  title: string;
  target: number;
  run: RunState;
  dealer?: DealerDef;
  speed: GameSpeed;
  onChangeSpeed: (speed: GameSpeed) => void;
  onFinish: (result: TableResult) => void;
}

type Phase = 'idle' | 'scoring' | 'won' | 'lost';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function maybeFlipOneCard(cards: Card[], active: boolean): Card[] {
  const cleared = cards.map((c) => ({ ...c, faceDown: false }));
  if (!active || cleared.length === 0) return cleared;
  const idx = Math.floor(Math.random() * cleared.length);
  return cleared.map((c, i) => (i === idx ? { ...c, faceDown: true } : c));
}

function stepToFloater(step: ScoreStep): CardFloater | null {
  if (step.kind === 'curse') return { text: step.label, kind: 'curse' };
  const parts: string[] = [];
  let kind: CardFloater['kind'] = 'chips';
  if (step.addChips) {
    parts.push(`+${step.addChips}`);
    kind = 'chips';
  }
  if (step.addMult) {
    parts.push(`+${step.addMult} Mult`);
    kind = 'mult';
  }
  if (step.xMult) {
    parts.push(`X${step.xMult}`);
    kind = 'mult';
  }
  if (step.money) {
    parts.push(`+$${step.money}`);
    if (!step.addChips && !step.addMult && !step.xMult) kind = 'money';
  }
  if (parts.length === 0) return null;
  return { text: parts.join(' '), kind };
}

export function Table({
  title,
  target: initialTarget,
  run,
  dealer,
  speed,
  onChangeSpeed,
  onFinish,
}: TableProps) {
  const handSize = BASE_HAND_SIZE + (dealer?.handSizeDelta ?? 0);
  const [currentTarget, setCurrentTarget] = useState(initialTarget);
  const [bossPhase, setBossPhase] = useState<1 | 2>(1);
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [playedStage, setPlayedStage] = useState<{ cards: Card[]; scoringIds: Set<string> } | null>(null);
  const [charms, setCharms] = useState<CharmInstance[]>(run.charms);
  const [selected, setSelected] = useState<string[]>([]);
  const [handsLeft, setHandsLeft] = useState(START_HANDS);
  const [handsPlayed, setHandsPlayed] = useState(0);
  const [playedHandTypes, setPlayedHandTypes] = useState<HandType[]>([]);
  const [discardsLeft, setDiscardsLeft] = useState(START_DISCARDS);
  const [score, setScore] = useState(0);
  const [bonusMoney, setBonusMoney] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sortBy, setSortBy] = useState<'rank' | 'suit'>('rank');
  const [live, setLive] = useState<{ chips: number; mult: number; label: string } | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [activeCharm, setActiveCharm] = useState<number | null>(null);
  const [cardFloater, setCardFloater] = useState<({ cardId: string } & CardFloater) | null>(null);
  const [charmFloater, setCharmFloater] = useState<({ index: number } & CardFloater) | null>(null);
  const [speech, setSpeech] = useState<string>(dealer?.dialogue.intro ?? '');
  const [shaking, setShaking] = useState(false);
  const [popping, setPopping] = useState(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const bonusRef = useRef(0);
  const bestHandRef = useRef(0);

  function addBonusMoney(delta: number) {
    const next = Math.max(-run.money, bonusRef.current + delta);
    bonusRef.current = next;
    setBonusMoney(next);
  }

  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 380);
  }

  function triggerPop() {
    setPopping(true);
    setTimeout(() => setPopping(false), 220);
  }

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
    setBonusMoney(0);
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

  function refill(currentRemaining: Card[], nextHandsPlayed: number) {
    const { drawn, rest } = draw(drawPile, handSize - currentRemaining.length);
    setDrawPile(rest);
    const sorted = sortCards([...currentRemaining, ...drawn], sortBy);
    const shouldFlip = Boolean(dealer?.flipCardAfterHand1 && nextHandsPlayed >= 1);
    setHand(maybeFlipOneCard(sorted, shouldFlip));
    setSelected([]);
  }

  function discard() {
    if (phase !== 'idle' || selected.length === 0 || discardsLeft === 0) return;
    setDiscardsLeft((d) => d - 1);
    if (dealer?.discardCost) {
      addBonusMoney(-dealer.discardCost);
      setSpeech(dealer.dialogue.curse);
      playCurseSound();
      triggerShake();
    }
    const remaining = hand.filter((c) => !selected.includes(c.id));
    refill(remaining, handsPlayed);
  }

  async function play() {
    if (phase !== 'idle' || selected.length === 0 || handsLeft === 0) return;
    const played = selectedCards.map((c) => ({ ...c, faceDown: false }));
    const heldCards = hand.filter((c) => !selected.includes(c.id));
    const { scoringIds } = evaluateHand(played);

    // Move played cards from hand up into the Center Played Stage
    setHand(heldCards);
    setSelected([]);
    setPlayedStage({ cards: played, scoringIds: new Set(scoringIds) });

    const result: ScoreResult = scoreHand(played, {
      charms,
      held: heldCards,
      discardsLeft,
      handsLeft,
      money: Math.max(0, run.money + bonusRef.current),
      deckRemaining: drawPile.length,
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

      const fl = stepToFloater(step);
      if (step.charmIndex !== undefined && fl) {
        setCharmFloater({ index: step.charmIndex, ...fl });
        setCardFloater(step.cardId ? { cardId: step.cardId, ...fl } : null);
      } else if (step.cardId && fl) {
        setCardFloater({ cardId: step.cardId, ...fl });
        setCharmFloater(null);
      } else {
        setCardFloater(null);
        setCharmFloater(null);
      }

      if (step.money) {
        addBonusMoney(step.money);
      }

      triggerPop();
      if (step.xMult && step.xMult >= 1.5) triggerShake();
      if (step.kind === 'curse') {
        playCurseSound();
      } else {
        playBlip(pitch++);
      }
      await sleep(450 / speedRef.current);
    }
    setActiveCard(null);
    setActiveCharm(null);
    setCardFloater(null);
    setCharmFloater(null);
    setLive({ chips: result.chips, mult: result.mult, label: result.hand });
    if (result.total >= currentTarget * 0.4) triggerShake();
    await sleep(380 / speedRef.current);

    let nextCharms = result.charms;
    if (dealer?.shuffleCharmsEachHand && nextCharms.length > 1) {
      nextCharms = shuffle(nextCharms);
      setSpeech(dealer.dialogue.curse);
      playCurseSound();
    }
    setCharms(nextCharms);
    if (result.total > bestHandRef.current) {
      bestHandRef.current = result.total;
    }

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
    }

    setHandsLeft(newHands);
    await sleep(450 / speedRef.current);
    setPlayedStage(null);

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
    refill(heldCards, nextHandsPlayed);
    setLive(null);
    setPhase('idle');
  }

  function finish() {
    onFinish({
      won: phase === 'won',
      handsLeft,
      bonusMoney: bonusRef.current,
      charms,
      bestHand: bestHandRef.current,
    });
  }

  const shown = live ?? (preview ? { chips: preview.chips, mult: preview.mult, label: preview.type } : null);
  const canAct = phase === 'idle' && selected.length > 0;
  const isOverdrive =
    score >= currentTarget || Boolean(live && live.chips * live.mult >= currentTarget * 0.5);

  const extraStatus = useMemo(() => {
    if (!dealer) return undefined;
    const parts: string[] = [];
    if (disabledSuit) parts.push('ไพ่ ♥ ถูกสาป (ไม่นับแต้ม)');
    if (sealedIndices.length > 0) parts.push('เครื่องรางช่องซ้ายสุดถูกผนึก');
    if (bannedHands.length > 0) parts.push(`มือต้องห้าม: ${bannedHands.join(', ')}`);
    if (bossPhase === 2) parts.push('🔥 ร่างที่ 2 ของเจ้าของบ่อน (+50% เป้าหมาย)!');
    return parts.join(' · ') || undefined;
  }, [dealer, disabledSuit, sealedIndices, bannedHands, bossPhase]);

  return (
    <div className={`balatro-layout ${shaking ? 'screen-shake' : ''}`}>
      <HudSidebar
        headerTitle={title}
        isBoss={Boolean(dealer)}
        targetScore={currentTarget}
        currentScore={score}
        handLabel={shown?.label ?? 'เลือกไพ่ 1–5 ใบ'}
        chips={shown?.chips ?? 0}
        mult={shown?.mult ?? 0}
        popping={popping}
        overdrive={isOverdrive}
        handsLeft={handsLeft}
        discardsLeft={discardsLeft}
        money={Math.max(0, run.money + bonusMoney)}
        run={run}
        deckCount={drawPile.length}
        speed={speed}
        onChangeSpeed={onChangeSpeed}
      />

      <main className="felt-arena">
        <div className="arcane-circle-watermark" aria-hidden="true" />
        <div className="arcane-particles" aria-hidden="true" />

        <CharmBar
          charms={charms}
          activeIndex={activeCharm}
          sealedIndices={sealedIndices}
          charmFloater={charmFloater}
          onMove={phase === 'idle' ? (i, dir) => setCharms((c) => moveCharm(c, i, dir)) : undefined}
        />

        {dealer && (
          <DealerBanner
            dealer={dealer}
            speech={speech}
            curseActive={curseActive}
            extraStatus={extraStatus}
          />
        )}

        {/* CENTER PLAYED-CARDS SCORING ZONE */}
        <section className="played-center-zone">
          {playedStage ? (
            <div className="played-cards-row">
              {playedStage.cards.map((c) => {
                const isScoring = playedStage.scoringIds.has(c.id);
                const fl = cardFloater && cardFloater.cardId === c.id ? cardFloater : null;
                return (
                  <CardView
                    key={c.id}
                    card={c}
                    active={activeCard === c.id}
                    dimmed={!isScoring}
                    disabledSuit={Boolean(disabledSuit && c.suit === disabledSuit)}
                    floater={fl}
                  />
                );
              })}
            </div>
          ) : (
            <div className="played-zone-placeholder">
              <span>✧ พื้นที่แสดงไพ่และคำนวณคอมโบ ✧</span>
            </div>
          )}
        </section>

        {/* HAND & VISUAL 3D DECK STACK */}
        <section className="hand-stage">
          <div className="hand-selection-hint">
            {phase === 'scoring'
              ? 'กำลังคำนวณแต้ม...'
              : `ไพ่ในมือ (${hand.length} ใบ) · เลือกแล้ว ${selected.length} / ${MAX_SELECT} ใบ`}
          </div>
          <div className="hand-and-deck-row">
            <div className="hand">
              {hand.map((c, idx) => {
                const fl = cardFloater && cardFloater.cardId === c.id ? cardFloater : null;
                return (
                  <CardView
                    key={c.id}
                    card={c}
                    index={idx}
                    total={hand.length}
                    selected={selected.includes(c.id)}
                    active={activeCard === c.id}
                    disabledSuit={Boolean(disabledSuit && c.suit === disabledSuit)}
                    floater={fl}
                    onClick={() => toggle(c.id)}
                  />
                );
              })}
            </div>

            <div className="deck-pile" title={`ไพ่ที่เหลือในสำรับ ${drawPile.length} ใบ`}>
              <div className="deck-stack-card layer-2" />
              <div className="deck-stack-card layer-1" />
              <div className="deck-stack-card top">
                <span className="deck-rune">✦</span>
                <strong className="deck-count">{drawPile.length}</strong>
                <span className="deck-sub">สำรับ</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="controls">
          <div className="buttons">
            <button className="btn play big-action" disabled={!canAct || handsLeft === 0} onClick={play}>
              ▶ Play Hand
            </button>
            <div className="sort">
              <button
                className={`btn small ${sortBy === 'rank' ? 'active-pill' : ''}`}
                onClick={() => setSortBy('rank')}
                disabled={sortBy === 'rank'}
              >
                เรียงแต้ม
              </button>
              <button
                className={`btn small ${sortBy === 'suit' ? 'active-pill' : ''}`}
                onClick={() => setSortBy('suit')}
                disabled={sortBy === 'suit'}
              >
                เรียงดอก
              </button>
            </div>
            <button
              className="btn discard big-action"
              disabled={!canAct || discardsLeft === 0}
              onClick={discard}
            >
              ✖ Discard{dealer?.discardCost ? ` (-$${dealer.discardCost})` : ''}
            </button>
          </div>
        </footer>
      </main>

      {(phase === 'won' || phase === 'lost') && (
        <div className="overlay">
          <div className="modal">
            <h2>{phase === 'won' ? '✨ ชนะโต๊ะนี้!' : '💀 พ่ายแพ้...'}</h2>
            {dealer && <p className="dealer-quote">“{speech}”</p>}
            <p className="final-score-line">
              แต้มสุดท้าย <strong>{score.toLocaleString()}</strong> / {currentTarget.toLocaleString()}
            </p>
            <button className="btn play big-action" onClick={finish}>
              {phase === 'won' ? '💰 รับเงินรางวัล →' : 'สรุปผล →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
