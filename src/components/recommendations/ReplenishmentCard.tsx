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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-150 hover:border-emerald-500/30 hover:shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-1">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xl">🛍️</span>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{product.name}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{reason}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAdd?.(recommendation)}
        className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-95 shadow-2xs"
      >
        + Add
      </button>
    </div>
  );
}
