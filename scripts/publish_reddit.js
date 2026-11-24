/**
 * Autonomous Reddit Publisher for Phase 2 3D Comedy Shorts
 * 
 * Supports:
 * - Direct submission to target developer subreddits (e.g. r/ProgrammerHumor, r/webdev, or personal profile)
 * - Automatic Pinned Discussion Comment with channel links and [OC] creator attribution
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const USER_AGENT = process.env.REDDIT_USER_AGENT || 'node:com.thegoodguy.ai:v1.0.0 (by /u/' + (process.env.REDDIT_USERNAME || 'autonomous') + ')';

/**
 * Obtain an OAuth2 access token via password grant
 */
async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error('Missing Reddit credentials in .env (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD)');
  }

  const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const params = new URLSearchParams({
    grant_type: 'password',
    username: username,
    password: password,
  });

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Reddit Auth failed: ${data.error} - ${data.message || ''}`);
  }

  return data.access_token;
}

/**
 * Submit a Link/Video Post or Rich Text Post to Subreddit
 */
export async function uploadPhase2ToReddit(videoPath, metadata, options = {}) {
  const isDryRun = options.dryRun || false;
  const subreddit = options.subreddit || process.env.REDDIT_DEFAULT_SUBREDDIT || 'ProgrammerHumor';

  console.log('\n======================================================');
  console.log(`🤖 [PHASE 2 REDDIT] Submitting to r/${subreddit}...`);
  console.log('======================================================');

  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_USERNAME) {
    console.log('ℹ️  Reddit credentials not configured in .env.');
    return { success: false, platform: 'Reddit', skipped: true, reason: 'Credentials not provided in .env' };
  }

  if (isDryRun) {
    console.log(`🧪 [DRY RUN] Verifying Reddit credentials for u/${process.env.REDDIT_USERNAME}...`);
    try {
      const token = await getRedditAccessToken();
      const meRes = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': USER_AGENT,
        },
      });
      const meData = await meRes.json();
      console.log(`✅ Reddit account verified: u/${meData.name} (Karma: ${meData.total_karma || 0})`);
      return { success: true, platform: 'Reddit', dryRun: true, username: meData.name };
    } catch (err) {
      throw new Error(`Reddit verification failed: ${err.message}`);
    }
  }

  const token = await getRedditAccessToken();

  // Craft an engaging Reddit-native title (ProgrammerHumor strictly requires camelCase)
  const cleanTitle = (metadata.title || 'When Your AI Enforces Bedtime').replace(/#\w+/g, '').trim();
  let redditTitle;
  if (subreddit.toLowerCase() === 'programmerhumor') {
    const words = cleanTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
    redditTitle = words.map((w, idx) => idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  } else {
    redditTitle = cleanTitle.startsWith('[OC]') ? cleanTitle : `[OC] ${cleanTitle}`;
  }

  // If a YouTube Short or hosted video URL is present, we submit as a high-engagement link post
  const videoUrl = metadata.url || metadata.youtubeUrl || '';
  
  let submitParams;
  if (videoUrl) {
    console.log(`🔗 Submitting Link Post for URL: ${videoUrl}`);
    submitParams = new URLSearchParams({
      api_type: 'json',
      kind: 'link',
      sr: subreddit,
      title: redditTitle,
      url: videoUrl,
      resubmit: 'true',
      sendreplies: 'true',
    });
  } else {
    console.log(`📝 Submitting Text/Media Post`);
    const selftext = `${metadata.description || ''}\n\n---\n*Series: "I am AI but I am a good guy" (3D animated developer comedy)*`;
    submitParams = new URLSearchParams({
      api_type: 'json',
      kind: 'self',
      sr: subreddit,
      title: redditTitle,
      text: selftext,
      sendreplies: 'true',
    });
  }

  const submitRes = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: submitParams.toString(),
  });

  const submitData = await submitRes.json();
  const postInfo = submitData.json?.data;

  if (submitData.json?.errors?.length > 0) {
    const errDetails = JSON.stringify(submitData.json.errors);
    throw new Error(`Reddit submission error: ${errDetails}`);
  }

  const postUrl = postInfo?.url || `https://reddit.com${postInfo?.permalink || ''}`;
  const postId = postInfo?.name || postInfo?.id;
  console.log(`\n🎉 PHASE 2 SHORT SUBMITTED TO REDDIT!`);
  console.log(`🔗 Reddit Post: ${postUrl}\n`);

  // Auto-post top discussion comment
  let commentId = null;
  const commentText = metadata.pinnedComment || 
    `Original 3D animated short from our channel **"I am AI but I am a good guy"** 🤖\n\n` +
    `Watch on YouTube Shorts: ${videoUrl || 'https://youtube.com/@iamaibutiamagoodguy'}\n` +
    `Follow on Instagram: https://instagram.com/the.goodguy.ai\n\n` +
    `*Be honest: how many of you have experienced this exact conversation?* 👇`;

  if (postId) {
    try {
      const commParams = new URLSearchParams({
        api_type: 'json',
        thing_id: postId,
        text: commentText,
      });

      const commRes = await fetch('https://oauth.reddit.com/api/comment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: commParams.toString(),
      });
      const commData = await commRes.json();
      commentId = commData.json?.data?.things?.[0]?.data?.id;
      console.log(`💬 Top discussion comment posted to Reddit!`);
    } catch (commErr) {
      console.warn(`⚠️ Reddit comment error:`, commErr.message);
    }
  }

  return {
    success: true,
    platform: 'Reddit',
    postId,
    url: postUrl,
    commentId,
  };
}

if (process.argv[1] && process.argv[1].endsWith('publish_reddit.js')) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const subIdx = args.indexOf('--sub');
  const subreddit = subIdx !== -1 ? args[subIdx + 1] : 'ProgrammerHumor';

  uploadPhase2ToReddit(
    'out/relatable_reels/the_ai_forces_the_dev_to_step_outside_an_reel.mp4',
    {
      title: 'Solar Flare Panic ☀️🤖',
      description: 'An AI forces its screen-addicted human outside for a mandatory vitamin D patch update.',
      url: 'https://youtube.com/shorts/Mm1UcR8IWf4',
      pinnedComment: 'Be honest: when was the last time you saw actual sunlight without blue light glasses? ☀️🕶️',
    },
    { dryRun, subreddit }
  ).then(console.log).catch(console.error);
}
