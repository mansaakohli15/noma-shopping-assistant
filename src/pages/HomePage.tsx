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
  { icon: '🎙️', label: 'Voice-first', sub: 'Speak in English, Hindi, or Hinglish' },
  { icon: '🔁', label: 'Smart restocks', sub: 'Knows your household rhythms' },
  { icon: '⚡', label: 'Instant lists', sub: 'Items added the moment you speak' },
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
      <section className="relative overflow-hidden px-6 pb-10 pt-10 md:px-10 md:pt-12">
        {/* Subtle background blobs */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #c99a2e33 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-16 h-56 w-56 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1f3d2b22 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-2xl text-center">
          {/* Greeting eyebrow */}
          <span className="num inline-block text-xs font-medium uppercase tracking-[0.2em] text-coral">
            {greeting}
          </span>

          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.1] text-ink md:text-5xl">
            What do you need
            <br />
            <span className="italic text-forest">today?</span>
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            Speak naturally — your list updates the moment you&apos;re done talking.
          </p>

          {/* Mic */}
          <div className="mt-2">
            <MicControl />
          </div>

          {/* Try saying chips */}
          <div className="mt-1">
            <p className="num mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft/60">
              Try saying
            </p>
            <TrySayingChips />
          </div>
        </div>
      </section>

      {/* ── Feature strip ────────────────────────────────────── */}
      <section className="border-y border-line/60 bg-cream-deep px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:divide-x sm:divide-line/60">
          {features.map((f) => (
            <div key={f.label} className="flex flex-1 items-center gap-3 sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{f.label}</p>
                <p className="text-xs text-ink-soft">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Your usuals ──────────────────────────────────────── */}
      {recommendations.usuals.length > 0 && (
        <section className="px-6 pt-10 md:px-10">
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

      {/* ── Replenishment ────────────────────────────────────── */}
      {recommendations.replenishment.length > 0 && (
        <section className="px-6 pt-10 md:px-10">
          <SectionHeader eyebrow="Based on your shopping rhythm" title="You may need this" />
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

      {/* ── Recent voice activity ────────────────────────────── */}
      <section className="px-6 pt-10 md:px-10">
        <SectionHeader eyebrow="Voice history" title="Recent activity" />
        <div className="mt-3">
          <RecentActivityList activity={voiceActivity} />
        </div>
      </section>

      <Toast message={message} />
    </div>
  );
}
