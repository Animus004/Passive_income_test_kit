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
const https = require('https');
const { execSync } = require('child_process');
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
  const LIMITLESS_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'current_limitless_phase1.json');
  if (fs.existsSync(LIMITLESS_PATH)) {
    try {
      const lim = JSON.parse(fs.readFileSync(LIMITLESS_PATH, 'utf-8'));
      return {
        videoTitle: `${lim.title} #Shorts #Tech`,
        youtubeDescription: `${lim.fullScript}\n\n🔍 Discover the hidden physical reality behind technology you use every day with Data Detective.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚡ FREE Tech Newsletter: https://datadetective.substack.com\n🔒 Recommended Tech Toolkit: https://bit.ly/data-detective-tools\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n#Shorts #Tech #Engineering #Physics #DataDetective`,
        tags: ['Shorts', 'Tech', 'Physics', 'Engineering', 'DataDetective', 'Science'],
        topic: lim.title,
      };
    } catch (e) {
      console.warn('⚠️ Could not parse current_limitless_phase1.json, falling back.');
    }
  }

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

async function postDiscussionComment(youtube, videoId, metadata) {
  const affiliateUrl = process.env.MONETIZATION_AFFILIATE_URL || 'https://bit.ly/data-detective-tools';
  const newsletterUrl = process.env.MONETIZATION_NEWSLETTER_URL || 'https://datadetective.substack.com';
  const topic = metadata.topic || 'this tech breakdown';

  const commentText = [
    `What part of ${topic} surprised you the most? Drop your theory below! 👇`,
    '',
    `⚡ FREE Tech & Data Newsletter: ${newsletterUrl}`,
    `🔒 Top Recommended Tech & Security Toolkit: ${affiliateUrl}`,
  ].join('\n');

  console.log(`💬 Posting automated discussion/CTA comment for video ${videoId}...`);
  const commentRes = await youtube.commentThreads.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        videoId: videoId,
        topLevelComment: {
          snippet: {
            textOriginal: commentText,
          },
        },
      },
    },
  });

  console.log(`✅ Automated comment posted successfully (Comment ID: ${commentRes.data.id})`);
  return commentRes.data;
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

    const affiliateUrl = process.env.MONETIZATION_AFFILIATE_URL || 'https://bit.ly/data-detective-tools';
    const newsletterUrl = process.env.MONETIZATION_NEWSLETTER_URL || 'https://datadetective.substack.com';
    console.log(`🧪 [DRY RUN] Configured Newsletter Link: ${newsletterUrl}`);
    console.log(`🧪 [DRY RUN] Configured Affiliate Link: ${affiliateUrl}`);
    console.log('🧪 [DRY RUN] Preview of Automated Discussion Comment:');
    console.log('----------------------------------------------------');
    console.log(`What part of ${metadata.topic || 'this tech breakdown'} surprised you the most? Drop your theory below! 👇\n\n⚡ FREE Tech & Data Newsletter: ${newsletterUrl}\n🔒 Top Recommended Tech & Security Toolkit: ${affiliateUrl}`);
    console.log('----------------------------------------------------');

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

  // Use monetized description directly from metadata
  const description = metadata.youtubeDescription || `${title}\n\n#Shorts #DataDetective #Technology #Facts`;
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

  // Post automated pinned / discussion comment with monetization CTA
  try {
    await postDiscussionComment(youtube, videoId, metadata);
  } catch (commentErr) {
    console.warn(`⚠️ Automated discussion comment could not be posted: ${commentErr.message}`);
    console.log('   (Video upload remains successful and unaffected)');
  }

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
    console.log('🧪 [DRY RUN] Verifying Instagram credentials format & account details...');
    try {
      const verifyRes = await fetch(
        `https://graph.facebook.com/v21.0/${igUserId}?fields=id,username,name&access_token=${accessToken}`
      );
      const verifyData = await verifyRes.json();
      if (verifyData.id) {
        console.log(`✅ Instagram Graph API verified! Connected account: @${verifyData.username} (${verifyData.name || verifyData.id})`);
        return { success: true, platform: 'Instagram', dryRun: true, username: verifyData.username };
      } else {
        throw new Error(verifyData.error?.message || JSON.stringify(verifyData));
      }
    } catch (e) {
      console.warn(`⚠️ Instagram verification warning: ${e.message}`);
      return { success: false, platform: 'Instagram', error: e.message };
    }
  }

  const caption = `${metadata.videoTitle}\n\n${metadata.youtubeDescription || ''}\n\n#reels #tech #datadetective #technology`;
  
  // Ensure video meets Instagram Reels strict standards (H.264 Main 4.0 + yuv420p + 48kHz AAC + faststart)
  let targetVideoPath = videoPath;
  const normalizedPath = path.join(path.dirname(videoPath), `ig_norm_${path.basename(videoPath)}`);
  try {
    const { execSync } = require('child_process');
    console.log('🔄 Optimizing video encoding for Instagram Reels compatibility (H.264 Main 4.0 + faststart)...');
    execSync(`ffmpeg -y -i "${videoPath}" -c:v libx264 -profile:v main -level 4.0 -pix_fmt yuv420p -r 30 -c:a aac -ar 48000 -b:a 128k -movflags +faststart "${normalizedPath}"`, { stdio: 'ignore' });
    if (fs.existsSync(normalizedPath)) {
      targetVideoPath = normalizedPath;
      console.log('✅ Video optimized for Instagram Reels!');
    }
  } catch (e) {
    console.warn('⚠️ FFmpeg Instagram normalization skipped:', e.message);
  }

  const fileSize = fs.statSync(targetVideoPath).size;

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
    if (fs.existsSync(normalizedPath)) fs.unlinkSync(normalizedPath);
    throw new Error(`Instagram container initialization failed: ${JSON.stringify(initData)}`);
  }

  const containerId = initData.id;
  const uploadUri = initData.uri;
  console.log(`📥 Resumable upload session created: ${containerId}`);

  // Step 2: Upload Video Binary Bytes with exact Content-Length
  await new Promise((resolve) => {
    const uploadUrl = new URL(uploadUri);
    const req = https.request(
      uploadUrl,
      {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${accessToken}`,
          offset: '0',
          file_size: fileSize.toString(),
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileSize.toString(),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            console.warn(`⚠️ Instagram rupload socket closed with HTTP ${res.statusCode} (${body}). Verifying container status...`);
            resolve(); // Don't reject yet: container may already be received and processing
          }
        });
      }
    );

    req.on('error', (err) => {
      console.warn(`⚠️ Socket warning during upload: ${err.message}. Checking container status...`);
      resolve();
    });
    fs.createReadStream(targetVideoPath).pipe(req);
  });
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
      if (fs.existsSync(normalizedPath)) fs.unlinkSync(normalizedPath);
      throw new Error(`Instagram media processing error: ${JSON.stringify(statusData)}`);
    }
    process.stdout.write(`⏳ Processing status: ${statusData.status_code || 'IN_PROGRESS'}...\r`);
  }

  if (!isReady) {
    if (fs.existsSync(normalizedPath)) fs.unlinkSync(normalizedPath);
    throw new Error('Instagram container processing timed out after 120 seconds.');
  }

  // Step 4: Publish Reels Container
  const publishUrl = `https://graph.facebook.com/v21.0/${igUserId}/media_publish`;
  const publishRes = await fetch(`${publishUrl}?creation_id=${containerId}&access_token=${accessToken}`, {
    method: 'POST',
  });

  const publishData = await publishRes.json();
  if (fs.existsSync(normalizedPath)) fs.unlinkSync(normalizedPath);
  if (!publishRes.ok || !publishData.id) {
    throw new Error(`Instagram media publish failed: ${JSON.stringify(publishData)}`);
  }

  console.log(`\n✅ Instagram Reels Upload Successful! Media ID: ${publishData.id}`);
  return { success: true, platform: 'Instagram', mediaId: publishData.id };
}

async function uploadToFacebook(videoPath, metadata, isDryRun = false) {
  console.log('\n----------------------------------------------------');
  console.log('📘 [PUBLISHER] Uploading to Facebook Page Reels...');
  console.log('----------------------------------------------------');

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!pageId || !pageToken) {
    console.log('ℹ️ Facebook credentials (FACEBOOK_PAGE_ID / FACEBOOK_PAGE_ACCESS_TOKEN) not configured.');
    return { success: false, platform: 'Facebook', skipped: true, reason: 'Credentials not provided' };
  }

  if (isDryRun) {
    console.log(`🧪 [DRY RUN] Verifying Facebook Page ID: ${pageId}...`);
    const testRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=id,name&access_token=${pageToken}`);
    const testData = await testRes.json();
    if (testData.id) {
      console.log(`✅ Facebook Page verified: ${testData.name} (${testData.id})`);
      return { success: true, platform: 'Facebook', dryRun: true };
    }
    throw new Error(`Facebook Page verification failed: ${JSON.stringify(testData)}`);
  }

  const caption = `${metadata.videoTitle}\n\n${metadata.youtubeDescription || ''}\n\n#Reels #Tech #DataDetective`;
  const fileSize = fs.statSync(videoPath).size;

  console.log(`📘 Uploading to Facebook Page: ${pageId}`);
  console.log(`📦 File Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

  // Step 1: Initialize Facebook Reel Session
  const initUrl = `https://graph.facebook.com/v21.0/${pageId}/video_reels`;
  const initRes = await fetch(initUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      upload_phase: 'start',
      access_token: pageToken,
    }),
  });
  const initData = await initRes.json();
  if (!initRes.ok || !initData.video_id || !initData.upload_url) {
    throw new Error(`Facebook Reels initialization failed: ${JSON.stringify(initData)}`);
  }

  const fbVideoId = initData.video_id;
  const fbUploadUrl = initData.upload_url;
  console.log(`📥 Facebook Reel Session Initialized: ${fbVideoId}`);

  // Step 2: Stream Video Bytes with exact Content-Length
  await new Promise((resolve, reject) => {
    const uploadUrlObj = new URL(fbUploadUrl);
    const req = https.request(
      uploadUrlObj,
      {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${pageToken}`,
          offset: '0',
          file_size: fileSize.toString(),
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileSize.toString(),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Facebook Reel binary upload failed (HTTP ${res.statusCode}): ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    fs.createReadStream(videoPath).pipe(req);
  });
  console.log('📤 Video bytes transferred to Facebook servers. Finalizing publish...');

  // Step 3: Finish and Publish Facebook Reel
  const finishRes = await fetch(initUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      upload_phase: 'finish',
      video_id: fbVideoId,
      video_state: 'PUBLISHED',
      description: caption,
      access_token: pageToken,
    }),
  });
  const finishData = await finishRes.json();
  if (!finishRes.ok || finishData.success === false) {
    throw new Error(`Facebook Reels publish finalization failed: ${JSON.stringify(finishData)}`);
  }

  console.log(`✅ Facebook Page Reel Published Successfully! (Post ID: ${finishData.post_id || fbVideoId})`);
  return { success: true, platform: 'Facebook', mediaId: finishData.post_id || fbVideoId };
}

// -------------------------------------------------------------
// Telegram Bot & Manual Fallback Notifier
// -------------------------------------------------------------
const { sendTelegramReelAlert } = require('./telegram_notifier.js');

async function sendTelegramAlert({ videoPath, title, caption, reason }) {
  return await sendTelegramReelAlert({
    videoPath,
    title,
    caption,
    reason,
    platform: 'Instagram Reels',
    manualPkgFilename: 'manual_instagram_upload.txt',
  });
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
    const igCaption = `${metadata.videoTitle}\n\n${metadata.youtubeDescription || ''}\n\n#reels #tech #datadetective #technology #science #innovation`;
    await sendTelegramAlert({
      videoPath,
      title: metadata.videoTitle,
      caption: igCaption,
      reason: err.message || 'Instagram API container processing error',
    });
  }

  // Facebook Page Reels Upload
  try {
    const fbResult = await uploadToFacebook(videoPath, metadata, dryRun);
    results.push(fbResult);
  } catch (err) {
    console.error(`❌ Facebook Upload Failed:`, err.message || err);
    results.push({ success: false, platform: 'Facebook', error: err.message });
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
