import type { RunState } from './run';

const RUN_KEY = 'hex-holdem:run:v1';
const STATS_KEY = 'hex-holdem:stats:v1';
const SPEED_KEY = 'hex-holdem:speed:v1';

export type GameSpeed = 1 | 2 | 4;

export interface PlayerStats {
  runsPlayed: number;
  victories: number;
  highestFloor: number;
  bestHandScore: number;
  tablesWon: number;
}

export const DEFAULT_STATS: PlayerStats = {
  runsPlayed: 0,
  victories: 0,
  highestFloor: 1,
  bestHandScore: 0,
  tablesWon: 0,
};

export function loadSavedRun(): RunState | null {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RunState;
    if (typeof parsed?.floor === 'number' && Array.isArray(parsed?.deck)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveRun(run: RunState | null): void {
  try {
    if (!run) {
      localStorage.removeItem(RUN_KEY);
    } else {
      localStorage.setItem(RUN_KEY, JSON.stringify(run));
    }
  } catch {
    /* ignore storage errors */
  }
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...(JSON.parse(raw) as Partial<PlayerStats>) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function updateStats(patch: (prev: PlayerStats) => PlayerStats): PlayerStats {
  const next = patch(loadStats());
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
  return next;
}

export function loadSpeed(): GameSpeed {
  try {
    const raw = Number(localStorage.getItem(SPEED_KEY));
    if (raw === 1 || raw === 2 || raw === 4) return raw;
    return 1;
  } catch {
    return 1;
  }
}

export function saveSpeed(speed: GameSpeed): void {
  try {
    localStorage.setItem(SPEED_KEY, String(speed));
  } catch {
    /* ignore storage errors */
  }
}
