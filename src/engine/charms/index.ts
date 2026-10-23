import { beerJug } from './beerJug';
import { crown } from './crown';
import { gamblerBones } from './gamblerBones';
import { luckyCoin } from './luckyCoin';
import { moonEye } from './moonEye';
import { ouroboros } from './ouroboros';
import { straightScroll } from './straightScroll';
import { earthCrystal, elderBranch, fireRing, waterPendant } from './suitCharms';
import { twinMirror } from './twinMirror';
import type { CharmDef } from './types';

/** Registry: to add a charm, create its file and list it here. */
export const CHARMS: CharmDef[] = [
  beerJug,
  fireRing,
  waterPendant,
  elderBranch,
  earthCrystal,
  twinMirror,
  luckyCoin,
  straightScroll,
  gamblerBones,
  moonEye,
  ouroboros,
  crown,
];

const BY_ID = new Map(CHARMS.map((c) => [c.id, c]));

export function getCharm(id: string): CharmDef | undefined {
  return BY_ID.get(id);
}

