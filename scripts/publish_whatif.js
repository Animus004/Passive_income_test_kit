/**
 * Dedicated Multi-Platform Publisher for "What-If" 2D Cartoon Series
 * 
 * Supports dynamic episode selection (#1, #2, #3, #4, #5) or auto-resolution from upload history.
 * Target Distribution:
 * - YouTube Shorts: English Master (Adam Voice, High-Stakes Curiosity)
 * - Instagram Reels: Hindi Master (Madhur Voice, Viral Indian Social Reach)
 * - Facebook Page Reels: Hindi Master (High Shareability across Groups)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

import { auditPhase1Video, getVideoStreamMD5 } from './watchdog_phase1.js';
import { sendTelegramReelAlert } from './telegram_notifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const TOKENS_PATH = path.join(PROJECT_ROOT, 'tokens.json');
const CLIENT_SECRET_PATH = path.join(PROJECT_ROOT, 'client_secret.json');
const HISTORY_PATH = path.join(PROJECT_ROOT, 'data', 'upload_history.json');

const EPISODES_REGISTRY = {
  '#1': {
    episode: '#1',
    platforms: ['YouTube', 'Facebook', 'Instagram'], // 1 of 3 Meta daily slots
    englishVideo: path.join(OUT_DIR, 'final_circletoon_whatif_adam.mp4'),
    hindiVideo: path.join(OUT_DIR, 'final_circletoon_whatif_hindi.mp4'),
    englishMetadata: {
      title: 'What If Everyone Got $1,000,000 At Midnight? 🤯💸 #Shorts #WhatIf #Paradox',
      description: `What if every single person on Earth received one million dollars at midnight tonight? At 12:00 AM, eight billion phones buzz with a direct deposit notification. Instantly, ninety-five percent of workers quit their jobs to celebrate. But within seventy-two hours, paper money becomes completely worthless, and society begins trading chocolate bars like gold bars!\n\nWhat would you buy first? Drop your survival plan below! 👇\n\n#Shorts #WhatIf #Paradox #Money #Economics #Curiosity #Hyperinflation #Storytelling`,
      tags: ['Shorts', 'WhatIf', 'Paradox', 'Money', 'Economics', 'Hyperinflation', 'Storytelling', 'Curiosity'],
      topic: 'the $1,000,000 midnight deposit',
    },
    hindiMetadata: {
      title: 'क्या हो अगर आज रात सबके पास ₹10 लाख आ जाएं? 😱💸',
      caption: `क्या हो अगर आज रात ठीक 12:00 बजे, दुनिया के हर इंसान के बैंक खाते में ₹10 लाख आ जाएं? 🤯💰\n\n800 करोड़ फोन बजे, 95% लोगों ने नौकरियां छोड़ दीं... लेकिन 72 घंटों में कागज़ी नोट रद्दी क्यों बन गए?\n\nकमेंट्स में बताओ: अगर आपको अचानक ₹10 लाख मिलें, तो सबसे पहले क्या खरीदोगे? 👇\n\n#reels #viral #kyaHoAgar #whatIf #hindiReels #money #thoughtExperiment #economy #explorepage`,
    },
  },
  '#2': {
    episode: '#2',
    platforms: ['YouTube', 'Facebook', 'Instagram'], // 2 of 3 Meta daily slots
    englishVideo: path.join(OUT_DIR, 'final_whalter_whatif_ep2.mp4'),
    hindiVideo: path.join(OUT_DIR, 'final_whalter_whatif_ep2_hindi.mp4'),
    englishMetadata: {
      title: 'What If the Global Internet Was Deleted for 72 Hours? 🔌⚠️ #Shorts #WhatIf #TechCollapse',
      description: `What if the entire global internet was deleted for seventy-two hours? At 12:01 AM... every screen on Earth freezes. Instantly, thirty thousand commercial airplanes lose GPS navigation and are forced to fly blind! By 8:00 AM, every credit card and ATM on the planet is dead, leaving billions of people unable to buy food. Supply chains completely freeze because delivery trucks rely on digital dispatch. Within forty-eight hours, power grids begin desyncing, plunging entire continents into darkness!\n\nCould you survive 3 days without the internet? Drop your emergency plan below! 👇\n\n#Shorts #WhatIf #Paradox #Internet #TechCollapse #Blackout #Survival #Curiosity`,
      tags: ['Shorts', 'WhatIf', 'Paradox', 'Internet', 'TechCollapse', 'Blackout', 'Survival', 'Curiosity'],
      topic: 'the global internet blackout',
    },
    hindiMetadata: {
      title: 'क्या हो अगर पूरी दुनिया का इंटरनेट 72 घंटों के लिए बंद हो जाए? 🔌⚠️',
      caption: `Duniya ka saara internet 72 hours ke liye gayab ho gaya! 😱🔌\n\nRaat 12:01 pe sabhi screens freeze ho gayi, 30,000 airplanes hawa mein andhe ho gaye, aur sabhi ATMs fail ho gaye! 🤯\n\nBatao comments mein: Bina internet ke 3 din kaise jiyoge? 👇\n\n#reels #viral #kyaHoAgar #whatIf #hindiReels #internet #technology #thoughtExperiment #explorepage`,
    },
  },
  '#3': {
    episode: '#3',
    platforms: ['YouTube', 'Facebook', 'Instagram'],
    englishVideo: path.join(OUT_DIR, 'final_circletoon_whatif_ep3_adam.mp4'),
    hindiVideo: path.join(OUT_DIR, 'final_circletoon_whatif_ep3_hindi.mp4'),
    expectedKeywords: ['sleep', 'days', 'human', 'collapse', 'blackout', 'autopilot'],
    expectedKeywordsHi: ['so gaye', 'ghanton', 'insaan', 'duniya', 'andhere'],
    englishSubtitles: path.join(PROJECT_ROOT, 'public', 'subtitles_ep3_en.json'),
    hindiSubtitles: path.join(PROJECT_ROOT, 'public', 'subtitles_ep3_hi.json'),
    englishMetadata: {
      title: 'What If Every Human Slept for 7 Days Straight? 💤🌍 #Shorts #WhatIf #SilentWorld',
      description: `What if every single person on Earth fell asleep at the exact same second for an entire week? At 12:00 midnight, 8 billion people simultaneously collapse. Nuclear plants scram automatically, satellites tumble, and nature reclaims the streets!\n\nWho would wake up first? Drop your survival theory below! 👇\n\n#Shorts #WhatIf #SleepParadox #Humanity #Curiosity #ScienceFiction #Viral`,
      tags: ['Shorts', 'WhatIf', 'SleepParadox', 'Humanity', 'Curiosity', 'Science'],
      topic: 'the 7-day global sleep paradox',
    },
    hindiMetadata: {
      title: 'क्या हो अगर पूरी दुनिया के इंसान 7 दिनों के लिए सो जाएं? 💤🌍',
      caption: `Kya ho agar poori duniya ke saare insaan 7 dino ke liye ek saath so jayein? 😱💤\n\nRaat theek 12:00 baje 800 crore log behosh ho gaye, sadkon par gaadiyan takrane lagi, aur nuclear plants auto-shutdown ho gaye! 🤯⚡\n\nBatao comments mein: Agar aap 7 din baad jaagoge, toh sabse pehle kya check karoge? 👇\n\n#reels #viral #kyaHoAgar #whatIf #hindiReels #curiosity #explorepage`,
    },
  },
  '#4': {
    episode: '#4',
    platforms: ['YouTube', 'Facebook', 'Instagram'], // 3 of 3 Meta daily slots (Prime Evening)
    englishVideo: path.join(OUT_DIR, 'final_circletoon_whatif_ep4_adam.mp4'),
    hindiVideo: path.join(OUT_DIR, 'final_circletoon_whatif_ep4_hindi.mp4'),
    englishMetadata: {
      title: 'What If Oxygen Doubled for Exactly 5 Minutes? 🫁🔥 #Shorts #WhatIf #EarthFacts',
      description: `What if the oxygen level on Earth suddenly doubled for five minutes? Giant dragonflies return to life, paper airplanes fly for miles, but every spark turns into an uncontrollable inferno!\n\n#Shorts #WhatIf #Oxygen #Curiosity`,
      tags: ['Shorts', 'WhatIf', 'Oxygen', 'Science', 'Curiosity'],
      topic: 'doubled oxygen paradox',
    },
    hindiMetadata: {
      title: 'क्या हो अगर धरती पर ऑक्सीजन दोगुनी हो जाए? 🫁🔥',
      caption: `Dharati par oxygen sirf 5 minute ke liye double ho jaye toh kya hoga? 🫁🔥\n\n#reels #viral #kyaHoAgar #whatIf #hindiReels`,
    },
  },
  '#5': {
    episode: '#5',
    platforms: ['YouTube'], // YouTube-Exclusive (Conserves 3/day Meta quota)
    englishVideo: path.join(OUT_DIR, 'final_circletoon_whatif_ep5_adam.mp4'),
    hindiVideo: path.join(OUT_DIR, 'final_circletoon_whatif_ep5_hindi.mp4'),
    englishMetadata: {
      title: 'What If Nobody Spent a Single Dollar for 30 Days? 🛑💵 #Shorts #WhatIf #EconomyCollapse',
      description: `What if 8 billion people simultaneously stopped spending money for 30 days? Supply chains freeze, corporate giants crumble, and a new bartering economy emerges!\n\n#Shorts #WhatIf #Economy #Curiosity`,
      tags: ['Shorts', 'WhatIf', 'Economy', 'Money', 'Curiosity'],
      topic: 'zero consumer spending paradox',
    },
    hindiMetadata: {
      title: 'क्या हो अगर पूरी दुनिया 30 दिनों तक 1 रुपया भी खर्च न करे? 🛑💵',
      caption: `30 dino tak agar koi bhi 1 paisa kharch na kare toh global economy ka kya hoga? 🛑💵\n\n#reels #viral #kyaHoAgar #whatIf #hindiReels`,
    },
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  let dryRun = false;
  let force = false;
  let targetEpisode = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') dryRun = true;
    if (args[i] === '--force') force = true;
    if ((args[i] === '--episode' || args[i] === '-e') && args[i + 1]) {
      const raw = args[i + 1].trim();
      targetEpisode = raw.startsWith('#') ? raw : `#${raw.replace(/[^0-9]/g, '') || raw}`;
      i++;
    } else if (args[i].startsWith('--episode=')) {
      const raw = args[i].split('=')[1].trim();
      targetEpisode = raw.startsWith('#') ? raw : `#${raw.replace(/[^0-9]/g, '') || raw}`;
    }
  }
  return { dryRun, force, targetEpisode };
}

function getUploadHistory() {
  if (!fs.existsSync(HISTORY_PATH)) return { uploads: [] };
  try {
    return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  } catch (e) {
    return { uploads: [] };
  }
}

function resolveActiveEpisode(explicitEp) {
  if (explicitEp && EPISODES_REGISTRY[explicitEp]) {
    return EPISODES_REGISTRY[explicitEp];
  }
  const history = getUploadHistory();
  const uploaded = new Set(history.uploads.map((u) => u.episode));
  for (const epId of ['#1', '#2', '#3', '#4', '#5']) {
    if (!uploaded.has(epId) && EPISODES_REGISTRY[epId]) {
      return EPISODES_REGISTRY[epId];
    }
  }
  return EPISODES_REGISTRY['#1'];
}

function checkCooldown(minHours = 4.0) {
  const history = getUploadHistory();
  if (!history.uploads || history.uploads.length === 0) return { allowed: true, elapsedHours: 999 };
  const lastUpload = history.uploads[history.uploads.length - 1];
  const lastTime = new Date(lastUpload.timestamp).getTime();
  const now = Date.now();
  const elapsedHours = (now - lastTime) / (1000 * 60 * 60);
  return {
    allowed: elapsedHours >= minHours,
    elapsedHours: parseFloat(elapsedHours.toFixed(2)),
    remainingHours: parseFloat(Math.max(0, minHours - elapsedHours).toFixed(2)),
    lastUpload,
  };
}

function logUpload(record) {
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  let history = { uploads: [] };
  if (fs.existsSync(HISTORY_PATH)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
    } catch (e) {}
  }
  history.uploads.push({
    timestamp: new Date().toISOString(),
    ...record,
  });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
}

async function uploadToYouTube(videoPath, metadata, isDryRun) {
  console.log('\n▶️ [YouTube Shorts] Initializing upload...');
  let clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  let refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

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
    throw new Error('Missing YouTube OAuth credentials in environment.');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000');
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  if (isDryRun) {
    console.log('🧪 [DRY RUN] Verifying YouTube OAuth access token...');
    await oauth2Client.getAccessToken();
    console.log('✅ YouTube OAuth Access Token refreshed successfully!');
    console.log(`🎬 Title Preview: "${metadata.title}"`);
    return { success: true, platform: 'YouTube', dryRun: true };
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const fileSize = fs.statSync(videoPath).size;
  console.log(`🎬 Uploading: "${metadata.title}" (${(fileSize / (1024 * 1024)).toFixed(2)} MB)...`);

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    notifySubscribers: true,
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: '27',
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en',
      },
      status: {
        privacyStatus: process.env.YOUTUBE_PRIVACY_STATUS || 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  const shortsUrl = `https://youtube.com/shorts/${videoId}`;
  console.log(`✅ YouTube Shorts Published Successfully! URL: ${shortsUrl}`);

  return { success: true, platform: 'YouTube', videoId, url: shortsUrl };
}

async function uploadToFacebookPage(videoPath, metadata, isDryRun) {
  console.log('\n📘 [Facebook Page Reels] Initializing Hindi upload...');
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!pageId || !pageToken) {
    console.log('ℹ️ Facebook Page credentials not configured, skipping.');
    return { success: false, platform: 'Facebook', skipped: true };
  }

  if (isDryRun) {
    console.log(`🧪 [DRY RUN] Verifying Facebook Page ID ${pageId}...`);
    const testRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=id,name&access_token=${pageToken}`);
    const testData = await testRes.json();
    if (testData.id) {
      console.log(`✅ Facebook Page Verified: ${testData.name}`);
      return { success: true, platform: 'Facebook', dryRun: true };
    }
    throw new Error(JSON.stringify(testData));
  }

  const fileSize = fs.statSync(videoPath).size;
  const initUrl = `https://graph.facebook.com/v21.0/${pageId}/video_reels`;
  const initRes = await fetch(initUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ upload_phase: 'start', access_token: pageToken }),
  });
  const initData = await initRes.json();
  if (!initRes.ok || !initData.video_id || !initData.upload_url) {
    throw new Error(`FB Reels start failed: ${JSON.stringify(initData)}`);
  }

  const fbVideoId = initData.video_id;
  const fbUploadUrl = initData.upload_url;
  console.log(`📥 FB Reels Session Created (Video ID: ${fbVideoId})`);

  // Stream bytes
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
        if (res.statusCode >= 200 && res.statusCode < 300) resolve();
        else reject(new Error(`FB upload failed (HTTP ${res.statusCode})`));
      }
    );
    req.on('error', reject);
    fs.createReadStream(videoPath).pipe(req);
  });

  // Finish
  const finishRes = await fetch(initUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      upload_phase: 'finish',
      video_id: fbVideoId,
      video_state: 'PUBLISHED',
      description: metadata.caption,
      access_token: pageToken,
    }),
  });
  const finishData = await finishRes.json();
  if (!finishRes.ok || finishData.success === false) {
    throw new Error(`FB publish finalization failed: ${JSON.stringify(finishData)}`);
  }

  console.log(`✅ Facebook Page Reel Published Successfully! (Post ID: ${finishData.post_id || fbVideoId})`);
  return { success: true, platform: 'Facebook', mediaId: finishData.post_id || fbVideoId };
}

async function uploadToInstagram(videoPath, metadata, isDryRun) {
  console.log('\n📸 [Instagram Reels] Initializing Hindi upload...');
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !igUserId) {
    console.log('ℹ️ Instagram credentials not configured, skipping direct API upload.');
    return { success: false, platform: 'Instagram', skipped: true };
  }

  if (isDryRun) {
    console.log(`🧪 [DRY RUN] Verifying Instagram user ID ${igUserId}...`);
    const testRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}?fields=id,username,name&access_token=${accessToken}`);
    const testData = await testRes.json();
    if (testData.id) {
      console.log(`✅ Instagram Account Verified: @${testData.username} (${testData.name || testData.id})`);
      return { success: true, platform: 'Instagram', dryRun: true };
    }
    throw new Error(JSON.stringify(testData));
  }

  const caption = metadata.caption || `${metadata.title}\n\n#reels #viral #whatif`;
  const fileSize = fs.statSync(videoPath).size;
  console.log(`📱 Uploading to IG User ID: ${igUserId} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);

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
    throw new Error(`Instagram container init failed: ${JSON.stringify(initData)}`);
  }

  const containerId = initData.id;
  const uploadUri = initData.uri;
  console.log(`📥 Resumable upload session created: ${containerId}`);

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
            console.warn(`⚠️ Instagram upload HTTP ${res.statusCode}: ${body}`);
            resolve();
          }
        });
      }
    );
    req.on('error', (err) => {
      console.warn(`⚠️ Socket notice: ${err.message}`);
      resolve();
    });
    fs.createReadStream(videoPath).pipe(req);
  });

  console.log('📤 Binary uploaded to Instagram. Polling processing status...');
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
      throw new Error(`Instagram processing error: ${JSON.stringify(statusData)}`);
    }
  }

  if (!isReady) {
    throw new Error('Instagram container processing timed out after 120 seconds.');
  }

  const publishUrl = `https://graph.facebook.com/v21.0/${igUserId}/media_publish`;
  const publishRes = await fetch(`${publishUrl}?creation_id=${containerId}&access_token=${accessToken}`, {
    method: 'POST',
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok || !publishData.id) {
    throw new Error(`Instagram media publish failed: ${JSON.stringify(publishData)}`);
  }

  console.log(`✅ Instagram Reels Published Successfully! (Media ID: ${publishData.id})`);
  return { success: true, platform: 'Instagram', mediaId: publishData.id };
}

async function main() {
  const { dryRun, force, targetEpisode } = parseArgs();
  const epData = resolveActiveEpisode(targetEpisode);

  // Strict Fail-Closed Check: Silent fallbacks are permanently disabled to prevent wrong-video uploads
  const englishVideo = epData.englishVideo;
  const hindiVideo = epData.hindiVideo;

  if (!fs.existsSync(englishVideo)) {
    console.error(`\n❌ [SECURITY & INTEGRITY BLOCK] Master English video missing for ${epData.episode}!`);
    console.error(`   Expected file: ${englishVideo}`);
    console.error(`   Silent fallbacks are PERMANENTLY DISABLED to protect channel reputation.`);
    console.error(`   Action required: Render ${epData.episode} via Remotion before publishing.\n`);
    process.exit(1);
  }

  console.log('===============================================================');
  console.log(`🚀 AUTONOMOUS WHAT-IF PUBLISHER: EPISODE ${epData.episode}`);
  console.log(`   Title:         "${epData.englishMetadata.title}"`);
  console.log(`   English Video: ${englishVideo}`);
  console.log(`   Hindi Video:   ${hindiVideo}`);
  if (dryRun) console.log('   🧪 MODE: DRY RUN ONLY');
  console.log('===============================================================\n');

  // Cooldown check (4.0 hours anti-spam gate)
  if (!force && !dryRun) {
    const cd = checkCooldown(4.0);
    if (!cd.allowed) {
      console.log(`⛔ COOLDOWN ACTIVE: Last upload was ${cd.elapsedHours}h ago. Minimum gap is 4.0 hours.`);
      console.log(`   Next eligible upload window in ${cd.remainingHours} hours.`);
      console.log('   (Pass --force to override cooldown).');
      process.exit(0);
    }
  }

  // MANDATORY PRE-FLIGHT WATCHDOG INTEGRITY GATE (ZERO-TOLERANCE SECURITY)
  console.log('🛡️ Running Mandatory Pre-Flight Watchdog Audit...');
  const enAudit = await auditPhase1Video({
    videoPath: englishVideo,
    episodeId: epData.episode,
    expectedKeywords: epData.expectedKeywords || ['internet', 'deleted', 'hours'],
    forbiddenKeywords: epData.forbiddenKeywords || ['1,000,000', 'cheque', 'mansion', 'chocolate bar'],
    subtitlesPath: epData.englishSubtitles || path.join(PROJECT_ROOT, 'public', 'subtitles_ep2_en.json'),
    language: 'en',
    dryRun,
  });

  if (!enAudit.passed) {
    console.error(`\n❌ [SECURITY SHUTDOWN] Master English video FAILED Watchdog Audit for ${epData.episode}!`);
    console.error(`   Refusing to publish unverified or contaminated video.`);
    process.exit(1);
  }

  if (hindiVideo && fs.existsSync(hindiVideo)) {
    const hiAudit = await auditPhase1Video({
      videoPath: hindiVideo,
      episodeId: epData.episode,
      expectedKeywords: epData.expectedKeywordsHi || ['internet', 'ghante'],
      forbiddenKeywords: epData.forbiddenKeywords || ['1,000,000', 'cheque', 'mansion', 'chocolate bar'],
      subtitlesPath: epData.hindiSubtitles || path.join(PROJECT_ROOT, 'public', 'subtitles_ep2_hi.json'),
      language: 'hi',
      dryRun,
    });

    if (!hiAudit.passed) {
      console.error(`\n❌ [SECURITY SHUTDOWN] Master Hindi video FAILED Watchdog Audit for ${epData.episode}!`);
      console.error(`   Refusing to publish unverified or contaminated video.`);
      process.exit(1);
    }
  }

  const results = [];

  // 1. YouTube Shorts (English Master with Adam)
  try {
    const yt = await uploadToYouTube(englishVideo, epData.englishMetadata, dryRun);
    results.push(yt);
  } catch (err) {
    console.error('❌ YouTube Upload Failed:', err.message);
    results.push({ success: false, platform: 'YouTube', error: err.message });
  }

  // 2. Facebook Page Reels (Hindi Master with Hinglish Subtitles)
  const isFbEligible = !epData.platforms || epData.platforms.includes('Facebook');
  if (isFbEligible) {
    try {
      const fb = await uploadToFacebookPage(hindiVideo, epData.hindiMetadata, dryRun);
      results.push(fb);
    } catch (err) {
      console.error('❌ Facebook Upload Failed:', err.message);
      results.push({ success: false, platform: 'Facebook', error: err.message });
    }
  } else {
    console.log(`ℹ️ [Facebook Page Reels] ${epData.episode} is YouTube-exclusive (3-per-day Meta limit active). Skipping.`);
    results.push({ success: true, platform: 'Facebook', skipped: true, reason: 'Curated 3/day Meta limit' });
  }

  // 3. Instagram Reels (Direct Meta Graph API + Telegram Dispatch Backup)
  const isIgEligible = !epData.platforms || epData.platforms.includes('Instagram');
  if (isIgEligible) {
    let igDirectSuccess = false;
    try {
      const igResult = await uploadToInstagram(hindiVideo, epData.hindiMetadata, dryRun);
      if (igResult.success) {
        results.push(igResult);
        igDirectSuccess = true;
      }
    } catch (igErr) {
      console.warn(`⚠️ Instagram Direct API Notice: ${igErr.message}`);
      results.push({ success: false, platform: 'Instagram (Direct)', error: igErr.message });
    }

    // Also trigger mobile dispatch notice via Telegram as backup / mobile notification
    try {
      if (!dryRun) {
        await sendTelegramReelAlert({
          videoPath: hindiVideo,
          title: epData.hindiMetadata.title,
          caption: epData.hindiMetadata.caption,
          reason: `Automated Episode ${epData.episode} Mobile Release`,
          platform: 'Instagram Reels',
          manualPkgFilename: `manual_instagram_${epData.episode.replace('#', 'ep')}.txt`,
        });
        results.push({ success: true, platform: 'Instagram (Telegram Dispatch)' });
      } else {
        results.push({ success: true, platform: 'Instagram (Dry Run)' });
      }
    } catch (tgErr) {
      console.warn(`Telegram dispatch notice: ${tgErr.message}`);
    }
  } else {
    console.log(`ℹ️ [Instagram] ${epData.episode} is YouTube-exclusive (3-per-day Meta limit active). Skipping.`);
    results.push({ success: true, platform: 'Instagram', skipped: true, reason: 'Curated 3/day Meta limit' });
  }

  console.log('\n===============================================================');
  console.log('📊 PUBLISHING EXECUTION REPORT');
  console.log('===============================================================');
  results.forEach((r) => {
    if (r.success) {
      console.log(`✅ ${r.platform}: SUCCESS ${r.url ? `-> ${r.url}` : ''}`);
    } else if (r.skipped) {
      console.log(`ℹ️ ${r.platform}: SKIPPED (${r.reason || 'not configured'})`);
    } else {
      console.log(`❌ ${r.platform}: FAILED (${r.error})`);
    }
  });
  console.log('===============================================================\n');

  if (!dryRun) {
    logUpload({
      episode: epData.episode,
      title: epData.englishMetadata.title,
      videoStreamMD5: getVideoStreamMD5(englishVideo),
      results,
    });
    console.log(`📝 Episode ${epData.episode} logged to data/upload_history.json. Cooldown timer started (4.0 hrs).`);
  }
}

main().catch((err) => {
  console.error('Fatal publisher error:', err);
  process.exit(1);
});

export { main };
