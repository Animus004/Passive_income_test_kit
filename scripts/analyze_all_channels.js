import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const META_PHASE2_PATH = path.join(PROJECT_ROOT, 'meta_phase2.json');

async function getYouTubeAnalytics(tokenFile, secretFile, channelLabel) {
  const tokenPath = path.join(PROJECT_ROOT, tokenFile);
  const secretPath = path.join(PROJECT_ROOT, secretFile);

  if (!fs.existsSync(tokenPath) || !fs.existsSync(secretPath)) {
    return { error: `Missing credentials for ${channelLabel}` };
  }

  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const secretData = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
  const creds = secretData.installed || secretData.web;

  const client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris?.[0] || 'http://localhost:3000'
  );
  client.setCredentials(tokens);

  // Auto refresh
  if (tokens.refresh_token && (!tokens.expiry_date || tokens.expiry_date < Date.now() + 60000)) {
    try {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);
      fs.writeFileSync(tokenPath, JSON.stringify({ ...tokens, ...credentials }, null, 2));
    } catch (e) {
      // ignore
    }
  }

  const youtube = google.youtube({ version: 'v3', auth: client });

  const chRes = await youtube.channels.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    mine: true
  });

  if (!chRes.data.items || chRes.data.items.length === 0) {
    return { error: `No channel found for ${channelLabel}` };
  }

  const ch = chRes.data.items[0];
  const uploadsPlaylistId = ch.contentDetails.relatedPlaylists.uploads;

  // Fetch recent videos from uploads playlist
  const plRes = await youtube.playlistItems.list({
    part: ['snippet', 'contentDetails'],
    playlistId: uploadsPlaylistId,
    maxResults: 25
  });

  const videoIds = (plRes.data.items || []).map(i => i.contentDetails.videoId).filter(Boolean);
  let videos = [];

  if (videoIds.length > 0) {
    const vRes = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: videoIds.join(',')
    });

    videos = (vRes.data.items || []).map(v => {
      const stats = v.statistics || {};
      const views = parseInt(stats.viewCount || '0', 10);
      const likes = parseInt(stats.likeCount || '0', 10);
      const comments = parseInt(stats.commentCount || '0', 10);
      return {
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        views,
        likes,
        comments,
        url: `https://youtube.com/shorts/${v.id}`,
        engagementRate: views > 0 ? (((likes + comments) / views) * 100).toFixed(2) + '%' : '0%'
      };
    });
  }

  // Sort by views descending
  const topByViews = [...videos].sort((a, b) => b.views - a.views);

  const totalViews = parseInt(ch.statistics.viewCount || '0', 10);
  const totalVideos = parseInt(ch.statistics.videoCount || '0', 10);
  const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

  return {
    platform: 'YouTube',
    label: channelLabel,
    title: ch.snippet.title,
    customUrl: ch.snippet.customUrl || '',
    subscribers: parseInt(ch.statistics.subscriberCount || '0', 10),
    totalViews,
    totalVideos,
    avgViews,
    topVideos: topByViews.slice(0, 5),
    recentVideos: videos.slice(0, 10)
  };
}

async function getInstagramAnalytics(userId, accessToken, label) {
  if (!userId || !accessToken) {
    return { error: `Missing credentials for Instagram (${label})` };
  }

  try {
    const userRes = await fetch(
      `https://graph.facebook.com/v21.0/${userId}?fields=id,username,name,followers_count,follows_count,media_count,profile_picture_url&access_token=${accessToken}`
    );
    const userData = await userRes.json();

    if (userData.error) {
      return { error: `IG error: ${userData.error.message}` };
    }

    // Fetch recent media
    const mediaRes = await fetch(
      `https://graph.facebook.com/v21.0/${userId}/media?fields=id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count&limit=15&access_token=${accessToken}`
    );
    const mediaData = await mediaRes.json();
    const mediaList = (mediaData.data || []).map(m => ({
      id: m.id,
      caption: (m.caption || '').substring(0, 80).replace(/\n/g, ' '),
      type: m.media_product_type || m.media_type,
      likes: m.like_count || 0,
      comments: m.comments_count || 0,
      timestamp: m.timestamp,
      permalink: m.permalink
    }));

    const totalLikes = mediaList.reduce((acc, m) => acc + (m.likes || 0), 0);
    const totalComments = mediaList.reduce((acc, m) => acc + (m.comments || 0), 0);

    return {
      platform: 'Instagram',
      label,
      username: userData.username,
      name: userData.name,
      followers: userData.followers_count,
      following: userData.follows_count,
      totalMedia: userData.media_count,
      recentMediaCount: mediaList.length,
      sampleTotalLikes: totalLikes,
      sampleTotalComments: totalComments,
      recentMedia: mediaList
    };
  } catch (err) {
    return { error: `IG network error: ${err.message}` };
  }
}

async function getFacebookAnalytics(pageId, pageToken, label) {
  if (!pageId || !pageToken) {
    return { error: `Missing credentials for Facebook (${label})` };
  }

  try {
    const pageRes = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}?fields=id,name,followers_count,fan_count,link&access_token=${pageToken}`
    );
    const pageData = await pageRes.json();

    if (pageData.error) {
      return { error: `FB error: ${pageData.error.message}` };
    }

    // Fetch recent published posts
    let posts = [];
    try {
      const postsRes = await fetch(
        `https://graph.facebook.com/v21.0/${pageId}/posts?fields=id,message,created_time,shares,permalink_url&limit=10&access_token=${pageToken}`
      );
      const postsData = await postsRes.json();
      posts = (postsData.data || []).map(p => ({
        id: p.id,
        message: (p.message || '').substring(0, 80).replace(/\n/g, ' '),
        createdTime: p.created_time,
        shares: p.shares ? p.shares.count : 0,
        permalink: p.permalink_url
      }));
    } catch (e) {}

    return {
      platform: 'Facebook',
      label,
      pageName: pageData.name,
      pageId: pageData.id,
      followers: pageData.followers_count || 0,
      fans: pageData.fan_count || 0,
      recentPosts: posts
    };
  } catch (err) {
    return { error: `FB network error: ${err.message}` };
  }
}

async function runFullAnalysis() {
  console.log('Fetching live performance data across all Phase 1 & Phase 2 channels...\n');

  let metaP2 = {};
  if (fs.existsSync(META_PHASE2_PATH)) {
    try {
      metaP2 = JSON.parse(fs.readFileSync(META_PHASE2_PATH, 'utf8'));
    } catch (e) {}
  }

  const results = {
    generatedAt: new Date().toISOString(),
    phase1: {},
    phase2: {}
  };

  // Phase 1 Channels
  console.log('Querying Phase 1 YouTube...');
  results.phase1.youtube = await getYouTubeAnalytics('tokens.json', 'client_secret.json', 'Phase 1 - Focus Fuel Shorts');

  console.log('Querying Phase 1 Instagram...');
  results.phase1.instagram = await getInstagramAnalytics(
    process.env.INSTAGRAM_USER_ID,
    process.env.INSTAGRAM_ACCESS_TOKEN,
    'Phase 1 - Instagram'
  );

  console.log('Querying Phase 1 Facebook...');
  results.phase1.facebook = await getFacebookAnalytics(
    process.env.FACEBOOK_PAGE_ID,
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    'Phase 1 - Facebook Page'
  );

  // Phase 2 Channels
  console.log('Querying Phase 2 YouTube...');
  results.phase2.youtube = await getYouTubeAnalytics('tokens_phase2.json', 'client_secret_phase2.json', 'Phase 2 - I am AI but I am a good guy');

  console.log('Querying Phase 2 Instagram...');
  const p2_ig_id = metaP2.instagram?.userId || process.env.PHASE2_INSTAGRAM_USER_ID;
  const p2_ig_token = metaP2.instagram?.userToken || process.env.PHASE2_INSTAGRAM_ACCESS_TOKEN;
  results.phase2.instagram = await getInstagramAnalytics(p2_ig_id, p2_ig_token, 'Phase 2 - @the.goodguy.ai');

  console.log('Querying Phase 2 Facebook...');
  const p2_fb_id = metaP2.facebook?.pageId || process.env.PHASE2_FACEBOOK_PAGE_ID;
  const p2_fb_token = metaP2.facebook?.pageToken || process.env.PHASE2_FACEBOOK_PAGE_ACCESS_TOKEN;
  results.phase2.facebook = await getFacebookAnalytics(p2_fb_id, p2_fb_token, 'Phase 2 - I am AI but I am GooD GuY');

  // Save report to data/full_channels_analysis.json
  const outPath = path.join(PROJECT_ROOT, 'data', 'full_channels_analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  console.log('\nAnalysis complete! Saved to data/full_channels_analysis.json');
  return results;
}

runFullAnalysis()
  .then(res => {
    console.log(JSON.stringify(res, null, 2));
  })
  .catch(err => {
    console.error('Fatal analysis error:', err);
  });
