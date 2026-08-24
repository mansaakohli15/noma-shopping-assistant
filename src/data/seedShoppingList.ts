import type { ShoppingItem } from '../types';
import { getProductById } from './products';
import { defaultUnitFor } from './productUnits';

function seedItem(id: string, productId: string, quantity: number): ShoppingItem {
  const foundProduct = getProductById(productId);
  if (!foundProduct) throw new Error(`Unknown product id in seed list: ${productId}`);
  return {
    id,
    product: foundProduct,
    quantity,
    unit: defaultUnitFor(productId),
    checked: false,
  };
}

export const seedShoppingItems: ShoppingItem[] = [
  seedItem('seed-apples', 'apples-1kg', 5),
  seedItem('seed-bananas', 'bananas-dozen', 6),
  seedItem('seed-milk', 'amul-milk-500ml', 2),
  seedItem('seed-bread', 'brown-bread-400g', 1),
];
