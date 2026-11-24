import { execSync } from 'child_process';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';
const outPath = path.join(ARTIFACT_DIR, 'scene_05_supermarket_empty_shelves.jpg').replace(/\\/g, '/');
console.log('Re-rendering Scene 5...');
execSync(`npx remotion still src/index.ts WhalterTrue "${outPath}" --frame=760 --image-format=jpeg --jpeg-quality=90`, { stdio: 'inherit' });
console.log('Done!');
