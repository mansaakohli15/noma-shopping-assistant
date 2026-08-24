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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line/70 bg-cream-soft px-4 py-3 shadow-sm transition-all hover:border-forest/30">
      <div className="flex items-center gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-forest/[0.06]">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-display text-lg font-bold text-forest/50">{product.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{product.name}</p>
          <p className="text-xs text-ink-soft">{reason}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAdd?.(recommendation)}
        className="shrink-0 rounded-full bg-forest px-4 py-1.5 text-xs font-semibold text-cream transition-transform hover:scale-105 active:scale-95 shadow-sm"
      >
        + Add
      </button>
    </div>
  );
}
