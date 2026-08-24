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
    <article className="group flex w-40 shrink-0 flex-col gap-2.5 md:w-44">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-white border border-line/40 p-1.5 shadow-xs transition-shadow group-hover:border-forest/30">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover rounded transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-3xl font-display text-forest/50">{symbol}</span>
        )}

        {tag && (
          <div className="absolute left-2 top-2 z-10">
            <Tag tone={tag.tone}>{tag.label}</Tag>
          </div>
        )}
      </div>

      <div>
        <p className="truncate text-sm font-semibold text-ink group-hover:text-forest transition-colors">
          {product.name}
        </p>
        <p className="truncate text-xs text-ink-soft font-medium">
          {product.brand} · {product.size}
        </p>
        {note && <p className="mt-1 text-xs text-ink-soft/80">{note}</p>}
      </div>

      <div className="flex items-center justify-between">
        <span className="num text-sm font-semibold text-ink">₹{product.priceInr}</span>
        <button
          type="button"
          onClick={() => onAdd?.(product)}
          aria-label={`Add ${product.name} to list`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-cream transition-transform hover:scale-105 active:scale-95 shadow-xs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </article>
  );
}
