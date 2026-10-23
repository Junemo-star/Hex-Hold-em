import { useState } from 'react';

interface Props {
  category: 'charms' | 'dealers';
  id: string;
  emoji: string;
  alt: string;
  className?: string;
}

/**
 * Displays `/art/<category>/<id>.png` if placed in `public/art/`;
 * automatically falls back to the emoji if no custom image file exists.
 */
export function ArtSlot({ category, id, emoji, alt, className = '' }: Props) {
  const [imgOk, setImgOk] = useState<boolean | null>(null);
  const src = `/art/${category}/${id}.png`;

  return (
    <span className={`art-slot ${className}`}>
      {imgOk !== false && (
        <img
          src={src}
          alt={alt}
          className="art-slot-img"
          style={{ display: imgOk ? 'block' : 'none' }}
          onLoad={() => setImgOk(true)}
          onError={() => setImgOk(false)}
        />
      )}
      {!imgOk && <span className="art-slot-emoji">{emoji}</span>}
    </span>
  );
}

