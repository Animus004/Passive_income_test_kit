/**
 * Master End-to-End Orchestrator for Phase 2 3D Multi-Agent Comedy Animation
 * 
 * Flow:
 * 1. AI Script Generation (Gemini 2.5 Flash)
 * 2. Multi-Agent Voice Synthesis (Edge-TTS) & Timeline Manifest
 * 3. Stylized Subtitle Generation (.ass)
 * 4. Blender 4.3 EEVEE Next 3D Animation & Camera Switching Render
 * 5. FFmpeg Subtitle Burn & Audio Normalization
 * 6. Ready-to-Publish Final 9:16 Short MP4
 */

import { generateAgentComedyScript } from './generate_agent_comedy_script.js';
import { synthesizeMultiAgentAudio } from './synthesize_multi_agent_audio.js';
import { generateAssSubtitles } from './generate_captions.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BLENDER_BIN = "D:\\Programs\\blender\\blender-4.3.0-windows-x64\\blender.exe";
const BLEND_STAGE = "D:\\New folder (2)\\blender_engine\\agent_comedy_stage.blend";
const ANIMATE_SCRIPT = "D:\\New folder (2)\\blender_engine\\scripts\\animate_agent_comedy.py";
const OUTPUT_DIR = "D:\\New folder (2)\\blender_engine\\output";

export async function produceComedyEpisode(options = {}) {
  const customPremise = typeof options === 'string' ? options : options.customPremise;
  const reuseManifest = options.reuseManifest || process.argv.includes('--reuse-manifest');

  console.log("\n=======================================================");
  console.log("🎬 STARTING PHASE 2: 3D MULTI-AGENT COMEDY PRODUCTION");
  console.log("=======================================================\n");

  const startTime = Date.now();
  let manifest;
  let script;

  const manifestPath = path.join(OUTPUT_DIR, "dialogue_manifest.json");

  if (reuseManifest && fs.existsSync(manifestPath)) {
    console.log(`♻️ Reusing existing dialogue manifest: ${manifestPath}`);
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    script = { title: manifest.title, premise: manifest.premise, lines: manifest.lines };
  } else {
    // 1. Generate Script
    console.log("🧠 Step 1: Generating viral script via Gemini 2.5 Flash...");
    script = await generateAgentComedyScript(customPremise);
    console.log(`📌 Title: ${script.title}`);
    console.log(`💡 Premise: ${script.premise}`);
    console.log(`💬 Lines count: ${script.lines.length}\n`);

    // 2. Synthesize Audio & Manifest
    console.log("🎙️ Step 2: Synthesizing multi-agent voices (Edge-TTS)...");
    manifest = await synthesizeMultiAgentAudio(script, OUTPUT_DIR);
  }

  // 3. Generate Subtitles
  console.log("📝 Step 3: Generating stylized subtitles...");
  const assPath = path.join(OUTPUT_DIR, "subtitles.ass");
  generateAssSubtitles(manifest, assPath);

  // 4. Render 3D Animation via Blender 4.3 EEVEE Next
  console.log(`\n🚀 Step 4: Rendering 3D animation in Blender 4.3 (${manifest.totalFrames} frames)...`);
  const rawVideoPath = path.join(OUTPUT_DIR, "raw_render.mp4");

  const blenderCmd = `"${BLENDER_BIN}" -b "${BLEND_STAGE}" -P "${ANIMATE_SCRIPT}" -- --manifest "${manifestPath}" --output "${rawVideoPath}"`;
  
  execSync(blenderCmd, { stdio: 'inherit' });

  // 5. Burn Subtitles & Final Polish with FFmpeg
  console.log("\n✨ Step 5: Burning stylized captions & finalizing audio with FFmpeg...");
  const finalVideoPath = path.join(OUTPUT_DIR, "final_comedy_short.mp4");
  
  // Format ASS path for FFmpeg filter on Windows
  const escapedAss = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  
  const ffmpegCmd = `ffmpeg -y -i "${rawVideoPath}" -i "${manifest.masterAudioPath}" -map 0:v:0 -map 1:a:0 -t ${manifest.totalDurationSec.toFixed(3)} -vf "subtitles='${escapedAss}'" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -pix_fmt yuv420p -movflags +faststart "${finalVideoPath}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n=======================================================");
  console.log("🎉 EPISODE PRODUCTION COMPLETE!");
  console.log(`📁 Final Output Video: ${finalVideoPath}`);
  console.log(`⏱️ Total Production Time: ${elapsedSec}s`);
  console.log("=======================================================\n");

  return {
    title: script.title,
    premise: script.premise,
    videoPath: finalVideoPath,
    durationSec: manifest.totalDurationSec
  };
}

// Standalone CLI execution
if (process.argv[1]?.endsWith('render_phase2_episode.js')) {
  produceComedyEpisode().catch(err => {
    console.error("❌ Production failed:", err);
    process.exit(1);
  });
}

