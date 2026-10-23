import { beerJug } from './beerJug';
import { crown } from './crown';
import {
  archmageStaff,
  assassinCloak,
  bloodChalice,
  bloodPact,
  copperRing,
  evenGoblet,
  flushPrism,
  fourHorsemen,
  fullHandBanner,
  fullHouseCauldron,
  ironShield,
  jesterHat,
  lastHourglass,
  midasHand,
  oddCandle,
  pairAnvil,
  philosopherStone,
  royalDagger,
  scholarQuill,
  sevenClover,
  sniperMonocle,
  soloMask,
  trinityAmulet,
  twoPairGloves,
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
  copperRing,
  twinMirror,
  twoPairGloves,
  trinityAmulet,
  soloMask,
  fullHandBanner,
  luckyCoin,
  straightScroll,
  flushPrism,
  royalDagger,
  scholarQuill,
  ironShield,
  gamblerBones,
  sevenClover,
  midasHand,
  sniperMonocle,
  fullHouseCauldron,
  moonEye,
  lastHourglass,
  bloodPact,
  ouroboros,
  bloodChalice,
  pairAnvil,
  assassinCloak,
  fourHorsemen,
  crown,
  philosopherStone,
  archmageStaff,
];

const BY_ID = new Map(CHARMS.map((c) => [c.id, c]));

export function getCharm(id: string): CharmDef | undefined {
  return BY_ID.get(id);
}
