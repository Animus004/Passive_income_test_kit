/**
 * Autonomous X (Twitter) Publisher for Phase 2 3D Comedy Shorts
 * 
 * Supports:
 * - Direct Chunked Video Upload (INIT, APPEND, FINALIZE) to X (Twitter)
 * - X API v2 Tweet Publishing with hashtags and media attachment
 * - Automatic Thread Reply with YouTube & Instagram links
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

/**
 * Generate OAuth 1.0a Authorization Header
 */
function getOAuth1Header(method, url, extraParams = {}) {
  const consumerKey = process.env.X_API_KEY || process.env.TWITTER_API_KEY;
  const consumerSecret = process.env.X_API_SECRET || process.env.TWITTER_API_SECRET;
  const token = process.env.X_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN;
  const tokenSecret = process.env.X_ACCESS_TOKEN_SECRET || process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!consumerKey || !consumerSecret || !token || !tokenSecret) {
    throw new Error('Missing X / Twitter credentials in .env (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)');
  }

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: token,
    oauth_version: '1.0',
    ...extraParams,
  };

  // Sort and encode all parameters
  const sortedKeys = Object.keys(oauthParams).sort();
  const paramString = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url.split('?')[0]),
    encodeURIComponent(paramString),
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  const headerParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: oauthParams.oauth_nonce,
    oauth_signature: signature,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: oauthParams.oauth_timestamp,
    oauth_token: token,
    oauth_version: '1.0',
  };

  return (
    'OAuth ' +
    Object.keys(headerParams)
      .sort()
      .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(headerParams[k])}"`)
      .join(', ')
  );
}

/**
 * Chunked Media Upload to X
 */
async function uploadVideoToX(videoPath) {
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
  const fileSize = fs.statSync(videoPath).size;

  console.log(`📦 Video File Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

  // Step 1: INIT
  console.log('⏳ Initializing X video upload session...');
  const initParams = {
    command: 'INIT',
    total_bytes: fileSize.toString(),
    media_type: 'video/mp4',
    media_category: 'tweet_video',
  };

  const initAuth = getOAuth1Header('POST', uploadUrl, initParams);
  const initRes = await fetch(`${uploadUrl}?${new URLSearchParams(initParams).toString()}`, {
    method: 'POST',
    headers: { Authorization: initAuth },
  });
  const initData = await initRes.json();
  if (!initData.media_id_string) {
    throw new Error(`X Video INIT failed: ${JSON.stringify(initData)}`);
  }

  const mediaId = initData.media_id_string;
  console.log(`📥 X Media Session ID: ${mediaId}`);

  // Step 2: APPEND chunks (1MB chunks for rock-solid stability)
  const CHUNK_SIZE = 1 * 1024 * 1024;
  const buffer = fs.readFileSync(videoPath);
  let segmentIndex = 0;

  for (let offset = 0; offset < fileSize; offset += CHUNK_SIZE) {
    const chunk = buffer.subarray(offset, Math.min(offset + CHUNK_SIZE, fileSize));
    const totalSegments = Math.ceil(fileSize / CHUNK_SIZE);
    process.stdout.write(`📤 Uploading segment ${segmentIndex + 1}/${totalSegments} (${(chunk.length / 1024).toFixed(0)} KB)...\r`);

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const formData = new FormData();
        formData.append('command', 'APPEND');
        formData.append('media_id', mediaId);
        formData.append('segment_index', segmentIndex.toString());
        formData.append('media', new Blob([chunk]), 'blob');

        const appendAuth = getOAuth1Header('POST', uploadUrl);
        const appendRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: { Authorization: appendAuth },
          body: formData,
        });

        if (!appendRes.ok) {
          const errText = await appendRes.text();
          throw new Error(`X APPEND chunk ${segmentIndex} failed (HTTP ${appendRes.status}): ${errText}`);
        }
        success = true;
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        console.warn(`\n⚠️ Segment ${segmentIndex} attempt ${attempt} failed (${err.message}). Retrying in 1s...`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    segmentIndex++;
  }
  console.log(`\n✅ All video segments uploaded to X!`);

  // Step 3: FINALIZE
  console.log('🔄 Finalizing X video upload...');
  const finalizeParams = { command: 'FINALIZE', media_id: mediaId };
  const finalizeAuth = getOAuth1Header('POST', uploadUrl, finalizeParams);
  const finalizeRes = await fetch(`${uploadUrl}?${new URLSearchParams(finalizeParams).toString()}`, {
    method: 'POST',
    headers: { Authorization: finalizeAuth },
  });
  const finalizeData = await finalizeRes.json();

  // Step 4: STATUS polling if video requires asynchronous processing
  if (finalizeData.processing_info) {
    let state = finalizeData.processing_info.state;
    while (state === 'pending' || state === 'in_progress') {
      const checkAfter = (finalizeData.processing_info.check_after_secs || 5) * 1000;
      await new Promise((r) => setTimeout(r, checkAfter));

      const statusParams = { command: 'STATUS', media_id: mediaId };
      const statusAuth = getOAuth1Header('GET', uploadUrl, statusParams);
      const statusRes = await fetch(`${uploadUrl}?${new URLSearchParams(statusParams).toString()}`, {
        headers: { Authorization: statusAuth },
      });
      const statusData = await statusRes.json();
      state = statusData.processing_info?.state || 'succeeded';
      if (statusData.processing_info?.error) {
        throw new Error(`X video processing error: ${JSON.stringify(statusData.processing_info.error)}`);
      }
    }
  }

  console.log('✅ Video successfully processed by X!');
  return mediaId;
}

/**
 * Publish Tweet with Video using X API v2
 */
export async function uploadPhase2ToX(videoPath, metadata, options = {}) {
  const isDryRun = options.dryRun || false;

  console.log('\n======================================================');
  console.log('🐦 [PHASE 2 X / TWITTER] Publishing to X...');
  console.log('======================================================');

  const consumerKey = process.env.X_API_KEY || process.env.TWITTER_API_KEY;
  if (!consumerKey) {
    console.log('ℹ️  X (Twitter) credentials not configured in .env.');
    return { success: false, platform: 'X', skipped: true, reason: 'Credentials not provided in .env' };
  }

  if (isDryRun) {
    console.log('🧪 [DRY RUN] Verifying X (Twitter) API credentials...');
    try {
      const verifyUrl = 'https://api.twitter.com/2/users/me';
      const auth = getOAuth1Header('GET', verifyUrl);
      const res = await fetch(verifyUrl, { headers: { Authorization: auth } });
      const data = await res.json();
      if (data.data?.username) {
        console.log(`✅ X Account Verified: @${data.data.username} (${data.data.name})`);
        return { success: true, platform: 'X', dryRun: true, username: data.data.username };
      }
      throw new Error(`X verification failed: ${JSON.stringify(data)}`);
    } catch (err) {
      throw new Error(`X verification failed: ${err.message}`);
    }
  }

  // 1. Upload Video
  const mediaId = await uploadVideoToX(videoPath);

  // 2. Post Tweet via X API v2
  const tweetText = `${metadata.title || 'When Your AI Enforces Bedtime ☀️🤖'}\n\n` +
    `${metadata.description || 'An AI companion forces its screen-addicted human outside.'}\n\n` +
    `#AI #Coding #TechHumor #Blender3D #BuildInPublic #Developers`;

  const tweetUrl = 'https://api.twitter.com/2/tweets';
  const tweetPayload = {
    text: tweetText,
    media: {
      media_ids: [mediaId],
    },
  };

  const tweetAuth = getOAuth1Header('POST', tweetUrl);
  const tweetRes = await fetch(tweetUrl, {
    method: 'POST',
    headers: {
      Authorization: tweetAuth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tweetPayload),
  });

  const tweetData = await tweetRes.json();
  if (!tweetData.data?.id) {
    throw new Error(`X Tweet creation failed: ${JSON.stringify(tweetData)}`);
  }

  const tweetId = tweetData.data.id;
  const tweetLink = `https://x.com/i/web/status/${tweetId}`;
  console.log(`\n🎉 PHASE 2 SHORT PUBLISHED TO X (TWITTER)!`);
  console.log(`🔗 Tweet URL: ${tweetLink}\n`);

  // 3. Post Thread Reply with Discussion Hook & YouTube Link
  let replyId = null;
  const replyText = `${metadata.pinnedComment || 'Be honest: when was the last time you saw sunlight without blue light glasses? ☀️🕶️'}\n\n` +
    `Full series & 4K Shorts:\n` +
    `🔴 YouTube: ${metadata.url || 'https://youtube.com/@iamaibutiamagoodguy'}\n` +
    `📸 Instagram: https://instagram.com/the.goodguy.ai`;

  try {
    const replyPayload = {
      text: replyText,
      reply: { in_reply_to_tweet_id: tweetId },
    };
    const replyAuth = getOAuth1Header('POST', tweetUrl);
    const replyRes = await fetch(tweetUrl, {
      method: 'POST',
      headers: {
        Authorization: replyAuth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replyPayload),
    });
    const replyData = await replyRes.json();
    replyId = replyData.data?.id;
    console.log(`💬 Discussion reply thread created on X!`);
  } catch (replyErr) {
    console.warn(`⚠️ X reply notice:`, replyErr.message);
  }

  return {
    success: true,
    platform: 'X',
    tweetId,
    url: tweetLink,
    replyId,
  };
}

if (process.argv[1] && process.argv[1].endsWith('publish_x.js')) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  uploadPhase2ToX(
    'out/relatable_reels/the_ai_forces_the_dev_to_step_outside_an_reel.mp4',
    {
      title: 'Solar Flare Panic ☀️🤖',
      description: 'An AI forces its screen-addicted human outside for a mandatory vitamin D patch update.',
      url: 'https://youtube.com/shorts/Mm1UcR8IWf4',
      pinnedComment: 'Be honest: when was the last time you saw actual sunlight without blue light glasses? ☀️🕶️',
    },
    { dryRun }
  ).then(console.log).catch(console.error);
}
