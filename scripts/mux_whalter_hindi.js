import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');

const MASTER_VIDEO = path.join(OUT_DIR, 'final_whalter_whatif_ep2.mp4');
const HINDI_TARGET = path.join(OUT_DIR, 'final_circletoon_whatif_ep2_hindi.mp4');
const HINDI_WHALTER = path.join(OUT_DIR, 'final_whalter_whatif_ep2_hindi.mp4');

const voicePath = path.join(PROJECT_ROOT, 'public', 'voiceover_ep2_hi.mp3').replace(/\\/g, '/');
const ambientPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');
const whooshPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'whoosh.mp3').replace(/\\/g, '/');
const boomPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'sub_boom.mp3').replace(/\\/g, '/');
const glitchPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'glitch.mp3').replace(/\\/g, '/');
const alarmPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'alarm.mp3').replace(/\\/g, '/');
const thudPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'thud.mp3').replace(/\\/g, '/');

console.log('🎬 Muxing Hindi Audio Master with Whalter Animation...');

const filterGraph = [
  `[1:a]volume=1.0[v_clean]`,
  `[2:a]volume=0.08[bg_clean]`,
  `[3:a]adelay=0|0,volume=0.35[sfx_start]`,
  `[4:a]adelay=500|500,volume=0.45[sfx_boom]`,
  `[5:a]adelay=5000|5000,volume=0.4[sfx_freeze_glitch]`,
  `[6:a]adelay=10100|10100,volume=0.35[sfx_radar_alarm]`,
  `[7:a]adelay=16600|16600,volume=0.4[sfx_atm_thud]`,
  `[8:a]adelay=24500|24500,volume=0.35[sfx_supply_alarm]`,
  `[v_clean][bg_clean][sfx_start][sfx_boom][sfx_freeze_glitch][sfx_radar_alarm][sfx_atm_thud][sfx_supply_alarm]amix=inputs=8:duration=first:dropout_transition=2[a_mix]`
].join(';');

const ffmpegCmd = `ffmpeg -y -i "${MASTER_VIDEO.replace(/\\/g, '/')}" -i "${voicePath}" -stream_loop -1 -i "${ambientPath}" -i "${whooshPath}" -i "${boomPath}" -i "${glitchPath}" -i "${alarmPath}" -i "${thudPath}" -i "${boomPath}" -filter_complex "${filterGraph}" -map 0:v -map "[a_mix]" -c:v copy -c:a aac -b:a 192k -shortest "${HINDI_TARGET.replace(/\\/g, '/')}"`;

execSync(ffmpegCmd, { stdio: 'inherit' });
fs.copyFileSync(HINDI_TARGET, HINDI_WHALTER);
console.log(`✅ Hindi Master Compiled: ${HINDI_TARGET}`);
