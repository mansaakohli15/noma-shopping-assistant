import { useState } from 'react';
import type { Recommendation } from '../../types';

interface ReplenishmentCardProps {
  recommendation: Recommendation;
  onAdd?: (recommendation: Recommendation) => void;
}

export function ReplenishmentCard({ recommendation, onAdd }: ReplenishmentCardProps) {
  const { product, reason } = recommendation;
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line/50 bg-cream-soft px-4 py-3 transition-all duration-150 hover:border-forest/25 hover:bg-cream-deep">
      <div className="flex items-center gap-3.5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-deep border border-line/40">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-display text-base text-forest/40">{product.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink leading-snug">{product.name}</p>
          <p className="text-xs text-ink-soft mt-0.5">{reason}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAdd?.(recommendation)}
        className="shrink-0 rounded-full border border-forest/30 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-forest transition-all hover:bg-forest hover:text-cream hover:border-forest active:scale-95"
      >
        + Add
      </button>
    </div>
  );
}
