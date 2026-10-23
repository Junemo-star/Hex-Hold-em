let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    return ctx;
  } catch {
    return null;
  }
}

/** Short synth blip; each consecutive step in a combo rises in pitch. */
export function playBlip(step: number) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 330 * Math.pow(2, Math.min(step, 14) / 12);
    gain.gain.setValueAtTime(0.13, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.2);
  } catch {
    /* ignore */
  }
}

/** Ominous low chord when a boss curse activates. */
export function playCurseSound() {
  const c = getCtx();
  if (!c) return;
  try {
    [146.83, 155.56, 207.65].forEach((freq) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.45);
      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.48);
    });
  } catch {
    /* ignore */
  }
}

/** Bright arpeggio when winning a table. */
export function playVictorySound() {
  const c = getCtx();
  if (!c) return;
  try {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      const t = c.currentTime + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  } catch {
    /* ignore */
  }
}
