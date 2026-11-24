import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { publishPhase1 } from './publish_phase1.js';

const PROJECT_ROOT = 'd:\\New folder (2)';
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

async function main() {
  console.log('===============================================================');
  console.log('🚀 PHASE 1 (2D ODDLY TOLD) RENDER & MULTI-PLATFORM PUBLISH');
  console.log('===============================================================');

  const enOut = path.join(OUT_DIR, 'oddly_auto_en.mp4');
  const hiOut = path.join(OUT_DIR, 'oddly_auto_hi.mp4');

  if (fs.existsSync(enOut)) fs.unlinkSync(enOut);
  if (fs.existsSync(hiOut)) fs.unlinkSync(hiOut);

  // 1. Render English Master
  console.log('\n🎬 [1/4] Rendering English 2D Master (OddlyToldShortEn)...');
  const t0_en = Date.now();
  execSync(`npx remotion render src/index.ts OddlyToldShortEn "${enOut.replace(/\\/g, '/')}" --concurrency=2 --gl=angle`, {
    stdio: 'inherit',
    cwd: PROJECT_ROOT
  });
  console.log(`✅ English 2D Master rendered in ${((Date.now() - t0_en) / 1000).toFixed(1)}s! (${(fs.statSync(enOut).size / 1024 / 1024).toFixed(2)} MB)`);

  // 2. Render Hindi Master
  console.log('\n🎬 [2/4] Rendering Hindi 2D Master (OddlyToldShortHi)...');
  const t0_hi = Date.now();
  execSync(`npx remotion render src/index.ts OddlyToldShortHi "${hiOut.replace(/\\/g, '/')}" --concurrency=2 --gl=angle`, {
    stdio: 'inherit',
    cwd: PROJECT_ROOT
  });
  console.log(`✅ Hindi 2D Master rendered in ${((Date.now() - t0_hi) / 1000).toFixed(1)}s! (${(fs.statSync(hiOut).size / 1024 / 1024).toFixed(2)} MB)`);

  // 3. QA Verification & Artifact Stills
  console.log('\n🛡️ [3/4] Extracting QA Stills & Copying Artifacts...');
  try {
    execSync(`ffmpeg -y -ss 00:00:04 -i "${enOut}" -frames:v 1 -q:v 2 "scratch/qa_2d_en_battery.jpg"`, { stdio: 'ignore' });
    execSync(`ffmpeg -y -ss 00:00:04 -i "${hiOut}" -frames:v 1 -q:v 2 "scratch/qa_2d_hi_battery.jpg"`, { stdio: 'ignore' });
    fs.copyFileSync('scratch/qa_2d_en_battery.jpg', path.join(ARTIFACT_DIR, 'qa_2d_en_battery.jpg'));
    fs.copyFileSync('scratch/qa_2d_hi_battery.jpg', path.join(ARTIFACT_DIR, 'qa_2d_hi_battery.jpg'));
    fs.copyFileSync(enOut, path.join(ARTIFACT_DIR, 'oddly_auto_en.mp4'));
    fs.copyFileSync(hiOut, path.join(ARTIFACT_DIR, 'oddly_auto_hi.mp4'));
    console.log('✅ QA Stills & Master Video Artifacts copied successfully!');
  } catch (err) {
    console.warn('⚠️ Notice during QA copy:', err.message);
  }

  // 4. Multi-Platform Autonomous Publish
  console.log('\n🚀 [4/4] Publishing Phase 1 2D Videos to YouTube, Instagram & Facebook...');
  const titleEn = 'Your Brain Burns 20% Energy On Autopilot ⚡️🧠';
  const titleHi = 'Tumhara Dimag 20% Energy Autopilot Par Kharch Karta Hai ⚡️🧠';
  const descEn = 'Your brain consumes 20% of your body energy on autopilot until your battery drops to 15%! #Shorts #FocusFuel #BrainHacks #OddlyTold #Animation';
  const descHi = 'Kyun tumhara dimag 80% battery background autopilot par kharch karta hai? #Reels #Hinglish #BrainFacts #Hindi #OddlyTold';

  const publishResults = await publishPhase1({
    videoEnPath: enOut,
    videoHiPath: hiOut,
    titleEn,
    titleHi,
    descriptionEn: descEn,
    descriptionHi: descHi,
    isDryRun: false
  });

  console.log('\n===============================================================');
  console.log('🎉 PHASE 1 (2D ODDLY TOLD) PIPELINE COMPLETE!');
  console.log('Publish Summary:', JSON.stringify(publishResults, null, 2));
  console.log('===============================================================');
}

main().catch(err => {
  console.error('\n❌ Phase 1 pipeline failed:', err);
  process.exit(1);
});
