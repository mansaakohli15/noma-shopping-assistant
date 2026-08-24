import { useState } from 'react';
import type { ShoppingItem } from '../../types';
import { QuantityStepper } from './QuantityStepper';

interface ShoppingListItemRowProps {
  item: ShoppingItem;
  onToggle: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function ShoppingListItemRow({
  item,
  onToggle,
  onQuantityChange,
  onRemove,
}: ShoppingListItemRowProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3.5 py-3 border-b border-line/30 last:border-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.checked}
        aria-label={`Mark ${item.product.name} as ${item.checked ? 'not got' : 'got'}`}
        onClick={() => onToggle(item.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          item.checked ? 'border-forest bg-forest text-cream scale-105' : 'border-line text-transparent hover:border-forest/50'
        }`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5 9-10" />
        </svg>
      </button>

      {/* Product Image Thumbnail */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-forest/[0.06] border border-line/40">
        {item.product.imageUrl && !imageError ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className={`h-full w-full object-cover transition-opacity ${item.checked ? 'opacity-40' : 'opacity-100'}`}
          />
        ) : (
          <span className="font-display text-sm font-bold text-forest/50">{item.product.name.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`truncate text-sm font-semibold transition-colors ${
            item.checked ? 'text-ink-soft/60 line-through' : 'text-ink'
          }`}
        >
          {item.product.name}
        </p>
        <p className="truncate text-xs text-ink-soft/80">
          {item.product.brand} · ₹{item.product.priceInr}
        </p>
      </div>

      <QuantityStepper
        quantity={item.quantity}
        unit={item.unit}
        onChange={(quantity) => onQuantityChange(item.id, quantity)}
      />

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.product.name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft/60 transition-colors hover:bg-coral/10 hover:text-coral"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
