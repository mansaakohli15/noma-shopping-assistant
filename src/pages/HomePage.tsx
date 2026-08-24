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
    <div className="pb-20 px-4 md:px-8 pt-6">
      {/* ── Elevated Hero Section ────────────────────────────── */}
      <section className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs md:p-10 text-center">
        {/* Subtle decorative radial accent */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10b98133 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #05966922 0%, transparent 70%)' }}
        />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/60 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            NOMA Voice Shopping Assistant
          </span>

          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            What do you need today?
          </h1>

          <p className="mx-auto mt-2.5 max-w-md text-sm font-medium text-slate-500">
            Speak naturally in English, Hindi, or Hinglish. Your shopping list updates in real time.
          </p>

          {/* Microphone interaction */}
          <div className="my-2">
            <MicControl />
          </div>

          {/* Suggestion Chips */}
          <div className="mx-auto max-w-lg border-t border-slate-100 pt-4">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Try saying
            </p>
            <div className="flex justify-center">
              <TrySayingChips />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights Strip ────────────────────────── */}
      <section className="mx-auto max-w-4xl mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-slate-100">
          <div className="flex items-center gap-3 py-2 sm:py-0 sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 text-lg">
              🎙️
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Multilingual NLP</p>
              <p className="text-xs font-medium text-slate-500">English, Hindi & Hinglish</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2 sm:py-0 sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 text-lg">
              ⚡
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Instant Execution</p>
              <p className="text-xs font-medium text-slate-500">Local zero-latency parser</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2 sm:py-0 sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 text-lg">
              🔄
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Smart Restocks</p>
              <p className="text-xs font-medium text-slate-500">Learns household cycles</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Your usuals ──────────────────────────────────────── */}
      {recommendations.usuals.length > 0 && (
        <section className="mx-auto max-w-4xl pt-10">
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
        <section className="mx-auto max-w-4xl pt-10">
          <SectionHeader eyebrow="Predictive Restock" title="You may need this" />
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

      {/* ── Seasonal ─────────────────────────────────────────── */}
      {recommendations.seasonal.length > 0 && (
        <section className="mx-auto max-w-4xl pt-10">
          <SectionHeader eyebrow="In Season Now" title="Seasonal picks" />
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

      {/* ── Recent Activity ──────────────────────────────────── */}
      <section className="mx-auto max-w-4xl pt-10">
        <SectionHeader eyebrow="Voice Log" title="Recent activity" />
        <div className="mt-3">
          <RecentActivityList activity={voiceActivity} />
        </div>
      </section>

      <Toast message={message} />
    </div>
  );
}
