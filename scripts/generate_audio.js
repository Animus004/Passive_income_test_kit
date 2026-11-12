/**
 * Dual-Genre & Autonomous Audio Pipeline
 * Synthesizes voiceover via edge-tts, preserves word-level subtitles,
 * and calculates exact per-scene frame durations for synchronized cuts.
 *
 * Usage:
 *   node scripts/generate_audio.js (reads src/data/current_short.json)
 *   node scripts/generate_audio.js --genre data-detective
 *   node scripts/generate_audio.js --genre style-advisor
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CURRENT_SHORT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'current_short.json');
const AUDIO_OUTPUT_MP3 = path.join(PROJECT_ROOT, 'public', 'audio.mp3');
const VOICEOVER_OUTPUT_MP3 = path.join(PROJECT_ROOT, 'public', 'voiceover.mp3');
const SUBTITLES_OUTPUT = path.join(PROJECT_ROOT, 'public', 'subtitles.json');
const METADATA_OUTPUT = path.join(PROJECT_ROOT, 'public', 'metadata.json');
const PYTHON_SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'generate_audio.py');

const DEFAULT_VOICE = 'en-US-ChristopherNeural';
const FPS = 30;

function parseArgs() {
  const args = process.argv.slice(2);
  let genre = null;
  let text = null;
  let voice = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--genre' && args[i + 1]) {
      genre = args[i + 1];
      i++;
    } else if (args[i] === '--text' && args[i + 1]) {
      text = args[i + 1];
      i++;
    } else if (args[i] === '--voice' && args[i + 1]) {
      voice = args[i + 1];
      i++;
    }
  }

  return { genre, text, voice };
}

function runPythonTTS(scriptText, selectedVoice) {
  return new Promise((resolve, reject) => {
    console.log(`[TTS] Synthesizing speech via edge-tts (voice: ${selectedVoice})...`);

    const py = spawn('python', [
      PYTHON_SCRIPT,
      '--text', scriptText,
      '--voice', selectedVoice,
      '--audio', AUDIO_OUTPUT_MP3,
      '--subtitles', SUBTITLES_OUTPUT,
      '--meta', METADATA_OUTPUT,
    ], { stdio: 'inherit' });

    py.on('close', (code) => {
      if (code === 0) {
        // Copy audio.mp3 to voiceover.mp3 so both naming conventions are maintained
        try {
          fs.copyFileSync(AUDIO_OUTPUT_MP3, VOICEOVER_OUTPUT_MP3);
        } catch (e) {
          console.warn('Warning: Could not mirror to voiceover.mp3', e.message);
        }
        resolve();
      } else {
        reject(new Error(`Python TTS process exited with code ${code}`));
      }
    });

    py.on('error', (err) => reject(err));
  });
}

function calculateSceneTimings(currentShort, subtitles, totalFrames) {
  const cuts = (currentShort && (currentShort.cuts || currentShort.scenes)) || [];
  
  if (!cuts || cuts.length === 0) {
    console.log('⚠️ No structured cuts or scenes found. Using default frame proportions.');
    const defaultCutCount = 5;
    const perCut = Math.floor(totalFrames / defaultCutCount);
    const cutTimings = Array.from({ length: defaultCutCount }, (_, i) => ({
      cutId: i + 1,
      durationInFrames: i === defaultCutCount - 1 ? totalFrames - perCut * (defaultCutCount - 1) : perCut,
    }));
    return {
      cutTimings,
      s1: Math.round(totalFrames * 0.23),
      s2: Math.round(totalFrames * 0.23),
      s3: Math.round(totalFrames * 0.18),
      s4: Math.round(totalFrames * 0.22),
      s5: Math.round(totalFrames * 0.14),
    };
  }

  console.log(`⏱️ Calculating exact audio-visual frame sync for ${cuts.length} dynamic cuts...`);
  let cumulativeWordCount = 0;
  const cutEndTimes = [];

  for (let i = 0; i < cuts.length; i++) {
    const cut = cuts[i];
    const text = cut.voiceoverText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    cumulativeWordCount += words.length;

    // Word index in global subtitles array (clamped)
    const wordIdx = Math.min(cumulativeWordCount - 1, Math.max(0, subtitles.length - 1));
    const subWord = subtitles[wordIdx];
    const endTime = subWord ? subWord.end : ((i + 1) * totalFrames) / (cuts.length * FPS);
    cutEndTimes.push(endTime);
    console.log(`  Cut ${cut.cutId || i + 1}: ends at word "${subWord?.word || ''}" (${endTime.toFixed(2)}s)`);
  }

  // Calculate per-cut frame durations
  const cutTimings = [];
  let allocatedFrames = 0;

  for (let i = 0; i < cuts.length; i++) {
    const cut = cuts[i];
    const cutId = cut.cutId || i + 1;
    let duration;

    if (i === 0) {
      duration = Math.max(30, Math.round(cutEndTimes[0] * FPS));
    } else if (i === cuts.length - 1) {
      // Final cut takes all remaining frames to perfectly match totalFrames
      duration = Math.max(30, totalFrames - allocatedFrames);
    } else {
      const startSec = cutEndTimes[i - 1];
      const endSec = cutEndTimes[i];
      duration = Math.max(30, Math.round((endSec - startSec) * FPS));
    }

    allocatedFrames += duration;
    cutTimings.push({
      cutId,
      durationInFrames: duration,
    });
  }

  // Normalization pass if sum differs from totalFrames
  const totalAllocated = cutTimings.reduce((sum, c) => sum + c.durationInFrames, 0);
  const diff = totalFrames - totalAllocated;
  if (diff !== 0 && cutTimings.length > 0) {
    cutTimings[cutTimings.length - 1].durationInFrames += diff;
  }

  console.log(`🎯 Dynamic Cut Frame Allocation:`);
  cutTimings.forEach((c) => {
    console.log(`   - Cut ${c.cutId}: ${c.durationInFrames} frames (${(c.durationInFrames / FPS).toFixed(2)}s)`);
  });
  console.log(`   Total Frames: ${totalFrames}f (${(totalFrames / FPS).toFixed(2)}s)`);

  // Build legacy s1-s5 mapping for backward compatibility
  const s1 = cutTimings[0]?.durationInFrames || Math.round(totalFrames * 0.2);
  const s2 = cutTimings[1]?.durationInFrames || Math.round(totalFrames * 0.2);
  const s3 = cutTimings[2]?.durationInFrames || Math.round(totalFrames * 0.2);
  const s4 = cutTimings[3]?.durationInFrames || Math.round(totalFrames * 0.2);
  const s5 = cutTimings.slice(4).reduce((sum, c) => sum + c.durationInFrames, 0) || Math.max(30, totalFrames - (s1 + s2 + s3 + s4));

  return {
    cutTimings,
    s1,
    s2,
    s3,
    s4,
    s5,
    chipRelFrames: [Math.round(s4 * 0.35), Math.round(s4 * 0.55), Math.round(s4 * 0.75)],
  };
}

async function main() {
  const { genre, text, voice } = parseArgs();

  let scriptText = text;
  let currentShort = null;

  if (!scriptText && fs.existsSync(CURRENT_SHORT_PATH)) {
    try {
      currentShort = JSON.parse(fs.readFileSync(CURRENT_SHORT_PATH, 'utf-8'));
      scriptText = currentShort.fullVoiceover;
      console.log(`📄 Loaded script from current_short.json: "${currentShort.videoTitle}"`);
    } catch (e) {
      console.warn('Could not parse current_short.json, falling back.');
    }
  }

  if (!scriptText) {
    scriptText =
      "Where does the internet actually live? You think the entire web beams down from space? The real data reveals a shocking reality. Over seventy percent of people believe their international data comes from satellites. But real telemetry reveals space carries almost none of it! Ninety-nine percent of all global internet traffic travels through thin fiber-optic cables resting on the dark ocean floor! Yet these fragile lines are constantly threatened by commercial ship anchors, deep subsea quakes, and even shark attacks before reaching your phone! The cloud isn't in the sky; the entire digital world lives on the ocean floor.";
  }

  const selectedVoice = voice || DEFAULT_VOICE;

  console.log('====================================================');
  console.log('🎙️ TTS & AUDIO-VISUAL SYNCHRONIZATION PIPELINE');
  console.log('====================================================');

  await runPythonTTS(scriptText, selectedVoice);

  // Load generated subtitles & metadata
  const subtitles = JSON.parse(fs.readFileSync(SUBTITLES_OUTPUT, 'utf-8'));
  const metadata = JSON.parse(fs.readFileSync(METADATA_OUTPUT, 'utf-8'));

  const timings = calculateSceneTimings(currentShort, subtitles, metadata.totalFrames);

  // Write cut timings and scene timings into current_short.json and metadata.json
  if (currentShort) {
    currentShort.cutTimings = timings.cutTimings;
    currentShort.sceneTimings = timings;
    fs.writeFileSync(CURRENT_SHORT_PATH, JSON.stringify(currentShort, null, 2), 'utf-8');
    console.log(`💾 Saved cut timings and scene timings into ${CURRENT_SHORT_PATH}`);
  }

  metadata.cutTimings = timings.cutTimings;
  metadata.sceneTimings = timings;
  fs.writeFileSync(METADATA_OUTPUT, JSON.stringify(metadata, null, 2), 'utf-8');

  console.log('✅ Audio synthesis and timeline synchronization complete!');
  return { metadata, timings };
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Audio pipeline failed:', err);
    process.exit(1);
  });
}

module.exports = { main, calculateSceneTimings };
