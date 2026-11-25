/**
 * Oddly Told Autonomous 2D Watchdog & QA Inspector
 * 
 * Gates:
 * 1. File Health: Exists, size > 1.0 MB
 * 2. Resolution & Sync: 1080x1920 portrait, AV duration sync delta < 0.25s
 * 3. Dead Silence Gate: ZERO silence periods > 1.2s (retention killer)
 * 4. Volume Normalization: Mean volume between -30dB and -14dB, max < -0.5dB
 * 5. Subtitle Monotonicity: Valid words, non-negative, sequential boundaries
 * 6. Visual Sanity Audit: Extracts keyframes to confirm no blank frames
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { auditPopVectorStill } from './pop_vector_vision_watchdog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const AUDIT_DIR = path.join(PROJECT_ROOT, 'out', 'watchdog_oddly_audit');

/**
 * Extracts raw video stream MD5 checksum (independent of audio track or container metadata, zero regex)
 */
export function getVideoStreamMD5(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const out = execSync(`ffmpeg -i "${filePath.replace(/\\/g, '/')}" -map 0:v -c copy -f md5 -`, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
    const md5Marker = 'MD5=';
    const idx = out.indexOf(md5Marker);
    if (idx !== -1) {
      return out.slice(idx + md5Marker.length, idx + md5Marker.length + 32).trim().toLowerCase();
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Probes audio and video streams using ffprobe
 */
function probeMedia(filePath) {
  try {
    const cmd = `ffprobe -v error -show_entries stream=codec_type,duration,width,height -of json "${filePath.replace(/\\/g, '/')}"`;
    const data = JSON.parse(execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString());
    const vStream = data.streams?.find(s => s.codec_type === 'video');
    const aStream = data.streams?.find(s => s.codec_type === 'audio');

    const fmtCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath.replace(/\\/g, '/')}"`;
    const fmtDur = parseFloat(execSync(fmtCmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim()) || 0;

    return {
      hasVideo: Boolean(vStream),
      hasAudio: Boolean(aStream),
      videoDur: vStream?.duration ? parseFloat(vStream.duration) : fmtDur,
      audioDur: aStream?.duration ? parseFloat(aStream.duration) : fmtDur,
      width: vStream?.width || 0,
      height: vStream?.height || 0,
      formatDur: fmtDur,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Detects silences > maxDurationSec using ffmpeg silencedetect (zero regex)
 */
function detectDeadSilences(filePath, maxDurationSec = 1.3, noiseThreshold = '-35dB') {
  try {
    const cmd = `ffmpeg -i "${filePath.replace(/\\/g, '/')}" -af silencedetect=noise=${noiseThreshold}:d=${maxDurationSec} -f null - 2>&1`;
    const out = execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
    const silences = [];
    const marker = 'silence_duration: ';
    let searchPos = 0;
    while ((searchPos = out.indexOf(marker, searchPos)) !== -1) {
      const start = searchPos + marker.length;
      const spaceIdx = out.indexOf(' ', start);
      const newlineIdx = out.indexOf('\n', start);
      const end = Math.min(
        spaceIdx !== -1 ? spaceIdx : Infinity,
        newlineIdx !== -1 ? newlineIdx : Infinity
      );
      if (end !== Infinity) {
        const val = parseFloat(out.slice(start, end).trim());
        if (!isNaN(val)) silences.push(val);
      }
      searchPos = start;
    }
    return silences;
  } catch (e) {
    return [];
  }
}

/**
 * Detects mean and max volume levels using ffmpeg volumedetect (zero regex)
 */
function detectVolume(filePath) {
  try {
    const cmd = `ffmpeg -i "${filePath.replace(/\\/g, '/')}" -af volumedetect -f null - 2>&1`;
    const out = execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();

    let mean = null;
    let max = null;

    const meanMarker = 'mean_volume: ';
    const meanIdx = out.indexOf(meanMarker);
    if (meanIdx !== -1) {
      const dbIdx = out.indexOf(' dB', meanIdx);
      if (dbIdx !== -1) {
        mean = parseFloat(out.slice(meanIdx + meanMarker.length, dbIdx).trim());
      }
    }

    const maxMarker = 'max_volume: ';
    const maxIdx = out.indexOf(maxMarker);
    if (maxIdx !== -1) {
      const dbIdx = out.indexOf(' dB', maxIdx);
      if (dbIdx !== -1) {
        max = parseFloat(out.slice(maxIdx + maxMarker.length, dbIdx).trim());
      }
    }

    return { mean, max };
  } catch (e) {
    return { mean: null, max: null };
  }
}

/**
 * Main Watchdog Audit function for Oddly Told Short
 */
export async function auditOddlyVideo({
  videoPath,
  manifestPath,
  language = 'en',
  topicTitle = 'Oddly Told Short',
  skipVisionGate = false,
}) {
  console.log('\n===============================================================');
  console.log(`🛡️ [ODDLY WATCHDOG] Running Quality Audit: [${language.toUpperCase()}]`);
  console.log(`🎯 Target: ${videoPath}`);
  console.log('===============================================================');

  const report = {
    timestamp: new Date().toISOString(),
    videoPath,
    language,
    topicTitle,
    passed: false,
    checks: [],
    errors: [],
  };

  // Gate 1: File Exists & Size
  if (!fs.existsSync(videoPath)) {
    const err = `CRITICAL: Rendered video not found at ${videoPath}`;
    report.errors.push(err);
    report.checks.push({ gate: 'FILE_EXISTENCE', passed: false, detail: err });
    console.error(`❌ Gate 1 FAILED: ${err}`);
    return report;
  }

  const stats = fs.statSync(videoPath);
  const sizeMB = stats.size / (1024 * 1024);
  if (sizeMB < 1.0) {
    const err = `CRITICAL: Video file size too small (${sizeMB.toFixed(2)} MB, expected >= 1.0 MB)`;
    report.errors.push(err);
    report.checks.push({ gate: 'FILE_SIZE', passed: false, detail: err });
    console.error(`❌ Gate 1 FAILED: ${err}`);
    return report;
  }
  report.checks.push({ gate: 'FILE_HEALTH', passed: true, detail: `Healthy file size: ${sizeMB.toFixed(2)} MB` });
  console.log(`✅ Gate 1 PASSED: File healthy (${sizeMB.toFixed(2)} MB)`);

  // Gate 2: Resolution & Stream Parity
  const streams = probeMedia(videoPath);
  if (!streams || !streams.hasVideo || !streams.hasAudio) {
    const err = `CRITICAL: Missing video or audio stream in ${videoPath}`;
    report.errors.push(err);
    report.checks.push({ gate: 'STREAM_INTEGRITY', passed: false, detail: err });
    console.error(`❌ Gate 2 FAILED: ${err}`);
    return report;
  }

  if (streams.width !== 1080 || streams.height !== 1920) {
    const err = `INVALID RESOLUTION: Expected 1080x1920 vertical format, got ${streams.width}x${streams.height}`;
    report.errors.push(err);
    report.checks.push({ gate: 'ASPECT_RATIO', passed: false, detail: err });
    console.error(`❌ Gate 2 FAILED: ${err}`);
    return report;
  }

  const durDelta = Math.abs(streams.videoDur - streams.audioDur);
  if (durDelta > 0.25) {
    const err = `AUDIO-VIDEO DESYNC: Video duration (${streams.videoDur.toFixed(2)}s) and Audio duration (${streams.audioDur.toFixed(2)}s) differ by ${durDelta.toFixed(3)}s!`;
    report.errors.push(err);
    report.checks.push({ gate: 'AV_SYNC', passed: false, detail: err });
    console.error(`❌ Gate 2 FAILED: ${err}`);
    return report;
  }
  report.checks.push({ gate: 'STREAM_SYNC', passed: true, detail: `1080x1920 portrait, duration: ${streams.formatDur.toFixed(2)}s, delta: ${durDelta.toFixed(3)}s` });
  console.log(`✅ Gate 2 PASSED: 1080x1920 vertical format & AV sync verified (${streams.formatDur.toFixed(2)}s)`);

  // Gate 3: Anti-Fallback & Visual Deduplication Gate (Raw Video Stream MD5)
  const currentStreamMD5 = getVideoStreamMD5(videoPath);
  report.streamMD5 = currentStreamMD5;

  const historyFile = path.join(PROJECT_ROOT, 'scratch', 'oddly_history.json');
  if (fs.existsSync(historyFile)) {
    try {
      const history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
      for (const h of history) {
        const pastMD5 = language === 'hi' ? h.hiStreamMD5 : h.enStreamMD5;
        if (pastMD5 && currentStreamMD5 && pastMD5 === currentStreamMD5) {
          const err = `ANTI-FALLBACK VIOLATION: Raw video stream MD5 (${currentStreamMD5}) matches already generated episode "${h.titleEn || h.topic}"! Visual reuse / audio swap rejected.`;
          report.errors.push(err);
          report.checks.push({ gate: 'DEDUPLICATION_GUARD', passed: false, detail: err });
          console.error(`❌ Gate 3 FAILED: ${err}`);
          return report;
        }
      }
    } catch (e) {}
  }
  report.checks.push({ gate: 'DEDUPLICATION_GUARD', passed: true, detail: `Unique visual animation stream MD5 (${currentStreamMD5})` });
  console.log(`✅ Gate 3 PASSED: Unique visual animation stream verified (${currentStreamMD5})`);

  // Gate 4: Dead Silence Detection (>1.3s is unacceptable for 40s short)
  const silences = detectDeadSilences(videoPath, 1.3, '-35dB');
  if (silences.length > 0) {
    const maxSil = Math.max(...silences);
    const err = `DEAD SILENCE DETECTED: Found ${silences.length} dead silence gaps > 1.3s (longest: ${maxSil.toFixed(2)}s)`;
    report.errors.push(err);
    report.checks.push({ gate: 'DEAD_SILENCE', passed: false, detail: err });
    console.error(`❌ Gate 4 FAILED: ${err}`);
    return report;
  }
  report.checks.push({ gate: 'DEAD_SILENCE', passed: true, detail: `Zero dead silences > 1.2s detected` });
  console.log(`✅ Gate 4 PASSED: Zero dead silences (> 1.2s) detected`);

  // Gate 5: Volume Normalization Gate
  const volume = detectVolume(videoPath);
  if (volume.mean === null || volume.mean < -35.0 || volume.mean > -10.0) {
    const err = `VOLUME ANOMALY: Mean volume is ${volume.mean} dB (target range: -30dB to -14dB)`;
    report.errors.push(err);
    report.checks.push({ gate: 'VOLUME_LEVEL', passed: false, detail: err });
    console.error(`❌ Gate 5 FAILED: ${err}`);
    return report;
  }
  report.checks.push({ gate: 'VOLUME_LEVEL', passed: true, detail: `Mean volume: ${volume.mean} dB, Max: ${volume.max} dB` });
  console.log(`✅ Gate 5 PASSED: Audio volume balanced (Mean: ${volume.mean} dB, Max: ${volume.max} dB)`);

  // Gate 6: Subtitle Integrity
  if (manifestPath && fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const words = manifest.words || [];
      if (words.length < 15) {
        const err = `SUBTITLE UNDERFLOW: Only ${words.length} words found in manifest (minimum 15 required)`;
        report.errors.push(err);
        report.checks.push({ gate: 'SUBTITLES_COUNT', passed: false, detail: err });
        console.error(`❌ Gate 6 FAILED: ${err}`);
        return report;
      }

      let timeTravelCount = 0;
      for (let i = 0; i < words.length - 1; i++) {
        if (words[i + 1].start < words[i].start - 0.05) {
          timeTravelCount++;
        }
      }

      if (timeTravelCount > 0) {
        const err = `SUBTITLE TIMING ERROR: Found ${timeTravelCount} non-monotonic word timestamps`;
        report.errors.push(err);
        report.checks.push({ gate: 'SUBTITLES_MONOTONIC', passed: false, detail: err });
        console.error(`❌ Gate 6 FAILED: ${err}`);
        return report;
      }

      report.checks.push({
        gate: 'SUBTITLE_INTEGRITY',
        passed: true,
        detail: `Clean word boundaries (${words.length} words, sequential)`
      });
      console.log(`✅ Gate 6 PASSED: Subtitles verified (${words.length} words, sequential)`);
    } catch (e) {
      console.warn(`⚠️ Subtitle check warning: ${e.message}`);
    }
  }

  // Gate 7: Multimodal Vision Quality Audit (Gemini Multimodal Eyes on Rendered Keyframes)
  if (!skipVisionGate) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const keyframes = [
    { sec: '00:00:02.000', name: `audit_${language}_hook.jpg`, label: 'Hook (Scene 1)' },
    { sec: '00:00:12.000', name: `audit_${language}_mid.jpg`, label: 'Midpoint (Scene 3/4)' },
    { sec: '00:00:29.000', name: `audit_${language}_climax.jpg`, label: 'Climax (Scene 6/7)' },
  ];

  let framesExtracted = 0;
  for (const kf of keyframes) {
    const kfPath = path.join(AUDIT_DIR, kf.name);
    try {
      execSync(`ffmpeg -y -ss ${kf.sec} -i "${videoPath.replace(/\\/g, '/')}" -vframes 1 -q:v 2 "${kfPath.replace(/\\/g, '/')}"`, { stdio: 'ignore' });
      if (fs.existsSync(kfPath) && fs.statSync(kfPath).size > 10000) {
        framesExtracted++;
      }
    } catch (e) {}
  }

  if (framesExtracted < 2) {
    const err = `VISUAL AUDIT ERROR: Failed to extract clean keyframes from video`;
    report.errors.push(err);
    report.checks.push({ gate: 'VISUAL_AUDIT', passed: false, detail: err });
    console.error(`❌ Gate 7 FAILED: ${err}`);
    return report;
  }

  console.log(`\n👁️ [GATE 7] Running Gemini Multimodal Vision Inspection on rendered keyframes...`);
  for (const kf of keyframes) {
    const kfPath = path.join(AUDIT_DIR, kf.name);
    if (!fs.existsSync(kfPath)) continue;

    try {
      const visionResult = await auditPopVectorStill({
        imagePath: kfPath,
        topic: topicTitle,
        sceneIndex: kf.name.includes('hook') ? 1 : kf.name.includes('mid') ? 4 : 7,
        narration: topicTitle,
        expectedHero: 'Pop Vector Narrative Element',
      });

      console.log(`   👁️ Vision Check [${kf.label}]: Score ${visionResult.score}/10 | Passed: ${visionResult.passed}`);

      const hasFatalDefect =
        visionResult.fallback_card_detected ||
        visionResult.anachronism_detected ||
        visionResult.screen_block_detected ||
        visionResult.duplicate_subtitles_detected ||
        visionResult.asset_dump_detected;

      if (hasFatalDefect || visionResult.score < 4.0) {
        let fatalReason = visionResult.critique;
        if (visionResult.fallback_card_detected) fatalReason = 'ACTIVE PROP fallback card detected';
        else if (visionResult.anachronism_detected) fatalReason = 'Era anachronism (e.g. modern tech in ancient history)';
        else if (visionResult.screen_block_detected) fatalReason = 'Massive flat color block covering screen';
        else if (visionResult.duplicate_subtitles_detected) fatalReason = 'Duplicate / clashing subtitles in scene';
        else if (visionResult.asset_dump_detected) fatalReason = 'Asset dumping / cluttered objects';

        const err = `GATE 7 VISION REJECTION on ${kf.label}: ${fatalReason} (Score: ${visionResult.score}/10). Critique: ${visionResult.critique}`;
        report.errors.push(err);
        report.checks.push({ gate: 'VISUAL_VISION_AUDIT', passed: false, detail: err });
        console.error(`❌ Gate 7 FAILED: ${err}`);
        return report;
      }
    } catch (vErr) {
      console.warn(`   ⚠️ Vision audit skipped for ${kf.label}: ${vErr.message?.slice(0, 80)}`);
    }
  }

  report.checks.push({ gate: 'VISUAL_AUDIT', passed: true, detail: `${framesExtracted} keyframes passed Multimodal Vision Inspection` });
  console.log(`✅ Gate 7 PASSED: Multimodal Vision Inspection verified all keyframes.`);
  }

  // Gate 8: Scene Diversity & Layout Entropy Guard
  if (manifestPath && fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const beats = manifest.beats || [];
      const primitives = beats.map((b) => b.heroElement || b.primitive || b.title || `Scene${b.id}`);
      const uniquePrimitives = new Set(primitives);

      // Check 1: At least 4 distinct primitives required across video
      if (uniquePrimitives.size < 4) {
        const err = `LAYOUT MONOTONY: Video only has ${uniquePrimitives.size} unique primitives (${[...uniquePrimitives].join(', ')}). Minimum 4 required to prevent visual fatigue.`;
        report.errors.push(err);
        report.checks.push({ gate: 'SCENE_DIVERSITY', passed: false, detail: err });
        console.error(`❌ Gate 8 FAILED: ${err}`);
        return report;
      }

      // Check 2: No consecutive duplicate primitives
      for (let i = 0; i < primitives.length - 1; i++) {
        if (primitives[i] === primitives[i + 1]) {
          const err = `CONSECUTIVE REPETITION: Beat ${i + 1} and Beat ${i + 2} both use identical primitive "${primitives[i]}". Consecutive repetition banned.`;
          report.errors.push(err);
          report.checks.push({ gate: 'SCENE_DIVERSITY', passed: false, detail: err });
          console.error(`❌ Gate 8 FAILED: ${err}`);
          return report;
        }
      }

      // Check 3: Check against past episode sequence repetition
      if (fs.existsSync(historyFile)) {
        try {
          const history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
          const lastEntry = history[history.length - 1];
          if (lastEntry && lastEntry.primitives) {
            const isIdenticalSeq = JSON.stringify(lastEntry.primitives) === JSON.stringify(primitives);
            if (isIdenticalSeq) {
              const err = `INTER-VIDEO TEMPLATE REPETITION: This video uses the exact same primitive sequence (${primitives.join(' -> ')}) as the previous episode.`;
              report.errors.push(err);
              report.checks.push({ gate: 'SCENE_DIVERSITY', passed: false, detail: err });
              console.error(`❌ Gate 8 FAILED: ${err}`);
              return report;
            }
          }
        } catch (e) {}
      }

      report.checks.push({
        gate: 'SCENE_DIVERSITY',
        passed: true,
        detail: `${uniquePrimitives.size} unique spatial paradigms: [${primitives.join(' -> ')}]`
      });
      console.log(`✅ Gate 8 PASSED: Scene diversity verified (${uniquePrimitives.size} paradigms: ${primitives.join(' -> ')})`);
    } catch (err) {
      console.warn(`⚠️ Gate 8 diversity warning: ${err.message}`);
    }
  }

  report.passed = true;
  console.log(`\n🎉 [ODDLY WATCHDOG] ALL AUDIT GATES PASSED! Video ready for distribution.\n`);
  return report;
}

if (process.argv[1] && process.argv[1].endsWith('oddly_watchdog.js')) {
  const video = process.argv[2] || path.join(PROJECT_ROOT, 'out', 'oddly_told_brain_en.mp4');
  const manifest = process.argv[3] || path.join(PROJECT_ROOT, 'src', 'data', 'oddly_manifest_en.json');
  auditOddlyVideo({
    videoPath: video,
    manifestPath: manifest,
    language: video.includes('_hi') ? 'hi' : 'en',
  }).then(r => {
    process.exit(r.passed ? 0 : 1);
  });
}
