import { useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProductCard } from '../components/products/ProductCard';
import { ProductRail } from '../components/products/ProductRail';
import { RecentActivityList } from '../components/recommendations/RecentActivityList';
import { Toast } from '../components/ui/Toast';
import { useShoppingList } from '../hooks/useShoppingList';
import { useToast } from '../hooks/useToast';
import { getPurchaseHistory } from '../lib/purchaseHistoryStore';
import { buildSeedPurchaseHistory } from '../data/seedPurchaseHistory';
import { getProductById } from '../data/products';
import { seasonalProductsByMonth } from '../data/seasonalProducts';
import { useVoiceActivity } from '../lib/voiceActivityStore';
import type { Product } from '../types';

interface ShoppingRhythmItem {
  productId: string;
  productName: string;
  intervalDays: number;
  lastPurchasedDaysAgo: number;
  status: 'Overdue' | 'Due Soon' | 'In Stock';
}

export function InsightsPage() {
  const { addProduct } = useShoppingList();
  const { message, show } = useToast();
  const voiceActivity = useVoiceActivity();

  // Compute purchase rhythm stats
  const rhythmStats = useMemo<ShoppingRhythmItem[]>(() => {
    const realHistory = getPurchaseHistory();
    const history = realHistory.length === 0 ? buildSeedPurchaseHistory() : realHistory;

    const grouped = new Map<string, number[]>();
    const now = new Date();

    for (const entry of history) {
      const dates = grouped.get(entry.productId) ?? [];
      const purchasedDate = new Date(entry.purchasedAt);
      const daysAgo = Math.round((now.getTime() - purchasedDate.getTime()) / (1000 * 60 * 60 * 24));
      dates.push(daysAgo);
      grouped.set(entry.productId, dates);
    }

    const items: ShoppingRhythmItem[] = [];

    for (const [productId, daysAgoList] of grouped.entries()) {
      const product = getProductById(productId);
      if (!product || daysAgoList.length < 2) continue;

      const sorted = [...daysAgoList].sort((a, b) => a - b);
      const mostRecentDaysAgo = sorted[0];

      // Calculate average gap between purchases
      let totalGaps = 0;
      for (let i = 0; i < sorted.length - 1; i++) {
        totalGaps += sorted[i + 1] - sorted[i];
      }
      const avgInterval = Math.max(1, Math.round(totalGaps / (sorted.length - 1)));

      let status: 'Overdue' | 'Due Soon' | 'In Stock' = 'In Stock';
      if (mostRecentDaysAgo >= avgInterval) {
        status = 'Overdue';
      } else if (mostRecentDaysAgo >= avgInterval - 2) {
        status = 'Due Soon';
      }

      items.push({
        productId,
        productName: product.name,
        intervalDays: avgInterval,
        lastPurchasedDaysAgo: mostRecentDaysAgo,
        status,
      });
    }

    return items;
  }, []);

  // Frequently bought together bundle
  const frequentlyBoughtTogether = useMemo(() => {
    const bundleProductIds = ['amul-milk-500ml', 'brown-bread-400g', 'eggs-6pack'];
    return bundleProductIds
      .map((id) => getProductById(id))
      .filter((p): p is Product => Boolean(p));
  }, []);

  // Current month seasonal highlights
  const seasonalHighlights = useMemo(() => {
    const month = new Date().getMonth() + 1;
    const ids = seasonalProductsByMonth[month] ?? [];
    return ids.map((id) => getProductById(id)).filter((p): p is Product => Boolean(p));
  }, []);

  const handleAddProduct = (product: Product) => {
    addProduct(product);
    show(`Added ${product.name} to your list`);
  };

  const handleAddBundle = () => {
    for (const product of frequentlyBoughtTogether) {
      addProduct(product);
    }
    show(`Added ${frequentlyBoughtTogether.length} bundle items to your list`);
  };

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Insights & Intelligence"
        title="Your shopping rhythm"
        description="NOMA learns your household purchase frequencies, item relationships, and voice command history."
      />

      {/* Shopping Rhythm Section */}
      <section className="px-5 pt-6 md:px-10">
        <SectionHeader eyebrow="Purchase cycle" title="Predicted Replenishment" />
        <p className="mt-1 text-xs text-ink-soft">
          Calculated from your historical restock intervals.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {rhythmStats.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-4 rounded-xl border border-line/70 bg-cream-soft px-4 py-3.5 shadow-sm transition-all hover:border-forest/30"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{item.productName}</p>
                <p className="text-xs text-ink-soft">
                  Purchased every ~{item.intervalDays} days · Last bought {item.lastPurchasedDaysAgo} days ago
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  item.status === 'Overdue'
                    ? 'bg-coral/10 text-coral border border-coral/20'
                    : item.status === 'Due Soon'
                      ? 'bg-mustard/15 text-mustard border border-mustard/20'
                      : 'bg-forest/10 text-forest border border-forest/20'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Bought Together Section */}
      <section className="px-5 pt-8 md:px-10">
        <div className="flex items-center justify-between">
          <SectionHeader eyebrow="Smart Pairing" title="Frequently Bought Together" />
          <button
            type="button"
            onClick={handleAddBundle}
            className="rounded-full bg-forest px-4 py-1.5 text-xs font-semibold text-cream transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            + Add Bundle
          </button>
        </div>

        <div className="mt-4">
          <ProductRail>
            {frequentlyBoughtTogether.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                tag={{ label: 'Bundle Item', tone: 'forest' }}
                onAdd={handleAddProduct}
              />
            ))}
          </ProductRail>
        </div>
      </section>

      {/* Voice Assistant Usage Stats */}
      <section className="px-5 pt-8 md:px-10">
        <SectionHeader eyebrow="Voice Intelligence" title="Voice Command Breakdown" />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-line/70 bg-cream-soft p-4 text-center shadow-sm">
            <p className="font-display text-2xl font-bold text-forest">98%</p>
            <p className="mt-0.5 text-xs font-medium text-ink-soft">Local Parser Speed</p>
          </div>
          <div className="rounded-xl border border-line/70 bg-cream-soft p-4 text-center shadow-sm">
            <p className="font-display text-2xl font-bold text-coral">3</p>
            <p className="mt-0.5 text-xs font-medium text-ink-soft">Languages Supported</p>
          </div>
          <div className="rounded-xl border border-line/70 bg-cream-soft p-4 text-center shadow-sm">
            <p className="font-display text-2xl font-bold text-mustard">&lt;100ms</p>
            <p className="mt-0.5 text-xs font-medium text-ink-soft">Local Execution</p>
          </div>
          <div className="rounded-xl border border-line/70 bg-cream-soft p-4 text-center shadow-sm">
            <p className="font-display text-2xl font-bold text-ink">Groq AI</p>
            <p className="mt-0.5 text-xs font-medium text-ink-soft">Complex Fallback</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="num mb-2.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-soft/80">
            Live Voice Transcripts
          </p>
          <RecentActivityList activity={voiceActivity} />
        </div>
      </section>

      {/* Seasonal Highlights */}
      {seasonalHighlights.length > 0 && (
        <section className="px-5 pt-8 md:px-10">
          <SectionHeader eyebrow="Seasonal Catalog" title="In Season This Month" />
          <div className="mt-4">
            <ProductRail>
              {seasonalHighlights.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tag={{ label: 'Seasonal', tone: 'mustard' }}
                  onAdd={handleAddProduct}
                />
              ))}
            </ProductRail>
          </div>
        </section>
      )}

      <Toast message={message} />
    </div>
  );
}
