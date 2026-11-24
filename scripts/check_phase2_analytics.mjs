import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const TOKEN_PATH = path.join(PROJECT_ROOT, 'tokens_phase2.json');
const SECRET_PATH = path.join(PROJECT_ROOT, 'client_secret_phase2.json');
const META_PHASE2_PATH = path.join(PROJECT_ROOT, 'meta_phase2.json');

async function getYouTubeClient() {
  if (!fs.existsSync(TOKEN_PATH) || !fs.existsSync(SECRET_PATH)) {
    throw new Error('Phase 2 YouTube credentials not found.');
  }

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  const secretData = JSON.parse(fs.readFileSync(SECRET_PATH, 'utf8'));
  const creds = secretData.web || secretData.installed;

  const client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris?.[0] || 'http://localhost:3000'
  );
  client.setCredentials(tokens);

  // Proactively refresh if expiring or expired
  if (tokens.refresh_token && (!tokens.expiry_date || tokens.expiry_date < Date.now() + 60000)) {
    try {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...tokens, ...credentials }, null, 2));
    } catch (e) {
      console.warn('⚠️ Token refresh warning:', e.message);
    }
  }

  return google.youtube({ version: 'v3', auth: client });
}

async function checkYouTube() {
  console.log('======================================================================');
  console.log('🔴 YOUTUBE SHORTS ANALYTICS ("I am AI but I am a good guy")');
  console.log('======================================================================');
  try {
    const youtube = await getYouTubeClient();
    const chRes = await youtube.channels.list({
      part: 'snippet,statistics,contentDetails',
      mine: true,
    });

    const ch = chRes.data.items?.[0];
    if (!ch) {
      console.log('⚠️ No YouTube channel found for Phase 2 tokens.');
      return;
    }

    console.log(`Channel Name  : ${ch.snippet.title}`);
    console.log(`Channel ID    : ${ch.id}`);
    console.log(`Subscribers   : ${ch.statistics.subscriberCount}`);
    console.log(`Total Views   : ${ch.statistics.viewCount}`);
    console.log(`Total Videos  : ${ch.statistics.videoCount}`);

    const uploadsPlaylistId = ch.contentDetails.relatedPlaylists.uploads;
    const plRes = await youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 25,
    });

    const videoIds = (plRes.data.items || []).map(i => i.contentDetails.videoId);
    if (videoIds.length === 0) {
      console.log('No uploads found.');
      return;
    }

    const vRes = await youtube.videos.list({
      part: 'snippet,statistics,status',
      id: videoIds.join(','),
    });

    console.log('\n📊 UPLOADS BREAKDOWN:');
    console.log('--------------------------------------------------------------------------------------------------');
    console.log('Views | Likes | Comments | Published Date      | Status  | URL / Title');
    console.log('--------------------------------------------------------------------------------------------------');
    for (const v of vRes.data.items) {
      const views = String(v.statistics.viewCount || 0).padStart(5, ' ');
      const likes = String(v.statistics.likeCount || 0).padStart(5, ' ');
      const comments = String(v.statistics.commentCount || 0).padStart(3, ' ');
      const date = (v.snippet.publishedAt || '').substring(0, 16).replace('T', ' ');
      const privacy = (v.status.privacyStatus || 'public').padEnd(7, ' ');
      const title = v.snippet.title;
      const url = `https://youtube.com/shorts/${v.id}`;
      console.log(` ${views} | ${likes} |   ${comments}    | ${date} | ${privacy} | ${url}`);
      console.log(`       └─ "${title}"`);
    }
  } catch (err) {
    console.error('❌ YouTube Analytics Error:', err.message);
  }
}

async function checkInstagram() {
  console.log('\n======================================================================');
  console.log('📸 INSTAGRAM REELS ANALYTICS (@the.goodguy.ai)');
  console.log('======================================================================');
  if (!fs.existsSync(META_PHASE2_PATH)) {
    console.log('⚠️ meta_phase2.json not found.');
    return;
  }

  const meta = JSON.parse(fs.readFileSync(META_PHASE2_PATH, 'utf8'));
  const { userId, userToken, username } = meta.instagram || {};
  if (!userId || !userToken) {
    console.log('⚠️ Instagram credentials missing in meta_phase2.json.');
    return;
  }

  try {
    // 1. Get User Details
    const userUrl = `https://graph.facebook.com/v21.0/${userId}?fields=name,username,followers_count,media_count&access_token=${userToken}`;
    const userResp = await fetch(userUrl);
    const userData = await userResp.json();
    if (userData.error) {
      console.log('⚠️ Instagram API Error:', userData.error.message);
      return;
    }

    console.log(`Account Name  : ${userData.name || 'N/A'} (@${userData.username || username})`);
    console.log(`Followers     : ${userData.followers_count ?? 'N/A'}`);
    console.log(`Media Count   : ${userData.media_count ?? 'N/A'}`);

    // 2. Get Recent Media
    const mediaUrl = `https://graph.facebook.com/v21.0/${userId}/media?fields=id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count&limit=15&access_token=${userToken}`;
    const mediaResp = await fetch(mediaUrl);
    const mediaData = await mediaResp.json();

    if (!mediaData.data || mediaData.data.length === 0) {
      console.log('No Instagram media found.');
      return;
    }

    console.log('\n📊 RECENT INSTAGRAM POSTS / REELS:');
    console.log('--------------------------------------------------------------------------------------------------');
    console.log('Likes | Comments | Plays/Reach | Published Date      | Media ID            | Permalink');
    console.log('--------------------------------------------------------------------------------------------------');

    for (const item of mediaData.data) {
      const likes = String(item.like_count || 0).padStart(5, ' ');
      const comments = String(item.comments_count || 0).padStart(3, ' ');
      const date = (item.timestamp || '').substring(0, 16).replace('T', ' ');
      const cleanCap = (item.caption || '').split('\n')[0].substring(0, 50);

      // Try fetching insights for reels
      let playsReach = 'N/A';
      try {
        const insUrl = `https://graph.facebook.com/v21.0/${item.id}/insights?metric=plays,reach,total_interactions&access_token=${userToken}`;
        const insResp = await fetch(insUrl);
        const insData = await insResp.json();
        if (insData.data) {
          const plays = insData.data.find(d => d.name === 'plays')?.values?.[0]?.value || 0;
          const reach = insData.data.find(d => d.name === 'reach')?.values?.[0]?.value || 0;
          playsReach = `${plays}p / ${reach}r`;
        }
      } catch (e) { }

      console.log(` ${likes} |   ${comments}    | ${playsReach.padStart(11, ' ')} | ${date} | ${item.id} | ${item.permalink}`);
      console.log(`       └─ "${cleanCap}..."`);
    }
  } catch (err) {
    console.error('❌ Instagram Analytics Error:', err.message);
  }
}

async function checkFacebook() {
  console.log('\n======================================================================');
  console.log('📘 FACEBOOK PAGE REELS ANALYTICS ("I am AI but I am GooD GuY")');
  console.log('======================================================================');
  if (!fs.existsSync(META_PHASE2_PATH)) return;

  const meta = JSON.parse(fs.readFileSync(META_PHASE2_PATH, 'utf8'));
  const { pageId, pageToken, pageName } = meta.facebook || {};
  if (!pageId || !pageToken) {
    console.log('⚠️ Facebook credentials missing in meta_phase2.json.');
    return;
  }

  try {
    const pageUrl = `https://graph.facebook.com/v21.0/${pageId}?fields=name,followers_count,fan_count&access_token=${pageToken}`;
    const pageResp = await fetch(pageUrl);
    const pageData = await pageResp.json();

    console.log(`Page Name     : ${pageData.name || pageName}`);
    console.log(`Followers     : ${pageData.followers_count ?? 'N/A'}`);
    console.log(`Likes / Fans  : ${pageData.fan_count ?? 'N/A'}`);

    const feedUrl = `https://graph.facebook.com/v21.0/${pageId}/published_posts?fields=id,message,created_time,permalink_url&limit=10&access_token=${pageToken}`;
    const feedResp = await fetch(feedUrl);
    const feedData = await feedResp.json();

    if (feedData.data && feedData.data.length > 0) {
      console.log('\n📊 RECENT FACEBOOK POSTS:');
      console.log('--------------------------------------------------------------------------------------------------');
      for (const p of feedData.data) {
        const date = (p.created_time || '').substring(0, 16).replace('T', ' ');
        const cleanMsg = (p.message || '').split('\n')[0].substring(0, 60);
        console.log(`[${date}] ID: ${p.id} | ${p.permalink_url || 'N/A'}`);
        console.log(`       └─ "${cleanMsg}..."`);
      }
    }
  } catch (err) {
    console.error('❌ Facebook Analytics Error:', err.message);
  }
}

async function main() {
  await checkYouTube();
  await checkInstagram();
  await checkFacebook();
  console.log('\n======================================================================\n');
}

main();
