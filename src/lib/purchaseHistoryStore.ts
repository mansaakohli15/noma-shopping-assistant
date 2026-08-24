import type { ProductCategory } from '../types';

const STORAGE_KEY = 'noma.purchaseHistory';
const MAX_ENTRIES = 200; // keeps localStorage from growing without bound

export interface PurchaseHistoryEntry {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  purchasedAt: string;
}

export function getPurchaseHistory(): PurchaseHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Called whenever an item is meaningfully completed (checked off as
// bought). Deliberately small — just enough to drive replenishment and
// frequency recommendations, not a behavioral profile.
export function recordPurchase(entry: Omit<PurchaseHistoryEntry, 'purchasedAt'>): void {
  try {
    const history = getPurchaseHistory();
    const updated = [...history, { ...entry, purchasedAt: new Date().toISOString() }].slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage unavailable — history just won't persist this session.
  }
}
