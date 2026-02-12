const fs = require('fs');
const path = require('path');

const lexiquePath = path.join(__dirname, 'src/data/Lexique383.tsv');
const outputPath = path.join(__dirname, 'src/data/words.json');

// Read the TSV file
const fileContent = fs.readFileSync(lexiquePath, 'utf-8');
const lines = fileContent.split('\n');

// Lexique383 columns (based on documentation, usually):
// 0: ortho (word)
// 1: phon
// 2: lemme
// 3: cgram (grammatical category)
// 4: genre
// 5: nombre
// 6: freqlemfilms2 (frequency in films - good for common usage)
// ...

const nouns = [];

// Skip header
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const columns = line.split('\t');
  const word = columns[0];
  const cgram = columns[3];
  const genre = columns[4];
  const nombre = columns[5];
  const freq = parseFloat(columns[6]); // freqlemfilms2 is often a good proxy for common speech

  // Filter for nouns (NOM)
  // Filter for singular (s) or invariant (empty or i depending on DB, usually s/p)
  // Lexique383: s=singulier, p=pluriel
  if (cgram === 'NOM' && (nombre === 's' || nombre === '') && word.length > 2 && /^[a-zàâçéèêëîïôûùüÿñæoe]+$/.test(word)) {
    nouns.push({ word, freq });
  }
}

// Sort by frequency (descending)
nouns.sort((a, b) => b.freq - a.freq);

// Take top 10000 unique words
const uniqueNouns = new Set();
const finalList = [];

for (const item of nouns) {
  if (finalList.length >= 10000) break;
  if (!uniqueNouns.has(item.word)) {
    uniqueNouns.add(item.word);
    // Capitalize first letter for display
    finalList.push(item.word.charAt(0).toUpperCase() + item.word.slice(1));
  }
}

// Write to JSON
fs.writeFileSync(outputPath, JSON.stringify(finalList, null, 2));

console.log(`Generated ${finalList.length} nouns.`);
