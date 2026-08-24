// Turns a typed or spoken search query into free text plus structured
// filters, deterministically — no AI involved. Brand and category lists
// are read from the catalog itself so they can't drift out of sync with it.

import type { ProductCategory } from '../types';
import type { ProductSearchFilters } from './productService';
import { products } from '../data/products';
import { escapeRegExp } from '../lib/textNormalize';

export interface ParsedSearchQuery {
  query: string;
  filters: ProductSearchFilters;
}

const leadingVerbs = /^(find|search for|look for|show me)\s+/i;
const underPricePattern = /(?:under|below|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i;
const overPricePattern = /(?:over|above|more than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i;

const knownBrands = [...new Set(products.map((product) => product.brand))];
const knownCategories = [...new Set(products.map((product) => product.category))] as ProductCategory[];
const allTags = [...new Set(products.flatMap((product) => product.tags))].filter((tag) => tag !== 'organic');

// Compound tags ("dairy-free", "plant-based", "whole grain") are checked
// before category/brand — otherwise a query like "dairy free milk" would
// match the single-word tag/category "dairy" first and never get the
// chance to recognize "dairy free" as one specific attribute. Single-word
// tags are checked last, after category and brand, so a bare category name
// like "dairy" is read as a category rather than a coincidental tag.
const compoundTags = allTags.filter((tag) => tag.includes('-') || tag.includes(' ')).sort((a, b) => b.length - a.length);
const singleWordTags = allTags.filter((tag) => !tag.includes('-') && !tag.includes(' '));

function removeMatch(text: string, phrase: string): string {
  const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'i');
  return text.replace(pattern, ' ');
}

function matchTags(text: string, filters: ProductSearchFilters, tags: string[]): string {
  let remaining = text;
  for (const tag of tags) {
    const spokenVariant = tag.replace(/-/g, ' ');
    if (
      new RegExp(`\\b${escapeRegExp(tag)}\\b`, 'i').test(remaining) ||
      new RegExp(`\\b${escapeRegExp(spokenVariant)}\\b`, 'i').test(remaining)
    ) {
      filters.attributes = [...(filters.attributes ?? []), tag];
      remaining = removeMatch(remaining, tag);
      remaining = removeMatch(remaining, spokenVariant);
    }
  }
  return remaining;
}

export function parseSearchQuery(rawQuery: string): ParsedSearchQuery {
  let text = rawQuery.trim().toLowerCase().replace(leadingVerbs, '');
  const filters: ProductSearchFilters = {};

  const underMatch = text.match(underPricePattern);
  if (underMatch) {
    filters.maxPrice = parseInt(underMatch[1], 10);
    text = text.replace(underMatch[0], ' ');
  }

  const overMatch = text.match(overPricePattern);
  if (overMatch) {
    filters.minPrice = parseInt(overMatch[1], 10);
    text = text.replace(overMatch[0], ' ');
  }

  if (/\borganic\b/i.test(text)) {
    filters.organic = true;
    text = removeMatch(text, 'organic');
  }

  text = matchTags(text, filters, compoundTags);

  for (const category of knownCategories) {
    if (new RegExp(`\\b${escapeRegExp(category)}\\b`, 'i').test(text)) {
      filters.category = category;
      text = removeMatch(text, category);
      break;
    }
  }

  for (const brand of knownBrands) {
    if (new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'i').test(text)) {
      filters.brand = brand;
      text = removeMatch(text, brand);
      break;
    }
  }

  text = matchTags(text, filters, singleWordTags);

  const query = text.replace(/\s+/g, ' ').trim();
  return { query, filters };
}
