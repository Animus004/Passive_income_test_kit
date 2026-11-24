/**
 * Autonomous AI Comedy Series Master Engine
 * 
 * Features:
 * 1. Zero-Prompt Schedule & Trend Intake (Morning / Late Night / Wild Weekend)
 * 2. Real-time Live Trend Scraper (Hacker News & Google News RSS)
 * 3. Declarative 3D Stage Recipe Generator (No hardcoding)
 * 4. Dual-Character ElevenLabs Voice Synthesis (Will & Jessica) + Layered Sound Design
 * 5. Closed-Loop Visual Watchdog Inspector (Gemini 2.5 Flash Vision)
 * 6. Automated NVENC GPU Rendering & Kinetic ASS Subtitle Muxing
 * 
 * Usage:
 *   node scripts/run_autonomous_series.js                        # 100% autonomous based on current time
 *   node scripts/run_autonomous_series.js --slot wild_weekend_adventure
 *   node scripts/run_autonomous_series.js --topic "..."
 *   node scripts/run_autonomous_series.js --qa-only
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { execSync, spawnSync } from 'child_process';
import { generateScheduledShow } from './schedule_manager.js';
import { runWatchdogClosedLoop } from './vision_watchdog.js';

const PROJECT_ROOT = 'd:\\New folder (2)';
const BLENDER_BIN = 'D:\\Programs\\blender\\blender-4.3.0-windows-x64\\blender.exe';
const ARTIFACT_DIR = 'C:\\Users\\sayan\\.gemini\\antigravity\\brain\\f6352432-fa3c-4b63-acbf-21e7ecd31607';
const HISTORY_FILE = path.join(PROJECT_ROOT, 'scratch', 'episode_history.json');
const DIRECTOR_SCRIPT = path.join(PROJECT_ROOT, 'blender_engine', 'scripts', 'relatable_comedy_director.py');
const ELEVEN_SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'eleven_tts.py');

function sanitizeSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
}

function recordHistoryEntry(entry) {
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch (e) {}
  }
  history.push({
    timestamp: new Date().toISOString(),
    ...entry
  });
  if (history.length > 50) history = history.slice(-50);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  let slot = null;
  let topic = null;
  let theme = null;
  let qaOnly = false;
  let dryRun = false;
  let doPublish = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slot' && args[i + 1]) slot = args[++i];
    else if (args[i] === '--topic' && args[i + 1]) topic = args[++i];
    else if (args[i] === '--theme' && args[i + 1]) theme = args[++i];
    else if (args[i] === '--qa-only') qaOnly = true;
    else if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--publish') doPublish = true;
  }
  return { slot, topic, theme, qaOnly, dryRun, doPublish };
}

// =========================================================================
// AUDIO SYNTHESIS & LAYERED SFX MUXER
// =========================================================================

async function synthesizeShowAudio(scriptData, runDir) {
  console.log(`\n🎙️ [AUDIO ENGINE] Synthesizing natural dual-character voices via ElevenLabs...`);
  const audioDir = path.join(runDir, 'audio');
  fs.mkdirSync(audioDir, { recursive: true });

  const fps = 30;
  let currentFrame = 1;
  const manifestLines = [];
  const audioConcatList = [];
  const pythonBin = 'python';

  // 0.25s silence pad for natural cadence
  const silencePad = path.join(audioDir, 'pause_pad.mp3');
  try {
    execSync(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t 0.25 -q:a 9 -acodec libmp3lame "${silencePad}"`, { stdio: 'ignore' });
  } catch (e) {}

  for (let i = 0; i < scriptData.lines.length; i++) {
    const line = scriptData.lines[i];
    const isHuman = line.speaker.toLowerCase() === 'human';
    const voiceKey = isHuman ? 'human' : 'gemini';
    const stability = isHuman ? 0.35 : 0.32;
    const style = isHuman ? 0.60 : 0.65;
    const padI = String(i).padStart(2, '0');
    const lineAudioPath = path.join(audioDir, `line_${padI}.mp3`);

    const sanitized = line.text.replace(/["\\]/g, '').trim();
    console.log(`   • Line ${i} [${line.speaker}]: "${sanitized}" via ElevenLabs (${voiceKey})`);

    const ttsCmd = `"${pythonBin}" "${ELEVEN_SCRIPT}" --text "${sanitized}" --voice "${voiceKey}" --output "${lineAudioPath}" --stability ${stability} --style ${style}`;
    execSync(ttsCmd, { stdio: 'inherit' });

    // Duration measurement
    const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${lineAudioPath}"`;
    const durSec = parseFloat(execSync(probeCmd, { encoding: 'utf-8' }).trim()) || 2.5;

    const lineFrames = Math.max(25, Math.round(durSec * fps));
    const pauseFrames = 8; // 0.26s conversational pause

    manifestLines.push({
      lineIndex: i,
      speaker: line.speaker,
      text: line.text,
      emotion: line.emotion || 'talking',
      camera: line.camera || (isHuman ? 'human' : 'gemini'),
      startFrame: currentFrame,
      endFrame: currentFrame + lineFrames,
      durationSec: durSec,
    });

    audioConcatList.push(lineAudioPath);
    if (fs.existsSync(silencePad) && i < scriptData.lines.length - 1) {
      audioConcatList.push(silencePad);
    }
    currentFrame += lineFrames + pauseFrames;
  }

  const totalFrames = currentFrame + 15; // Outro cushion

  // Concatenate lines
  const concatTxt = path.join(audioDir, 'concat_list.txt');
  fs.writeFileSync(concatTxt, audioConcatList.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const rawDialogue = path.join(audioDir, 'raw_dialogue.wav');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatTxt}" -c:a pcm_s16le "${rawDialogue}"`, { stdio: 'ignore' });

  // Sound design: ambient ducked music + cartoon foley SFX
  console.log(`   • Layering ambient beat & micro-SFX...`);
  const bgMusicPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');
  const whooshPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'whoosh.mp3').replace(/\\/g, '/');
  const boomPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'sub_boom.mp3').replace(/\\/g, '/');
  const blipPath = path.join(PROJECT_ROOT, 'public', 'sfx', 'blip.mp3').replace(/\\/g, '/');

  const masterAudio = path.join(audioDir, 'master_audio.wav');
  const totalDurationSec = (totalFrames / fps).toFixed(2);
  const filterComplex = [
    `[0:a]volume=1.20[v_clean]`,
    `[1:a]volume=0.07[bg_ducked]`,
    `[2:a]adelay=400|400,volume=0.30[sfx_whoosh]`,
    `[3:a]adelay=3200|3200,volume=0.35[sfx_boom]`,
    `[4:a]adelay=7500|7500,volume=0.30[sfx_blip]`,
    `[v_clean][bg_ducked][sfx_whoosh][sfx_boom][sfx_blip]amix=inputs=5:duration=first:dropout_transition=2[a_out]`
  ].join(';');

  try {
    const mixCmd = `ffmpeg -y -i "${rawDialogue}" -stream_loop -1 -i "${bgMusicPath}" -i "${whooshPath}" -i "${boomPath}" -i "${blipPath}" -filter_complex "${filterComplex}" -map "[a_out]" -t ${totalDurationSec} -c:a pcm_s16le "${masterAudio}"`;
    execSync(mixCmd, { stdio: 'ignore' });
  } catch (e) {
    execSync(`ffmpeg -y -i "${rawDialogue}" -af "volume=1.15" -c:a pcm_s16le "${masterAudio}"`, { stdio: 'ignore' });
  }

  // Generate Subtitles
  const assPath = path.join(runDir, 'subtitles.ass');
  generateAssSubtitles(manifestLines, assPath, fps);

  console.log(`✅ [AUDIO ENGINE] Multi-track audio ready: ${(totalFrames / fps).toFixed(1)}s (${totalFrames} frames)`);
  return {
    masterAudioPath: masterAudio,
    assPath: assPath,
    totalFrames: totalFrames,
    fps: fps,
    manifestLines: manifestLines
  };
}

function generateAssSubtitles(lines, outputPath, fps) {
  let ass = `[Script Info]
Title: Autonomous Comedy Short
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ShortHuman,Arial,84,&H00FFFFFF,&H000000FF,&H000F172A,&H80000000,-1,0,0,0,100,100,0,0,1,6.0,2.5,2,60,60,540,1
Style: ShortGemini,Arial,84,&H0022C55E,&H000000FF,&H000A0E18,&H80000000,-1,0,0,0,100,100,0,0,1,6.0,2.5,2,60,60,540,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  function fmtTime(frames) {
    const totalSec = Math.max(0, frames / fps);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    const cs = Math.floor((totalSec % 1) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  for (const l of lines) {
    const isHuman = l.speaker.toLowerCase() === 'human';
    const style = isHuman ? 'ShortHuman' : 'ShortGemini';
    const words = l.text.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) continue;

    const chunks = [];
    let i = 0;
    while (i < words.length) {
      const w1 = words[i];
      const w2 = words[i + 1];
      if (w2 && (w1.length + w2.length) < 13) {
        chunks.push(`${w1} ${w2}`);
        i += 2;
      } else {
        chunks.push(w1);
        i += 1;
      }
    }

    const totalDurFrames = Math.max(15, l.endFrame - l.startFrame);
    const framesPerChunk = totalDurFrames / chunks.length;

    for (let c = 0; c < chunks.length; c++) {
      const chunkStart = Math.round(l.startFrame + c * framesPerChunk);
      const chunkEnd = Math.min(l.endFrame, Math.round(l.startFrame + (c + 1) * framesPerChunk));
      ass += `Dialogue: 0,${fmtTime(chunkStart)},${fmtTime(chunkEnd)},${style},${l.speaker},0,0,0,,${chunks[c].toUpperCase()}\n`;
    }
  }

  fs.writeFileSync(outputPath, ass, 'utf-8');
}

// =========================================================================
// MASTER AUTONOMOUS PIPELINE
// =========================================================================

async function main() {
  console.log(`⚡ [LEGACY REDIRECT] Forwarding execution to Smart Dual-Channel Relatable Engine...`);
  const relayArgs = process.argv.slice(2);
  if (!relayArgs.includes('--lang')) {
    relayArgs.push('--lang', 'all');
  }
  const relatableScript = path.join(PROJECT_ROOT, 'scripts', 'run_relatable_autonomous.js');
  const res = spawnSync('node', [relatableScript, ...relayArgs], { stdio: 'inherit' });
  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
  return;
}

async function legacyMain() {
  const { slot, topic, theme, qaOnly, dryRun, doPublish } = parseCliArgs();

  console.log('='.repeat(75));
  console.log(`🤖 ZERO-PROMPT AUTONOMOUS AI COMEDY SERIES ENGINE`);
  console.log(`   • Architecture: Schedule Manager + Procedural Stage + Visual Watchdog`);
  console.log('='.repeat(75));

  // 1. Autonomous Schedule & Trend Intake
  const showPlan = await generateScheduledShow({ forcedSlot: slot, forcedTopic: topic, forcedTheme: theme });
  const slug = sanitizeSlug(showPlan.title);
  const runDir = path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', slug);
  const outDir = path.join(PROJECT_ROOT, 'out', 'relatable_reels');
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  // 2. Audio Synthesis & Subtitles
  const audioData = await synthesizeShowAudio(showPlan, runDir);

  // 3. Assemble Episode Manifest with Declarative Stage Recipe
  const manifestPath = path.join(runDir, 'episode_manifest.json');
  const manifest = {
    title: showPlan.title,
    slot: showPlan.slot,
    premise: showPlan.premise,
    pinnedComment: showPlan.pinnedComment,
    environment: showPlan.stage_recipe?.theme || 'custom_procedural',
    fps: audioData.fps,
    totalFrames: audioData.totalFrames,
    lines: audioData.manifestLines,
    stage_recipe: showPlan.stage_recipe
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`📁 Master Episode Manifest: [${path.basename(manifestPath)}](file:///${manifestPath.replace(/\\/g, '/')})`);

  // 4. Closed-Loop Visual Watchdog Inspection Pass
  const watchdogResult = await runWatchdogClosedLoop({ manifestPath, runDir, maxIterations: 2 });
  console.log(`🛡️ [WATCHDOG AUDIT COMPLETE] Approved: ${watchdogResult.approved ? '✅' : '❌'} (Score: ${watchdogResult.score}/10)`);

  if (qaOnly) {
    console.log(`\n📸 QA-Only mode requested. Pre-flight snapshot audited and saved.`);
    return;
  }

  if (!watchdogResult.approved) {
    console.error(`\n❌ [PRODUCTION GATEKEEPER] Visual Watchdog rejected scene (Score: ${watchdogResult.score}/10, Threshold: 8.0/10)`);
    if (watchdogResult.report?.critique) {
      console.error(`Critique: ${watchdogResult.report.critique}`);
    }
    if (watchdogResult.report?.defects?.length) {
      console.error(`Defects: ${watchdogResult.report.defects.join(', ')}`);
    }
    if (doPublish) {
      console.error(`🚫 [PUBLISHING BLOCKED] Multi-platform publish aborted to prevent posting defective content.`);
    }
    throw new Error(`Visual Watchdog rejection: Score ${watchdogResult.score}/10 below production threshold (8.0/10)`);
  }

  // 5. Full Animation Render via Blender EEVEE Next
  const framesDir = path.join(runDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });
  console.log(`\n🚀 Rendering Full Sequence (${manifest.totalFrames} frames) via EEVEE Next GPU...`);
  const renderOutputPattern = path.join(framesDir, 'frame_');
  let bCmd = `& "${BLENDER_BIN}" -b -P "${DIRECTOR_SCRIPT}" -- --manifest "${manifestPath}" --frames --output "${renderOutputPattern}"`;
  if (watchdogResult.correctionsPath && fs.existsSync(watchdogResult.correctionsPath)) {
    console.log(`🛠️ Injecting verified Watchdog corrections into full render...`);
    bCmd += ` --corrections "${watchdogResult.correctionsPath}"`;
  }
  const t0 = Date.now();
  const bRes = spawnSync('powershell.exe', ['-Command', bCmd], { stdio: 'inherit' });
  if (bRes.status !== 0) throw new Error(`Blender render failed with code ${bRes.status}`);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✅ 3D Animation Complete in ${elapsed}s!`);

  // 6. Hardware Video Muxing (NVENC H.264 + Subtitles + Audio)
  const finalVideo = path.join(outDir, `${slug}_reel.mp4`);
  const frameFiles = fs.readdirSync(framesDir).filter(f => f.startsWith('frame_') && f.endsWith('.jpg'));
  const sampleFrame = frameFiles[0];
  const numDigits = sampleFrame.match(/\d+/)?.[0]?.length || 5;
  const framePattern = `frame_%0${numDigits}d.jpg`;

  const relFrames = path.relative(PROJECT_ROOT, path.join(framesDir, framePattern)).replace(/\\/g, '/');
  const relAudio = path.relative(PROJECT_ROOT, audioData.masterAudioPath).replace(/\\/g, '/');
  const relAss = path.relative(PROJECT_ROOT, audioData.assPath).replace(/\\/g, '/').replace(/:/g, '\\:');

  const muxCmd = `ffmpeg -y -framerate 30 -i "${relFrames}" -i "${relAudio}" -vf "ass='${relAss}'" -c:v h264_nvenc -preset p5 -b:v 8M -c:a aac -b:a 192k -pix_fmt yuv420p "${finalVideo}"`;
  try {
    execSync(muxCmd, { stdio: 'inherit' });
  } catch (err) {
    const cpuMux = `ffmpeg -y -framerate 30 -i "${relFrames}" -i "${relAudio}" -vf "ass='${relAss}'" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -pix_fmt yuv420p "${finalVideo}"`;
    execSync(cpuMux, { stdio: 'inherit' });
  }

  // Copy Video & Verification Stills to Artifact Directory only if requested, avoiding C: drive bloat
  if (process.env.SAVE_ARTIFACTS_TO_C === 'true' && fs.existsSync(ARTIFACT_DIR)) {
    try {
      const artVideo = path.join(ARTIFACT_DIR, `${slug}_reel.mp4`);
      fs.copyFileSync(finalVideo, artVideo);
    } catch (e) {}
  }

  const proofDir = path.join(runDir, 'proofs');
  fs.mkdirSync(proofDir, { recursive: true });
  for (let i = 0; i < manifest.lines.length; i++) {
    const padI = String(i).padStart(2, '0');
    const line = manifest.lines[i];
    const sec = ((line.startFrame + line.endFrame) / 2 / manifest.fps).toFixed(2);
    const proofFile = path.join(proofDir, `turn_${padI}_${line.speaker}.jpg`);
    try {
      execSync(`ffmpeg -y -ss ${sec} -i "${finalVideo}" -vframes 1 -q:v 2 "${proofFile}"`, { stdio: 'ignore' });
      const artStill = path.join(ARTIFACT_DIR, `${slug}_turn_${padI}_${line.speaker}.jpg`);
      fs.copyFileSync(proofFile, artStill);
    } catch (e) {}
  }

  const stat = fs.statSync(finalVideo);
  console.log('\n' + '='.repeat(75));
  console.log(`🎉 AUTONOMOUS EPISODE SUCCESSFULLY DELIVERED!`);
  console.log(`   • Title: "${manifest.title}"`);
  console.log(`   • Video MP4: [${path.basename(finalVideo)}](file:///${finalVideo.replace(/\\/g, '/')})`);
  console.log(`   • File Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   • Duration: ${(manifest.totalFrames / 30).toFixed(1)}s (${manifest.totalFrames} frames)`);
  console.log(`   • Visual Watchdog Score: ${watchdogResult.score}/10`);
  console.log('='.repeat(75));

  recordHistoryEntry({
    title: manifest.title,
    slot: manifest.slot,
    theme: manifest.stage_recipe?.theme,
    totalFrames: manifest.totalFrames,
    watchdogScore: watchdogResult.score
  });

  if (doPublish) {
    console.log(`\n===========================================================================`);
    console.log(`🚀 [PUBLISHING AGENT] Multi-platform publish triggered for episode...`);
    console.log(`===========================================================================`);
    const pubCmd = `node scripts/publish_phase2.js --video "${finalVideo}" --manifest "${manifestPath}"`;
    try {
      execSync(pubCmd, { stdio: 'inherit' });
    } catch (pubErr) {
      console.error(`⚠️ Multi-platform publish warning:`, pubErr.message);
    }
  }
}

main().catch(err => {
  console.error('\n❌ Autonomous Series Master Runner failed:', err);
  process.exit(1);
});
