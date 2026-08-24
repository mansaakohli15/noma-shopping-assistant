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

const greetingHour = new Date().getHours();
const greeting =
  greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

const features = [
  { icon: '🎙️', label: 'Multilingual Voice', sub: 'English, Hindi, and Hinglish' },
  { icon: '⚡', label: 'Instant Execution', sub: 'Real-time cart updates' },
  { icon: '🔄', label: 'Smart Replenishment', sub: 'Learns household restock cycles' },
];

export function HomePage() {
  const { items, addProduct } = useShoppingList();
  const { message, show } = useToast();
  const voiceActivity = useVoiceActivity();

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
    <div className="pb-16">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-8 pt-8 md:px-10 md:pt-10">
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-pale px-3 py-1 text-xs font-semibold text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-forest animate-pulse" />
            {greeting} · Voice Assistant
          </span>

          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            What do you need today?
          </h1>

          <p className="mx-auto mt-2.5 max-w-sm text-sm font-medium leading-relaxed text-ink-soft">
            Speak naturally in English or Hindi — your list updates in real time.
          </p>

          {/* Mic */}
          <div className="mt-1">
            <MicControl />
          </div>

          {/* Try saying chips */}
          <div className="mt-1">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft/60">
              Try saying
            </p>
            <TrySayingChips />
          </div>
        </div>
      </section>

      {/* ── Feature strip ────────────────────────────────────── */}
      <section className="border-y border-line/60 bg-cream-deep/60 px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:divide-x sm:divide-line/60">
          {features.map((f) => (
            <div key={f.label} className="flex flex-1 items-center gap-3 sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <span className="text-xl">{f.icon}</span>
              <div>
                <p className="text-sm font-bold text-ink">{f.label}</p>
                <p className="text-xs font-medium text-ink-soft">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Your usuals ──────────────────────────────────────── */}
      {recommendations.usuals.length > 0 && (
        <section className="px-6 pt-10 md:px-10">
          <SectionHeader eyebrow="Frequent Purchases" title="Your usuals" />
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

      {/* ── Replenishment ────────────────────────────────────── */}
      {recommendations.replenishment.length > 0 && (
        <section className="px-6 pt-10 md:px-10">
          <SectionHeader eyebrow="Predictive Restock" title="You may need this" />
          <div className="mt-4 flex flex-col gap-2.5">
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

      {/* ── Seasonal ─────────────────────────────────────────── */}
      {recommendations.seasonal.length > 0 && (
        <section className="px-6 pt-10 md:px-10">
          <SectionHeader eyebrow="Fresh In Season" title="Seasonal picks" />
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

      {/* ── Recent voice activity ────────────────────────────── */}
      <section className="px-6 pt-10 md:px-10">
        <SectionHeader eyebrow="Voice Activity" title="Recent commands" />
        <div className="mt-3">
          <RecentActivityList activity={voiceActivity} />
        </div>
      </section>

      <Toast message={message} />
    </div>
  );
}
