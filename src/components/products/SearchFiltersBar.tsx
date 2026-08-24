import type { ProductCategory } from '../../types';
import { products } from '../../data/products';

export interface ManualFilters {
  category?: ProductCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  organic?: boolean;
}

interface SearchFiltersBarProps {
  filters: ManualFilters;
  onChange: (filters: ManualFilters) => void;
}

const categories = [...new Set(products.map((product) => product.category))] as ProductCategory[];
const brands = [...new Set(products.map((product) => product.brand))].sort();

function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function SearchFiltersBar({ filters, onChange }: SearchFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.category ?? ''}
        onChange={(event) =>
          onChange({ ...filters, category: (event.target.value || undefined) as ProductCategory | undefined })
        }
        className="rounded-full border border-line bg-cream-soft px-3 py-1.5 text-xs text-ink-soft"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={filters.brand ?? ''}
        onChange={(event) => onChange({ ...filters, brand: event.target.value || undefined })}
        className="rounded-full border border-line bg-cream-soft px-3 py-1.5 text-xs text-ink-soft"
      >
        <option value="">All brands</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      <input
        type="number"
        inputMode="numeric"
        placeholder="Min ₹"
        value={filters.minPrice ?? ''}
        onChange={(event) => onChange({ ...filters, minPrice: toOptionalNumber(event.target.value) })}
        className="num w-20 rounded-full border border-line bg-cream-soft px-3 py-1.5 text-xs text-ink-soft"
      />

      <input
        type="number"
        inputMode="numeric"
        placeholder="Max ₹"
        value={filters.maxPrice ?? ''}
        onChange={(event) => onChange({ ...filters, maxPrice: toOptionalNumber(event.target.value) })}
        className="num w-20 rounded-full border border-line bg-cream-soft px-3 py-1.5 text-xs text-ink-soft"
      />

      <label className="flex items-center gap-1.5 rounded-full border border-line bg-cream-soft px-3 py-1.5 text-xs text-ink-soft">
        <input
          type="checkbox"
          checked={filters.organic ?? false}
          onChange={(event) => onChange({ ...filters, organic: event.target.checked || undefined })}
          className="accent-forest"
        />
        Organic only
      </label>
    </div>
  );
}
