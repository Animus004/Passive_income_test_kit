/**
 * Autonomous What-If Pipeline Runner for Windows Task Scheduler & Daemon Triggers
 * 
 * Executed at each scheduled slot (08:30 AM, 01:00 PM, 05:30 PM, 09:30 PM, 01:30 AM IST).
 * 
 * Responsibilities:
 * 1. Checks upload cooldown (minimum 3.8 hours gap to prevent algorithm suppression).
 * 2. Determines next unuploaded episode from data/upload_history.json.
 * 3. Enforces unskippable 5-Gate Watchdog verification before publishing.
 * 4. Executes multi-platform release:
 *    - YouTube Shorts: English Master with Christopher/Adam voice + English subtitles (All 5 slots)
 *    - Facebook Page Reels & Instagram Reels: Hindi Master with Madhur voice + Hinglish subtitles (Slots 1, 3, 4 only)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const HISTORY_PATH = path.join(PROJECT_ROOT, 'data', 'upload_history.json');
const MIN_COOLDOWN_HOURS = 3.8;

const QUEUED_EPISODES = ['#1', '#2', '#3', '#4', '#5'];

function getUploadHistory() {
  if (!fs.existsSync(HISTORY_PATH)) return { uploads: [] };
  try {
    return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  } catch (e) {
    return { uploads: [] };
  }
}

function checkCooldown() {
  const history = getUploadHistory();
  if (!history.uploads || history.uploads.length === 0) return { allowed: true, elapsedHours: 999 };
  const lastUpload = history.uploads[history.uploads.length - 1];
  const lastTime = new Date(lastUpload.timestamp).getTime();
  const now = Date.now();
  const elapsedHours = (now - lastTime) / (1000 * 60 * 60);
  return {
    allowed: elapsedHours >= MIN_COOLDOWN_HOURS,
    elapsedHours: parseFloat(elapsedHours.toFixed(2)),
    remainingHours: parseFloat(Math.max(0, MIN_COOLDOWN_HOURS - elapsedHours).toFixed(2)),
    lastUpload,
  };
}

function getNextUnuploadedEpisode() {
  const history = getUploadHistory();
  const uploadedEpisodes = new Set((history.uploads || []).map(u => u.episode));
  for (const ep of QUEUED_EPISODES) {
    if (!uploadedEpisodes.has(ep)) {
      return ep;
    }
  }
  return null;
}

async function run() {
  console.log('===============================================================');
  console.log(`⏰ [${new Date().toISOString()}] AUTONOMOUS WHAT-IF RUNNER TRIGGERED`);
  console.log('===============================================================');

  const cd = checkCooldown();
  console.log(`Status Check:`);
  console.log(`  - Last Upload: ${cd.lastUpload ? `${cd.lastUpload.episode} (${cd.elapsedHours}h ago)` : 'None'}`);
  console.log(`  - Cooldown Status: ${cd.allowed ? 'CLEAR (Eligible to Publish)' : `ACTIVE (${cd.remainingHours}h remaining)`}`);

  if (!cd.allowed) {
    console.log(`⏳ Cooldown active. Minimum gap between uploads is ${MIN_COOLDOWN_HOURS}h. Skipping cycle.`);
    return;
  }

  const nextEp = getNextUnuploadedEpisode();
  if (!nextEp) {
    console.log('ℹ️ All queued episodes (#1 to #5) have been successfully published!');
    return;
  }

  console.log(`\n🚀 Launching Autonomous Pipeline for Episode ${nextEp}...`);

  // AUTONOMOUS GENERATION & RENDERING GATE:
  // If target videos don't exist yet, render them automatically before publishing!
  const epNum = nextEp.replace('#', '');
  const enVideo = path.join(PROJECT_ROOT, 'out', `final_circletoon_whatif_ep${epNum}_adam.mp4`);
  const hiVideo = path.join(PROJECT_ROOT, 'out', `final_circletoon_whatif_ep${epNum}_hindi.mp4`);

  if (!fs.existsSync(enVideo)) {
    console.log(`\n⚙️ [AUTONOMOUS RENDER TRIGGER] Master English video missing for Episode ${nextEp}.`);
    console.log(`   Rendering Episode ${nextEp} via Whalter 1:1 Engine...`);
    const renderScript = path.join(PROJECT_ROOT, 'scripts', `render_whalter_ep${epNum}.js`);
    if (fs.existsSync(renderScript)) {
      execSync(`node "${renderScript}"`, { cwd: PROJECT_ROOT, stdio: 'inherit' });
    }
  }

  if (!fs.existsSync(hiVideo)) {
    console.log(`\n⚙️ [AUTONOMOUS RENDER TRIGGER] Master Hindi video missing for Episode ${nextEp}.`);
    console.log(`   Rendering Hindi Edition for Episode ${nextEp}...`);
    const renderScriptHi = path.join(PROJECT_ROOT, 'scripts', `render_whalter_ep${epNum}_hindi.js`);
    if (fs.existsSync(renderScriptHi)) {
      execSync(`node "${renderScriptHi}"`, { cwd: PROJECT_ROOT, stdio: 'inherit' });
    }
  }

  try {
    execSync(`node scripts/publish_whatif.js --episode "${nextEp}"`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    console.log(`\n✅ Episode ${nextEp} publishing cycle completed successfully.`);
  } catch (err) {
    console.error(`❌ Autonomous runner failed for Episode ${nextEp}:`, err.message);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
