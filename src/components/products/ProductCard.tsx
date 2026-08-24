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
  if (lower.includes('toothpaste')) return '🪥';

  switch (category) {
    case 'Produce':
      return '🥗';
    case 'Dairy':
      return '🥛';
    case 'Bakery':
      return '🍞';
    case 'Beverages':
      return '🧃';
    case 'Snacks':
      return '🥨';
    case 'Pantry':
      return '🌾';
    case 'Personal Care':
      return '✨';
    default:
      return '🛍️';
  }
}

export function ProductCard({ product, tag, note, onAdd }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const symbol = getCategoryFallbackSymbol(product.category, product.name);

  return (
    <article className="group flex w-44 shrink-0 flex-col justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-md md:w-48">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-stone-50/80 p-2">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-4xl drop-shadow-sm">{symbol}</span>
        )}

        {tag && (
          <div className="absolute left-2 top-2 z-10">
            <Tag tone={tag.tone}>{tag.label}</Tag>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="truncate text-sm font-bold text-ink group-hover:text-forest transition-colors">
            {product.name}
          </p>
          <p className="truncate text-xs font-medium text-ink-soft">
            {product.brand} · {product.size}
          </p>
          {note && <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-forest">{note}</p>}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5">
          <span className="num text-base font-extrabold text-ink">₹{product.priceInr}</span>
          <button
            type="button"
            onClick={() => onAdd?.(product)}
            aria-label={`Add ${product.name} to list`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-cream shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-forest/90"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
