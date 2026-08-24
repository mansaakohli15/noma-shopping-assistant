import type { PurchaseHistoryEntry } from '../lib/purchaseHistoryStore';
import { getProductById } from './products';

// SEED / DEMO DATA — not real user behavior. recommendationService only
// reaches for this when the real purchase history in localStorage is
// empty (i.e. a brand new user), so the Home page has something believable
// to show instead of blank sections. Once the person checks off real items,
// their own history takes over automatically.

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
    // Milk: roughly every 7 days, last one 8 days ago — slightly overdue.
    ...entriesFor('amul-milk-500ml', 'Dairy', [8, 15, 22, 29]),
    // Bread: roughly every 5 days, last one 2 days ago — not due yet.
    ...entriesFor('brown-bread-400g', 'Bakery', [2, 7, 12, 17]),
    // Eggs: roughly every 10 days, last one 9 days ago — close but not due.
    ...entriesFor('eggs-6pack', 'Dairy', [9, 19, 29]),
  ];
}
