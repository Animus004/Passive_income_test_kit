/**
 * Universal Zero-Hardcode 3D Showrunner Engine
 * Powered by Gemini 2.5 Flash
 *
 * Directs full 3D episodes across ANY genre:
 * 1. "investigative_tech": Tech Giant Master Plans (Meta, Google, Nvidia, Tesla)
 * 2. "history_discovery": Ancient civilizational "Waking up 2000 years ago in X"
 * 3. "relatable_humor": Popapus everyday conversational comedy
 *
 * Dynamically outputs:
 * - Voiceover script synchronized to 4-5 cuts
 * - Exact 3D Prop IDs from our modular library
 * - 3D Floating HUD Text labels (2-3 words punchy)
 * - Camera motion rails (start XYZ, end XYZ, lookAt)
 * - Mood lighting & palette
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TOPICS_PATH = path.join(PROJECT_ROOT, 'data', 'topics.json');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'current_3d_episode.json');

function parseArgs() {
  const args = process.argv.slice(2);
  let topic = null;
  let genre = 'investigative_tech';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
      i++;
    } else if (args[i] === '--genre' && args[i + 1]) {
      genre = args[i + 1];
      i++;
    }
  }
  return { topic, genre };
}

function selectTopic(topicArg, genre) {
  if (topicArg) {
    return {
      topic: topicArg,
      genre: genre,
      hookAngle: `The hidden physical reality and extreme engineering behind ${topicArg}.`,
      isCustom: true,
    };
  }

  // Pre-configured dynamic pool
  const topicPool = [
    {
      topic: "Nvidia's $100 Billion Blackwell Superpod",
      genre: "investigative_tech",
      hookAngle: "Why Nvidia is connecting 72 GPUs with 2 miles of copper cables instead of optical fiber."
    },
    {
      topic: "Google's Project Sentry: Geothermal AI",
      genre: "investigative_tech",
      hookAngle: "How Google is tapping underground volcanic steam to power next-gen TPU v6 clusters."
    },
    {
      topic: "Waking Up 2,000 Years Ago in Ancient Alexandria",
      genre: "history_discovery",
      hookAngle: "What happens if you step out of a time machine into the Great Library in 48 BC."
    }
  ];

  const chosen = topicPool[Math.floor(Math.random() * topicPool.length)];
  return { ...chosen, isCustom: false };
}

async function generateMaster3DDirectives() {
  const { topic: customTopic, genre } = parseArgs();
  const selected = selectTopic(customTopic, genre);

  console.log('====================================================');
  console.log('🎬 UNIVERSAL 3D SHOWRUNNER: ZERO-HARDCODE DIRECTING');
  console.log('====================================================');
  console.log(`🎯 Topic: "${selected.topic}" (Genre: ${selected.genre})`);
  console.log(`💡 Hook Angle: "${selected.hookAngle}"`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing from .env');

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  const prompt = `You are the executive showrunner and visual director for an ultra-viral 3D YouTube Shorts channel modeled after cinematic tech documentaries and high-detail 3D drone storytelling.

TOPIC: "${selected.topic}"
GENRE: "${selected.genre}"
HOOK ANGLE: "${selected.hookAngle}"

DIRECTING SPECIFICATIONS:
1. TOTAL RUNTIME: 25 to 35 seconds (~750 to 1050 frames at 30fps).
2. NUMBER OF CUTS: Exactly 4 or 5 cinematic cuts.
3. BEAT SHEET:
   - Cut 1: THE REVEAL HOOK (High-altitude establishing shot, massive physical scale, huge mystery).
   - Cut 2: THE POWER SOURCE / INFRASTRUCTURE (The extreme thermal, electrical, or historical foundation).
   - Cut 3: THE COMPUTE CORE / KEY ARTIFACT (Microscopic precision, silicon die, mechanical marvel).
   - Cut 4: THE USER INTERFACE / SENSORY HARVEST (How it touches reality, lenses, eyes, human interface).
   - Cut 5: THE CLIFFHANGER / MIC-DROP CONCLUSION (The startling reality or master plan).
4. FLOATING 3D HUD TEXT:
   - Each cut MUST have a bold, punchy 2-3 word floating 3D text label (e.g. "HYPERION CAMPUS", "6.6 GIGAWATTS", "MTIA SILICON", "CONTINUOUS VIDEO", "THE MASTER PLAN").
5. CAMERA RAILS:
   - Provide dynamic drone trajectories: "dive_down", "orbital_glide", "low_sweep_up", "pullback_flyout".
6. PROPS LIBRARY:
   - Choose from our 3D prop modular engine:
     - "campus_monolith": Gigantic corporate tech campus with glowing LED louvers and logo.
     - "cooling_tower": Hyperboloid nuclear reactor cooling tower with glowing thermal rim.
     - "semiconductor_wafer": Gold-rimmed silicon chip die with illuminated logic cores.
     - "smart_glasses": Ray-Ban style smart glasses with reflective lenses and forward laser scanners.
     - "datacenter_vault": Infinite corridor of server racks with strobing status LEDs.

Output ONLY a valid JSON object matching this schema:
{
  "topic": "${selected.topic}",
  "genre": "${selected.genre}",
  "videoTitle": "Catchy YouTube Shorts title with emoji (< 60 chars)",
  "youtubeDescription": "2 engaging sentences explaining the short with #hashtags.",
  "recommendedVoice": "en-US-ChristopherNeural",
  "cuts": [
    {
      "cutId": 1,
      "voiceoverText": "Cut narration text (14-18 words).",
      "hudText": "UPPERCASE HUD LABEL (2-3 words)",
      "propId": "campus_monolith",
      "cameraTrajectory": "dive_down",
      "estimatedDurationSec": 7.0
    }
  ]
}`;

  console.log('📡 Generating 3D Episode Directives via Gemini 2.5 Flash...');
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json', temperature: 0.7 },
  });

  if (!response || !response.text) throw new Error('Gemini failed to return 3D episode schema');

  const parsed = JSON.parse(response.text);
  parsed.fullVoiceover = parsed.cuts.map((c) => c.voiceoverText).join(' ');

  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2), 'utf-8');

  console.log(`✅ 3D Episode Schema generated! (${parsed.cuts.length} cuts)`);
  console.log(`🎬 Title: "${parsed.videoTitle}"`);
  console.log(`💾 Saved to: ${OUTPUT_PATH}`);

  return parsed;
}

if (require.main === module) {
  generateMaster3DDirectives().catch((err) => {
    console.error('❌ Failed to generate master 3D directives:', err);
    process.exit(1);
  });
}

module.exports = { generateMaster3DDirectives };

