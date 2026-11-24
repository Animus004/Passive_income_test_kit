import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const TOKEN_PATH = path.join(PROJECT_ROOT, 'tokens.json');
const SECRET_PATH = path.join(PROJECT_ROOT, 'client_secret.json');

const YT_VIDEO_ID = 's09Z8UNSfMA';
const IG_MEDIA_ID = '18089911469329503';
const FB_VIDEO_ID = '942045205508727';

async function getYouTubeClient() {
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  const secretData = JSON.parse(fs.readFileSync(SECRET_PATH, 'utf8'));
  const creds = secretData.web || secretData.installed;

  const oauth2Client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris?.[0] || 'http://localhost:3000'
  );
  oauth2Client.setCredentials(tokens);

  if (tokens.refresh_token && (!tokens.expiry_date || tokens.expiry_date < Date.now() + 60000)) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...tokens, ...credentials }, null, 2));
  }
  return oauth2Client;
}

async function deleteMorningVideos() {
  console.log('🗑️ [REMOVAL] Deleting old morning video from all 3 platforms...');

  // 1. YouTube Delete
  try {
    const authClient = await getYouTubeClient();
    const youtube = google.youtube({ version: 'v3', auth: authClient });
    console.log(`⏳ Deleting YouTube Short: ${YT_VIDEO_ID}...`);
    await youtube.videos.delete({ id: YT_VIDEO_ID });
    console.log(`✅ [YOUTUBE] Successfully deleted video ${YT_VIDEO_ID}!`);
  } catch (err) {
    console.error(`⚠️ [YOUTUBE DELETE ERROR]:`, err.message || err);
  }

  // 2. Instagram Delete
  const igToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (igToken) {
    try {
      console.log(`⏳ Deleting Instagram Reel: ${IG_MEDIA_ID}...`);
      const res = await fetch(`https://graph.facebook.com/v21.0/${IG_MEDIA_ID}?access_token=${igToken}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log(`✅ [INSTAGRAM] Response:`, data);
    } catch (err) {
      console.error(`⚠️ [INSTAGRAM DELETE ERROR]:`, err.message || err);
    }
  }

  // 3. Facebook Delete
  const fbToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (fbToken) {
    try {
      console.log(`⏳ Deleting Facebook Reel: ${FB_VIDEO_ID}...`);
      const res = await fetch(`https://graph.facebook.com/v21.0/${FB_VIDEO_ID}?access_token=${fbToken}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log(`✅ [FACEBOOK] Response:`, data);
    } catch (err) {
      console.error(`⚠️ [FACEBOOK DELETE ERROR]:`, err.message || err);
    }
  }

  console.log('🏁 Old morning videos removal complete.');
}

deleteMorningVideos();
