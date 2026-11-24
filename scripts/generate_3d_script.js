/**
 * Gemini 2.5 Flash 3D Showrunner Engine
 * Generates structured 3D animation scripts starring the Antigravity Popapus Agent:
 * - Spoken voiceover per cut
 * - 3D Camera Trajectory (dolly_in, hero_orbit, birds_eye_pan, prop_close_up)
 * - Physical 3D Metaphor Prop (quantum_microchip, cooling_tower, undersea_cable, datacenter_hall)
 * - Popapus Pose (scan_prop, curious_inspect, alert_warning, celebrate_jackpot)
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
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
      i++;
    }
  }
  return { topic };
}

function selectTopic(topicArg) {
  if (topicArg) {
    return {
      topic: topicArg,
      hookAngle: `The hidden physical reality and engineering extremes behind ${topicArg}.`,
      isCustom: true,
    };
  }

  if (fs.existsSync(TOPICS_PATH)) {
    const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
    const chosen = topics.find((t) => !t.used) || topics[0];
    return { ...chosen, isCustom: false };
  }

  return {
    topic: '10,000-Year Quartz Glass Archiving',
    hookAngle: 'How femtosecond lasers etch petabytes of humanity data into indestructible quartz glass.',
    isCustom: true,
  };
}

async function generate3DEpisode() {
  const { topic: customTopic } = parseArgs();
  const selected = selectTopic(customTopic);

  console.log('====================================================');
  console.log('🤖 GEMINI 3D SHOWRUNNER: POPAPUS EPISODE GENERATOR');
  console.log('====================================================');
  console.log(`🎯 Topic: "${selected.topic}"`);
  console.log(`💡 Angle: "${selected.hookAngle}"`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing from .env');

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  const prompt = `You are the lead director and showrunner for a 3D animated viral YouTube Shorts series starring "Antigravity Popapus" (a cute, high-tech aquatic AI agent from Google DeepMind with a glass dome of glowing quantum energy bubbles).
Topic: "${selected.topic}"
Angle: "${selected.hookAngle}"

CRITICAL 3D PRODUCTION RULES:
1. SCRIPT LENGTH: 4 to 5 concise cinematic cuts (70-90 words total).
2. PHYSICAL 3D METAPHOR PROPS:
   - Every cut must physically feature one of our high-detail 3D props:
     - "quantum_microchip": When talking about chips, computing, AI, silicon, algorithms.
     - "cooling_tower": When talking about energy, thermal limits, nuclear power, gigawatts, heat.
     - "undersea_cable": When talking about oceans, physical bandwidth, internet backbone, telecommunications.
     - "datacenter_corridor": When establishing the server vault, scale, or overview.
3. POPAPUS POSE & ACTION:
   - Cut 1: "curious_inspect" (Popapus discovers the topic with eyes wide).
   - Middle cuts: "scan_prop" (Popapus projects a glowing holographic beam from its snout onto the physical 3D prop).
   - Final cut: "celebrate_jackpot" (Authoritative mic-drop conclusion, Popapus spins and bubbles glow).
4. CAMERA TRAJECTORIES:
   - "corridor_dolly": Flying down the server corridor like a drone.
   - "hero_orbit": Sweeping 360-degree orbital arc around Popapus.
   - "prop_dive": Camera diving straight into the physical 3D prop.
   - "close_up": Intimate hero framing on Popapus and its glowing dome.

Return ONLY valid JSON matching this exact schema:
{
  "topic": "${selected.topic}",
  "videoTitle": "Catchy YouTube Shorts title with emoji (< 60 chars)",
  "youtubeDescription": "2 engaging sentences explaining the short with #hashtags.",
  "cuts": [
    {
      "cutId": 1,
      "voiceoverText": "Cut 1 sentence (12-16 words).",
      "cameraTrajectory": "corridor_dolly",
      "metaphorProp": "datacenter_corridor",
      "popapusPose": "curious_inspect",
      "statHighlight": null
    },
    {
      "cutId": 2,
      "voiceoverText": "Cut 2 sentence (12-16 words).",
      "cameraTrajectory": "hero_orbit",
      "metaphorProp": "quantum_microchip",
      "popapusPose": "scan_prop",
      "statHighlight": { "number": "e.g. 99%", "label": "EFFICIENCY" }
    }
  ]
}`;

  console.log('📡 Generating 3D Showrunner directives via Gemini 2.5 Flash...');
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
  generate3DEpisode().catch((err) => {
    console.error('❌ Failed to generate 3D episode:', err);
    process.exit(1);
  });
}

module.exports = { generate3DEpisode };

