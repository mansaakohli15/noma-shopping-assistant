import type { Product } from '../types';
import { products } from '../data/products';
import { tokenize, singularizeWord } from '../lib/textNormalize';

export interface ProductSearchFilters {
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  organic?: boolean;
  inStockOnly?: boolean;
  attributes?: string[]; // matched against product.tags, e.g. "dairy-free"
}

export interface ProductService {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  search(query: string, filters?: ProductSearchFilters): Promise<Product[]>;
}

function matchesFilters(product: Product, filters: ProductSearchFilters): boolean {
  if (filters.brand && product.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
  if (filters.category && product.category !== filters.category) return false;
  if (filters.minPrice !== undefined && product.priceInr < filters.minPrice) return false;
  if (filters.maxPrice !== undefined && product.priceInr > filters.maxPrice) return false;
  if (filters.organic && !product.organic) return false;
  if (filters.inStockOnly && !product.inStock) return false;

  if (filters.attributes && filters.attributes.length > 0) {
    const tags = product.tags.map((tag) => tag.toLowerCase());
    const hasEveryAttribute = filters.attributes.every((attribute) =>
      tags.includes(attribute.toLowerCase()),
    );
    if (!hasEveryAttribute) return false;
  }

  return true;
}

// Counts overlap between the search words and everything searchable about
// a product — its name, brand, tags, and aliases (e.g. "doodh" for Milk) —
// so both "healthy breakfast options" (via a tag) and "doodh" (via an
// alias) can surface the right product even without a name match.
function textScore(product: Product, queryWords: string[]): number {
  if (queryWords.length === 0) return 1;

  const searchableTokens = [
    ...tokenize(product.name),
    ...tokenize(product.brand),
    ...product.tags.flatMap((tag) => tokenize(tag)),
    ...(product.aliases ?? []).flatMap((alias) => tokenize(alias)),
  ].map(singularizeWord);

  return queryWords.filter((word) => searchableTokens.includes(word)).length;
}

// Category/brand/attributes/organic identify WHAT the person is looking
// for, so a real match on one of those shouldn't be excluded just because
// leftover free text (often just filler words) doesn't also score. Price
// is a constraint, not an identity — "bread below ₹100" should still only
// return bread, not everything under ₹100.
function hasIdentityFilter(filters: ProductSearchFilters): boolean {
  return Boolean(
    filters.brand || filters.category || filters.organic || (filters.attributes && filters.attributes.length > 0),
  );
}

export const productService: ProductService = {
  async getAll() {
    return products;
  },

  async getById(id) {
    return products.find((product) => product.id === id);
  },

  async search(query, filters = {}) {
    const queryWords = tokenize(query).map(singularizeWord);
    const identityFilter = hasIdentityFilter(filters);

    return products
      .filter((product) => matchesFilters(product, filters))
      .map((product) => ({ product, score: textScore(product, queryWords) }))
      .filter(({ score }) => queryWords.length === 0 || score > 0 || identityFilter)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);
  },
};
