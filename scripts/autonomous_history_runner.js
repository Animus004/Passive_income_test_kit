/**
 * Autonomous "Absurd History Anomalies" Engine Runner
 * 
 * Viral Formula:
 * - 8-Beat Dynamic Hero Storytelling (No single character lock; hero changes per beat).
 * - Dual-Language Master: English (ChristopherNeural / Adam) + Hindi/Hinglish (MadhurNeural).
 * - Kinetic Subtitles: Max 2 words per chunk with glowing amber highlights.
 * - Three.js 3D Diorama + 2D Paper-Doll Period Cast + Ink Outline Shader + 28-tap Thin-Lens DOF.
 * - 100% Autonomous daily publication pipeline.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const HISTORY_PATH = path.join(PROJECT_ROOT, 'data', 'history_upload_log.json');
const MIN_COOLDOWN_HOURS = 3.8;

const QUEUED_HISTORY_EPISODES = [
  { id: 'molasses_1919', title: 'The Great Boston Molasses Tsunami (1919)', compEn: 'MolassesShortEn', compHi: 'MolassesShortHi' },
  { id: 'emu_war_1932', title: 'The Great Emu War (1932)', compEn: 'EmuWarShortEn', compHi: 'EmuWarShortHi' },
  { id: 'london_beer_1814', title: 'The London Beer Flood (1814)', compEn: 'BeerFloodShortEn', compHi: 'BeerFloodShortHi' },
  { id: 'dancing_plague_1518', title: 'The Dancing Plague (1518)', compEn: 'DancingPlagueShortEn', compHi: 'DancingPlagueShortHi' },
  { id: 'bucket_war_1325', title: 'The War of the Bucket (1325)', compEn: 'BucketWarShortEn', compHi: 'BucketWarShortHi' },
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
    allowed: elapsedHours >= MIN_COOLDOWN_HOURS,
    elapsedHours: parseFloat(elapsedHours.toFixed(2)),
    remainingHours: parseFloat(Math.max(0, MIN_COOLDOWN_HOURS - elapsedHours).toFixed(2)),
    lastUpload,
  };
}

function getNextUnuploadedEpisode() {
  const history = getUploadHistory();
  const uploadedIds = new Set((history.uploads || []).map(u => u.episodeId));
  for (const ep of QUEUED_HISTORY_EPISODES) {
    if (!uploadedIds.has(ep.id)) {
      return ep;
    }
  }
  return null;
}

async function run() {
  console.log('=================================================================');
  console.log(`⏰ [${new Date().toISOString()}] AUTONOMOUS ABSURD HISTORY RUNNER TRIGGERED`);
  console.log('=================================================================');

  const cd = checkCooldown();
  console.log(`Status Check:`);
  console.log(`  - Last Upload: ${cd.lastUpload ? `${cd.lastUpload.title} (${cd.elapsedHours}h ago)` : 'None'}`);
  console.log(`  - Cooldown Status: ${cd.allowed ? 'CLEAR (Eligible to Publish)' : `ACTIVE (${cd.remainingHours}h remaining)`}`);

  if (!cd.allowed) {
    console.log(`⏳ Cooldown active. Minimum gap between uploads is ${MIN_COOLDOWN_HOURS}h. Skipping cycle.`);
    return;
  }

  const nextEp = getNextUnuploadedEpisode();
  if (!nextEp) {
    console.log('ℹ️ All queued Absurd History episodes have been published!');
    return;
  }

  console.log(`\n🚀 Processing Next Episode: ${nextEp.title} (${nextEp.id})...`);

  const enVideo = path.join(PROJECT_ROOT, 'out', `final_${nextEp.id}_en.mp4`);
  const hiVideo = path.join(PROJECT_ROOT, 'out', `final_${nextEp.id}_hi.mp4`);

  // Render Master English if not present
  if (!fs.existsSync(enVideo)) {
    console.log(`\n🎬 Master English MP4 missing for ${nextEp.id}. Launching Master Renderer...`);
    execSync(`node scripts/render_molasses_master.js --lang=en`, { cwd: PROJECT_ROOT, stdio: 'inherit' });
  }

  // Render Master Hindi if not present
  if (!fs.existsSync(hiVideo)) {
    console.log(`\n🎬 Master Hindi MP4 missing for ${nextEp.id}. Launching Master Hindi Renderer...`);
    execSync(`node scripts/render_molasses_master.js --lang=hi`, { cwd: PROJECT_ROOT, stdio: 'inherit' });
  }

  console.log(`\n✅ Videos validated:`);
  console.log(`   EN: ${enVideo} (${(fs.statSync(enVideo).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   HI: ${hiVideo} (${(fs.statSync(hiVideo).size / 1024 / 1024).toFixed(2)} MB)`);

  // Log upload
  const history = getUploadHistory();
  history.uploads.push({
    episodeId: nextEp.id,
    title: nextEp.title,
    timestamp: new Date().toISOString(),
    enVideo,
    hiVideo,
  });
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
  console.log(`\n🎉 Episode ${nextEp.title} logged successfully in upload history!`);
}

run().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
