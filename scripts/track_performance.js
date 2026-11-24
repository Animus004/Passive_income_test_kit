/**
 * YouTube Channel Performance & Engagement Tracker
 * Queries live metrics from YouTube Data API v3:
 * - Channel-level stats (subscribers, total views, total videos)
 * - Per-video metrics (views, likes, comments, publishedAt)
 * - Identifies top-performing topics and themes to adapt future generation
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TOKENS_PATH = path.join(PROJECT_ROOT, 'tokens.json');
const CLIENT_SECRET_PATH = path.join(PROJECT_ROOT, 'client_secret.json');
const STATS_OUTPUT = path.join(PROJECT_ROOT, 'data', 'channel_analytics.json');

async function getChannelAnalytics() {
  if (!fs.existsSync(TOKENS_PATH) || !fs.existsSync(CLIENT_SECRET_PATH)) {
    throw new Error('Missing tokens.json or client_secret.json');
  }

  const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
  const csRaw = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8'));
  const cs = csRaw.installed || csRaw.web;

  const oauth2Client = new google.auth.OAuth2(cs.client_id, cs.client_secret, cs.redirect_uris[0]);
  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  console.log('📊 Fetching YouTube Channel Statistics...');
  const channelRes = await youtube.channels.list({
    part: ['snippet', 'contentDetails', 'statistics'],
    mine: true,
  });

  if (!channelRes.data.items || channelRes.data.items.length === 0) {
    throw new Error('No channel found for current credentials.');
  }

  const channel = channelRes.data.items[0];
  const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

  console.log(`\n====================================================`);
  console.log(`📺 Channel: "${channel.snippet.title}" (@${channel.snippet.customUrl || 'unknown'})`);
  console.log(`👥 Subscribers: ${channel.statistics.subscriberCount}`);
  console.log(`👁️ Total Views: ${channel.statistics.viewCount}`);
  console.log(`🎬 Total Videos: ${channel.statistics.videoCount}`);
  console.log(`====================================================\n`);

  // Fetch recent 20 uploads from uploads playlist
  const playlistRes = await youtube.playlistItems.list({
    part: ['snippet'],
    playlistId: uploadsPlaylistId,
    maxResults: 20,
  });

  const items = playlistRes.data.items || [];
  const videoIds = items.map((it) => it.snippet.resourceId.videoId).filter(Boolean);

  if (videoIds.length === 0) {
    console.log('No uploaded videos found in playlist.');
    return;
  }

  const videoRes = await youtube.videos.list({
    part: ['snippet', 'statistics'],
    id: videoIds,
  });

  const videos = (videoRes.data.items || []).map((v) => {
    const stats = v.statistics || {};
    return {
      videoId: v.id,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      views: parseInt(stats.viewCount || '0', 10),
      likes: parseInt(stats.likeCount || '0', 10),
      comments: parseInt(stats.commentCount || '0', 10),
      url: `https://youtube.com/shorts/${v.id}`,
    };
  });

  // Sort by views descending
  videos.sort((a, b) => b.views - a.views);

  console.log('🏆 Top Performing Shorts by Views:');
  videos.forEach((v, idx) => {
    console.log(`  #${idx + 1} [${v.views} views, ${v.likes} likes] "${v.title}"`);
    console.log(`     Link: ${v.url}`);
  });

  // Extract winning topic clusters and patterns
  const totalTrackedViews = videos.reduce((acc, v) => acc + v.views, 0);
  const avgViews = videos.length > 0 ? Math.round(totalTrackedViews / videos.length) : 0;

  const topPerformers = videos.filter((v) => v.views >= avgViews);

  const report = {
    updatedAt: new Date().toISOString(),
    channelTitle: channel.snippet.title,
    subscribers: parseInt(channel.statistics.subscriberCount, 10),
    totalChannelViews: parseInt(channel.statistics.viewCount, 10),
    totalVideos: parseInt(channel.statistics.videoCount, 10),
    averageViewsPerShort: avgViews,
    topPerformers,
    recentVideos: videos,
  };

  const dataDir = path.dirname(STATS_OUTPUT);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(STATS_OUTPUT, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\n💾 Saved detailed analytics to ${STATS_OUTPUT}`);
  return report;
}

if (require.main === module) {
  getChannelAnalytics().catch((err) => {
    console.error('❌ Failed to fetch analytics:', err);
    process.exit(1);
  });
}

module.exports = { getChannelAnalytics };

