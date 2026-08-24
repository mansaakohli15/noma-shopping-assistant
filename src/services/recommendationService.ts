import type { Product, Recommendation, ShoppingItem } from '../types';
import { products, getProductById } from '../data/products';
import { seasonalProductsByMonth } from '../data/seasonalProducts';
import { buildSeedPurchaseHistory } from '../data/seedPurchaseHistory';
import { getPurchaseHistory, type PurchaseHistoryEntry } from '../lib/purchaseHistoryStore';

function groupByProduct(history: PurchaseHistoryEntry[]): Map<string, PurchaseHistoryEntry[]> {
  const grouped = new Map<string, PurchaseHistoryEntry[]>();
  for (const entry of history) {
    const existing = grouped.get(entry.productId) ?? [];
    existing.push(entry);
    grouped.set(entry.productId, existing);
  }
  return grouped;
}

function averageIntervalDays(dates: Date[]): number | null {
  if (dates.length < 2) return null;
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  let totalGapDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    totalGapDays += (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);
  }
  return totalGapDays / (sorted.length - 1);
}

// Products bought more than once, most-purchased first. Needs at least two
// purchases to count as a pattern rather than a one-off.
export function getFrequentlyPurchased(
  history: PurchaseHistoryEntry[],
  currentListProductIds: Set<string>,
  limit = 4,
): Recommendation[] {
  const grouped = groupByProduct(history);

  const ranked = [...grouped.entries()]
    .filter(([, entries]) => entries.length >= 2)
    .sort((a, b) => b[1].length - a[1].length);

  const recommendations: Recommendation[] = [];
  for (const [productId, entries] of ranked) {
    if (currentListProductIds.has(productId)) continue;
    const product = getProductById(productId);
    if (!product) continue;

    recommendations.push({
      id: `usual-${productId}`,
      type: 'usual',
      product,
      reason: `You've bought this ${entries.length} times recently.`,
    });

    if (recommendations.length >= limit) break;
  }
  return recommendations;
}

// Estimates a purchase rhythm per product from history, and recommends it
// once the time since the last purchase reaches that average interval.
// Needs at least two purchases — one data point says nothing about rhythm.
export function getReplenishmentSuggestions(
  history: PurchaseHistoryEntry[],
  currentListProductIds: Set<string>,
  now: Date = new Date(),
): Recommendation[] {
  const grouped = groupByProduct(history);
  const recommendations: Recommendation[] = [];

  for (const [productId, entries] of grouped) {
    if (currentListProductIds.has(productId)) continue;
    if (entries.length < 2) continue;

    const dates = entries.map((entry) => new Date(entry.purchasedAt));
    const interval = averageIntervalDays(dates);
    if (interval === null || interval < 1) continue;

    const lastPurchaseTime = Math.max(...dates.map((date) => date.getTime()));
    const daysSinceLastPurchase = (now.getTime() - lastPurchaseTime) / (1000 * 60 * 60 * 24);

    if (daysSinceLastPurchase >= interval) {
      const product = getProductById(productId);
      if (!product) continue;
      const roundedInterval = Math.round(interval);
      recommendations.push({
        id: `replenishment-${productId}`,
        type: 'replenishment',
        product,
        reason: `You usually buy this every ${roundedInterval} day${roundedInterval === 1 ? '' : 's'}.`,
      });
    }
  }

  return recommendations;
}

// Small local, month-based seasonal picks — only ever from products that
// exist in the catalog, never invented.
export function getSeasonalRecommendations(
  currentListProductIds: Set<string>,
  now: Date = new Date(),
): Recommendation[] {
  const month = now.getMonth() + 1;
  const productIds = seasonalProductsByMonth[month] ?? [];

  return productIds
    .map((id) => getProductById(id))
    .filter((product): product is Product => Boolean(product))
    .filter((product) => !currentListProductIds.has(product.id))
    .map((product) => ({
      id: `seasonal-${product.id}`,
      type: 'seasonal' as const,
      product,
      reason: 'In season this month.',
    }));
}

export interface HomeRecommendations {
  usuals: Recommendation[];
  replenishment: Recommendation[];
  seasonal: Recommendation[];
  usingSeedHistory: boolean;
}

// Main entry point the Home page calls. Falls back to the labeled seed
// history only when real localStorage history is empty (a new user) — as
// soon as they check off a real item, their own history takes over.
export function getHomeRecommendations(
  currentList: ShoppingItem[],
  now: Date = new Date(),
): HomeRecommendations {
  const currentListProductIds = new Set(currentList.map((item) => item.product.id));
  const realHistory = getPurchaseHistory();
  const usingSeedHistory = realHistory.length === 0;
  const history = usingSeedHistory ? buildSeedPurchaseHistory() : realHistory;

  return {
    usuals: getFrequentlyPurchased(history, currentListProductIds),
    replenishment: getReplenishmentSuggestions(history, currentListProductIds, now),
    seasonal: getSeasonalRecommendations(currentListProductIds, now),
    usingSeedHistory,
  };
}

// Async service wrapper, kept for interface consistency with the rest of
// the services/ layer. getAlternatives and getForgottenItems stay as
// placeholders — substitutes and "forgotten item" detection are later
// milestones, not this one.
export interface RecommendationService {
  getUsuals(currentListProductIds?: Set<string>): Promise<Recommendation[]>;
  getReplenishmentReminders(currentListProductIds?: Set<string>): Promise<Recommendation[]>;
  getSeasonalPicks(currentListProductIds?: Set<string>): Promise<Recommendation[]>;
  getAlternatives(productId: string): Promise<Recommendation[]>;
  getForgottenItems(): Promise<Recommendation[]>;
}

export const recommendationService: RecommendationService = {
  async getUsuals(currentListProductIds = new Set()) {
    const realHistory = getPurchaseHistory();
    const history = realHistory.length === 0 ? buildSeedPurchaseHistory() : realHistory;
    return getFrequentlyPurchased(history, currentListProductIds);
  },
  async getReplenishmentReminders(currentListProductIds = new Set()) {
    const realHistory = getPurchaseHistory();
    const history = realHistory.length === 0 ? buildSeedPurchaseHistory() : realHistory;
    return getReplenishmentSuggestions(history, currentListProductIds);
  },
  async getSeasonalPicks(currentListProductIds = new Set()) {
    return getSeasonalRecommendations(currentListProductIds);
  },
  async getAlternatives(productId: string): Promise<Recommendation[]> {
    const targetProduct = getProductById(productId);
    if (!targetProduct) return [];

    const explicitSubstitutes: Record<string, string[]> = {
      'amul-milk-500ml': ['almond-milk-1l'],
      'almond-milk-1l': ['amul-milk-500ml'],
      'brown-bread-400g': ['whole-wheat-bread-400g'],
      'whole-wheat-bread-400g': ['brown-bread-400g'],
      'apples-1kg': ['organic-apples-1kg'],
      'organic-apples-1kg': ['apples-1kg'],
      'colgate-toothpaste-150g': ['sensodyne-toothpaste-100g'],
      'sensodyne-toothpaste-100g': ['colgate-toothpaste-150g'],
    };

    const substituteIds = explicitSubstitutes[productId] ?? [];
    const recommendations: Recommendation[] = [];

    for (const subId of substituteIds) {
      const subProduct = getProductById(subId);
      if (subProduct) {
        recommendations.push({
          id: `alt-${productId}-${subId}`,
          type: 'alternative',
          product: subProduct,
          reason: `Alternative option for ${targetProduct.name}`,
        });
      }
    }

    // Fallback to same-category products if no explicit substitute found
    if (recommendations.length === 0) {
      const sameCategory = products.filter(
        (p) => p.category === targetProduct.category && p.id !== targetProduct.id,
      );
      for (const catProduct of sameCategory.slice(0, 2)) {
        recommendations.push({
          id: `alt-${productId}-${catProduct.id}`,
          type: 'alternative',
          product: catProduct,
          reason: `Similar item in ${targetProduct.category}`,
        });
      }
    }

    return recommendations;
  },
  async getForgottenItems(): Promise<Recommendation[]> {
    const realHistory = getPurchaseHistory();
    const history = realHistory.length === 0 ? buildSeedPurchaseHistory() : realHistory;
    return getReplenishmentSuggestions(history, new Set());
  },
};
