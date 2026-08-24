// Deliberately small — enough for common shopping phrases, not a Hindi
// dictionary. Transliterations cover the most common spellings; Devanagari
// entries cover the required Hindi-script examples.

export const hindiNumberWords: Record<string, number> = {
  ek: 1,
  do: 2,
  teen: 3,
  tin: 3,
  char: 4,
  chaar: 4,
  paanch: 5,
  panch: 5,
  che: 6,
  chhe: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  एक: 1,
  दो: 2,
  तीन: 3,
  चार: 4,
  पांच: 5,
  पाँच: 5,
  छह: 6,
  सात: 7,
  आठ: 8,
  नौ: 9,
  दस: 10,
};

// Maps a spoken Hindi/Hinglish unit word to the English unit word the
// existing commandParser already recognizes (see its own unitWords map).
export const unitAliases: Record<string, string> = {
  पैकेट: 'packet',
  बोतल: 'bottle',
  डिब्बा: 'box',
};

// Maps a spoken Hindi/Hinglish product word to its canonical English name
// in the catalog. Deliberately covers only the products this assignment's
// examples use — not the whole catalog, and not a translation engine.
export const productAliases: Record<string, string> = {
  doodh: 'milk',
  दूध: 'milk',
  seb: 'apple',
  सेब: 'apple',
  kela: 'banana',
  kele: 'banana',
  केला: 'banana',
  केले: 'banana',
  anda: 'egg',
  ande: 'egg',
  अंडा: 'egg',
  अंडे: 'egg',
  ब्रेड: 'bread',
};
