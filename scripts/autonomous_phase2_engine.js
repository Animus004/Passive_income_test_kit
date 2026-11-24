/**
 * Autonomous 3D Diorama Director Engine (Phase 2: 60s–150s+ Viral Narrative Reels)
 * 
 * Powered by:
 * - Gemini 2.5 Flash: Master Showrunner & Rapid-Beat Pacing Architect
 * - Microsoft Edge-TTS: Multi-Voice Documentary / Cinematic Narrator
 * - Blender 4.3 EEVEE Next: Headless GPU Diorama Renderer with D:\BlenderToolbox Shaders
 * - FFmpeg GPU NVENC: Audio & 25px Minimal Mobile-Safe Micro-Subtitle Muxer (MarginV = 240)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { generateWithCluster } from './gemini_cluster.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLENDER_BIN = process.env.BLENDER_BIN || (fs.existsSync(String.raw`D:\Programs\blender\blender-4.3.0-windows-x64\blender.exe`) ? String.raw`D:\Programs\blender\blender-4.3.0-windows-x64\blender.exe` : 'blender');
const DIORAMA_SCRIPT = path.join(PROJECT_ROOT, 'blender_engine', 'scripts', 'diorama_director.py');
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(PROJECT_ROOT, 'out', 'artifacts');

function getAudioDuration(filePath) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf-8' });
    const dur = parseFloat(out.trim());
    if (!isNaN(dur) && dur > 0) return dur;
  } catch (e) {
    console.warn(`⚠️ ffprobe duration warning for ${path.basename(filePath)}:`, e.message);
  }
  return 3.6;
}

export async function runPhase2Autonomous(topicInput = null, options = {}) {
  console.log('====================================================================');
  console.log('🎬 AUTONOMOUS 3D DIORAMA DIRECTOR ENGINE: PHASE 2 (60s–150s+ REELS)');
  console.log('====================================================================\n');

  const topicText = typeof topicInput === 'string' ? topicInput : (topicInput?.topic || 'The Mystery of Ancient Engineering');
  const castType = options.castType || (
    /pyramid|ancient|history|1826|fasting|autophagy|space|science|documentary|did you know/i.test(topicText)
      ? 'story_cast'
      : 'dev_and_gemini'
  );
  const targetDurationSec = options.targetDurationSec || 60;
  const numBeats = Math.max(16, Math.min(26, Math.round(targetDurationSec / 3.6)));
  const outMp4Path = options.outputMp4Path || path.join(PROJECT_ROOT, 'out', 'final_phase2_limitless.mp4');
  const language = 'en'; // Strict 100% Native English-only for Phase 2 3D Animations

  console.log(`🎯 Story Premise: "${topicText}"`);
  console.log(`🎭 Cast Selection: ${castType.toUpperCase()} | 🌐 Language: ${language.toUpperCase()}`);
  console.log(`⏱️ Target Duration: ~${targetDurationSec}s (${numBeats} rapid visual beats, 3–4s per cut)`);

  const scratchDir = path.join(PROJECT_ROOT, 'scratch', 'autonomous_phase2');
  fs.mkdirSync(scratchDir, { recursive: true });
  const manifestPath = path.join(scratchDir, 'episode_manifest.json');
  const masterAudioPath = path.join(scratchDir, 'master_voiceover.wav');
  const assPath = path.join(scratchDir, 'subtitles_minimal.ass');
  let manifest;

  if ((options.qaOnly || options.reuseScript) && fs.existsSync(manifestPath)) {
    console.log(`♻️ Reusing existing verified episode manifest: ${manifestPath}`);
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } else {
    // =========================================================================
    // STEP 1: Executive Showrunner Generates Rapid-Beat Narrative Script
    // =========================================================================
    console.log('\n📝 STEP 1: Showrunner Generating Multi-Beat Narrative Script...');

    const showrunnerPrompt = `
You are the Executive Showrunner & Head Writer for a viral cinematic 3D narrative reel / mini-documentary series.
Topic: "${topicText}"
Cast Type: "${castType}"
Language: "${language}"
Target Duration: ~${targetDurationSec} seconds (~${numBeats} rapid visual beats)

CRITICAL PACING & SCRIPT RULES:
- CRITICAL: NEVER use the word "friend" or "my friend" anywhere!
- Structure the episode into EXACTLY ${numBeats} rapid visual beats (shots 0 to ${numBeats - 1}):
  * Each beat must have punchy, captivating voiceover narration of 10 to 15 words (~3.0 to 4.0 seconds of audio).
  * Rapid 3–4 second visual cut pacing: the camera, focus, tool, or character action changes every beat, keeping audience retention viral.
  * Progression flow:
    - Beat 0: High-energy curiosity hook & establishing view
    - Beats 1–4: The impossible historical puzzle & challenge
    - Beats 5–9: Step-by-step scientific / engineering mechanism reveal
    - Beats 10–13: Practical tool sighting & celestial alignment execution
    - Beats 14–${numBeats - 1}: Climax realization, precision result, and hero reveal
- Each shot must specify:
  * shotIndex: 0 to ${numBeats - 1}
  * shotType: e.g. "establishing_crane", "medium_tracking", "macro_sighting", "over_shoulder", "hero_reveal", "orbit_slow", "dolly_in"
  * subject_target: one of ["diorama_center", "astronomer_head", "astronomer_full", "merkhet_tool", "plumb_bob", "pyramid_horizon", "north_star"]
  * actionDescription: brief description of character pose / tool focus
  * narration: punchy 10-15 word spoken voiceover text

Format strictly as JSON matching this schema:
{
  "title": "Short punchy viral title with emoji (max 32 chars)",
  "premise": "Compelling one-line summary",
  "castType": "${castType}",
  "language": "${language}",
  "narratorVoice": "${language === 'hi' ? 'hi-IN-MadhurNeural' : 'en-US-ChristopherNeural'}",
  "environmentTheme": "${options.environmentTheme || 'ancient_giza_observatory'}",
  "timeOfDay": "${options.timeOfDay || 'twilight_starry'}",
  "shots": [
    {
      "shotIndex": 0,
      "shotType": "establishing_crane",
      "subject_target": "diorama_center",
      "actionDescription": "...",
      "narration": "..."
    }
  ]
}
`;

    const showrunnerRes = await generateWithCluster('showrunner', {
      contents: showrunnerPrompt,
      config: { responseMimeType: 'application/json' },
      modelOverride: 'gemini-2.5-flash',
    });

    let cleanJson = showrunnerRes.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanJson = jsonMatch[0];

    try {
      manifest = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('⚠️ Initial JSON parse failed, applying sanitization:', parseErr.message);
      try {
        const sanitized = cleanJson
          .replace(/,\s*([\]}])/g, '$1')
          .replace(/[\u0000-\u001F]+/g, ' ');
        manifest = JSON.parse(sanitized);
      } catch (e2) {
        if (fs.existsSync(manifestPath)) {
          console.warn('⚠️ Fallback to previously cached manifest.');
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        } else {
          throw parseErr;
        }
      }
    }
    console.log(`✅ Showrunner Script Ready: "${manifest.title}" (${manifest.shots.length} beats) using Node ${showrunnerRes.usedNode}`);
  }

  manifest.castType = castType;
  manifest.language = language;
  manifest.targetDurationSec = targetDurationSec;

  // =========================================================================
  // STEP 2: Voice Synthesis & Exact Frame Timing Alignment
  // =========================================================================
  if ((options.qaOnly || options.reuseScript) && fs.existsSync(masterAudioPath) && fs.existsSync(assPath) && manifest.totalFrames) {
    console.log(`\n🎙️ STEP 2: Audio & subtitles verified (${manifest.totalFrames} frames / ${(manifest.totalFrames/30).toFixed(1)}s): ${masterAudioPath}`);
  } else {
    console.log('\n🎙️ STEP 2: Synthesizing Audio & Calculating Dynamic Beat Frame Boundaries...');

  const shotAudioFiles = [];
  const audioSegments = [];
  let accumFrame = 0;

  for (let i = 0; i < manifest.shots.length; i++) {
    const shot = manifest.shots[i];
    const shotAudioPath = path.join(scratchDir, `shot_${i}.mp3`);
    
    // Sanitize text for ElevenLabs TTS
    const cleanNarration = shot.narration.replace(/\*/g, '').replace(/"/g, '\\"');
    const elevenScript = path.join(PROJECT_ROOT, 'scripts', 'eleven_tts.py');
    const ttsCmd = `python "${elevenScript}" --text "${cleanNarration}" --voice narrator --output "${shotAudioPath}" --stability 0.32 --style 0.45`;
    execSync(ttsCmd, { stdio: 'ignore' });
    shotAudioFiles.push(shotAudioPath);

    const durationSec = getAudioDuration(shotAudioPath);
    const durationFrames = Math.max(75, Math.round(durationSec * 30));

    shot.startFrame = accumFrame;
    shot.endFrame = accumFrame + durationFrames;

    // Convert to 48kHz stereo WAV
    const shotWavPath = path.join(scratchDir, `shot_${i}.wav`);
    execSync(`ffmpeg -y -i "${shotAudioPath}" -ar 48000 -ac 2 "${shotWavPath}"`, { stdio: 'ignore' });
    audioSegments.push(shotWavPath);

    // Frame-aligned pause: snappy 8 frames (~0.26s) between rapid cuts, 60 frames (2.0s) ending hold
    const isLast = (i === manifest.shots.length - 1);
    const pauseFrames = isLast ? 60 : 8;
    const pauseSec = (pauseFrames / 30.0).toFixed(3);
    const pauseWavPath = path.join(scratchDir, isLast ? 'pause_ending.wav' : `pause_${i}.wav`);
    execSync(`ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=stereo -t ${pauseSec} "${pauseWavPath}"`, { stdio: 'ignore' });
    audioSegments.push(pauseWavPath);

    accumFrame = shot.endFrame + pauseFrames;
    console.log(`   • Beat ${i} [${shot.shotType} -> ${shot.subject_target || 'center'}]: ${durationSec.toFixed(2)}s (${durationFrames}f) -> frames ${shot.startFrame}..${shot.endFrame}`);
  }

  manifest.totalFrames = accumFrame;
  console.log(`🎬 Total Dynamic Video Runtime: ${manifest.totalFrames} frames (${(manifest.totalFrames / 30).toFixed(1)}s)`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  // Concatenate master audio
  const concatListPath = path.join(scratchDir, 'concat_list.txt');
  fs.writeFileSync(concatListPath, audioSegments.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'), 'utf-8');
  const masterAudioPath = path.join(scratchDir, 'master_voiceover.wav');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:a pcm_s16le "${masterAudioPath}"`, { stdio: 'ignore' });
  console.log(`✅ Master Voiceover Compiled: ${masterAudioPath}`);

  // Build Mobile Safe-Zone Subtitles (MarginV = 280, Fontsize = 62)
  const assPath = path.join(scratchDir, 'subtitles_minimal.ass');
  let assContent = `[Script Info]
Title: Dynamic 3D Diorama Narrative Reel
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: StoryNarrator,Montserrat ExtraBold,62,&H00FFFFFF,&H0000FFFF,&H00000000,&H80000000,1,0,0,0,100,100,1.0,0,1,3.5,0,2,80,80,280,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const formatAssTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const sInt = Math.floor(s);
    const cs = Math.floor((s - sInt) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(sInt).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  for (const shot of manifest.shots) {
    const shotStart = shot.startFrame / 30.0;
    const shotEnd = shot.endFrame / 30.0;
    const totalShotDuration = shotEnd - shotStart;

    const words = shot.narration.replace(/\*/g, '').split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += 4) {
      chunks.push(words.slice(i, i + 4).join(' '));
    }

    const totalChars = chunks.reduce((acc, c) => acc + c.length, 0) || 1;
    let currentStart = shotStart;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkWeight = chunk.length / totalChars;
      const chunkDuration = Math.max(0.65, totalShotDuration * chunkWeight);
      const chunkEnd = Math.min(shotEnd, currentStart + chunkDuration);

      const popTag = `{\\t(0,60,\\fscx112\\fscy112)\\t(60,130,\\fscx100\\fscy100)}`;
      assContent += `Dialogue: 0,${formatAssTime(currentStart)},${formatAssTime(chunkEnd)},StoryNarrator,,0,0,0,,${popTag}${chunk.toUpperCase()}\n`;
      currentStart = chunkEnd;
    }
  }
  fs.writeFileSync(assPath, assContent, 'utf-8');
  console.log('✅ Mobile-safe minimal subtitles formatted (MarginV = 240).');
  }

  // =========================================================================
  // STEP 3: Visual QA Stills Generation & Audit (Agent 4 Quality Gate)
  // =========================================================================
  console.log('\n📸 STEP 3: Rendering Visual QA Checkpoint Stills (Establishing, Hero, OTS)...');
  const qaOutputDir = path.join(scratchDir, 'qa_stills');
  fs.mkdirSync(qaOutputDir, { recursive: true });

  const qaCmd = `& "${BLENDER_BIN}" -b -P "${DIORAMA_SCRIPT}" -- --manifest "${manifestPath}" --audio "${masterAudioPath}" --output "${path.join(qaOutputDir, 'qa_still.jpg')}" --qa-stills`;
  execSync(qaCmd, { shell: 'powershell.exe', stdio: 'inherit' });

  // Copy QA Stills to Artifact Directory for direct user inspection
  const qaStillsBase = [
    'qa_still_01_establishing',
    'qa_still_02_hero',
    'qa_still_03_ots',
    'qa_still_04_pointing',
    'qa_still_05_sighting',
    'qa_still_06_triumph'
  ];
  const qaStills = [];
  for (const base of qaStillsBase) {
    let src = path.join(qaOutputDir, `${base}.jpg`);
    let ext = '.jpg';
    if (!fs.existsSync(src)) {
      src = path.join(qaOutputDir, `${base}.png`);
      ext = '.png';
    }
    if (fs.existsSync(src)) {
      try {
        const dest = path.join(ARTIFACT_DIR, `${base}${ext}`);
        fs.copyFileSync(src, dest);
        console.log(`   ✅ Visual QA Still ready: ${src} -> ${dest}`);
        qaStills.push(`${base}${ext}`);
      } catch (err) {}
    }
  }

  if (options.qaOnly) {
    console.log('\n🛑 QA-Only Mode: Halting before full render so stills can be reviewed.');
    return { success: true, qaOnly: true, qaStills };
  }

  // =========================================================================
  // STEP 4: Blender EEVEE Next GPU Rendering & FFmpeg NVENC Muxing
  // =========================================================================
  console.log('\n🚀 STEP 4: Executing Headless Blender EEVEE Next GPU Render...');

  // Stop background processes that might hoard GPU VRAM
  try { execSync('ollama stop qwen3:4b-instruct', { stdio: 'ignore' }); } catch (e) {}

  const framesDir = path.join(scratchDir, 'frames');
  if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  const framesPrefix = path.join(framesDir, 'frame_');

  const renderCmd = `& "${BLENDER_BIN}" -b -P "${DIORAMA_SCRIPT}" -- --manifest "${manifestPath}" --audio "${masterAudioPath}" --output "${framesPrefix}" --frames --force-overwrite`;
  console.log(`Rendering ${manifest.totalFrames} frames to ${framesDir}...`);
  execSync(renderCmd, { shell: 'powershell.exe', stdio: 'inherit' });

  // STEP 5: Hardware-Accelerated NVENC Mux
  console.log(`\n🎬 STEP 5: Muxing Master Mini-Movie to ${outMp4Path} with FFmpeg GPU NVENC...`);
  fs.mkdirSync(path.dirname(outMp4Path), { recursive: true });

  const assFilter = assPath.replace(/\\/g, '/').replace(':', '\\:');
  const framesInput = path.join(framesDir, 'frame_%04d.jpg').replace(/\\/g, '/');

  try {
    const nvencMuxCmd = `ffmpeg -y -framerate 30 -i "${framesInput}" -i "${masterAudioPath}" -vf "subtitles='${assFilter}'" -c:v h264_nvenc -preset p4 -rc vbr -cq 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${outMp4Path}"`;
    execSync(nvencMuxCmd, { stdio: 'ignore' });
    console.log('✅ Hardware-accelerated NVENC muxing complete.');
  } catch (e) {
    console.log('NVENC fallback to libx264...');
    const libxMuxCmd = `ffmpeg -y -framerate 30 -i "${framesInput}" -i "${masterAudioPath}" -vf "subtitles='${assFilter}'" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${outMp4Path}"`;
    execSync(libxMuxCmd, { stdio: 'ignore' });
  }

  // Copy to Artifacts Directory for direct UI inspection
  if (fs.existsSync(ARTIFACT_DIR)) {
    const artifactDest = path.join(ARTIFACT_DIR, path.basename(outMp4Path));
    try {
      fs.copyFileSync(outMp4Path, artifactDest);
      console.log(`📋 Copied output to artifact directory: ${artifactDest}`);
    } catch (err) {}
  }

  console.log(`\n🎉 Autonomous Phase 2 Diorama Reel Rendered Successfully: ${outMp4Path}`);
  return {
    success: true,
    title: manifest.title,
    outputVideo: outMp4Path,
    manifest,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const testsDir = path.join(PROJECT_ROOT, 'out', 'tests');
  fs.mkdirSync(testsDir, { recursive: true });

  const isQaOnly = args.includes('--qa-only');
  const customTopic = args.find((a) => !a.startsWith('--')) || null;

  if (args.includes('--test-1')) {
    runPhase2Autonomous(
      'Did You Know? How Ancient Egyptians Aligned the Great Pyramid to True North Within 0.05 Degrees Without a Compass',
      {
        castType: 'story_cast',
        targetDurationSec: 60,
        environmentTheme: 'ancient_giza_observatory',
        timeOfDay: 'twilight_starry',
        outputMp4Path: path.join(testsDir, 'test1_pyramid_diorama_60s.mp4'),
        qaOnly: isQaOnly,
      }
    ).catch((e) => {
      console.error('Fatal Test 1 error:', e);
      process.exit(1);
    });
  } else {
    runPhase2Autonomous(customTopic, { qaOnly: isQaOnly }).catch((e) => {
      console.error('Fatal Phase 2 error:', e);
      process.exit(1);
    });
  }
}
