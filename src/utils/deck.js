import CELEBRITIES from '../data/celebrities.json';
import WORDS from '../data/words.json';

export const generateDeck = (mode = 'celebrities', count = 40) => {
  const sourceList = mode === 'words' ? WORDS : CELEBRITIES;
  // Ensure we don't request more cards than available
  const safeCount = Math.min(count, sourceList.length);
  
  const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, safeCount).map((name, index) => ({
    id: index,
    word: name,
    guessed: false,
  }));
};
