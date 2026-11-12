/**
 * Automated Topic-Specific B-Roll & Visual Asset Downloader
 * 
 * Automatically fetches real, topic-matching video footage or high-resolution
 * cinematic imagery for each scene based on Gemini search queries.
 * 
 * Supports:
 * 1. Pexels Videos API (if PEXELS_API_KEY is present in env)
 * 2. Keyless Wikimedia Commons High-Res Imagery API (100% free fallback)
 * 3. Graceful fallback to rich procedural visual textures if offline
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CURRENT_SHORT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'current_short.json');
const BROLL_DIR = path.join(PROJECT_ROOT, 'public', 'broll');
const MANIFEST_PATH = path.join(BROLL_DIR, 'manifest.json');
const DATA_MANIFEST_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'broll_manifest.json');

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://commons.wikimedia.org/',
      'Accept': '*/*',
    };
    const request = https.get(url, { headers }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function fetchPexelsVideo(query) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=1&size=medium`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.videos && data.videos.length > 0) {
      const videoFiles = data.videos[0].video_files;
      // Find best portrait HD file
      const best = videoFiles.find((f) => f.width <= 1080 && f.height <= 1920 && f.link) || videoFiles[0];
      return best?.link || null;
    }
  } catch (e) {
    console.warn(`[Pexels] Query "${query}" failed:`, e.message);
  }
  return null;
}

async function fetchUnsplashPhoto(query) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const cleanQuery = query.replace(/[^\w\s-]/g, ' ').trim();
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cleanQuery)}&orientation=portrait&per_page=3`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    });
    if (!res.ok) {
      console.warn(`[Unsplash] HTTP ${res.status} for "${query}"`);
      return null;
    }
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      return photo.urls?.regular || photo.urls?.full || null;
    }
  } catch (e) {
    console.warn(`[Unsplash] Query "${query}" failed:`, e.message);
  }
  return null;
}

async function fetchWikimediaImage(query) {
  try {
    const cleanQuery = query.replace(/[^\w\s-]/g, ' ').trim();
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(cleanQuery)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime`;
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'DataDetectiveShorts/1.0 (https://github.com/Animus004/Passive_income_test_kit; test@example.com)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (pages) {
      for (const key of Object.keys(pages)) {
        const info = pages[key]?.imageinfo?.[0];
        if (info && info.url && (info.mime === 'image/jpeg' || info.mime === 'image/png')) {
          // Avoid tiny SVGs or icons, prefer photos
          return info.url;
        }
      }
    }
  } catch (e) {
    console.warn(`[Wikimedia] Query "${query}" failed:`, e.message);
  }
  return null;
}

async function main() {
  if (!fs.existsSync(BROLL_DIR)) {
    fs.mkdirSync(BROLL_DIR, { recursive: true });
  }

  let shortData = {};
  if (fs.existsSync(CURRENT_SHORT_PATH)) {
    try {
      shortData = JSON.parse(fs.readFileSync(CURRENT_SHORT_PATH, 'utf-8'));
    } catch (e) {}
  }

  const topic = shortData.topic || 'Deep Sea Technology';
  const queries = shortData.mediaQueries || [
    `${topic} technology`,
    `${topic} hardware`,
    `${topic} science`,
  ];

  console.log('====================================================');
  console.log('🎬 AUTOMATED TOPIC B-ROLL & VISUAL MEDIA FETCHER');
  console.log('====================================================');
  console.log(`🎯 Topic: "${topic}"`);
  console.log(`🔍 Media Queries:`, queries);

  const manifest = {
    updatedAt: new Date().toISOString(),
    topic,
    scenes: {},
  };

  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 1200));
    }
    const sceneNum = i + 1;
    const query = queries[i] || `${topic} real`;
    console.log(`\n[Scene ${sceneNum}] Searching media for: "${query}"...`);

    let downloaded = false;

    // 1. Try Pexels Video
    const videoUrl = await fetchPexelsVideo(query);
    if (videoUrl) {
      const destFile = path.join(BROLL_DIR, `scene${sceneNum}.mp4`);
      try {
        console.log(`  ▶️ Downloading Pexels HD video...`);
        await downloadFile(videoUrl, destFile);
        manifest.scenes[`scene${sceneNum}`] = {
          type: 'video',
          file: `broll/scene${sceneNum}.mp4`,
          query,
        };
        downloaded = true;
        console.log(`  ✅ Saved video to public/broll/scene${sceneNum}.mp4`);
      } catch (err) {
        console.warn(`  ⚠️ Pexels download failed, falling back to image:`, err.message);
      }
    }

    // 2. Try Unsplash High-Definition Photo
    if (!downloaded) {
      const unsplashUrl = await fetchUnsplashPhoto(query);
      if (unsplashUrl) {
        const destFile = path.join(BROLL_DIR, `scene${sceneNum}.jpg`);
        try {
          console.log(`  📷 Downloading Unsplash cinematic photo...`);
          await downloadFile(unsplashUrl, destFile);
          manifest.scenes[`scene${sceneNum}`] = {
            type: 'image',
            file: `broll/scene${sceneNum}.jpg`,
            query,
            source: 'unsplash',
          };
          downloaded = true;
          console.log(`  ✅ Saved Unsplash image to public/broll/scene${sceneNum}.jpg`);
        } catch (err) {
          console.warn(`  ⚠️ Unsplash download failed, falling back to Wikimedia:`, err.message);
        }
      }
    }

    // 3. Try Wikimedia High-Res Photo if Unsplash not found
    if (!downloaded) {
      const imgUrl = await fetchWikimediaImage(query);
      if (imgUrl) {
        const destFile = path.join(BROLL_DIR, `scene${sceneNum}.jpg`);
        try {
          console.log(`  📷 Downloading Wikimedia high-res photo...`);
          await downloadFile(imgUrl, destFile);
          manifest.scenes[`scene${sceneNum}`] = {
            type: 'image',
            file: `broll/scene${sceneNum}.jpg`,
            query,
            source: 'wikimedia',
          };
          downloaded = true;
          console.log(`  ✅ Saved image to public/broll/scene${sceneNum}.jpg`);
        } catch (err) {
          console.warn(`  ⚠️ Wikimedia download failed:`, err.message);
        }
      }
    }

    if (!downloaded) {
      console.log(`  ℹ️ Using high-energy procedural graphics for Scene ${sceneNum}`);
      manifest.scenes[`scene${sceneNum}`] = {
        type: 'procedural',
        query,
      };
    }
  }

  const manifestStr = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(MANIFEST_PATH, manifestStr, 'utf-8');
  fs.writeFileSync(DATA_MANIFEST_PATH, manifestStr, 'utf-8');
  console.log(`\n💾 Saved B-roll manifest to ${MANIFEST_PATH} and ${DATA_MANIFEST_PATH}`);
  console.log('====================================================\n');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ B-Roll fetcher failed:', err);
    // Don't halt the pipeline if B-roll fails; procedural fallback handles it
    process.exit(0);
  });
}

module.exports = { main };
