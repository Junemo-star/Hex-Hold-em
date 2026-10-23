import { describe, expect, it } from 'vitest';
import { DEALERS, getDealerForFloor } from './dealers';

describe('dealers registry', () => {
  it('defines 8 unique floor bosses with curses and dialogues', () => {
    expect(DEALERS).toHaveLength(8);
    for (let f = 1; f <= 8; f++) {
      const d = getDealerForFloor(f);
      expect(d.floor).toBe(f);
      expect(d.dialogue.intro.length).toBeGreaterThan(0);
      expect(d.curseDescription.length).toBeGreaterThan(0);
    }
  });
});

