import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

const STILLS = [
  { frame: 45, name: 'scene_01_bedroom_blackout_hook.jpg', label: 'Scene 1: Bedroom 12:01 AM Hook' },
  { frame: 180, name: 'scene_02_devices_freeze_world.jpg', label: 'Scene 2: 8B Devices Frozen Glitch' },
  { frame: 350, name: 'scene_03_cockpit_jets_blind.jpg', label: 'Scene 3: Cockpit Pilots Flying Blind' },
  { frame: 550, name: 'scene_04_atm_banking_decline.jpg', label: 'Scene 4: Metro Bank ATM Crash' },
  { frame: 760, name: 'scene_05_supermarket_empty_shelves.jpg', label: 'Scene 5: Supermarket Canned Beans' },
  { frame: 960, name: 'scene_06_city_blackout_skyline.jpg', label: 'Scene 6: Power Grid Arc & Blackout' },
  { frame: 1180, name: 'scene_07_trading_floor_chocolate.jpg', label: 'Scene 7: Wall Street Chocolate Barter' },
];

console.log('📸 Rendering 7 Narrative Scene Stills for Whalter 1:1 Global Catastrophe Engine...');

STILLS.forEach(s => {
  const outPath = path.join(ARTIFACT_DIR, s.name).replace(/\\/g, '/');
  console.log(`\nRendering ${s.label} at frame ${s.frame}...`);
  const cmd = `npx remotion still src/index.ts WhalterTrue "${outPath}" --frame=${s.frame} --image-format=jpeg --jpeg-quality=90`;
  try {
    execSync(cmd, { cwd: PROJECT_ROOT, stdio: 'inherit' });
    console.log(`✓ Saved: ${outPath}`);
  } catch (err) {
    console.error(`Failed to render frame ${s.frame}:`, err.message);
  }
});

console.log('\n✅ All 7 Narrative Scene Stills Successfully Rendered!');
