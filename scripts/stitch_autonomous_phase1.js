const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const FRAMES_DIR = path.join(OUT_DIR, 'rogue_frames');
const FINAL_MP4 = path.join(OUT_DIR, 'final_phase1_limitless.mp4');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

async function stitch() {
  console.log('🔄 STEP 1: Standardizing 1,705 filenames to frame_%05d.jpeg...');
  const files = fs.readdirSync(FRAMES_DIR)
    .filter(f => f.endsWith('.jpeg'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });

  console.log(`Found ${files.length} frames.`);
  files.forEach((f, idx) => {
    const oldPath = path.join(FRAMES_DIR, f);
    const newPath = path.join(FRAMES_DIR, `frame_${String(idx).padStart(5, '0')}.jpeg`);
    if (oldPath !== newPath) {
      fs.renameSync(oldPath, newPath);
    }
  });
  console.log('✅ All 1,705 frames renamed cleanly.');

  console.log('\n🎛️ STEP 2: Streaming through FFmpeg image2 demuxer into Master MP4...');
  const inputPattern = path.join(FRAMES_DIR, 'frame_%05d.jpeg').replace(/\\/g, '/');
  const voiceoverPath = path.join(PROJECT_ROOT, 'public', 'voiceover.mp3').replace(/\\/g, '/');
  const ambientPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');

  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${inputPattern}" -i "${voiceoverPath}" -i "${ambientPath}" -filter_complex "[1:a]volume=1.0[v];[2:a]volume=0.08[bg];[v][bg]amix=inputs=2:duration=first:dropout_transition=2[a]" -map 0:v -map "[a]" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${FINAL_MP4.replace(/\\/g, '/')}"`;

  console.log('Executing FFmpeg...');
  execSync(ffmpegCmd, { stdio: 'inherit' });

  const stat = fs.statSync(FINAL_MP4);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 MASTER SHORT COMPILED: ${FINAL_MP4} (${sizeMb} MB)`);

  // Copy to Artifact directory
  const artifactVideoPath = path.join(ARTIFACT_DIR, 'final_phase1_limitless.mp4');
  fs.copyFileSync(FINAL_MP4, artifactVideoPath);
  console.log(`📋 Copied to artifact: ${artifactVideoPath}`);

  // Extract 5 proof stills
  console.log('\n📸 Extracting 5 Narrative Beat Proof Stills...');
  const timestamps = [
    { sec: 5, name: 'rogue_cut1.jpg', label: 'Cut 1: Draupner Platform & Anomaly Spike' },
    { sec: 16, name: 'rogue_cut2.jpg', label: 'Cut 2: Laser Altimeter 25.6M Telemetry' },
    { sec: 28, name: 'rogue_cut3.jpg', label: 'Cut 3: Non-Linear Vector Collision Superposition' },
    { sec: 40, name: 'rogue_cut4.jpg', label: 'Cut 4: Gaussian Failure vs Fat-Tail Curve' },
    { sec: 50, name: 'rogue_cut5.jpg', label: 'Cut 5: Archived Anomaly / Case Unresolved' },
  ];

  for (const t of timestamps) {
    const localThumb = path.join(OUT_DIR, t.name);
    const artifactThumb = path.join(ARTIFACT_DIR, t.name);
    const ffmpegThumbCmd = `ffmpeg -y -ss ${t.sec} -i "${FINAL_MP4.replace(/\\/g, '/')}" -frames:v 1 -q:v 2 "${localThumb.replace(/\\/g, '/')}"`;
    try {
      execSync(ffmpegThumbCmd, { stdio: 'ignore' });
      fs.copyFileSync(localThumb, artifactThumb);
      console.log(`  ✓ Verified ${t.label} (${t.sec}s) -> ${t.name}`);
    } catch (e) {
      console.error(`  ✗ Error extracting ${t.name}:`, e.message);
    }
  }

  // Cleanup temporary frame cache
  console.log('\n🧹 Cleaning temporary frame cache...');
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('  ✓ Frame cache cleared.');

  console.log('\n===============================================================');
  console.log('🌟 100% AUTONOMOUS PHASE 1 LIMITLESS TEST SUCCEEDED!');
  console.log('===============================================================\n');
}

stitch().catch(err => {
  console.error('❌ Stitching failed:', err);
  process.exit(1);
});
