import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const PROJECT_ROOT = 'd:\\New folder (2)';

console.log('=================================================================');
console.log('🚀 DUAL-LANGUAGE MASTER PRODUCTION RENDER INITIATED');
console.log('   Episode: "The Great Boston Molasses Tsunami of 1919"');
console.log('=================================================================');

try {
  console.log('\n🇬🇧 [1/2] RENDERING ENGLISH MASTER (MolassesShortEn - 2,451 frames)...');
  execSync('node scripts/render_molasses_master.js --lang=en', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
  console.log('\n✅ ENGLISH MASTER RENDER COMPLETED SUCCESSFULLY!');
} catch (err) {
  console.error('\n❌ English Master Render Failed:', err.message);
  process.exit(1);
}

try {
  console.log('\n🇮🇳 [2/2] RENDERING HINDI MASTER (MolassesShortHi - 2,600 frames)...');
  execSync('node scripts/render_molasses_master.js --lang=hi', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
  console.log('\n✅ HINDI MASTER RENDER COMPLETED SUCCESSFULLY!');
} catch (err) {
  console.error('\n❌ Hindi Master Render Failed:', err.message);
  process.exit(1);
}

console.log('=================================================================');
console.log('🎉 DUAL MASTER RENDER SUITE FINISHED WITH ZERO ERRORS!');
console.log('   - English Master: out/final_molasses_1919_en.mp4');
console.log('   - Hindi Master:   out/final_molasses_1919_hi.mp4');
console.log('=================================================================');
