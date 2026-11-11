/**
 * Master Pipeline Runner
 * Runs the end-to-end flow:
 * 1. Generate Voiceover + Word-level timestamps via free edge-tts
 * 2. Calculate dynamic duration
 * 3. Render vertical 1080x1920 MP4 via Remotion CLI
 */

const { generateAudio } = require('./generate_audio');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runPipeline() {
  console.log('===============================================================');
  console.log('🚀 PROGRAMMATIC YOUTUBE SHORTS / REELS AUTOMATION PIPELINE');
  console.log('===============================================================\n');

  // Step 1: Generate Audio and Word Timestamps
  console.log('STEP 1: Generating Voiceover & Word-Level Timestamps...');
  const audioResult = await generateAudio();
  const { metadata } = audioResult;

  // Step 2: Ensure out directory exists
  const projectRoot = path.resolve(__dirname, '..');
  const outDir = path.join(projectRoot, 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const finalVideoPath = path.join(outDir, 'final_short.mp4');

  // Step 3: Render via Remotion CLI
  console.log('STEP 2: Rendering Vertical 1080x1920 MP4 with Remotion...');
  console.log(`Target Output: ${finalVideoPath}`);
  console.log(`Video Dimensions: 1080x1920 @ 30fps`);
  console.log(`Duration: ${metadata.totalDurationSeconds}s (${metadata.totalFrames} frames)`);

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const renderArgs = [
    'remotion',
    'render',
    'src/index.ts',
    'ShortVideo',
    'out/final_short.mp4',
    '--overwrite'
  ];

  console.log(`Executing: npx ${renderArgs.join(' ')}\n`);

  await new Promise((resolve, reject) => {
    const child = spawn(npxCmd, renderArgs, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Remotion render failed with exit code ${code}`));
      }
      resolve();
    });

    child.on('error', (err) => {
      reject(err);
    });
  });

  if (!fs.existsSync(finalVideoPath)) {
    throw new Error(`Expected output file not found at ${finalVideoPath}`);
  }

  const stats = fs.statSync(finalVideoPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n===============================================================');
  console.log('🎉 PIPELINE COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
  console.log(`📁 Rendered Video: ${finalVideoPath}`);
  console.log(`📊 File Size: ${sizeMb} MB`);
  console.log(`⏱️ Duration: ${metadata.totalDurationSeconds}s (${metadata.totalFrames} frames @ 30fps)`);
  console.log(`📐 Resolution: 1080 x 1920 (9:16 Vertical Video)`);
  console.log('\nNext steps:');
  console.log('  - Preview your short locally: start out/final_short.mp4');
  console.log('  - Upload to YouTube: npm run upload');
  console.log('===============================================================\n');
}

if (require.main === module) {
  runPipeline().catch((err) => {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
  });
}

module.exports = { runPipeline };

