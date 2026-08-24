import { useMemo } from 'react';
import { MicControl } from '../components/voice/MicControl';
import { TrySayingChips } from '../components/voice/TrySayingChips';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Toast } from '../components/ui/Toast';
import { ProductCard } from '../components/products/ProductCard';
import { ProductRail } from '../components/products/ProductRail';
import { ReplenishmentCard } from '../components/recommendations/ReplenishmentCard';
import { RecentActivityList } from '../components/recommendations/RecentActivityList';
import { useShoppingList } from '../hooks/useShoppingList';
import { useToast } from '../hooks/useToast';
import type { Product, Recommendation } from '../types';
import { getHomeRecommendations } from '../services/recommendationService';
import { useVoiceActivity } from '../lib/voiceActivityStore';

const categoryShortcuts = [
  { label: 'All Aisles', icon: '🛒' },
  { label: 'Produce', icon: '🥗' },
  { label: 'Dairy', icon: '🥛' },
  { label: 'Bakery', icon: '🍞' },
  { label: 'Personal Care', icon: '🪥' },
  { label: 'Pantry', icon: '🌾' },
  { label: 'Beverages', icon: '🧃' },
];

export function HomePage() {
  const { items, addProduct } = useShoppingList();
  const { message, show } = useToast();
  const voiceActivity = useVoiceActivity();

  // Recomputed whenever the list changes
  const recommendations = useMemo(() => getHomeRecommendations(items), [items]);

  const handleAddProduct = (product: Product) => {
    addProduct(product);
    show(`Added ${product.name} to your list`);
  };

  const handleAddRecommendation = (recommendation: Recommendation) => {
    addProduct(recommendation.product);
    show(`Added ${recommendation.product.name} to your list`);
  };

  return (
    <div className="pb-16 px-4 md:px-8 pt-6">
      {/* Behance-Inspired Hero Voice Assistant Banner */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-emerald-100/80 bg-white p-6 shadow-sm md:p-10 text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-50/60 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-50/60 pointer-events-none" />

        <div className="relative z-10">
          <span className="num inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            NOMA Voice Shopping Assistant
          </span>

          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
            What do you need today?
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
            Speak naturally in English, Hindi, or Hinglish. I&apos;ll organize your shopping list.
          </p>

          <div className="my-2">
            <MicControl />
          </div>

          <div className="mx-auto max-w-md border-t border-slate-100 pt-4">
            <p className="num mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Try saying
            </p>
            <div className="flex justify-center">
              <TrySayingChips />
            </div>
          </div>
        </div>
      </section>

      {/* Category Shortcut Pills */}
      <section className="mx-auto max-w-4xl pt-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryShortcuts.map((cat, idx) => (
            <button
              key={cat.label}
              type="button"
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                idx === 0
                  ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Your usuals */}
      {recommendations.usuals.length > 0 && (
        <section className="mx-auto max-w-4xl pt-8">
          <SectionHeader eyebrow="You buy these often" title="Your usuals" />
          <div className="mt-4">
            <ProductRail>
              {recommendations.usuals.map((rec) => (
                <ProductCard
                  key={rec.id}
                  product={rec.product}
                  tag={{ label: 'Usual', tone: 'forest' }}
                  note={rec.reason}
                  onAdd={handleAddProduct}
                />
              ))}
            </ProductRail>
          </div>
        </section>
      )}

      {/* You may need this */}
      {recommendations.replenishment.length > 0 && (
        <section className="mx-auto max-w-4xl pt-8">
          <SectionHeader eyebrow="Based on your restock rhythm" title="You may need this" />
          <div className="mt-4 flex flex-col gap-3">
            {recommendations.replenishment.map((rec) => (
              <ReplenishmentCard
                key={rec.id}
                recommendation={rec}
                onAdd={handleAddRecommendation}
              />
            ))}
          </div>
        </section>
      )}

      {/* Seasonal now */}
      {recommendations.seasonal.length > 0 && (
        <section className="mx-auto max-w-4xl pt-8">
          <SectionHeader eyebrow="Good picks this month" title="Seasonal now" />
          <div className="mt-4">
            <ProductRail>
              {recommendations.seasonal.map((rec) => (
                <ProductCard
                  key={rec.id}
                  product={rec.product}
                  tag={{ label: 'Seasonal', tone: 'mustard' }}
                  onAdd={handleAddProduct}
                />
              ))}
            </ProductRail>
          </div>
        </section>
      )}

      {/* Live Recent activity */}
      <section className="mx-auto max-w-4xl pt-8">
        <SectionHeader eyebrow="Live activity log" title="Recent activity" />
        <div className="mt-3">
          <RecentActivityList activity={voiceActivity} />
        </div>
      </section>

      <Toast message={message} />
    </div>
  );
}
