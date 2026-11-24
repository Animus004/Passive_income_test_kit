import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const metaConfig = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'meta_phase2.json'), 'utf8'));
const igToken = metaConfig.instagram?.userToken || process.env.PHASE2_INSTAGRAM_ACCESS_TOKEN;
const igUserId = metaConfig.instagram?.userId || process.env.PHASE2_INSTAGRAM_USER_ID;
const pageToken = metaConfig.facebook?.pageToken || process.env.PHASE2_FACEBOOK_PAGE_ACCESS_TOKEN;
const pageId = metaConfig.facebook?.pageId || process.env.PHASE2_FACEBOOK_PAGE_ID;

async function checkDMs() {
  console.log('Querying Instagram inbox conversations...');
  
  // Try endpoint 1: igUserId /conversations
  try {
    const res1 = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/conversations?fields=id,updated_time,participants,messages{id,message,created_time,from}&access_token=${igToken}`
    );
    const data1 = await res1.json();
    console.log('IG Endpoint 1 result:', JSON.stringify(data1, null, 2));
  } catch (e) {
    console.error('Error endpoint 1:', e.message);
  }

  // Try endpoint 2: pageId /conversations?platform=instagram
  try {
    const res2 = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/conversations?platform=instagram&fields=id,updated_time,participants,messages{id,message,created_time,from}&access_token=${pageToken}`
    );
    const data2 = await res2.json();
    console.log('Page Endpoint 2 result:', JSON.stringify(data2, null, 2));
  } catch (e) {
    console.error('Error endpoint 2:', e.message);
  }
}

checkDMs();
