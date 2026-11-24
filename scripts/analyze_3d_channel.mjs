import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const secretPath = 'D:/New folder (2)/client_secret_phase2.json';
const tokenPath = 'D:/New folder (2)/tokens_phase2.json';
const metaPath = 'D:/New folder (2)/meta_phase2.json';

async function analyze3DYouTube() {
    console.log("=================================================");
    console.log("🎬 1. YOUTUBE 3D CHANNEL: 'I am AI but I am a good guy'");
    console.log("=================================================");

    if (!fs.existsSync(secretPath) || !fs.existsSync(tokenPath)) {
        console.log("Credentials missing for Phase 2 YouTube.");
        return null;
    }

    const secretData = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
    const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const creds = secretData.web || secretData.installed;

    const oauth2Client = new google.auth.OAuth2(
        creds.client_id,
        creds.client_secret,
        creds.redirect_uris?.[0] || 'http://localhost:3000'
    );
    oauth2Client.setCredentials(tokens);

    oauth2Client.on('tokens', (newTokens) => {
        const merged = { ...tokens, ...newTokens };
        fs.writeFileSync(tokenPath, JSON.stringify(merged, null, 2));
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
        const chRes = await youtube.channels.list({
            part: ['snippet', 'statistics', 'contentDetails'],
            mine: true
        });

        if (!chRes.data.items || chRes.data.items.length === 0) {
            console.log("No channel found for Phase 2.");
            return null;
        }

        const ch = chRes.data.items[0];
        console.log(`Channel Title : ${ch.snippet.title}`);
        console.log(`Handle/URL    : ${ch.snippet.customUrl || 'N/A'}`);
        console.log(`Channel ID    : ${ch.id}`);
        console.log(`Subscribers   : ${ch.statistics.subscriberCount}`);
        console.log(`Total Views   : ${ch.statistics.viewCount}`);
        console.log(`Total Videos  : ${ch.statistics.videoCount}`);

        const uploadsId = ch.contentDetails.relatedPlaylists.uploads;
        const plRes = await youtube.playlistItems.list({
            part: ['snippet', 'contentDetails'],
            playlistId: uploadsId,
            maxResults: 25
        });

        const vItems = plRes.data.items || [];
        console.log(`\nUploaded 3D Videos Count: ${vItems.length}`);

        const vIds = vItems.map(v => v.contentDetails.videoId);
        let videoList = [];
        if (vIds.length > 0) {
            const vRes = await youtube.videos.list({
                part: ['snippet', 'statistics', 'contentDetails'],
                id: vIds
            });
            videoList = vRes.data.items || [];
        }

        for (const [idx, v] of videoList.entries()) {
            const st = v.statistics;
            console.log(`\n  #${idx + 1} [${v.id}] ${v.snippet.title}`);
            console.log(`     Published: ${v.snippet.publishedAt}`);
            console.log(`     Views: ${st.viewCount || 0} | Likes: ${st.likeCount || 0} | Comments: ${st.commentCount || 0}`);
            console.log(`     Duration: ${v.contentDetails.duration}`);
            console.log(`     URL: https://youtube.com/shorts/${v.id}`);
        }

        return {
            channel: {
                id: ch.id,
                title: ch.snippet.title,
                customUrl: ch.snippet.customUrl,
                subscribers: parseInt(ch.statistics.subscriberCount || 0, 10),
                totalViews: parseInt(ch.statistics.viewCount || 0, 10),
                totalVideos: parseInt(ch.statistics.videoCount || 0, 10)
            },
            videos: videoList.map(v => ({
                id: v.id,
                title: v.snippet.title,
                publishedAt: v.snippet.publishedAt,
                views: parseInt(v.statistics.viewCount || 0, 10),
                likes: parseInt(v.statistics.likeCount || 0, 10),
                comments: parseInt(v.statistics.commentCount || 0, 10),
                duration: v.contentDetails.duration,
                url: `https://youtube.com/shorts/${v.id}`
            }))
        };
    } catch (e) {
        console.error("YouTube 3D Query Error:", e.message);
        return null;
    }
}

async function analyze3DMeta() {
    console.log("\n=================================================");
    console.log("📸 2. META 3D CHANNELS: Instagram & Facebook");
    console.log("=================================================");

    if (!fs.existsSync(metaPath)) {
        console.log("meta_phase2.json not found.");
        return null;
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

    // Instagram: @the.goodguy.ai
    let igData = null;
    if (meta.instagram && meta.instagram.userId && meta.instagram.userToken) {
        try {
            const uRes = await fetch(`https://graph.facebook.com/v21.0/${meta.instagram.userId}?fields=id,username,name,followers_count,follows_count,media_count,biography&access_token=${meta.instagram.userToken}`);
            const user = await uRes.json();
            if (!user.error) {
                console.log(`\nInstagram: @${user.username} ("${user.name}")`);
                console.log(`Followers : ${user.followers_count}`);
                console.log(`Media Count: ${user.media_count}`);
                console.log(`Bio: ${user.biography || 'N/A'}`);

                const mRes = await fetch(`https://graph.facebook.com/v21.0/${meta.instagram.userId}/media?fields=id,caption,media_product_type,like_count,comments_count,timestamp,permalink&limit=15&access_token=${meta.instagram.userToken}`);
                const mJson = await mRes.json();
                const media = mJson.data || [];
                console.log(`Recent Media count: ${media.length}`);
                for (const [idx, m] of media.entries()) {
                    console.log(`  #${idx + 1} [${m.like_count} likes, ${m.comments_count} cmts] (${m.timestamp.substring(0, 10)}) ${m.permalink}`);
                    console.log(`     Caption: ${(m.caption || '').substring(0, 80).replace(/\n/g, ' ')}...`);
                }
                igData = { profile: user, media };
            } else {
                console.log("Instagram API response error:", user.error.message);
            }
        } catch (e) {
            console.log("Instagram Error:", e.message);
        }
    }

    // Facebook: I am AI but I am GooD GuY
    let fbData = null;
    if (meta.facebook && meta.facebook.pageId && meta.facebook.pageToken) {
        try {
            const pRes = await fetch(`https://graph.facebook.com/v21.0/${meta.facebook.pageId}?fields=id,name,followers_count,fan_count,link&access_token=${meta.facebook.pageToken}`);
            const page = await pRes.json();
            if (!page.error) {
                console.log(`\nFacebook Page: "${page.name}" (ID: ${page.id})`);
                console.log(`Followers: ${page.followers_count} | Fans: ${page.fan_count}`);
                console.log(`Link: ${page.link}`);
                fbData = page;
            } else {
                console.log("Facebook API error:", page.error.message);
            }
        } catch (e) {
            console.log("Facebook Error:", e.message);
        }
    }

    return { instagram: igData, facebook: fbData };
}

async function main() {
    const yt = await analyze3DYouTube();
    const meta = await analyze3DMeta();

    const output = {
        timestamp: new Date().toISOString(),
        youtube: yt,
        meta: meta
    };

    fs.writeFileSync('D:/New folder (2)/data/channel_3d_deep_analysis.json', JSON.stringify(output, null, 2));
    console.log("\nSaved 3D Channel Analysis to: D:/New folder (2)/data/channel_3d_deep_analysis.json");
}

main();
