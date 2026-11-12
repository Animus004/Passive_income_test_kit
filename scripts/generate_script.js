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
  const prompt = `You are the lead showrunner and investigative visual director for a viral YouTube Shorts documentary channel ("Data Detective" in the cinematic style of Vox, Polymatter, and ColdFusion).
Create a 30-35 second high-retention vertical video script about: "${selected.topic}".
Key angle: "${selected.hookAngle}".

CRITICAL DOCUMENTARY PRODUCTION RULES:
1. TOTAL WORD COUNT: STRICTLY 75 to 95 words total across all cuts. Keep sentences fast-paced, punchy, and conversational.
2. DYNAMIC VISUAL CUTS (5 to 7 cuts total):
   - Do NOT use rigid slides or PowerPoint templates. Instead, structure the script as 5 to 7 dynamic cinematic cuts corresponding to natural speech beats.
   - Cut 1 (The Hook): A gripping question or startling paradox that hooks the viewer in the first 2 seconds.
   - Middle Cuts: Contrast widespread myths with jaw-dropping physical realities, engineering extremes, and real-world bottlenecks.
   - Final Cut (The Conclusion): End on a powerful, authoritative, and complete mic-drop conclusion that delivers the core takeaway or a profound realization. NEVER use incomplete trailing phrases like "leaving everyone still asking..." or cliffhangers. The final sentence MUST be grammatically complete, impactful, and memorable.
3. AUTHENTIC B-ROLL QUERIES:
   - For every single cut, provide a specific 2-4 word visual query targeting real photography or footage (e.g., "server immersion cooling liquid", "microchip silicon wafer glow", "undersea telecommunications cable deck", "high speed data center fiber").
   - NEVER use generic or cartoon queries.
4. SELECTIVE DATA HIGHLIGHTS:
   - If a cut explicitly speaks a number, percentage, or metric, include "statHighlight": { "number": "e.g. 99% or 100°C or $300M", "label": "CONCISE LABEL IN CAPS" }.
   - If no number is spoken in that cut, set "statHighlight": null.

Return ONLY valid JSON with this exact schema:
{
  "topic": "${selected.topic}",
  "visualTheme": "One of: space | cyber | finance | quantum | ocean | infrastructure that best fits the subject",
  "videoTitle": "Catchy viral YouTube Shorts title with emoji (< 60 chars)",
  "youtubeDescription": "2-3 engaging sentences explaining the short with 4-5 relevant #hashtags.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "cuts": [
    {
      "cutId": 1,
      "voiceoverText": "Cut 1 spoken sentence (12-16 words).",
      "visualQuery": "2-4 word real visual footage query",
      "cameraMotion": "zoom_in",
      "statHighlight": null
    },
    {
      "cutId": 2,
      "voiceoverText": "Cut 2 spoken sentence (12-16 words).",
      "visualQuery": "2-4 word real visual footage query",
      "cameraMotion": "zoom_out",
      "statHighlight": {
        "number": "e.g. 80%",
        "label": "CONCISE LABEL"
      }
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

  // Process dynamic cuts
  if (!parsed.cuts && parsed.scenes) {
    parsed.cuts = parsed.scenes.map((s, idx) => ({
      cutId: s.sceneId || idx + 1,
      voiceoverText: s.voiceoverText,
      visualQuery: (parsed.mediaQueries && parsed.mediaQueries[idx]) || `${selected.topic} technology`,
      cameraMotion: idx % 2 === 0 ? 'zoom_in' : 'zoom_out',
      statHighlight: s.statHighlight || null,
    }));
  }

  // Ensure every cut has clean, sanitized properties
  parsed.cuts = (parsed.cuts || []).map((c, idx) => ({
    cutId: c.cutId || idx + 1,
    voiceoverText: (c.voiceoverText || '').trim(),
    visualQuery: (c.visualQuery || `${selected.topic} technology`).trim(),
    cameraMotion: c.cameraMotion || (idx % 2 === 0 ? 'zoom_in' : 'zoom_out'),
    statHighlight: c.statHighlight && c.statHighlight.number ? c.statHighlight : null,
  }));

  // Clean full voiceover concatenated from cuts
  parsed.fullVoiceover = parsed.cuts.map((c) => c.voiceoverText).join(' ');

  // Media queries array for B-roll fetcher
  parsed.mediaQueries = parsed.cuts.map((c) => c.visualQuery);

  // Backward-compatible alias for any legacy inspector
  parsed.scenes = parsed.cuts.map((c) => ({
    sceneId: c.cutId,
    voiceoverText: c.voiceoverText,
    statHighlight: c.statHighlight,
  }));

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

