import fs from 'fs';

const subs = JSON.parse(fs.readFileSync('public/subtitles_molasses_en.json', 'utf8'));

let sentences = [];
let cur = [];
for (let i = 0; i < subs.length; i++) {
  const w = subs[i];
  cur.push(w);
  if (/[.?!]$/.test(w.word) || i === subs.length - 1) {
    const text = cur.map(x => x.word).join(' ');
    const start = cur[0].start;
    const end = cur[cur.length - 1].end;
    sentences.push({
      index: sentences.length + 1,
      text,
      start,
      end,
      startFrame: Math.round(start * 30),
      endFrame: Math.round(end * 30),
      durSec: +(end - start).toFixed(2),
      durFrames: Math.round((end - start) * 30)
    });
    cur = [];
  }
}

console.log(JSON.stringify(sentences, null, 2));
