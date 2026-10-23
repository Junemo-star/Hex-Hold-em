let ctx: AudioContext | null = null;

/** Short synth blip; each consecutive step in a combo rises in pitch. */
export function playBlip(step: number) {
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 330 * Math.pow(2, Math.min(step, 12) / 12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    /* audio unavailable */
  }
}

