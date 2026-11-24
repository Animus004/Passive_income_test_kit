import path from 'path';
import { fileURLToPath } from 'url';
import { uploadPhase1Instagram } from './publish_phase1.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  const hiVideo = path.join(PROJECT_ROOT, 'out', 'oddly_auto_hi.mp4');
  const caption = 'Tumhara Dimag 20% Energy Autopilot Par Kharch Karta Hai ⚡️🧠\n\nKyun tumhara dimag 80% battery background autopilot par kharch karta hai? #Reels #Hinglish #BrainFacts #Hindi #OddlyTold';

  console.log('📸 Publishing viral Hindi reel to Instagram...');
  const res = await uploadPhase1Instagram({
    videoPath: hiVideo,
    caption,
  });
  console.log('🎉 Instagram Result:', res);
}

main().catch(err => {
  console.error('❌ IG Error:', err);
  process.exit(1);
});
