import { useState } from 'react';

interface Props {
  category: 'charms' | 'dealers';
  id: string;
  emoji: string;
  alt: string;
  className?: string;
}

/**
 * Displays `/art/<category>/<id>.png` if placed in `public/art/`,
 * falls back to `/art/<category>/<id>.svg`, and finally to an ornate arcane medallion + emoji.
 */
export function ArtSlot({ category, id, emoji, alt, className = '' }: Props) {
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
    <span className={`art-slot ${loaded ? 'has-img' : 'is-fallback'} ${className}`}>
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
        <span className="art-medallion">
          <span className="art-slot-emoji">{emoji}</span>
        </span>
      )}
    </span>
  );
}
