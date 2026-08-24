import type { ProductCategory, ShoppingItem } from '../../types';
import { ShoppingListItemRow } from './ShoppingListItemRow';

interface CategorySectionProps {
  category: ProductCategory;
  items: ShoppingItem[];
  onToggle: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CategorySection({
  category,
  items,
  onToggle,
  onQuantityChange,
  onRemove,
}: CategorySectionProps) {
  return (
    <div>
      <p className="num text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">{category}</p>
      <div className="divide-y divide-line/70">
        {items.map((item) => (
          <ShoppingListItemRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
