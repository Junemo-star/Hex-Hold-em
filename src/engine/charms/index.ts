import { beerJug } from './beerJug';
import { crown } from './crown';
import {
  bloodChalice,
  bloodPact,
  evenGoblet,
  flushPrism,
  ironShield,
  jesterHat,
  lastHourglass,
  oddCandle,
  philosopherStone,
  royalDagger,
  scholarQuill,
  trinityAmulet,
} from './extraCharms';
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
  jesterHat,
  fireRing,
  waterPendant,
  elderBranch,
  earthCrystal,
  oddCandle,
  evenGoblet,
  twinMirror,
  trinityAmulet,
  luckyCoin,
  straightScroll,
  flushPrism,
  royalDagger,
  scholarQuill,
  ironShield,
  gamblerBones,
  moonEye,
  lastHourglass,
  bloodPact,
  ouroboros,
  bloodChalice,
  crown,
  philosopherStone,
];

const BY_ID = new Map(CHARMS.map((c) => [c.id, c]));

export function getCharm(id: string): CharmDef | undefined {
  return BY_ID.get(id);
}
