// Maps a product id to the unit NOMA uses when it's added without one
// being specified explicitly (e.g. tapping "+" on a product card).

export const defaultUnits: Record<string, string> = {
  'amul-milk-500ml': 'bottle',
  'almond-milk-1l': 'bottle',
  'brown-bread-400g': 'loaf',
  'whole-wheat-bread-400g': 'loaf',
  'apples-1kg': 'pieces',
  'organic-apples-1kg': 'pieces',
  'bananas-dozen': 'pieces',
  'eggs-6pack': 'pieces',
  'colgate-toothpaste-150g': 'tube',
  'sensodyne-toothpaste-100g': 'tube',
  'rice-basmati-5kg': 'bag',
  'oats-1kg': 'pack',
  'coconut-water-1l': 'bottle',
  'mangoes-1kg': 'pieces',
  'watermelon-1pc': 'piece',
};

export function defaultUnitFor(productId: string): string {
  return defaultUnits[productId] ?? 'unit';
}
