import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

import { google } from 'googleapis';

async function checkAnalytics() {
  const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
  const secretData = JSON.parse(fs.readFileSync('client_secret.json', 'utf8'));
  const creds = secretData.installed || secretData.web;

  const client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris?.[0] || 'http://localhost:3000'
  );
  client.setCredentials(tokens);

  const youtube = google.youtube({ version: 'v3', auth: client });

  const chRes = await youtube.channels.list({
    part: 'snippet,statistics,contentDetails',
    mine: true
  });

  const ch = chRes.data.items[0];
  console.log("=================================================");
  console.log("📊 REAL-TIME YOUTUBE CHANNEL METRICS");
  console.log("=================================================");
  console.log(`Channel Title : ${ch.snippet.title}`);
  console.log(`Subscribers   : ${ch.statistics.subscriberCount}`);
  console.log(`Total Views   : ${ch.statistics.viewCount}`);
  console.log(`Total Videos  : ${ch.statistics.videoCount}`);

  // Fetch recent uploads
  const uploadsPlaylistId = ch.contentDetails.relatedPlaylists.uploads;
  const plRes = await youtube.playlistItems.list({
    part: 'snippet,contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: 15
  });

  const videoIds = plRes.data.items.map(i => i.contentDetails.videoId);
  const vRes = await youtube.videos.list({
    part: 'snippet,statistics',
    id: videoIds.join(',')
  });

  console.log("\n📈 RECENT 15 UPLOADS PERFORMANCE:");
  console.log("-------------------------------------------------");
  for (const v of vRes.data.items) {
    const views = String(v.statistics.viewCount).padStart(5, ' ');
    const likes = String(v.statistics.likeCount || 0).padStart(3, ' ');
    const comments = String(v.statistics.commentCount || 0).padStart(2, ' ');
    const date = v.snippet.publishedAt.substring(0, 16).replace('T', ' ');
    console.log(`[${views} views | ${likes} 👍 | ${comments} 💬] (${date}) ${v.snippet.title}`);
  }
  console.log("=================================================\n");
}

checkAnalytics().catch(console.error);
