/**
 * Multi-Agent Autonomous Story & Visual Pipeline (Phase 3)
 * 
 * Replaces monolithic prompt generation with a 4-agent staged chain:
 * - Agent 1 (Showrunner): Researched narrative script with punchy, high-retention beats.
 * - Agent 2 (Visual Director): Word-by-word Visual Action Cards, 5-color contrast palette, archetype selection.
 * - Agent 3 (Audio & Subtitles): Word-boundary audio synthesis via Edge-TTS & mobile-safe ASS subtitles.
 * - Agent 4 (Manifest Assembler): Master episode manifest for the Universal 3D Blender Engine.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

import { generateWithCluster } from './gemini_cluster.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// -----------------------------------------------------------------------------
// AGENT 1: MASTER SHOWRUNNER & SCRIPTWRITER
// -----------------------------------------------------------------------------
export async function runShowrunner(topicText, targetDurationSec = 52, language = 'en') {
  // Clamp duration to YouTube Shorts safe zone (strictly 45s to 55s)
  const safeDuration = Math.max(42, Math.min(54, targetDurationSec));
  const numBeats = Math.max(8, Math.min(12, Math.round(safeDuration / 4.8)));
  console.log(`\n✍️ [AGENT 1: SHOWRUNNER] Writing researched narrative script for: "${topicText}"`);
  console.log(`   • Target Duration: ~${safeDuration}s (${numBeats} rapid visual beats, STRICT <60s Shorts limit)`);

  const prompt = `
You are the Executive Showrunner & Master Science/History Writer for viral 3D animated documentary reels (Zack D. Films / Kurzgesagt style).
Topic: "${topicText}"
Language: "${language}"
Total Beats: EXACTLY ${numBeats} beats.

CRITICAL RULES:
1. NEVER address the viewer as "friend" or "my friend".
2. Hook in Beat 0: Shocking or intriguing opening question/statement (10-15 words).
3. Progression across the ${numBeats} beats:
   - Beats 0-1: The impossible paradox / high-speed danger / hook (e.g. 400 tons racing at 200 mph).
   - Beats 2-4: The subsurface hidden systems (e.g. buried cables, LZB inductive loops in the ballast).
   - Beats 5-7: The breakthrough physical actuation (e.g. electromagnetic track brake drops 180mm onto the steel rail, intense friction heat flares).
   - Beats 8-${numBeats - 1}: Deceleration, moving wheels locking to a dead halt, and the safe standstill.
4. Each beat narration MUST be 10 to 14 words (~3.0 to 4.0 seconds spoken).
5. High rhythm and conversational energy.

Output strictly valid JSON matching this schema:
{
  "title": "Short punchy viral title with emoji (max 32 chars)",
  "premise": "One-line core premise",
  "beats": [
    {
      "beatIndex": 0,
      "narration": "Punchy 10-14 word spoken voiceover text."
    }
  ]
}
`;

  const res = await generateWithCluster('showrunner', {
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  let cleanJson = res.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const match = cleanJson.match(/\{[\s\S]*\}/);
  if (match) cleanJson = match[0];

  const scriptData = JSON.parse(cleanJson);
  console.log(`✅ [AGENT 1: SHOWRUNNER] Script ready: "${scriptData.title}" (${scriptData.beats.length} beats)`);
  return scriptData;
}

// -----------------------------------------------------------------------------
// AGENT 2: VISUAL STORYBOARDER & DIRECTOR
// -----------------------------------------------------------------------------
export async function runVisualDirector(topicText, scriptData) {
  console.log(`\n🎬 [AGENT 2: VISUAL DIRECTOR] Choreographing word-by-word visual action cards...`);

  const prompt = `
You are the Lead Visual Director and 3D Technical Cinematographer for viral 3D animated engineering & science shorts.
Topic: "${topicText}"
Script Title: "${scriptData.title}"

Here are the narration beats:
${JSON.stringify(scriptData.beats, null, 2)}

YOUR GOLD STANDARD DIRECTING RULES:
1. "NEVER A STATIC DIORAMA": Every scene MUST have continuous kinetic motion. Hero actors (planes, trains, cars, fluids, signals) physically travel from Point A to Point B.
2. "THE MICRO-CUTAWAY RULE": When the narration mentions internal mechanisms ("buried beneath the ballast", "inside the turbine", "hydraulic pressure", "electromagnetic brake"), YOU MUST assign a "MACRO_CUTAWAY_ZOOM" shot that dives inside the machine with X-ray transparency and glowing flux/telemetry pulses.
3. "SCENIC BACKDROP": Every outdoor scene MUST establish a backdrop: "alpine_mountains", "pine_forest_valley", "city_skyline", or "industrial_factory".
4. "1:1 WORD-TO-ACTION LOCK": Never speak a technical term without immediately illustrating it with a prop, motion vector, or mechanical cutaway.

For the ENTIRE VIDEO, establish:
1. "themeEra": e.g. "systems_engineering", "aviation_aerodynamics", "high_speed_rail", "cyber_infrastructure", "space_exploration".
2. "scenicBackdrop": one of ["alpine_mountains", "pine_forest_valley", "city_skyline", "industrial_complex", "open_sky"].
3. "colorPalette": 5 HIGH-CONTRAST vibrant hex codes (no washed-out beige):
   - "primary": Hero machine primary color (e.g. #D72638 crimson or #004E89 cobalt)
   - "secondary": Trim / mechanical chassis accent (#EAEAEA silver/steel)
   - "accent": Glowing emission / flux / telemetry highlight (#00F0FF cyan or #FFB703 amber)
   - "floor": Terrain / track / tarmac color (#383D3B asphalt/ballast)
   - "backdrop": Sky / horizon atmosphere (#0B132B deep navy or #6A98C7 alpine sky)

For EACH BEAT, specify:
- "beatIndex": int
- "stageArchetype": one of ["KINETIC_TRACKING", "MACRO_CUTAWAY_ZOOM", "OUTDOORS_TERRAIN", "DIAGRAM_STUDIO"]
- "cameraSetup": {
    "shotType": "macro_cutaway_dive" | "high_speed_chase" | "parallel_tracking" | "low_angle_hero" | "birds_eye_overview",
    "focalDistance": "macro" (0.5m-1.2m) | "detail" (1.4m-2.2m) | "wide" (2.5m-6.0m)
  }
- "heroActor": name of key moving 3D actor (e.g. "bullet_train", "boeing_787", "turbofan_engine", "y25_bogie")
- "actorMotion": {
    "startPoint": [x, y, z],
    "endPoint": [x, y, z],
    "speed": "accelerating" | "braking_deceleration" | "steady_cruise"
  }
- "cutawayEffect": one of ["INDUCTIVE_FLUX_PULSE", "THERMAL_FRICTION_GLOW", "XRAY_CROSS_SECTION", "FLUID_PARTICLE_FLOW", "NONE"]
- "sketchfabAssetQuery": specific 3D model search query (e.g. "train bogie", "jet turbofan engine", "pine tree pack", "subway track")
- "visualGagOrDiagram": brief technical description of the on-screen action (e.g. "Camera dives into ballast; cyan flux rings pulse from buried copper cable into train bogie receiver")

Output strictly valid JSON matching this schema:
{
  "themeEra": "...",
  "scenicBackdrop": "alpine_mountains | pine_forest_valley | city_skyline | industrial_complex | open_sky",
  "costumePreset": "modern_suit",
  "colorPalette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "floor": "#HEX",
    "backdrop": "#HEX"
  },
  "actionCards": [
    {
      "beatIndex": 0,
      "stageArchetype": "KINETIC_TRACKING | MACRO_CUTAWAY_ZOOM | OUTDOORS_TERRAIN | DIAGRAM_STUDIO",
      "cameraSetup": { "shotType": "...", "focalDistance": "..." },
      "heroActor": "...",
      "cutawayEffect": "INDUCTIVE_FLUX_PULSE | THERMAL_FRICTION_GLOW | XRAY_CROSS_SECTION | NONE",
      "sketchfabAssetQuery": "...",
      "focalProp": "...",
      "visualGagOrDiagram": "..."
    }
  ]
}
`;

  const res = await generateWithCluster('showrunner', {
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  let cleanJson = res.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const match = cleanJson.match(/\{[\s\S]*\}/);
  if (match) cleanJson = match[0];

  const visualData = JSON.parse(cleanJson);
  console.log(`✅ [AGENT 2: VISUAL DIRECTOR] Choreography complete (${visualData.actionCards.length} action cards, Era: ${visualData.themeEra}, Palette: ${visualData.colorPalette.primary})`);
  return visualData;
}

// -----------------------------------------------------------------------------
// AGENT 3: AUDIO SYNTHESIZER & SUBTITLE FORMATTER
// -----------------------------------------------------------------------------
export async function runAudioSynthesizer(scriptData, scratchDir, voice = 'en-US-ChristopherNeural') {
  console.log(`\n🎙️ [AGENT 3: AUDIO SYNTHESIZER] Generating master voiceover & beat timing...`);
  fs.mkdirSync(scratchDir, { recursive: true });

  const audioSegments = [];
  const beatTimings = [];
  let accumFrame = 1;
  const pauseFrames = 6; // 0.2s pause between cuts

  for (let i = 0; i < scriptData.beats.length; i++) {
    const beat = scriptData.beats[i];
    const rawNarration = beat.narration || beat.text || beat.voiceover || beat.line || '';
    if (!rawNarration.trim()) continue;

    const segmentPath = path.join(scratchDir, `beat_${String(i).padStart(2, '0')}.wav`);
    const sanitized = rawNarration.replace(/["\\]/g, '').trim();
    const ttsCmd = `edge-tts --rate=+12% --voice "${voice}" --text "${sanitized}" --write-media "${segmentPath}"`;
    execSync(ttsCmd, { stdio: 'ignore' });

    // Measure exact audio duration
    const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${segmentPath}"`, { encoding: 'utf-8' }).trim();
    const durationSec = parseFloat(durStr) || 3.5;
    const durationFrames = Math.max(30, Math.round(durationSec * 30));

    const startFrame = accumFrame;
    const endFrame = startFrame + durationFrames;
    accumFrame = endFrame + pauseFrames;

    audioSegments.push(segmentPath);
    beatTimings.push({
      beatIndex: i,
      narration: rawNarration,
      durationSec,
      durationFrames,
      startFrame,
      endFrame,
    });
    console.log(`   • Beat ${String(i).padStart(2, '0')}: ${durationSec.toFixed(2)}s -> frames ${startFrame}..${endFrame}`);
  }

  // Concatenate master audio
  const concatList = path.join(scratchDir, 'concat_list.txt');
  fs.writeFileSync(concatList, audioSegments.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n'), 'utf-8');
  const masterAudio = path.join(scratchDir, 'master_voiceover.wav');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:a pcm_s16le "${masterAudio}"`, { stdio: 'ignore' });

  // ---------------------------------------------------------------------------
  // SYNCHRONIZED SOUND DESIGN (SFX)
  // ---------------------------------------------------------------------------
  const sfxDir = path.join(PROJECT_ROOT, 'public', 'sfx');
  const rumbleFile = path.join(sfxDir, 'train_track_rumble.wav');
  const telemetryFile = path.join(sfxDir, 'lzb_telemetry_pulse.wav');
  const clampFile = path.join(sfxDir, 'brake_pneumatic_clamp.wav');
  const screechFile = path.join(sfxDir, 'rail_friction_screech.wav');
  const airReleaseFile = path.join(sfxDir, 'brake_air_release.wav');

  let finalAudioPath = masterAudio;

  if (fs.existsSync(rumbleFile) && fs.existsSync(clampFile)) {
    console.log(`\n🎧 [SOUND DESIGN] Layering synchronized cinema SFX tracks...`);
    const totalSec = accumFrame / 30.0;

    // Detect timestamps from narration beats
    let tTelemetrySec = (totalSec * 0.45).toFixed(2);
    let tClampSec = (totalSec * 0.72).toFixed(2);
    let tHaltSec = (totalSec * 0.88).toFixed(2);

    for (const b of beatTimings) {
      const lower = b.narration.toLowerCase();
      const bSec = (b.startFrame / 30.0).toFixed(2);
      if (lower.includes('lzb') || lower.includes('ballast') || lower.includes('sensor') || lower.includes('cable') || lower.includes('invisible')) {
        tTelemetrySec = bSec;
      }
      if (lower.includes('brake') || lower.includes('friction') || lower.includes('clamp') || lower.includes('track brake') || lower.includes('pad')) {
        tClampSec = bSec;
      }
      if (lower.includes('stop') || lower.includes('halt') || lower.includes('safe') || lower.includes('standstill') || lower.includes('lock')) {
        tHaltSec = bSec;
      }
    }

    const telemetryMs = Math.max(0, Math.round(parseFloat(tTelemetrySec) * 1000));
    const clampMs = Math.max(0, Math.round(parseFloat(tClampSec) * 1000));
    const haltMs = Math.max(0, Math.round(parseFloat(tHaltSec) * 1000));

    console.log(`   • Track Rumble Ambience: 0.0s -> ${tHaltSec}s`);
    console.log(`   • LZB Telemetry Ping: ${tTelemetrySec}s (${telemetryMs}ms)`);
    console.log(`   • Pneumatic Brake Clamp & Spark Screech: ${tClampSec}s (${clampMs}ms)`);
    console.log(`   • Dead Halt Air Release: ${tHaltSec}s (${haltMs}ms)`);

    const masterAudioWithSfx = path.join(scratchDir, 'master_audio_with_sfx.wav');
    const filterStr = `[1:a]volume=0.22,afade=t=out:st=${tHaltSec}:d=1.2[rumble];[2:a]adelay=${telemetryMs}|${telemetryMs},volume=0.75[telemetry];[3:a]adelay=${clampMs}|${clampMs},volume=1.0[clamp];[4:a]adelay=${clampMs}|${clampMs},volume=0.85[screech];[5:a]adelay=${haltMs}|${haltMs},volume=0.90[air];[0:a][rumble][telemetry][clamp][screech][air]amix=inputs=6:duration=first:weights=1.0 0.35 0.75 0.95 0.85 0.85:normalize=0[aout]`;

    try {
      execSync(`ffmpeg -y -i "${masterAudio}" -i "${rumbleFile}" -i "${telemetryFile}" -i "${clampFile}" -i "${screechFile}" -i "${airReleaseFile}" -filter_complex "${filterStr}" -map "[aout]" -t ${totalSec} -c:a pcm_s16le "${masterAudioWithSfx}"`, { stdio: 'ignore' });
      finalAudioPath = masterAudioWithSfx;
      console.log(`✅ [SOUND DESIGN] Synced audio mix created: master_audio_with_sfx.wav`);
    } catch (e) {
      console.warn(`⚠️ SFX mixing failed, falling back to clean voiceover:`, e.message);
    }
  }

  // Generate mobile-safe ASS subtitles
  const assPath = path.join(scratchDir, 'subtitles_minimal.ass');
  let ass = `[Script Info]
Title: Universal Autonomous Reel Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: StoryNarrator,Montserrat ExtraBold,62,&H00FFFFFF,&H0000FFFF,&H00000000,&H80000000,1,0,0,0,100,100,1.0,0,1,3.5,0,2,80,80,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const formatAssTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const sInt = Math.floor(s);
    const cs = Math.floor((s - sInt) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(sInt).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  let curSec = 0;
  for (const b of beatTimings) {
    const startT = formatAssTime(curSec);
    const endT = formatAssTime(curSec + b.durationSec);
    const upperText = b.narration.toUpperCase();
    ass += `Dialogue: 0,${startT},${endT},StoryNarrator,,0,0,0,,${upperText}\n`;
    curSec += b.durationSec + (pauseFrames / 30.0);
  }
  fs.writeFileSync(assPath, ass, 'utf-8');

  console.log(`✅ [AGENT 3: AUDIO SYNTHESIZER] Master audio & subtitles ready (${accumFrame} frames / ${(accumFrame/30).toFixed(1)}s)`);
  return {
    masterAudioPath: finalAudioPath,
    assPath,
    totalFrames: accumFrame,
    beatTimings,
  };
}

// -----------------------------------------------------------------------------
// AGENT 4: MASTER MANIFEST ASSEMBLER
// -----------------------------------------------------------------------------
export function assembleMasterManifest(scriptData, visualData, audioData) {
  console.log(`\n📦 [AGENT 4: MANIFEST ASSEMBLER] Compiling Unified 3D Production Manifest...`);

  const combinedShots = [];
  for (let i = 0; i < audioData.beatTimings.length; i++) {
    const timing = audioData.beatTimings[i];
    const scriptBeat = scriptData.beats[timing.beatIndex] || {};
    const visualCard = visualData.actionCards.find(c => c.beatIndex === timing.beatIndex) || visualData.actionCards[i % visualData.actionCards.length] || {};

    combinedShots.push({
      shotIndex: i,
      narration: timing.narration,
      startFrame: timing.startFrame,
      endFrame: timing.endFrame,
      durationFrames: timing.durationFrames,
      durationSec: timing.durationSec,
      stageArchetype: visualCard.stageArchetype || 'KINETIC_TRACKING',
      cameraSetup: visualCard.cameraSetup || { shotType: 'parallel_tracking', focalDistance: 'detail' },
      heroActor: visualCard.heroActor || 'hero_machine',
      cutawayEffect: visualCard.cutawayEffect || 'NONE',
      sketchfabAssetQuery: visualCard.sketchfabAssetQuery || '',
      focalProp: visualCard.focalProp || 'hero_tool',
      visualGagOrDiagram: visualCard.visualGagOrDiagram || '',
    });
  }

  const manifest = {
    title: scriptData.title,
    premise: scriptData.premise,
    themeEra: visualData.themeEra || 'systems_engineering',
    scenicBackdrop: visualData.scenicBackdrop || 'alpine_mountains',
    costumePreset: visualData.costumePreset || 'modern_suit',
    colorPalette: visualData.colorPalette,
    totalFrames: audioData.totalFrames,
    shots: combinedShots,
  };

  console.log(`✅ [AGENT 4: MANIFEST ASSEMBLER] Master manifest compiled with ${combinedShots.length} detailed 3D shots!`);
  return manifest;
}
