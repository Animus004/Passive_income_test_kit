/**
 * Automated Topic-Specific B-Roll & Visual Asset Downloader
 * 
 * Automatically fetches real, topic-matching video footage or high-resolution
 * cinematic imagery for each scene based on Gemini search queries.
 * 
 * Multi-Tier Media Pipeline:
 * 1. Coverr Stock Video API (Free 1080p MP4 loops & footage)
 * 2. Pexels Videos API (if PEXELS_API_KEY is present)
 * 3. NASA Open Archive API (keyless space/tech imagery & footage)
 * 4. Unsplash High-Definition Cinematic Photos
 * 5. Wikimedia Commons Technical & Historical Imagery (keyless open archive)
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
const MEDIA_HISTORY_PATH = path.join(PROJECT_ROOT, 'data', 'media_history.json');

function loadMediaHistory() {
  if (fs.existsSync(MEDIA_HISTORY_PATH)) {
    try {
      return new Set(JSON.parse(fs.readFileSync(MEDIA_HISTORY_PATH, 'utf-8')));
    } catch (e) {}
  }
  return new Set();
}

const mediaHistory = loadMediaHistory();

function recordMediaUse(idOrUrl) {
  if (!idOrUrl) return;
  mediaHistory.add(String(idOrUrl));
  try {
    fs.writeFileSync(MEDIA_HISTORY_PATH, JSON.stringify(Array.from(mediaHistory), null, 2), 'utf-8');
  } catch (e) {}
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const isWikimedia = url.includes('wikimedia.org');
    const headers = isWikimedia
      ? {
          'User-Agent': 'FocusFuelEduDoc/1.0 (https://youtube.com/@DataDetective; animus@datadetective.com)',
          'Accept': 'image/*,*/*',
        }
      : {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://coverr.co/',
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

const NOISE_WORDS = new Set([
  'exterior', 'interior', 'crack', 'box', 'shot', 'view', 'aerial', 'clip',
  'footage', 'real', 'action', 'macro', 'background', 'wide', 'closeup', 'angle',
  'video', 'image', 'photo', 'picture', 'scene', 'visual', 'texture', 'concept',
]);

const IRRELEVANT_TITLE_WORDS = [
  'dog', 'cat', 'puppy', 'pet', 'fashion', 'model', 'posing',
  'street', 'textile', 'pattern', 'fabric', 'portrait', 'dance', 'dancing',
  'workout', 'fitness', 'clothing', 'dress', 'makeup', 'party', 'bar', 'club', 'hotel', 'popcorn',
];

function isRelevantHit(title, queryWords = []) {
  if (!title) return true;
  const lower = title.toLowerCase();
  for (const bad of IRRELEVANT_TITLE_WORDS) {
    if (lower.includes(bad)) {
      const userAskedForIt = queryWords.some((w) => w.toLowerCase().includes(bad));
      if (!userAskedForIt) {
        return false;
      }
    }
  }
  return true;
}

function buildSmartCandidates(query, topic) {
  const cleanTopic = (topic || '').replace(/[^\w\s-]/g, ' ').trim();
  const cleanWords = query
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const meaningfulWords = cleanWords.filter((w) => !NOISE_WORDS.has(w.toLowerCase()));

  const candidates = [];
  // 1. Full meaningful query (e.g. "svalbard seed vault", "barren dry farmland")
  if (meaningfulWords.length >= 2) {
    candidates.push(meaningfulWords.join(' '));
  } else if (cleanWords.length >= 2) {
    candidates.push(cleanWords.join(' '));
  }

  // 2. Query combined with topic anchor (e.g. "svalbard seed vault dry farmland")
  if (cleanTopic && meaningfulWords.length > 0) {
    const topicKeywords = cleanTopic.split(/\s+/).slice(0, 3).join(' ');
    candidates.push(`${topicKeywords} ${meaningfulWords.slice(0, 2).join(' ')}`.trim());
  }

  // 3. Meaningful 2-word phrase
  if (meaningfulWords.length >= 2) {
    candidates.push(meaningfulWords.slice(0, 2).join(' '));
    candidates.push(meaningfulWords.slice(-2).join(' '));
  }

  // 4. Topic core alone (e.g. "svalbard seed vault" or "arctic bunker")
  if (cleanTopic) {
    candidates.push(cleanTopic);
  }

  // Deduplicate and strictly ensure candidates are multi-word phrases and not noise words
  return Array.from(new Set(candidates)).filter(
    (c) => c && c.length >= 4 && !NOISE_WORDS.has(c.toLowerCase()) && c.includes(' ')
  );
}

async function fetchCoverrVideo(query, topic = '') {
  const apiKey = process.env.COVERR_API_KEY;
  if (!apiKey) return null;

  const candidates = buildSmartCandidates(query, topic);

  for (const q of candidates) {
    try {
      const url = `https://api.coverr.co/videos?query=${encodeURIComponent(q)}&page_size=5`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.hits && data.hits.length > 0) {
        // Pick the first hit that hasn't been used yet and is strictly relevant to the scene
        const hit = data.hits.find((h) => {
          const u = h.urls?.mp4 || `https://cdn.coverr.co/videos/${h.base_filename}/1080p.mp4`;
          const title = h.title || '';
          return !mediaHistory.has(u) && isRelevantHit(title, q.split(/\s+/));
        });

        if (hit) {
          const videoUrl = hit.urls?.mp4 || `https://cdn.coverr.co/videos/${hit.base_filename}/1080p.mp4`;
          recordMediaUse(videoUrl);
          console.log(`  [Coverr] Found strictly relevant stock video for "${q}": "${hit.title}"`);
          return videoUrl;
        }
      }
    } catch (e) {
      console.warn(`[Coverr] Query "${q}" failed:`, e.message);
    }
  }
  return null;
}

async function fetchPexelsVideo(query, topic = '') {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const candidates = buildSmartCandidates(query, topic);

  for (const q of candidates) {
    try {
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&orientation=portrait&per_page=5&size=medium`;
      const res = await fetch(url, {
        headers: { Authorization: apiKey },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        const vid = data.videos.find((v) => !mediaHistory.has(String(v.id))) || data.videos[0];
        recordMediaUse(String(vid.id));
        const videoFiles = vid.video_files || [];
        const best = videoFiles.find((f) => f.width <= 1080 && f.height <= 1920 && f.link) || videoFiles[0];
        if (best?.link) {
          console.log(`  [Pexels] Found stock video footage for "${q}"`);
          return best.link;
        }
      }
    } catch (e) {
      console.warn(`[Pexels] Query "${q}" failed:`, e.message);
    }
  }
  return null;
}

async function fetchNasaMedia(query) {
  try {
    const isRelevant = /space|satellite|earth|ocean|planet|orbit|nasa|telescope|starlink|vacuum|gravity|laser|solar|science|arctic|physics|vault|seed/i.test(query);
    if (!isRelevant) return null;

    const cleanWords = query.replace(/[^\w\s-]/g, ' ').trim().split(/\s+/).filter(Boolean);
    const searchTerms = [cleanWords.join(' '), cleanWords.slice(0, 2).join(' ')];

    for (const term of searchTerms) {
      // 1. Try NASA authentic Video Archive first
      try {
        const vidUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(term)}&media_type=video`;
        const vidRes = await fetch(vidUrl);
        if (vidRes.ok) {
          const vidData = await vidRes.json();
          const items = vidData?.collection?.items;
          if (items && items.length > 0) {
            const item = items[0];
            const manifestUrl = item.href;
            if (manifestUrl) {
              const manifestRes = await fetch(manifestUrl);
              if (manifestRes.ok) {
                const files = await manifestRes.json();
                const mp4Files = Array.isArray(files) ? files.filter((f) => typeof f === 'string' && f.endsWith('.mp4')) : [];
                const chosen = mp4Files.find((f) => f.includes('~medium.mp4') || f.includes('~large.mp4') || f.includes('~orig.mp4')) || mp4Files[0];
                if (chosen) {
                  const secureUrl = chosen.startsWith('http://') ? chosen.replace('http://', 'https://') : chosen;
                  console.log(`  [NASA] Found authentic archive VIDEO for "${term}": "${item.data?.[0]?.title}"`);
                  return { url: secureUrl, type: 'video' };
                }
              }
            }
          }
        }
      } catch (vidErr) {}

      // 2. Fallback to NASA High-Res Image Archive
      const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(term)}&media_type=image`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const items = data?.collection?.items;
      if (items && items.length > 0) {
        for (const item of items.slice(0, 3)) {
          const link = item.links?.find((l) => l.render === 'image' || l.href?.endsWith('.jpg') || l.href?.endsWith('.png'));
          if (link?.href) {
            console.log(`  [NASA] Found authentic archive imagery for "${term}": "${item.data?.[0]?.title}"`);
            return { url: link.href, type: 'image' };
          }
        }
      }
    }
  } catch (e) {
    console.warn(`[NASA] Query "${query}" failed:`, e.message);
  }
  return null;
}

async function fetchUnsplashPhoto(query, topic = '') {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  const candidates = buildSmartCandidates(query, topic);

  for (const q of candidates) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&orientation=portrait&per_page=3`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const photo = data.results.find((p) => {
            const desc = `${p.description || ''} ${p.alt_description || ''}`;
            return !mediaHistory.has(p.id) && isRelevantHit(desc, q.split(/\s+/));
          });
          if (photo) {
            recordMediaUse(photo.id);
            console.log(`  [Unsplash] Found relevant photo for "${q}": "${photo.alt_description || photo.description || q}"`);
            return photo.urls?.regular || photo.urls?.full || null;
          }
        }
      }
    } catch (e) {
      console.warn(`[Unsplash] Query "${q}" error:`, e.message);
    }
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

  const cuts = shortData.cuts || shortData.scenes || [];
  const count = Math.max(cuts.length, queries.length);

  console.log('====================================================');
  console.log('🎬 AUTOMATED TOPIC B-ROLL & VISUAL MEDIA FETCHER');
  console.log('====================================================');
  console.log(`🎯 Topic: "${topic}"`);
  console.log(`🎬 Dynamic Cuts: ${count}`);

  const manifest = {
    updatedAt: new Date().toISOString(),
    topic,
    cuts: {},
    scenes: {},
  };

  for (let i = 0; i < count; i++) {
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 1200));
    }
    const cutId = i + 1;
    const cutObj = cuts[i] || {};
    const query = cutObj.visualQuery || queries[i] || `${topic} real`;
    console.log(`\n[Cut ${cutId}] Searching media for: "${query}"...`);

    let downloaded = false;

    // 1. Try Coverr Stock Video Footage (Free HD 1080p MP4)
    if (process.env.COVERR_API_KEY) {
      const coverrUrl = await fetchCoverrVideo(query, topic);
      if (coverrUrl) {
        const destFile = path.join(BROLL_DIR, `cut_${cutId}.mp4`);
        const altFile = path.join(BROLL_DIR, `cut_${cutId}.jpg`);
        try {
          console.log(`  🎥 Downloading Coverr 1080p video footage...`);
          await downloadFile(coverrUrl, destFile);
          if (fs.existsSync(altFile)) fs.unlinkSync(altFile);
          const cutEntry = {
            type: 'video',
            file: `broll/cut_${cutId}.mp4`,
            query,
            source: 'coverr',
          };
          manifest.cuts[`cut_${cutId}`] = cutEntry;
          manifest.scenes[`scene${cutId}`] = cutEntry;
          downloaded = true;
          console.log(`  ✅ Saved Coverr 1080p video to public/broll/cut_${cutId}.mp4`);
        } catch (err) {
          console.warn(`  ⚠️ Coverr video download failed:`, err.message);
        }
      }
    }

    // 2. Try Pexels Video (if PEXELS_API_KEY is configured)
    if (!downloaded && process.env.PEXELS_API_KEY) {
      const videoUrl = await fetchPexelsVideo(query, topic);
      if (videoUrl) {
        const destFile = path.join(BROLL_DIR, `cut_${cutId}.mp4`);
        const altFile = path.join(BROLL_DIR, `cut_${cutId}.jpg`);
        try {
          console.log(`  🎥 Downloading Pexels HD video footage...`);
          await downloadFile(videoUrl, destFile);
          if (fs.existsSync(altFile)) fs.unlinkSync(altFile);
          const cutEntry = {
            type: 'video',
            file: `broll/cut_${cutId}.mp4`,
            query,
            source: 'pexels',
          };
          manifest.cuts[`cut_${cutId}`] = cutEntry;
          manifest.scenes[`scene${cutId}`] = cutEntry;
          downloaded = true;
          console.log(`  ✅ Saved Pexels HD video to public/broll/cut_${cutId}.mp4`);
        } catch (err) {
          console.warn(`  ⚠️ Pexels video download failed:`, err.message);
        }
      }
    }

    // 3. Try NASA Open Archive (Keyless authentic space/earth/physics media & video)
    if (!downloaded) {
      const nasaMedia = await fetchNasaMedia(query);
      if (nasaMedia) {
        const isVid = nasaMedia.type === 'video';
        const ext = isVid ? 'mp4' : 'jpg';
        const altExt = isVid ? 'jpg' : 'mp4';
        const destFile = path.join(BROLL_DIR, `cut_${cutId}.${ext}`);
        const altFile = path.join(BROLL_DIR, `cut_${cutId}.${altExt}`);
        try {
          console.log(`  🚀 Downloading NASA authentic ${isVid ? '1080p HD VIDEO footage' : 'space/tech imagery'}...`);
          await downloadFile(nasaMedia.url, destFile);
          if (fs.existsSync(altFile)) fs.unlinkSync(altFile);
          const cutEntry = {
            type: isVid ? 'video' : 'image',
            file: `broll/cut_${cutId}.${ext}`,
            query,
            source: 'nasa',
          };
          manifest.cuts[`cut_${cutId}`] = cutEntry;
          manifest.scenes[`scene${cutId}`] = cutEntry;
          downloaded = true;
          console.log(`  ✅ Saved NASA ${isVid ? 'video footage' : 'imagery'} to public/broll/cut_${cutId}.${ext}`);
        } catch (err) {
          console.warn(`  ⚠️ NASA download failed:`, err.message);
        }
      }
    }

    // 4. Try Unsplash High-Definition Cinematic Photo
    if (!downloaded) {
      const unsplashUrl = await fetchUnsplashPhoto(query, topic);
      if (unsplashUrl) {
        const destFile = path.join(BROLL_DIR, `cut_${cutId}.jpg`);
        const altFile = path.join(BROLL_DIR, `cut_${cutId}.mp4`);
        try {
          console.log(`  📷 Downloading Unsplash cinematic photo...`);
          await downloadFile(unsplashUrl, destFile);
          if (fs.existsSync(altFile)) fs.unlinkSync(altFile);
          const cutEntry = {
            type: 'image',
            file: `broll/cut_${cutId}.jpg`,
            query,
            source: 'unsplash',
          };
          manifest.cuts[`cut_${cutId}`] = cutEntry;
          manifest.scenes[`scene${cutId}`] = cutEntry;
          downloaded = true;
          console.log(`  ✅ Saved Unsplash image to public/broll/cut_${cutId}.jpg`);
        } catch (err) {
          console.warn(`  ⚠️ Unsplash download failed, falling back to Wikimedia:`, err.message);
        }
      }
    }

    // 5. Try Wikimedia High-Res Technical/Historical Image (100% keyless fallback)
    if (!downloaded) {
      const imgUrl = await fetchWikimediaImage(query);
      if (imgUrl) {
        const destFile = path.join(BROLL_DIR, `cut_${cutId}.jpg`);
        const altFile = path.join(BROLL_DIR, `cut_${cutId}.mp4`);
        try {
          console.log(`  📷 Downloading Wikimedia high-res photo...`);
          await downloadFile(imgUrl, destFile);
          if (fs.existsSync(altFile)) fs.unlinkSync(altFile);
          const cutEntry = {
            type: 'image',
            file: `broll/cut_${cutId}.jpg`,
            query,
            source: 'wikimedia',
          };
          manifest.cuts[`cut_${cutId}`] = cutEntry;
          manifest.scenes[`scene${cutId}`] = cutEntry;
          downloaded = true;
          console.log(`  ✅ Saved Wikimedia image to public/broll/cut_${cutId}.jpg`);
        } catch (err) {
          console.warn(`  ⚠️ Wikimedia download failed:`, err.message);
        }
      }
    }

    // Mirror to legacy scene${cutId}.jpg for backward compatibility
    if (downloaded && cutId <= 5) {
      try {
        const srcJpg = path.join(BROLL_DIR, `cut_${cutId}.jpg`);
        const legacyJpg = path.join(BROLL_DIR, `scene${cutId}.jpg`);
        if (fs.existsSync(srcJpg)) {
          fs.copyFileSync(srcJpg, legacyJpg);
        }
      } catch (e) {}
    }

    if (!downloaded) {
      console.log(`  ℹ️ Using high-energy procedural graphics for Cut ${cutId}`);
      const cutEntry = {
        type: 'procedural',
        query,
      };
      manifest.cuts[`cut_${cutId}`] = cutEntry;
      manifest.scenes[`scene${cutId}`] = cutEntry;
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
