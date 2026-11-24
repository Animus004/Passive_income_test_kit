/**
 * Master Production Renderer for Phase 1 Episode #3:
 * "What If Every Human Slept for 7 Days Straight?"
 * 
 * Powered by Authentic Whalter (@realwhalter 1:1) Cartoon Engine & NVENC Acceleration.
 * English Master for YouTube Shorts.
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { auditPhase1Video } from './watchdog_phase1.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const FRAMES_DIR = path.join(OUT_DIR, 'whalter_ep3_en_frames');
const SORTED_DIR = path.join(FRAMES_DIR, 'sorted');
const FINAL_MP4 = path.join(OUT_DIR, 'final_whalter_whatif_ep3.mp4');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

const manifestPath = path.join(PROJECT_ROOT, 'src', 'data', 'whatif_ep3_manifest.json');
let TOTAL_FRAMES = 1721;
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (manifest.totalFramesEn) TOTAL_FRAMES = manifest.totalFramesEn;
} catch (e) {}

const CHUNK_SIZE = 350;
const CHUNKS = [];
for (let s = 0; s < TOTAL_FRAMES; s += CHUNK_SIZE) {
  CHUNKS.push({ start: s, end: Math.min(s + CHUNK_SIZE - 1, TOTAL_FRAMES - 1) });
}

function cleanChromeZombies() {
  try {
    execSync('cmd /c "taskkill /F /IM chrome.exe >nul 2>&1"', { stdio: 'ignore' });
  } catch (e) {}
}

async function renderChunk(chunkIndex, start, end) {
  console.log(`\n📸 Rendering EN Chunk ${chunkIndex + 1}/${CHUNKS.length} (frames ${start}..${end})...`);
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const renderArgs = [
    'remotion',
    'render',
    'src/index.ts',
    'WhalterEp3En',
    'out/whalter_ep3_en_frames',
    '--sequence',
    '--image-format=jpeg',
    '--jpeg-quality=88',
    '--concurrency=1',
    '--disable-shared-memory-capture',
    `--frames=${start}-${end}`,
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(npxCmd, renderArgs, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      shell: true,
    });
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Chunk ${chunkIndex + 1} failed with code ${code}`));
      resolve();
    });
    child.on('error', reject);
  });

  cleanChromeZombies();
}

async function main() {
  console.log('===============================================================');
  console.log('🎬 AUTHENTIC WHALTER 1:1 ENGINE: EPISODE #3 MASTER RENDER (ENGLISH)');
  console.log('   Topic: "What If Every Human Slept for 7 Days Straight?"');
  console.log(`   Total Frames: ${TOTAL_FRAMES} (~${(TOTAL_FRAMES / 30).toFixed(2)}s @ 30fps) across ${CHUNKS.length} chunks`);
  console.log('===============================================================\n');

  cleanChromeZombies();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  // STEP 1: Render All Chunks
  for (let i = 0; i < CHUNKS.length; i++) {
    await renderChunk(i, CHUNKS[i].start, CHUNKS[i].end);
  }

  // STEP 2: Strict Numeric Sort of Rendered Frames
  console.log('\n🎞️ Standardizing Frame Names with Strict Numeric Sort...');
  fs.mkdirSync(SORTED_DIR, { recursive: true });

  const files = fs.readdirSync(FRAMES_DIR)
    .filter(f => f.startsWith('element-') && (f.endsWith('.jpeg') || f.endsWith('.jpg')))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/element-|\.jpe?g/g, ''), 10);
      const numB = parseInt(b.replace(/element-|\.jpe?g/g, ''), 10);
      return numA - numB;
    });

  console.log(`✓ Total frames collected: ${files.length} (expected: ${TOTAL_FRAMES})`);
  files.forEach((f, idx) => {
    const oldP = path.join(FRAMES_DIR, f);
    const newP = path.join(SORTED_DIR, `frame_${String(idx).padStart(5, '0')}.jpeg`);
    fs.renameSync(oldP, newP);
  });

  // STEP 3: Mux Audio & Video with Hardware NVENC & Foley SFX Matrix
  console.log('\n🚀 Muxing Audio & Video with Hardware NVENC & Foley SFX Matrix...');
  const voicePath = path.join(PROJECT_ROOT, 'public', 'voiceover_ep3_en.mp3').replace(/\\/g, '/');
  const ambientPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');
  const whooshPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'whoosh.mp3').replace(/\\/g, '/');
  const boomPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'sub_boom.mp3').replace(/\\/g, '/');
  const glitchPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'glitch.mp3').replace(/\\/g, '/');
  const alarmPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'alarm.mp3').replace(/\\/g, '/');
  const thudPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'thud.mp3').replace(/\\/g, '/');

  const framesPattern = `${SORTED_DIR.replace(/\\/g, '/')}/frame_%05d.jpeg`;

  const filterGraph = [
    `[1:a]volume=1.0[v_clean]`,
    `[2:a]volume=0.08[bg_clean]`,
    `[3:a]adelay=0|0,volume=0.35[sfx_start]`,
    `[4:a]adelay=400|400,volume=0.45[sfx_boom]`,
    `[5:a]adelay=8000|8000,volume=0.35[sfx_crash]`,
    `[6:a]adelay=15000|15000,volume=0.35[sfx_alarm]`,
    `[7:a]adelay=27500|27500,volume=0.45[sfx_grid_down]`,
    `[v_clean][bg_clean][sfx_start][sfx_boom][sfx_crash][sfx_alarm][sfx_grid_down]amix=inputs=7:duration=first:dropout_transition=2[a_mix]`
  ].join(';');

  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${framesPattern}" -i "${voicePath}" -stream_loop -1 -i "${ambientPath}" -i "${whooshPath}" -i "${boomPath}" -i "${thudPath}" -i "${alarmPath}" -i "${boomPath}" -filter_complex "${filterGraph}" -map 0:v -map "[a_mix]" -c:v h264_nvenc -preset p4 -rc vbr -cq 16 -b:v 14M -pix_fmt yuv420p -shortest "${FINAL_MP4.replace(/\\/g, '/')}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`\n🎉 WHALTER 1:1 MASTER VIDEO COMPILED: ${FINAL_MP4}`);

  // Copy to canonical target expected by publish_whatif.js
  const circleToonTarget = path.join(OUT_DIR, 'final_circletoon_whatif_ep3_adam.mp4');
  fs.copyFileSync(FINAL_MP4, circleToonTarget);
  console.log(`✓ Synchronized with Publisher Target: ${circleToonTarget}`);

  // STEP 4: Run Pre-Flight Watchdog Audit
  console.log('\n🛡️ Initiating Autonomous Watchdog Integrity Audit...');
  const auditResult = await auditPhase1Video({
    videoPath: FINAL_MP4,
    episodeId: '#3',
    expectedKeywords: ['sleep', 'days', 'human', 'collapse', 'blackout', 'autopilot'],
    forbiddenKeywords: ['1,000,000', 'cheque', 'mansion', 'chocolate bar'],
    subtitlesPath: path.join(PROJECT_ROOT, 'public', 'subtitles_ep3_en.json'),
  });

  if (!auditResult.passed) {
    console.error('❌ WATCHDOG AUDIT FAILED! Master video contains integrity violations.');
    process.exit(1);
  }

  // STEP 5: Extract Narrative Proof Stills to Artifact Directory
  console.log('\n📸 Extracting Narrative Proof Stills to Artifact Directory...');
  const proofMoments = [
    { time: '00:00:02.500', name: 'whalter_ep3_proof_beat1_plaza.jpg' },
    { time: '00:00:06.800', name: 'whalter_ep3_proof_beat2_sleep_drop.jpg' },
    { time: '00:00:11.500', name: 'whalter_ep3_proof_beat3_taxi.jpg' },
    { time: '00:00:18.000', name: 'whalter_ep3_proof_beat4_cockpit.jpg' },
    { time: '00:00:24.000', name: 'whalter_ep3_proof_beat5_nuclear.jpg' },
    { time: '00:00:34.500', name: 'whalter_ep3_proof_beat7_pitch_black.jpg' },
    { time: '00:00:41.500', name: 'whalter_ep3_proof_beat8_deer.jpg' },
    { time: '00:00:47.500', name: 'whalter_ep3_proof_beat9_awakening.jpg' },
    { time: '00:00:54.000', name: 'whalter_ep3_proof_beat10_loop.jpg' },
  ];

  for (const m of proofMoments) {
    const outImg = path.join(ARTIFACT_DIR, m.name);
    try {
      execSync(`ffmpeg -y -i "${FINAL_MP4.replace(/\\/g, '/')}" -ss ${m.time} -vframes 1 -update 1 "${outImg.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
      console.log(`  ✓ Verified -> ${m.name}`);
    } catch (e) {
      console.warn(`  ⚠️ Could not extract ${m.name}: ${e.message}`);
    }
  }

  // Clean temporary frame cache
  console.log('\n🧹 Cleaning temporary frame cache...');
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('  ✓ Frame cache cleared.');

  console.log('\n===============================================================');
  console.log('🌟 100% PHASE 1 EPISODE #3 WHALTER 1:1 MASTER VIDEO COMPLETE!');
  console.log(`   Final Video: ${FINAL_MP4}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('\n❌ Render fatal error:', err);
  process.exit(1);
});
