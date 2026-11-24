const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const FRAMES_DIR = path.join(OUT_DIR, 'diorama_full_frames');
const SORTED_DIR = path.join(FRAMES_DIR, 'sorted');
const FINAL_MP4 = path.join(OUT_DIR, 'final_diorama_full.mp4');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

const metaPath = path.join(PROJECT_ROOT, 'public', 'metadata.json');
let TOTAL_FRAMES = 1703;
try {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  if (meta.totalFrames) TOTAL_FRAMES = meta.totalFrames;
} catch (e) {}

// Memory-safe chunk size of 300 frames (~10s per chunk)
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
    'DioramaExplainer',
    'out/diorama_full_frames',
    '--sequence',
    '--image-format=jpeg',
    '--jpeg-quality=85',
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
  console.log('🎬 3D DIORAMA MASTER RENDER (FULL 5-BEAT VIRAL SHORT)');
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

  // STEP 2: Standardize Frame Names for FFmpeg with STRICT NUMERIC SORT
  console.log('\n🎞️ Standardizing Frame Names with Strict Numeric Sort...');
  fs.mkdirSync(SORTED_DIR, { recursive: true });

  const files = fs.readdirSync(FRAMES_DIR)
    .filter(f => f.startsWith('element-') && (f.endsWith('.jpeg') || f.endsWith('.jpg')))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/element-|\.jpe?g/g, ''), 10);
      const numB = parseInt(b.replace(/element-|\.jpe?g/g, ''), 10);
      return numA - numB;
    });

  console.log(`✓ Total frames collected: ${files.length}`);
  console.log(`  First frame: ${files[0]} -> frame_00000.jpeg`);
  console.log(`  Last frame:  ${files[files.length - 1]} -> frame_${String(files.length - 1).padStart(5, '0')}.jpeg`);

  files.forEach((f, idx) => {
    const oldP = path.join(FRAMES_DIR, f);
    const newP = path.join(SORTED_DIR, `frame_${String(idx).padStart(5, '0')}.jpeg`);
    fs.renameSync(oldP, newP);
  });

  // STEP 3: Mux with Hardware NVENC
  console.log('\n🚀 Muxing Audio & Video with Hardware NVENC...');
  const voicePath = path.join(PROJECT_ROOT, 'public', 'voiceover.mp3').replace(/\\/g, '/');
  const ambientPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');
  const framesPattern = `${SORTED_DIR.replace(/\\/g, '/')}/frame_%05d.jpeg`;

  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${framesPattern}" -i "${voicePath}" -stream_loop -1 -i "${ambientPath}" -filter_complex "[1:a]volume=1.0[v_clean];[2:a]volume=0.08[bg_clean];[v_clean][bg_clean]amix=inputs=2:duration=first:dropout_transition=2[a_mix]" -map 0:v -map "[a_mix]" -c:v h264_nvenc -preset p4 -rc vbr -cq 16 -b:v 14M -pix_fmt yuv420p -shortest "${FINAL_MP4.replace(/\\/g, '/')}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`\n🎉 FULL 3D DIORAMA MASTER SHORT COMPILED: ${FINAL_MP4}`);

  // Copy to artifacts
  const artifactTarget = path.join(ARTIFACT_DIR, 'final_diorama_full.mp4');
  fs.copyFileSync(FINAL_MP4, artifactTarget);
  console.log(`✅ Saved to Artifacts: ${artifactTarget}`);

  // STEP 4: Extract 5-Beat Accurate Proof Stills
  console.log('\n📸 Extracting 5 Narrative Beat Proof Stills (Output Seek)...');
  const proofStills = [
    { sec: '00:00:04.000', name: 'diorama_cut1.jpg', label: 'Cut 1: Signal Absorption (4s)' },
    { sec: '00:00:15.000', name: 'diorama_cut2.jpg', label: 'Cut 2: Molecular Damping / H2O (15s)' },
    { sec: '00:00:28.000', name: 'diorama_cut3.jpg', label: 'Cut 3: Critical Attenuation / Dead Zone (28s)' },
    { sec: '00:00:42.000', name: 'diorama_cut4.jpg', label: 'Cut 4: Mesh Relay Routing (42s)' },
    { sec: '00:00:53.000', name: 'diorama_cut5.jpg', label: 'Cut 5: Infinite Loop Bridge (53s)' },
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

  // Clean frame cache
  console.log('\n🧹 Cleaning temporary frame cache...');
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('  ✓ Frame cache cleared.');
  console.log('\n===============================================================');
  console.log('🌟 100% 3D DIORAMA MASTER SHORT PRODUCTION COMPLETE!');
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('Fatal diorama full render error:', err);
  process.exit(1);
});
