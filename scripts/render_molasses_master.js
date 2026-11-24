/**
 * Master Production Renderer for Absurd History Anomalies Episode:
 * "The Great Boston Molasses Tsunami of 1919"
 * 
 * Supports:
 * --lang=en (English Master: 2,451 frames / 81.7s)
 * --lang=hi (Hindi Master: 2,600 frames / 86.7s)
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

const args = process.argv.slice(2);
const langArg = args.find(a => a.startsWith('--lang='))?.split('=')[1] || 'en';
const isHindi = langArg === 'hi';

const compositionId = isHindi ? 'MolassesShortHi' : 'MolassesShortEn';
const totalFrames = isHindi ? 2600 : 2375;
const audioSource = path.join(PROJECT_ROOT, 'public', isHindi ? 'voiceover_molasses_hi.mp3' : 'voiceover_molasses_en.mp3');
const finalMp4 = path.join(OUT_DIR, isHindi ? 'final_molasses_1919_hi.mp4' : 'final_molasses_1919_en.mp4');

const framesDir = path.join(OUT_DIR, isHindi ? 'molasses_hi_frames' : 'molasses_en_frames');
const sortedDir = path.join(framesDir, 'sorted');

if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });
if (!fs.existsSync(sortedDir)) fs.mkdirSync(sortedDir, { recursive: true });

const CHUNK_SIZE = 350;
const CHUNKS = [];
for (let s = 0; s < totalFrames; s += CHUNK_SIZE) {
  CHUNKS.push({ start: s, end: Math.min(s + CHUNK_SIZE - 1, totalFrames - 1) });
}

function cleanChromeZombies() {
  try {
    execSync('cmd /c "taskkill /F /IM chrome.exe >nul 2>&1"', { stdio: 'ignore' });
  } catch (e) {}
}

async function renderChunk(chunkIndex, start, end) {
  // Check if all frames in this chunk already exist (resumable rendering)
  let allExist = true;
  for (let f = start; f <= end; f++) {
    const candidates = [
      path.join(framesDir, `element-${f}.jpeg`),
      path.join(framesDir, `element-${String(f).padStart(3, '0')}.jpeg`),
      path.join(framesDir, `element-${String(f).padStart(4, '0')}.jpeg`),
      path.join(framesDir, `element-${String(f).padStart(5, '0')}.jpeg`),
      path.join(framesDir, `element-${f}.jpg`),
      path.join(framesDir, `element-${String(f).padStart(3, '0')}.jpg`),
      path.join(framesDir, `element-${String(f).padStart(4, '0')}.jpg`),
      path.join(framesDir, `element-${String(f).padStart(5, '0')}.jpg`),
    ];
    if (!candidates.some(c => fs.existsSync(c))) {
      allExist = false;
      break;
    }
  }
  if (allExist) {
    console.log(`⏩ Chunk ${chunkIndex + 1}/${CHUNKS.length} (frames ${start}..${end}) already exists. Skipping.`);
    return;
  }

  // If chunk is incomplete, clean up any partial files from this chunk to ensure pristine contiguous rendering
  for (let f = start; f <= end; f++) {
    const candidates = [
      path.join(framesDir, `element-${f}.jpeg`),
      path.join(framesDir, `element-${String(f).padStart(3, '0')}.jpeg`),
      path.join(framesDir, `element-${String(f).padStart(4, '0')}.jpeg`),
      path.join(framesDir, `element-${String(f).padStart(5, '0')}.jpeg`),
      path.join(framesDir, `element-${f}.jpg`),
      path.join(framesDir, `element-${String(f).padStart(3, '0')}.jpg`),
      path.join(framesDir, `element-${String(f).padStart(4, '0')}.jpg`),
      path.join(framesDir, `element-${String(f).padStart(5, '0')}.jpg`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        try { fs.unlinkSync(c); } catch (e) {}
      }
    }
  }

  console.log(`\n📸 Rendering [${compositionId}] Chunk ${chunkIndex + 1}/${CHUNKS.length} (frames ${start}..${end})...`);
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const renderArgs = [
    'remotion',
    'render',
    'src/index.ts',
    compositionId,
    `out/${path.basename(framesDir)}`,
    '--sequence',
    '--image-format=jpeg',
    '--jpeg-quality=88',
    '--concurrency=1',
    '--gl=angle',
    '--disable-shared-memory-capture',
    '--overwrite',
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

function organizeFrames() {
  console.log('\n📂 Organizing frames in chronological order...');
  const existingFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

  const fileMap = new Map();
  for (const f of existingFiles) {
    const match = f.match(/element-(\d+)\.(jpeg|jpg|png)/);
    if (match) {
      const idx = parseInt(match[1], 10);
      if (!fileMap.has(idx)) {
        fileMap.set(idx, f);
      }
    }
  }

  console.log(`Found ${fileMap.size} unique rendered frames out of ${totalFrames} expected.`);
  if (fileMap.size < totalFrames) {
    const missing = [];
    for (let f = 0; f < totalFrames; f++) {
      if (!fileMap.has(f)) missing.push(f);
    }
    console.warn(`⚠️ Warning: Missing ${missing.length} frames (e.g. ${missing.slice(0, 10).join(', ')}...)`);
  }

  for (let i = 0; i < totalFrames; i++) {
    const filename = fileMap.get(i);
    if (!filename) continue;
    const src = path.join(framesDir, filename);
    const dest = path.join(sortedDir, `frame_${String(i).padStart(5, '0')}.jpg`);
    fs.copyFileSync(src, dest);
  }
  console.log(`✅ Sorted directory populated with ${fileMap.size} sequential frames.`);
}

async function renderMixedAudio() {
  const mixedAudioPath = path.join(OUT_DIR, `molasses_${langArg}_mixed_audio.mp3`);
  console.log(`\n🔊 Rendering High-Speed Composition Mixed Audio to ${mixedAudioPath}...`);
  try {
    execSync(`python scripts/mix_molasses_audio.py ${langArg}`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    return mixedAudioPath;
  } catch (err) {
    console.warn(`⚠️ Warning: Composition audio mix failed, falling back to raw voiceover: ${err.message}`);
    return audioSource;
  }
}

async function stitchVideo(audioTrackPath) {
  console.log('\n🎬 Stitching frames with mixed audio into pristine Master MP4 using NVIDIA GPU...');
  const inputPattern = path.join(sortedDir, 'frame_%05d.jpg').replace(/\\/g, '/');
  const normAudio = audioTrackPath.replace(/\\/g, '/');
  const normMp4 = finalMp4.replace(/\\/g, '/');

  // Try NVIDIA NVENC hardware encoder on GTX 1660 SUPER first
  let cmd = `ffmpeg -y -framerate 30 -i "${inputPattern}" -i "${normAudio}" -c:v h264_nvenc -pix_fmt yuv420p -preset p7 -cq 16 -b:v 0 -c:a aac -b:a 256k -shortest "${normMp4}"`;

  try {
    console.log(`Executing NVIDIA GPU Hardware FFmpeg: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n🎉 MASTER VIDEO COMPLETE (NVIDIA NVENC GPU): ${finalMp4}`);
    return;
  } catch (nvencErr) {
    console.warn(`⚠️ Warning: NVENC encoding failed, falling back to CPU libx264: ${nvencErr.message}`);
  }

  // CPU fallback
  cmd = `ffmpeg -y -framerate 30 -i "${inputPattern}" -i "${normAudio}" -c:v libx264 -pix_fmt yuv420p -crf 16 -preset fast -c:a aac -b:a 256k -shortest "${normMp4}"`;
  console.log(`Executing CPU FFmpeg fallback: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
  console.log(`\n🎉 MASTER VIDEO COMPLETE: ${finalMp4}`);
}

async function main() {
  console.log('=================================================================');
  console.log(`🎬 ABSURD TRUE HISTORY MASTER RENDERER: ${compositionId}`);
  console.log(`   Language: ${langArg.toUpperCase()} | Frames: ${totalFrames} | Output: ${finalMp4}`);
  console.log('=================================================================');

  cleanChromeZombies();

  for (let i = 0; i < CHUNKS.length; i++) {
    const chunk = CHUNKS[i];
    await renderChunk(i, chunk.start, chunk.end);
  }

  organizeFrames();
  const mixedAudio = await renderMixedAudio();
  await stitchVideo(mixedAudio);

  // Save proof stills to brain artifacts for verification
  const proofFrames = [50, 300, 750, 1000, 1200, 1450, 1750, 2100];
  for (const pf of proofFrames) {
    if (pf < totalFrames) {
      const srcFrame = path.join(sortedDir, `frame_${String(pf).padStart(5, '0')}.jpg`);
      if (fs.existsSync(srcFrame)) {
        const artifactDst = path.join(ARTIFACT_DIR, `molasses_${langArg}_frame_${pf}.jpg`);
        fs.copyFileSync(srcFrame, artifactDst);
        console.log(`📸 Proof still saved: ${artifactDst}`);
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal rendering error:', err);
  process.exit(1);
});
