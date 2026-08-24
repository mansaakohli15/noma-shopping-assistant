import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProductCategory } from '../types';
import { useShoppingList } from '../hooks/useShoppingList';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/shopping/ProgressBar';
import { CategorySection } from '../components/shopping/CategorySection';
import { ShoppingModeModal } from '../components/shopping/ShoppingModeModal';

// Fixed aisle order rather than however items happen to arrive —
// reads like a grocery store layout, not an arbitrary list.
const categoryOrder: ProductCategory[] = [
  'Produce',
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Pantry',
  'Personal Care',
  'Household',
];

export function ListPage() {
  const { items, toggleChecked, setQuantity, removeItem } = useShoppingList();
  const [isShoppingModeOpen, setIsShoppingModeOpen] = useState(false);

  const completed = items.filter((item) => item.checked).length;
  const categoriesPresent = new Set(items.map((item) => item.product.category));

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between pr-5 md:pr-10">
        <PageHeader
          eyebrow="Today's list"
          title="Your list"
          description={
            items.length > 0
              ? `${items.length} item${items.length === 1 ? '' : 's'} · ${categoriesPresent.size} categor${categoriesPresent.size === 1 ? 'y' : 'ies'}`
              : undefined
          }
        />

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setIsShoppingModeOpen(true)}
            className="mt-6 rounded-full bg-forest px-4 py-2.5 text-xs font-semibold text-cream shadow-sm transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span>Shopping Mode</span>
            <span>🛒</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-5 py-16 text-center md:px-10">
          <p className="font-display text-lg text-ink">Your list is empty</p>
          <p className="max-w-xs text-sm text-ink-soft">
            Speak an item on the Home page, or search for something to add.
          </p>
          <Link
            to="/"
            className="mt-1 rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition-transform hover:scale-[1.02] active:scale-95"
          >
            Go to Home
          </Link>
        </div>
      ) : (
        <div className="px-5 pt-5 md:px-10">
          <ProgressBar completed={completed} total={items.length} />
          <p className="num mt-1.5 text-xs text-ink-soft">
            {completed} / {items.length} completed
          </p>

          <div className="mt-6 flex flex-col gap-6">
            {categoryOrder.map((category) => {
              const categoryItems = items.filter((item) => item.product.category === category);
              if (categoryItems.length === 0) return null;
              return (
                <CategorySection
                  key={category}
                  category={category}
                  items={categoryItems}
                  onToggle={toggleChecked}
                  onQuantityChange={setQuantity}
                  onRemove={removeItem}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Shopping Mode Fullscreen Experience */}
      <ShoppingModeModal
        items={items}
        isOpen={isShoppingModeOpen}
        onClose={() => setIsShoppingModeOpen(false)}
        onToggle={toggleChecked}
      />
    </div>
  );
}
