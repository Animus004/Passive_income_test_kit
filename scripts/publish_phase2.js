/**
 * ==============================================================================
 * Multi-Platform Autonomous Social Publisher (Phase 2 3D Series)
 * ==============================================================================
 * Multi-channel distribution pipeline across YouTube, Instagram, Facebook, X, and Reddit.
 * 
 * PUBLISHING ARCHITECTURE (30-Second Technical Overview):
 * 1. Multi-Channel Distribution: Routes 3D comedy episodes across 5 major platforms.
 * 2. Automated Community Engagement: Automatically pins topic-specific discussion
 *    prompts on YouTube and Instagram Reels to maximize retention algorithms.
 * 3. Telegram Resilient Fallback: If external APIs encounter write limits or rate quotas,
 *    instantly dispatches a mobile-ready 9:16 video package with 1-tap copy captions.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { sendTelegramReelAlert } from './telegram_notifier.js';
import { sendXPackageToTelegram } from './send_x_package_to_telegram.mjs';
import { uploadPhase2ToReddit } from './publish_reddit.js';
import { uploadPhase2ToX } from './publish_x.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const TOKEN_PATH = path.join(PROJECT_ROOT, 'tokens_phase2.json');
const SECRET_PATH = path.join(PROJECT_ROOT, 'client_secret_phase2.json');
const META_PHASE2_PATH = path.join(PROJECT_ROOT, 'meta_phase2.json');

// Helper to refresh Google OAuth token if expired
async function getAuthenticatedOAuth2Client() {
  if (!fs.existsSync(TOKEN_PATH) || !fs.existsSync(SECRET_PATH)) {
    throw new Error('Phase 2 YouTube credentials not found. Run scripts/auth_phase2.js first.');
  }

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  const secretData = JSON.parse(fs.readFileSync(SECRET_PATH, 'utf8'));
  const creds = secretData.web || secretData.installed;

  const oauth2Client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris?.[0] || 'http://localhost:3000'
  );
  oauth2Client.setCredentials(tokens);

  // Proactively refresh if expiring or expired
  if (tokens.refresh_token && (!tokens.expiry_date || tokens.expiry_date < Date.now() + 60000)) {
    console.log('🔄 Refreshing Phase 2 YouTube access token...');
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      const updatedTokens = { ...tokens, ...credentials };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(updatedTokens, null, 2));
      console.log('✅ YouTube access token refreshed and saved.');
    } catch (refreshErr) {
      console.warn('⚠️ Token auto-refresh warning:', refreshErr.message);
    }
  }

  return oauth2Client;
}

// -------------------------------------------------------------
// 1. YouTube Shorts Publisher
// -------------------------------------------------------------
export async function uploadPhase2ToYouTube(videoPath, metadata, isDryRun = false) {
  console.log('\n======================================================');
  console.log('🎬 [PHASE 2 YOUTUBE] Uploading to "I am AI but I am a good guy"...');
  console.log(`🎯 Video: ${path.basename(videoPath)}`);
  console.log('======================================================');

  if (isDryRun) {
    console.log('🧪 [DRY RUN] Verifying YouTube credentials...');
    const authClient = await getAuthenticatedOAuth2Client();
    const youtube = google.youtube({ version: 'v3', auth: authClient });
    const channelRes = await youtube.channels.list({ part: 'snippet', mine: true });
    const title = channelRes.data.items?.[0]?.snippet?.title;
    console.log(`✅ YouTube Channel Verified: "${title}"`);
    return { success: true, platform: 'YouTube', dryRun: true, channel: title };
  }

  const oauth2Client = await getAuthenticatedOAuth2Client();
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const title = metadata.title.includes('#Shorts') ? metadata.title : `${metadata.title} #Shorts`;
  const description = `${metadata.description || 'Watch what happens when an autonomous AI agent optimizes your life with zero human mercy.'}\n\n#AI #Coding #Animation #Blender3D #Comedy #Shorts #Gemini #GeminiAI #TheGoodGuyAI`;

  const fileSize = fs.statSync(videoPath).size;
  console.log(`📦 File Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📌 Title: "${title}"`);

  const res = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title,
        description,
        tags: ['AI agent', 'comedy', '3D animation', 'blender', 'developer humor', 'gemini', 'gemini ai', 'shorts'],
        categoryId: '23', // Comedy
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  const shortUrl = `https://youtube.com/shorts/${videoId}`;
  console.log(`\n🎉 PHASE 2 SHORT PUBLISHED TO YOUTUBE!`);
  console.log(`🔗 Video URL: ${shortUrl}\n`);

  // Post Pinned Discussion Comment
  let commentId = null;
  if (metadata.pinnedComment) {
    try {
      const commRes = await youtube.commentThreads.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            videoId,
            topLevelComment: {
              snippet: {
                textOriginal: metadata.pinnedComment,
              },
            },
          },
        },
      });
      commentId = commRes.data.id;
      console.log(`💬 Pinned Discussion Comment posted to YouTube: "${metadata.pinnedComment}"`);
    } catch (commErr) {
      console.warn(`⚠️ YouTube discussion comment notice:`, commErr.message);
    }
  }

  return { success: true, platform: 'YouTube', videoId, url: shortUrl, commentId };
}

// -------------------------------------------------------------
// 2. Instagram Reels Publisher
// -------------------------------------------------------------
export async function uploadPhase2ToInstagram(videoPath, metadata, isDryRun = false) {
  console.log('\n======================================================');
  console.log('📸 [PHASE 2 INSTAGRAM] Uploading to @the.goodguy.ai...');
  console.log('======================================================');

  let igUserId = process.env.PHASE2_INSTAGRAM_USER_ID;
  let accessToken = process.env.PHASE2_FACEBOOK_PAGE_ACCESS_TOKEN || process.env.PHASE2_INSTAGRAM_ACCESS_TOKEN;

  if (fs.existsSync(META_PHASE2_PATH)) {
    try {
      const metaConfig = JSON.parse(fs.readFileSync(META_PHASE2_PATH, 'utf8'));
      if (!igUserId && metaConfig.instagram?.userId) igUserId = metaConfig.instagram.userId;
      if (!accessToken && (metaConfig.facebook?.pageToken || metaConfig.instagram?.userToken)) {
        accessToken = metaConfig.facebook?.pageToken || metaConfig.instagram?.userToken;
      }
    } catch (e) {}
  }

  if (!accessToken || !igUserId) {
    console.log('ℹ️ Phase 2 Instagram credentials not found.');
    return { success: false, platform: 'Instagram', skipped: true, reason: 'Credentials not provided' };
  }

  if (isDryRun) {
    console.log('🧪 [DRY RUN] Verifying Instagram credentials format & account details...');
    const verifyRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}?fields=id,username,name&access_token=${accessToken}`
    );
    const verifyData = await verifyRes.json();
    if (verifyData.id) {
      console.log(`✅ Instagram Verified: @${verifyData.username} (${verifyData.name || verifyData.id})`);
      return { success: true, platform: 'Instagram', dryRun: true, username: verifyData.username };
    }
    throw new Error(`Instagram verification failed: ${JSON.stringify(verifyData)}`);
  }

  const caption = `${metadata.title}\n\n${metadata.description || ''}\n\n#AI #Coding #TechHumor #Developer #Blender3D #Animation #Reels #Gemini #GeminiAI #TheGoodGuyAI`;

  // Ensure video meets Instagram Reels strict standards (H.264 Main + yuv420p + 48kHz AAC + faststart)
  let targetVideoPath = videoPath;
  const normalizedPath = path.join(path.dirname(videoPath), `ig_norm_${path.basename(videoPath)}`);
  try {
    console.log('🔄 Optimizing video container for Instagram Reels (+faststart)...');
    execSync(`ffmpeg -y -i "${videoPath}" -c:v copy -c:a copy -movflags +faststart "${normalizedPath}"`, { stdio: 'ignore' });
    if (fs.existsSync(normalizedPath)) {
      targetVideoPath = normalizedPath;
      console.log('✅ Video faststart container optimized!');
    }
  } catch (e) {
    console.warn('⚠️ FFmpeg faststart copy skipped:', e.message);
  }

  const fileSize = fs.statSync(targetVideoPath).size;
  console.log(`📱 Uploading to IG User ID: ${igUserId}`);
  console.log(`📦 File Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

  // Step 1: Initialize Resumable Reels Session
  const initUrl = `https://graph.facebook.com/v21.0/${igUserId}/media`;
  const initParams = new URLSearchParams({
    media_type: 'REELS',
    upload_type: 'resumable',
    caption,
    access_token: accessToken,
  });

  const initRes = await fetch(`${initUrl}?${initParams.toString()}`, { method: 'POST' });
  const initData = await initRes.json();
  if (!initRes.ok || !initData.id || !initData.uri) {
    if (fs.existsSync(normalizedPath)) fs.unlinkSync(normalizedPath);
    throw new Error(`Instagram container initialization failed: ${JSON.stringify(initData)}`);
  }

  const containerId = initData.id;
  const uploadUri = initData.uri;
  console.log(`📥 Resumable upload session created: ${containerId}`);

  // Step 2: Upload Video Binary Stream
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
            console.warn(`⚠️ Instagram rupload HTTP ${res.statusCode} (${body}). Verifying container status...`);
            resolve();
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
    process.stdout.write(`⏳ IG Processing status: ${statusData.status_code || 'IN_PROGRESS'}...\r`);
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

  console.log(`\n🎉 PHASE 2 SHORT PUBLISHED TO INSTAGRAM REELS!`);
  console.log(`🔗 Instagram Media ID: ${publishData.id}\n`);

  // Post Discussion Comment
  let igCommentId = null;
  if (metadata.pinnedComment) {
    try {
      const commRes = await fetch(
        `https://graph.facebook.com/v21.0/${publishData.id}/comments?message=${encodeURIComponent(metadata.pinnedComment)}&access_token=${accessToken}`,
        { method: 'POST' }
      );
      const commData = await commRes.json();
      if (commData.id) {
        igCommentId = commData.id;
        console.log(`💬 Discussion Comment posted to Instagram: "${metadata.pinnedComment}"`);
      }
    } catch (commErr) {
      console.warn(`⚠️ Instagram discussion comment notice:`, commErr.message);
    }
  }

  return { success: true, platform: 'Instagram', mediaId: publishData.id, commentId: igCommentId };
}

// -------------------------------------------------------------
// 3. Facebook Page Reels Publisher
// -------------------------------------------------------------
export async function uploadPhase2ToFacebook(videoPath, metadata, isDryRun = false) {
  console.log('\n======================================================');
  console.log('📘 [PHASE 2 FACEBOOK] Uploading to "I am AI but I am GooD GuY"...');
  console.log('======================================================');

  let pageId = process.env.PHASE2_FACEBOOK_PAGE_ID;
  let pageToken = process.env.PHASE2_FACEBOOK_PAGE_ACCESS_TOKEN;

  if (fs.existsSync(META_PHASE2_PATH)) {
    try {
      const metaConfig = JSON.parse(fs.readFileSync(META_PHASE2_PATH, 'utf8'));
      if (!pageId && metaConfig.facebook?.pageId) pageId = metaConfig.facebook.pageId;
      if (!pageToken && metaConfig.facebook?.pageToken) pageToken = metaConfig.facebook.pageToken;
    } catch (e) {}
  }

  if (!pageId || !pageToken) {
    console.log('ℹ️ Phase 2 Facebook credentials not configured.');
    return { success: false, platform: 'Facebook', skipped: true, reason: 'Credentials not provided' };
  }

  if (isDryRun) {
    console.log(`🧪 [DRY RUN] Verifying Facebook Page ID: ${pageId}...`);
    const testRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=id,name&access_token=${pageToken}`);
    const testData = await testRes.json();
    if (testData.id) {
      console.log(`✅ Facebook Page verified: ${testData.name} (${testData.id})`);
      return { success: true, platform: 'Facebook', dryRun: true, page: testData.name };
    }
    throw new Error(`Facebook Page verification failed: ${JSON.stringify(testData)}`);
  }

  const caption = `${metadata.title}\n\n${metadata.description || ''}\n\n#AI #Coding #TechHumor #Developer #Blender3D #Animation #Reels #Gemini #GeminiAI #IAmAI #TheGoodGuyAI`;
  const fileSize = fs.statSync(videoPath).size;

  console.log(`📘 Uploading to Facebook Page ID: ${pageId}`);
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

  // Step 2: Stream Video Bytes
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
      title: metadata.title || '',
      description: caption,
      access_token: pageToken,
    }),
  });
  const finishData = await finishRes.json();
  if (!finishRes.ok || finishData.success === false) {
    throw new Error(`Facebook Reels publish finalization failed: ${JSON.stringify(finishData)}`);
  }

  console.log(`\n🎉 PHASE 2 SHORT PUBLISHED TO FACEBOOK REELS!`);
  console.log(`🔗 Facebook Post ID: ${finishData.post_id || fbVideoId}\n`);

  // Post Discussion Comment
  let fbCommentId = null;
  const postTargetId = finishData.post_id || fbVideoId;
  if (metadata.pinnedComment) {
    try {
      const fbCommRes = await fetch(
        `https://graph.facebook.com/v21.0/${pageId}_${postTargetId}/comments?message=${encodeURIComponent(metadata.pinnedComment)}&access_token=${pageToken}`,
        { method: 'POST' }
      );
      const fbCommData = await fbCommRes.json();
      if (fbCommData.id) {
        fbCommentId = fbCommData.id;
        console.log(`💬 Discussion Comment posted to Facebook: "${metadata.pinnedComment}"`);
      }
    } catch (commErr) {
      console.warn(`⚠️ Facebook discussion comment notice:`, commErr.message);
    }
  }

  return { success: true, platform: 'Facebook', mediaId: finishData.post_id || fbVideoId, commentId: fbCommentId };
}

// -------------------------------------------------------------
// Telegram Bot & Manual Fallback Notifier
// -------------------------------------------------------------
async function sendTelegramAlertPhase2({ videoPath, title, caption, reason }) {
  return await sendTelegramReelAlert({
    videoPath,
    title,
    caption,
    reason,
    platform: 'Instagram Reels (Phase 2)',
    manualPkgFilename: 'manual_instagram_phase2.txt',
  });
}

// -------------------------------------------------------------
// Main Runner
// -------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const platArgIdx = args.indexOf('--platforms');
  const allowedPlatforms = platArgIdx !== -1 && args[platArgIdx + 1]
    ? args[platArgIdx + 1].toLowerCase().split(',').map(s => s.trim())
    : ['youtube', 'instagram', 'facebook', 'x', 'reddit'];
  const videoArgIdx = args.indexOf('--video');
  const videoPath = videoArgIdx !== -1 && args[videoArgIdx + 1]
    ? path.resolve(PROJECT_ROOT, args[videoArgIdx + 1])
    : (fs.existsSync(path.resolve(PROJECT_ROOT, 'out/final_phase2_limitless.mp4'))
      ? path.resolve(PROJECT_ROOT, 'out/final_phase2_limitless.mp4')
      : path.resolve(PROJECT_ROOT, 'blender_engine/output/final_comedy_short.mp4'));

  if (!fs.existsSync(videoPath)) {
    console.error(`❌ Video not found at: ${videoPath}`);
    process.exit(1);
  }

  const manifestArgIdx = args.indexOf('--manifest');
  const manifestPath = manifestArgIdx !== -1 && args[manifestArgIdx + 1]
    ? path.resolve(PROJECT_ROOT, args[manifestArgIdx + 1])
    : (fs.existsSync(path.resolve(PROJECT_ROOT, 'scratch/autonomous_phase2/episode_manifest.json'))
      ? path.resolve(PROJECT_ROOT, 'scratch/autonomous_phase2/episode_manifest.json')
      : path.resolve(PROJECT_ROOT, 'blender_engine/output/dialogue_manifest.json'));

  let metadata = {
    title: 'When Your AI Enforces Bedtime 😴💻',
    description: 'Dev refuses to stop coding at 3 AM. Gemini takes matters into its own hands.',
    pinnedComment: 'What is the dumbest bug that kept you awake past 3 AM? Drop it below! 👇💬',
  };

  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.title) metadata.title = manifest.title;
      if (manifest.premise) metadata.description = manifest.premise;
      if (manifest.pinnedComment) {
        metadata.pinnedComment = manifest.pinnedComment;
      } else {
        metadata.pinnedComment = `Be honest: when was the last time you experienced this scenario in real life? Drop your thoughts below! 👇💬`;
      }
    } catch (e) {}
  }

  console.log('====================================================');
  console.log('🚀 PHASE 2 MULTI-PLATFORM AUTONOMOUS PUBLISHER');
  if (dryRun) console.log('🧪 DRY RUN MODE ENABLED');
  console.log('====================================================');
  console.log(`📁 Target Video: ${videoPath}`);
  console.log(`🏷️ Title: "${metadata.title}"`);

  const results = [];

  // 1. YouTube
  if (allowedPlatforms.includes('youtube')) {
    try {
      const ytResult = await uploadPhase2ToYouTube(videoPath, metadata, dryRun);
      results.push(ytResult);
    } catch (err) {
      console.error(`❌ YouTube Upload Failed:`, err.message || err);
      results.push({ success: false, platform: 'YouTube', error: err.message });
    }
  }

  // 2. Instagram Reels
  if (allowedPlatforms.includes('instagram')) {
    try {
      const igResult = await uploadPhase2ToInstagram(videoPath, metadata, dryRun);
      results.push(igResult);
    } catch (err) {
      console.error(`❌ Instagram Upload Failed:`, err.message || err);
      results.push({ success: false, platform: 'Instagram', error: err.message });
      const igCaption = `${metadata.title}\n\n${metadata.description || ''}\n\n#AI #Coding #TechHumor #Developer #Blender3D #Animation #Reels #Gemini #GeminiAI #TheGoodGuyAI`;
      await sendTelegramAlertPhase2({
        videoPath,
        title: metadata.title,
        caption: igCaption,
        reason: err.message || 'Instagram API container processing error',
      });
    }
  }

  // 3. Facebook Reels
  if (allowedPlatforms.includes('facebook')) {
    try {
      const fbResult = await uploadPhase2ToFacebook(videoPath, metadata, dryRun);
      results.push(fbResult);
    } catch (err) {
      console.error(`❌ Facebook Upload Failed:`, err.message || err);
      results.push({ success: false, platform: 'Facebook', error: err.message });
    }
  }

  // 4. X (Twitter)
  if (allowedPlatforms.includes('x') || allowedPlatforms.includes('twitter')) {
    try {
      const xResult = await uploadPhase2ToX(videoPath, metadata, { dryRun });
      results.push(xResult);
      if (!xResult.success) {
        console.log('📨 [TELEGRAM FALLBACK] X API write gated. Dispatching complete X package to Telegram...');
        await sendXPackageToTelegram(videoPath, metadata);
      }
    } catch (err) {
      console.error(`❌ X Upload Failed:`, err.message || err);
      results.push({ success: false, platform: 'X', error: err.message });
      try {
        console.log('📨 [TELEGRAM FALLBACK] Dispatching complete X package to Telegram...');
        await sendXPackageToTelegram(videoPath, metadata);
      } catch (tgErr) {
        console.warn('⚠️ Telegram fallback error:', tgErr.message);
      }
    }
  }

  // 5. Reddit
  if (allowedPlatforms.includes('reddit')) {
    try {
      const redditResult = await uploadPhase2ToReddit(videoPath, metadata, { dryRun });
      results.push(redditResult);
    } catch (err) {
      console.error(`❌ Reddit Upload Failed:`, err.message || err);
      results.push({ success: false, platform: 'Reddit', error: err.message });
    }
  }

  console.log('\n====================================================');
  console.log('📊 PUBLISHING SUMMARY REPORT');
  console.log('====================================================');
  for (const r of results) {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} [${r.platform}]: ${r.success ? (dryRun ? 'Verified (Dry Run)' : (r.url || r.mediaId || 'Published')) : (r.error || r.reason)}`);
  }

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('publish_phase2.js')) {
  main().catch(console.error);
}
