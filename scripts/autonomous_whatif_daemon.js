/**
 * 24-Hour Autonomous Scheduler & Daemon for "What-If" 2D Cartoon Series
 * 
 * Features:
 * - Strict 4.5-Hour Cooldown Guard (prevents algorithm spam penalties).
 * - Multi-Platform Distribution:
 *     * YouTube Shorts (English Master with Adam Voice)
 *     * Facebook Page Reels (Hindi Master with Madhur Voice)
 *     * Instagram Telegram 1-Tap Mobile Dispatch
 * - Auto-Episode Advancement: Ep #1 -> Ep #2 -> Ep #3 -> Ep #4 -> Ep #5.
 * - Continuous Monitoring & State Persistence in data/upload_history.json.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const HISTORY_PATH = path.join(PROJECT_ROOT, 'data', 'upload_history.json');
const COOLDOWN_HOURS = 4.5;

const EPISODE_QUEUE = [
  {
    episode: '#1',
    title: 'What If Everyone Got $1,000,000 At Midnight? 🤯💸',
    topic: 'the $1M midnight hyperinflation paradox',
  },
  {
    episode: '#2',
    title: 'What If the Global Internet Was Deleted for 72 Hours? 🔌⚠️',
    topic: 'global internet blackout & flight navigation collapse',
  },
  {
    episode: '#3',
    title: 'What If Every Human Slept for 7 Days Straight? 💤🌍',
    topic: 'silent world & automated power grid meltdown',
  },
  {
    episode: '#4',
    title: 'What If Oxygen Doubled for Exactly 5 Minutes? 🫁🔥',
    topic: 'atmospheric hyperoxia, giant insects & spontaneous combustion',
  },
  {
    episode: '#5',
    title: 'What If Nobody Spent a Single Dollar for 30 Days? 🛑💵',
    topic: 'total economic freeze & supply chain zero-point',
  },
];

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
    allowed: elapsedHours >= COOLDOWN_HOURS,
    elapsedHours: parseFloat(elapsedHours.toFixed(2)),
    remainingHours: parseFloat(Math.max(0, COOLDOWN_HOURS - elapsedHours).toFixed(2)),
    lastUpload,
  };
}

function getNextEpisode() {
  const history = getUploadHistory();
  const uploadedEpisodes = new Set(history.uploads.map((u) => u.episode));
  for (const ep of EPISODE_QUEUE) {
    if (!uploadedEpisodes.has(ep.episode)) {
      return ep;
    }
  }
  return null;
}

console.log('===============================================================');
console.log('⏰ 24-HOUR AUTONOMOUS "WHAT-IF" SCHEDULER & PIPELINE MONITOR');
console.log(`   Cooldown Interval: ${COOLDOWN_HOURS} hours between uploads`);
console.log('===============================================================\n');

function runCycle() {
  const cd = checkCooldown();
  const nextEp = getNextEpisode();

  console.log(`[${new Date().toLocaleTimeString()}] Status Check:`);
  console.log(`  - Last Upload: ${cd.lastUpload ? `${cd.lastUpload.episode} (${cd.elapsedHours}h ago)` : 'None'}`);
  console.log(`  - Next Eligible Window: in ${cd.remainingHours} hours`);
  console.log(`  - Next Queued Episode: ${nextEp ? `${nextEp.episode} - "${nextEp.title}"` : 'All queued episodes completed!'}`);

  if (cd.allowed && nextEp) {
    console.log(`\n🚀 COOLDOWN ELAPSED! Triggering Autonomous Publish for ${nextEp.episode}...`);
    try {
      execSync(`node scripts/publish_whatif.js --episode "${nextEp.episode}"`, { stdio: 'inherit', cwd: PROJECT_ROOT });
      console.log(`✅ ${nextEp.episode} cycle completed successfully.`);
    } catch (err) {
      console.error(`❌ Cycle execution error for ${nextEp.episode}:`, err.message);
    }
  }
}

// Initial check
runCycle();

// Check every 5 minutes
const INTERVAL_MS = 5 * 60 * 1000;
setInterval(runCycle, INTERVAL_MS);
console.log(`\n🛰️ Autonomous daemon is active. Polling every 5 minutes for next 24 hours.\n`);
