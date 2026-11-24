/**
 * Compositor for Meta Master Plan 3D Reference Recreation
 * Combines:
 * - 3D Render: blender_engine/renders/meta_reference_raw.mp4
 * - Voiceover: public/meta_audio.mp3
 * - Ambient sci-fi background track: public/ambient.mp3 (-24dB)
 * - Kinetic dynamic ASS subtitles with word-by-word Antigravity gold highlight
 * Output: out/meta_master_plan_final.mp4
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VIDEO_RAW = path.join(PROJECT_ROOT, 'blender_engine', 'renders', 'meta_reference_raw.mp4');
const AUDIO_VOICEOVER = path.join(PROJECT_ROOT, 'public', 'meta_audio.mp3');
const AUDIO_AMBIENT = path.join(PROJECT_ROOT, 'public', 'ambient.mp3');
const SUBTITLES_JSON = path.join(PROJECT_ROOT, 'public', 'meta_subtitles.json');
const ASS_OUTPUT = path.join(PROJECT_ROOT, 'public', 'meta_subtitles.ass');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const FINAL_OUTPUT = path.join(OUT_DIR, 'meta_master_plan_final.mp4');

function formatTimestamp(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

function buildAssSubtitles(words) {
  console.log(`📝 Generating Kinetic ASS Subtitles for ${words.length} spoken words...`);

  const header = `[Script Info]
Title: Meta Master Plan 3D Kinetic Captions
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: MetaDefault,Arial,60,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,1,5.0,2.0,2,80,80,320,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  // Group words into 3-word chunks
  const chunks = [];
  const CHUNK_SIZE = 3;
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    chunks.push(words.slice(i, i + CHUNK_SIZE));
  }

  const events = [];

  for (const chunk of chunks) {
    for (let activeIdx = 0; activeIdx < chunk.length; activeIdx++) {
      const activeWord = chunk[activeIdx];
      const startTime = formatTimestamp(activeWord.start);
      const nextWord = chunk[activeIdx + 1];
      const endTime = formatTimestamp(nextWord ? nextWord.start : activeWord.end);

      // Highlight active word in glowing cyan (&H00FFE500 BGR) or solar gold (&H0004BCFB BGR)
      const styledWords = chunk.map((w, idx) => {
        const cleanWord = w.word.toUpperCase();
        if (idx === activeIdx) {
          return `{\\c&H0004BCFB&\\b1\\fscx108\\fscy108}${cleanWord}{\\rMetaDefault}`;
        }
        return `{\\c&H00FFFFFF&\\b1}${cleanWord}{\\rMetaDefault}`;
      });

      events.push(`Dialogue: 0,${startTime},${endTime},MetaDefault,,0,0,0,,${styledWords.join(' ')}`);
    }
  }

  const assContent = header + events.join('\n') + '\n';
  fs.writeFileSync(ASS_OUTPUT, assContent, 'utf-8');
  console.log(`✅ ASS Subtitles Generated: ${ASS_OUTPUT} (${events.length} dynamic events)`);
}

function runFFmpegMux() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    if (!fs.existsSync(VIDEO_RAW)) {
      return reject(new Error(`Missing raw 3D video at ${VIDEO_RAW}`));
    }
    if (!fs.existsSync(AUDIO_VOICEOVER)) {
      return reject(new Error(`Missing voiceover at ${AUDIO_VOICEOVER}`));
    }

    const escapedAss = ASS_OUTPUT.replace(/\\/g, '/').replace(/:/g, '\\:');

    // Build FFmpeg command with ambient background audio mix
    const hasAmbient = fs.existsSync(AUDIO_AMBIENT);
    const ffmpegArgs = ['-y', '-i', VIDEO_RAW, '-i', AUDIO_VOICEOVER];

    let filterComplex = '';

    if (hasAmbient) {
      ffmpegArgs.push('-stream_loop', '-1', '-i', AUDIO_AMBIENT);
      // Voiceover normal level, ambient ducked to -24dB, mixed together
      filterComplex = `[0:v]subtitles='${escapedAss}'[v];[1:a]volume=1.0[a_voice];[2:a]volume=0.08[a_bg];[a_voice][a_bg]amix=inputs=2:duration=first[a]`;
    } else {
      filterComplex = `[0:v]subtitles='${escapedAss}'[v];[1:a]volume=1.0[a]`;
    }

    ffmpegArgs.push(
      '-filter_complex', filterComplex,
      '-map', '[v]',
      '-map', '[a]',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      FINAL_OUTPUT
    );

    console.log(`🎬 Running FFmpeg Composite to ${FINAL_OUTPUT}...`);
    const proc = spawn('ffmpeg', ffmpegArgs, { stdio: 'inherit' });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`🎉 COMPOSITING COMPLETE! Output: ${FINAL_OUTPUT}`);
        resolve(FINAL_OUTPUT);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

async function main() {
  if (!fs.existsSync(SUBTITLES_JSON)) {
    throw new Error(`Subtitles JSON not found at ${SUBTITLES_JSON}`);
  }
  const words = JSON.parse(fs.readFileSync(SUBTITLES_JSON, 'utf-8'));
  buildAssSubtitles(words);
  await runFFmpegMux();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Composite failed:', err);
    process.exit(1);
  });
}

