import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const PROJECT_ROOT = 'd:\\New folder (2)';
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

const testFrames = [
  { frame: 300, name: 'proof_molasses_beat2_painter.png' },
  { frame: 750, name: 'proof_molasses_beat3_heatwave.png' },
  { frame: 1000, name: 'proof_molasses_beat4_rivets.png' },
  { frame: 1200, name: 'proof_molasses_beat5_tsunami.png' },
  { frame: 1450, name: 'proof_molasses_beat6_tracks.png' },
  { frame: 1750, name: 'proof_molasses_beat7_firefighter.png' },
  { frame: 2000, name: 'proof_molasses_beat8_ketchup.png' },
  { frame: 2300, name: 'proof_molasses_beat8_pancakes.png' },
];

for (const tf of testFrames) {
  const outPath = path.join(PROJECT_ROOT, 'out', tf.name);
  console.log(`\n📸 Rendering frame ${tf.frame} -> ${tf.name}...`);
  try {
    execSync(`npx remotion still src/index.ts MolassesShortEn "${outPath}" --frame=${tf.frame}`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    const artifactPath = path.join(ARTIFACT_DIR, tf.name);
    fs.copyFileSync(outPath, artifactPath);
    console.log(`✅ Saved artifact: ${artifactPath}`);
  } catch (e) {
    console.error(`❌ Error rendering frame ${tf.frame}:`, e.message);
  }
}
