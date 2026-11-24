import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

async function checkPhase2YT() {
  const tokenPath = 'tokens_phase2.json';
  const secretPath = 'client_secret_phase2.json';
  if (!fs.existsSync(tokenPath) || !fs.existsSync(secretPath)) {
    console.log("Tokens not found");
    return;
  }
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const secretData = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
  const creds = secretData.web || secretData.installed;

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
  console.log(`Channel: ${ch.snippet.title} (Subs: ${ch.statistics.subscriberCount}, Views: ${ch.statistics.viewCount})`);

  const uploadsId = ch.contentDetails.relatedPlaylists.uploads;
  const plRes = await youtube.playlistItems.list({
    part: 'snippet,contentDetails',
    playlistId: uploadsId,
    maxResults: 5
  });

  for (const item of plRes.data.items) {
    const videoId = item.contentDetails.videoId;
    const title = item.snippet.title;
    console.log(`\nVideo [${videoId}]: ${title}`);

    try {
      const commentRes = await youtube.commentThreads.list({
        part: 'snippet,replies',
        videoId: videoId,
        maxResults: 20
      });

      if (commentRes.data.items && commentRes.data.items.length > 0) {
        for (const thread of commentRes.data.items) {
          const top = thread.snippet.topLevelComment.snippet;
          console.log(`  💬 @${top.authorDisplayName}: "${top.textDisplay}" (ID: ${thread.id})`);
          if (thread.replies?.comments) {
            for (const r of thread.replies.comments) {
              console.log(`     ↳ Reply from @${r.snippet.authorDisplayName}: "${r.snippet.textDisplay}"`);
            }
          }
        }
      } else {
        console.log("  (No comments yet)");
      }
    } catch (err) {
      console.log(`  (Comments disabled or error: ${err.message})`);
    }
  }
}

checkPhase2YT().catch(console.error);
