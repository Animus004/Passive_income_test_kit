/**
 * Automated Gemini Script Generator for YouTube Shorts
 * Powered by Gemini 2.5 Flash via @google/genai
 * 
 * Generates structured 5-scene scripts for "Data Detective" Shorts:
 * - Scene 1: The Dramatic Hook
 * - Scene 2: The Space/Speed Myth
 * - Scene 3: The Mind-Blowing Physical Reality
 * - Scene 4: Critical Bottlenecks & Hazards (3 synchronized chips)
 * - Scene 5: Resolution & Infinite Retention Loop Bridge
 * 
 * Usage:
 *   node scripts/generate_script.js --topic "High-Frequency Trading Fiber Cables"
 *   node scripts/generate_script.js (picks next topic from data/topics.json)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TOPICS_PATH = path.join(PROJECT_ROOT, 'data', 'topics.json');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'current_short.json');

function parseArgs() {
  const args = process.argv.slice(2);
  let topicArg = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topicArg = args[i + 1];
      i++;
    }
  }
  return { topicArg };
}

function selectTopic(topicArg) {
  if (topicArg) {
    return {
      topic: topicArg,
      hookAngle: `The hidden physical reality and data bottlenecks behind ${topicArg}.`,
      isCustom: true,
    };
  }

  if (!fs.existsSync(TOPICS_PATH)) {
    throw new Error(`Topics file not found at ${TOPICS_PATH}`);
  }

  const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  let chosen = topics.find((t) => !t.used);

  // If all are used, reset all and pick the first
  if (!chosen && topics.length > 0) {
    console.log('🔄 All topics previously used. Resetting queue...');
    topics.forEach((t) => (t.used = false));
    chosen = topics[0];
  }

  if (!chosen) {
    return {
      topic: 'High-Frequency Trading Fiber Cables',
      hookAngle: 'How Wall Street drilled straight through the Allegheny Mountains to shave 3 milliseconds off trading time.',
      isCustom: true,
    };
  }

  return { ...chosen, isCustom: false };
}

function markTopicUsed(topicObj) {
  if (topicObj.isCustom || !fs.existsSync(TOPICS_PATH)) return;

  const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  const found = topics.find((t) => t.id === topicObj.id || t.topic === topicObj.topic);
  if (found) {
    found.used = true;
    found.lastUsedAt = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topics, null, 2), 'utf-8');
    console.log(`📌 Marked topic [${found.topic}] as used in data/topics.json`);
  }
}

const THEME_CONFIGS = {
  space: { primary: '#38bdf8', accent: '#f59e0b', bgGradient: 'radial-gradient(ellipse at 50% 25%, #1e1b4b 0%, #030712 75%)' },
  cyber: { primary: '#10b981', accent: '#eab308', bgGradient: 'radial-gradient(ellipse at 50% 25%, #064e3b 0%, #020a06 75%)' },
  ocean: { primary: '#06b6d4', accent: '#38bdf8', bgGradient: 'radial-gradient(ellipse at 50% 25%, #082f49 0%, #020617 75%)' },
  finance: { primary: '#f59e0b', accent: '#ef4444', bgGradient: 'radial-gradient(ellipse at 50% 25%, #451a03 0%, #0a0601 75%)' },
  quantum: { primary: '#c084fc', accent: '#38bdf8', bgGradient: 'radial-gradient(ellipse at 50% 25%, #3b0764 0%, #07010d 75%)' },
  infrastructure: { primary: '#f97316', accent: '#eab308', bgGradient: 'radial-gradient(ellipse at 50% 25%, #431407 0%, #050507 75%)' },
};

function detectVisualTheme(topic, angle = '') {
  const text = `${topic} ${angle}`.toLowerCase();
  if (/gps|satellite|orbit|space|relativity|einstein|planet|cosmos|gravity/i.test(text)) return 'space';
  if (/chip|silicon|transistor|lithography|microprocessor|computer|code|software|hack|ai|gpu|photolithography/i.test(text)) return 'cyber';
  if (/ocean|sea|cable|submarine|underwater|depth|trench|shark|abyssal|water/i.test(text)) return 'ocean';
  if (/trade|trading|wall street|hft|finance|market|money|stock|bitcoin|crypto/i.test(text)) return 'finance';
  if (/quantum|atom|qubit|superposition|particle|laser|collider|physics|energy/i.test(text)) return 'quantum';
  return 'infrastructure';
}

function formatMonetizedDescription(rawDescription, tags = []) {
  const affiliateUrl = process.env.MONETIZATION_AFFILIATE_URL || 'https://bit.ly/data-detective-tools';
  const newsletterUrl = process.env.MONETIZATION_NEWSLETTER_URL || 'https://datadetective.substack.com';

  // Extract hashtags from the raw description
  const hashtagRegex = /#\w+/g;
  const existingHashtags = rawDescription.match(hashtagRegex) || [];
  const cleanBody = rawDescription.replace(hashtagRegex, '').trim();

  // Deduplicate tags and create clean hashtags
  const defaultTags = ['Shorts', 'Tech', 'DataDetective', 'Facts'];
  const allTagNames = Array.from(
    new Set([
      ...existingHashtags.map((h) => h.replace(/^#/, '')),
      ...(Array.isArray(tags) ? tags : []),
      ...defaultTags,
    ])
  ).slice(0, 8);

  const hashtagLine = allTagNames.map((t) => `#${t.replace(/[\s-]/g, '')}`).join(' ');

  const formattedDescription = [
    cleanBody,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `🔍 FREE Tech & Data Newsletter: ${newsletterUrl}`,
    `⚡ Top Recommended Tech & Security Toolkit: ${affiliateUrl}`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    hashtagLine,
  ].join('\n');

  return formattedDescription;
}

async function generateScript() {
  const { topicArg } = parseArgs();
  const selected = selectTopic(topicArg);

  console.log('====================================================');
  console.log('🤖 GEMINI 2.5 FLASH SCRIPT GENERATOR');
  console.log('====================================================');
  console.log(`🎯 Topic: "${selected.topic}"`);
  console.log(`💡 Angle: "${selected.hookAngle}"`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env');
  }

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
  const prompt = `You are the lead showrunner and motion graphics scriptwriter for a viral YouTube Shorts channel called "Data Detective".
Create a 30-35 second high-retention vertical video script about: "${selected.topic}".
Key angle: "${selected.hookAngle}".

CRITICAL PRODUCTION RULES:
1. TOTAL WORD COUNT: STRICTLY 75 to 95 words total across all 5 scenes. Keep sentences punchy, conversational, and energetic.
2. 5-SCENE STRUCTURE:
   - Scene 1 (The Hook): Start with a dramatic question or startling contrast. Must hook the viewer in the first 2 seconds. Mascot pose: "pointing".
   - Scene 2 (The Myth): Highlight a widespread misconception. Must have a specific percentage/stat in "statHighlight". Mascot pose: "facepalm".
   - Scene 3 (The Deep-Sea / Physical Reality): Reveal the mind-blowing physical infrastructure with a massive number in "statHighlight". Mascot pose: "scanning".
   - Scene 4 (Danger / Choke Points): Highlight the physical bottlenecks/threats. Must contain exactly 3 hazard stamps in "chipList". The voiceover in Scene 4 MUST explicitly speak the exact names of the 3 danger chips in order! Mascot pose: "shocked".
   - Scene 5 (Resolution & Retention Loop Bridge): Deliver the punchline verdict. The final line of the voiceover MUST end with an infinite retention loop phrase like "...leaving everyone still asking..." so it seamlessly connects directly back into Scene 1's opening hook question! Mascot pose: "celebrating".

Return ONLY valid JSON with this exact schema:
{
  "topic": "${selected.topic}",
  "visualTheme": "One of: space | cyber | finance | quantum | ocean | infrastructure that best fits the subject",
  "mediaQueries": [
    "2-3 word visual search query for Scene 1 B-roll footage",
    "2-3 word visual search query for Scene 2 B-roll footage",
    "2-3 word visual search query for Scene 3 B-roll footage"
  ],
  "videoTitle": "Catchy YouTube Shorts title with emoji (< 60 chars)",
  "youtubeDescription": "2-3 engaging sentences explaining the short with 4-5 relevant #hashtags.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "fullVoiceover": "The entire concatenated voiceover script (75-95 words).",
  "scenes": [
    {
      "sceneId": 1,
      "badge": "DATA REALITY CHECK // 01",
      "headline": "PUNCHY 3-6 WORD HOOK HEADLINE IN CAPS",
      "voiceoverText": "Scene 1 spoken words (15-20 words).",
      "visualType": "hook",
      "mascotEmotion": "pointing"
    },
    {
      "sceneId": 2,
      "badge": "THE SPEED MYTH // 02",
      "statHighlight": {
        "number": "e.g. 70% or 80%",
        "label": "CONCISE LABEL IN CAPS"
      },
      "voiceoverText": "Scene 2 spoken words (15-20 words).",
      "visualType": "myth",
      "mascotEmotion": "facepalm"
    },
    {
      "sceneId": 3,
      "badge": "THE PHYSICAL TRUTH // 03",
      "statHighlight": {
        "number": "e.g. 3ms or 99%",
        "label": "HERO STAT LABEL IN CAPS"
      },
      "subMetrics": [
        "e.g. $300 MILLION TUNNEL",
        "SPEED OF LIGHT IN GLASS"
      ],
      "voiceoverText": "Scene 3 spoken words (15-20 words).",
      "visualType": "reality",
      "mascotEmotion": "scanning"
    },
    {
      "sceneId": 4,
      "badge": "CRITICAL BOTTLENECK ALERT // 04",
      "headline": "PHYSICAL FRAGILITY AT RISK",
      "chipList": [
        "ICON + 2-3 WORD DANGER 1 (e.g. 🏔️ ROCK FRACTURES)",
        "ICON + 2-3 WORD DANGER 2 (e.g. ⚡ DISPERSION DELAY)",
        "ICON + 2-3 WORD DANGER 3 (e.g. 📡 MICROWAVE COMPETITION)"
      ],
      "voiceoverText": "Scene 4 spoken words explicitly speaking the 3 dangers in order (18-24 words).",
      "visualType": "danger",
      "mascotEmotion": "shocked"
    },
    {
      "sceneId": 5,
      "badge": "THE DATA VERDICT // 05",
      "headline": "PUNCHLINE CONCLUSION IN CAPS",
      "subheadline": "SECONDARY METRIC IN CAPS",
      "loopKicker": "⚡ LEAVING EVERYONE STILL ASKING... ⚡",
      "voiceoverText": "Scene 5 spoken words ending with loop bridge: '...leaving everyone still asking...' (12-18 words).",
      "visualType": "resolution",
      "mascotEmotion": "celebrating"
    }
  ]
}`;

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const modelsToTry = [
    primaryModel,
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
  ].filter((v, i, a) => a.indexOf(v) === i);

  let response = null;
  let lastErr = null;

  for (const model of modelsToTry) {
    try {
      console.log(`📡 Sending request to Gemini (${model})...`);
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
      if (response && response.text) {
        break;
      }
    } catch (err) {
      console.warn(`⚠️ Model ${model} returned error (${err.status || err.message}). Trying fallback...`);
      lastErr = err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!response || !response.text) {
    throw lastErr || new Error('All Gemini models failed to generate content');
  }

  const rawJson = response.text;
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('Failed to parse Gemini output:', rawJson);
    throw err;
  }

  // Assign dynamic visual theme & palette
  const detected = detectVisualTheme(selected.topic, selected.hookAngle);
  parsed.visualTheme = (parsed.visualTheme && THEME_CONFIGS[parsed.visualTheme.toLowerCase()])
    ? parsed.visualTheme.toLowerCase()
    : detected;
  parsed.themeConfig = THEME_CONFIGS[parsed.visualTheme] || THEME_CONFIGS.space;
  console.log(`🎨 Visual Theme Assigned: "${parsed.visualTheme.toUpperCase()}"`);

  // Ensure fullVoiceover is present and cleanly concatenated from scenes
  const sceneTexts = parsed.scenes.map((s) => s.voiceoverText.trim());
  parsed.fullVoiceover = sceneTexts.join(' ');

  // Inject monetization footer & structured hashtags into youtubeDescription
  parsed.youtubeDescription = formatMonetizedDescription(
    parsed.youtubeDescription || '',
    parsed.tags || []
  );

  const totalWords = parsed.fullVoiceover.split(/\s+/).length;
  console.log(`✅ Script generated successfully! (${totalWords} words total)`);
  console.log(`🎬 Title: "${parsed.videoTitle}"`);
  console.log(`💰 Monetized Description:\n${parsed.youtubeDescription}\n`);

  // Save to src/data/current_short.json
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
  console.log(`💾 Saved to ${OUTPUT_PATH}`);

  // Mark topic used
  markTopicUsed(selected);

  return parsed;
}

if (require.main === module) {
  generateScript().catch((err) => {
    console.error('❌ Script generation failed:', err);
    process.exit(1);
  });
}

module.exports = { generateScript, selectTopic };

