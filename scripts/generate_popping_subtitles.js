import fs from 'fs';
import path from 'path';

const manifestPath = String.raw`D:\New folder (2)\scratch\autonomous_phase2\episode_manifest.json`;
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

function generatePoppingAss(manifest) {
  let ass = `[Script Info]
Title: ${manifest.title}
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: DevPop,Arial,25,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0.8,0,1,2.5,0,2,40,40,90,1
Style: GeminiPop,Arial,25,&H00FFF080,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0.8,0,1,2.5,0,2,40,40,90,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `0:${String(m).padStart(2, '0')}:${rem.toFixed(2).padStart(5, '0')}`;
  };

  for (const line of manifest.lines) {
    const isDev = ['dev', 'friend', 'developer'].includes(line.speaker.toLowerCase());
    const styleName = isDev ? 'DevPop' : 'GeminiPop';
    
    const lineStart = line.startFrame / 30.0;
    const lineEnd = line.endFrame / 30.0;
    const totalLineDuration = lineEnd - lineStart;

    // Split text into 2-4 word natural chunks
    const words = line.text.split(/\s+/);
    const chunks = [];
    let currentChunk = [];

    for (let i = 0; i < words.length; i++) {
      currentChunk.push(words[i]);
      const word = words[i];
      const isPunct = /[,.?!;:]$/.test(word);
      // Chunk size 3, or if punctuation reached and chunk >= 2, or end of words
      if (currentChunk.length >= 3 || (isPunct && currentChunk.length >= 2) || i === words.length - 1) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    // Allocate time to each chunk based on character length
    const totalChars = chunks.reduce((sum, c) => sum + c.length, 0);
    let currentStart = lineStart;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkWeight = chunk.length / totalChars;
      const chunkDuration = Math.max(0.7, totalLineDuration * chunkWeight);
      const chunkEnd = Math.min(lineEnd, currentStart + chunkDuration);

      // Pop in zoom tag: start 115% scale, settle to 100% in 120ms
      const popTag = `{\\t(0,60,\\fscx112\\fscy112)\\t(60,130,\\fscx100\\fscy100)}`;
      ass += `Dialogue: 0,${fmt(currentStart)},${fmt(chunkEnd)},${styleName},,0,0,90,,${popTag}${chunk}\n`;
      
      currentStart = chunkEnd;
    }
  }

  return ass;
}

const poppingAss = generatePoppingAss(manifest);
const outAssPath = path.join(String.raw`D:\New folder (2)\scratch\autonomous_phase2`, "subtitles_popping.ass");
fs.writeFileSync(outAssPath, poppingAss, 'utf-8');
console.log("Generated popping subtitles successfully!");
console.log(poppingAss);
