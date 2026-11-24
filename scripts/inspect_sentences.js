import fs from 'fs';

function extractSentences(file) {
  const words = JSON.parse(fs.readFileSync(file, 'utf8'));
  const sentences = [];
  let currentWords = [];
  let startIndex = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (currentWords.length === 0) startIndex = i;
    currentWords.push(w.word);

    if (/[.?!]$/.test(w.word) || i === words.length - 1) {
      sentences.push({
        index: sentences.length + 1,
        text: currentWords.join(' '),
        startSec: words[startIndex].start,
        endSec: w.end,
        startFrame: Math.round(words[startIndex].start * 30),
        endFrame: Math.round(w.end * 30),
        durationSec: +(w.end - words[startIndex].start).toFixed(2),
      });
      currentWords = [];
    }
  }
  return sentences;
}

console.log('=== ENGLISH SENTENCES ===');
console.log(JSON.stringify(extractSentences('public/subtitles_ep3_en.json'), null, 2));

console.log('=== HINDI SENTENCES ===');
console.log(JSON.stringify(extractSentences('public/subtitles_ep3_hi.json'), null, 2));
