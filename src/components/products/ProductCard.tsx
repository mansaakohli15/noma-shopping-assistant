import { useState } from 'react';
import type { Product } from '../../types';
import { Tag } from '../ui/Tag';

interface ProductCardProps {
  product: Product;
  tag?: { label: string; tone?: 'forest' | 'coral' | 'mustard' };
  note?: string;
  onAdd?: (product: Product) => void;
}

export function ProductCard({ product, tag, note, onAdd }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const initial = product.name.charAt(0);

  return (
    <article className="group flex w-40 shrink-0 flex-col justify-between gap-2.5 rounded-xl border border-line/60 bg-cream-soft p-2.5 shadow-sm transition-all hover:border-forest/30 hover:shadow-md md:w-44">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-forest/[0.04]">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="font-display text-3xl font-bold text-forest/40">{initial}</span>
        )}

        {tag && (
          <div className="absolute left-2 top-2 z-10">
            <Tag tone={tag.tone}>{tag.label}</Tag>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="truncate text-sm font-semibold text-ink group-hover:text-forest transition-colors">
            {product.name}
          </p>
          <p className="truncate text-xs text-ink-soft">
            {product.brand} · {product.size}
          </p>
          {note && <p className="mt-1 line-clamp-1 text-[11px] text-ink-soft/80">{note}</p>}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line/40 pt-2">
          <span className="num text-sm font-bold text-ink">₹{product.priceInr}</span>
          <button
            type="button"
            onClick={() => onAdd?.(product)}
            aria-label={`Add ${product.name} to list`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-cream transition-all hover:scale-110 active:scale-95 shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
