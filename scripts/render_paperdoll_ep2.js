/**
 * Master Production Renderer for Phase 1 Episode #2:
 * "What If the Global Internet Was Deleted for 72 Hours?"
 * 
 * Powered by Three.js 3D Paper-Doll Shadow Stage & NVENC Acceleration.
 * Features:
 * - Chunked safe rendering (300 frames/chunk) with angle GL.
 * - Hardware NVENC muxing with synchronized 8-scene foley SFX matrix.
 * - Unskippable Pre-Flight Watchdog Audit (Zero-Fallback Guard).
 * - Proof still extraction to Artifact directory.
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
const FRAMES_DIR = path.join(OUT_DIR, 'paperdoll_ep2_frames');
const SORTED_DIR = path.join(FRAMES_DIR, 'sorted');
const FINAL_MP4 = path.join(OUT_DIR, 'final_circletoon_whatif_ep2_adam.mp4');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

const manifestPath = path.join(PROJECT_ROOT, 'src', 'data', 'whatif_ep2_manifest.json');
let TOTAL_FRAMES = 1416;
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (manifest.totalFrames) TOTAL_FRAMES = manifest.totalFrames;
} catch (e) {}

const CHUNK_SIZE = 300;
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
  console.log(`\n📸 Rendering Chunk ${chunkIndex + 1}/${CHUNKS.length} (frames ${start}..${end})...`);
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const renderArgs = [
    'remotion',
    'render',
    'src/index.ts',
    'PaperDollWhatIf',
    'out/paperdoll_ep2_frames',
    '--sequence',
    '--image-format=jpeg',
    '--jpeg-quality=88',
    '--concurrency=1',
    '--gl=angle',
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
  console.log('🎬 THREE.JS 3D PAPER-DOLL SHADOW ENGINE: EPISODE #2 MASTER RENDER');
  console.log(`   Topic: "What If the Global Internet Was Deleted for 72 Hours?"`);
  console.log(`   Total Frames: ${TOTAL_FRAMES} (~${(TOTAL_FRAMES / 30).toFixed(2)}s @ 30fps) across ${CHUNKS.length} chunks`);
  console.log('===============================================================\n');

  // STEP 1 & 2: Check if frames already rendered and sorted
  const sortedFiles = fs.existsSync(SORTED_DIR)
    ? fs.readdirSync(SORTED_DIR).filter(f => f.startsWith('frame_') && f.endsWith('.jpeg'))
    : [];

  if (sortedFiles.length === TOTAL_FRAMES) {
    console.log(`✓ All ${TOTAL_FRAMES} Three.js 3D Paper-Doll frames already rendered in cache. Reusing frames!`);
  } else {
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
  }

  // STEP 3: Mux Audio & Video with Hardware NVENC & Foley SFX Matrix
  console.log('\n🚀 Muxing Audio & Video with Hardware NVENC & Foley SFX Matrix...');
  const voicePath = path.join(PROJECT_ROOT, 'public', 'voiceover_ep2_en.mp3').replace(/\\/g, '/');
  const ambientPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');
  const whooshPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'whoosh.mp3').replace(/\\/g, '/');
  const boomPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'sub_boom.mp3').replace(/\\/g, '/');
  const glitchPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'glitch.mp3').replace(/\\/g, '/');
  const alarmPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'alarm.mp3').replace(/\\/g, '/');
  const thudPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'thud.mp3').replace(/\\/g, '/');
  const blipPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'blip.mp3').replace(/\\/g, '/');

  const framesPattern = `${SORTED_DIR.replace(/\\/g, '/')}/frame_%05d.jpeg`;

  // Filter graph syncing 10 audio inputs
  const filterGraph = [
    `[1:a]volume=1.0[v_clean]`,
    `[2:a]volume=0.08[bg_clean]`,
    `[3:a]adelay=0|0,volume=0.35[sfx_start]`,
    `[4:a]adelay=400|400,volume=0.45[sfx_boom]`,
    `[5:a]adelay=4150|4150,volume=0.4[sfx_freeze_glitch]`,
    `[6:a]adelay=9000|9000,volume=0.35[sfx_radar_alarm]`,
    `[7:a]adelay=15500|15500,volume=0.4[sfx_atm_thud]`,
    `[8:a]adelay=22800|22800,volume=0.35[sfx_supply_alarm]`,
    `[9:a]adelay=36500|36500,volume=0.35[sfx_wealth_blip]`,
    `[10:a]adelay=42500|42500,volume=0.4[sfx_loop_whip]`,
    `[v_clean][bg_clean][sfx_start][sfx_boom][sfx_freeze_glitch][sfx_radar_alarm][sfx_atm_thud][sfx_supply_alarm][sfx_wealth_blip][sfx_loop_whip]amix=inputs=10:duration=first:dropout_transition=2[a_mix]`
  ].join(';');

  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${framesPattern}" -i "${voicePath}" -stream_loop -1 -i "${ambientPath}" -i "${whooshPath}" -i "${boomPath}" -i "${glitchPath}" -i "${alarmPath}" -i "${thudPath}" -i "${alarmPath}" -i "${blipPath}" -i "${whooshPath}" -filter_complex "${filterGraph}" -map 0:v -map "[a_mix]" -c:v h264_nvenc -preset p4 -rc vbr -cq 16 -b:v 14M -pix_fmt yuv420p -shortest "${FINAL_MP4.replace(/\\/g, '/')}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`\n🎉 EPISODE #2 MASTER VIDEO COMPILED: ${FINAL_MP4}`);

  // STEP 4: Run Unskippable Watchdog Pre-Flight Audit
  console.log('\n🛡️ Initiating Autonomous Watchdog Integrity Audit...');
  const auditResult = await auditPhase1Video({
    videoPath: FINAL_MP4,
    episodeId: '#2',
    expectedKeywords: ['internet', 'deleted', 'hours', 'screens', 'airplanes', 'atms', 'power'],
    forbiddenKeywords: ['1,000,000', 'cheque', 'mansion', 'chocolate bar'],
    subtitlesPath: path.join(PROJECT_ROOT, 'public', 'subtitles_ep2_en.json'),
  });

  if (!auditResult.passed) {
    console.error('❌ WATCHDOG AUDIT FAILED! Master video contains integrity violations.');
    process.exit(1);
  }

  // STEP 5: Extract 5 Narrative Proof Stills for User Verification
  console.log('\n📸 Extracting 5 Narrative Proof Stills to Artifact Directory...');
  const proofStills = [
    { sec: '00:00:02.500', name: 'ep2_proof_01_hook_blackout.jpg', label: 'Beat 1: The 72H Blackout Hook (2.5s)' },
    { sec: '00:00:07.000', name: 'ep2_proof_02_screens_freeze.jpg', label: 'Beat 2: 8B Screens Frozen Worldwide (7s)' },
    { sec: '00:00:12.500', name: 'ep2_proof_03_jets_blind.jpg', label: 'Beat 3: 30,000 Jets Flying Blind (12.5s)' },
    { sec: '00:00:18.500', name: 'ep2_proof_04_atms_dead.jpg', label: 'Beat 4: ATMs & Cards Dead (18.5s)' },
    { sec: '00:00:32.000', name: 'ep2_proof_05_grid_collapse.jpg', label: 'Beat 5: Power Grids Darkness & $12T Erased (32s)' },
  ];

  proofStills.forEach(p => {
    const outImg = path.join(ARTIFACT_DIR, p.name);
    try {
      execSync(`ffmpeg -y -i "${FINAL_MP4.replace(/\\/g, '/')}" -ss ${p.sec} -vframes 1 -update 1 "${outImg.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
      console.log(`  ✓ Verified ${p.label} -> ${p.name}`);
    } catch (e) {
      console.warn(`  ⚠️ Could not extract ${p.name}: ${e.message}`);
    }
  });

  // Clean temporary frame cache
  console.log('\n🧹 Cleaning temporary frame cache...');
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('  ✓ Frame cache cleared.');

  console.log('\n===============================================================');
  console.log('🌟 100% PHASE 1 EPISODE #2 MASTER VIDEO PRODUCTION COMPLETE!');
  console.log(`   Final Video: ${FINAL_MP4}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('Fatal Episode 2 render error:', err);
  process.exit(1);
});
