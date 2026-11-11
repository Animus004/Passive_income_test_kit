/**
 * Autonomous AI Script & Storyboard Engine
 * Uses Gemini 2.5 Flash from AnimusSmartRoom to generate:
 * - Viral curiosity tech/science script (30-40s)
 * - Word timing expectations
 * - Dynamic Remotion Storyboard Schema (scenes, gauges, alerts, comparisons, terminals)
 * - SEO Title, Description, and Tags
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');
const HISTORY_FILE = path.join(ROOT_DIR, 'history.json');
const STORYBOARD_FILE = path.join(ROOT_DIR, 'public', 'storyboard.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in .env');
}

function loadHistoryTitles() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      return history.map((h) => h.title || h.id);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    };

    const req = https.request(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Gemini API Error ${res.statusCode}: ${body}`));
          }
          try {
            const parsed = JSON.parse(body);
            const textResponse = parsed.candidates[0].content.parts[0].text;
            resolve(JSON.parse(textResponse));
          } catch (e) {
            reject(new Error(`Failed to parse Gemini response: ${e.message}\nRaw: ${body}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function generateNextShortScript() {
  const previousTopics = loadHistoryTitles();
  console.log(`\n🧠 Querying Gemini 2.5 Flash for next viral Short...`);
  console.log(`   Excluded Topics (${previousTopics.length} in history):`, previousTopics.slice(-3));

  const prompt = `
You are the world's best viral YouTube Shorts video engineer and scriptwriter (think Vox, Veritasium, and Alex Hormozi).
Your task is to create a completely new, mind-blowing educational or tech/science fact Short.

RULES:
1. Target duration: 30 to 38 seconds when spoken out loud (around 70 to 88 words total).
2. The hook MUST create intense curiosity in the first 3 seconds (start immediately, zero filler like "welcome back").
3. DO NOT repeat or cover any of these previous topics: ${JSON.stringify(previousTopics)}.
4. Focus on fascinating topics: cyber security secrets, insane software bugs, hardware physical limits, aerospace glitches, quantum computing, relativity, deep-sea tech, or bizarre internet infrastructure.
5. Provide a dynamic 5-scene visual storyboard schema that Remotion can render procedurally.

Return a STRICT JSON object with this exact structure:
{
  "id": "short-slug-name",
  "title": "Viral Hook Title with 2 Emojis! #Shorts #Tech",
  "hook": "Opening 1-sentence hook",
  "script": "Full spoken script with punctuation and numbers written out phonetically for clean text-to-speech pronunciation.",
  "tags": ["Shorts", "Tech", "Science", "Fact1", "Fact2"],
  "hashtags": "#Shorts #Tech #Science",
  "storyboard": {
    "themeColor": "#38bdf8",
    "accentColor": "#f59e0b",
    "dangerColor": "#ef4444",
    "scenes": [
      {
        "index": 1,
        "type": "metric_gauge",
        "title": "THE HOOK STAT",
        "value": 38,
        "suffix": "μs / DAY",
        "subtitle": "Clock drift in orbit",
        "icon": "🛰️"
      },
      {
        "index": 2,
        "type": "comparison",
        "title": "THE REALITY GAP",
        "itemA": "Earth Clocks (Normal)",
        "itemB": "Satellite Speed (Relativity)",
        "highlight": "TIME TICKS FASTER IN SPACE",
        "icon": "⏳"
      },
      {
        "index": 3,
        "type": "alert_threat",
        "title": "WHAT HAPPENS WITHOUT MATH",
        "subtitle": "6 MILE DRIFT DAILY",
        "alertText": "GLOBAL NAVIGATION SYSTEM FAILURE",
        "icon": "⚠️"
      },
      {
        "index": 4,
        "type": "tech_terminal",
        "title": "THE EINSTEIN CORRECTION",
        "codeSnippet": "t_sat = t_earth * sqrt(1 - 2*G*M / (r*c^2))",
        "status": "APPLYING GENERAL RELATIVITY PATCH...",
        "icon": "💻"
      },
      {
        "index": 5,
        "type": "reveal_outro",
        "badge": "MIND BLOWN",
        "headline": "EINSTEIN SAVES YOUR UBER",
        "subline": "Every GPS relies on physics from 1915",
        "cta": "SUBSCRIBE FOR DAILY TECH SECRETS",
        "icon": "🔥"
      }
    ]
  }
}
`;

  const result = await callGemini(prompt);
  console.log(`✅ Generated Topic: "${result.title}"`);
  console.log(`   Word Count: ${result.script.split(/\s+/).length} words`);
  console.log(`   Storyboard: ${result.storyboard.scenes.length} dynamic scenes`);

  // Ensure public folder exists and write storyboard.json
  const publicDir = path.join(ROOT_DIR, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(STORYBOARD_FILE, JSON.stringify(result, null, 2));
  console.log(`💾 Saved dynamic storyboard to public/storyboard.json`);

  return result;
}

if (require.main === module) {
  generateNextShortScript().catch((err) => {
    console.error('❌ Script Generation Error:', err.message);
    process.exit(1);
  });
}

module.exports = { generateNextShortScript };

