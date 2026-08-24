// Core domain types for NOMA.
// Kept minimal for the foundation phase — extended as each feature is built.

export type ProductCategory =
  | 'Produce'
  | 'Dairy'
  | 'Bakery'
  | 'Beverages'
  | 'Snacks'
  | 'Pantry'
  | 'Personal Care'
  | 'Household';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  size: string;
  priceInr: number;
  tags: string[];
  organic: boolean;
  inStock: boolean;
  imageUrl?: string;
  aliases?: string[]; // alternate names, e.g. Hindi/Hinglish ("doodh" for milk)
}

export interface ShoppingItem {
  id: string;
  product: Product;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  items: ShoppingItem[];
  updatedAt: string;
}

export type VoiceCommandIntent =
  | 'add_item'
  | 'remove_item'
  | 'update_quantity'
  | 'search_product'
  | 'unknown';

export interface VoiceCommand {
  id: string;
  transcript: string;
  intent: VoiceCommandIntent;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
}

export type RecommendationType =
  | 'replenishment'
  | 'usual'
  | 'seasonal'
  | 'alternative'
  | 'forgotten_item';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  product: Product;
  reason: string;
}

export interface UserPreference {
  language: string;
  simplifiedShoppingMode: boolean;
  preferredBrands: string[];
  dietaryTags: string[];
}
