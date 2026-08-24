import type { Product } from '../types';
import { products } from '../data/products';
import { tokenize, singularizeWord } from './textNormalize';

// Scores each product by how many spoken words overlap with its name or
// aliases (e.g. "doodh" for Milk), then picks the best match. This is what
// lets "organic apples" correctly beat plain "apples" without any
// special-cased organic logic — it just has one more matching word. Ties
// go to whichever product is listed first.
export function findMatchingProduct(spokenItem: string): Product | undefined {
  const queryWords = tokenize(spokenItem).map(singularizeWord);
  if (queryWords.length === 0) return undefined;

  let bestProduct: Product | undefined;
  let bestScore = 0;

  for (const product of products) {
    const nameTokens = [
      ...tokenize(product.name),
      ...(product.aliases ?? []).flatMap((alias) => tokenize(alias)),
    ].map(singularizeWord);
    const score = queryWords.filter((word) => nameTokens.includes(word)).length;
    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestProduct;
}

let customProductCount = 0;

// Used when a spoken item isn't in the catalog at all — rather than
// crashing or silently dropping the command, it becomes a basic list
// item with sensible defaults instead of fabricated product details.
export function createCustomProduct(spokenItem: string): Product {
  customProductCount += 1;

  const name = spokenItem
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: `custom-${spokenItem.replace(/\s+/g, '-')}-${customProductCount}`,
    name,
    brand: 'Added by you',
    category: 'Pantry',
    size: '—',
    priceInr: 0,
    tags: [],
    organic: false,
    inStock: true,
  };
}
