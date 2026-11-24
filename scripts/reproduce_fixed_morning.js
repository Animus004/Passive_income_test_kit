import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { runWatchdogClosedLoop } from './vision_watchdog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const BLENDER_BIN = 'D:\\Programs\\blender\\blender-4.3.0-windows-x64\\blender.exe';
const DIRECTOR_SCRIPT = path.join(PROJECT_ROOT, 'blender_engine', 'scripts', 'relatable_comedy_director.py');

async function main() {
  console.log('='.repeat(75));
  console.log('☀️ RE-RENDERING FIXED MORNING OFFICE EPISODE: "Quick Minute Fight or Flight"');
  console.log('   • Fixes: Bright morning office daylight, workstation laptop with code, calibrated typing hands');
  console.log('='.repeat(75));

  const slug = 'quick_minute_fight_or_flight';
  const runDir = path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', slug);
  const outDir = path.join(PROJECT_ROOT, 'out', 'relatable_reels');
  const manifestPath = path.join(runDir, 'episode_manifest.json');
  const masterAudio = path.join(runDir, 'audio', 'master_audio.wav');
  const assPath = path.join(runDir, 'subtitles.ass');
  const framesDir = path.join(runDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // 1. Run Closed-Loop Watchdog on fixed morning scene
  console.log('\n👁️ [VISUAL WATCHDOG] Running pre-flight inspection on fixed morning office scene...');
  const watchdog = await runWatchdogClosedLoop({ manifestPath, runDir, maxIterations: 2 });
  console.log(`🛡️ [WATCHDOG RESULT] Score: ${watchdog.score}/10 | Approved: ${watchdog.approved ? '✅' : '❌'}`);

  if (!watchdog.approved) {
    throw new Error(`Watchdog rejected scene with score: ${watchdog.score}/10`);
  }

  // 2. Render all 675 frames in Blender EEVEE Next GPU
  console.log(`\n🚀 Rendering Full Sequence (${manifest.totalFrames} frames) via EEVEE Next GPU...`);
  const renderOutputPattern = path.join(framesDir, 'frame_');
  let bCmd = `& "${BLENDER_BIN}" -b -P "${DIRECTOR_SCRIPT}" -- --manifest "${manifestPath}" --frames --output "${renderOutputPattern}"`;
  if (watchdog.correctionsPath && fs.existsSync(watchdog.correctionsPath)) {
    console.log(`🛠️ Injecting verified Watchdog corrections into full render...`);
    bCmd += ` --corrections "${watchdog.correctionsPath}"`;
  }

  const t0 = Date.now();
  const renderRes = spawnSync('powershell.exe', ['-Command', bCmd], { stdio: 'inherit' });
  if (renderRes.status !== 0) {
    throw new Error(`Blender GPU frame rendering exited with code ${renderRes.status}`);
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✅ 3D Animation Complete in ${elapsed}s!`);

  // 3. Hardware Video Muxing (NVENC H.264 + Subtitles + Audio)
  const finalVideo = path.join(outDir, `${slug}_reel.mp4`);
  const frameFiles = fs.readdirSync(framesDir).filter(f => f.startsWith('frame_') && f.endsWith('.jpg'));
  const sampleFrame = frameFiles[0];
  const numDigits = sampleFrame.match(/\d+/)?.[0]?.length || 4;
  const framePattern = `frame_%0${numDigits}d.jpg`;

  const relFrames = path.relative(PROJECT_ROOT, path.join(framesDir, framePattern)).replace(/\\/g, '/');
  const relAudio = path.relative(PROJECT_ROOT, masterAudio).replace(/\\/g, '/');
  const relAss = path.relative(PROJECT_ROOT, assPath).replace(/\\/g, '/').replace(/:/g, '\\:');

  console.log(`\n🎬 Muxing NVENC H.264 with master audio & kinetic subtitles...`);
  const muxCmd = `ffmpeg -y -framerate 30 -i "${relFrames}" -i "${relAudio}" -vf "ass='${relAss}'" -c:v h264_nvenc -preset p5 -b:v 8M -c:a aac -b:a 192k -pix_fmt yuv420p "${finalVideo}"`;
  try {
    execSync(muxCmd, { stdio: 'inherit' });
  } catch (err) {
    const cpuMux = `ffmpeg -y -framerate 30 -i "${relFrames}" -i "${relAudio}" -vf "ass='${relAss}'" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -pix_fmt yuv420p "${finalVideo}"`;
    execSync(cpuMux, { stdio: 'inherit' });
  }

  const stat = fs.statSync(finalVideo);
  console.log(`\n🎉 FIXED MASTER VIDEO READY: [${path.basename(finalVideo)}](file:///${finalVideo.replace(/\\/g, '/')})`);
  console.log(`   • Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);

  // 4. Multi-platform publish
  console.log('\n===========================================================================');
  console.log('🚀 [PUBLISHING AGENT] Multi-platform publish triggered for fixed episode...');
  console.log('===========================================================================');
  const pubCmd = `node scripts/publish_phase2.js --video "${finalVideo}" --manifest "${manifestPath}"`;
  execSync(pubCmd, { stdio: 'inherit' });
  console.log('\n🎉 ALL PLATFORMS RE-PUBLISHED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('❌ Re-render & publish failed:', err);
  process.exit(1);
});
