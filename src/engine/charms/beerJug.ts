import type { CharmDef } from './types';

export const beerJug: CharmDef = {
  id: 'beer-jug',
  name: 'เหยือกเบียร์พ่อมด',
  emoji: '🍺',
  rarity: 'common',
  cost: 4,
  description: '+4 Mult',
  hooks: { onHandScored: () => ({ mult: 4 }) },
};

