import { createContext } from 'react';
import type { Product, ShoppingItem } from '../types';

export interface ShoppingListContextValue {
  items: ShoppingItem[];
  addProduct: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  toggleChecked: (itemId: string) => void;
}

export const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);
