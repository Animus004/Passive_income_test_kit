/**
 * Stylized Subtitle Generator (Phase 2)
 * Generates an Advanced SubStation Alpha (.ass) subtitle file from dialogue_manifest.json
 * Features:
 * - Color-coded speaker tags:
 *   * Human: Crisp White (#FFFFFF)
 *   * Gemini: Antigravity Electric Blue (#38BDF8)
 *   * Claude: Coral Amber (#FB923C)
 * - Modern Shorts aesthetic: Bold sans-serif font, heavy drop outline, semi-transparent backing box
 */

import fs from 'fs';
import path from 'path';

function formatAssTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

export function generateAssSubtitles(manifest, outputPath) {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: MinimalSubtitle,Arial,22,&H00FFFFFF,&H000000FF,&H00111111,&H60000000,-1,0,0,0,100,100,0.5,0,1,1.2,0.4,2,60,60,75,1
Style: GeminiSubtitle,Arial,22,&H00F8BD38,&H000000FF,&H00111111,&H60000000,-1,0,0,0,100,100,0.5,0,1,1.2,0.4,2,60,60,75,1
Style: ClaudeSubtitle,Arial,22,&H004CA0F8,&H000000FF,&H00111111,&H60000000,-1,0,0,0,100,100,0.5,0,1,1.2,0.4,2,60,60,75,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = "";
  for (const line of manifest.lines) {
    const isGemini = line.speaker === "Gemini" || line.speaker === "Popapus";
    const styleName = isGemini ? "GeminiSubtitle" : (line.speaker === "Claude" ? "ClaudeSubtitle" : "MinimalSubtitle");
    
    // Split line into snappy 3-4 word micro-phrases (ultra-minimal, unobtrusive)
    const rawWords = line.text.trim().split(/\s+/);
    const wordsPerChunk = 4;
    const numChunks = Math.ceil(rawWords.length / wordsPerChunk);
    const lineDuration = line.endSec - line.startSec;
    const chunkDuration = lineDuration / numChunks;

    for (let c = 0; c < numChunks; c++) {
      const chunkWords = rawWords.slice(c * wordsPerChunk, (c + 1) * wordsPerChunk).join(' ');
      const chunkStart = line.startSec + (c * chunkDuration);
      const chunkEnd = c === numChunks - 1 ? line.endSec : line.startSec + ((c + 1) * chunkDuration);
      
      const startStr = formatAssTime(chunkStart);
      const endStr = formatAssTime(chunkEnd);
      
      events += `Dialogue: 0,${startStr},${endStr},${styleName},,0,0,0,,${chunkWords}\n`;
    }
  }

  const fullAss = header + events;
  fs.writeFileSync(outputPath, fullAss, 'utf-8');
  console.log(`📝 Generated minimal, uncluttered subtitles: ${outputPath}`);
  return outputPath;
}

