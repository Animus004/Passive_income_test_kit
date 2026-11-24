/**
 * Phase 2 Dedicated YouTube Channel Authenticator
 * Generates tokens_phase2.json for the new Phase 2 channel
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import url from 'url';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const SECRET_PATH = path.join(PROJECT_ROOT, 'client_secret_phase2.json');
const TOKEN_PATH = path.join(PROJECT_ROOT, 'tokens_phase2.json');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
];

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;

async function main() {
  console.log('===============================================================');
  console.log('🎬 PHASE 2 YOUTUBE CHANNEL AUTHENTICATOR');
  console.log('===============================================================\n');

  if (!fs.existsSync(SECRET_PATH)) {
    throw new Error(`client_secret_phase2.json not found at: ${SECRET_PATH}`);
  }

  const secretData = JSON.parse(fs.readFileSync(SECRET_PATH, 'utf8'));
  const creds = secretData.web || secretData.installed;

  const oauth2Client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('🔑 Starting local authentication listener on http://localhost:3000 ...');
  console.log('\n👉 PLEASE CLICK OR OPEN THIS URL IN YOUR BROWSER TO SIGN IN:');
  console.log('---------------------------------------------------------------');
  console.log(authUrl);
  console.log('---------------------------------------------------------------\n');

  // Try to open automatically in default browser
  const startCmd = process.platform === 'win32' ? `start "" "${authUrl}"` : `open "${authUrl}"`;
  exec(startCmd, () => {});

  const server = http.createServer(async (req, res) => {
    try {
      const parsedUrl = url.parse(req.url, true);
      const code = parsedUrl.query.code;

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <div style="font-family:sans-serif; text-align:center; padding:50px; background:#0f172a; color:#f8fafc; min-height:100vh;">
            <h1 style="color:#38bdf8;">🎉 Phase 2 YouTube Channel Connected!</h1>
            <p style="font-size:18px;">Authentication tokens have been saved securely. You can close this tab now.</p>
          </div>
        `);

        console.log('📥 Authorization code received! Exchanging for tokens...');
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log(`💾 Saved credentials to: ${TOKEN_PATH}`);

        // Verify connected channel info
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const chRes = await youtube.channels.list({
          part: 'snippet,statistics',
          mine: true,
        });

        if (chRes.data.items && chRes.data.items.length > 0) {
          const ch = chRes.data.items[0];
          console.log('\n===============================================================');
          console.log('✅ CONNECTED PHASE 2 YOUTUBE CHANNEL:');
          console.log(`📌 Title       : ${ch.snippet.title}`);
          console.log(`🆔 Channel ID  : ${ch.id}`);
          console.log(`👥 Subscribers : ${ch.statistics.subscriberCount}`);
          console.log('===============================================================\n');
        } else {
          console.log('✅ Tokens verified! (Channel may not have videos yet)');
        }

        server.close();
        process.exit(0);
      }
    } catch (err) {
      console.error('❌ Authentication callback error:', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Authentication error: ' + err.message);
    }
  });

  server.listen(PORT, () => {
    console.log(`🎧 Listening on ${REDIRECT_URI} for OAuth callback...`);
  });
}

main().catch(console.error);
