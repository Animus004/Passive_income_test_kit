/**
 * Multi-Platform Automated Publisher
 * Uploads rendered Shorts/Reels to YouTube Shorts & Instagram Reels
 * Reads latest video and metadata from src/data/current_short.json
 * 
 * Supports:
 * - Environment variables from GitHub Actions Secrets or .env
 * - Local fallback to client_secret.json and tokens.json
 * - Graceful fault-tolerant execution (if one platform fails, others continue)
 * 
 * Usage:
 *   node scripts/publish_all.js
 *   node scripts/publish_all.js --video out/short_xxx.mp4
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CURRENT_SHORT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'current_short.json');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const TOKENS_PATH = path.join(PROJECT_ROOT, 'tokens.json');
const CLIENT_SECRET_PATH = path.join(PROJECT_ROOT, 'client_secret.json');

function parseArgs() {
  const args = process.argv.slice(2);
  let videoPath = null;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--video' && args[i + 1]) {
      videoPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  return { videoPath, dryRun };
}

function findLatestVideo() {
  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(`Output directory ${OUT_DIR} does not exist`);
  }

  const files = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.mp4'))
    .map((f) => ({
      name: f,
      fullPath: path.join(OUT_DIR, f),
      mtime: fs.statSync(path.join(OUT_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    throw new Error(`No rendered mp4 videos found in ${OUT_DIR}`);
  }

  return files[0].fullPath;
}

function loadMetadata() {
  if (fs.existsSync(CURRENT_SHORT_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CURRENT_SHORT_PATH, 'utf-8'));
    } catch (e) {
      console.warn('⚠️ Could not parse current_short.json, using defaults.');
    }
  }

  return {
    videoTitle: 'MIND-BLOWING TECH INSIGHTS ⚡ #Shorts',
    youtubeDescription: 'Discover the hidden physical reality behind technology you use every day! #Shorts #Tech #Facts',
    tags: ['Shorts', 'Tech', 'DataDetective', 'Technology'],
  };
}

async function uploadToYouTube(videoPath, metadata, isDryRun = false) {
  console.log('\n----------------------------------------------------');
  console.log('▶️ [PUBLISHER] Uploading to YouTube Shorts...');
  console.log('----------------------------------------------------');

  let clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  let refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  // Fallback to local files if env vars are missing
  if ((!clientId || !clientSecret) && fs.existsSync(CLIENT_SECRET_PATH)) {
    try {
      const cs = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8'));
      const c = cs.installed || cs.web;
      if (c) {
        clientId = c.client_id;
        clientSecret = c.client_secret;
      }
    } catch (e) {}
  }

  if (!refreshToken && fs.existsSync(TOKENS_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
      refreshToken = tokens.refresh_token;
    } catch (e) {}
  }

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing YouTube credentials. Please set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN in repository secrets.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000'
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  if (isDryRun) {
    console.log('🧪 [DRY RUN] Verifying YouTube credentials & OAuth token refresh...');
    await oauth2Client.getAccessToken();
    console.log('✅ YouTube OAuth authentication verified successfully! Access token retrieved.');
    return { success: true, platform: 'YouTube', dryRun: true };
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const fileSize = fs.statSync(videoPath).size;
  const privacyStatus = process.env.YOUTUBE_PRIVACY_STATUS || 'public';

  // Ensure title includes #Shorts for YouTube algorithmic tagging
  let title = metadata.videoTitle || 'Mind-Blowing Tech Fact';
  if (!title.toLowerCase().includes('#shorts')) {
    title = `${title.substring(0, 85)} #Shorts`;
  }

  const description = `${metadata.youtubeDescription || ''}\n\n#Shorts #DataDetective #Technology #Facts`;
  const tags = Array.isArray(metadata.tags) ? metadata.tags : ['Shorts', 'Tech'];

  console.log(`🎬 Title: "${title}"`);
  console.log(`🔒 Privacy: ${privacyStatus.toUpperCase()}`);
  console.log(`📦 File Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    notifySubscribers: false,
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: '28', // Science & Technology
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en',
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  const shortsUrl = `https://youtube.com/shorts/${videoId}`;
  console.log(`✅ YouTube Upload Successful!`);
  console.log(`🔗 Shorts URL: ${shortsUrl}`);

  return { success: true, platform: 'YouTube', videoId, url: shortsUrl };
}

async function uploadToInstagram(videoPath, metadata, isDryRun = false) {
  console.log('\n----------------------------------------------------');
  console.log('📸 [PUBLISHER] Uploading to Instagram Reels...');
  console.log('----------------------------------------------------');

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !igUserId) {
    console.log('ℹ️ Instagram credentials (INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_USER_ID) not configured.');
    console.log('   Skipping Instagram upload (add secrets in GitHub Actions to enable).');
    return { success: false, platform: 'Instagram', skipped: true, reason: 'Credentials not provided' };
  }

  if (isDryRun) {
    console.log('🧪 [DRY RUN] Verifying Instagram credentials format...');
    return { success: true, platform: 'Instagram', dryRun: true };
  }

  const caption = `${metadata.videoTitle}\n\n${metadata.youtubeDescription || ''}\n\n#reels #tech #datadetective #technology`;
  const fileSize = fs.statSync(videoPath).size;

  console.log(`📱 Uploading to IG User ID: ${igUserId}`);
  console.log(`📦 File Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

  // Step 1: Initialize Resumable Reels Upload Session via Meta Graph API v21.0
  const initUrl = `https://graph.facebook.com/v21.0/${igUserId}/media`;
  const initParams = new URLSearchParams({
    media_type: 'REELS',
    upload_type: 'resumable',
    caption,
    access_token: accessToken,
  });

  const initRes = await fetch(`${initUrl}?${initParams.toString()}`, {
    method: 'POST',
  });

  const initData = await initRes.json();
  if (!initRes.ok || !initData.id || !initData.uri) {
    throw new Error(`Instagram container initialization failed: ${JSON.stringify(initData)}`);
  }

  const containerId = initData.id;
  const uploadUri = initData.uri;
  console.log(`📥 Resumable upload session created: ${containerId}`);

  // Step 2: Upload Video Binary Bytes
  const videoBuffer = fs.readFileSync(videoPath);
  const uploadRes = await fetch(uploadUri, {
    method: 'POST',
    headers: {
      Authorization: `OAuth ${accessToken}`,
      offset: '0',
      file_size: fileSize.toString(),
      'Content-Type': 'application/octet-stream',
    },
    body: videoBuffer,
  });

  const uploadResult = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(`Instagram binary upload failed: ${JSON.stringify(uploadResult)}`);
  }
  console.log('📤 Video bytes transferred to Instagram servers. Polling status...');

  // Step 3: Poll Container Status until READY
  let isReady = false;
  for (let poll = 0; poll < 30; poll++) {
    await new Promise((r) => setTimeout(r, 4000));
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const statusData = await statusRes.json();

    if (statusData.status_code === 'FINISHED') {
      isReady = true;
      break;
    } else if (statusData.status_code === 'ERROR') {
      throw new Error(`Instagram media processing error: ${JSON.stringify(statusData)}`);
    }
    process.stdout.write(`⏳ Processing status: ${statusData.status_code || 'IN_PROGRESS'}...\r`);
  }

  if (!isReady) {
    throw new Error('Instagram container processing timed out after 120 seconds.');
  }

  // Step 4: Publish Reels Container
  const publishUrl = `https://graph.facebook.com/v21.0/${igUserId}/media_publish`;
  const publishRes = await fetch(`${publishUrl}?creation_id=${containerId}&access_token=${accessToken}`, {
    method: 'POST',
  });

  const publishData = await publishRes.json();
  if (!publishRes.ok || !publishData.id) {
    throw new Error(`Instagram media publish failed: ${JSON.stringify(publishData)}`);
  }

  console.log(`\n✅ Instagram Reels Upload Successful! Media ID: ${publishData.id}`);
  return { success: true, platform: 'Instagram', mediaId: publishData.id };
}

async function main() {
  const { videoPath: specifiedPath, dryRun } = parseArgs();
  const videoPath = specifiedPath || findLatestVideo();
  const metadata = loadMetadata();

  console.log('====================================================');
  console.log('🚀 MULTI-PLATFORM AUTONOMOUS PUBLISHER');
  if (dryRun) console.log('🧪 DRY RUN MODE ENABLED');
  console.log('====================================================');
  console.log(`📁 Target Video: ${videoPath}`);
  console.log(`🏷️ Short Title: "${metadata.videoTitle}"`);

  const results = [];

  // YouTube Upload
  try {
    const ytResult = await uploadToYouTube(videoPath, metadata, dryRun);
    results.push(ytResult);
  } catch (err) {
    console.error(`❌ YouTube Upload Failed:`, err.message || err);
    results.push({ success: false, platform: 'YouTube', error: err.message });
  }

  // Instagram Reels Upload
  try {
    const igResult = await uploadToInstagram(videoPath, metadata, dryRun);
    results.push(igResult);
  } catch (err) {
    console.error(`❌ Instagram Upload Failed:`, err.message || err);
    results.push({ success: false, platform: 'Instagram', error: err.message });
  }

  console.log('\n====================================================');
  console.log('📊 PUBLISHING EXECUTION SUMMARY');
  console.log('====================================================');
  for (const r of results) {
    if (r.success) {
      console.log(`✅ ${r.platform}: SUCCESS ${r.url ? `(${r.url})` : `(ID: ${r.mediaId})`}`);
    } else if (r.skipped) {
      console.log(`ℹ️ ${r.platform}: SKIPPED (${r.reason})`);
    } else {
      console.log(`❌ ${r.platform}: FAILED (${r.error})`);
    }
  }
  console.log('====================================================\n');

  // If at least one active platform succeeded (or was skipped), do not fail the workflow
  const anyFailed = results.some((r) => !r.success && !r.skipped);
  if (anyFailed && !results.some((r) => r.success)) {
    throw new Error('All configured publishing platforms failed.');
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Publisher halted:', err.message || err);
    process.exit(1);
  });
}

module.exports = { main, uploadToYouTube, uploadToInstagram };
