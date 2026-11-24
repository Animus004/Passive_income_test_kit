import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RAW_VIDEO = String.raw`D:\New folder (2)\scratch\relatable_test\raw_relatable_latenight.mp4`;
const MASTER_AUDIO = String.raw`D:\New folder (2)\scratch\relatable_test\master_relatable.wav`;
const SUBTITLES = String.raw`D:\New folder (2)\scratch\relatable_test\relatable_subtitles.ass`;
const OUTPUT_MP4 = String.raw`D:\New folder (2)\out\final_relatable_3am_latenight_short.mp4`;
const ARTIFACT_MP4 = String.raw`C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\final_relatable_3am_latenight_short.mp4`;

console.log("🎬 Muxing 3:00 AM Late-Night Episode with Master Audio & Sleek Micro-Subtitles...");

if (!fs.existsSync(RAW_VIDEO)) {
  console.error("❌ Raw video does not exist yet:", RAW_VIDEO);
  process.exit(1);
}

// Convert Windows backslashes for FFmpeg filter path
const assFilterPath = SUBTITLES.replace(/\\/g, '/').replace(':', '\\:');

const cmd = `ffmpeg -y -i "${RAW_VIDEO}" -i "${MASTER_AUDIO}" -vf "subtitles='${assFilterPath}'" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${OUTPUT_MP4}"`;

console.log("Running FFmpeg...");
execSync(cmd, { stdio: 'inherit' });

console.log(`✅ Master Short rendered to: ${OUTPUT_MP4}`);

// Copy to artifact directory
fs.copyFileSync(OUTPUT_MP4, ARTIFACT_MP4);
console.log(`📋 Copied to artifact directory: ${ARTIFACT_MP4}`);

// Extract 4 proof frames with burnt-in subtitles
const proofFrames = [
  { sec: "00:00:03.5", name: "latenight_proof_f1_shrimp.jpg" },
  { sec: "00:00:10.5", name: "latenight_proof_f2_gemini_roast.jpg" },
  { sec: "00:00:18.5", name: "latenight_proof_f3_plea.jpg" },
  { sec: "00:00:27.0", name: "latenight_proof_f4_sleep.jpg" }
];

proofFrames.forEach(pf => {
  const proofOut = path.join(`C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607`, pf.name);
  execSync(`ffmpeg -y -ss ${pf.sec} -i "${OUTPUT_MP4}" -vframes 1 -q:v 2 "${proofOut}"`, { stdio: 'ignore' });
  console.log(`📸 Proof frame saved: ${pf.name}`);
});

console.log("🎉 All 3:00 AM Late-Night production assets certified!");
