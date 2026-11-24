/**
 * Multi-Platform Automated Story Publisher
 * Publishes video stories to Instagram Stories & Facebook Page Stories
 * 
 * Usage:
 *   node scripts/publish_stories.js --video out/story_1_arctic_vault_teaser.mp4
 *   node scripts/publish_stories.js --all
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const IG_USER_ID = process.env.INSTAGRAM_USER_ID || '17841467529961202';
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '1423941607469748';
const FB_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

async function uploadInstagramStory(videoPath) {
  console.log('\n======================================================');
  console.log('📸 [INSTAGRAM STORIES] Initiating Story Upload...');
  console.log(`🎯 Video: ${path.basename(videoPath)}`);
  console.log('======================================================');

  if (!IG_ACCESS_TOKEN) {
    throw new Error('INSTAGRAM_ACCESS_TOKEN not set in .env');
  }

  const fileSize = fs.statSync(videoPath).size;
  console.log(`📦 Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

  // Step 1: Initialize Resumable Story Container
  const initUrl = `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`;
  const initParams = new URLSearchParams({
    media_type: 'STORIES',
    upload_type: 'resumable',
    access_token: IG_ACCESS_TOKEN,
  });

  const initRes = await fetch(`${initUrl}?${initParams.toString()}`, { method: 'POST' });
  const initData = await initRes.json();

  if (!initRes.ok || !initData.id || !initData.uri) {
    throw new Error(`Instagram story session init failed: ${JSON.stringify(initData)}`);
  }

  const containerId = initData.id;
  const uploadUri = initData.uri;
  console.log(`📥 Resumable story container created: ${containerId}`);

  // Step 2: Binary byte stream transfer
  await new Promise((resolve) => {
    const uploadUrl = new URL(uploadUri);
    const req = https.request(
      uploadUrl,
      {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${IG_ACCESS_TOKEN}`,
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
            console.log('✅ Video binary successfully uploaded to Instagram storage');
          } else {
            console.warn(`⚠️ Rupload status ${res.statusCode}: ${body}`);
          }
          resolve();
        });
      }
    );
    req.on('error', (err) => {
      console.warn(`⚠️ Socket error: ${err.message}`);
      resolve();
    });
    fs.createReadStream(videoPath).pipe(req);
  });

  // Step 3: Poll Container Status
  console.log('⏳ Polling Instagram story container processing...');
  let isReady = false;
  for (let poll = 0; poll < 30; poll++) {
    await new Promise((r) => setTimeout(r, 4000));
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${IG_ACCESS_TOKEN}`
    );
    const statusData = await statusRes.json();

    if (statusData.status_code === 'FINISHED') {
      isReady = true;
      console.log('✅ Container processing status: FINISHED');
      break;
    } else if (statusData.status_code === 'ERROR') {
      throw new Error(`Instagram container processing error: ${JSON.stringify(statusData)}`);
    }
    process.stdout.write(`⏳ Processing status: ${statusData.status_code || 'IN_PROGRESS'}...\r`);
  }

  if (!isReady) {
    throw new Error('Instagram story container timed out after 120 seconds.');
  }

  // Step 4: Publish Story Container
  const publishUrl = `https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`;
  const publishRes = await fetch(`${publishUrl}?creation_id=${containerId}&access_token=${IG_ACCESS_TOKEN}`, {
    method: 'POST',
  });
  const publishData = await publishRes.json();

  if (!publishRes.ok || !publishData.id) {
    throw new Error(`Instagram story publish failed: ${JSON.stringify(publishData)}`);
  }

  console.log(`\n🎉 INSTAGRAM STORY PUBLISHED SUCCESSFULLY! Media ID: ${publishData.id}\n`);
  return { success: true, platform: 'Instagram', mediaId: publishData.id };
}

async function uploadFacebookStory(videoPath) {
  console.log('\n======================================================');
  console.log('📘 [FACEBOOK STORIES] Initiating Page Story Upload...');
  console.log(`🎯 Video: ${path.basename(videoPath)}`);
  console.log('======================================================');

  if (!FB_PAGE_ACCESS_TOKEN || !FB_PAGE_ID) {
    throw new Error('FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN not set in .env');
  }

  const fileSize = fs.statSync(videoPath).size;
  console.log(`📦 Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

  // Step 1: Initialize Facebook Page Story Session
  const initUrl = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/video_stories`;
  const initRes = await fetch(initUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      upload_phase: 'start',
      access_token: FB_PAGE_ACCESS_TOKEN,
    }),
  });
  const initData = await initRes.json();

  if (!initRes.ok || !initData.video_id || !initData.upload_url) {
    throw new Error(`Facebook story init failed: ${JSON.stringify(initData)}`);
  }

  const fbVideoId = initData.video_id;
  const fbUploadUrl = initData.upload_url;
  console.log(`📥 Facebook story session created: ${fbVideoId}`);

  // Step 2: Binary byte stream transfer
  await new Promise((resolve) => {
    const uploadUrlObj = new URL(fbUploadUrl);
    const req = https.request(
      uploadUrlObj,
      {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${FB_PAGE_ACCESS_TOKEN}`,
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
            console.log('✅ Video binary successfully uploaded to Facebook storage');
          } else {
            console.warn(`⚠️ Facebook rupload status ${res.statusCode}: ${body}`);
          }
          resolve();
        });
      }
    );
    req.on('error', (err) => {
      console.warn(`⚠️ FB Socket warning: ${err.message}`);
      resolve();
    });
    fs.createReadStream(videoPath).pipe(req);
  });

  // Step 3: Finish Story Upload
  console.log('⏳ Finalizing Facebook Page story publication...');
  const finishUrl = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/video_stories`;
  const finishRes = await fetch(finishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      upload_phase: 'finish',
      video_id: fbVideoId,
      access_token: FB_PAGE_ACCESS_TOKEN,
    }),
  });

  const finishData = await finishRes.json();
  if (!finishRes.ok || finishData.success === false) {
    throw new Error(`Facebook story finish failed: ${JSON.stringify(finishData)}`);
  }

  console.log(`\n🎉 FACEBOOK PAGE STORY PUBLISHED SUCCESSFULLY! Video ID: ${fbVideoId}\n`);
  return { success: true, platform: 'Facebook', videoId: fbVideoId };
}

async function main() {
  const args = process.argv.slice(2);
  let targetVideos = [];

  const videoArgIdx = args.indexOf('--video');
  if (videoArgIdx !== -1 && args[videoArgIdx + 1]) {
    targetVideos.push(path.resolve(PROJECT_ROOT, args[videoArgIdx + 1]));
  } else if (args.includes('--all')) {
    targetVideos = [
      path.resolve(PROJECT_ROOT, 'out/story_1_arctic_vault_teaser.mp4'),
      path.resolve(PROJECT_ROOT, 'out/story_2_humanity_reboot.mp4'),
    ];
  } else {
    // Default: upload story 1
    targetVideos.push(path.resolve(PROJECT_ROOT, 'out/story_1_arctic_vault_teaser.mp4'));
  }

  console.log(`🚀 Publishing ${targetVideos.length} story/stories to Instagram & Facebook...`);

  for (const video of targetVideos) {
    if (!fs.existsSync(video)) {
      console.error(`❌ Video not found: ${video}`);
      continue;
    }

    try {
      await uploadInstagramStory(video);
    } catch (e) {
      console.error(`❌ Instagram story failed for ${path.basename(video)}:`, e.message);
    }

    try {
      await uploadFacebookStory(video);
    } catch (e) {
      console.error(`❌ Facebook story failed for ${path.basename(video)}:`, e.message);
    }
  }

  console.log('🏁 All requested story uploads completed!');
}

main().catch(console.error);
