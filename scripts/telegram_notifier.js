/**
 * Dedicated Telegram Video & Alert Publisher for AI Shorts & Reels
 * 
 * Supports:
 * - Direct 9:16 vertical video upload with instant streaming (supports_streaming: true)
 * - Automatic 360x640 portrait thumbnail generation from video frame
 * - Accurate duration & dimension probing via ffprobe
 * - Automatic NVENC / libx264 compression if video exceeds Telegram 50MB Bot limit
 * - Safe HTML entity escaping (never breaks on underscores in hashtags or markdown symbols)
 * - 1-tap copy-paste caption code block for mobile clipboard
 * - Local manual package fallback file in out/
 */

import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return null;
  return { botToken, chatId };
}

function probeVideoMetadata(videoPath) {
  const meta = { duration: 60, width: 1080, height: 1920 };
  if (!fs.existsSync(videoPath)) return meta;

  try {
    const raw = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -show_entries format=duration -of json "${videoPath}"`,
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    const data = JSON.parse(raw);
    const stream = data.streams?.[0];
    const durSec = parseFloat(stream?.duration || data.format?.duration || '60');
    if (!isNaN(durSec) && durSec > 0) meta.duration = Math.round(durSec);
    if (stream?.width) meta.width = parseInt(stream.width, 10);
    if (stream?.height) meta.height = parseInt(stream.height, 10);
  } catch (e) {
    // ffprobe fallback
  }
  return meta;
}

function createVideoThumbnail(videoPath, meta) {
  const thumbPath = path.join(PROJECT_ROOT, 'scratch', `thumb_${Date.now()}.jpg`);
  try {
    const seekSec = Math.min(2.0, Math.max(0.5, (meta.duration || 10) * 0.05)).toFixed(2);
    execSync(
      `ffmpeg -y -ss 00:00:${seekSec.padStart(5, '0')} -i "${videoPath}" -vframes 1 -vf "scale=360:640:force_original_aspect_ratio=decrease,pad=360:640:(ow-iw)/2:(oh-ih)/2:black" -q:v 3 "${thumbPath}"`,
      { stdio: 'ignore' }
    );
    if (fs.existsSync(thumbPath) && fs.statSync(thumbPath).size > 500) {
      return thumbPath;
    }
  } catch (e) {
    // Thumbnail creation non-fatal
  }
  return null;
}

function prepareVideoForTelegram(videoPath, meta) {
  const stat = fs.statSync(videoPath);
  const MAX_BYTES = 48 * 1024 * 1024; // 48 MB safety margin under 50 MB Bot limit

  if (stat.size < MAX_BYTES) {
    return { uploadPath: videoPath, isTemp: false };
  }

  console.log(`📦 Video size (${(stat.size / (1024 * 1024)).toFixed(1)} MB) exceeds Telegram 50MB limit.`);
  console.log('⚡ Generating high-quality compressed Telegram copy (<40MB)...');

  const tempOptimizedPath = path.join(
    PROJECT_ROOT,
    'scratch',
    `tg_opt_${Date.now()}_${path.basename(videoPath)}`
  );

  const duration = Math.max(10, meta.duration || 60);
  // Target 38MB total file size
  const targetTotalBits = 38 * 8 * 1024 * 1024;
  const audioBitrateBps = 128 * 1000;
  const videoBitrateBps = Math.max(500000, Math.floor(targetTotalBits / duration) - audioBitrateBps);
  const videoBitrateK = Math.floor(videoBitrateBps / 1000) + 'k';

  // 1. Try hardware NVENC
  try {
    execSync(
      `ffmpeg -y -i "${videoPath}" -c:v h264_nvenc -preset p4 -b:v ${videoBitrateK} -maxrate ${videoBitrateK} -bufsize 2M -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${tempOptimizedPath}"`,
      { stdio: 'ignore' }
    );
    if (fs.existsSync(tempOptimizedPath) && fs.statSync(tempOptimizedPath).size < MAX_BYTES) {
      console.log(`✅ Optimized Telegram copy created via NVENC: ${(fs.statSync(tempOptimizedPath).size / (1024 * 1024)).toFixed(1)} MB`);
      return { uploadPath: tempOptimizedPath, isTemp: true };
    }
  } catch (e) {}

  // 2. Fallback to libx264
  try {
    execSync(
      `ffmpeg -y -i "${videoPath}" -c:v libx264 -preset veryfast -b:v ${videoBitrateK} -maxrate ${videoBitrateK} -bufsize 2M -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${tempOptimizedPath}"`,
      { stdio: 'ignore' }
    );
    if (fs.existsSync(tempOptimizedPath) && fs.statSync(tempOptimizedPath).size < MAX_BYTES) {
      console.log(`✅ Optimized Telegram copy created via libx264: ${(fs.statSync(tempOptimizedPath).size / (1024 * 1024)).toFixed(1)} MB`);
      return { uploadPath: tempOptimizedPath, isTemp: true };
    }
  } catch (e) {}

  return { uploadPath: videoPath, isTemp: false };
}

async function sendTelegramReelAlert({
  videoPath,
  title,
  caption,
  reason = 'Instagram API upload timed out',
  platform = 'Instagram',
  manualPkgFilename = 'manual_instagram_upload.txt',
}) {
  const config = getTelegramConfig();

  // Always write local fallback package to disk
  const manualPkgPath = path.join(PROJECT_ROOT, 'out', manualPkgFilename);
  const pkgContent = `====================================================\nMANUAL ${platform.toUpperCase()} UPLOAD PACKAGE\n====================================================\n📁 Video File: ${videoPath}\n⚠️ Reason: ${reason}\n\n📝 CAPTION & HASHTAGS (COPY & PASTE BELOW):\n----------------------------------------------------\n${caption}\n----------------------------------------------------\n`;
  try {
    fs.mkdirSync(path.dirname(manualPkgPath), { recursive: true });
    fs.writeFileSync(manualPkgPath, pkgContent, 'utf-8');
  } catch (e) {}

  if (!config) {
    console.log('\n----------------------------------------------------');
    console.log(`📋 MANUAL ${platform.toUpperCase()} UPLOAD PACKAGE GENERATED:`);
    console.log(`📁 File saved to: ${manualPkgPath}`);
    console.log(`⚠️ Reason: ${reason}`);
    console.log('\n📝 Caption & Hashtags to Copy:\n');
    console.log(caption);
    console.log('----------------------------------------------------');
    console.log('💡 Tip: Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env to receive videos & captions directly via Telegram!\n');
    return { ok: false, reason: 'Telegram credentials missing' };
  }

  console.log(`\n📨 Sending Telegram Alert & Streaming 9:16 Video for Manual ${platform} Upload...`);

  let tempThumbPath = null;
  let tempVideoPath = null;

  try {
    // 1. Probe video metadata
    const meta = probeVideoMetadata(videoPath);
    console.log(`📐 Video Specs: ${meta.width}x${meta.height}, ${meta.duration}s`);

    // 2. Generate video thumbnail
    tempThumbPath = createVideoThumbnail(videoPath, meta);

    // 3. Compress if > 48MB
    const { uploadPath, isTemp } = prepareVideoForTelegram(videoPath, meta);
    if (isTemp) tempVideoPath = uploadPath;

    const stat = fs.statSync(uploadPath);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);

    if (stat.size >= 50 * 1024 * 1024) {
      console.warn(`⚠️ Video file (${sizeMb} MB) still exceeds Telegram 50MB Bot API limit. Sending text notification only.`);
      const textOnlyMsg = `⚠️ <b>${escapeHtml(platform)} Manual Upload Required</b>\n\n` +
        `<b>Video:</b> ${escapeHtml(title)}\n` +
        `<b>File (Too large for Bot: ${sizeMb} MB):</b> <code>${escapeHtml(videoPath)}</code>\n` +
        `<b>Reason:</b> <code>${escapeHtml(reason)}</code>\n\n` +
        `📋 <b>Tap Below to Copy Caption &amp; Hashtags:</b>\n` +
        `<pre><code>${escapeHtml(caption)}</code></pre>`;

      await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: textOnlyMsg,
          parse_mode: 'HTML',
        }),
      });
      return { ok: true, partial: true };
    }

    // 4. Construct high-fidelity streaming FormData
    console.log(`📤 Uploading 9:16 portrait video (${sizeMb} MB) with streaming headers to Telegram...`);
    const formData = new FormData();
    formData.append('chat_id', config.chatId);

    const videoBytes = fs.readFileSync(uploadPath);
    formData.append(
      'video',
      new Blob([videoBytes], { type: 'video/mp4' }),
      path.basename(videoPath)
    );

    if (tempThumbPath && fs.existsSync(tempThumbPath)) {
      const thumbBytes = fs.readFileSync(tempThumbPath);
      formData.append(
        'thumbnail',
        new Blob([thumbBytes], { type: 'image/jpeg' }),
        'thumbnail.jpg'
      );
    }

    formData.append('width', String(meta.width || 1080));
    formData.append('height', String(meta.height || 1920));
    formData.append('duration', String(meta.duration || 60));
    formData.append('supports_streaming', 'true');

    // Attach concise, clean caption directly to the video bubble (max 1024 chars)
    let videoCaption = `🎬 <b>${escapeHtml(title)}</b>\n\n${escapeHtml(caption)}`;
    if (videoCaption.length > 1020) {
      videoCaption = videoCaption.substring(0, 1017) + '...';
    }
    formData.append('caption', videoCaption);
    formData.append('parse_mode', 'HTML');

    const t0 = Date.now();
    const tgRes = await fetch(`https://api.telegram.org/bot${config.botToken}/sendVideo`, {
      method: 'POST',
      body: formData,
    });
    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.warn('⚠️ Telegram sendVideo returned error:', tgData.description);
      const failMsg = `⚠️ <b>${escapeHtml(platform)} Manual Upload Alert</b>\n\n` +
        `<b>Video:</b> ${escapeHtml(title)}\n` +
        `<b>Local Path:</b> <code>${escapeHtml(videoPath)}</code>\n` +
        `<b>Upload Notice:</b> Telegram video upload returned: ${escapeHtml(tgData.description)}\n\n` +
        `📋 <b>Tap Below to Copy Caption &amp; Hashtags:</b>\n` +
        `<pre><code>${escapeHtml(caption)}</code></pre>`;

      await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: failMsg,
          parse_mode: 'HTML',
        }),
      });
      return { ok: false, error: tgData.description };
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✅ Video uploaded to Telegram in ${elapsed}s! (Message ID: ${tgData.result?.message_id})`);

    // 5. Send companion message with 1-tap copy block for mobile clipboard
    const companionMsg = `📋 <b>Tap Box Below to Copy Caption for Instagram/Reels:</b>\n\n` +
      `<pre><code>${escapeHtml(caption)}</code></pre>\n\n` +
      `💡 <i>Reason for manual upload: ${escapeHtml(reason)}</i>`;

    await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: companionMsg,
        parse_mode: 'HTML',
      }),
    });

    console.log('✅ Copy-paste caption block delivered to Telegram chat!');
    return { ok: true, messageId: tgData.result?.message_id };
  } catch (err) {
    console.warn('⚠️ Telegram notification exception:', err.message);
    return { ok: false, error: err.message };
  } finally {
    // Cleanup temporary files
    if (tempThumbPath && fs.existsSync(tempThumbPath)) {
      try { fs.unlinkSync(tempThumbPath); } catch (e) {}
    }
    if (tempVideoPath && fs.existsSync(tempVideoPath)) {
      try { fs.unlinkSync(tempVideoPath); } catch (e) {}
    }
  }
}

/**
 * Sends a plain/HTML Telegram alert with optional file-backed cooldown throttling
 * so recurring automation ticks never spam duplicate reminders.
 */
async function sendTelegramText(text, { cooldownKey = null, cooldownMs = 0, parseMode = null } = {}) {
  const config = getTelegramConfig();
  if (!config || !text) return { ok: false, skipped: true };

  let lockPath = null;
  if (cooldownKey && cooldownMs > 0) {
    const lockDir = fs.existsSync('D:\\factory_workspace\\locks')
      ? 'D:\\factory_workspace\\locks'
      : path.join(PROJECT_ROOT, 'scratch');
    lockPath = path.join(lockDir, `tg_cooldown_${cooldownKey}.json`);
    if (fs.existsSync(lockPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
        if (Date.now() - (meta.sentAt || 0) < cooldownMs) {
          return { ok: true, throttled: true };
        }
      } catch (_) {}
    }
  }

  try {
    const body = { chat_id: config.chatId, text };
    if (parseMode) body.parse_mode = parseMode;
    const res = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ok && lockPath) {
      fs.mkdirSync(path.dirname(lockPath), { recursive: true });
      fs.writeFileSync(lockPath, JSON.stringify({ sentAt: Date.now() }));
    }
    return data;
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export {
  getTelegramConfig,
  probeVideoMetadata,
  createVideoThumbnail,
  prepareVideoForTelegram,
  sendTelegramReelAlert,
  sendTelegramText,
  escapeHtml,
};

export default {
  getTelegramConfig,
  probeVideoMetadata,
  createVideoThumbnail,
  prepareVideoForTelegram,
  sendTelegramReelAlert,
  sendTelegramText,
  escapeHtml,
};
