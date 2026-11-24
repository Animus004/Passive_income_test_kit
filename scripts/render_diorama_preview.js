const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const FRAMES_DIR = path.join(OUT_DIR, 'diorama_frames');
const FINAL_MP4 = path.join(OUT_DIR, 'diorama_preview_5s.mp4');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

async function main() {
  console.log('🎬 Rendering 3D Diorama 150-frame sequence (5 seconds)...');
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const renderArgs = [
    'remotion',
    'render',
    'src/index.ts',
    'DioramaExplainer',
    'out/diorama_frames',
    '--sequence',
    '--image-format=jpeg',
    '--jpeg-quality=85',
    '--concurrency=1',
    '--gl=angle',
    '--disable-shared-memory-capture',
    '--frames=0-150',
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(npxCmd, renderArgs, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      shell: true,
    });
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Exit code ${code}`));
      resolve();
    });
    child.on('error', reject);
  });

  console.log('\n🎞️ Encoding with Hardware NVENC...');
  // Standardize frame names for image2
  const files = fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg')).sort();
  files.forEach((f, idx) => {
    const oldP = path.join(FRAMES_DIR, f);
    const newP = path.join(FRAMES_DIR, `frame_${String(idx).padStart(5, '0')}.jpeg`);
    if (oldP !== newP) fs.renameSync(oldP, newP);
  });

  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${FRAMES_DIR.replace(/\\/g, '/')}/frame_%05d.jpeg" -i "${path.join(PROJECT_ROOT, 'public', 'voiceover.mp3').replace(/\\/g, '/')}" -c:v h264_nvenc -preset p4 -rc vbr -cq 16 -b:v 14M -pix_fmt yuv420p -t 5 -shortest "${FINAL_MP4.replace(/\\/g, '/')}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log(`\n✅ 3D Diorama Preview Ready: ${FINAL_MP4}`);

  // Copy to artifacts
  const artifactTarget = path.join(ARTIFACT_DIR, 'diorama_preview_5s.mp4');
  fs.copyFileSync(FINAL_MP4, artifactTarget);
  console.log(`✅ Saved to Artifacts: ${artifactTarget}`);
}

main().catch(err => {
  console.error('Fatal diorama render error:', err);
  process.exit(1);
});
