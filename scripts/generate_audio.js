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
  if (!currentShort || !currentShort.scenes || !Array.isArray(currentShort.scenes)) {
    console.log('⚠️ No structured scenes found. Using default frame proportions.');
    return {
      s1: Math.round(totalFrames * 0.23),
      s2: Math.round(totalFrames * 0.23),
      s3: Math.round(totalFrames * 0.18),
      s4: Math.round(totalFrames * 0.22),
      s5: Math.round(totalFrames * 0.14),
    };
  }

  console.log('⏱️ Calculating exact audio-visual frame sync per scene...');
  const scenes = currentShort.scenes;
  let cumulativeWordCount = 0;
  const sceneEndTimes = [];

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const words = sc.voiceoverText.trim().split(/\s+/).filter(Boolean);
    cumulativeWordCount += words.length;

    // Word index in global subtitles array (clamped)
    const wordIdx = Math.min(cumulativeWordCount - 1, subtitles.length - 1);
    const subWord = subtitles[wordIdx];
    const endTime = subWord ? subWord.end : (i + 1) * (totalFrames / (scenes.length * FPS));
    sceneEndTimes.push(endTime);
    console.log(`  Scene ${sc.sceneId} (${sc.visualType}): ends at word "${subWord?.word}" (${endTime.toFixed(2)}s)`);
  }

  const s1 = Math.max(60, Math.round(sceneEndTimes[0] * FPS));
  const s2 = Math.max(60, Math.round((sceneEndTimes[1] - sceneEndTimes[0]) * FPS));
  const s3 = Math.max(60, Math.round((sceneEndTimes[2] - sceneEndTimes[1]) * FPS));
  const s4 = Math.max(60, Math.round((sceneEndTimes[3] - sceneEndTimes[2]) * FPS));
  const s5 = Math.max(45, totalFrames - (s1 + s2 + s3 + s4));

  console.log(`🎯 Frame Allocation: Scene 1: ${s1}f | Scene 2: ${s2}f | Scene 3: ${s3}f | Scene 4: ${s4}f | Scene 5: ${s5}f | Total: ${totalFrames}f`);

  // Detect relative frame timing for Scene 4 hazard chips
  let chipRelFrames = [Math.round(s4 * 0.35), Math.round(s4 * 0.55), Math.round(s4 * 0.75)];
  if (scenes[3] && scenes[3].chipList && Array.isArray(scenes[3].chipList)) {
    const s4StartSec = sceneEndTimes[2];
    const s4EndSec = sceneEndTimes[3];
    const s4Words = subtitles.filter(w => w.start >= s4StartSec - 0.2 && w.end <= s4EndSec + 0.5);

    const detected = [];
    scenes[3].chipList.forEach((chip) => {
      const cleanChip = chip.replace(/[^\w\s]/g, '').toLowerCase().split(/\s+/).filter(Boolean);
      for (const w of s4Words) {
        const cleanW = w.word.replace(/[^\w]/g, '').toLowerCase();
        if (cleanChip.includes(cleanW)) {
          const relSec = Math.max(0, w.start - s4StartSec);
          detected.push(Math.round(relSec * FPS));
          break;
        }
      }
    });

    if (detected.length === 3 && detected[0] < detected[1] && detected[1] < detected[2]) {
      chipRelFrames = detected;
      console.log(`📍 Synchronized Scene 4 hazard chip triggers to frames: ${chipRelFrames.join(', ')}`);
    } else {
      console.log(`📍 Using standard staggered hazard chip triggers: ${chipRelFrames.join(', ')}`);
    }
  }

  return {
    s1,
    s2,
    s3,
    s4,
    s5,
    chipRelFrames,
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
      "Where does the internet actually live? You think the entire web beams down from space? The real data reveals a shocking reality. Over seventy percent of people believe their international data comes from satellites. But real telemetry reveals space carries almost none of it! Ninety-nine percent of all global internet traffic travels through thin fiber-optic cables resting on the dark ocean floor! Yet these fragile lines are constantly threatened by commercial ship anchors, deep subsea quakes, and even shark attacks before reaching your phone! The cloud isn't in the sky; it's deep underwater, leaving everyone still asking...";
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

  // Write scene timings into current_short.json and metadata.json
  if (currentShort) {
    currentShort.sceneTimings = timings;
    fs.writeFileSync(CURRENT_SHORT_PATH, JSON.stringify(currentShort, null, 2), 'utf-8');
    console.log(`💾 Saved scene timings into ${CURRENT_SHORT_PATH}`);
  }

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
