const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const FRAMES_DIR = path.join(OUT_DIR, 'whalter_preview_frames');
const SORTED_DIR = path.join(FRAMES_DIR, 'sorted');
const FINAL_MP4 = path.join(OUT_DIR, 'whalter_preview_5s.mp4');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

async function main() {
  console.log('🎬 Rendering Whalter-Style 2D Kinetic Preview (5s / 150 frames)...');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const renderArgs = [
    'remotion',
    'render',
    'src/index.ts',
    'WhalterExplainer',
    'out/whalter_preview_frames',
    '--sequence',
    '--image-format=jpeg',
    '--jpeg-quality=85',
    '--concurrency=1',
    '--frames=0-150',
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(npxCmd, renderArgs, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      shell: true,
    });
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Remotion exited with code ${code}`));
      resolve();
    });
    child.on('error', reject);
  });

  // Numeric Sort
  fs.mkdirSync(SORTED_DIR, { recursive: true });
  const files = fs.readdirSync(FRAMES_DIR)
    .filter(f => f.startsWith('element-') && (f.endsWith('.jpeg') || f.endsWith('.jpg')))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/element-|\.jpe?g/g, ''), 10);
      const numB = parseInt(b.replace(/element-|\.jpe?g/g, ''), 10);
      return numA - numB;
    });

  files.forEach((f, idx) => {
    const oldP = path.join(FRAMES_DIR, f);
    const newP = path.join(SORTED_DIR, `frame_${String(idx).padStart(5, '0')}.jpeg`);
    fs.renameSync(oldP, newP);
  });

  // Mux with NVENC
  const voicePath = path.join(PROJECT_ROOT, 'public', 'voiceover.mp3').replace(/\\/g, '/');
  const ambientPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');
  const sfxPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'sub_boom.mp3').replace(/\\/g, '/');
  const framesPattern = `${SORTED_DIR.replace(/\\/g, '/')}/frame_%05d.jpeg`;

  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${framesPattern}" -ss 0 -t 5 -i "${voicePath}" -ss 0 -t 5 -i "${ambientPath}" -filter_complex "[1:a]volume=1.0[v_clean];[2:a]volume=0.08[bg_clean];[v_clean][bg_clean]amix=inputs=2:duration=first:dropout_transition=2[a_mix]" -map 0:v -map "[a_mix]" -c:v h264_nvenc -preset p4 -rc vbr -cq 16 -b:v 14M -pix_fmt yuv420p -shortest "${FINAL_MP4.replace(/\\/g, '/')}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`✅ Preview compiled: ${FINAL_MP4}`);

  const artifactTarget = path.join(ARTIFACT_DIR, 'whalter_preview_5s.mp4');
  fs.copyFileSync(FINAL_MP4, artifactTarget);
  console.log(`✅ Saved to Artifacts: ${artifactTarget}`);

  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
