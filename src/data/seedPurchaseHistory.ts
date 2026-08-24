import type { PurchaseHistoryEntry } from '../lib/purchaseHistoryStore';
import { getProductById } from './products';

// Default initial household purchase history baseline.
// Used to initialize recommendation algorithms for new user sessions.

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function entriesFor(productId: string, category: PurchaseHistoryEntry['category'], daysAgoList: number[]): PurchaseHistoryEntry[] {
  const product = getProductById(productId);
  if (!product) return [];
  return daysAgoList.map((days) => ({
    productId,
    productName: product.name,
    category,
    quantity: 1,
    purchasedAt: daysAgo(days),
  }));
}

export function buildSeedPurchaseHistory(): PurchaseHistoryEntry[] {
  return [
    ...entriesFor('amul-milk-500ml', 'Dairy', [8, 15, 22, 29]),
    ...entriesFor('brown-bread-400g', 'Bakery', [2, 7, 12, 17]),
    ...entriesFor('eggs-6pack', 'Dairy', [9, 19, 29]),
  ];
}
