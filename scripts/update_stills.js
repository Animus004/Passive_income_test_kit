import { execSync } from 'child_process';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';
const STILLS = [
  { frame: 550, name: 'scene_04_atm_banking_decline.jpg' },
  { frame: 760, name: 'scene_05_supermarket_empty_shelves.jpg' },
  { frame: 1180, name: 'scene_07_trading_floor_chocolate.jpg' },
];

STILLS.forEach(s => {
  const outPath = path.join(ARTIFACT_DIR, s.name).replace(/\\/g, '/');
  console.log(`Re-rendering ${s.name}...`);
  execSync(`npx remotion still src/index.ts WhalterTrue "${outPath}" --frame=${s.frame} --image-format=jpeg --jpeg-quality=90`, { stdio: 'inherit' });
});
console.log('Done!');
