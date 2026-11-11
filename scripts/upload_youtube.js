/**
 * Automated YouTube Shorts Uploader using YouTube Data API v3 & OAuth 2.0
 * Features:
 * - Automatic local loopback server (http://localhost:3000) for instant 1-click browser sign-in
 * - Fallback to terminal manual code entry
 * - Token caching in tokens.json
 * - Interactive Client ID / Secret prompt if client_secret.json is missing
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const readline = require('readline');
const { exec } = require('child_process');
const { google } = require('googleapis');
require('dotenv').config();

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;
const TOKEN_PATH = path.resolve(__dirname, '..', 'tokens.json');

function findClientSecretFiles() {
  const rootSecret = path.resolve(__dirname, '..', 'client_secret.json');
  if (fs.existsSync(rootSecret)) {
    return [rootSecret];
  }
  const searchDirs = [
    path.resolve(__dirname, '..'),
    path.resolve(__dirname),
    path.join(process.env.USERPROFILE || 'C:\\Users\\sayan', 'Downloads'),
  ];
  const found = [];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.toLowerCase().startsWith('client_secret') && file.toLowerCase().endsWith('.json')) {
            found.push(path.join(dir, file));
          }
        }
      } catch (e) {}
    }
  }
  return found;
}

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

/**
 * Loads OAuth2 credentials from client_secret.json, environment, or interactive prompt
 */
async function getOAuth2Client() {
  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let redirectUri = REDIRECT_URI;

  // Check file if env vars not provided
  const candidateSecrets = findClientSecretFiles();
  for (const secretPath of candidateSecrets) {
    if (fs.existsSync(secretPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
        const creds = content.installed || content.web;
        if (creds) {
          clientId = creds.client_id;
          clientSecret = creds.client_secret;
          console.log(`🔑 Automatically loaded credentials from: ${secretPath}`);
          break;
        }
      } catch (err) {
        console.warn(`⚠️ Warning: could not parse ${secretPath}:`, err.message);
      }
    }
  }

  // If still missing, guide user interactively
  if (!clientId || !clientSecret) {
    console.log('\n=============================================================');
    console.log('⚠️ GOOGLE OAUTH 2.0 CLIENT CREDENTIALS REQUIRED');
    console.log('=============================================================');
    console.log('To upload directly to your YouTube channel via the YouTube API:');
    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials');
    console.log('2. Create or select a project and enable "YouTube Data API v3".');
    console.log('3. Click "Create Credentials" -> "OAuth client ID" -> "Desktop app" (or "Web application").');
    console.log('   (Add authorized redirect URI: http://localhost:3000/oauth2callback)');
    console.log('4. Download the JSON and save it as "client_secret.json" in this project folder.\n');

    const promptChoice = await question('Do you want to paste your Client ID and Secret right now? (y/N): ');
    if (promptChoice.toLowerCase() === 'y') {
      clientId = await question('Paste Client ID: ');
      clientSecret = await question('Paste Client Secret: ');
      if (clientId && clientSecret) {
        // Save to .env for future runs
        const envContent = `GOOGLE_CLIENT_ID=${clientId}\nGOOGLE_CLIENT_SECRET=${clientSecret}\nGOOGLE_REDIRECT_URI=${redirectUri}\n`;
        fs.writeFileSync(path.resolve(__dirname, '..', '.env'), envContent);
        console.log('💾 Credentials saved to .env!');
      }
    }
  }

  if (!clientId || !clientSecret) {
    console.error('\n❌ Upload paused: Please place "client_secret.json" in the project folder and re-run.');
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Authorizes the OAuth2 client using cached tokens or automatic local server browser redirect
 */
async function authorize(oauth2Client) {
  // Check if cached tokens.json exists
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oauth2Client.setCredentials(token);
      console.log('✅ Found cached tokens.json. Authentication active.');

      oauth2Client.on('tokens', (refreshedTokens) => {
        const merged = { ...token, ...refreshedTokens };
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
        console.log('🔄 Access token refreshed and saved to tokens.json');
      });

      return oauth2Client;
    } catch (err) {
      console.warn('⚠️ Corrupted tokens.json. Re-authenticating...');
    }
  }

  // Setup loopback local server to automatically capture the callback code
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const parsedUrl = new url.URL(req.url, `http://localhost:${PORT}`);
        const code = parsedUrl.searchParams.get('code');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding-top: 60px; background: #0b0f19; color: white;">
                <h1 style="color: #22c55e; font-size: 32px;">✅ Authentication Successful!</h1>
                <p style="font-size: 18px; color: #94a3b8;">You can close this tab now. The video upload will proceed in your terminal.</p>
              </body>
            </html>
          `);

          server.close();

          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
          console.log(`\n✅ Authorization successful! Tokens cached to tokens.json`);
          resolve(oauth2Client);
        } else if (req.url === '/' || req.url === '/favicon.ico') {
          // Ignore root ping or favicon
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Authentication failed: No code returned');
          server.close();
          reject(new Error('No code returned from OAuth callback'));
        }
      } catch (e) {
        server.close();
        reject(e);
      }
    });

    server.listen(PORT, () => {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });

      console.log('\n=============================================================');
      console.log('🔐 YOUTUBE OAUTH 2.0 AUTHORIZATION REQUIRED');
      console.log('=============================================================');
      console.log('1. Click or open this authorization URL in your browser:');
      console.log('\n' + authUrl + '\n');
      console.log('2. Sign in and grant access to your YouTube channel.');
      console.log('3. Once authorized, Google will redirect back to localhost automatically.');
      console.log('=============================================================\n');

      try {
        const startCmd = process.platform === 'win32' ? `start "" "${authUrl}"` :
                         process.platform === 'darwin' ? `open "${authUrl}"` : `xdg-open "${authUrl}"`;
        exec(startCmd);
      } catch (e) {}
    });

    server.on('error', (err) => {
      console.warn('Loopback server error, falling back to manual entry:', err.message);
      // Fallback to manual entry
      const fallbackUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });
      console.log('Open URL:', fallbackUrl);
      question('Paste code here: ').then(async (code) => {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        resolve(oauth2Client);
      }).catch(reject);
    });
  });
}

/**
 * Uploads video to YouTube
 */
async function uploadVideo(options = {}) {
  const videoPath = options.videoPath || path.resolve(__dirname, '..', 'out', 'final_short.mp4');
  const privacyStatus = options.privacyStatus || process.env.YOUTUBE_PRIVACY_STATUS || 'private';

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found at: ${videoPath}. Please render the short first.`);
  }

  const oauth2Client = await getOAuth2Client();
  if (!oauth2Client) {
    return;
  }

  await authorize(oauth2Client);

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const fileSize = fs.statSync(videoPath).size;

  const title = options.title || "99% Of The Internet Is At The Bottom Of The Ocean! 🌊🦈 #Shorts #Tech";
  const description = options.description || 
    "Did you know 99% of all international internet traffic doesn't travel through space or satellites, but through thin glass cables resting on the ocean floor?\n\n" +
    "Over 800,000 miles of fiber-optic cables lie underwater, carrying every video, bank transfer, and email across continents. " +
    "These deep-sea cables face constant danger from underwater earthquakes, ship anchors, and even sharks biting through the outer rubber!\n\n" +
    "Subscribe for daily mind-blowing tech secrets and cyber facts!\n\n" +
    "#Shorts #Tech #Internet #Ocean #Technology #Facts #Science #CyberSecurity";
  
  const tags = options.tags || ["Shorts", "Tech", "Internet", "Ocean", "Technology", "Facts", "Science", "Cables", "CyberSecurity"];

  console.log('\n🚀 Starting YouTube Upload:');
  console.log(`   File: ${videoPath} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`   Title: ${title}`);
  console.log(`   Privacy: ${privacyStatus.toUpperCase()}`);
  console.log(`   Tags: ${tags.join(', ')}`);

  const res = await youtube.videos.insert(
    {
      part: ['snippet', 'status'],
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId: '28', // Science & Technology
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en',
        },
        status: {
          privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    },
    {
      onUploadProgress: (evt) => {
        const progress = (evt.bytesRead / fileSize) * 100;
        process.stdout.write(`\rUploading to YouTube: ${progress.toFixed(1)}% complete...`);
      },
    }
  );

  console.log('\n\n🎉 UPLOAD COMPLETE!');
  console.log(`   Video ID: ${res.data.id}`);
  console.log(`   Video URL: https://youtu.be/${res.data.id}`);
  console.log(`   Shorts URL: https://youtube.com/shorts/${res.data.id}`);
  console.log(`   Status: ${privacyStatus.toUpperCase()} (ready for your review in YouTube Studio)`);

  return res.data;
}

// Allow CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let videoPath = path.resolve(__dirname, '..', 'out', 'final_short.mp4');
  let privacyStatus = 'private';
  let authOnly = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--privacy' && args[i + 1]) {
      privacyStatus = args[i + 1];
      i++;
    } else if (args[i] === '--auth-only') {
      authOnly = true;
    } else if (!args[i].startsWith('--')) {
      videoPath = path.resolve(args[i]);
    }
  }

  if (authOnly) {
    (async () => {
      const client = await getOAuth2Client();
      if (client) {
        await authorize(client);
        console.log('\n🎉 Authentication setup successful! New tokens cached in tokens.json.');
        process.exit(0);
      }
    })().catch((err) => {
      console.error('\n❌ Authentication setup failed:', err.message);
      process.exit(1);
    });
  } else {
    uploadVideo({ videoPath, privacyStatus })
      .catch((err) => {
        console.error('\n❌ Upload failed:', err.message);
        process.exit(1);
      });
  }
}

module.exports = { uploadVideo, authorize, getOAuth2Client };
