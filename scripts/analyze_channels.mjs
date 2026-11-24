import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const clientSecretPath = 'D:/New folder (2)/client_secret.json';
const tokens1Path = 'D:/New folder (2)/tokens.json';
const tokens2Path = 'D:/New folder (2)/tokens_phase2.json';

const clientSecret = JSON.parse(fs.readFileSync(clientSecretPath, 'utf8'));
const creds = clientSecret.installed || clientSecret.web;

async function analyzeChannel(tokenFile, label) {
    console.log(`\n======================================================`);
    console.log(`Analyzing: ${label} (${tokenFile})`);
    console.log(`======================================================`);
    
    if (!fs.existsSync(tokenFile)) {
        console.log(`Token file not found: ${tokenFile}`);
        return null;
    }

    const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
    const oauth2Client = new google.auth.OAuth2(
        creds.client_id,
        creds.client_secret,
        'http://localhost:3000'
    );
    oauth2Client.setCredentials(tokens);

    // Refresh token if needed
    oauth2Client.on('tokens', (newTokens) => {
        const merged = { ...tokens, ...newTokens };
        fs.writeFileSync(tokenFile, JSON.stringify(merged, null, 2));
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
        // 1. Get Channel Info
        const chRes = await youtube.channels.list({
            part: ['snippet', 'statistics', 'contentDetails'],
            mine: true
        });

        if (!chRes.data.items || chRes.data.items.length === 0) {
            console.log("No channel found for these credentials.");
            return null;
        }

        const ch = chRes.data.items[0];
        const snippet = ch.snippet;
        const stats = ch.statistics;
        const uploadsPlaylistId = ch.contentDetails.relatedPlaylists.uploads;

        console.log(`Channel Title:       ${snippet.title}`);
        console.log(`Custom URL / Handle: ${snippet.customUrl || 'N/A'}`);
        console.log(`Channel ID:          ${ch.id}`);
        console.log(`Published At:        ${snippet.publishedAt}`);
        console.log(`Subscribers:         ${stats.subscriberCount} (hidden: ${stats.hiddenSubscriberCount})`);
        console.log(`Total Views:         ${stats.viewCount}`);
        console.log(`Total Videos:        ${stats.videoCount}`);
        console.log(`Uploads Playlist:    ${uploadsPlaylistId}`);

        // 2. Fetch Latest Uploaded Videos (up to 25)
        const plRes = await youtube.playlistItems.list({
            part: ['snippet', 'contentDetails'],
            playlistId: uploadsPlaylistId,
            maxResults: 25
        });

        const videoItems = plRes.data.items || [];
        console.log(`\nFound ${videoItems.length} videos in Uploads playlist:`);

        const videoIds = videoItems.map(v => v.contentDetails.videoId);
        let detailedVideos = [];

        if (videoIds.length > 0) {
            const vRes = await youtube.videos.list({
                part: ['snippet', 'statistics', 'contentDetails'],
                id: videoIds
            });
            detailedVideos = vRes.data.items || [];
        }

        const reportVideos = detailedVideos.map((v, idx) => {
            const vs = v.snippet;
            const vt = v.statistics;
            console.log(`\n  #${idx + 1} [${v.id}] ${vs.title}`);
            console.log(`     Published: ${vs.publishedAt}`);
            console.log(`     Views: ${vt.viewCount || 0} | Likes: ${vt.likeCount || 0} | Comments: ${vt.commentCount || 0}`);
            console.log(`     Duration: ${v.contentDetails.duration}`);
            console.log(`     Tags: ${(vs.tags || []).slice(0, 5).join(', ')}`);
            return {
                id: v.id,
                title: vs.title,
                publishedAt: vs.publishedAt,
                views: parseInt(vt.viewCount || 0, 10),
                likes: parseInt(vt.likeCount || 0, 10),
                comments: parseInt(vt.commentCount || 0, 10),
                duration: v.contentDetails.duration,
                tags: vs.tags || [],
                description: vs.description
            };
        });

        return {
            label,
            channel: {
                id: ch.id,
                title: snippet.title,
                customUrl: snippet.customUrl,
                publishedAt: snippet.publishedAt,
                subscribers: parseInt(stats.subscriberCount || 0, 10),
                totalViews: parseInt(stats.viewCount || 0, 10),
                totalVideos: parseInt(stats.videoCount || 0, 10)
            },
            videos: reportVideos
        };

    } catch (err) {
        console.error(`Error querying YouTube API for ${label}:`, err.message);
        return null;
    }
}

async function main() {
    const res1 = await analyzeChannel(tokens1Path, 'Phase 1 Channel');
    const res2 = await analyzeChannel(tokens2Path, 'Phase 2 Channel');

    const outData = {
        timestamp: new Date().toISOString(),
        phase1: res1,
        phase2: res2
    };

    const outPath = 'D:/New folder (2)/data/channel_deep_analysis.json';
    fs.writeFileSync(outPath, JSON.stringify(outData, null, 2));
    console.log(`\nSaved analysis data to: ${outPath}`);
}

main();
