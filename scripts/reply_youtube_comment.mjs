import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

async function replyComment(parentId, text) {
  const tokens = JSON.parse(fs.readFileSync('tokens_phase2.json', 'utf8'));
  const secretData = JSON.parse(fs.readFileSync('client_secret_phase2.json', 'utf8'));
  const creds = secretData.web || secretData.installed;

  const client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris?.[0] || 'http://localhost:3000'
  );
  client.setCredentials(tokens);

  const youtube = google.youtube({ version: 'v3', auth: client });

  const res = await youtube.comments.insert({
    part: 'snippet',
    requestBody: {
      snippet: {
        parentId: parentId,
        textOriginal: text
      }
    }
  });

  console.log("Successfully posted reply:", res.data.snippet.textOriginal);
}

// Parent ID for KeeratiNoimontree comment: UgxOEZYupJPMVtwsWC14AaABAg
replyComment('UgxOEZYupJPMVtwsWC14AaABAg', 'He prefers "Senior Floating AI Debug Consultant" but at 3 AM he answers to Octopus too 🐙😭').catch(console.error);
