import { useState, useEffect } from 'react';
import type { ShoppingItem } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface ShoppingModeModalProps {
  items: ShoppingItem[];
  isOpen: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
}

export function ShoppingModeModal({ items, isOpen, onClose, onToggle }: ShoppingModeModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { status, transcript, start } = useSpeechRecognition();

  const isListening = status === 'listening';

  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  // Reset index when items or modal visibility changes
  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(items.length - 1);
    }
  }, [items.length, currentIndex]);

  // Handle voice transcript updates
  useEffect(() => {
    if (!transcript) return;
    const lower = transcript.toLowerCase();
    if (!items[currentIndex]) return;

    const currentItem = items[currentIndex];

    if (lower.includes('got it') || lower.includes('done') || lower.includes('check')) {
      if (!currentItem.checked) {
        onToggle(currentItem.id);
      }
    } else if (lower.includes('next')) {
      if (currentIndex < items.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    } else if (lower.includes('previous') || lower.includes('back')) {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
  }, [transcript, currentIndex, items, onToggle]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];
  const completedCount = items.filter((item) => item.checked).length;
  const isCurrentChecked = currentItem.checked;

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleMarkCurrent = () => {
    onToggle(currentItem.id);
    if (!currentItem.checked && currentIndex < items.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream p-5 md:p-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="num text-xs font-semibold uppercase tracking-[0.18em] text-coral">
            Shopping Mode 🛒
          </span>
          <p className="text-sm font-medium text-ink">
            {completedCount} / {items.length} completed
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-cream-soft px-4 py-2 text-xs font-semibold text-ink border border-line transition-transform hover:scale-105 active:scale-95"
        >
          Exit Mode ✕
        </button>
      </div>

      {/* Main Focus Card */}
      <div className="my-auto flex flex-col items-center justify-center text-center">
        <span className="num mb-3 rounded-full bg-forest/10 px-3.5 py-1 text-xs font-semibold text-forest uppercase tracking-wider">
          Item {currentIndex + 1} of {items.length} · {currentItem.product.category}
        </span>

        {/* Big Product Image */}
        <div className="relative mb-4 flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-line/60 bg-cream-soft shadow-md md:h-44 md:w-44">
          {currentItem.product.imageUrl && !imageError ? (
            <img
              src={currentItem.product.imageUrl}
              alt={currentItem.product.name}
              onError={() => setImageError(true)}
              className={`h-full w-full object-cover transition-opacity ${isCurrentChecked ? 'opacity-40' : 'opacity-100'}`}
            />
          ) : (
            <span className="font-display text-4xl font-bold text-forest/40">
              {currentItem.product.name.charAt(0)}
            </span>
          )}
        </div>

        <h2
          className={`font-display text-3xl font-bold tracking-tight text-ink md:text-4xl ${
            isCurrentChecked ? 'line-through opacity-40' : ''
          }`}
        >
          {currentItem.product.name}
        </h2>

        <p className="mt-2 text-xl font-semibold text-ink-soft">
          {currentItem.quantity} {currentItem.unit}
        </p>

        {currentItem.product.brand && (
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-ink-soft/70">
            Brand: {currentItem.product.brand} · ₹{currentItem.product.priceInr}
          </p>
        )}

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleMarkCurrent}
          className={`mt-6 flex h-20 w-full max-w-xs items-center justify-center rounded-2xl text-xl font-bold text-cream transition-all hover:scale-105 active:scale-95 shadow-md ${
            isCurrentChecked ? 'bg-ink-soft/60' : 'bg-forest hover:bg-forest/90'
          }`}
        >
          {isCurrentChecked ? '✓ Completed' : 'GOT IT ✓'}
        </button>

        {/* Voice Trigger Indicator */}
        <button
          type="button"
          onClick={start}
          className="mt-5 flex items-center gap-2 rounded-full border border-line bg-cream-soft px-4 py-2 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${isListening ? 'animate-ping bg-coral' : 'bg-forest'}`} />
          {isListening ? 'Listening... say "Got it" or "Next"' : '🎙 Tap to speak in Shopping Mode'}
        </button>

        {transcript && (
          <p className="mt-2 text-xs text-ink-soft">
            Heard: &ldquo;{transcript}&rdquo;
          </p>
        )}
      </div>

      {/* Bottom Step Controls */}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="rounded-full border border-line bg-cream-soft px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-30 transition-transform active:scale-95"
        >
          ← Previous
        </button>

        <div className="flex gap-1.5">
          {items.map((item, idx) => (
            <span
              key={item.id}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-forest'
                  : item.checked
                    ? 'w-2.5 bg-coral/50'
                    : 'w-2.5 bg-line'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={currentIndex === items.length - 1}
          onClick={handleNext}
          className="rounded-full border border-line bg-cream-soft px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-30 transition-transform active:scale-95"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
