import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { auditOddlyVideo } from './oddly_watchdog.js';
import { publishPhase1 } from './publish_phase1.js';
import { sendXPackageToTelegram } from './send_x_package_to_telegram.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const SCRATCH_DIR = path.join(PROJECT_ROOT, 'scratch');
const HISTORY_FILE = path.join(PROJECT_ROOT, 'data', 'oddly_history.json');
const scriptPath = path.join(SCRATCH_DIR, 'current_oddly_script.json');

async function main() {
  console.log('\n===============================================================');
  console.log('🚀 [PHASE 1] TONIGHT EPISODE RENDER & PUBLISH PIPELINE');
  console.log(`📅 Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  console.log('===============================================================');

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script file not found: ${scriptPath}`);
  }

  const scriptData = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  console.log(`🎬 Episode Topic: "${scriptData.topic}"`);
  console.log(`🇬🇧 English Title: "${scriptData.en.title}"`);
  console.log(`🇮🇳 Hindi Title: "${scriptData.hi.title}"`);

  // Step 1: Synthesize audio for both languages (EN: Kokoro, HI: Piper Local Neural)
  console.log('\n🎙️ [STEP 1] Synthesizing Dual Audio (EN: Kokoro-82M, HI: Local Piper Rohan)...');
  execSync(`python scripts/oddly_audio_synthesizer.py --script "${scriptPath.replace(/\\/g, '/')}" --lang all --hindi-engine piper`, {
    stdio: 'inherit',
  });

  // Step 2: Render Remotion Compositions
  console.log('\n🎬 [STEP 2] Rendering Remotion Compositions (EN & HI)...');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const enOut = path.join(OUT_DIR, 'oddly_auto_en.mp4');
  const hiOut = path.join(OUT_DIR, 'oddly_auto_hi.mp4');

  if (fs.existsSync(enOut)) fs.unlinkSync(enOut);
  if (fs.existsSync(hiOut)) fs.unlinkSync(hiOut);

  console.log('   • Rendering English Master Video (OddlyToldShortEn)...');
  execSync(`npx remotion render src/index.ts OddlyToldShortEn "${enOut.replace(/\\/g, '/')}" --concurrency=4 --gl=angle`, {
    stdio: 'inherit',
  });

  console.log('   • Rendering Hindi Master Video (OddlyToldShortHi)...');
  execSync(`npx remotion render src/index.ts OddlyToldShortHi "${hiOut.replace(/\\/g, '/')}" --concurrency=4 --gl=angle`, {
    stdio: 'inherit',
  });

  // Step 3: QA Watchdog Audit
  console.log('\n🛡️ [STEP 3] Running Watchdog QA Verification...');
  const enManifestPath = path.join(PROJECT_ROOT, 'src', 'data', 'oddly_manifest_en.json');
  const hiManifestPath = path.join(PROJECT_ROOT, 'src', 'data', 'oddly_manifest_hi.json');

  const enAudit = await auditOddlyVideo({
    videoPath: enOut,
    manifestPath: enManifestPath,
    language: 'en',
    topicTitle: scriptData.en.title,
  });

  const hiAudit = await auditOddlyVideo({
    videoPath: hiOut,
    manifestPath: hiManifestPath,
    language: 'hi',
    topicTitle: scriptData.hi.title,
  });

  if (!enAudit.passed || !hiAudit.passed) {
    console.error('❌ [WATCHDOG REJECTED] Video QA failed:');
    if (!enAudit.passed) console.error('   • EN Failed:', enAudit.errors);
    if (!hiAudit.passed) console.error('   • HI Failed:', hiAudit.errors);
    process.exit(1);
  }

  console.log('✅ Both videos passed Watchdog Quality Gates flawlessly!');

  // Step 4: Publish to Platforms
  console.log('\n🚀 [STEP 4] Publishing to Phase 1 Platforms...');
  const publishResults = await publishPhase1({
    videoEnPath: enOut,
    videoHiPath: hiOut,
    titleEn: scriptData.en.title,
    titleHi: scriptData.hi.title,
    descriptionEn: scriptData.en.description,
    descriptionHi: scriptData.hi.description,
    isDryRun: false,
  });

  console.log('\n📊 Publish Summary:', JSON.stringify(publishResults, null, 2));

  // Step 5: Send X (Twitter) package to Telegram
  console.log('\n📨 [STEP 5] Dispatching X package to Telegram...');
  try {
    const xManifest = {
      title: `${scriptData.en.title} 🏃‍♂️💨`,
      premise: scriptData.en.description,
      pinnedComment: "Ever experienced this exact 5:59 PM panic? What's your escape trick? 👇",
    };
    await sendXPackageToTelegram(enOut, xManifest);
  } catch (tgErr) {
    console.warn('⚠️ Telegram dispatch warning:', tgErr.message);
  }

  // Step 6: Record History
  try {
    let hist = [];
    if (fs.existsSync(HISTORY_FILE)) {
      hist = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
    hist.push({
      timestamp: new Date().toISOString(),
      topic: scriptData.topic,
      titleEn: scriptData.en.title,
      titleHi: scriptData.hi.title,
      enStreamMD5: enAudit.streamMD5,
      hiStreamMD5: hiAudit.streamMD5,
      published: true,
      results: publishResults,
    });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(hist, null, 2));
  } catch (hErr) { }

  console.log('\n🎉 [PHASE 1 TONIGHT COMPLETED SUCCESSFULLY] All videos rendered, audited, published, and dispatched!\n');
}

main().catch((err) => {
  console.error('\n💥 [FATAL ERROR]:', err);
  process.exit(1);
});
