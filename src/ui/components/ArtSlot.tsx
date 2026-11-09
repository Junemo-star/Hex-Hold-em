import { useState } from 'react';
import type { Rarity } from '../../engine/charms/types';

interface Props {
  category: 'charms' | 'dealers';
  id: string;
  emoji: string;
  alt: string;
  rarity?: Rarity;
  className?: string;
}

/**
 * Full-bleed artwork slot: fills 100% of its parent card/frame.
 * Loads `/art/<category>/<id>.png`, falls back to `.svg`, and finally to a full-card Tarot illustration.
 */
export function ArtSlot({
  category,
  id,
  emoji,
  alt,
  rarity = 'common',
  className = '',
}: Props) {
  const [stage, setStage] = useState<'png' | 'svg' | 'fallback'>('png');
  const [loaded, setLoaded] = useState(false);
  const src = stage === 'png' ? `/art/${category}/${id}.png` : `/art/${category}/${id}.svg`;

  function handleError() {
    if (stage === 'png') {
      setStage('svg');
      setLoaded(false);
    } else {
      setStage('fallback');
    }
  }

  return (
    <span className={`art-slot ${loaded ? 'has-img' : 'is-fallback'} rarity-${rarity} ${className}`}>
      {stage !== 'fallback' && (
        <img
          src={src}
          alt={alt}
          className="art-slot-img"
          style={{ display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      )}
      {!loaded && (
        <span className={`tarot-crest ${rarity}`}>
          <svg
            className="tarot-crest-svg"
            viewBox="0 0 120 150"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Outer & Inner Tarot Filigree Frame */}
            <rect x="5" y="5" width="110" height="140" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
            <rect x="9" y="9" width="102" height="132" rx="5" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />
            {/* Sacred Geometry Magic Circle */}
            <circle cx="60" cy="68" r="40" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.38" />
            <circle cx="60" cy="68" r="32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.55" />
            <polygon
              points="60,26 70,54 98,54 75,71 84,99 60,82 36,99 45,71 22,54 50,54"
              fill="currentColor"
              opacity="0.14"
            />
            {/* Corner Celestial Stars */}
            <circle cx="16" cy="16" r="2.5" fill="currentColor" opacity="0.65" />
            <circle cx="104" cy="16" r="2.5" fill="currentColor" opacity="0.65" />
            <circle cx="16" cy="122" r="2.5" fill="currentColor" opacity="0.65" />
            <circle cx="104" cy="122" r="2.5" fill="currentColor" opacity="0.65" />
          </svg>
          <span className="art-slot-emoji">{emoji}</span>
        </span>
      )}
    </span>
  );
}
