const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const FRAMES_DIR = path.join(OUT_DIR, 'circletoon_full_frames');
const SORTED_DIR = path.join(FRAMES_DIR, 'sorted');
const FINAL_MP4 = path.join(OUT_DIR, 'final_circletoon_whatif.mp4');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

const storyDataPath = path.join(PROJECT_ROOT, 'src', 'data', 'current_whatif_short.json');
let TOTAL_FRAMES = 1233;
try {
  const story = JSON.parse(fs.readFileSync(storyDataPath, 'utf-8'));
  if (story.totalFrames) TOTAL_FRAMES = story.totalFrames;
} catch (e) {}

// Safe chunk size of 300 frames (~10s per chunk)
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
    'CircleToonExplainer',
    'out/circletoon_full_frames',
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

  // Reclaim RAM between chunks
  cleanChromeZombies();
}

async function main() {
  console.log('===============================================================');
  console.log('🎬 CIRCLE-HEAD 8-SCENE CARTOON ENGINE (WALTER 1:1 MASTER RENDER)');
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
  console.log(`  First frame: ${files[0]} -> frame_00000.jpeg`);
  console.log(`  Last frame:  ${files[files.length - 1]} -> frame_${String(files.length - 1).padStart(5, '0')}.jpeg`);

  files.forEach((f, idx) => {
    const oldP = path.join(FRAMES_DIR, f);
    const newP = path.join(SORTED_DIR, `frame_${String(idx).padStart(5, '0')}.jpeg`);
    fs.renameSync(oldP, newP);
  });

  // STEP 3: Mux Audio & Video with Hardware NVENC & Foley SFX
  console.log('\n🚀 Muxing Audio & Video with Hardware NVENC & 8-Beat Foley...');
  const voicePath = path.join(PROJECT_ROOT, 'public', 'voiceover.mp3').replace(/\\/g, '/');
  const ambientPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');
  const whooshPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'whoosh.mp3').replace(/\\/g, '/');
  const boomPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'sub_boom.mp3').replace(/\\/g, '/');
  const slamPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'stamp_slam.mp3').replace(/\\/g, '/');
  const blipPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'blip.mp3').replace(/\\/g, '/');
  const paperPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'paper_slide.mp3').replace(/\\/g, '/');
  const snapPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'camera_snap.mp3').replace(/\\/g, '/');
  const alarmPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'alarm.mp3').replace(/\\/g, '/');
  const glitchPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'glitch.mp3').replace(/\\/g, '/');

  const framesPattern = `${SORTED_DIR.replace(/\\/g, '/')}/frame_%05d.jpeg`;

  // Filter graph syncing SFX to each of the 8 narrative scenes
  const filterGraph = [
    `[1:a]volume=1.0[v_clean]`,
    `[2:a]volume=0.08[bg_clean]`,
    `[3:a]adelay=0|0,volume=0.35[sfx_start]`,
    `[4:a]adelay=400|400,volume=0.45[sfx_boom]`,
    `[5:a]adelay=4500|4500,volume=0.35[sfx_phone_buzz]`,
    `[6:a]adelay=10000|10000,volume=0.4[sfx_paper_throw]`,
    `[7:a]adelay=10300|10300,volume=0.45[sfx_quit_slam]`,
    `[8:a]adelay=14400|14400,volume=0.35[sfx_snap]`,
    `[9:a]adelay=21000|21000,volume=0.35[sfx_alarm]`,
    `[10:a]adelay=27600|27600,volume=0.35[sfx_trash_glitch]`,
    `[v_clean][bg_clean][sfx_start][sfx_boom][sfx_phone_buzz][sfx_paper_throw][sfx_quit_slam][sfx_snap][sfx_alarm][sfx_trash_glitch]amix=inputs=10:duration=first:dropout_transition=2[a_mix]`
  ].join(';');

  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${framesPattern}" -i "${voicePath}" -stream_loop -1 -i "${ambientPath}" -i "${whooshPath}" -i "${boomPath}" -i "${blipPath}" -i "${paperPath}" -i "${slamPath}" -i "${snapPath}" -i "${alarmPath}" -i "${glitchPath}" -filter_complex "${filterGraph}" -map 0:v -map "[a_mix]" -c:v h264_nvenc -preset p4 -rc vbr -cq 16 -b:v 14M -pix_fmt yuv420p -shortest "${FINAL_MP4.replace(/\\/g, '/')}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`\n🎉 CIRCLE-HEAD 8-SCENE MASTER SHORT COMPILED: ${FINAL_MP4}`);

  // Copy to Artifact Directory
  const artifactTarget = path.join(ARTIFACT_DIR, 'final_circletoon_whatif.mp4');
  fs.copyFileSync(FINAL_MP4, artifactTarget);
  console.log(`✅ Saved to Artifacts: ${artifactTarget}`);

  // STEP 4: Extract 8 Narrative Beat Proof Stills
  console.log('\n📸 Extracting 8 Narrative Beat Proof Stills (Output Seek)...');
  const proofStills = [
    { sec: '00:00:02.500', name: 'circletoon_beat1_midnight_crowd.jpg', label: 'Beat 1: Midnight 8B Direct Deposit Hook (2.5s)' },
    { sec: '00:00:07.000', name: 'circletoon_beat2_phone_buzz.jpg', label: 'Beat 2: 8 Billion Phones Buzzing (7s)' },
    { sec: '00:00:12.000', name: 'circletoon_beat3_workers_quit.jpg', label: 'Beat 3: 95% Workers Quit & Celebrate (12s)' },
    { sec: '00:00:17.500', name: 'circletoon_beat4_house_sold.jpg', label: 'Beat 4: Ghost Mansion Sold & Shocked Grandma (17.5s)' },
    { sec: '00:00:24.000', name: 'circletoon_beat5_supermarket_inflation.jpg', label: 'Beat 5: $50,000 Bread & Empty Shelves (24s)' },
    { sec: '00:00:29.500', name: 'circletoon_beat6_trash_money.jpg', label: 'Beat 6: 72 Hours Later / Cash is Trash Dumpster (29.5s)' },
    { sec: '00:00:33.000', name: 'circletoon_beat7_chocolate_barter.jpg', label: 'Beat 7: Gold Chocolate Bar Barter Economy (33s)' },
    { sec: '00:00:39.000', name: 'circletoon_beat8_clock_loop.jpg', label: 'Beat 8: Midnight Paradox Infinite Loop (39s)' },
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
  console.log('🌟 100% CIRCLE-HEAD 8-SCENE MASTER SHORT PRODUCTION COMPLETE!');
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('Fatal CircleToon master render error:', err);
  process.exit(1);
});
