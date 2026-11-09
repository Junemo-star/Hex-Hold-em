import type { DealerDef } from '../../engine/dealers';
import { ArtSlot } from './ArtSlot';

interface Props {
  dealer: DealerDef;
  speech: string;
  curseActive: boolean;
  extraStatus?: string;
}

export function DealerBanner({ dealer, speech, curseActive, extraStatus }: Props) {
  return (
    <section className={`dealer-banner ${curseActive ? 'curse-active' : ''}`}>
      <div className="dealer-portrait-frame">
        <ArtSlot category="dealers" id={dealer.id} emoji={dealer.emoji} alt={dealer.name} />
        <span className="dealer-floor-badge">BOSS</span>
      </div>
      <div className="dealer-info">
        <div className="dealer-header">
          <div>
            <span className="dealer-name">{dealer.name}</span>
            <span className="dealer-title"> · {dealer.title}</span>
          </div>
          <span className={`curse-pill ${curseActive ? 'triggered' : ''}`}>
            ☠️ {dealer.curseName}: {dealer.curseDescription}
          </span>
        </div>
        <div className="dealer-speech-bubble">
          <span className="quote-mark">“</span>
          {speech}
          <span className="quote-mark">”</span>
        </div>
        {extraStatus && <div className="dealer-extra">⚡ {extraStatus}</div>}
      </div>
    </section>
  );
}
