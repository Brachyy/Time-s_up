import CELEBRITIES from '../data/celebrities.json';
import WORDS from '../data/words.json';
import THEMES from '../data/themes.json';

export const generateDeck = (mode = 'celebrities', count = 40) => {
  let sourceList = [];

  if (mode === 'celebrities') {
    sourceList = CELEBRITIES;
  } else if (mode === 'words') {
    sourceList = WORDS;
  } else if (THEMES[mode]) {
    sourceList = THEMES[mode];
  } else if (mode === 'mixed') {
    // Combine all lists, including celebrities, generic words, and theme-specific lists
    sourceList = [
      ...CELEBRITIES,
      ...WORDS,
      ...THEMES.objects,
      ...THEMES.animals,
      ...THEMES.movies,
      ...THEMES.jobs,
      ...THEMES.sports
    ];
  } else {
    sourceList = WORDS; // Fallback
  }

  // Shuffle and deduplicate items to ensure unique entries
  const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
  const uniqueList = Array.from(new Set(shuffled));
  
  // Ensure we don't request more cards than available
  const safeCount = Math.min(count, uniqueList.length);

  return uniqueList.slice(0, safeCount).map((name, index) => ({
    id: index,
    word: name,
    guessed: false,
  }));
};
