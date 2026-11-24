import path from 'path';
import { fileURLToPath } from 'url';
import { publishPhase1 } from './publish_phase1.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const videoPath = path.join(PROJECT_ROOT, 'out', 'oddly_auto_hi.mp4');
const titleHi = 'सैलरी आते ही 5 तारीख को जीरो? मिडिल-क्लास वेल्थ ट्रैप';
const titleEn = 'SALARY AATE HI 5 TAREEKH KO ZERO? MIDDLE-CLASS WEALTH TRAP';
const description = `सैलरी क्रेडिट का SMS आया... और 5 तारीख को अकाउंट में जीरो बैलेंस! क्यों हर महीने मिडिल क्लास इस वेल्थ ट्रैप में फंसा रहता है?

#Shorts #RightTurnWrongMoves #OddlyTold #MoneyTraps #Finance #HindiShorts #PersonalFinance #Wealth`;

async function main() {
  console.log('🚀 Publishing verified Phase 1 episode live across YouTube, Instagram, and Facebook...');
  const result = await publishPhase1({
    videoHiPath: videoPath,
    videoEnPath: videoPath,
    titleEn,
    titleHi,
    descriptionEn: description,
    descriptionHi: description,
    isDryRun: false,
  });

  console.log('\n======================================================');
  console.log('🎯 LIVE PUBLISH RESULTS:');
  console.log(JSON.stringify(result, null, 2));
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal Publish Error:', err);
  process.exit(1);
});
