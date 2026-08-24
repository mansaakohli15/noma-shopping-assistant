import { useState } from 'react';
import type { Product, ProductCategory } from '../../types';
import { Tag } from '../ui/Tag';

interface ProductCardProps {
  product: Product;
  tag?: { label: string; tone?: 'forest' | 'coral' | 'mustard' };
  note?: string;
  onAdd?: (product: Product) => void;
}

function getCategoryFallbackSymbol(category: ProductCategory, name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('organic apple')) return '🍏';
  if (lower.includes('apple')) return '🍎';
  if (lower.includes('banana')) return '🍌';
  if (lower.includes('mango')) return '🥭';
  if (lower.includes('watermelon')) return '🍉';
  if (lower.includes('almond milk')) return '🥛';
  if (lower.includes('milk')) return '🥛';
  if (lower.includes('brown bread')) return '🍞';
  if (lower.includes('bread')) return '🍞';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('rice')) return '🍚';
  if (lower.includes('oat')) return '🥣';
  if (lower.includes('coconut')) return '🥥';
  if (lower.includes('colgate') || lower.includes('sensodyne') || lower.includes('toothpaste')) return '🪥';

  switch (category) {
    case 'Produce': return '🥗';
    case 'Dairy':   return '🥛';
    case 'Bakery':  return '🍞';
    case 'Beverages': return '🧃';
    case 'Snacks':  return '🥨';
    case 'Pantry':  return '🌾';
    case 'Personal Care': return '✨';
    default:        return '🛍️';
  }
}

export function ProductCard({ product, tag, note, onAdd }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const symbol = getCategoryFallbackSymbol(product.category, product.name);

  return (
    <article className="group flex w-40 shrink-0 flex-col gap-2.5 md:w-44">
      {/* Photo tile */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-cream-soft border border-line/40 transition-all duration-200 group-hover:border-forest/25 group-hover:shadow-sm">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="text-3xl">{symbol}</span>
        )}

        {tag && (
          <div className="absolute left-2 top-2 z-10">
            <Tag tone={tag.tone}>{tag.label}</Tag>
          </div>
        )}

        {/* Quick-add overlay on hover */}
        <button
          type="button"
          onClick={() => onAdd?.(product)}
          aria-label={`Add ${product.name} to list`}
          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-forest/90 text-cream opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 hover:scale-105 active:scale-95"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div>
        <p className="truncate text-sm font-semibold text-ink leading-snug group-hover:text-forest transition-colors">
          {product.name}
        </p>
        <p className="truncate text-xs text-ink-soft mt-0.5">
          {product.brand} · {product.size}
        </p>
        {note && <p className="mt-1 text-xs text-ink-soft/70 line-clamp-1">{note}</p>}
      </div>

      {/* Price + add */}
      <div className="flex items-center justify-between">
        <span className="num text-sm font-semibold text-ink">₹{product.priceInr}</span>
        <button
          type="button"
          onClick={() => onAdd?.(product)}
          aria-label={`Add ${product.name} to list`}
          className="flex items-center gap-1.5 rounded-full border border-forest/30 px-3 py-1 text-xs font-semibold text-forest transition-all hover:bg-forest hover:text-cream hover:border-forest active:scale-95"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add
        </button>
      </div>
    </article>
  );
}
