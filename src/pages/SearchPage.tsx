import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Product } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { ProductCard } from '../components/products/ProductCard';
import { SearchFiltersBar, type ManualFilters } from '../components/products/SearchFiltersBar';
import { SearchMicButton } from '../components/voice/SearchMicButton';
import { Toast } from '../components/ui/Toast';
import { useShoppingList } from '../hooks/useShoppingList';
import { useToast } from '../hooks/useToast';
import { parseSearchQuery } from '../services/searchParser';
import { productService, type ProductSearchFilters } from '../services/productService';
import { interpretSearchQuery } from '../services/aiService';

// Manual filters (from the dropdowns) win over whatever the text query
// happened to imply, for whichever fields the person actually touched.
function mergeFilters(base: ProductSearchFilters, manual: ManualFilters): ProductSearchFilters {
  return {
    ...base,
    category: manual.category ?? base.category,
    brand: manual.brand ?? base.brand,
    minPrice: manual.minPrice ?? base.minPrice,
    maxPrice: manual.maxPrice ?? base.maxPrice,
    organic: manual.organic ?? base.organic,
  };
}

export function SearchPage() {
  const [rawQuery, setRawQuery] = useState('');
  const [manualFilters, setManualFilters] = useState<ManualFilters>({});
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [usedAiFallback, setUsedAiFallback] = useState(false);

  const { addProduct } = useShoppingList();
  const { message, show } = useToast();

  const handleAdd = (product: Product) => {
    addProduct(product);
    show(`Added ${product.name} to your list`);
  };

  const handleVoiceResult = useCallback((transcript: string) => {
    setRawQuery(transcript);
  }, []);

  const parsed = useMemo(() => parseSearchQuery(rawQuery), [rawQuery]);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      const localFilters = mergeFilters(parsed.filters, manualFilters);
      let found = await productService.search(parsed.query, localFilters);
      let aiUsed = false;

      // Local parsing came up empty and there's something to work with —
      // try the optional AI fallback before giving up. It safely no-ops
      // if no backend is configured (see aiService.ts).
      if (found.length === 0 && rawQuery.trim()) {
        const aiIntent = await interpretSearchQuery(rawQuery);
        if (aiIntent) {
          const aiFilters = mergeFilters(
            {
              category: aiIntent.category ?? undefined,
              brand: aiIntent.brand ?? undefined,
              minPrice: aiIntent.minPrice ?? undefined,
              maxPrice: aiIntent.maxPrice ?? undefined,
              attributes: aiIntent.attributes.length > 0 ? aiIntent.attributes : undefined,
            },
            manualFilters,
          );
          found = await productService.search(aiIntent.query, aiFilters);
          aiUsed = found.length > 0;
        }
      }

      if (cancelled) return;
      setResults(found);
      setUsedAiFallback(aiUsed);

      if (found.length === 0) {
        const textOnly = await productService.search(parsed.query, {});
        if (cancelled) return;
        setSuggestions(textOnly.length > 0 ? textOnly.slice(0, 4) : (await productService.getAll()).slice(0, 4));
      } else {
        setSuggestions([]);
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [parsed, manualFilters, rawQuery]);

  const hasQuery = rawQuery.trim().length > 0 || Object.keys(manualFilters).length > 0;

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Search"
        title="Find something"
        description="By voice, or type it out."
      />

      <div className="px-5 pt-5 md:px-10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={rawQuery}
            onChange={(event) => setRawQuery(event.target.value)}
            placeholder='Try "organic apples under ₹200"'
            className="flex-1 rounded-full border border-line bg-cream-soft px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest/50"
          />
          <SearchMicButton onResult={handleVoiceResult} />
        </div>

        <div className="mt-3">
          <SearchFiltersBar filters={manualFilters} onChange={setManualFilters} />
        </div>

        {rawQuery && (
          <p className="mt-4 text-xs text-ink-soft">
            You said <span className="text-ink">&ldquo;{rawQuery}&rdquo;</span>
            {' · '}
            {results.length === 0
              ? 'No exact matches'
              : `Showing ${results.length} result${results.length === 1 ? '' : 's'}`}
            {usedAiFallback && ' · AI-assisted'}
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={handleAdd} />
            ))}
          </div>
        )}

        {hasQuery && results.length === 0 && (
          <div className="mt-6">
            <p className="text-sm text-ink-soft">No exact matches.</p>
            {suggestions.length > 0 && (
              <>
                <p className="num mt-4 text-[11px] uppercase tracking-[0.16em] text-ink-soft/70">
                  Try these instead
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  {suggestions.map((product) => (
                    <ProductCard key={product.id} product={product} onAdd={handleAdd} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {!hasQuery && (
          <p className="mt-10 text-center text-sm text-ink-soft">
            Search by typing or tap the mic to speak.
          </p>
        )}
      </div>

      <Toast message={message} />
    </div>
  );
}
