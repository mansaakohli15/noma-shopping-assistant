// Maps calendar months (1 = January ... 12 = December) to product ids
// considered "in season" for a broad Indian grocery context. Deliberately
// simple and local — no external API, no invented products. Coverage is
// limited by how small the current catalog is; months with no seasonal
// catalog match just won't show a seasonal section, which is honest
// rather than padding it with items that aren't actually here.
export const seasonalProductsByMonth: Record<number, string[]> = {
  3: ['mangoes-1kg', 'watermelon-1pc'],
  4: ['mangoes-1kg', 'watermelon-1pc', 'coconut-water-1l'],
  5: ['mangoes-1kg', 'watermelon-1pc', 'coconut-water-1l'],
  6: ['mangoes-1kg', 'watermelon-1pc', 'coconut-water-1l'],
  7: ['watermelon-1pc', 'coconut-water-1l'],
  8: ['watermelon-1pc', 'coconut-water-1l'],
  9: ['coconut-water-1l'],
};
