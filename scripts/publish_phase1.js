/**
 * ==============================================================================
 * Multi-Platform Autonomous Social Publisher (Phase 1 2D Channels)
 * ==============================================================================
 * Automated distribution pipeline for YouTube Shorts, Instagram Reels, and Facebook Pages.
 * 
 * PUBLISHING ARCHITECTURE (30-Second Technical Overview):
 * 1. YouTube Data API v3: Uploads English Master short via OAuth2 with token auto-refresh.
 * 2. Meta Graph API v21.0: Uploads Hindi Master to Instagram Reels and Facebook Pages.
 *    - Applies ffmpeg faststart atom relocation (+faststart) for instant playback.
 *    - Polling status loop with exponential backoff for distributed edge propagation.
 * 3. Dry-Run Verification: Supports `--dry-run` to audit API tokens without publishing.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const TOKEN_PATH = path.join(PROJECT_ROOT, 'tokens.json');
const SECRET_PATH = path.join(PROJECT_ROOT, 'client_secret.json');
const HISTORY_PATH = path.join(PROJECT_ROOT, 'data', 'upload_history.json');

/**
 * YouTube OAuth2 Client Initialization & Token Auto-Refresh
 */
export async function getYouTubeClient() {
  if (!fs.existsSync(TOKEN_PATH) || !fs.existsSync(SECRET_PATH)) {
    throw new Error('Phase 1 YouTube credentials not found (tokens.json or client_secret.json missing).');
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

  if (tokens.refresh_token && (!tokens.expiry_date || tokens.expiry_date < Date.now() + 60000)) {
    console.log('🔄 Refreshing Phase 1 YouTube access token...');
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      const updated = { ...tokens, ...credentials };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2));
      console.log('✅ YouTube access token refreshed.');
    } catch (err) {
      if (String(err.message || '').includes('invalid_grant')) {
        throw new Error('YOUTUBE_REAUTH_REQUIRED: Google OAuth Testing token expired after 7 days. Run npm run auth:phase1');
      }
      console.warn('⚠️ Token refresh warning:', err.message);
    }
  }

  return oauth2Client;
}

/**
 * 1. Upload to YouTube Shorts (English Master)
 */
export async function uploadPhase1YouTube({
  videoPath,
  title,
  description,
  tags = [],
  privacyStatus = null,
  publishAt = null,
  isDryRun = false,
}) {
  console.log('\n======================================================');
  console.log('🎬 [PHASE 1 YOUTUBE] Uploading to Channel...');
  console.log(`🎯 Video: ${path.basename(videoPath)}`);
  if (publishAt) console.log(`📅 Scheduled PublishAt: ${publishAt}`);
  console.log('======================================================');

  const authClient = await getYouTubeClient();
  const youtube = google.youtube({ version: 'v3', auth: authClient });

  if (isDryRun) {
    const channelRes = await youtube.channels.list({ part: 'snippet', mine: true });
    const chName = channelRes.data.items?.[0]?.snippet?.title;
    console.log(`✅ [DRY RUN] YouTube Verified Channel: "${chName}"`);
    return { success: true, platform: 'YouTube', dryRun: true, channel: chName };
  }

  const cleanTitle = title.length > 90 ? title.slice(0, 87) + '...' : title;
  const finalTitle = cleanTitle.includes('#Shorts') ? cleanTitle : `${cleanTitle} #Shorts`;

  const videoStream = fs.createReadStream(videoPath);
  const resolvedPrivacy = publishAt ? 'private' : (privacyStatus || 'public');
  const statusPayload = {
    privacyStatus: resolvedPrivacy,
    selfDeclaredMadeForKids: false,
  };
  if (publishAt) {
    statusPayload.publishAt = publishAt;
  }

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: finalTitle,
        description: `${description || title}\n\n#Shorts #OddlyTold #IndianHistory #Strategy #Mindset #Animation`,
        tags: ['shorts', 'oddly told', 'indian strategy', 'chanakya', 'mahabharata', 'animation', ...tags],
        categoryId: '27', // Education
      },
      status: statusPayload,
    },
    media: {
      body: videoStream,
    },
  });

  const videoId = res.data.id;
  const ytUrl = `https://youtube.com/shorts/${videoId}`;
  console.log(`🚀 [YOUTUBE SUCCESS] ${publishAt ? `Scheduled (${publishAt})` : 'Published'}! ${ytUrl}`);
  return { success: true, platform: 'YouTube', videoId, url: ytUrl, scheduledPublishAt: publishAt || null };
}

/**
 * Checks Instagram 24-hour rolling Graph API publishing quota before creating containers
 */
export async function getInstagramPublishingLimit() {
  const igUserId = process.env.INSTAGRAM_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!igUserId || !accessToken) return { available: false, reason: 'missing_credentials' };
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/content_publishing_limit?fields=quota_usage,config&access_token=${accessToken}`);
    const data = await res.json();
    const item = data?.data?.[0];
    if (!item) return { available: true, quotaUsage: 0, quotaTotal: 100 };
    const total = item.config?.quota_total ?? 100;
    const used = item.quota_usage ?? 0;
    return { available: used < total, quotaUsage: used, quotaTotal: total };
  } catch (e) {
    return { available: true, warning: e.message };
  }
}

/**
 * 2. Upload to Instagram Reels (Hindi Master)
 */
export async function uploadPhase1Instagram({ videoPath, caption, isDryRun = false }) {
  console.log('\n======================================================');
  console.log('📸 [PHASE 1 INSTAGRAM] Uploading Hindi Master Reel...');
  console.log('======================================================');

  const igUserId = process.env.INSTAGRAM_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!accessToken || !igUserId) {
    console.warn('⚠️ Missing Instagram credentials. Skipping.');
    return { success: false, platform: 'Instagram', skipped: true };
  }

  if (isDryRun) {
    const verifyRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}?fields=id,username,name&access_token=${accessToken}`);
    const verifyData = await verifyRes.json();
    if (verifyData.id) {
      console.log(`✅ [DRY RUN] Instagram Verified: @${verifyData.username} (${verifyData.name || verifyData.id})`);
      return { success: true, platform: 'Instagram', dryRun: true, username: verifyData.username };
    }
    throw new Error(`Instagram verification failed: ${JSON.stringify(verifyData)}`);
  }

  // Faststart MP4 optimization
  let targetPath = videoPath;
  const faststartPath = path.join(path.dirname(videoPath), `fast_${path.basename(videoPath)}`);
  try {
    execSync(`ffmpeg -y -i "${videoPath}" -c:v copy -c:a copy -movflags +faststart "${faststartPath}"`, { stdio: 'ignore' });
    if (fs.existsSync(faststartPath)) targetPath = faststartPath;
  } catch (e) {}

  const fileSize = fs.statSync(targetPath).size;

  // Step 1: Init container
  const initUrl = `https://graph.facebook.com/v21.0/${igUserId}/media`;
  const initParams = new URLSearchParams({
    media_type: 'REELS',
    upload_type: 'resumable',
    caption: `${caption}\n\n#Reels #Hinglish #Relatable #Psychology #BrainHacks #ViralReels #Hindi`,
    access_token: accessToken,
  });

  const initRes = await fetch(`${initUrl}?${initParams.toString()}`, { method: 'POST' });
  const initData = await initRes.json();
  if (!initRes.ok || !initData.id || !initData.uri) {
    if (fs.existsSync(faststartPath)) fs.unlinkSync(faststartPath);
    throw new Error(`IG container init failed: ${JSON.stringify(initData)}`);
  }

  const containerId = initData.id;
  const uploadUri = initData.uri;

  // Step 2: Binary stream upload
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
        res.on('data', () => {});
        res.on('end', () => resolve());
      }
    );
    fs.createReadStream(targetPath).pipe(req);
  });

  if (fs.existsSync(faststartPath)) fs.unlinkSync(faststartPath);

  // Step 3: Wait for processing
  console.log('⏳ Waiting for Instagram video processing...');
  let status = 'IN_PROGRESS';
  let attempts = 0;
  while (status !== 'FINISHED' && attempts < 60) {
    await new Promise((r) => setTimeout(r, 4000));
    const stRes = await fetch(`https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`);
    const stData = await stRes.json();
    status = stData.status_code;
    attempts++;
    console.log(`   • Attempt ${attempts}: Status is ${status || 'IN_PROGRESS'}...`);
    if (status === 'ERROR') throw new Error(`IG processing failed: ${JSON.stringify(stData)}`);
  }

  if (status !== 'FINISHED') {
    throw new Error(`IG processing timed out after ${attempts * 4} seconds.`);
  }

  // Step 4: Publish with automated retry loop (Meta distributed edge nodes take 5-15s to propagate)
  console.log('✨ Video ready. Finalizing Instagram publish...');
  let pubData = null;
  for (let pubAttempt = 1; pubAttempt <= 8; pubAttempt++) {
    await new Promise((r) => setTimeout(r, pubAttempt === 1 ? 10000 : 7000));
    const pubRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: containerId, access_token: accessToken }),
    });
    pubData = await pubRes.json();
    if (pubRes.ok && pubData.id) {
      break;
    }
    console.log(`⏳ [IG PUBLISH RETRY ${pubAttempt}/8] Media propagating: ${pubData.error?.message || ''}. Retrying...`);
  }
  if (!pubData || !pubData.id) throw new Error(`IG publish failed: ${JSON.stringify(pubData)}`);

  console.log(`🚀 [INSTAGRAM SUCCESS] Reel published (ID: ${pubData.id})`);
  return { success: true, platform: 'Instagram', id: pubData.id };
}

/**
 * 3. Upload to Facebook Page Reels (Hindi Master)
 */
export async function uploadPhase1Facebook({ videoPath, title, description, isDryRun = false }) {
  console.log('\n======================================================');
  console.log('📘 [PHASE 1 FACEBOOK] Uploading Hindi Master Reel...');
  console.log('======================================================');

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageToken || !pageId) {
    console.warn('⚠️ Missing Facebook credentials. Skipping.');
    return { success: false, platform: 'Facebook', skipped: true };
  }

  if (isDryRun) {
    const pRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=id,name&access_token=${pageToken}`);
    const pData = await pRes.json();
    if (pData.id) {
      console.log(`✅ [DRY RUN] Facebook Page Verified: "${pData.name}" (ID: ${pData.id})`);
      return { success: true, platform: 'Facebook', dryRun: true, pageName: pData.name };
    }
    throw new Error(`FB verification failed: ${JSON.stringify(pData)}`);
  }

  const fileSize = fs.statSync(videoPath).size;

  // Step 1: Init upload session
  const initRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/video_reels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_phase: 'start', access_token: pageToken }),
  });
  const initData = await initRes.json();
  if (!initRes.ok || !initData.video_id || !initData.upload_url) {
    throw new Error(`FB reels init failed: ${JSON.stringify(initData)}`);
  }

  const videoId = initData.video_id;
  const uploadUrl = initData.upload_url;

  // Step 2: Binary stream upload
  await new Promise((resolve, reject) => {
    const parsed = new URL(uploadUrl);
    const req = https.request(
      parsed,
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

  // Step 3: Finish & Publish
  const desc = `${title}\n\n${description || ''}\n\n#Reels #FacebookReels #OddlyTold #Psychology #BrainHacks`;
  const pubRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/video_reels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      upload_phase: 'finish',
      video_id: videoId,
      video_state: 'PUBLISHED',
      description: desc,
      title,
      access_token: pageToken,
    }),
  });
  const pubData = await pubRes.json();
  if (!pubRes.ok || !pubData.success) throw new Error(`FB finish failed: ${JSON.stringify(pubData)}`);

  console.log(`🚀 [FACEBOOK SUCCESS] Reel published (Video ID: ${videoId})`);
  return { success: true, platform: 'Facebook', videoId };
}

/**
 * Master Phase 1 Publisher Entrypoint
 */
export async function publishPhase1({
  videoEnPath,
  videoHiPath,
  titleEn,
  titleHi,
  descriptionEn = '',
  descriptionHi = '',
  isDryRun = false,
}) {
  const results = {};

  // YouTube (Hindi Master + Hinglish Title for maximum engagement)
  const ytVideoPath = (videoHiPath && fs.existsSync(videoHiPath)) ? videoHiPath : videoEnPath;
  const ytTitle = titleHi ? `${titleEn} | ${titleHi}` : (titleEn || 'Oddly Told Shorts');
  const ytDesc = descriptionHi ? `${descriptionHi}\n\n${descriptionEn}` : (descriptionEn || titleEn);

  if (ytVideoPath && fs.existsSync(ytVideoPath)) {
    try {
      results.youtube = await uploadPhase1YouTube({
        videoPath: ytVideoPath,
        title: ytTitle,
        description: ytDesc,
        isDryRun,
      });
    } catch (e) {
      console.error('❌ YouTube Upload Failed:', e.message);
      results.youtube = { success: false, error: e.message };
    }
  }

  // Instagram (Hindi)
  if (videoHiPath && fs.existsSync(videoHiPath)) {
    try {
      results.instagram = await uploadPhase1Instagram({
        videoPath: videoHiPath,
        caption: titleHi || titleEn,
        isDryRun,
      });
    } catch (e) {
      console.error('❌ Instagram Upload Failed:', e.message);
      results.instagram = { success: false, error: e.message };
    }

    // Facebook (Hindi)
    try {
      results.facebook = await uploadPhase1Facebook({
        videoPath: videoHiPath,
        title: titleHi || titleEn,
        description: descriptionHi,
        isDryRun,
      });
    } catch (e) {
      console.error('❌ Facebook Upload Failed:', e.message);
      results.facebook = { success: false, error: e.message };
    }
  }

  // Record History
  try {
    fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
    let history = [];
    if (fs.existsSync(HISTORY_PATH)) {
      try { history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')); } catch (e) {}
    }
    history.push({
      timestamp: new Date().toISOString(),
      titleEn,
      titleHi,
      results,
      dryRun: isDryRun,
    });
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
  } catch (e) {}

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('publish_phase1.js')) {
  const isDryRun = process.argv.includes('--dry-run');

  const enTarget = fs.existsSync(path.join(PROJECT_ROOT, 'out', 'oddly_auto_en.mp4'))
    ? path.join(PROJECT_ROOT, 'out', 'oddly_auto_en.mp4')
    : path.join(PROJECT_ROOT, 'out', 'oddly_told_brain_en.mp4');

  const hiTarget = fs.existsSync(path.join(PROJECT_ROOT, 'out', 'oddly_auto_hi.mp4'))
    ? path.join(PROJECT_ROOT, 'out', 'oddly_auto_hi.mp4')
    : path.join(PROJECT_ROOT, 'out', 'oddly_told_brain_hi.mp4');

  publishPhase1({
    videoEnPath: enTarget,
    videoHiPath: hiTarget,
    titleEn: 'Your Brain Burns 20% Energy On Autopilot',
    titleHi: 'Tumhara Dimag 20% Energy Autopilot Par Kharch Karta Hai',
    descriptionEn: 'Your brain burns 20% of your body energy on autopilot until 2 AM reboots it! #Shorts #FocusFuel #BrainHacks #OddlyTold #Animation',
    descriptionHi: 'Kyun tumhara dimag 80% power sirf background autopilot par kharch karta hai? #Reels #Hinglish #Relatable #BrainFacts #Hindi',
    isDryRun,
  }).then((r) => {
    console.log('\n📊 Publish Summary:', JSON.stringify(r, null, 2));
  });
}
