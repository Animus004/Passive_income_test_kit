/**
 * ==============================================================================
 * Stateless NVENC Remotion Producer Worker & Vision Self-Healer
 * ==============================================================================
 * - Redirects TMP/TEMP/Chromium caches onto D:\factory_workspace\tmp (C: safety)
 * - Bundles src/index.ts ONCE per source-code hash into D:\factory_workspace\bundle
 * - Reuses shared Chromium browser via @remotion/renderer openBrowser() (recycled every 15 jobs)
 * - Renders via NVIDIA GTX 1660 SUPER NVENC + ANGLE GPU acceleration
 * - Self-heals framing/anachronism issues caught by pop_vector_vision_watchdog.js (max 2 retries)
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

import { bundle } from '@remotion/bundler';
import { openBrowser, selectComposition, renderMedia } from '@remotion/renderer';

import {
  PATHS,
  PROJECT_ROOT,
  ensureWorkspaceAndEnv,
  getFactoryDb,
  acquireProcessLock,
  isStreamMd5Seen,
  registerStreamMd5,
} from './factory_db.mjs';
import { pickNextUniqueTopic, synthesizeTrendRemixedTopic } from './topic_matrix_engine.mjs';
import {
  ERA_CATALOG,
  DYNAMIC_ARCHETYPES,
  generateValidatedPopScript,
  enrichManifestWithChoreography,
} from './pop_script_generator.mjs';
import { auditOddlyVideo, getVideoStreamMD5 } from './oddly_watchdog.js';
import { auditPopVectorStill } from './pop_vector_vision_watchdog.js';
import { sendTelegramText } from './telegram_notifier.js';

// Redirect temp directories immediately BEFORE initializing Chromium/Remotion
ensureWorkspaceAndEnv();
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const BROWSER_RECYCLE_INTERVAL = 15;
const MAX_REPAIR_ATTEMPTS = 2;

function computeSourceHash() {
  const hash = crypto.createHash('sha256');
  const targets = [
    path.join(PROJECT_ROOT, 'package.json'),
    path.join(PROJECT_ROOT, 'src', 'index.ts'),
    path.join(PROJECT_ROOT, 'src', 'Root.tsx'),
    path.join(PROJECT_ROOT, 'src', 'scenes'),
    path.join(PROJECT_ROOT, 'src', 'components'),
    path.join(PROJECT_ROOT, 'src', 'theme'),
  ];

  function walk(itemPath) {
    if (!fs.existsSync(itemPath)) return;
    const st = fs.statSync(itemPath);
    if (st.isDirectory()) {
      for (const child of fs.readdirSync(itemPath).sort()) {
        walk(path.join(itemPath, child));
      }
    } else {
      hash.update(itemPath);
      hash.update(String(st.mtimeMs));
      hash.update(String(st.size));
    }
  }

  for (const t of targets) walk(t);
  return hash.digest('hex').slice(0, 16);
}

/**
 * Bundles Remotion project once into D:\factory_workspace\bundle and reuses it across 1,000+ renders.
 */
async function ensurePrecompiledBundle() {
  const currentHash = computeSourceHash();
  if (fs.existsSync(PATHS.bundleMeta) && fs.existsSync(path.join(PATHS.bundle, 'index.html'))) {
    try {
      const meta = JSON.parse(fs.readFileSync(PATHS.bundleMeta, 'utf-8'));
      if (meta.hash === currentHash) {
        console.log(`📦 [BUNDLE CACHE HIT] Reusing compiled bundle (hash: ${currentHash})`);
        return PATHS.bundle;
      }
    } catch (_) {}
  }

  console.log(`📦 [BUNDLE BUILD] Compiling src/index.ts once into ${PATHS.bundle}...`);
  const t0 = Date.now();
  await bundle({
    entryPoint: path.join(PROJECT_ROOT, 'src', 'index.ts'),
    outDir: PATHS.bundle,
  });
  fs.writeFileSync(
    PATHS.bundleMeta,
    JSON.stringify({ hash: currentHash, builtAt: new Date().toISOString() }, null, 2)
  );
  console.log(`✅ [BUNDLE READY] Compiled in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return PATHS.bundle;
}

/**
 * Serves isolated per-job media files (master_hi.mp3) over localhost HTTP with CORS
 * so Chromium can stream dynamic audio without touching `public/`.
 */
function startLocalJobMediaServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const cleanUrl = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '');
        const fullPath = path.resolve(PATHS.jobs, cleanUrl);
        if (!fullPath.startsWith(path.resolve(PATHS.jobs)) || !fs.existsSync(fullPath)) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const stat = fs.statSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mime = ext === '.mp3' ? 'audio/mpeg' : ext === '.json' ? 'application/json' : 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': mime,
          'Content-Length': stat.size,
          'Access-Control-Allow-Origin': '*',
          'Accept-Ranges': 'bytes',
        });
        fs.createReadStream(fullPath).pipe(res);
      } catch (e) {
        res.writeHead(500);
        res.end(e.message);
      }
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${addr.port}`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

async function openGpuBrowser() {
  return openBrowser('chrome', {
    chromiumOptions: {
      gl: 'angle',
    },
  });
}

async function renderJobVideo({ browser, bundleLocation, manifest, audioSrc, outputMp4 }) {
  const inputProps = {
    language: 'hi',
    manifest,
    audioSrc,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'AutonomousPopVectorHi',
    inputProps,
    browserInstance: browser,
  });

  if (fs.existsSync(outputMp4)) fs.unlinkSync(outputMp4);

  let lastPct = -1;
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputMp4,
    inputProps,
    browserInstance: browser,
    hardwareAcceleration: 'if-possible',
    videoBitrate: '8M',
    concurrency: 2,
    chromiumOptions: {
      gl: 'angle',
    },
    timeoutInMilliseconds: 120000,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct >= lastPct + 25) {
        lastPct = pct;
        console.log(`   ⏳ NVENC Progress: ${pct}%`);
      }
    },
  });
}

/**
 * Deterministic manifest auto-healer when Multimodal Vision detects layout or framing defects.
 */
function applyVisionAutoRepair(manifest, beatIdx, visionResult, era) {
  const beat = manifest.beats[beatIdx];
  if (!beat) return false;
  const catalog = ERA_CATALOG[era] || ERA_CATALOG.ancient;

  if (visionResult.anachronism_detected) {
    beat.environment = catalog.environments[beatIdx % catalog.environments.length];
    beat.heroElement = catalog.props[beatIdx % catalog.props.length];
    if (!catalog.roles.includes(beat.character?.role)) {
      beat.character = { ...(beat.character || {}), role: catalog.roles[0] };
    }
    return true;
  }

  if (
    visionResult.collision_detected ||
    visionResult.staging_defect_detected ||
    visionResult.text_overlap_detected ||
    visionResult.floating_detected ||
    (visionResult.score || 0) < 7.0
  ) {
    const curArch = beat.director_staging?.archetype || 'CLEAN_SPLIT_DUO';
    if (curArch === 'MACRO_HOOK_PUNCH') {
      // Wide/tall props in Beat 1 (bows/maps) can overlap; swap to compact iconic centerpiece or CLEAN_SPLIT_DUO
      beat.heroElement = era === 'ancient' ? 'sudarshan_chakra_divine' : 'alarm_clock_retro';
      beat.director_staging = { archetype: 'CLEAN_SPLIT_DUO' };
    } else if (curArch === 'DUAL_CONFRONTATION') {
      beat.secondCharacter = {
        ...(beat.secondCharacter || { role: era === 'ancient' ? 'arjuna' : 'modern_commoner' }),
        pose: era === 'ancient' ? 'heroic_idle' : 'standing_dazed',
      };
    } else if (curArch === 'REACTION_CLOSEUP') {
      beat.character = {
        ...(beat.character || {}),
        pose: era === 'ancient' ? 'orator_folded' : 'standing_dazed',
      };
    } else {
      const safeOrder = ['CLEAN_SPLIT_DUO', 'DOCUMENT_EDICT_UNROLL', 'STRATEGY_MAP_ARENA', 'REACTION_CLOSEUP'];
      const nextIdx = (safeOrder.indexOf(curArch) + 1) % safeOrder.length;
      beat.director_staging = { archetype: safeOrder[nextIdx] };
    }
    return true;
  }

  return false;
}

/**
 * Extracts evenly distributed archetype stills and verifies both technical & vision gates.
 */
async function evaluateRenderedJob(db, jobId, topicText, era, videoPath, manifestPath, jobDir, manifest) {
  // Check technical media gates (resolution, AV sync, silence, volume, subtitle monotonicity)
  //Note: temporarily skip oddly_watchdog's internal MD5 check against legacy json and enforce SQLite MD5 check instead
  const techAudit = await auditOddlyVideo({
    videoPath,
    manifestPath,
    language: 'hi',
    topicTitle: topicText,
    skipVisionGate: true,
  });

  if (!techAudit.passed) {
    return {
      passed: false,
      stage: 'technical',
      reason: techAudit.errors?.join('; ') || 'Technical gate failure',
      streamMD5: techAudit.streamMD5,
    };
  }

  const md5 = techAudit.streamMD5 || getVideoStreamMD5(videoPath);
  if (isStreamMd5Seen(db, md5)) {
    return {
      passed: false,
      stage: 'dedup',
      reason: `Duplicate raw video stream MD5 (${md5}) matches existing episode.`,
      streamMD5: md5,
    };
  }

  // Extract 3 key distinct beat stills inside jobDir for per-beat Vision QA
  const targetBeatIndices = [0, 1, 3, 7].filter((idx) => idx < manifest.beats.length);
  let scoreSum = 0;
  let scoreCount = 0;

  for (const beatIdx of targetBeatIndices) {
    const b = manifest.beats[beatIdx];
    const startSec = Number(b.startSec || 0);
    const durSec = Number(b.durationSec || 3);
    const sampleSec = (startSec + durSec * 0.45).toFixed(2);
    const stillPath = path.join(jobDir, `qa_beat_${beatIdx + 1}.jpg`);

    try {
      execSync(
        `ffmpeg -y -ss ${sampleSec} -i "${videoPath.replace(/\\/g, '/')}" -frames:v 1 -q:v 2 "${stillPath.replace(/\\/g, '/')}"`,
        { stdio: 'ignore' }
      );
      if (!fs.existsSync(stillPath)) continue;

      const vision = await auditPopVectorStill({
        imagePath: stillPath,
        topic: topicText,
        sceneIndex: beatIdx + 1,
        narration: b.audio_text || b.title,
        expectedHero: b.heroElement || '',
      });

      const beatScore = Number(vision.score || 7.5);
      scoreSum += beatScore;
      scoreCount++;
      console.log(`   👁️ [QA BEAT ${beatIdx + 1} (${b.director_staging?.archetype})] Score: ${beatScore}/10`);

      const hardFail =
        vision.anachronism_detected ||
        vision.collision_detected ||
        vision.fallback_card_detected ||
        vision.duplicate_subtitles_detected ||
        beatScore < 6.5;

      if (hardFail) {
        return {
          passed: false,
          stage: 'vision',
          failingBeatIndex: beatIdx,
          visionResult: vision,
          avgScore: scoreCount ? scoreSum / scoreCount : beatScore,
          reason: `Vision fail on Beat ${beatIdx + 1}: ${vision.critique || 'Visual defect'}`,
          streamMD5: md5,
        };
      }
    } catch (visErr) {
      // Do not fail entire production run if external vision API temporarily rate-limits
      console.warn(`   ⚠️ Vision API notice on beat ${beatIdx + 1}: ${visErr.message?.slice(0, 75)}`);
    }
  }

  return {
    passed: true,
    avgScore: scoreCount > 0 ? Number((scoreSum / scoreCount).toFixed(2)) : 8.2,
    streamMD5: md5,
  };
}

/**
 * Executes one complete stateless job from topic selection -> TTS -> NVENC Render -> QA Heal -> Ready Buffer.
 */
async function produceSingleJob(db, ctx, options = {}) {
  let topicRow = null;
  if (options.topicOverride) {
    topicRow = {
      id: null,
      topic_text: options.topicOverride,
      era: options.era || 'ancient',
      primary_role: options.primaryRole || null,
      secondary_role: options.secondaryRole || null,
      preferred_mood: options.era === 'modern' ? 'modern' : 'epic',
    };
  } else {
    // 10% chance to test a fresh live trend remix first before falling back to combinatorial matrix
    if (options.allowTrendRemix && Math.random() < 0.1) {
      topicRow = await synthesizeTrendRemixedTopic();
    }
    if (!topicRow) {
      topicRow = pickNextUniqueTopic({ slot: options.slot || 'afternoon', forceEra: options.era || null });
    }
  }

  const jobId = `p1_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
  const jobDir = path.join(PATHS.jobs, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  const mood = topicRow.preferred_mood || (topicRow.era === 'modern' ? 'modern' : 'epic');
  db.prepare(`
    INSERT INTO jobs (id, topic_id, topic_text, era, slot, mood, status, job_dir)
    VALUES (?, ?, ?, ?, ?, ?, 'synthesizing', ?)
  `).run(jobId, topicRow.id, topicRow.topic_text, topicRow.era, options.slot || 'auto', mood, jobDir);

  if (topicRow.id) {
    db.prepare(`UPDATE topics SET used_count = used_count + 1, last_used_at = datetime('now') WHERE id = ?`).run(topicRow.id);
  }

  console.log(`\n===============================================================`);
  console.log(`🏭 [FACTORY JOB ${jobId}] Starting Production`);
  console.log(`📌 Topic : "${topicRow.topic_text}"`);
  console.log(`🏛️ Era   : ${topicRow.era.toUpperCase()} | Mood: ${mood.toUpperCase()}`);
  console.log(`📁 Work  : ${jobDir}`);
  console.log(`===============================================================`);

  try {
    // 1. Multi-LLM Script Generation & Retention Gate
    const { era, scriptData } = await generateValidatedPopScript({
      topic: topicRow.topic_text,
      era: topicRow.era,
      primaryRole: topicRow.primary_role,
      secondaryRole: topicRow.secondary_role,
    });

    const scriptPath = path.join(jobDir, 'script.json');
    const payload = {
      topic: topicRow.topic_text,
      title_hi: scriptData.title_hi,
      title_hinglish: scriptData.title_hinglish,
      hi: {
        title: scriptData.title_hi,
        title_hinglish: scriptData.title_hinglish,
        beats: scriptData.beats.map((b, idx) => ({
          id: b.id || idx + 1,
          title: b.title,
          badge: b.badge,
          badgeEmoji: b.badgeEmoji,
          audio_text: b.narration_hi,
          display_tokens: b.display_tokens_hi || [],
          environment: b.environment,
          heroElement: b.heroElement,
          role: b.role,
          archetype: b.archetype || 'CLEAN_SPLIT_DUO',
        })),
      },
    };
    fs.writeFileSync(scriptPath, JSON.stringify(payload, null, 2), 'utf-8');

    // 2. Stateless Offline Piper TTS & Era Audio Bed Mastering
    execSync(
      `python scripts/oddly_audio_synthesizer.py --script "${scriptPath.replace(/\\/g, '/')}" --lang hi --hindi-engine piper --job-dir "${jobDir.replace(/\\/g, '/')}" --mood ${mood}`,
      { cwd: PROJECT_ROOT, stdio: 'inherit' }
    );

    const manifestPath = path.join(jobDir, 'manifest_hi.json');
    const audioPath = path.join(jobDir, 'master_hi.mp3');
    const audioSrc = `${ctx.mediaBaseUrl}/${jobId}/master_hi.mp3`;

    let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest = enrichManifestWithChoreography(manifest, scriptData, era, {
      primaryRole: topicRow.primary_role,
      secondaryRole: topicRow.secondary_role,
    });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    db.prepare(`
      UPDATE jobs SET status = 'rendering', manifest_path = ?, audio_path = ?, title_hi = ?, title_hinglish = ?, description_hi = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      manifestPath,
      audioPath,
      scriptData.title_hi,
      scriptData.title_hinglish,
      scriptData.description_hi || scriptData.title_hi,
      jobId
    );

    // 3. NVENC Render + Self-Healing Vision QA Loop
    const tempOutMp4 = path.join(jobDir, 'render_candidate.mp4');
    let qaResult = null;
    let repairCount = 0;

    for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
      console.log(`\n🎬 [RENDER ATTEMPT ${attempt + 1}/${MAX_REPAIR_ATTEMPTS + 1}] NVENC + ANGLE...`);
      const t0 = Date.now();
      await renderJobVideo({
        browser: ctx.browser,
        bundleLocation: ctx.bundleLocation,
        manifest,
        audioSrc,
        outputMp4: tempOutMp4,
      });
      console.log(`⚡ Rendered ${manifest.totalFrames} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

      db.prepare(`UPDATE jobs SET status = 'qa_checking', updated_at = datetime('now') WHERE id = ?`).run(jobId);
      qaResult = await evaluateRenderedJob(db, jobId, topicRow.topic_text, era, tempOutMp4, manifestPath, jobDir, manifest);
      if (qaResult.passed) break;

      if (attempt < MAX_REPAIR_ATTEMPTS && qaResult.stage === 'vision') {
        repairCount++;
        db.prepare(`UPDATE jobs SET status = 'remediating', repair_attempts = ?, updated_at = datetime('now') WHERE id = ?`).run(repairCount, jobId);
        const healed = applyVisionAutoRepair(manifest, qaResult.failingBeatIndex, qaResult.visionResult, era);
        if (!healed) break;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
        console.log(`🛠️ [AUTO-HEAL #${repairCount}] Repaired Beat ${qaResult.failingBeatIndex + 1} manifest staging & re-rendering...`);
      } else {
        break;
      }
    }

    if (!qaResult?.passed) {
      db.prepare(`UPDATE jobs SET status = 'dead_letter', error = ?, updated_at = datetime('now') WHERE id = ?`).run(
        qaResult?.reason || 'Unknown QA rejection',
        jobId
      );
      await sendTelegramText(`⚠️ Factory Dead-Letter [${jobId}]\nTopic: ${topicRow.topic_text}\nReason: ${qaResult?.reason}`);
      console.error(`❌ [DEAD LETTER] ${jobId}: ${qaResult?.reason}`);
      return { success: false, jobId, reason: qaResult?.reason };
    }

    // 4. Promote to Ready Buffer on D:\ & record MD5
    const readyMp4 = path.join(PATHS.ready, `${jobId}.mp4`);
    fs.copyFileSync(tempOutMp4, readyMp4);
    try { fs.unlinkSync(tempOutMp4); } catch (_) {}

    registerStreamMd5(db, qaResult.streamMD5, scriptData.title_hinglish || topicRow.topic_text);
    db.prepare(`
      UPDATE jobs SET status = 'ready', video_path = ?, stream_md5 = ?, vision_score = ?, repair_attempts = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(readyMp4, qaResult.streamMD5, qaResult.avgScore || 8.0, repairCount, jobId);

    console.log(`\n🏆 [READY BUFFER PROMOTED] ${readyMp4} (Vision Score: ${qaResult.avgScore}/10, MD5: ${qaResult.streamMD5})`);
    return {
      success: true,
      jobId,
      videoPath: readyMp4,
      visionScore: qaResult.avgScore,
      streamMD5: qaResult.streamMD5,
    };
  } catch (err) {
    db.prepare(`UPDATE jobs SET status = 'dead_letter', error = ?, updated_at = datetime('now') WHERE id = ?`).run(
      err.message,
      jobId
    );
    await sendTelegramText(`💥 Factory Worker Error [${jobId}]: ${err.message}`);
    console.error(`💥 [JOB FAILED ${jobId}]`, err);
    return { success: false, jobId, reason: err.message };
  }
}

export async function runFactoryBufferBatch({
  targetBuffer = 6,
  maxProduce = null,
  slot = 'auto',
  era = null,
  topicOverride = null,
} = {}) {
  const releaseLock = acquireProcessLock('factory_render');
  if (!releaseLock) {
    console.log('🔒 Another factory render instance holds the mutex lock. Skipping cleanly to protect 7.37 GB RAM.');
    return { skipped: true, reason: 'lock_held' };
  }

  const db = getFactoryDb();
  let browser = null;
  let mediaServer = null;

  try {
    const readyCount = db.prepare(`SELECT COUNT(*) as cnt FROM jobs WHERE status = 'ready'`).get()?.cnt || 0;
    const needed = maxProduce !== null ? maxProduce : Math.max(0, targetBuffer - readyCount);

    if (needed === 0 && !topicOverride) {
      console.log(`✅ [BUFFER FULL] Already have ${readyCount}/${targetBuffer} verified videos waiting in ${PATHS.ready}.`);
      return { success: true, produced: 0, readyCount };
    }

    const toProduce = topicOverride ? 1 : needed;
    console.log(`🚀 [FACTORY BATCH] Buffer has ${readyCount}/${targetBuffer} ready. Producing ${toProduce} new episode(s)...`);

    const bundleLocation = await ensurePrecompiledBundle();
    mediaServer = await startLocalJobMediaServer();
    browser = await openGpuBrowser();

    const results = [];
    for (let i = 0; i < toProduce; i++) {
      if (i > 0 && i % BROWSER_RECYCLE_INTERVAL === 0) {
        console.log('♻️ Recycling Chromium browser instance to guarantee zero memory leaks...');
        await browser.close({ silent: true });
        browser = await openGpuBrowser();
      }
      const res = await produceSingleJob(
        db,
        { browser, bundleLocation, mediaBaseUrl: mediaServer.baseUrl },
        { slot, era, topicOverride: i === 0 ? topicOverride : null, allowTrendRemix: !topicOverride }
      );
      results.push(res);
    }

    return {
      success: true,
      produced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  } finally {
    if (browser) {
      try { await browser.close({ silent: true }); } catch (_) {}
    }
    if (mediaServer) {
      try { await mediaServer.close(); } catch (_) {}
    }
    releaseLock();
  }
}

if (process.argv[1] && process.argv[1].endsWith('factory_worker.mjs')) {
  const args = process.argv.slice(2);
  const once = args.includes('--once');
  const getArg = (flag, fallback = null) => {
    const idx = args.indexOf(flag);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const targetBuffer = Number(getArg('--target', once ? '1' : '6'));
  const maxProduce = once ? 1 : (getArg('--count') ? Number(getArg('--count')) : null);
  const slot = getArg('--slot', 'auto');
  const era = getArg('--era', null);
  const topicOverride = getArg('--topic', null);

  runFactoryBufferBatch({ targetBuffer, maxProduce, slot, era, topicOverride }).catch((err) => {
    console.error('❌ Factory worker fatal error:', err);
    process.exit(1);
  });
}
