import { getCharm } from '../../engine/charms';
import type { CharmInstance } from '../../engine/charms/types';
import { MAX_CHARMS } from '../../engine/run';
import { sellPrice } from '../../engine/shop';

interface Props {
  charms: CharmInstance[];
  activeIndex?: number | null;
  onMove?: (index: number, dir: -1 | 1) => void;
  onSell?: (index: number) => void;
}

export function CharmBar({ charms, activeIndex = null, onMove, onSell }: Props) {
  return (
    <div className="charm-bar">
      {Array.from({ length: MAX_CHARMS }, (_, i) => {
        const inst = charms[i];
        const def = inst ? getCharm(inst.defId) : undefined;
        if (!inst || !def) {
          return <div key={i} className="charm empty">ว่าง</div>;
        }
        return (
          <div
            key={i}
            className={`charm ${def.rarity} ${activeIndex === i ? 'active' : ''}`}
            title={`${def.name}\n${def.description}`}
          >
            <div className="charm-emoji">{def.emoji}</div>
            <div className="charm-name">{def.name}</div>
            <div className="charm-desc">{def.description}</div>
            {inst.counter > 0 && <div className="charm-counter">สะสม {inst.counter}</div>}
            <div className="charm-actions">
              {onMove && (
                <>
                  <button className="mini" disabled={i === 0} onClick={() => onMove(i, -1)}>◀</button>
                  <button className="mini" disabled={i === charms.length - 1} onClick={() => onMove(i, 1)}>▶</button>
                </>
              )}
              {onSell && (
                <button className="mini sell" onClick={() => onSell(i)}>ขาย ${sellPrice(def.id)}</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

