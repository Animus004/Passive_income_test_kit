/**
 * Universal Autonomous 3D Reel Engine Runner (Phase 3)
 * 
 * Orchestrates:
 * 1. Multi-Agent Production Chain (Showrunner, Visual Director, Audio Synthesizer, Manifest Assembler)
 * 2. EEVEE Next GPU 3D Scene Generation & Animation (Procedural Locomotion, Talking Visemes, Poly Haven CC0 Assets)
 * 3. Hardware-Accelerated NVENC Compositing & Mobile-Safe ASS Subtitles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

import {
  runShowrunner,
  runVisualDirector,
  runAudioSynthesizer,
  assembleMasterManifest
} from './multi_agent_pipeline.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLENDER_BIN = 'D:\\Programs\\blender\\blender-4.3.0-windows-x64\\blender.exe';
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
}

async function main() {
  const args = process.argv.slice(2);
  let topic = "How Apollo 11 Landed on the Moon";
  let qaOnly = false;
  let skipLLM = false;
  let voice = "en-US-ChristopherNeural";
  let targetDurationSec = 60;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topic = args[++i];
    } else if (args[i] === '--qa-only') {
      qaOnly = true;
    } else if (args[i] === '--skip-llm') {
      skipLLM = true;
    } else if (args[i] === '--voice' && args[i + 1]) {
      voice = args[++i];
    } else if (args[i] === '--duration' && args[i + 1]) {
      targetDurationSec = parseInt(args[++i], 10) || 60;
    }
  }

  const slug = slugify(topic);
  const runDir = path.join(PROJECT_ROOT, 'scratch', 'autonomous_phase3', slug);
  const framesDir = path.join(runDir, 'frames');
  const qaDir = path.join(runDir, 'qa');
  const outDir = path.join(PROJECT_ROOT, 'out', 'universal_reels');
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(framesDir, { recursive: true });
  fs.mkdirSync(qaDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  const manifestPath = path.join(runDir, 'episode_manifest.json');
  console.log('='.repeat(70));
  console.log(`🎬 UNIVERSAL AUTONOMOUS 3D REEL ENGINE (PHASE 3)`);
  console.log(`   • Topic: "${topic}"`);
  console.log(`   • Target Duration: ~${targetDurationSec}s`);
  console.log(`   • Mode: ${qaOnly ? 'QA STILLS VERIFICATION ONLY' : 'FULL 3D VIDEO PRODUCTION'}`);
  console.log(`   • Workspace: ${runDir}`);
  console.log('='.repeat(70));

  let manifest;
  let audioData;

  if (skipLLM && fs.existsSync(manifestPath)) {
    console.log(`\n⚡ [SKIP-LLM] Loading cached master manifest from: ${manifestPath}`);
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const sfxAudio = path.join(runDir, 'master_audio_with_sfx.wav');
    audioData = {
      masterAudioPath: fs.existsSync(sfxAudio) ? sfxAudio : path.join(runDir, 'master_voiceover.wav'),
      assPath: path.join(runDir, 'subtitles_minimal.ass'),
      totalFrames: manifest.totalFrames,
    };
  } else {
    // -------------------------------------------------------------------------
    // STAGE 1: AGENT 1 - SHOWRUNNER
    // -------------------------------------------------------------------------
    const scriptData = await runShowrunner(topic, targetDurationSec);

    // -------------------------------------------------------------------------
    // STAGE 2: AGENT 2 - VISUAL DIRECTOR
    // -------------------------------------------------------------------------
    const visualData = await runVisualDirector(topic, scriptData);

    // -------------------------------------------------------------------------
    // STAGE 3: AGENT 3 - AUDIO SYNTHESIZER
    // -------------------------------------------------------------------------
    audioData = await runAudioSynthesizer(scriptData, runDir, voice);

    // -------------------------------------------------------------------------
    // STAGE 4: AGENT 4 - MANIFEST ASSEMBLER
    // -------------------------------------------------------------------------
    manifest = assembleMasterManifest(scriptData, visualData, audioData);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`📁 Master manifest written to: ${manifestPath}`);
  }

  // ---------------------------------------------------------------------------
  // STAGE 5: BLENDER 4.3 EEVEE NEXT 3D ENGINE
  // ---------------------------------------------------------------------------
  const isSystemsEngineering = [
    'systems_engineering', 'aviation_aerodynamics', 'high_speed_rail',
    'cyber_infrastructure', 'industrial_engineering'
  ].includes(manifest.themeEra) || manifest.scenicBackdrop !== undefined;

  const directorScriptName = isSystemsEngineering
    ? 'systems_engineering_director.py'
    : 'universal_3d_director.py';

  const directorScript = path.join(PROJECT_ROOT, 'blender_engine', 'scripts', directorScriptName);
  console.log(`\n🎬 [ROUTING 3D DIRECTOR] Selected Engine: ${directorScriptName} (Era: ${manifest.themeEra})`);

  if (qaOnly) {
    console.log(`\n📸 Launching Blender EEVEE Next for High-Res QA Stills...`);
    const qaPrefix = path.join(qaDir, 'universal_qa_');
    const blenderCmd = `& "${BLENDER_BIN}" -b -P "${directorScript}" -- --manifest "${manifestPath}" --qa-stills --output "${qaPrefix}"`;
    console.log(`   Running: ${blenderCmd}`);
    const bRes = spawnSync('powershell.exe', ['-Command', blenderCmd], { stdio: 'inherit' });
    if (bRes.status !== 0) {
      throw new Error(`Blender QA still generation failed with code ${bRes.status}`);
    }

    // Copy QA stills to artifact dir for instant inspection
    const qaFiles = fs.readdirSync(qaDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    console.log(`\n✅ Generated ${qaFiles.length} QA Stills:`);
    for (const qf of qaFiles) {
      const src = path.join(qaDir, qf);
      const dst = path.join(ARTIFACT_DIR, `${slug}_${qf}`);
      fs.copyFileSync(src, dst);
      console.log(`   • [${qf}](file:///${src.replace(/\\/g, '/')}) -> copied to artifact [${slug}_${qf}](file:///${dst.replace(/\\/g, '/')})`);
    }
    console.log(`\n✨ QA Verification complete! Inspect stills above before full video render.`);
    return;
  }

  // Full Frame Render Mode
  console.log(`\n🚀 Launching Blender EEVEE Next for Full Sequence (${manifest.totalFrames} frames)...`);
  const framePattern = path.join(framesDir, 'frame_');
  const blenderRenderCmd = `& "${BLENDER_BIN}" -b -P "${directorScript}" -- --manifest "${manifestPath}" --frames --output "${framePattern}"`;
  console.log(`   Running: ${blenderRenderCmd}`);
  const startTime = Date.now();
  const bRes = spawnSync('powershell.exe', ['-Command', blenderRenderCmd], { stdio: 'inherit' });
  if (bRes.status !== 0) {
    throw new Error(`Blender animation render failed with code ${bRes.status}`);
  }
  const renderElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Blender 3D Frame Render Complete in ${renderElapsed}s!`);

  // Verify rendered frames
  const renderedFrames = fs.readdirSync(framesDir).filter(f => f.startsWith('frame_') && (f.endsWith('.jpg') || f.endsWith('.png')));
  console.log(`   • Total rendered frames on disk: ${renderedFrames.length} / ${manifest.totalFrames}`);

  const ext = renderedFrames.length && renderedFrames[0].endsWith('.png') ? 'png' : 'jpg';

  // ---------------------------------------------------------------------------
  // STAGE 6: HARDWARE-ACCELERATED NVENC MUXING & SUBTITLES
  // ---------------------------------------------------------------------------
  console.log(`\n🎞️ Muxing 3D frames with voiceover audio and mobile-safe ASS subtitles...`);
  const finalVideo = path.join(outDir, `${slug}_universal_reel.mp4`);
  const relInputPattern = path.relative(PROJECT_ROOT, path.join(framesDir, `frame_%04d.${ext}`)).replace(/\\/g, '/');
  const relMasterAudio = path.relative(PROJECT_ROOT, audioData.masterAudioPath).replace(/\\/g, '/');
  const relAssSubtitles = path.relative(PROJECT_ROOT, audioData.assPath).replace(/\\/g, '/');

  // Try NVENC first, fallback to libx264
  let ffmpegMuxCmd = `ffmpeg -y -framerate 30 -i "${relInputPattern}" -i "${relMasterAudio}" -vf "ass=${relAssSubtitles}" -c:v h264_nvenc -preset p5 -b:v 8M -c:a aac -b:a 192k -pix_fmt yuv420p "${finalVideo}"`;
  try {
    execSync(ffmpegMuxCmd, { stdio: 'inherit' });
  } catch (err) {
    console.warn(`⚠️ NVENC mux failed, falling back to libx264 CPU encoder...`);
    ffmpegMuxCmd = `ffmpeg -y -framerate 30 -i "${inputPattern}" -i "${masterAudio}" -vf "ass='${assSubtitles}'" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -pix_fmt yuv420p "${finalVideo}"`;
    execSync(ffmpegMuxCmd, { stdio: 'inherit' });
  }

  // Extract verification stills from the final mp4
  console.log(`\n📸 Extracting post-mux verification stills across storytelling gags...`);
  const finalProofDir = path.join(runDir, 'proof_stills');
  fs.mkdirSync(finalProofDir, { recursive: true });
  const durSec = Math.floor(manifest.totalFrames / 30);
  const sampleSeconds = [3, Math.floor(durSec * 0.25), Math.floor(durSec * 0.5), Math.floor(durSec * 0.72), Math.floor(durSec * 0.88), Math.max(1, durSec - 2)];
  for (const s of sampleSeconds) {
    const proofFile = path.join(finalProofDir, `proof_${s}s.jpg`);
    try {
      execSync(`ffmpeg -y -ss ${s} -i "${finalVideo}" -vframes 1 -q:v 2 "${proofFile}"`, { stdio: 'ignore' });
      const artFile = path.join(ARTIFACT_DIR, `${slug}_proof_${s}s.jpg`);
      fs.copyFileSync(proofFile, artFile);
      console.log(`   • Saved proof at ${s}s -> [proof_${s}s.jpg](file:///${proofFile.replace(/\\/g, '/')})`);
    } catch (e) {
      console.warn(`Could not extract proof at ${s}s:`, e.message);
    }
  }

  // Copy final video to artifact dir
  const artVideo = path.join(ARTIFACT_DIR, `${slug}_universal_reel.mp4`);
  fs.copyFileSync(finalVideo, artVideo);

  const stat = fs.statSync(finalVideo);
  console.log('\n' + '='.repeat(70));
  console.log(`🎉 UNIVERSAL AUTONOMOUS 3D REEL GENERATION COMPLETE!`);
  console.log(`   • Output MP4: [${path.basename(finalVideo)}](file:///${finalVideo.replace(/\\/g, '/')})`);
  console.log(`   • File Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   • Duration: ${(manifest.totalFrames / 30).toFixed(1)}s (${manifest.totalFrames} frames @ 30fps)`);
  console.log(`   • Character: Biped with dynamic walking locomotion & audio-reactive speech`);
  console.log(`   • Resolution: 1080x1920 (Vertical 9:16 Shorts)`);
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('\n❌ Autonomous universal runner failed:', err);
  process.exit(1);
});
