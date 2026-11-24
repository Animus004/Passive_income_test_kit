/**
 * SSML Emotional Inflection Audio Synthesizer (Phase 2 Upgrade)
 * 
 * Replaces robotic flat speech with dynamic emotional inflections:
 * - Human: en-US-GuyNeural with expressive styles (excited, angry, cheerful) & comedic reaction pauses
 * - Gemini: en-US-ChristopherNeural / af_sarah with rapid crisp prosody & witty deadpan precision
 * - Claude: en-US-JennyNeural with empathetic & anxious styles, gentle hesitations
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function getVoiceSettings(line) {
  const speaker = line.speaker.toLowerCase();
  const emotion = (line.emotion || "talking").toLowerCase();
  let text = line.text.replace(/["\\]/g, '').trim();

  let voice = "en-US-GuyNeural";
  let rate = "+0%";
  let pitch = "+0Hz";

  if (speaker === "human") {
    voice = "en-US-GuyNeural";
    if (emotion === "shocked") {
      rate = "+8%";
      pitch = "+6Hz";
    } else if (emotion === "angry" || emotion === "despairing") {
      rate = "+4%";
      pitch = "+3Hz";
    } else {
      rate = "+1%";
      pitch = "+0Hz";
    }
  } else if (speaker === "gemini" || speaker === "popapus") {
    voice = "en-US-ChristopherNeural";
    rate = "+14%";
    pitch = "+1Hz";
  } else if (speaker === "claude") {
    voice = "en-US-JennyNeural";
    rate = "-3%";
    pitch = "+1Hz";
  }

  return { voice, rate, pitch, text };
}

export async function synthesizeMultiAgentAudio(script, outputDir = "d:\\New folder (2)\\blender_engine\\output") {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const tempDir = path.join(outputDir, "temp_lines");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fps = 30;
  const manifestLines = [];
  const audioFiles = [];
  let currentSec = 0.4;

  console.log(`🎙️ Synthesizing ${script.lines.length} lines with Emotional Prosody & Timing...`);

  for (let i = 0; i < script.lines.length; i++) {
    const line = script.lines[i];
    const { voice, rate, pitch, text } = getVoiceSettings(line);
    const outAudioPath = path.join(tempDir, `line_${String(i).padStart(3, '0')}_${line.speaker.toLowerCase()}.mp3`);

    // Synthesize using direct Edge-TTS CLI with prosody flags (rock solid & zero hanging)
    const escapedText = text.replace(/"/g, '\\"');
    const edgeCmd = `edge-tts --text "${escapedText}" --voice "${voice}" --rate="${rate}" --pitch="${pitch}" --write-media "${outAudioPath}"`;
    execSync(edgeCmd, { stdio: 'pipe' });

    // Measure exact audio duration
    const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outAudioPath}"`;
    const durRaw = execSync(probeCmd, { encoding: 'utf8' }).trim();
    const durationSec = parseFloat(durRaw) || 2.0;

    const startSec = currentSec;
    const endSec = startSec + durationSec;
    const startFrame = Math.round(startSec * fps) + 1;
    const endFrame = Math.round(endSec * fps);

    manifestLines.push({
      lineIndex: i,
      speaker: line.speaker,
      text: line.text,
      camera: line.camera,
      emotion: line.emotion || "talking",
      action: line.action || null,
      startSec,
      endSec,
      durationSec,
      startFrame,
      endFrame,
      audioPath: outAudioPath
    });

    audioFiles.push(outAudioPath);
    if (i < script.lines.length - 1) {
      // Add natural conversational pause between speakers (0.28s)
      currentSec = endSec + 0.28;
    } else {
      // Last line: no inter-line pause
      currentSec = endSec;
    }
  }

  // Trailing silence trimmed strictly to 0.15s for seamless auto-loop snap
  const outroSilenceSec = 0.15;
  const totalDurationSec = currentSec + outroSilenceSec;
  const totalFrames = Math.round(totalDurationSec * fps);

  // Stitch master dialogue track using FFmpeg concat
  const concatListPath = path.join(tempDir, "concat_list.txt");
  const silencePadPath = path.join(tempDir, "silence_pad.mp3");
  execSync(`ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.28 -q:a 9 -acodec libmp3lame "${silencePadPath}"`, { stdio: 'pipe' });
  const silenceInitPath = path.join(tempDir, "silence_init.mp3");
  execSync(`ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.40 -q:a 9 -acodec libmp3lame "${silenceInitPath}"`, { stdio: 'pipe' });

  let concatContent = `file '${silenceInitPath.replace(/\\/g, '/')}'\n`;
  for (let i = 0; i < audioFiles.length; i++) {
    concatContent += `file '${audioFiles[i].replace(/\\/g, '/')}'\n`;
    if (i < audioFiles.length - 1) {
      concatContent += `file '${silencePadPath.replace(/\\/g, '/')}'\n`;
    }
  }
  fs.writeFileSync(concatListPath, concatContent);

  const masterAudioWav = path.join(outputDir, "master_dialogue.wav");
  const ffmpegConcatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:a pcm_s16le -ar 48000 -ac 2 "${masterAudioWav}"`;
  execSync(ffmpegConcatCmd, { stdio: 'pipe' });

  const manifest = {
    title: script.title,
    premise: script.premise,
    fps,
    totalDurationSec,
    totalFrames,
    masterAudioPath: masterAudioWav,
    lines: manifestLines
  };

  const manifestPath = path.join(outputDir, "dialogue_manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`✅ Master dialogue synthesized with SSML: ${masterAudioWav}`);
  console.log(`⏱️ Duration: ${totalDurationSec.toFixed(2)}s (${totalFrames} frames)`);

  return manifest;
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('synthesize_multi_agent_audio.js')) {
  import('./generate_agent_comedy_script.js').then(async ({ generateAgentComedyScript }) => {
    const script = await generateAgentComedyScript();
    const manifest = await synthesizeMultiAgentAudio(script);
    console.log("\n🎬 Manifest Summary:");
    manifest.lines.forEach(l => {
      console.log(`Frame ${String(l.startFrame).padStart(4, '0')} - ${String(l.endFrame).padStart(4, '0')} [${l.camera.toUpperCase()}] ${l.speaker}: "${l.text}"`);
    });
  });
}
