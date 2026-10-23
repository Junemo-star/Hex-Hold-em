import { getCharm } from '../../engine/charms';
import type { CharmInstance } from '../../engine/charms/types';
import { MAX_CHARMS } from '../../engine/run';
import { sellPrice } from '../../engine/shop';
import { ArtSlot } from './ArtSlot';

interface Props {
  charms: CharmInstance[];
  activeIndex?: number | null;
  sealedIndices?: number[];
  onMove?: (index: number, dir: -1 | 1) => void;
  onSell?: (index: number) => void;
}

export function CharmBar({
  charms,
  activeIndex = null,
  sealedIndices = [],
  onMove,
  onSell,
}: Props) {
  return (
    <div className="charm-bar">
      {Array.from({ length: MAX_CHARMS }, (_, i) => {
        const inst = charms[i];
        const def = inst ? getCharm(inst.defId) : undefined;
        if (!inst || !def) {
          return <div key={i} className="charm empty">ว่าง</div>;
        }
        const sealed = sealedIndices.includes(i);
        return (
          <div
            key={i}
            className={`charm ${def.rarity} ${activeIndex === i ? 'active' : ''} ${sealed ? 'sealed' : ''}`}
            title={`${def.name}\n${def.description}${sealed ? '\n(ถูกปิดผนึก!)' : ''}`}
          >
            <div className="charm-emoji">
              {sealed ? (
                '⛓️'
              ) : (
                <ArtSlot category="charms" id={def.id} emoji={def.emoji} alt={def.name} />
              )}
            </div>
            <div className="charm-name">{def.name}</div>
            <div className="charm-desc">{sealed ? 'ถูกปิดผนึกโดยบอส!' : def.description}</div>
            {inst.counter > 0 && <div className="charm-counter">สะสม +{inst.counter}</div>}
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
