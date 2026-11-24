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

async function checkComments() {
  console.log('Fetching media on Instagram for @the.goodguy.ai...');
  const mRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media?fields=id,caption,permalink,comments_count&access_token=${igToken}`
  );
  const mData = await mRes.json();

  if (mData.error) {
    console.error('IG Error:', mData.error);
    return;
  }

  for (const m of (mData.data || [])) {
    console.log(`\n======================================================`);
    console.log(`Reel ID: ${m.id}`);
    console.log(`Caption: ${m.caption?.slice(0, 50)}...`);
    console.log(`Comments Count: ${m.comments_count}`);
    console.log(`Link: ${m.permalink}`);
    console.log(`------------------------------------------------------`);

    const cRes = await fetch(
      `https://graph.facebook.com/v21.0/${m.id}/comments?fields=id,text,username,timestamp,like_count,replies{id,text,username,timestamp,like_count}&access_token=${igToken}`
    );
    const cData = await cRes.json();
    if (cData.data && cData.data.length > 0) {
      for (const c of cData.data) {
        console.log(`💬 @${c.username || 'unknown'} (${c.timestamp}): "${c.text}" (Likes: ${c.like_count || 0}, ID: ${c.id})`);
        if (c.replies?.data) {
          for (const rep of c.replies.data) {
            console.log(`   ↳ Reply from @${rep.username || 'unknown'} (${rep.timestamp}): "${rep.text}" (Likes: ${rep.like_count || 0}, ID: ${rep.id})`);
          }
        }
      }
    } else {
      console.log('No comments found on this post.');
    }
  }
}

checkComments();
