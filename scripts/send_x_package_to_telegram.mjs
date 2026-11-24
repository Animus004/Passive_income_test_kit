import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

export async function sendXPackageToTelegram(videoPath, manifestOrPath) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('⚠️ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env. Skipping Telegram X package dispatch.');
    return { success: false, reason: 'Missing credentials' };
  }

  if (!fs.existsSync(videoPath)) {
    console.warn('⚠️ Video not found at:', videoPath);
    return { success: false, reason: 'Video file missing' };
  }

  let manifest = {};
  if (typeof manifestOrPath === 'string' && fs.existsSync(manifestOrPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestOrPath, 'utf8'));
    } catch (e) { }
  } else if (typeof manifestOrPath === 'object' && manifestOrPath !== null) {
    manifest = manifestOrPath;
  }

  const title = manifest.title || path.basename(videoPath, '.mp4');
  const premise = manifest.premise || manifest.description || '';
  const pinnedComment = manifest.pinnedComment || 'What do you think of this? Drop your thoughts below! 👇';

  // Format clean copy for X (Twitter)
  const tweetPostText = `${title}\n\n${premise}\n\n#AI #Coding #TechHumor #Blender3D #BuildInPublic #Developers #TheGoodGuyAI`;

  const threadReplyText = `${pinnedComment}\n\n` +
    `Follow for daily 3D AI & Dev comedy:\n` +
    `📸 IG: https://instagram.com/the.goodguy.ai\n` +
    `🔴 YT: https://youtube.com/@iamaibutiamagoodguy`;

  console.log(`\n📨 [TELEGRAM] Dispatching X (Twitter) package to Telegram (Chat: ${chatId})...`);

  // 1. Send the Video with X Header
  const videoCaption = `🚀 <b>TODAY'S X (TWITTER) VIDEO PACKAGE</b>\n\n` +
    `🎬 <b>Title:</b> ${title}\n\n` +
    `👇 <i>Video attached for direct upload to X (Twitter). Tap code blocks below to copy!</i>`;

  const videoFormData = new FormData();
  videoFormData.append('chat_id', chatId);
  videoFormData.append('video', new Blob([fs.readFileSync(videoPath)], { type: 'video/mp4' }), path.basename(videoPath));
  videoFormData.append('caption', videoCaption);
  videoFormData.append('parse_mode', 'HTML');
  videoFormData.append('supports_streaming', 'true');

  const resVideo = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
    method: 'POST',
    body: videoFormData
  });
  const dataVideo = await resVideo.json();
  if (!dataVideo.ok) {
    console.warn('⚠️ Failed to send video to Telegram:', dataVideo.description);
    return { success: false, error: dataVideo.description };
  }
  console.log('✅ 3D Video successfully streamed to Telegram!');

  // 2. Send 1-tap Copy Text for Main Tweet
  const tweetMsg = `📋 <b>X (TWITTER) MAIN TWEET (Tap code to copy):</b>\n\n` +
    `<pre><code>${tweetPostText}</code></pre>`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: tweetMsg,
      parse_mode: 'HTML'
    })
  });
  console.log('✅ Main Tweet text sent to Telegram!');

  // 3. Send 1-tap Copy Text for Thread Reply
  const replyMsg = `💬 <b>THREAD REPLY / COMMENT (Tap code to copy):</b>\n\n` +
    `<pre><code>${threadReplyText}</code></pre>`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: replyMsg,
      parse_mode: 'HTML'
    })
  });
  console.log('✅ Thread reply text sent to Telegram!');

  return { success: true };
}

// Direct execution CLI support
if (process.argv[1] && process.argv[1].endsWith('send_x_package_to_telegram.mjs')) {
  const defaultVideo = path.join(PROJECT_ROOT, 'out', 'relatable_reels', 'global_english', 'human_and_gemini_establish_a_research_ou_en.mp4');
  const defaultManifest = path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', 'human_and_gemini_establish_a_research_ou', 'manifest_en.json');
  sendXPackageToTelegram(process.argv[2] || defaultVideo, process.argv[3] || defaultManifest).catch(console.error);
}
