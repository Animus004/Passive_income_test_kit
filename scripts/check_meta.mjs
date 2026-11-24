import dotenv from 'dotenv';
dotenv.config();

const igUserId = process.env.PHASE2_INSTAGRAM_USER_ID;
const igToken = process.env.PHASE2_INSTAGRAM_ACCESS_TOKEN;
const fbPageId = process.env.PHASE2_FACEBOOK_PAGE_ID;
const fbToken = process.env.PHASE2_FACEBOOK_PAGE_ACCESS_TOKEN;

async function check() {
  if (igUserId && igToken) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${igUserId}?fields=id,username,name,followers_count,media_count&access_token=${igToken}`);
      const data = await res.json();
      console.log('--- Phase 2 Instagram ---', data);
      
      const mRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media?fields=id,caption,media_product_type,like_count,comments_count,timestamp,permalink&limit=15&access_token=${igToken}`);
      const mData = await mRes.json();
      const media = mData.data || [];
      console.log(`Latest Media: ${media.length} items`);
      for (const m of media) {
        console.log(`  - [${m.like_count} likes, ${m.comments_count} cmts] (${m.timestamp.substring(0, 10)}) ${(m.caption || '').substring(0, 60).replace(/\n/g, ' ')}...`);
      }
    } catch (e) {
      console.log('IG Error:', e.message);
    }
  }

  if (fbPageId && fbToken) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${fbPageId}?fields=id,name,followers_count,fan_count&access_token=${fbToken}`);
      const data = await res.json();
      console.log('\n--- Phase 2 Facebook ---', data);
    } catch (e) {
      console.log('FB Error:', e.message);
    }
  }
}

check();
