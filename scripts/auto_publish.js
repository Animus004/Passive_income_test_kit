/**
 * Autonomous YouTube Shorts Publisher (Phase 1 Master Pipeline)
 * Direct alias to daily_run.js with --publish
 * Executes:
 * 1. Gemini 2.5 Flash Dynamic Multi-Cut Scripting (from data/topics.json)
 * 2. Unsplash B-Roll Downloader
 * 3. Edge-TTS Neural Voiceover & Dynamic Subtitle Synchronization
 * 4. Remotion High-Speed Render (KurzgesagtExplainer or DataDetective)
 * 5. Autonomous Multi-Platform Publishing (YouTube Shorts & Instagram Reels)
 */

const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function autoPublish() {
  return new Promise((resolve, reject) => {
    console.log('===============================================================');
    console.log('🤖 AUTONOMOUS MASTER PUBLISHER (PHASE 1 ENGINE)');
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);
    console.log('===============================================================\n');

    const child = spawn('node', ['scripts/daily_run.js', '--publish'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`daily_run.js exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

if (require.main === module) {
  autoPublish().catch((err) => {
    console.error('\n❌ Auto-publish error:', err.message);
    process.exit(1);
  });
}

module.exports = { autoPublish };
