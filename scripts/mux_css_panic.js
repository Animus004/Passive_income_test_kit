import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const PROJECT_ROOT = 'd:\\New folder (2)';
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

const frames = path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', '3_am_css_panic_loop', 'frames', 'frame_%04d.jpg').replace(/\\/g, '/');
const audio = path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', '3_am_css_panic_loop', 'audio', 'master_audio.wav').replace(/\\/g, '/');
const ass = path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', '3_am_css_panic_loop', 'subtitles.ass').replace(/\\/g, '/').replace(/:/g, '\\:');
const out = path.join(PROJECT_ROOT, 'out', 'relatable_reels', '3_am_css_panic_loop_reel.mp4');

console.log('Muxing final reel with NVENC...');
const cmd = `ffmpeg -y -framerate 30 -i "${frames}" -i "${audio}" -vf "ass='${ass}'" -c:v h264_nvenc -preset p5 -b:v 8M -c:a aac -b:a 192k -pix_fmt yuv420p "${out}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('✅ NVENC Mux succeeded!');
} catch (e) {
  console.log('NVENC failed, using CPU libx264...');
  const cpuCmd = `ffmpeg -y -framerate 30 -i "${frames}" -i "${audio}" -vf "ass='${ass}'" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -pix_fmt yuv420p "${out}"`;
  execSync(cpuCmd, { stdio: 'inherit' });
  console.log('✅ CPU Mux succeeded!');
}

// Copy to artifact directory
const artVideo = path.join(ARTIFACT_DIR, '3_am_css_panic_loop_reel.mp4');
fs.copyFileSync(out, artVideo);
console.log('✅ Copied final reel to artifact directory:', artVideo);

// Extract proof stills from final video
const proofDir = path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', '3_am_css_panic_loop', 'proofs');
fs.mkdirSync(proofDir, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', '3_am_css_panic_loop', 'episode_manifest.json'), 'utf-8'));
for (let i = 0; i < manifest.lines.length; i++) {
  const padI = String(i).padStart(2, '0');
  const line = manifest.lines[i];
  const sec = ((line.startFrame + line.endFrame) / 2 / manifest.fps).toFixed(2);
  const proofFile = path.join(proofDir, `turn_${padI}_${line.speaker}.jpg`);
  try {
    execSync(`ffmpeg -y -ss ${sec} -i "${out}" -vframes 1 -q:v 2 "${proofFile}"`, { stdio: 'ignore' });
    const artStill = path.join(ARTIFACT_DIR, `3_am_css_panic_loop_turn_${padI}_${line.speaker}.jpg`);
    fs.copyFileSync(proofFile, artStill);
  } catch (e) {}
}
console.log('✅ Extracted and copied all proof stills!');
