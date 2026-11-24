import path from 'path';
import { fileURLToPath } from 'url';
import { publishPhase1 } from './publish_phase1.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  const enVideo = path.join(PROJECT_ROOT, 'out', 'oddly_auto_en.mp4');
  const hiVideo = path.join(PROJECT_ROOT, 'out', 'oddly_auto_hi.mp4');

  const titleEn = 'COFFEE SHOPS ARE A HOSTAGE CRISIS';
  const titleHi = '₹800 KI COFFEE KA SAAZISH';
  const descriptionEn = 'Why ordering a simple black coffee in 2026 is legally a high-stakes hostage negotiation. #Shorts #OddlyTold #FocusFuel #CoffeeAddict #Comedy #Animation';
  const descriptionHi = 'Fancy coffee shop me ek simple coffee mangna kidnapping situation ban gaya! #Reels #Hinglish #Relatable #Hindi #Comedy #ViralReels';

  console.log('🚀 [VIRAL MORNING PUBLISHER] Initiating publication to Phase 1 channels...');

  const results = await publishPhase1({
    videoEnPath: enVideo,
    videoHiPath: hiVideo,
    titleEn,
    titleHi,
    descriptionEn,
    descriptionHi,
    isDryRun: false,
  });

  console.log('\n======================================================');
  console.log('🎉 [PUBLISH RESULTS]:', JSON.stringify(results, null, 2));
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('❌ Publish error:', err);
  process.exit(1);
});
