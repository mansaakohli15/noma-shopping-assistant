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
    <div className="pb-12">
      {/* Hero Header with fresh gradient accent */}
      <section className="relative overflow-hidden border-b border-line/60 bg-gradient-to-b from-cream-soft/80 via-cream to-cream px-5 pb-10 pt-10 text-center md:px-10 md:pt-14">
        <div className="mx-auto max-w-xl">
          <span className="num inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
            <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
            NOMA Voice Companion
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            What do you need today?
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-ink-soft">
            Speak naturally in English, Hindi or Hinglish. I&apos;ll keep track of the rest.
          </p>

          <MicControl />

          <div className="mx-auto mt-2 max-w-md">
            <p className="num mb-2 text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
              Try saying
            </p>
            <div className="flex justify-center">
              <TrySayingChips />
            </div>
          </div>
        </div>
      </section>

      {/* Your usuals */}
      {recommendations.usuals.length > 0 && (
        <section className="px-5 pt-8 md:px-10">
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
        <section className="px-5 pt-8 md:px-10">
          <SectionHeader eyebrow="Based on your shopping rhythm" title="You may need this" />
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
        <section className="px-5 pt-8 md:px-10">
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
      <section className="px-5 pt-8 md:px-10">
        <SectionHeader eyebrow="Live Voice log" title="Recent activity" />
        <div className="mt-3">
          <RecentActivityList activity={voiceActivity} />
        </div>
      </section>

      <Toast message={message} />
    </div>
  );
}
