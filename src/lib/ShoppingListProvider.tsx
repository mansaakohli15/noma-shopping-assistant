import { useEffect, useState, type ReactNode } from 'react';
import type { ShoppingItem } from '../types';
import { seedShoppingItems } from '../data/seedShoppingList';
import { defaultUnitFor } from '../data/productUnits';
import { recordPurchase } from './purchaseHistoryStore';
import { ShoppingListContext, type ShoppingListContextValue } from './shoppingListContextObject';

const STORAGE_KEY = 'noma.shoppingList';

function loadInitialItems(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedShoppingItems;
    const parsed = JSON.parse(raw) as ShoppingItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedShoppingItems;
  } catch {
    // Corrupted or unavailable storage — fall back to the seed list rather than crashing.
    return seedShoppingItems;
  }
}

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>(loadInitialItems);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable (private browsing, quota) — the list still
      // works for the session, it just won't survive a refresh.
    }
  }, [items]);

  const addProduct: ShoppingListContextValue['addProduct'] = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      const newItem: ShoppingItem = {
        id: `item-${product.id}-${Date.now()}`,
        product,
        quantity,
        unit: defaultUnitFor(product.id),
        checked: false,
      };
      return [...current, newItem];
    });
  };

  const removeItem: ShoppingListContextValue['removeItem'] = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const setQuantity: ShoppingListContextValue['setQuantity'] = (itemId, quantity) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  };

  const toggleChecked: ShoppingListContextValue['toggleChecked'] = (itemId) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;
        const nextChecked = !item.checked;
        if (nextChecked) {
          recordPurchase({
            productId: item.product.id,
            productName: item.product.name,
            category: item.product.category,
            quantity: item.quantity,
          });
        }
        return { ...item, checked: nextChecked };
      }),
    );
  };

  return (
    <ShoppingListContext.Provider
      value={{ items, addProduct, removeItem, setQuantity, toggleChecked }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}
